import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchTransactionHistory = createAsyncThunk("history/fetchHistory", async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "1",
      bank: "Telebirr",
      invoiceNumber: "CH25VNLTL5",
      amount: "1,250.00 ETB",
      date: "2024-01-15",
      status: "valid",
      recipient: "John Doe",
    },
    {
      id: "2",
      bank: "CBE",
      invoiceNumber: "CBE123456789",
      amount: "850.00 ETB",
      date: "2024-01-14",
      status: "valid",
    },
  ]
})

export const clearHistory = createAsyncThunk("history/clearHistory", async () => {
  // Clear history from storage
  return []
})

const historySlice = createSlice({
  name: "history",
  initialState: {
    transactions: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions = action.payload
      })
      .addCase(clearHistory.fulfilled, (state) => {
        state.transactions = []
      })
  },
})

export default historySlice.reducer
