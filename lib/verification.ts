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

      // For Telebirr (real endpoint)
      if (data.bank === "telebirr") {
        return await this.verifyTelebirrTransaction(data)
      }

      // For other banks, you can implement your backend API calls here
      return await this.verifyViaBackend(data)
    } catch (error) {
      console.error("Verification error:", error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Verification failed",
      }
    }
  }

  private async verifyTelebirrTransaction(data: VerificationData): Promise<VerificationResult> {
    try {
      const response = await fetch(
        `https://transactioninfo.ethiotelecom.et/receipt/${data.invoiceNumber}`,
        {
          method: "GET",
          headers: {
            "User-Agent": "FinanceApp/1.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        }
      )

      if (response.ok) {
        const html = await response.text()
        return this.parseTelebirrResponse(html, data.invoiceNumber)
      } else {
        return {
          isValid: false,
          error: "Transaction not found or invalid",
        }
      }
    } catch (error) {
      console.error("Telebirr verification error:", error)
      return {
        isValid: false,
        error: "Network error or service unavailable",
      }
    }
  }

  private async verifyViaBackend(data: VerificationData): Promise<VerificationResult> {
    // Implement your backend API call here
    // This is where you'd integrate with your existing payment records system
    try {
      const response = await fetch("/api/v1/verification/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        isValid: false,
        error: "Backend verification service unavailable",
      }
    }
  }

  private parseTelebirrResponse(html: string, invoiceNumber: string): VerificationResult {
    try {
      // Parse the HTML response to extract transaction details
      // This is a simplified parser - you'd need more robust HTML parsing
      const isValid = html.includes("Transaction Details") || html.includes("Receipt")

      if (isValid) {
        return {
          isValid: true,
          transactionDetails: {
            transactionId: invoiceNumber,
            amount: this.extractAmount(html),
            date: this.extractDate(html),
            recipient: this.extractRecipient(html),
            status: "Completed",
            bank: "Telebirr",
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
