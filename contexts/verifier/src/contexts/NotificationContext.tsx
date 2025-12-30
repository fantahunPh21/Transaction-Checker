"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

interface NotificationContextType {
  expoPushToken: string | null
  notification: Notifications.Notification | null
  sendNotification: (title: string, body: string, data?: any) => Promise<void>
  scheduleNotification: (title: string, body: string, seconds: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token))

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }, [])

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token = null

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return null
    }

    token = (await Notifications.getExpoPushTokenAsync()).data
    return token
  }

  const sendNotification = async (title: string, body: string, data?: any): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    })
  }

  const scheduleNotification = async (title: string, body: string, seconds: number): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: { seconds },
    })
  }

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    sendNotification,
    scheduleNotification,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
