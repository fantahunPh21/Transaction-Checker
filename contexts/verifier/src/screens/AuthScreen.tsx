"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import { useNavigation } from "@react-navigation/native"

export default function AuthScreen() {
  const { login, register } = useAuth()
  const navigation = useNavigation()

  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      let success = false

      if (isLogin) {
        success = await login(formData.email, formData.password)
      } else {
        success = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        })
      }

      if (success) {
        navigation.replace("Main")
      } else {
        Alert.alert("Error", isLogin ? "Invalid credentials" : "Registration failed")
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={64} color="#2196F3" />
            <Text style={styles.title}>Bank Transfer Verifier</Text>
            <Text style={styles.subtitle}>{isLogin ? "Welcome back!" : "Create your account"}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(value: string) => updateFormData("name", value)}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(value: string) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChangeText={(value: string) => updateFormData("phone", value)}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(value: string) => updateFormData("password", value)}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData("confirmPassword", value)}
                  secureTextEntry
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.submitButtonText}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <TouchableOpacity style={styles.toggleButton} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.toggleLink}>{isLogin ? "Sign Up" : "Sign In"}</Text>
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 14,
    color: "#666",
  },
  toggleLink: {
    color: "#2196F3",
    fontWeight: "600",
  },
  forgotButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 14,
    color: "#2196F3",
  },
})
