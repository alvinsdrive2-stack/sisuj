import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { Permission, getRoleConfig } from "@/lib/rbac-config"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requiredRoles?: string[]
  requireAll?: boolean // If true, user needs ALL permissions. If false, needs ANY
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <FullPageLoader text="Memuat..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRoles.length > 0 && user?.role?.name) {
    const userRoleName = user.role.name
    if (!requiredRoles.includes(userRoleName)) {
      return <AccessDenied />
    }
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 && user) {
    const userRoleName = user.role?.name
    const roleConfiguration = userRoleName ? getRoleConfig(userRoleName) : null

    // Use role permissions from config instead of API (since API returns empty)
    const userPermissions: Permission[] = roleConfiguration?.permissions || []

    const hasAccess = requireAll
      ? requiredPermissions.every(p => userPermissions.includes(p))
      : requiredPermissions.some(p => userPermissions.includes(p))

    if (!hasAccess) {
      return <AccessDenied />
    }
  }

  return <>{children}</>
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
        <p className="text-slate-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}
