module.exports = {
  expo: {
    name: "Bank Transfer Verifier",
    slug: "bank-transfer-verifier",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./public/placeholder-logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./public/placeholder-logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.banktransferverifier.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./public/placeholder-logo.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.banktransferverifier.app"
    },
    web: {
      favicon: "./public/placeholder-logo.png",
      bundler: "metro"
    },
    plugins: [
      [
        "expo-barcode-scanner",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access camera to scan QR codes."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ]
    ]
  }
}; 