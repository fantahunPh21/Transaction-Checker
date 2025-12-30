"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

export default function SettingsScreen() {
  const navigation = useNavigation()

  const [settings, setSettings] = useState({
    notifications: true,
    biometric: false,
    autoVerify: true,
    saveHistory: true,
    darkMode: false,
    analytics: true,
  })

  const updateSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "This will clear all cached data. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          // Implement cache clearing logic
          Alert.alert("Success", "Cache cleared successfully")
        },
      },
    ])
  }

  const settingSections = [
    {
      title: "Security",
      items: [
        {
          icon: "notifications-outline",
          title: "Push Notifications",
          subtitle: "Receive verification alerts",
          type: "switch",
          value: settings.notifications,
          onToggle: (value: boolean) => updateSetting("notifications", value),
        },
        {
          icon: "finger-print-outline",
          title: "Biometric Authentication",
          subtitle: "Use fingerprint or face ID",
          type: "switch",
          value: settings.biometric,
          onToggle: (value: boolean) => updateSetting("biometric", value),
        },
      ],
    },
    {
      title: "Verification",
      items: [
        {
          icon: "flash-outline",
          title: "Auto Verification",
          subtitle: "Automatically verify on scan",
          type: "switch",
          value: settings.autoVerify,
          onToggle: (value: boolean) => updateSetting("autoVerify", value),
        },
        {
          icon: "save-outline",
          title: "Save History",
          subtitle: "Keep verification history",
          type: "switch",
          value: settings.saveHistory,
          onToggle: (value: boolean) => updateSetting("saveHistory", value),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: "moon-outline",
          title: "Dark Mode",
          subtitle: "Use dark theme",
          type: "switch",
          value: settings.darkMode,
          onToggle: (value: boolean) => updateSetting("darkMode", value),
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          icon: "analytics-outline",
          title: "Analytics",
          subtitle: "Help improve the app",
          type: "switch",
          value: settings.analytics,
          onToggle: (value: boolean) => updateSetting("analytics", value),
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: "trash-outline",
          title: "Clear Cache",
          subtitle: "Free up storage space",
          type: "action",
          onPress: handleClearCache,
        },
        {
          icon: "download-outline",
          title: "Export Data",
          subtitle: "Download your verification history",
          type: "action",
          onPress: () => Alert.alert("Export", "Feature coming soon"),
        },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                  disabled={item.type === "switch"}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon} size={24} color="#666" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  {item.type === "switch" ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#e0e0e0", true: "#2196F3" }}
                      thumbColor={item.value ? "#fff" : "#f4f3f4"}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Information */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Bank Transfer Verifier</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>© 2024 Your Company</Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 30,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: "#999",
  },
})
