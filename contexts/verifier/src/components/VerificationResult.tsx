import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface VerificationResultProps {
  result: any
  bankConfig: any
}

export const VerificationResult: React.FC<VerificationResultProps> = ({ result, bankConfig }) => {
  const handleOpenOriginal = () => {
    if (result.verificationUrl) {
      Linking.openURL(result.verificationUrl)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: result.isValid ? "#4CAF50" : "#F44336" }]}>
        <Ionicons name={result.isValid ? "checkmark-circle" : "close-circle"} size={32} color="white" />
        <Text style={styles.headerText}>{result.isValid ? "Valid Transaction" : "Invalid Transaction"}</Text>
      </View>

      {result.isValid && result.transactionDetails && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>

          {Object.entries(result.transactionDetails).map(([key, value]) => (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{key}:</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenOriginal}>
            <Ionicons name="open-outline" size={16} color="white" />
            <Text style={styles.linkButtonText}>View Original Receipt</Text>
          </TouchableOpacity>
        </View>
      )}

      {!result.isValid && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{result.error || "This transaction could not be verified."}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  details: {
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  linkButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorContainer: {
    padding: 20,
  },
  errorText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})
