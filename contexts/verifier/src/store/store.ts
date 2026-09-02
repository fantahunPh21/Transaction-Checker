import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers } from "@reduxjs/toolkit"

// Slices
import authSlice from "./slices/authSlice"
import verificationSlice from "./slices/verificationSlice"
import historySlice from "./slices/historySlice"
import dashboardSlice from "./slices/dashboardSlice"
import settingsSlice from "./slices/settingsSlice"

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "history", "settings"], // Only persist these reducers
}

const rootReducer = combineReducers({
  auth: authSlice,
  verification: verificationSlice,
  history: historySlice,
  dashboard: dashboardSlice,
  settings: settingsSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
