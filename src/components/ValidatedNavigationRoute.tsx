import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface ValidatedNavigationRouteProps {
  children: React.ReactNode
}

/**
 * ValidatedNavigationRoute - Prevents direct URL access / brute force attacks.
 * Only allows navigation from within the app (valid referrer or navigation state).
 * Redirects to user's dashboard if accessed directly.
 */
export default function ValidatedNavigationRoute({ children }: ValidatedNavigationRouteProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Check 1: Navigation state exists (internal navigate)
    if (location.state?.fromInternal) {
      setIsValid(true)
      return
    }

    // Check 2: Valid referrer (same origin)
    const referrer = document.referrer
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer)
        const currentOrigin = window.location.origin
        if (referrerUrl.origin === currentOrigin) {
          setIsValid(true)
          return
        }
      } catch {
        // Invalid URL, treat as direct access
      }
    }

    // Check 3: Session storage flag (set on dashboard entry)
    const hasValidSession = sessionStorage.getItem('validNavigationEntry')
    if (hasValidSession === 'true') {
      setIsValid(true)
      return
    }

    // Direct access detected - redirect to dashboard
    setIsValid(false)
  }, [location])

  useEffect(() => {
    if (isValid === false) {
      const role = user?.role?.name
      const fallbackPath: Record<string, string> = {
        "Asesor": "/asesor/dashboard",
        "Asesi": "/asesi/dashboard",
        "Admin LSP": "/admin-lsp/dashboard",
        "Direktur LSP": "/direktur/tandatangan",
        "Manajer Sertifikasi": "/manajer/dashboard",
        "Admin TUK": "/admin-tuk/dashboard",
        "Komtek": "/komtek/tandatangan",
      }

      const defaultPath = role && fallbackPath[role] ? fallbackPath[role] : "/asesi/dashboard"
      navigate(defaultPath, { replace: true })
    }
  }, [isValid, user, navigate])

  if (isValid === null) {
    return <FullPageLoader text="Memvalidasi akses..." />
  }

  if (isValid === false) {
    return null // Will redirect
  }

  return <>{children}</>
}

/**
 * Hook to mark a navigation as valid internal navigation
 * Use this when navigating to protected routes
 */
export function useValidNavigate() {
  const navigate = useNavigate()

  return (to: string, options?: any) => {
    navigate(to, {
      ...options,
      state: { ...options?.state, fromInternal: true }
    })
  }
}
