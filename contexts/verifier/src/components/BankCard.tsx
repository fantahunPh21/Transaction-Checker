import type React from "react"
import { View, Text, StyleSheet } from "react-native"

interface BankCardProps {
  name: string
  color: string
}

export const BankCard: React.FC<BankCardProps> = ({ name, color }) => {
  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <Text style={styles.bankName}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
})
