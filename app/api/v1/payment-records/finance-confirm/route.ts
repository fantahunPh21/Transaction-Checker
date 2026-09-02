import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to your backend API
    const response = await fetch("http://localhost:8088/api/v1/payment-records/finance-confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to confirm transaction" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error confirming transaction:", error)
    return NextResponse.json({ error: "Failed to confirm transaction" }, { status: 500 })
  }
}
