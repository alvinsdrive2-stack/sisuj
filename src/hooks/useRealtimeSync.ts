import { useEffect, useRef } from "react"
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
 * Auto-closes WebSocket when last consumer unmounts.
 */
export function useRealtimeSync({ channelName, onUpdate, eventName = 'document-updated' }: UseRealtimeSyncOptions) {
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    const ablyKey = getAblyKey()
    if (!channelName || !ablyKey) return

    refCount++

    if (!ablyInstance) {
      ablyInstance = new Ably.Realtime({ key: ablyKey })
    }

    const channel = ablyInstance.channels.get(channelName)
    channelRef.current = channel

    channel.subscribe(eventName, (message) => {
      onUpdateRef.current(message.data)
    })

    return () => {
      try { channel.unsubscribe() } catch {}

      refCount--
      if (refCount <= 0 && ablyInstance) {
        try { ablyInstance.connection.close() } catch {}
        ablyInstance = null
      }
    }
  }, [channelName, eventName])

  const publishUpdate = (data?: any) => {
    if (channelRef.current && getAblyKey()) {
      channelRef.current.publish(eventName, data ?? { timestamp: Date.now() })
    }
  }

  return { publishUpdate }
}
