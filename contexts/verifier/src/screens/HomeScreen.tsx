"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector, useDispatch } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, PieChart } from "react-native-chart-kit"
import type { RootState } from "../store/store"
import { fetchDashboardData } from "../store/slices/dashboardSlice"
import type { AppDispatch } from "../store/store"
import { BankCard } from "../components/BankCard"
import { QuickActionButton } from "../components/QuickActionButton"
import { RecentTransactionItem } from "../components/RecentTransactionItem"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const navigation = useNavigation()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { stats, recentTransactions, isLoading } = useSelector((state: RootState) => state.dashboard)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  const onRefresh = async () => {
    setRefreshing(true)
    await dispatch(fetchDashboardData())
    setRefreshing(false)
  }

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: stats?.monthlyVerifications || [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const pieData = [
    { name: "Valid", population: stats?.validTransactions || 85, color: "#4CAF50", legendFontColor: "#333" },
    { name: "Invalid", population: stats?.invalidTransactions || 15, color: "#F44336", legendFontColor: "#333" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.totalVerifications || 0}</Text>
            <Text style={styles.statLabel}>Total Verifications</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>{stats?.successRate || 0}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="shield-checkmark"
              title="Verify Transaction"
              onPress={() => navigation.navigate("Verify")}
            />
            <QuickActionButton icon="qr-code" title="Scan QR Code" onPress={() => navigation.navigate("QRScanner")} />
            <QuickActionButton icon="time" title="View History" onPress={() => navigation.navigate("History")} />
            <QuickActionButton icon="settings" title="Settings" onPress={() => navigation.navigate("Settings")} />
          </View>
        </View>

        {/* Supported Banks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Banks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BankCard name="Telebirr" color="#FF6B35" />
            <BankCard name="CBE" color="#1E88E5" />
            <BankCard name="BOA" color="#4CAF50" />
            <BankCard name="Awash" color="#9C27B0" />
            <BankCard name="Abay" color="#FF9800" />
            <BankCard name="Addis Int'l" color="#795548" />
          </ScrollView>
        </View>

        {/* Analytics Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Verifications</Text>
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#2196F3",
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Success Rate Pie Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Success Rate</Text>
          <PieChart
            data={pieData}
            width={width - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Verifications</Text>
            <TouchableOpacity onPress={() => navigation.navigate("History")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions?.slice(0, 3).map((transaction, index) => (
            <RecentTransactionItem
              key={index}
              transaction={transaction}
              onPress={() => navigation.navigate("TransactionDetails", { transaction })}
            />
          ))}
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
})
