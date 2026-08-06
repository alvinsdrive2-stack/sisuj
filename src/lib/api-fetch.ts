/**
 * Shared fetch wrapper that:
 * - Auto-attaches Bearer token from localStorage
 * - Detects 401 responses and triggers logout
 *
 * Any fetch through this wrapper that gets a 401 will:
 * 1. Remove the access token from localStorage
 * 2. Dispatch an "auth:unauthorized" event that AuthContext listens for
 * 3. The AuthContext clears user state, which causes ProtectedRoute to
 *    redirect to /login — no more infinite loading on stale tokens.
 */

const AUTH_EVENT = 'auth:unauthorized'

function triggerLogout() {
  // Remove stale token so auth-context picks up the change
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_data')

  // Dispatch custom event so AuthContext can clear user state in-place
  // without a full page reload. ProtectedRoute then redirects to /login.
  window.dispatchEvent(new CustomEvent(AUTH_EVENT))
}

export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem('access_token')

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // If the server says we're unauthorized, clear the stale token and
  // notify the auth layer so the UI redirects instead of spinning forever.
  if (response.status === 401) {
    triggerLogout()
  }

  return response
}

/**
 * Convenience: same as apiFetch but also parses JSON body,
 * throwing an Error with the server message on non-ok responses.
 */
export async function apiFetchJson<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `Request failed (status: ${response.status})`)
  }

  return response.json() as Promise<T>
}

/**
 * Subscribe to unauthorized events — call this once in AuthContext.
 * Returns an unsubscribe function.
 */
export function onUnauthorized(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener(AUTH_EVENT, handler)
  return () => window.removeEventListener(AUTH_EVENT, handler)
}
