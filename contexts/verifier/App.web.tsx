import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./src/store/store"
import { AuthProvider } from "./src/contexts/AuthContext.web"

// Web-compatible screens
import HomeScreen from "./src/screens/HomeScreen"
import VerificationScreen from "./src/screens/VerificationScreen"
import HistoryScreen from "./src/screens/HistoryScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import AuthScreen from "./src/screens/AuthScreen.web"
import SplashScreen from "./src/screens/SplashScreen.web"

// Web navigation component
function WebNavigation({ currentScreen, onNavigate }: { 
  currentScreen: string, 
  onNavigate: (screen: string) => void 
}) {
  const tabs = [
    { name: "Home", icon: "🏠" },
    { name: "Verify", icon: "🛡️" },
    { name: "History", icon: "📋" },
    { name: "Profile", icon: "👤" },
  ]

  return (
    <View style={styles.navigation}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tab,
            currentScreen === tab.name && styles.activeTab
          ]}
          onPress={() => onNavigate(tab.name)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            currentScreen === tab.name && styles.activeTabText
          ]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

// Web-compatible App component
function WebApp() {
  const [currentScreen, setCurrentScreen] = useState("Splash")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Simulate splash screen
    const timer = setTimeout(() => {
      setIsLoading(false)
      setCurrentScreen(isAuthenticated ? "Home" : "Auth")
    }, 2000)

    return () => clearTimeout(timer)
  }, [isAuthenticated])

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen)
  }

  const handleAuth = () => {
    setIsAuthenticated(true)
    setCurrentScreen("Home")
  }

  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />
  }

  if (currentScreen === "Auth") {
    return (
      <View style={styles.container}>
        <AuthScreen />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentScreen === "Home" && <HomeScreen />}
        {currentScreen === "Verify" && <VerificationScreen />}
        {currentScreen === "History" && <HistoryScreen />}
        {currentScreen === "Profile" && <ProfileScreen />}
      </View>
      <WebNavigation currentScreen={currentScreen} onNavigate={handleNavigate} />
    </View>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <AuthProvider>
          {Platform.OS === 'web' ? <WebApp /> : <App />}
        </AuthProvider>
      </PersistGate>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  navigation: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
  },
  activeTabText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
}) 