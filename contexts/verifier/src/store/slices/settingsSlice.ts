import { createSlice } from "@reduxjs/toolkit"

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    notifications: true,
    biometric: false,
    autoVerify: true,
    saveHistory: true,
    darkMode: false,
    analytics: true,
  },
  reducers: {
    updateSetting: (state, action) => {
      const { key, value } = action.payload
      state[key] = value
    },
    resetSettings: (state) => {
      return {
        notifications: true,
        biometric: false,
        autoVerify: true,
        saveHistory: true,
        darkMode: false,
        analytics: true,
      }
    },
  },
})

export const { updateSetting, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer
