import { useEffect, useRef } from "react"
import { API_BASE_URL } from "@/config/api"

interface UseAsesmenSSEOptions {
  /** URL path suffix appended to API_BASE_URL, e.g. "/asesmen/{id}/sse" or "/praasesmen/{idIzin}/sse" */
  path: string
  /** Called whenever server pushes an update event */
  onUpdate: () => void
}

export function useAsesmenSSE({ path, onUpdate }: UseAsesmenSSEOptions) {
  const esRef = useRef<EventSource | null>(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!path) return
    if (typeof EventSource === "undefined") return

    const token = localStorage.getItem("access_token")
    const url = `${API_BASE_URL}${path}${token ? `?token=${token}` : ""}`

    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      console.log(`[SSE] Connected to ${path}`)
    }

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === "updated" || data.type === "asesor_saved") {
          console.log(`[SSE] Update event: ${data.type}`)
          onUpdateRef.current()
        }
      } catch {
        // non-JSON ping, ignore
      }
    }

    es.addEventListener("asesor_saved", () => onUpdateRef.current())
    es.addEventListener("asesi_saved", () => onUpdateRef.current())

    es.onerror = (err) => {
      console.warn("[SSE] Connection error, will auto-retry", err)
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [path])
}
