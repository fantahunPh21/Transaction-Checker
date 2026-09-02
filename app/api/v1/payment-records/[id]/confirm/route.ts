import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Replace with your actual Django API URL
    const response = await fetch(
      `http://localhost:8088/finance-payment-confirmation/api/v1/payment-records/${id}/confirm`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
          // "Authorization": `Bearer ${process.env.API_TOKEN}`
        },
        // You can pass additional data from the request if needed
        // body: JSON.stringify(await request.json()),
      },
    )

    if (!response.ok) {
      throw new Error(`Django API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
