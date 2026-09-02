"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, Dimensions } from "react-native"
import { Camera } from "expo-camera"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { parseQRData } from "../utils/qrParser"

const { width, height } = Dimensions.get("window")

export default function QRScannerScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { onScanComplete } = route.params || {}

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [flashOn, setFlashOn] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return

    setScanned(true)
    Vibration.vibrate(200)

    try {
      const parsedData = parseQRData(data)

      if (parsedData) {
        Alert.alert(
          "QR Code Scanned Successfully",
          `Bank: ${parsedData.bankName}\nTransaction: ${parsedData.invoiceNumber}`,
          [
            {
              text: "Use This Data",
              onPress: () => {
                if (onScanComplete) {
                  onScanComplete(parsedData)
                }
                navigation.goBack()
              },
            },
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
          ],
        )
      } else {
        Alert.alert("Invalid QR Code", "This QR code does not contain valid transaction data.", [
          {
            text: "Try Again",
            onPress: () => setScanned(false),
          },
        ])
      }
    } catch (error) {
      Alert.alert("Error", "Failed to parse QR code data.", [
        {
          text: "Try Again",
          onPress: () => setScanned(false),
        },
      ])
    }
  }

  const toggleFlash = () => {
    setFlashOn(!flashOn)
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
              <Ionicons name={flashOn ? "flash" : "flash-off"} size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Scanning Area */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>Position the QR code within the frame</Text>
            <Text style={styles.subInstructionText}>Make sure the code is clearly visible and well-lit</Text>
          </View>

          {/* Manual Entry Button */}
          <TouchableOpacity style={styles.manualButton} onPress={() => navigation.goBack()}>
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.manualButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#2196F3",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  instructionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subInstructionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  manualButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
