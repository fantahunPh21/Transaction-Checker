import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { bankAPI } from "../../services/bankAPI"

export const verifyTransaction = createAsyncThunk("verification/verify", async (data: any) => {
  const result = await bankAPI.verifyTransaction(data)
  return result
})

const verificationSlice = createSlice({
  name: "verification",
  initialState: {
    result: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearResult: (state) => {
      state.result = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.result = action.payload
      })
      .addCase(verifyTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
  },
})

export const { clearResult } = verificationSlice.actions
export default verificationSlice.reducer
