import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { getRoleConfig } from "@/lib/rbac-config"

export default function DefaultRoute() {
  const { user, isLoading } = useAuth()

  // While checking auth status, show nothing
  if (isLoading) {
    return null
  }

  // If user is authenticated, redirect to their role's default route
  if (user) {
    const userRole = user.role?.name
    if (userRole) {
      const roleConfig = getRoleConfig(userRole)
      if (roleConfig) {
        return <Navigate to={roleConfig.defaultRoute} replace />
      }
    }
    // Fallback to dashboard if role config not found
    return <Navigate to="/dashboard" replace />
  }

  // If not authenticated, redirect to login
  return <Navigate to="/login" replace />
}
