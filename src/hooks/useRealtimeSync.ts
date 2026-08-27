import { useEffect, useRef, useCallback } from "react"
import * as Ably from 'ably'

let ablyInstance: Ably.Realtime | null = null
let refCount = 0

function getAblyKey(): string {
  return import.meta.env.VITE_ABLY_API_KEY || localStorage.getItem('ably_api_key') || ''
}

interface UseRealtimeSyncOptions {
  channelName: string
  /** Called with message data when event received */
  onUpdate: (data?: any) => void
  eventName?: string
}

/**
 * Real-time sync via Ably. Publishes/receives full data payloads.
 * WebSocket stays open for SPA lifetime — cleaned up on page unload.
 */
export function useRealtimeSync({ channelName, onUpdate, eventName = 'document-updated' }: UseRealtimeSyncOptions) {
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const onUpdateRef = useRef(onUpdate)
  const mountedRef = useRef(false)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    const ablyKey = getAblyKey()
    if (!channelName || !ablyKey) return

    // Prevent double-increment in Strict Mode
    if (!mountedRef.current) {
      mountedRef.current = true
      refCount++
    }

    if (!ablyInstance) {
      // echoMessages: false — publisher tidak menerima pesannya sendiri kembali,
      // memangkas trafik dan efek samping refetch beruntun saat save
      ablyInstance = new Ably.Realtime({ key: ablyKey, echoMessages: false })
    }

    const channel = ablyInstance.channels.get(channelName)
    channelRef.current = channel

    channel.subscribe(eventName, (message) => {
      onUpdateRef.current(message.data)
    })

    return () => {
      try { channel.unsubscribe() } catch {}
      // Detach agar channel benar-benar lepas dari koneksi saat pindah halaman
      // (tanpa ini, channel menumpuk dan kena limit channel Ably)
      try { channel.detach() } catch {}

      if (mountedRef.current) {
        mountedRef.current = false
        refCount--
      }
      // Don't close ablyInstance. In SPA, closing it mid-session
      // kills connection for all routes. Browser GC handles cleanup.
    }
  }, [channelName, eventName])

  const publishUpdate = useCallback((data?: any) => {
    if (channelRef.current && getAblyKey()) {
      channelRef.current.publish(eventName, data ?? { timestamp: Date.now() })
    }
  }, [eventName])

  return { publishUpdate }
}
