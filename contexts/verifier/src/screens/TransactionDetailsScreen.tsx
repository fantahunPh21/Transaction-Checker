"use client"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Share, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"

export default function TransactionDetailsScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { transaction } = route.params || {}

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction Details:\nBank: ${transaction.bank}\nInvoice: ${transaction.invoiceNumber}\nAmount: ${transaction.amount}\nStatus: ${transaction.status}`,
        title: "Transaction Verification Result",
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const handleOpenOriginal = () => {
    if (transaction.originalUrl) {
      Linking.openURL(transaction.originalUrl)
    }
  }

  const detailItems = [
    { label: "Bank/Service", value: transaction?.bank || "N/A", icon: "business-outline" },
    { label: "Invoice Number", value: transaction?.invoiceNumber || "N/A", icon: "document-text-outline" },
    { label: "Amount", value: transaction?.amount || "N/A", icon: "cash-outline" },
    { label: "Date", value: transaction?.date || "N/A", icon: "calendar-outline" },
    { label: "Status", value: transaction?.status || "N/A", icon: "checkmark-circle-outline" },
    { label: "Recipient", value: transaction?.recipient || "N/A", icon: "person-outline" },
    { label: "Verification Time", value: transaction?.verificationTime || "N/A", icon: "time-outline" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: transaction?.status === "valid" ? "#E8F5E8" : "#FFEBEE" }]}>
          <Ionicons
            name={transaction?.status === "valid" ? "checkmark-circle" : "close-circle"}
            size={48}
            color={transaction?.status === "valid" ? "#4CAF50" : "#F44336"}
          />
          <Text style={[styles.statusText, { color: transaction?.status === "valid" ? "#4CAF50" : "#F44336" }]}>
            {transaction?.status === "valid" ? "Valid Transaction" : "Invalid Transaction"}
          </Text>
          <Text style={styles.statusSubtext}>
            {transaction?.status === "valid"
              ? "This transaction has been verified successfully"
              : "This transaction could not be verified"}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          {detailItems.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name={item.icon} size={20} color="#666" />
                <Text style={styles.detailLabel}>{item.label}</Text>
              </View>
              <Text
                style={[
                  styles.detailValue,
                  item.label === "Status" && {
                    color: transaction?.status === "valid" ? "#4CAF50" : "#F44336",
                    fontWeight: "600",
                  },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Additional Information */}
        {transaction?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{transaction.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {transaction?.originalUrl && (
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenOriginal}>
              <Ionicons name="open-outline" size={20} color="#2196F3" />
              <Text style={styles.actionButtonText}>View Original Receipt</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.verifyAgainButton]}
            onPress={() =>
              navigation.navigate("Verify", {
                prefillData: {
                  bank: transaction?.bank,
                  invoiceNumber: transaction?.invoiceNumber,
                },
              })
            }
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={[styles.actionButtonText, { color: "white" }]}>Verify Again</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Metadata */}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataTitle}>Verification Details</Text>
          <Text style={styles.metadataText}>
            Verified on: {transaction?.verificationDate || new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.metadataText}>Method: {transaction?.verificationMethod || "API Verification"}</Text>
          <Text style={styles.metadataText}>Response Time: {transaction?.responseTime || "1.2s"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    alignItems: "center",
    padding: 30,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  detailsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  notesContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  actionButtons: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  verifyAgainButton: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
    marginLeft: 8,
  },
  metadataContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
})
