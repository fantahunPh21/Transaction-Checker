export const parseQRData = (data: string) => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(data)
    if (parsed.bank && parsed.invoiceNumber) {
      return parsed
    }
  } catch (error) {
    // Not JSON, try other formats
  }

  // Try to parse URL format for Telebirr
  if (data.includes("transactioninfo.ethiotelecom.et")) {
    const match = data.match(/receipt\/([A-Z0-9]+)/)
    if (match) {
      return {
        bank: "telebirr",
        bankName: "Telebirr",
        invoiceNumber: match[1],
      }
    }
  }

  // Try to parse other bank formats
  const bankPatterns = {
    cbe: { pattern: /CBE([A-Z0-9]+)/i, name: "Commercial Bank of Ethiopia" },
    boa: { pattern: /BOA([A-Z0-9]+)/i, name: "Bank of Abyssinia" },
    awash: { pattern: /AWB([A-Z0-9]+)/i, name: "Awash Bank" },
    abay: { pattern: /ABY([A-Z0-9]+)/i, name: "Abay Bank" },
    addis: { pattern: /AIB([A-Z0-9]+)/i, name: "Addis International Bank" },
  }

  for (const [bank, config] of Object.entries(bankPatterns)) {
    const match = data.match(config.pattern)
    if (match) {
      return {
        bank,
        bankName: config.name,
        invoiceNumber: match[0],
      }
    }
  }

  return null
}

export const generateQRData = (bank: string, invoiceNumber: string, amount?: string) => {
  return JSON.stringify({
    bank,
    invoiceNumber,
    amount,
    timestamp: new Date().toISOString(),
  })
}
