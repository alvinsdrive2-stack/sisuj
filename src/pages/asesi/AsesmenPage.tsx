import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"

export default function AsesmenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to first step of asesmen
    if (user?.role?.name === 'asesor') {
      // For asesor, navigate to asesor asesmen (if different)
      navigate("/asesi/asesmen/ia04a", { replace: true })
    } else {
      navigate("/asesi/asesmen/ia04a", { replace: true })
    }
  }, [navigate, user])

  return null // This page just redirects
}
