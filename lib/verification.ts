export interface BankConfig {
  key: string
  name: string
  baseUrl: string
  pattern: RegExp
  color: string
}

export interface VerificationData {
  bank: string
  invoiceNumber: string
  amount?: string
  recipientPhone?: string
  notes?: string
}

export interface TransactionDetails {
  transactionId: string
  amount: string
  date: string
  sender: string
  recipient: string
  status: string
  bank: string
}

export interface VerificationResult {
  isValid: boolean
  transactionDetails?: TransactionDetails
  error?: string
}

export const BANK_CONFIGS: Record<string, BankConfig> = {
  telebirr: {
    key: "telebirr",
    name: "Telebirr",
    baseUrl: "https://transactioninfo.ethiotelecom.et/receipt/",
    pattern: /^[A-Z0-9]{8,15}$/,
    color: "#FF6B35",
  },
  cbe: {
    key: "cbe",
    name: "Commercial Bank of Ethiopia (CBE)",
    baseUrl: "https://apps.cbe.com.et:100/BranchReceipt/",
    pattern: /^[A-Z0-9]+$/,
    color: "#1E88E5",
  },
  boa: {
    key: "boa",
    name: "Bank of Abyssinia (BOA)",
    baseUrl: "https://cs.bankofabyssinia.com/slip/?trx=",
    pattern: /^[A-Z0-9]+$/,
    color: "#4CAF50",
  },
  awash: {
    key: "awash",
    name: "Awash Bank",
    baseUrl: "https://awashbank.com/receipt/",
    color: "#9C27B0",
    pattern: /^AWB[A-Z0-9]{8,15}$/,
  },
  abay: {
    key: "abay",
    name: "Abay Bank",
    baseUrl: "https://abaybank.com.et/transaction/",
    color: "#FF9800",
    pattern: /^ABY[A-Z0-9]{8,15}$/,
  },
  addis: {
    key: "addis",
    name: "Addis International Bank",
    baseUrl: "https://addisbank.com/verify/",
    color: "#795548",
    pattern: /^AIB[A-Z0-9]{8,15}$/,
  },
}

const REQUEST_TIMEOUT_MS = 12000

export class VerificationService {
  private static instance: VerificationService

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService()
    }
    return VerificationService.instance
  }

  async verifyTransaction(data: VerificationData): Promise<VerificationResult> {
    try {
      const config = BANK_CONFIGS[data.bank]
      if (!config) {
        throw new Error(`Unsupported bank: ${data.bank}`)
      }

      // Validate invoice number format
      if (!config.pattern.test(data.invoiceNumber.toUpperCase())) {
        return {
          isValid: false,
          error: `Invalid invoice number format for ${config.name}`,
        }
      }

      return await this.fetchBankTransaction(data, config)
    } catch (error) {
      console.error("Verification error:", error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Verification failed",
      }
    }
  }

  /** Build the bank-specific data/receipt URL for a given invoice number. */
  getReceiptUrl(bank: string, invoiceNumber: string): string {
    const config = BANK_CONFIGS[bank]
    if (!config) return ""
    const normalized = invoiceNumber.trim().toUpperCase()
    const base = config.baseUrl
    // Query-string style URLs (e.g. ".../slip/?trx=") append the value directly.
    if (base.includes("?")) return `${base}${normalized}`
    const sep = base.endsWith("/") ? "" : "/"
    return `${base}${sep}${normalized}`
  }

  /** Build the bank-specific data/API URL used for machine verification. */
  private getBankDataUrl(bank: string, invoiceNumber: string): string {
    const normalized = invoiceNumber.trim().toUpperCase()
    if (bank === "boa") {
      return `https://cs.bankofabyssinia.com/api/onlineSlip/getDetails/?id=${normalized}`
    }
    return this.getReceiptUrl(bank, invoiceNumber)
  }

  private async fetchBankTransaction(
    data: VerificationData,
    config: BankConfig
  ): Promise<VerificationResult> {
    const url = this.getBankDataUrl(data.bank, data.invoiceNumber)

    try {
      const body = await this.fetchWithTimeout(url, REQUEST_TIMEOUT_MS)

      if (data.bank === "telebirr") {
        return this.parseTelebirrReceipt(body, data, config)
      }

      if (data.bank === "boa") {
        return this.parseBoaReceipt(body, data, config)
      }

      return this.parseGenericHtml(body, data, config)
    } catch (error) {
      console.error(`${config.name} verification error:`, error)
      return {
        isValid: false,
        error: `Network error or service unavailable: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }
    }
  }

  /**
   * Fetch a URL with a hard timeout and TLS fallback.
   *
   * The Telebirr receipt site serves a self-signed / chained leaf certificate
   * that fails strict Node verification (the official `telebirr-receipt`
   * integration disables TLS verification for the same reason). We retry once
   * with `rejectUnauthorized: false` to work around it.
   *
   * A timeout ensures the API returns instead of hanging when a bank server is
   * unreachable (e.g. regional IP blocking for out-of-Ethiopia hosts).
   */
  private fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith("https:")
      const mod = isHttps ? require("https") : require("http")

      const attempt = (rejectUnauthorized: boolean) => {
        const req = mod.request(
          url,
          {
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,application/json",
            },
            ...(isHttps ? { rejectUnauthorized } : {}),
          },
          (res: {
            statusCode?: number
            headers?: Record<string, unknown>
            on: (event: string, cb: (chunk: Buffer) => void) => void
          }) => {
            clearTimeout(timer)
            const location = res.headers && res.headers.location
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && location) {
              resolve(this.fetchWithTimeout(String(location), timeoutMs))
              return
            }

            const chunks: Buffer[] = []
            res.on("data", (c: Buffer) => chunks.push(c))
            res.on("end", () => {
              resolve(Buffer.concat(chunks).toString("utf-8"))
            })
          }
        )

        const timer = setTimeout(() => {
          req.destroy(new Error("Request timed out"))
        }, timeoutMs)

        req.on("error", (err: Error & { code?: string }) => {
          clearTimeout(timer)
          if (rejectUnauthorized && err.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE") {
            attempt(false)
            return
          }
          reject(err)
        })

        req.end()
      }

      attempt(true)
    })
  }

  /**
   * Parse a Telebirr receipt.
   *
   * The receipt is an HTML table of rows. Most rows carry a label (Amharic/
   * English mixed, e.g. "የክፍያው ሁኔታ/transaction status") in the first cell
   * and the value in the following cell(s). A separate "invoice details" table
   * lists Invoice No. / Payment date / Settled Amount as columns.
   */
  private parseTelebirrReceipt(
    html: string,
    data: VerificationData,
    config: BankConfig
  ): VerificationResult {
    const rows = this.extractTableRows(html)
    // Normalize each row's label to a compact lowercase form for matching.
    const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, "")

    // Some Telebirr rows omit the closing `</td>` on the label cell, so the
    // label and its value collapse into a single cell (e.g.
    // "...transaction statusCompleted"). When `row[1]` is absent, fall back to
    // reading the value that trails the matched label inside that one cell.
    const byLabel = (token: string): string => {
      const t = norm(token)
      for (const row of rows) {
        const label = norm(row[0])
        if (!label.includes(t)) continue
        if (row.length > 1) return (row[1] || "").trim()
        // Map the token back onto the raw cell (spaces optional between
        // characters) to capture the trailing value at the correct offset.
        const esc = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").split("").join("\\s*")
        const m = (row[0] || "").match(new RegExp(esc, "i"))
        return m ? (row[0] || "").slice(m.index! + m[0].length).trim() : ""
      }
      return ""
    }

    const status = byLabel("transactionstatus")
    const creditedParty = byLabel("creditedpartyname")
    const payerName = byLabel("payername")

    // Invoice details table: columns are
    // [Invoice No., Payment date, Settled Amount] with a header row above them.
    let invoiceNo = ""
    let paymentDate = ""
    let settledAmount = ""
    for (let r = 0; r < rows.length; r++) {
      if (norm(rows[r][0]).includes("invoiceno")) {
        const dataRow = rows[r + 1]
        if (dataRow && dataRow.length >= 3) {
          invoiceNo = (dataRow[0] || "").trim()
          paymentDate = (dataRow[1] || "").trim()
          settledAmount = (dataRow[2] || "").trim()
        }
        break
      }
    }

    // A missing status usually means the receipt number does not exist
    // (the site returns its "not found" page instead of the table).
    if (!status || /not.found|invalid|error/i.test(status)) {
      return { isValid: false, error: "Transaction not found" }
    }

    const isCompleted = /completed|success/i.test(status)
    if (!isCompleted) {
      return { isValid: false, error: `Transaction status: ${status}` }
    }

    return {
      isValid: true,
      transactionDetails: {
        transactionId: invoiceNo || byLabel("receiptno") || data.invoiceNumber,
        amount: settledAmount || byLabel("totalamountpaid") || data.amount || "N/A",
        date: paymentDate || byLabel("paymentdate") || "N/A",
        sender: payerName || "N/A",
        recipient: creditedParty || payerName || data.recipientPhone || "N/A",
        status: "Completed",
        bank: config.name,
      },
    }
  }

  /**
   * Parse a BOA (Bank of Abyssinia) online-slip API response.
   *
   * BOA's slip page is a client-side React SPA, so fetching the receipt HTML
   * returns an empty shell. The real data comes from a JSON endpoint:
   *
   *   https://cs.bankofabyssinia.com/api/onlineSlip/getDetails/?id=<trx>
   *
   * The response shape is `{ header: {...}, body: [ { ... } ] }` where `body[0]`
   * holds the slip fields as object keys:
   *
   *   Source Account Name / Receiver's Name / Total Amount including VAT /
   *   Transaction Reference / Transaction Date / currency / Transaction Type /
   *   Narrative / Transferred Amount / Service Charge / VAT (15%) ...
   */
  private parseBoaReceipt(
    raw: string,
    data: VerificationData,
    config: BankConfig
  ): VerificationResult {
    try {
      const json = JSON.parse(raw)
      const row = Array.isArray(json?.body) ? json.body[0] : json?.body
      if (!row || typeof row !== "object") {
        return { isValid: false, error: "Transaction not found" }
      }

      const val = (k: string) =>
        row[k] !== undefined && row[k] !== null ? String(row[k]).trim() : ""

      const reference = val("Transaction Reference")
      const totalAmount = val("Total Amount including VAT")
      const transferred = val("Transferred Amount")
      const currency = val("currency") || "ETB"
      const amount = totalAmount || transferred

      // A valid slip always includes the reference and an amount.
      if (!reference && !amount) {
        return { isValid: false, error: "Transaction not found" }
      }

      return {
        isValid: true,
        transactionDetails: {
          transactionId: reference || data.invoiceNumber,
          amount: amount ? `${currency} ${amount}` : data.amount || "N/A",
          date: val("Transaction Date") || "N/A",
          sender: val("Source Account Name") || val("Payer's Name") || "N/A",
          recipient:
            val("Receiver's Name") ||
            val("Source Account Name") ||
            data.recipientPhone ||
            "N/A",
          status: "Completed",
          bank: config.name,
        },
      }
    } catch (error) {
      console.error("[BOA] JSON parse failed:", error)
      return { isValid: false, error: "Transaction not found" }
    }
  }

  private parseGenericHtml(
    html: string,
    data: VerificationData,
    config: BankConfig
  ): VerificationResult {
    try {
      const isValid =
        html.includes("Transaction Details") ||
        html.includes("Receipt") ||
        html.includes("transaction details") ||
        html.includes("Transaction Successful") ||
        html.includes("payment successful")

      if (isValid) {
        return {
          isValid: true,
          transactionDetails: {
            transactionId: this.extractGenericTransactionId(html) || data.invoiceNumber,
            amount: this.extractGenericAmount(html) || data.amount || "N/A",
            date: this.extractGenericDate(html) || "N/A",
            sender: this.extractGenericSender(html) || data.recipientPhone || "N/A",
            recipient: this.extractGenericRecipient(html) || data.recipientPhone || "N/A",
            status: "Completed",
            bank: config.name,
          },
        }
      }

      return {
        isValid: false,
        error: "Transaction not found",
      }
    } catch (error) {
      return {
        isValid: false,
        error: "Failed to parse transaction details",
      }
    }
  }

  /**
   * Extract table rows as arrays of cell text. Each `<tr>` becomes an array of
   * its `<td>` text values, preserving the label/value relationship.
   */
  private extractTableRows(html: string): string[][] {
    const rows: string[][] = []
    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let tr: RegExpExecArray | null
    while ((tr = trRe.exec(html)) !== null) {
      const rowHtml = tr[1]
      const cells: string[] = []
      const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi
      let td: RegExpExecArray | null
      while ((td = tdRe.exec(rowHtml)) !== null) {
        cells.push(this.stripTags(td[1]).replace(/\s+/g, " ").trim())
      }
      if (cells.length) rows.push(cells)
    }
    return rows
  }

  private stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, " ")
  }

  private extractGenericTransactionId(html: string): string {
    const match =
      html.match(/Transaction(?:\s+ID)?[:\s]*([A-Z0-9_-]+)/i) ||
      html.match(/Receipt(?:\s+No\.?| Number)?[:\s]*([A-Z0-9_-]+)/i)
    return match ? match[1] : ""
  }

  private extractGenericAmount(html: string): string {
    const match = html.match(/Amount[:\s]*([0-9,]+\.?[0-9]*)/i)
    return match ? match[1] : "N/A"
  }

  private extractGenericDate(html: string): string {
    const match = html.match(/Date[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i)
    return match ? match[1] : "N/A"
  }

  private extractGenericRecipient(html: string): string {
    const match = html.match(/Recipient[:\s]*([^<>\n]+)/i)
    return match ? match[1].trim() : "N/A"
  }

  private extractGenericSender(html: string): string {
    const match =
      html.match(/Sender[:\s]*([^<>\n]+)/i) ||
      html.match(/Paid(?:\s+By| From)[:\s]*([^<>\n]+)/i)
    return match ? match[1].trim() : "N/A"
  }

  validateInvoiceNumber(bank: string, invoiceNumber: string): boolean {
    const config = BANK_CONFIGS[bank]
    if (!config) return false
    return config.pattern.test(invoiceNumber.toUpperCase())
  }

  getBankConfig(bank: string): BankConfig | undefined {
    return BANK_CONFIGS[bank]
  }

  getAllBanks(): BankConfig[] {
    return Object.values(BANK_CONFIGS)
  }
}

export const verificationService = VerificationService.getInstance()
