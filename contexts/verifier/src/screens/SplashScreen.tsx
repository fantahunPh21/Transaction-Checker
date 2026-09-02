"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../contexts/AuthContext"

const { width, height } = Dimensions.get("window")

export default function SplashScreen() {
  const navigation = useNavigation()
  const { isAuthenticated, isLoading } = useAuth()

  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.5)

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    // Navigate after splash
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigation.replace("Main")
        } else {
          navigation.replace("Auth")
        }
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#2196F3" />
        </View>

        <Text style={styles.title}>Bank Transfer Verifier</Text>
        <Text style={styles.subtitle}>Secure • Fast • Reliable</Text>

        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingDot} />
          <Animated.View style={[styles.loadingDot, { animationDelay: "0.2s" }]} />
          <Animated.View style={[styles.loadingDot, { animationDelay: "0.4s" }]} />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Advanced Verification Technology</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2196F3",
    marginHorizontal: 4,
    opacity: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  versionText: {
    fontSize: 12,
    color: "#999",
  },
})
