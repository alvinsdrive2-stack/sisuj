	import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface ValidatedNavigationRouteProps {
  children: React.ReactNode
}

/**
 * ValidatedNavigationRoute - Prevents direct URL access.
 * If env VITE_VALIDATED_NAVIGATION=1, direct URL typing → redirect to /login.
 */
const isEnabled = import.meta.env.VITE_VALIDATED_NAVIGATION === '1'

export default function ValidatedNavigationRoute({ children }: ValidatedNavigationRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isValid, setIsValid] = useState<boolean | null>(null)

  // Bypass if env var is 0
  useEffect(() => {
    if (!isEnabled) {
      setIsValid(true)
      return
    }
  }, [])

  useEffect(() => {
    // Only allow if navigated from within app (fromInternal state)
    if (location.state?.fromInternal) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [location])

  useEffect(() => {
    if (isValid === false) {
      navigate('/login', { replace: true })
    }
  }, [isValid, navigate])

  if (isValid === null) {
    return <FullPageLoader text="Memvalidasi akses..." />
  }

  if (isValid === false) {
    return null
  }

  return <>{children}</>
}

/**
 * Hook to mark a navigation as valid internal navigation
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
