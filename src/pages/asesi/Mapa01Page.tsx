import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import {
  Mapa01Header,
  Mapa01Section1,
  Mapa01Section2,
  Mapa01Section3,
  Mapa01TandaTangan
} from "@/components/mapa01"
import "@/components/mapa01/Mapa01.css"

interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
}

interface KelompokKerja {
  id: number
  nama: string
  urut: string
  units: Unit[]
}

interface Mapa01Data {
  kelompok_kerja: {
    id: number
    kode: string
    nama_dokumen: string
    kelompok_kerja: KelompokKerja[]
  }
}

interface ApiResponse {
  message: string
  data: Mapa01Data
}

export default function Mapa01Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin } = useParams<{ idIzin: string }>()
  const [mapaData, setMapaData] = useState<Mapa01Data | null>(null)
  const [actualIdIzin, setActualIdIzin] = useState<string | undefined>(idIzin)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params or fetch from list-asesi
        let fetchedIdIzin = idIzin

        if (!fetchedIdIzin && kegiatan?.jadwal_id) {
          const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })

          if (listAsesiResponse.ok) {
            const listResult = await listAsesiResponse.json()
            if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
              fetchedIdIzin = listResult.list_asesi[0].id_izin
              setActualIdIzin(fetchedIdIzin)
            }
          }
        }

        if (!fetchedIdIzin) {
          console.error("No id_izin found")
          setIsLoading(false)
          return
        }

        setActualIdIzin(fetchedIdIzin)

        // Fetch MAPA 01 data
        const mapa01Response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/mapa01`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (mapa01Response.ok) {
          const result: ApiResponse = await mapa01Response.json()
          if (result.message === "Success") {
            setMapaData(result.data)
          }
        } else {
          console.warn(`MAPA01 API returned ${mapa01Response.status} - Section 2 will be hidden`)
        }
      } catch (error) {
        console.error("Error fetching MAPA 01:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (kegiatan) {
      fetchData()
    }
  }, [kegiatan, idIzin])

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      alert("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    // TODO: Implement actual save logic with API
    setTimeout(() => {
      setIsSaving(false)
      navigate(`/asesi/praasesmen/${actualIdIzin}/mapa02`)
    }, 500)
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <DashboardNavbar userName={user?.name} />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div style={{ color: '#666' }}>
              <SimpleSpinner size="lg" className="mx-auto mb-4" />
            </div>
            <p style={{ color: '#666' }}>Memuat data MAPA 01...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span>FR MAPA 01</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={4}>
        <div className="mapa01-container">
          {/* STATIC: Header */}
          <Mapa01Header
            judul={mapaData?.kelompok_kerja.nama_dokumen}
            nomor={mapaData?.kelompok_kerja.kode}
          />

          {/* STATIC: Section 1 - Pendekatan Asesmen */}
          <Mapa01Section1 />

          {/* DYNAMIC/LOOPING: Section 2 - Kelompok Pekerjaan dari API */}
          {mapaData && (
            <Mapa01Section2 kelompokKerja={mapaData.kelompok_kerja.kelompok_kerja} />
          )}

          {/* STATIC: Section 3 - Modifikasi */}
          <Mapa01Section3 />

          {/* STATIC: Tanda Tangan */}
          <Mapa01TandaTangan />

          {/* Agreement Checklist */}
          <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreedChecklist}
                onChange={(e) => setAgreedChecklist(e.target.checked)}
                style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen MAPA 01 (Matriks Pengembangan dan Penilaian Asesmen) ini dengan sebenar-benarnya.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="mapa01-actions">
            <button
              onClick={handleBack}
              disabled={isSaving}
              className="mapa01-btn"
            >
              Kembali
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !agreedChecklist}
              className="mapa01-btn mapa01-btn-primary"
              style={{ opacity: isSaving || !agreedChecklist ? 0.5 : 1, cursor: isSaving || !agreedChecklist ? 'not-allowed' : 'pointer' }}
            >
              {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
            </button>
          </div>
        </div>
      </AsesiLayout>
    </div>
  )
}
