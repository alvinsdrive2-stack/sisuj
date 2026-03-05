import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { FullPageLoader } from "@/components/ui/loading-spinner"

export default function AsesmenPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { kegiatan, isLoading: kegiatanLoading } = useKegiatanByRole()

  useEffect(() => {
    // Wait for auth and kegiatan data to load
    if (authLoading || kegiatanLoading) {
      return
    }

    if (!user || !kegiatan) {
      console.error("No user or kegiatan data")
      return
    }

    // Check jenjang_id to determine which flow to use
    const jenjangId = parseInt(kegiatan.jenjang_id || "0")
    const isFirstStep = kegiatan.is_started === "0"

    // For jenjang < 4, start at IA01
    // For jenjang >= 4, start at IA04A
    if (jenjangId < 4) {
      navigate("/asesi/asesmen/ia01", { replace: true })
    } else {
      navigate("/asesi/asesmen/ia04a", { replace: true })
    }
  }, [navigate, user, kegiatan, authLoading, kegiatanLoading])

  // Show loader while checking jenjang_id
  if (authLoading || kegiatanLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <FullPageLoader text="Memuat asesmen..." />
      </div>
    )
  }

  return null // This page just redirects
}
