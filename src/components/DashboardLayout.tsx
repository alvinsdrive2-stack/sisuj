import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import DashboardSidebar from "./DashboardSidebar"
import DashboardNavbar from "./DashboardNavbar"
import { getRoleConfig } from "@/lib/rbac-config"
import { PulseLogo } from "@/components/ui/loading-spinner"
import bgImage from "@/assets/bg.webp"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [showContent, setShowContent] = useState(true)

  // Page transition on route change
  useEffect(() => {
    setIsPageLoading(true)
    setShowContent(false)

    const timer = setTimeout(() => {
      setIsPageLoading(false)
      setShowContent(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    if (!isLoading && user) {
      const userRole = user?.role?.name
      const roleConfiguration = userRole ? getRoleConfig(userRole) : null

      // Redirect to role-based default route if on root dashboard
      if (window.location.pathname === "/dashboard" && roleConfiguration) {
        navigate(roleConfiguration.defaultRoute, { replace: true })
      }
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <PulseLogo text="Memuat..." />
      </div>
    )
  }

  if (!user) {
    return null // Will be redirected by ProtectedRoute
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* DashboardNavbar - Fixed at top */}
      <DashboardNavbar userName={user?.name || "User"} />

      {/* Page Loading Overlay */}
      {isPageLoading && (
        <div className="page-loading-overlay">
          <PulseLogo text="Memuat..." />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className={`bg-white/90 dark:bg-slate-800/90 dark:text-slate-100 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 p-6 min-h-[calc(100vh-120px)] transition-all duration-300 ${showContent ? 'page-enter opacity-100' : 'opacity-0'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
