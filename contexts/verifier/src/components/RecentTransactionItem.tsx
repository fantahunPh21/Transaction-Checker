import type React from "react"
import { TouchableOpacity, View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface Transaction {
  id: string
  bank: string
  invoiceNumber: string
  amount: string
  date: string
  status: "valid" | "invalid"
}

interface RecentTransactionItemProps {
  transaction: Transaction
  onPress: () => void
}

export const RecentTransactionItem: React.FC<RecentTransactionItemProps> = ({ transaction, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: transaction.status === "valid" ? "#4CAF50" : "#F44336",
            },
          ]}
        />
        <View style={styles.details}>
          <Text style={styles.bank}>{transaction.bank}</Text>
          <Text style={styles.invoice}>{transaction.invoiceNumber}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{transaction.amount}</Text>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  bank: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  invoice: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
})
