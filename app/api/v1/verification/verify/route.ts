import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verificationService } from "@/lib/verification"

async function getAuthToken(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("authToken")?.value

  const incomingHeader = request.headers.get("Authorization")

  return incomingHeader?.replace("Bearer ", "") || authCookie || null
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bank, invoiceNumber, amount, recipientPhone, notes } = body

    // Validate required fields
    if (!bank || !invoiceNumber) {
      return NextResponse.json(
        { error: "Bank and invoice number are required" },
        { status: 400 }
      )
    }

    // Verify transaction
    const result = await verificationService.verifyTransaction({
      bank,
      invoiceNumber,
      amount,
      recipientPhone,
      notes,
    })

    // If verification is successful, you could optionally save it to your database
    if (result.isValid && result.transactionDetails) {
      // Here you could integrate with your existing payment records system
      // For example, create a new payment record or update an existing one
      console.log("Verified transaction:", result.transactionDetails)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Verification API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return available banks for the frontend
    const banks = verificationService.getAllBanks()
    return NextResponse.json({ banks })
  } catch (error) {
    console.error("Banks API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
