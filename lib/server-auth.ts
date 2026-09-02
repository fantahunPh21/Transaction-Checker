// Server-side auth helper functions
import { cookies } from "next/headers"

/**
 * Get the auth token from cookies (server-side)
 * @returns Token string or null if not authenticated
 */
export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("authToken")?.value || null
}
