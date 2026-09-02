"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Vibration,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { verifyTransaction } from "../store/slices/verificationSlice"
import { BANK_CONFIGS } from "../constants/bankConfigs"
import { BankSelector } from "../components/BankSelector"
import { VerificationResult } from "../components/VerificationResult"
import { LoadingOverlay } from "../components/LoadingOverlay"
import type { RootState, AppDispatch } from "../store/store" // Import RootState
import { parseQRData } from "../utils/qrUtils" // Import parseQRData
import { useNavigation } from "@react-navigation/native"

export default function VerificationScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const navigation = useNavigation() // Use useNavigation hook
  const { isLoading, result, error } = useSelector((state: RootState) => state.verification)

  const [selectedBank, setSelectedBank] = useState("telebirr")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [notes, setNotes] = useState("")

  const shakeAnimation = useRef(new Animated.Value(0)).current
  const fadeAnimation = useRef(new Animated.Value(1)).current

  const validateForm = () => {
    if (!invoiceNumber.trim()) {
      showError("Please enter an invoice number")
      return false
    }

    const config = BANK_CONFIGS[selectedBank as keyof typeof BANK_CONFIGS]
    if (!config.pattern.test(invoiceNumber.toUpperCase())) {
      showError(`Invalid invoice number format for ${config.name}`)
      shakeInput()
      return false
    }

    return true
  }

  const showError = (message: string) => {
    Alert.alert("Validation Error", message)
    Vibration.vibrate(400)
  }

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start()
  }

  const handleVerification = async () => {
    if (!validateForm()) return

    const verificationData = {
      bank: selectedBank,
      invoiceNumber: invoiceNumber.toUpperCase(),
      amount: amount || null,
      recipientPhone: recipientPhone || null,
      notes: notes || null,
    }

    try {
      await dispatch(verifyTransaction(verificationData))

      // Animate success/failure
      Animated.sequence([
        Animated.timing(fadeAnimation, { toValue: 0.5, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    } catch (error) {
      console.error("Verification failed:", error)
    }
  }

  const resetForm = () => {
    setInvoiceNumber("")
    setAmount("")
    setRecipientPhone("")
    setNotes("")
    setSelectedBank("telebirr")
  }

  const handleQRScan = () => {
    // Navigate to QR scanner
    navigation.navigate("QRScanner", {
      onScanComplete: (data: string) => {
        // Parse QR data and populate form
        const parsed = parseQRData(data)
        if (parsed) {
          setSelectedBank(parsed.bank)
          setInvoiceNumber(parsed.invoiceNumber)
          setAmount(parsed.amount || "")
        }
      },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Transaction</Text>
          <Text style={styles.subtitle}>Enter transaction details to verify authenticity</Text>
        </View>

        <Animated.View style={[styles.form, { opacity: fadeAnimation }]}>
          {/* Bank Selection */}
          <BankSelector selectedBank={selectedBank} onBankChange={setSelectedBank} />

          {/* Invoice Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invoice/Transaction Number *</Text>
            <Animated.View style={[styles.inputContainer, { transform: [{ translateX: shakeAnimation }] }]}>
              <TextInput
                style={styles.input}
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                placeholder={`Enter ${BANK_CONFIGS[selectedBank as keyof typeof BANK_CONFIGS].name} invoice number`}
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.qrButton} onPress={handleQRScan}>
                <Ionicons name="qr-code" size={20} color="#2196F3" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Amount Input (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Amount (Optional)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter expected amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Recipient Phone (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient Phone (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              placeholder="Enter recipient phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          {/* Notes (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: BANK_CONFIGS[selectedBank as keyof typeof BANK_CONFIGS].color }]}
              onPress={handleVerification}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="white" />
                  <Text style={styles.buttonText}>Verify Transaction</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={resetForm} disabled={isLoading}>
              <Ionicons name="refresh" size={20} color="#666" />
              <Text style={styles.secondaryButtonText}>Reset Form</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Verification Result */}
        {result && <VerificationResult result={result} bankConfig={BANK_CONFIGS[selectedBank as keyof typeof BANK_CONFIGS]} />}

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay message="Verifying transaction..." />}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
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
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  qrButton: {
    marginLeft: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})
