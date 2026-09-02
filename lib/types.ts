export interface PaymentRecordLine {
  paymentRecordLineId?: number
  debitAccountNo?: string
  debitAccountName?: string
  creditAccountNo?: string
  creditAccountName?: string
  images?: string | string[]
  amountPaid?: number
  confirmedBy?: string | null
  companyName?: string
  referenceId?: string
  remark?: string
  status?: string
  createdDate?: string
}

export interface PaymentRecord {
  paymentRecordsId: number
  customerName: string
  amountPaid: number
  salesPerson: string
  remark?: string
  confirmationStatus?: string
  requestStatus?: string
  paymentRecordLine?: PaymentRecordLine[]
  customerTIN?: string
  companyName?: string
  transactionDate?: string
  createdDate?: string
  debitAccountNo?: string
  creditAccountNo?: string
  referenceId?: string
  status?: string
}

export interface Company {
  companyId: number
  companyName: string
  tinNumber?: string
  tin?: string
  companyEmail?: string
  companyPhone?: string
  shopBranch?: unknown[]
  bankAccount?: unknown[]
  location?: string
  logo?: string | null
}

export interface BankAccount {
  id?: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

export interface ShopBranch {
  shopBranchId: number
  shopBranchName: string
  shopBranchPhone?: string
  shopId?: number
  email?: string
  company?: unknown
}

export interface Salesman {
  userId: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  userName?: string
  shopBranches?: Array<{ shopBranchId?: number; shopBranchName: string }>
}
