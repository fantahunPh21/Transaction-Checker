import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This is a proxy to your backend
export async function GET(request: Request) {
  try {
    // Get the auth token from cookies (server-side)
    const cookieStore = cookies()
    const authToken = cookieStore.get("authToken")?.value

    // Get token from Authorization header if it exists in the incoming request
    const incomingAuthHeader = request.headers.get("Authorization")

    // Use the token from the request header if available, otherwise use the cookie
    const tokenToUse = incomingAuthHeader?.replace("Bearer ", "") || authToken

    if (!tokenToUse) {
      console.error("No authentication token found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Using token (first 20 chars):", tokenToUse.substring(0, 20))

    // Create headers object with the custom header
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Use authHeader as per the backend error message
      authHeader: `Bearer ${tokenToUse}`,
    }

    // Replace with your actual backend API URL
    const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/payment-records", {
      headers,
    })

    if (!response.ok) {
      console.error(`Backend API responded with status: ${response.status}`)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      return NextResponse.json(
        { error: `Backend API responded with status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to backend API:", error)
    return NextResponse.json({ error: "Failed to fetch data from backend" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Get the auth token from cookies (server-side)
    const cookieStore = cookies()
    const authToken = cookieStore.get("authToken")?.value

    // Get token from Authorization header if it exists in the incoming request
    const incomingAuthHeader = request.headers.get("Authorization")

    // Use the token from the request header if available, otherwise use the cookie
    const tokenToUse = incomingAuthHeader?.replace("Bearer ", "") || authToken

    if (!tokenToUse) {
      console.error("No authentication token found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create headers object with the custom header
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Use authHeader as per the backend error message
      authHeader: `Bearer ${tokenToUse}`,
    }

    // Forward the request to your backend API
    const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/payment-records", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(`Backend API responded with status: ${response.status}`)
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      return NextResponse.json({ error: errorData.message || "Failed to add transaction" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 })
  }
}
