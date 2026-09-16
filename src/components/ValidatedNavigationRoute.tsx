	import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { useAuth } from "@/contexts/auth-context"
import { resolveUserRole } from "@/lib/rbac-config"

interface ValidatedNavigationRouteProps {
  children: React.ReactNode
}

const STORAGE_KEY = 'validated_nav_path'

/**
 * Grant lintas-tab untuk navigasi internal yang dibuka di TAB BARU.
 *
 * Kenapa perlu: anchor `target="_blank"` + `rel="noopener noreferrer"`
 * (mis. tombol "Revisi Jawaban" di /admin-lsp/revisi-muk) membuka tab dengan
 * sessionStorage KOSONG — `noopener` memutus browsing-context group sehingga
 * browser tidak meng-clone sessionStorage tab pembuka, dan path yang ditulis
 * `NavigationTracker` tersimpan di sessionStorage TAB PEMBUKA, bukan tab baru.
 * Akibatnya `sessionStorage.validated_nav_path` kosong di tab baru → guard
 * menganggapnya "akses manual" → redirect ke dashboard peran (kasus
 * /admin-lsp/revisi-muk → /admin-lsp/dashboard).
 *
 * Grant ditulis ke localStorage (dibagi semua tab satu origin) hanya saat klik
 * pada link `target=_blank`, berlaku singkat, dan sekali pakai. Manual URL typing
 * & back/forward tetap tidak punya grant → tetap diblokir seperti sebelumnya.
 */
const GRANT_KEY = 'validated_nav_grant'
const GRANT_TTL_MS = 10_000

/** Ditulis NavigationTracker saat user klik link internal yang buka tab baru. */
export function grantNavPath(path: string) {
  try {
    localStorage.setItem(GRANT_KEY, JSON.stringify({ path, ts: Date.now() }))
  } catch {
    /* localStorage bisa diblokir (mode privat) — guard tetap jalan via sessionStorage */
  }
}

/** Konsumsi grant sekali pakai; true bila path cocok & belum kedaluwarsa. */
export function consumeNavGrant(path: string): boolean {
  try {
    const raw = localStorage.getItem(GRANT_KEY)
    if (!raw) return false
    const g = JSON.parse(raw) as { path?: string; ts?: number }
    if (!g || g.path !== path || typeof g.ts !== 'number') return false
    if (Date.now() - g.ts > GRANT_TTL_MS) return false
    localStorage.removeItem(GRANT_KEY)
    return true
  } catch {
    return false
  }
}

// Master switch: "1" = block manual URL/back-forward, anything else = off
const NAV_GUARD_ENABLED = import.meta.env.VITE_VALIDATED_NAVIGATION === '1'

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
    if (!NAV_GUARD_ENABLED) {
      setIsValid(true)
      return
    }
    // Path-based check: internal nav stores the exact target path.
    // Manual URL typing or back/forward breaks the match.
    // Tab baru dari link target=_blank: sessionStorage-nya kosong (lihat
    // grantNavPath) → terima bila ada grant sekali pakai yang cocok.
    const expectedPath = sessionStorage.getItem(STORAGE_KEY)
    const viaSession = !!expectedPath && expectedPath === location.pathname
    setIsValid(viaSession || consumeNavGrant(location.pathname))
  }, [location])

  useEffect(() => {
    if (isValid === false) {
      const userRole = resolveUserRole(user?.role) || ''
      const dashboardPath = DASHBOARD_PATHS[userRole] || '/login'
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
