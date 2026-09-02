import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Replace with your actual Django API URL
    const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/payment-records/pending", {
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers if needed
        // "Authorization": `Bearer ${process.env.API_TOKEN}`
      },
    })

    if (!response.ok) {
      throw new Error(`Django API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to Django API:", error)
    return NextResponse.json({ error: "Failed to fetch pending records from backend" }, { status: 500 })
  }
}
