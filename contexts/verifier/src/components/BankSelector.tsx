"use client"

import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { BANK_CONFIGS } from "../constants/bankConfigs"

interface BankSelectorProps {
  selectedBank: string
  onBankChange: (bank: string) => void
}

export const BankSelector: React.FC<BankSelectorProps> = ({ selectedBank, onBankChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Bank/Service</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedBank} onValueChange={onBankChange} style={styles.picker}>
          {Object.entries(BANK_CONFIGS).map(([key, config]) => (
            <Picker.Item key={key} label={config.name} value={key} color={config.color} />
          ))}
        </Picker>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 50,
  },
})
