import { useEffect, useRef, useCallback } from 'react'
import { connectEcho, getEcho } from '@/lib/echo'

interface UseEchoSyncOptions {
  channelName: string
  onUpdate: (data?: any) => void
  eventName?: string
}

/**
 * Real-time sync via Laravel Echo + Reverb.
 * Replaces old Ably-based `useRealtimeSync`.
 *
 * Channel name format: `signing:{idIzin}:{pageKey}`
 * Event name format: `.document.signed` (leading dot = Echo broadcastAs)
 */
export function useEchoSync({ channelName, onUpdate, eventName = '.document.signed' }: UseEchoSyncOptions) {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!channelName) return

    // Convert Ably-style "signing:123:apl01" to Echo dot notation "signing.123.apl01"
    const echoChannel = channelName.replace(/:/g, '.')
    const echo = getEcho()

    // No Echo instance yet — try connecting
    const instance = echo || connectEcho()

    const channel = instance.private(echoChannel)

    channel.listen(eventName, (e: any) => {
      onUpdateRef.current(e)
    })

    return () => {
      try {
        instance.leaveChannel(`private-${echoChannel}`)
      } catch {
        // ignore cleanup errors
      }
    }
  }, [channelName, eventName])

  /**
   * Publish is now handled by backend broadcast.
   * This is a no-op for compatibility.
   */
  const publishUpdate = useCallback((_data?: any) => {
    // Backend Laravel event handles broadcasting via Reverb
    // No client-side publish needed
  }, [])

  return { publishUpdate }
}
