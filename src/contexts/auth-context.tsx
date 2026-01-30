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
    const token = authService.getToken()
    const userData = authService.getUserData()

    console.log("=== AUTH CONTEXT MOUNT ===")
    console.log("Token:", token)
    console.log("UserData from localStorage:", userData)
    console.log("===========================")

    if (token && userData) {
      setUser(userData)
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest): Promise<CurrentUser> => {
    const response = await authService.login(credentials)

    console.log("=== LOGIN RESPONSE ===")
    console.log("Full response:", response)
    console.log("======================")

    // Simpan token dulu
    authService.saveToken(response.data.access_token)

    // Fetch full user data dari /auth/me
    try {
      const userData = await authService.getCurrentUser()
      console.log("=== USER DATA FROM /auth/me ===")
      console.log("UserData:", userData)
      console.log("==========================")

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
