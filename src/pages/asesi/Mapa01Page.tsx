import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import {
  Mapa01Header,
  Mapa01Section1,
  Mapa01Section2,
  Mapa01Section3,
  Mapa01TandaTangan
} from "@/components/mapa01"
import "@/components/mapa01/Mapa01.css"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

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
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const { kegiatan } = useKegiatanAsesi()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  // Use idIzin from URL when accessed by asesor, otherwise use from user context
  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { jabatanKerja, nomorSkema, tuk: _tuk } = useDataDokumenAsesmen(idIzin || "")
  const [mapaData, setMapaData] = useState<Mapa01Data | null>(null)
  const [actualIdIzin, setActualIdIzin] = useState<string | undefined>(idIzin)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params or fetch from list-asesi
        let fetchedIdIzin = idIzin

        // Skip fetching kegiatan/list-asesi when accessed by asesor
        // (asesor already has idIzin from URL)
        if (!fetchedIdIzin && !isAsesor && kegiatan?.jadwal_id) {
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

    // For asesor, fetch immediately when idIzin is available
    // For asesi, wait for kegiatan to be fetched
    if (isAsesor && idIzin) {
      fetchData()
    } else if (kegiatan) {
      fetchData()
    }
  }, [kegiatan, idIzin, isAsesor])

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

  const handleExportPdf = async () => {
    if (!contentRef.current) return

    setIsExportingPdf(true)

    // Add exporting class to hide indicators
    document.body.classList.add('exporting-pdf')

    try {
      const element = contentRef.current

      // Use html2canvas to capture the content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png', 1.0)

      // A4 size in mm
      const a4Width = 210
      const a4Height = 297

      // Calculate image dimensions
      const imgWidthMM = a4Width
      const imgHeightMM = (canvas.height * a4Width) / canvas.width

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // If content fits in one page
      if (imgHeightMM <= a4Height) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM)
      } else {
        // Split into multiple pages if content is too long
        const totalPages = Math.ceil(imgHeightMM / a4Height)

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage()

          const yPosition = -(i * a4Height)
          pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidthMM, imgHeightMM)
        }
      }

      // Save PDF
      const fileName = `MAPA01_${jabatanKerja?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)

      alert('PDF berhasil diunduh!')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Gagal mengunduh PDF. Silakan coba lagi.')
    } finally {
      // Remove exporting class
      document.body.classList.remove('exporting-pdf')
      setIsExportingPdf(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data MAPA 01..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px' }}>
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
        {/* A4 Size Indicator */}
        <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '12px', color: '#999' }}>
          📄 Ukuran Tampilan: A4 (210mm × 297mm) - Sesuai dengan PDF
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', background: '#f5f5f5' }}>
          <div className="mapa01-container">
            <div id="mapa01-content" ref={contentRef}>
          {/* STATIC: Header */}
          <Mapa01Header
            judul={jabatanKerja?.toUpperCase() || mapaData?.kelompok_kerja.nama_dokumen}
            nomor={nomorSkema?.toUpperCase() || mapaData?.kelompok_kerja.kode}
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
          </div>

          {/* Agreement Checklist */}
          <div style={{ background: '#fff', border: '1px solid #000', marginBottom: '20px', padding: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen MAPA 01 (Matriks Pengembangan dan Penilaian Asesmen) ini dengan sebenar-benarnya.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="mapa01-actions">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="mapa01-btn"
              style={{ opacity: isExportingPdf ? 0.5 : 1, cursor: isExportingPdf ? 'not-allowed' : 'pointer' }}
            >
              {isExportingPdf ? "Mengekspor..." : "Download PDF"}
            </button>
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
      </div>
      </AsesiLayout>
    </div>
  )
}
