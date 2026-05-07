import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"
import { AsesorSignatureGuard } from "@/components/AsesorSignatureGuard"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { API_BASE_URL } from "@/config/api"

interface BarcodeData {
  url: string
  tanggal: string
  nama: string
}

interface PortfolioItem {
  id: number
  dokumen: string
  valid_ya: boolean
  valid_tidak: boolean
  asli_ya: boolean
  asli_tidak: boolean
  terkini_ya: boolean
  terkini_tidak: boolean
  memadai_ya: boolean
  memadai_tidak: boolean
}

interface WawancaraItem {
  id: number
  unit_kompetensi: string
  no_elemen: number
  materi: string
  checked: boolean
}

interface Ia08Referensi {
  id: number
  nama: string
  id_kelompok: number
  id_kategori: number | null
  id_subkategori: number | null
  kategori_rel: { id: number; nama: string; no: string } | null
  kelompok_rel: { id: number; kategori: string; no: string; urut: number; nama: string | null }
  subkategori_rel: { id: number; nama: string; no: string } | null
}


export default function Ia08Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { kegiatan: _kegiatan, isAsesor } = useKegiatanByRole()
  const { isAsesor1 } = useAsesorRole(id)

  const asesmenSteps = getAsesmenSteps(jenjang, isAsesor, undefined, asesorList.length, metode)

  const {
    showAwalModal,
    submitAbsenAwal,
    handleAwalModalClose,
  } = useAbsenCheck({
    phase: 'asesmen',
    role: 'auto',
    checkOnMount: true,
    idIzin: id,
    asesorList
  })

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    { id: 1, dokumen: 'Data yang diupload di APL 2 otomatis terhubung', valid_ya: false, valid_tidak: false, asli_ya: false, asli_tidak: false, terkini_ya: false, terkini_tidak: false, memadai_ya: false, memadai_tidak: false },
    { id: 2, dokumen: 'Contoh: Ijazah', valid_ya: false, valid_tidak: false, asli_ya: false, asli_tidak: false, terkini_ya: false, terkini_tidak: false, memadai_ya: false, memadai_tidak: false },
    { id: 3, dokumen: 'Contoh: Referensi Kerja', valid_ya: false, valid_tidak: false, asli_ya: false, asli_tidak: false, terkini_ya: false, terkini_tidak: false, memadai_ya: false, memadai_tidak: false },
  ])

  const [wawancaraItems, setWawancaraItems] = useState<WawancaraItem[]>([
    { id: 1, unit_kompetensi: 'F.41BPC00.001.2', no_elemen: 1, materi: 'Ketentuan terkait tugas perencanaan', checked: false },
    { id: 2, unit_kompetensi: 'F.41BPC00.002.2', no_elemen: 2, materi: 'Lokasi kerja dan gambar rencana', checked: false },
    { id: 3, unit_kompetensi: 'F.41BPC00.003.2', no_elemen: 3, materi: 'Detail sambungan rencana', checked: false },
    { id: 4, unit_kompetensi: 'F.41BPC00.004.2', no_elemen: 2, materi: 'Produktivitas kerja', checked: false },
    { id: 5, unit_kompetensi: 'F.41BPC00.005.2', no_elemen: 5, materi: 'Spesifikasi teknis mutu', checked: false },
  ])

  const [buktiTambahan, setBuktiTambahan] = useState('')
  const [rekomendasiKompeten, setRekomendasiKompeten] = useState<boolean | null>(null)
  const [rekomendasiUnit, setRekomendasiUnit] = useState('')
  const [rekomendasiElemen, setRekomendasiElemen] = useState('')
  const [rekomendasiKuk, setRekomendasiKuk] = useState('')
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData | null
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  } | null>(null)
  const [_ia08Referensi, setIa08Referensi] = useState<Ia08Referensi[]>([])
  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Extractable fetch function — called on mount and by SSE events
  const fetchIa08Data = useCallback(async () => {
    if (!id || authLoading) return

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia08`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.message === "Success" && result.data) {
          // Map soal.1 (referensi) to portfolio items
          if (result.data.soal?.["1"]) {
            const referensiItems = result.data.soal["1"].map((item: any, index: number) => ({
              id: item.id || index + 1,
              dokumen: item.soal || "-",
              valid_ya: false,
              valid_tidak: false,
              asli_ya: false,
              asli_tidak: false,
              terkini_ya: false,
              terkini_tidak: false,
              memadai_ya: false,
              memadai_tidak: false,
            }))
            setPortfolioItems(referensiItems)
          }

          // Map soal.2 (unit/kuk) to wawancara items
          if (result.data.soal?.["2"]) {
            const wawancaraData = result.data.soal["2"].map((item: any, index: number) => ({
              id: item.id || index + 1,
              unit_kompetensi: item.unit?.kode || "-",
              no_elemen: parseInt(item.no) || index + 1,
              materi: item.subunit?.nama || "-",
              checked: false,
            }))
            setWawancaraItems(wawancaraData)
          }

          // Set bukti tambahan from soal.3 if exists
          if (result.data.soal?.["3"] && result.data.soal["3"][0]) {
            setBuktiTambahan(result.data.soal["3"][0].soal || "")
          }

          // Set barcodes if exists
          if (result.data.barcodes) {
            setBarcodes({
              asesi: result.data.barcodes.asesi,
              asesor1: result.data.barcodes.asesor1,
              asesor2: result.data.barcodes.asesor2,
            })
          }

          // Set referensi
          if (result.data.referensi) {
            setIa08Referensi(result.data.referensi)
          }

          // Store dokumen_id for POST
          if (result.data.dokumen_id) {
            setDokumenId(result.data.dokumen_id)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching IA08:", err)
    } finally {
      setIsLoading(false)
    }
  }, [id, authLoading])

  // Initial fetch
  useEffect(() => {
    fetchIa08Data()
  }, [fetchIa08Data])

  const { publishUpdate } = useRealtimeSync({
    channelName: `asesmen:${id}`,
    onUpdate: fetchIa08Data
  })

  const asesiHasSigned = !!barcodes?.asesi?.url
  const asesorHasSigned = (() => {
    if (!isAsesor) return false
    const idx = asesorList.findIndex(a => String(a.id) === String(user?.id))
    return (idx === 0 || idx === -1) ? !!barcodes?.asesor1?.url : !!barcodes?.asesor2?.url
  })()
  const hasSigned = isAsesor ? asesorHasSigned : asesiHasSigned
  const allSigned = asesiHasSigned && (asesorList.length === 0 || (
    !!barcodes?.asesor1?.url && (asesorList.length < 2 || !!barcodes?.asesor2?.url)
  ))
  const asesor1Signed = !!barcodes?.asesor1?.url
  const asesor2Signed = !!barcodes?.asesor2?.url
  const allAsesorSigned = isAsesor || asesorList.length === 0 || (asesor1Signed && (asesorList.length < 2 || asesor2Signed))
  const missingAsesorLabels = asesorList.length === 0 ? [] : [
    !asesor1Signed && "Asesor 1",
    asesorList.length >= 2 && !asesor2Signed && "Asesor 2",
  ].filter(Boolean) as string[]

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

  const isFormDisabled = !isAsesor || allSigned

  const handlePortfolioCheck = (id: number, field: keyof PortfolioItem) => {
    if (isFormDisabled) return
    setPortfolioItems(prev => prev.map(item => {
      if (item.id === id) {
        const fieldName = field as keyof Omit<PortfolioItem, 'id' | 'dokumen'>
        const oppositeField = (fieldName.endsWith('_ya') ? fieldName.replace('_ya', '_tidak') : fieldName.replace('_tidak', '_ya')) as keyof PortfolioItem

        // If clicking the same checkbox that's already checked, uncheck it
        if (item[fieldName]) {
          return { ...item, [fieldName]: false }
        }

        // Check this one, uncheck the opposite
        return { ...item, [fieldName]: true, [oppositeField]: false }
      }
      return item
    }))
  }

  const handleWawancaraCheck = (id: number) => {
    if (isFormDisabled) return
    setWawancaraItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const handleSave = async () => {
    if (hasSigned) {
      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ia08'))
      const nextStep = asesmenSteps[currentStepIndex + 1]
      if (nextStep) {
        const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
        navigate(nextPath)
      } else {
        navigate(`/asesi/asesmen/${id}/selesai`)
      }
      return
    }

    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan terlebih dahulu")
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")

      const payload = {
        dokumen_id: dokumenId,
        apl2_answers: portfolioItems.map(item => ({
          soal_id: item.id,
          valid: item.valid_ya,
          asli: item.asli_ya,
          terkini: item.terkini_ya,
          memadai: item.memadai_ya,
        })),
        unit_answers: wawancaraItems.map(item => ({
          soal_id: item.id,
          is_checked: item.checked,
        })),
        bukti_tambahan: buktiTambahan,
        is_kompeten: rekomendasiKompeten,
        rekomendasi_unit: rekomendasiUnit,
        rekomendasi_elemen: rekomendasiElemen,
        rekomendasi_kuk: rekomendasiKuk,
      }

      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia08`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showSuccess('IA 08 berhasil disimpan!')
        publishUpdate()

        // Generate QR for asesor
        if (isAsesor && jadwalId) {
          const existingAsesorQR = isAsesor1 ? barcodes?.asesor1?.url : barcodes?.asesor2?.url
          if (!existingAsesorQR) {
            try {
              const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ia08`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id_jadwal: jadwalId })
              })
              if (qrResponse.ok) {
                const qrResult = await qrResponse.json()
                if (qrResult.message === "Success" && qrResult.data?.url_image) {
                  if (isAsesor1) {
                    setBarcodes(prev => ({ ...prev, asesor1: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || '' } }))
                  } else {
                    setBarcodes(prev => ({ ...prev, asesor2: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || '' } }))
                  }
                }
              }
            } catch (qrError) {
              console.error('Error generating QR:', qrError)
            }
          }
        }

        // Generate QR for asesi
        if (jadwalId && !barcodes?.asesi?.url) {
          try {
            const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ia08`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ id_jadwal: jadwalId })
            })
            if (qrResponse.ok) {
              const qrResult = await qrResponse.json()
              if (qrResult.message === "Success" && qrResult.data?.url_image) {
                setBarcodes(prev => ({ ...prev, asesi: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: namaAsesi || '' } }))
              }
            }
          } catch (qrError) {
            console.error('Error generating asesi QR:', qrError)
          }
        }
      } else {
        showError('Gagal menyimpan IA 08')
      }
    } catch (err) {
      console.error('Error saving IA08:', err)
      showError('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data IA.08..." />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(isAsesor ? "/asesor/dashboard" : "/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>IA.08</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ia08'))?.number || 1} steps={asesmenSteps} id={id}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
            FR.IA.08. CEKLIS VERIFIKASI PORTOFOLIO
          </h1>
        </div>

        {/* Identitas Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>
                Skema Sertifikasi<br /><span style={{ fontSize: '12px' }}>(KKNI/Okupasi/Klaster)</span>
              </td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{tuk || '-'}</td>
            </tr>
            {asesorList.length > 1 ? (
              <>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor 1</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor 2</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[1]?.nama?.toUpperCase() || ''}{asesorList[1]?.noreg && ` (${asesorList[1].noreg})`}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}</td>
              </tr>
            )}
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{tanggalUji ? new Date(tanggalUji).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '12px', marginBottom: '15px' }}>*Coret yang tidak perlu</div>

        {/* Panduan Bagi Asesor */}
        <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
          <div style={{ background: '#c40000', color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
            PANDUAN BAGI ASESOR
          </div>
          <div style={{ padding: '10px', fontSize: '12px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Verifikasi portofolio dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.</li>
              <li>Isilah bukti portofolio sesuai ketentuan bukti berkualitas dan relevan dengan standar kompetensi kerja.</li>
              <li>Lakukan verifikasi portofolio berdasarkan aturan bukti.</li>
              <li>Berikan hasil verifikasi portofolio dengan memberi centang (√).</li>
              <li>Jika belum memenuhi aturan bukti maka lanjutkan wawancara.</li>
            </ul>
          </div>
        </div>

        {/* Dokumen Portofolio Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td rowSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Dokumen Portofolio</td>
              <td colSpan={8} style={{ border: '1px solid #000', padding: '6px' }}>Aturan Bukti</td>
            </tr>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Valid</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Asli</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Terkini</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Memadai</td>
            </tr>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
            </tr>
            {portfolioItems.map((item) => (
              <tr key={item.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{item.dokumen}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.valid_ya} onChange={() => handlePortfolioCheck(item.id, 'valid_ya')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.valid_tidak} onChange={() => handlePortfolioCheck(item.id, 'valid_tidak')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.asli_ya} onChange={() => handlePortfolioCheck(item.id, 'asli_ya')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.asli_tidak} onChange={() => handlePortfolioCheck(item.id, 'asli_tidak')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.terkini_ya} onChange={() => handlePortfolioCheck(item.id, 'terkini_ya')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.terkini_tidak} onChange={() => handlePortfolioCheck(item.id, 'terkini_tidak')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.memadai_ya} onChange={() => handlePortfolioCheck(item.id, 'memadai_ya')} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.memadai_tidak} onChange={() => handlePortfolioCheck(item.id, 'memadai_tidak')} disabled={isFormDisabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cek List Wawancara Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ border: '1px solid #000', padding: '6px', width: '5%' }}>Cek List</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '25%' }}>No. Unit Kompetensi</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>No. Elemen</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Materi/Substansi Wawancara</td>
            </tr>
            {wawancaraItems.map((item) => (
              <tr key={item.id}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <CustomCheckbox checked={item.checked} onChange={() => handleWawancaraCheck(item.id)} disabled={isFormDisabled} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{item.unit_kompetensi}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.no_elemen}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{item.materi}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bukti Tambahan */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}><b>Bukti tambahan diperlukan pada unit / elemen kompetensi</b></td>
            </tr>
            <tr>
              <td style={{ height: '80px', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                <b>Sebagai berikut : Contoh</b>
                <textarea
                  value={buktiTambahan}
                  onChange={(e) => setBuktiTambahan(e.target.value)}
                  disabled={isFormDisabled}
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    border: '1px solid #ccc',
                    padding: '6px',
                    fontSize: '12px',
                    resize: 'vertical',
                    cursor: isFormDisabled ? 'not-allowed' : 'text',
                    marginTop: '6px'
                  }}
                  placeholder="Isi bukti tambahan..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Rekomendasi */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ background: '#c40000', color: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Rekomendasi Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px', width: '80%' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}>
                  <CustomCheckbox
                    checked={rekomendasiKompeten === true}
                    onChange={() => setRekomendasiKompeten(rekomendasiKompeten === true ? null : true)}
                    disabled={isFormDisabled}
                    style={{ marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '12px' }}>Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <b>KOMPETEN</b></span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}>
                  <CustomCheckbox
                    checked={rekomendasiKompeten === false}
                    onChange={() => setRekomendasiKompeten(rekomendasiKompeten === false ? null : false)}
                    disabled={isFormDisabled}
                    style={{ marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '12px' }}>Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan uji demonstrasi pada:</span>
                </label>
                {rekomendasiKompeten === false && (
                  <div style={{ marginLeft: '24px', marginTop: '10px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>Unit :</label>
                      <input
                        type="text"
                        value={rekomendasiUnit}
                        onChange={(e) => setRekomendasiUnit(e.target.value)}
                        disabled={isFormDisabled}
                        style={{
                          width: '100%',
                          border: '1px solid #ccc',
                          padding: '4px',
                          fontSize: '12px',
                          cursor: isFormDisabled ? 'not-allowed' : 'text'
                        }}
                        placeholder="Isi unit..."
                      />
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>Elemen :</label>
                      <input
                        type="text"
                        value={rekomendasiElemen}
                        onChange={(e) => setRekomendasiElemen(e.target.value)}
                        disabled={isFormDisabled}
                        style={{
                          width: '100%',
                          border: '1px solid #ccc',
                          padding: '4px',
                          fontSize: '12px',
                          cursor: isFormDisabled ? 'not-allowed' : 'text'
                        }}
                        placeholder="Isi elemen..."
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>KUK :</label>
                      <input
                        type="text"
                        value={rekomendasiKuk}
                        onChange={(e) => setRekomendasiKuk(e.target.value)}
                        disabled={isFormDisabled}
                        style={{
                          width: '100%',
                          border: '1px solid #ccc',
                          padding: '4px',
                          fontSize: '12px',
                          cursor: isFormDisabled ? 'not-allowed' : 'text'
                        }}
                        placeholder="Isi KUK..."
                      />
                    </div>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature Tables */}
        {/* Asesi */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}><b>Asesi</b></td>
            </tr>
            <tr>
              <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesi.url} alt="Tanda Tangan Asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {barcodes.asesi.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {new Date(barcodes.asesi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Asesor 1 */}
        {asesorList.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
            <tbody>
              <tr>
                <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}><b>Asesor {asesorList.length > 1 ? '1' : ''}</b></td>
              </tr>
              <tr>
                <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.noreg || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                  {barcodes?.asesor1?.url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <img src={barcodes.asesor1.url} alt={`Tanda Tangan ${asesorList[0]?.nama}`} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                      {barcodes.asesor1.tanggal && (
                        <div style={{ fontSize: '11px', color: '#333' }}>
                          {new Date(barcodes.asesor1.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Asesor 2 */}
        {asesorList.length > 1 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
            <tbody>
              <tr>
                <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}><b>Asesor 2</b></td>
              </tr>
              <tr>
                <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[1]?.nama?.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[1]?.noreg || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                  {barcodes?.asesor2?.url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <img src={barcodes.asesor2.url} alt={`Tanda Tangan ${asesorList[1]?.nama}`} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                      {barcodes.asesor2.tanggal && (
                        <div style={{ fontSize: '11px', color: '#333' }}>
                          {new Date(barcodes.asesor2.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {!allSigned && (
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                disabled={allSigned}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan data ini telah diisi dengan benar.
              </span>
            </label>
          </div>
          )}

          <AsesorSignatureGuard
            missingAsesorLabels={missingAsesorLabels}
            allAsesorSigned={allAsesorSigned}
            isAsesor={isAsesor}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={() => navigate(-1)}>
              Kembali
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={isSaving || (!allSigned && !agreedChecklist) || (!isAsesor && !allAsesorSigned)}
              onClick={handleSave}
            >
              {isSaving ? "Menyimpan..." : allSigned ? "Lanjut" : isAsesor ? (asesorHasSigned ? "Menunggu TTD Asesi" : "Simpan & Tanda Tangan") : (asesiHasSigned ? `Menunggu TTD ${missingAsesorLabels.join(', ')}` : "Simpan & Tanda Tangan")}
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>

      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />
    </div>
  )
}
