import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authService, LoginRequest, CurrentUser } from "@/lib/auth-service"

export type { CurrentUser }

interface AuthContextType {
  user: CurrentUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<CurrentUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cek auth status saat mount
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()

      if (token) {
        try {
          // Fetch fresh user data from API to get latest fields (including noreg)
          const userData = await authService.getCurrentUser()
          authService.saveUserData(userData)
          setUser(userData)
        } catch (error) {
          console.error('[AuthContext] Failed to fetch user data:', error)
          // Fallback to localStorage if API fails
          const cachedUserData = authService.getUserData()
          if (cachedUserData) {
            setUser(cachedUserData)
          }
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<CurrentUser> => {
    const response = await authService.login(credentials)

    // Simpan token dulu
    authService.saveToken(response.data.access_token)

    // Fetch full user data dari /auth/me
    try {
      const userData = await authService.getCurrentUser()

      authService.saveUserData(userData)
      setUser(userData)
      return userData // Return user data for immediate use
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logoutFromApi()
    } catch (error) {
      // Ignore API error and still clear local state
      console.error("Logout API error:", error)
    } finally {
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      authService.saveUserData(userData)
    } catch (error) {
      // If failed to get current user, clear token and user state
      authService.logout()
      setUser(null)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
