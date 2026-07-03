import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { API_BASE_URL } from '@/config/api'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo?: Echo<any>
  }
}

let echoInstance: Echo<any> | null = null

export function getEcho(): Echo<any> | null {
  return echoInstance
}

export function connectEcho(): Echo<any> {
  if (echoInstance) {
    disconnectEcho()
  }

  window.Pusher = Pusher

  echoInstance = new Echo<any>({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'genius',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    },
  })

  return echoInstance
}

export function disconnectEcho(): void {
  if (echoInstance) {
    try {
      echoInstance.disconnect()
    } catch {
      // ignore
    }
    echoInstance = null
  }
}
