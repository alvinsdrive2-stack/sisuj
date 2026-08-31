import { useEffect, useRef, useCallback, useState } from "react"
import * as Ably from 'ably'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { apiFetch } from '@/lib/api-fetch'
import { API_BASE_URL } from '@/config/api'

// Driver realtime: 'ably' (legacy, default) | 'reverb' (self-hosted, via backend publish)
const REALTIME_DRIVER = (import.meta.env.VITE_REALTIME_DRIVER || 'ably') as 'ably' | 'reverb'

function getAblyKey(): string {
  return import.meta.env.VITE_ABLY_API_KEY || localStorage.getItem('ably_api_key') || ''
}

let ablyInstance: Ably.Realtime | null = null
let refCount = 0

// Listener global status koneksi Ably (instance dibagi antar hook)
const ablyStatusListeners = new Set<(state: string) => void>()

let echoInstance: Echo<any> | null = null

function getEcho(): Echo<any> {
  if (!echoInstance) {
    ;(window as any).Pusher = Pusher
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
    })
  }
  return echoInstance
}

interface UseRealtimeSyncOptions {
  channelName: string
  /** Called with message data when event received */
  onUpdate: (data?: any) => void
  eventName?: string
}

/**
 * Real-time sync. Publishes/receives full data payloads.
 * Driver dipilih via VITE_REALTIME_DRIVER (default: ably).
 *
 * Reverb: subscribe via WebSocket Echo; publish lewat endpoint backend
 * POST /realtime/publish (protokol Pusher tidak izinkan client event
 * di channel publik). Kalau koneksi Reverb gagal (server belum
 * dideploy/down), otomatis fallback ke Ably untuk sesi halaman ini —
 * reload halaman akan coba Reverb lagi.
 *
 * Penanda beda: signer menerima event-nya sendiri di Reverb —
 * handler konsumen sudah idempotent, jadi aman.
 */
export type RealtimeStatus = 'connecting' | 'online' | 'offline'

export function useRealtimeSync({ channelName, onUpdate, eventName = 'document-updated' }: UseRealtimeSyncOptions) {
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const onUpdateRef = useRef(onUpdate)
  const mountedRef = useRef(false)
  onUpdateRef.current = onUpdate

  const [status, setStatus] = useState<RealtimeStatus>('connecting')

  const reverbConfigured =
    REALTIME_DRIVER === 'reverb' &&
    !!channelName &&
    !!import.meta.env.VITE_REVERB_APP_KEY &&
    !!import.meta.env.VITE_REVERB_HOST

  const [driver, setDriver] = useState<'reverb' | 'ably'>(reverbConfigured ? 'reverb' : 'ably')
  const driverRef = useRef(driver)
  driverRef.current = driver

  useEffect(() => {
    if (!channelName) return

    if (driver === 'reverb') {
      const echo = getEcho()
      const prefixedEvent = eventName.startsWith('.') ? eventName : `.${eventName}`
      echo.channel(channelName).listen(prefixedEvent, (e: any) => {
        onUpdateRef.current(e)
      })

      // ── Fallback ke Ably kalau Reverb tidak tersedia ──
      const conn = (echo.connector as any)?.pusher?.connection
      let fellBack = false
      const fallBackToAbly = () => {
        if (fellBack) return
        fellBack = true
        console.warn('[realtime] Reverb tidak tersedia — fallback ke Ably')
        setDriver('ably')
      }
      const handleStateChange = (states: { current: string }) => {
        if (states.current === 'connected') setStatus('online')
        else if (states.current === 'unavailable' || states.current === 'failed') {
          setStatus('offline')
          fallBackToAbly()
        } else setStatus('connecting')
      }
      conn?.bind('state_change', handleStateChange)
      // Belum connected dalam 10 detik (mis. server belum dideploy / proxy belum ada) → fallback
      const fallbackTimer = setTimeout(() => {
        if (conn?.state !== 'connected') fallBackToAbly()
      }, 10_000)

      return () => {
        clearTimeout(fallbackTimer)
        conn?.unbind?.('state_change', handleStateChange)
        // leaveChannel agar channel lepas dari koneksi saat pindah halaman
        try { echo.leaveChannel(channelName) } catch {}
      }
    }

    // ── Legacy Ably path ──
    const ablyKey = getAblyKey()
    if (!ablyKey) return

    // Prevent double-increment in Strict Mode
    if (!mountedRef.current) {
      mountedRef.current = true
      refCount++
    }

    if (!ablyInstance) {
      // echoMessages: false — publisher tidak menerima pesannya sendiri kembali,
      // memangkas trafik dan efek samping refetch beruntun saat save
      ablyInstance = new Ably.Realtime({ key: ablyKey, echoMessages: false })
      ablyInstance.connection.on((stateChange: any) => {
        ablyStatusListeners.forEach(fn => fn(stateChange.current))
      })
    }

    const ablyStatusListener = (state: string) => {
      if (state === 'connected' || state === 'initialized') setStatus('online')
      else if (state === 'suspended' || state === 'failed' || state === 'closed') setStatus('offline')
      else setStatus('connecting')
    }
    ablyStatusListeners.add(ablyStatusListener)
    setStatus(
      ablyInstance.connection.state === 'connected' ? 'online' : 'connecting'
    )

    const channel = ablyInstance.channels.get(channelName)
    channelRef.current = channel

    channel.subscribe(eventName, (message) => {
      onUpdateRef.current(message.data)
    })

    return () => {
      ablyStatusListeners.delete(ablyStatusListener)
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
  }, [channelName, eventName, driver])

  const publishUpdate = useCallback((data?: any) => {
    if (!channelName) return

    if (driverRef.current === 'reverb') {
      // Publish via backend — auth pakai Bearer token yang sama dengan API lain.
      // Fire-and-forget: gagal publish tidak boleh menggagalkan flow (mis. TTD).
      apiFetch(`${API_BASE_URL}/realtime/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelName,
          event: eventName,
          payload: data ?? { timestamp: Date.now() },
        }),
      }).catch(() => {})
      return
    }

    if (channelRef.current && getAblyKey()) {
      channelRef.current.publish(eventName, data ?? { timestamp: Date.now() })
    }
  }, [channelName, eventName])

  return { publishUpdate, status }
}
