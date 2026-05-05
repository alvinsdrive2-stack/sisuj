import { useEffect, useRef } from "react"
import * as Ably from 'ably'

// Singleton Ably instance
let ablyInstance: Ably.Realtime | null = null

function getAblyKey(): string {
  return import.meta.env.VITE_ABLY_API_KEY || localStorage.getItem('ably_api_key') || ''
}

interface UseRealtimeSyncOptions {
  /** Channel name based on document ID, e.g., "praasesmen:I-12345" */
  channelName: string
  /** Called when any user publishes an update event */
  onUpdate: () => void
  /** Optional: publish an event when this user makes changes */
  eventName?: string
}

/**
 * Frontend-only real-time sync using Ably.
 * All users on the same channel get notified when someone publishes an event.
 */
export function useRealtimeSync({ channelName, onUpdate, eventName = 'document-updated' }: UseRealtimeSyncOptions) {
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    const ablyKey = getAblyKey()
    if (!channelName || !ablyKey) {
      console.warn('[RealtimeSync] Ably key not configured, skipping real-time sync')
      return
    }

    // Initialize Ably (singleton)
    if (!ablyInstance) {
      ablyInstance = new Ably.Realtime({ key: ablyKey })
    }

    const channel = ablyInstance.channels.get(channelName)
    channelRef.current = channel

    // Subscribe to update events - Ably v1+ returns void
    channel.subscribe(eventName, (_message) => {
      console.log(`[RealtimeSync] Update received on channel: ${channelName}`)
      onUpdateRef.current()
    })

    console.log(`[RealtimeSync] Subscribed to channel: ${channelName}`)

    return () => {
      // Unsubscribe from the channel
      try {
        channel.unsubscribe()
      } catch (err) {
        // Ignore errors during cleanup
      }
      // Don't close ablyInstance — it's a singleton shared across components
    }
  }, [channelName, eventName])

  /**
   * Publish an update event to notify other users
   * Call this after saving data/signing
   */
  const publishUpdate = () => {
    const ablyKey = getAblyKey()
    if (channelRef.current && ablyKey) {
      channelRef.current.publish(eventName, { timestamp: Date.now() })
      console.log(`[RealtimeSync] Published update to channel: ${channelName}`)
    }
  }

  return { publishUpdate }
}
