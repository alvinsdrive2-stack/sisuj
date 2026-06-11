	import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { useAuth } from "@/contexts/auth-context"

interface ValidatedNavigationRouteProps {
  children: React.ReactNode
}

const STORAGE_KEY = 'validated_nav_internal'

// Dashboard paths per role
const DASHBOARD_PATHS: Record<string, string> = {
  'Asesi': '/asesi/dashboard',
  'Asesor': '/asesor/dashboard',
  'Komtek': '/komtek/tandatangan',
  'Direktur LSP': '/direktur/tandatangan',
  'Manajer Sertifikasi': '/manajer/dashboard',
  'Admin LSP': '/admin-lsp/dashboard',
  'Admin TUK': '/admin-tuk/dashboard',
}

export default function ValidatedNavigationRoute({ children }: ValidatedNavigationRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    const isInternal = sessionStorage.getItem(STORAGE_KEY) === '1'
    setIsValid(isInternal)
  }, [location])

  useEffect(() => {
    if (isValid === false) {
      const roleName = user?.role?.name || ''
      const dashboardPath = DASHBOARD_PATHS[roleName] || '/login'
      navigate(dashboardPath, { replace: true })
    }
  }, [isValid, navigate, user])

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
