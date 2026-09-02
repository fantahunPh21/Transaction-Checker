import { BANK_CONFIGS } from "../constants/bankConfigs"

export class BankAPIService {
  private static instance: BankAPIService
  private baseURL = "https://your-backend-api.com/api"

  static getInstance(): BankAPIService {
    if (!BankAPIService.instance) {
      BankAPIService.instance = new BankAPIService()
    }
    return BankAPIService.instance
  }

  async verifyTransaction(data: {
    bank: string
    invoiceNumber: string
    amount?: string
    recipientPhone?: string
  }) {
    try {
      const config = BANK_CONFIGS[data.bank as keyof typeof BANK_CONFIGS]

      // For Telebirr (real endpoint)
      if (data.bank === "telebirr") {
        return await this.verifyTelebirrTransaction(data)
      }

      // For other banks, use your backend API
      const response = await fetch(`${this.baseURL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          bank: data.bank,
          invoiceNumber: data.invoiceNumber,
          amount: data.amount,
          recipientPhone: data.recipientPhone,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Verification API error:", error)
      throw error
    }
  }

  private async verifyTelebirrTransaction(data: any) {
    try {
      // Use the actual Telebirr endpoint
      const response = await fetch(`https://transactioninfo.ethiotelecom.et/receipt/${data.invoiceNumber}`, {
        method: "GET",
        headers: {
          "User-Agent": "BankVerifierApp/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      })

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

  private parseTelebirrResponse(html: string, invoiceNumber: string) {
    try {
      // Parse the HTML response to extract transaction details
      // This is a simplified parser - you'd need more robust HTML parsing
      const isValid = html.includes("Transaction Details") || html.includes("Receipt")

      if (isValid) {
        // Extract transaction details from HTML
        // You'd implement proper HTML parsing here
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
      } else {
        return {
          isValid: false,
          error: "Invalid transaction or receipt not found",
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: "Failed to parse transaction data",
      }
    }
  }

  private extractAmount(html: string): string {
    // Implement HTML parsing to extract amount
    const amountMatch = html.match(/Amount[:\s]*([0-9,]+\.?[0-9]*)/i)
    return amountMatch ? `${amountMatch[1]} ETB` : "N/A"
  }

  private extractDate(html: string): string {
    // Implement HTML parsing to extract date
    const dateMatch = html.match(/Date[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i)
    return dateMatch ? dateMatch[1] : new Date().toLocaleDateString()
  }

  private extractRecipient(html: string): string {
    // Implement HTML parsing to extract recipient
    return "N/A" // Placeholder
  }

  private async getAuthToken(): Promise<string> {
    // Implement your authentication logic
    return "your-auth-token"
  }

  // Batch verification for multiple transactions
  async verifyMultipleTransactions(transactions: any[]) {
    const results = await Promise.allSettled(transactions.map((transaction) => this.verifyTransaction(transaction)))

    return results.map((result, index) => ({
      transaction: transactions[index],
      result: result.status === "fulfilled" ? result.value : { isValid: false, error: "Verification failed" },
    }))
  }

  // Get supported banks and their status
  async getBankStatus() {
    try {
      const response = await fetch(`${this.baseURL}/banks/status`)
      return await response.json()
    } catch (error) {
      // Return default status if API is unavailable
      return Object.keys(BANK_CONFIGS).map((bank) => ({
        bank,
        status: "active",
        lastChecked: new Date().toISOString(),
      }))
    }
  }
}

export const bankAPI = BankAPIService.getInstance()
