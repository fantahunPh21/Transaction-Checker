import { createSlice } from "@reduxjs/toolkit"

interface SettingsState {
  notifications: boolean
  biometric: boolean
  autoVerify: boolean
  saveHistory: boolean
  darkMode: boolean
  analytics: boolean
}

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
      const { key, value } = action.payload as { key: keyof SettingsState; value: boolean }
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
