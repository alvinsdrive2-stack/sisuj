import { useEffect, useRef } from "react"
import { API_BASE_URL } from "@/config/api"

const PING_INTERVAL = 2 * 60 * 1000

export function useSessionKeepAlive(enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return

    const ping = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return

      try {
        await fetch(`${API_BASE_URL}/auth/ping`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      } catch {
        // ping failure is harmless
      }
    }

    ping()
    intervalRef.current = setInterval(ping, PING_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled])
}
