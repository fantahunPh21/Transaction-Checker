// Server-side auth helper functions
import { cookies } from "next/headers"

/**
 * Get the auth token from cookies (server-side)
 * @returns Token string or null if not authenticated
 */
export function getServerAuthToken(): string | null {
  const cookieStore = cookies()
  return cookieStore.get("authToken")?.value || null
}
