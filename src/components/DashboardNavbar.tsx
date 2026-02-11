import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, LogOut, Bell, Menu, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { ThemeToggle } from "@/components/ThemeToggle"
import logo from "@/assets/logo.png"

interface DashboardNavbarProps {
  userName?: string
}

export default function DashboardNavbar({ userName = "User" }: DashboardNavbarProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Determine dashboard route based on role
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const dashboardRoute = isAsesor ? '/asesor/dashboard' : '/asesi/dashboard'

  const handleLogoClick = () => {
    navigate(dashboardRoute)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      navigate("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-md dark:border-slate-700 border-b border-primary/10 sticky top-0 z-50 h-16 overflow-hidden">
      <div className="w-full px-4 h-full mx-2">
        {/* Top Bar - Logo, Desktop Right Section, Mobile Toggle */}
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="w-36 h-36 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
              title={`Kembali ke Dashboard ${isAsesor ? 'Asesor' : 'Asesi'}`}
            >
              <img src={logo} alt="LSP Gatensi Logo" className="w-36 h-36 object-contain" />
            </button>
          </div>

          {/* Desktop: Right section */}
          <div className="hidden md:flex items-center gap-3">

            {/* Time Display */}
            <div className="flex items-center gap-2 px-2 py-2 border-primary/20 rounded-lg">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-base font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {currentTime.toLocaleDateString('id-ID', { day: '2-digit', weekday: 'long', month: 'long', year: 'numeric' })}
                {' | '}
                {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}:{String(currentTime.getSeconds()).padStart(2, '0')}
              </span>
            </div>

            {/* User Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Logout"
            >
              {isLoggingOut ? <SimpleSpinner size="sm" className="text-primary" /> : <LogOut className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile: Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex flex-col gap-3">
              {/* Time Display */}
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg">
                <Clock className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">
                  {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800">{userName}</p>
                    <p className="text-xs text-slate-500">Peserta</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 py-2 items-center">
                <ThemeToggle />
                <Button variant="outline" size="sm" className="flex-1 relative">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifikasi
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <div className="flex items-center justify-center gap-2">
                      <SimpleSpinner size="sm" className="text-primary" />
                    </div>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
