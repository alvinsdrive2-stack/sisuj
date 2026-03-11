import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"
import {
  Mapa01Header,
  Mapa01Section1,
  Mapa01Section2,
  Mapa01Section3,
  Mapa01TandaTangan
} from "@/components/mapa01"
// import { uploadMapa01PdfToBackend } from "@/utils/mapa01PdfGenerator" // Commented: not currently used
import "@/components/mapa01/Mapa01.css"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { WebcamModal } from "@/components/ui/WebcamModal"

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

interface Referensi {
  id: number
  nama: string
  value: boolean
}

interface Subkategori {
  id: number | null
  nama: string
  urut: number | null
  referensis: Referensi[]
}

interface Kategori {
  id: number | null
  kategori: string | null
  nama: string
  urut: number | null
  id_kelompok: number | null
  subkategoris: Subkategori[]
}

interface KelompokForm {
  id: number
  nama: string | null
  urut: number
  kategoris: Kategori[]
}

interface ReferensiFormItem {
  kelompok: KelompokForm
}

interface Mapa01Data {
  kelompok_kerja: {
    id: number
    kode: string
    nama_dokumen: string
    kelompok_kerja: KelompokKerja[]
  }
  referensi_form: ReferensiFormItem[]
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
  const { jabatanKerja, nomorSkema, tuk: _tuk, namaPenyusun, namaValidator, tanggalPenyusun, tanggalValidator, barcodePenyusun, barcodeValidator, noregPenyusun, noregValidator, asesorList } = useDataDokumenPraAsesmen(idIzin || "")
  const { showSuccess, showWarning } = useToast()
  const [mapaData, setMapaData] = useState<Mapa01Data | null>(null)
  const [actualIdIzin, setActualIdIzin] = useState<string | undefined>(idIzin)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'praasesmen',
    role: 'auto',
    checkOnMount: true, // Enable for both asesi and asesor
    idIzin: idIzin,
    asesorList: asesorList
  })

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

  // NOTE: handleUploadPdf is commented out because it's not currently used
  // but kept for future reference when PDF upload functionality is needed
  /*
  const handleUploadPdf = async () => {
    if (!actualIdIzin) {
      showWarning("ID Izin tidak ditemukan")
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      const result = await uploadMapa01PdfToBackend(
        jabatanKerja?.toUpperCase() || mapaData?.kelompok_kerja?.nama_dokumen || '',
        nomorSkema?.toUpperCase() || mapaData?.kelompok_kerja?.kode || '',
        mapaData,
        `https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/mapa01/upload`,
        token || '',
        {
          idIzin: actualIdIzin,
          fileName: `mapa01_${actualIdIzin}.pdf`
        }
      )

      if (result.success) {
        showSuccess(result.message)
      } else {
        showWarning(result.message)
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      showWarning('Gagal upload PDF')
    } finally {
      setIsSaving(false)
    }
  }
  */

  const handleSave = async () => {
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    // TODO: Implement actual save logic with API
    setTimeout(() => {
      setIsSaving(false)
      showSuccess('MAPA 01 berhasil disimpan!')
      setTimeout(() => {
        navigate(`/asesi/praasesmen/${actualIdIzin}/mapa02`)
      }, 500)
    }, 500)
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data MAPA 01..." />
  }

  return (
    <div style={{ minHeight: '100vh'}}>
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

      <AsesiLayout currentStep={4} idIzin={actualIdIzin}>
        {/* A4 Size Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px'}}>
          <div className="mapa01-container">
            <div id="mapa01-content" ref={contentRef}>
          {/* STATIC: Header */}
          <Mapa01Header
            judul={jabatanKerja?.toUpperCase() || mapaData?.kelompok_kerja.nama_dokumen}
            nomor={nomorSkema?.toUpperCase() || mapaData?.kelompok_kerja.kode}
          />

          {/* STATIC: Section 1 - Pendekatan Asesmen */}
          <Mapa01Section1 referensiForm={mapaData?.referensi_form} isAsesor={isAsesor} />

          {/* DYNAMIC/LOOPING: Section 2 - Kelompok Pekerjaan dari API */}
          {mapaData && (
            <Mapa01Section2 kelompokKerja={mapaData.kelompok_kerja.kelompok_kerja} />
          )}

          {/* STATIC: Section 3 - Modifikasi */}
          <Mapa01Section3 referensiForm={mapaData?.referensi_form} isAsesor={isAsesor} />

          {/* STATIC: Tanda Tangan */}
          <Mapa01TandaTangan
            namaPenyusun={namaPenyusun}
            namaValidator={namaValidator}
            tanggalPenyusun={tanggalPenyusun}
            tanggalValidator={tanggalValidator}
            barcodePenyusun={barcodePenyusun}
            barcodeValidator={barcodeValidator}
            noregPenyusun={noregPenyusun}
            noregValidator={noregValidator}
            referensiForm={mapaData?.referensi_form}
            isAsesor={isAsesor}
          />
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

            <ActionButton variant="secondary" onClick={handleBack} disabled={isSaving}>
              Kembali
            </ActionButton>
            
            <ActionButton variant="primary" disabled={isSaving || !agreedChecklist} onClick={handleSave}>
              {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
            </ActionButton>
          </div>
        </div>
      </div>
      </AsesiLayout>

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Pra-Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />
    </div>
  )
}
