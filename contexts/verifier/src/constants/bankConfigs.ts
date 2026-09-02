export const BANK_CONFIGS = {
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
    pattern: /^AWB[A-Z0-9]{8,15}$/,
    color: "#9C27B0",
  },
  abay: {
    name: "Abay Bank",
    baseUrl: "https://abaybank.com.et/transaction/",
    pattern: /^ABY[A-Z0-9]{8,15}$/,
    color: "#FF9800",
  },
  addis: {
    name: "Addis International Bank",
    baseUrl: "https://addisbank.com/verify/",
    pattern: /^AIB[A-Z0-9]{8,15}$/,
    color: "#795548",
  },
}
