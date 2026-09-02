import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface RecentTransaction {
  id: string
  bank: string
  invoiceNumber: string
  amount: string
  date: string
  status: "valid" | "invalid"
}

interface DashboardStats {
  totalVerifications: number
  successRate: number
  validTransactions: number
  invalidTransactions: number
  monthlyVerifications: number[]
  recentTransactions: RecentTransaction[]
}

interface DashboardState {
  stats: DashboardStats | null
  recentTransactions: RecentTransaction[]
  isLoading: boolean
  error: string | null
}

export const fetchDashboardData = createAsyncThunk("dashboard/fetchData", async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    totalVerifications: 127,
    successRate: 94,
    validTransactions: 85,
    invalidTransactions: 15,
    monthlyVerifications: [20, 45, 28, 80, 99, 43],
    recentTransactions: [
      {
        id: "1",
        bank: "Telebirr",
        invoiceNumber: "CH25VNLTL5",
        amount: "1,250.00 ETB",
        date: "2024-01-15",
        status: "valid",
      },
      {
        id: "2",
        bank: "CBE",
        invoiceNumber: "CBE123456789",
        amount: "850.00 ETB",
        date: "2024-01-14",
        status: "valid",
      },
    ],
  }
})

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: null as DashboardStats | null,
    recentTransactions: [] as RecentTransaction[],
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
        state.recentTransactions = action.payload.recentTransactions
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
  },
})

export default dashboardSlice.reducer
