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

  // Try to parse URL format
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
    cbe: /CBE([A-Z0-9]+)/i,
    boa: /BOA([A-Z0-9]+)/i,
    awash: /AWB([A-Z0-9]+)/i,
    abay: /ABY([A-Z0-9]+)/i,
    addis: /AIB([A-Z0-9]+)/i,
  }

  for (const [bank, pattern] of Object.entries(bankPatterns)) {
    const match = data.match(pattern)
    if (match) {
      return {
        bank,
        bankName: bank.toUpperCase(),
        invoiceNumber: match[0],
      }
    }
  }

  return null
}
