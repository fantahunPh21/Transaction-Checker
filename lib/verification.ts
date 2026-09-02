export interface BankConfig {
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

export interface VerificationResult {
  isValid: boolean
  transactionDetails?: {
    transactionId: string
    amount: string
    date: string
    recipient: string
    status: string
    bank: string
  }
  error?: string
}

export const BANK_CONFIGS: Record<string, BankConfig> = {
  telebirr: {
    name: "Telebirr",
    baseUrl: "https://transactioninfo.ethiotelecom.et/receipt/",
    pattern: /^[A-Z0-9]{8,12}$/,
    color: "#FF6B35",
  },
  cbe: {
    name: "Commercial Bank of Ethiopia (CBE)",
    baseUrl: "https://cbe.com.et/transaction/",
    pattern: /^CBE[A-Z0-9]{8,15}$/,
    color: "#1E88E5",
  },
  boa: {
    name: "Bank of Abyssinia (BOA)",
    baseUrl: "https://boa.com.et/verify/",
    pattern: /^BOA[A-Z0-9]{8,15}$/,
    color: "#4CAF50",
  },
  awash: {
    name: "Awash Bank",
    baseUrl: "https://awashbank.com/receipt/",
    color: "#9C27B0",
    pattern: /^AWB[A-Z0-9]{8,15}$/,
  },
  abay: {
    name: "Abay Bank",
    baseUrl: "https://abaybank.com.et/transaction/",
    color: "#FF9800",
    pattern: /^ABY[A-Z0-9]{8,15}$/,
  },
  addis: {
    name: "Addis International Bank",
    baseUrl: "https://addisbank.com/verify/",
    color: "#795548",
    pattern: /^AIB[A-Z0-9]{8,15}$/,
  },
}

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

      // Fetch the bank-specific receipt link and parse the result
      return await this.fetchBankTransaction(data, config)
    } catch (error) {
      console.error("Verification error:", error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Verification failed",
      }
    }
  }

  /** Build the bank-specific receipt URL for a given invoice number. */
  getReceiptUrl(bank: string, invoiceNumber: string): string {
    const config = BANK_CONFIGS[bank]
    if (!config) return ""
    const normalized = invoiceNumber.toUpperCase()
    // Some bank URLs append a trailing slash, others don't
    const base = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`
    return `${base}${normalized}`
  }

  private async fetchBankTransaction(
    data: VerificationData,
    config: BankConfig
  ): Promise<VerificationResult> {
    const url = this.getReceiptUrl(data.bank, data.invoiceNumber)

    try {
      const response = await fetch(url, {
        method: "GET",
        // Credentials must be omitted for cross-origin bank endpoints
        cache: "no-store",
        headers: {
          "User-Agent": "FinanceApp/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,application/json",
        },
      })

      if (!response.ok) {
        return {
          isValid: false,
          error: "Transaction not found or invalid",
        }
      }

      const contentType = response.headers.get("content-type") || ""
      let body: string

      if (contentType.includes("application/json")) {
        const json = await response.json()
        return this.parseJsonResponse(json, data, config)
      } else {
        body = await response.text()
        return this.parseHtmlResponse(body, data, config)
      }
    } catch (error) {
      console.error(`${config.name} verification error:`, error)
      return {
        isValid: false,
        error: "Network error or service unavailable",
      }
    }
  }

  private parseJsonResponse(
    json: unknown,
    data: VerificationData,
    config: BankConfig
  ): VerificationResult {
    const record = (json && typeof json === "object" ? json : {}) as Record<string, unknown>

    // Accept common shapes: { isValid/isValidated/status } or { data: {...} }
    const status = String(record.status ?? record.transactionStatus ?? "").toLowerCase()
    const isValid =
      record.isValid === true ||
      record.isValidated === true ||
      status === "completed" ||
      status === "confirmed" ||
      status === "success"

    if (isValid) {
      return {
        isValid: true,
        transactionDetails: {
          transactionId:
            String(record.transactionId ?? record.referenceId ?? data.invoiceNumber),
          amount: String(record.amount ?? record.amountPaid ?? data.amount ?? "N/A"),
          date: String(record.date ?? record.transactionDate ?? "N/A"),
          recipient: String(record.recipient ?? record.recipientPhone ?? data.recipientPhone ?? "N/A"),
          status: "Completed",
          bank: config.name,
        },
      }
    }

    return {
      isValid: false,
      error: record.message ? String(record.message) : "Transaction not found",
    }
  }

  private parseHtmlResponse(
    html: string,
    data: VerificationData,
    config: BankConfig
  ): VerificationResult {
    try {
      // Basic HTML scan for transaction/receipt markers
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
            transactionId:
              this.extractTransactionId(html) || data.invoiceNumber,
            amount: this.extractAmount(html) || data.amount || "N/A",
            date: this.extractDate(html) || "N/A",
            recipient: this.extractRecipient(html) || data.recipientPhone || "N/A",
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

  private extractTransactionId(html: string): string {
    const match =
      html.match(/Transaction(?:\s+ID)?[:\s]*([A-Z0-9_-]+)/i) ||
      html.match(/Receipt(?:\s+No\.?| Number)?[:\s]*([A-Z0-9_-]+)/i)
    return match ? match[1] : ""
  }

  private extractAmount(html: string): string {
    // Implement amount extraction logic
    const amountMatch = html.match(/Amount[:\s]*([0-9,]+\.?[0-9]*)/i)
    return amountMatch ? amountMatch[1] : "N/A"
  }

  private extractDate(html: string): string {
    // Implement date extraction logic
    const dateMatch = html.match(/Date[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i)
    return dateMatch ? dateMatch[1] : "N/A"
  }

  private extractRecipient(html: string): string {
    // Implement recipient extraction logic
    const recipientMatch = html.match(/Recipient[:\s]*([^<>\n]+)/i)
    return recipientMatch ? recipientMatch[1].trim() : "N/A"
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
