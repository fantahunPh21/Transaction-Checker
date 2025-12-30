import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./src/store/store"
import { AuthProvider } from "./src/contexts/AuthContext"
import { NotificationProvider } from "./src/contexts/NotificationContext"
import { Platform } from "react-native"

// Screens
import HomeScreen from "./src/screens/HomeScreen"
import VerificationScreen from "./src/screens/VerificationScreen"
import HistoryScreen from "./src/screens/HistoryScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import QRScannerScreen from "./src/screens/QRScannerScreen"
import TransactionDetailsScreen from "./src/screens/TransactionDetailsScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import AuthScreen from "./src/screens/AuthScreen"
import SplashScreen from "./src/screens/SplashScreen"

// Icons
import { Ionicons } from "@expo/vector-icons"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = "home"

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Verify") {
            iconName = focused ? "shield-checkmark" : "shield-checkmark-outline"
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName as any} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Verify" component={VerificationScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

// Import web app component
import WebApp from "./App.web"
import WebSplashScreen from "./src/screens/SplashScreen.web"
import { AuthProvider as WebAuthProvider } from "./src/contexts/AuthContext.web"

export default function App() {
  // Use web version on web platform
  if (Platform.OS === 'web') {
    return (
      <Provider store={store}>
        <PersistGate loading={<WebSplashScreen onComplete={() => {}} />} persistor={persistor}>
          <WebAuthProvider>
            <WebApp />
          </WebAuthProvider>
        </PersistGate>
      </Provider>
    )
  }

  // Use native version on mobile platforms
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="QRScanner" component={QRScannerScreen} />
                <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  )
}
