import AsesmenBreadcrumb from "@/components/AsesmenBreadcrumb"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { RoleId } from "@/lib/rbac-config"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { useToast } from "@/contexts/ToastContext"
import { extractErrorMessage, extractApiError } from "@/lib/error-utils"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { useSigningState } from "@/hooks/useSigningState"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { API_BASE_URL } from "@/config/api"
import GoogleDriveUploader from "@/components/GoogleDriveUploader"
import { BRANDING } from "@/config/branding"

interface AspekAPI {
  aspek_id: string
  nama: string
  validitas: boolean | null
  reliabel: boolean | null
  fleksibel: boolean | null
  adil: boolean | null
}

interface DimensiKompetensiAPI {
  task_skills?: string
  task_management_skills?: string
  contingency_management_skills?: string
  job_role_environment_skills?: string
  transfer_skills?: string
}

interface BarcodeData {
  url: string
  tanggal: string
  nama: string
}

interface Barcodes {
  asesi: BarcodeData | null
  asesor1: BarcodeData | null
  asesor2: BarcodeData | null
}

interface Ak06Response {
  message: string
  data: {
    aspek: AspekAPI[]
    feedback: {
      rekomendasi1: string
      rekomendasi2: string
      catatan_asesor1: string
      catatan_asesor2: string
    }
    dimensi_kompetensi: DimensiKompetensiAPI[]
    barcodes: Barcodes
    video_ajj?: string
  }
}

interface AspekItem {
  id: string
  nama: string
  validitas: boolean
  reliabel: boolean
  fleksibel: boolean
  adil: boolean
}

export default function Ak06Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole, isAsesor1, isAsesor2 } = useAsesorRole(id)
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, idAsesor2: _idAsesor2, jadwalId, jenisKelas, namaAsesi } = useDataDokumenAsesmen(id)
  const { tahap } = useDataDokumenPraAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { kegiatan: _kegiatan } = useKegiatanByRole()

  // Get dynamic steps
  const isAsesor = user?.role?.id === RoleId.ASESOR
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])

  // All asesor can fill (removed restriction to specific asesor)
  const isFormDisabled = !isAsesor

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  const {
    showAwalModal,
    showAkhirModal,
    setShowAkhirModal,
    submitAbsenAwal,
    submitAbsenAkhir,
    handleAwalModalClose,
    handleAkhirModalClose: _handleAkhirModalClose,
    shouldShowAkhirModal,
  } = useAbsenCheck({
    phase: 'asesmen',
    role: 'auto',
    checkOnMount: true,
    idIzin: id,
    asesorList
  })

  // Form state
  const [aspekItems, setAspekItems] = useState<AspekItem[]>([])
  const [rekomendasiPrinsip, setRekomendasiPrinsip] = useState('')
  const [rekomendasiDimensi, setRekomendasiDimensi] = useState('')
  const [komentarAsesor, setKomentarAsesor] = useState<Record<number, string>>({})
  const [feedbackData, setFeedbackData] = useState<{
    rekomendasi1: string
    rekomendasi2: string
    catatan_asesor1: string
    catatan_asesor2: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [barcodes, setBarcodes] = useState<Barcodes>({
    asesi: null,
    asesor1: null,
    asesor2: null
  })
  const [pendingAfterAbsen, setPendingAfterAbsen] = useState(false)
  const [videoAjj, setVideoAjj] = useState('')
  const [showDriveUploader, setShowDriveUploader] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  const driveParentFolderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as string | undefined

  const nextStepLabel = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ak06')) + 1]?.label

  // Fetch data
  const fetchAk06Data = useCallback(async () => {
    if (authLoading) return
    if (!id) {
      console.error("No id_izin found")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ak06`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result: Ak06Response = await response.json()

        if (result.message === "Success" && result.data) {
          // Transform aspek data
          const aspek: AspekItem[] = result.data.aspek.map((item) => ({
            id: item.aspek_id,
            nama: item.nama,
            validitas: item.validitas || false,
            reliabel: item.reliabel || false,
            fleksibel: item.fleksibel || false,
            adil: item.adil || false,
          }))
          setAspekItems(aspek)

          // Set feedback data
          setFeedbackData(result.data.feedback || null)
          setRekomendasiPrinsip(result.data.feedback?.rekomendasi1 || '')
          setRekomendasiDimensi(result.data.feedback?.rekomendasi2 || '')

          // Set barcodes data
          setBarcodes(result.data.barcodes || {
            asesi: null,
            asesor1: null,
            asesor2: null
          })

          // Set video AJJ link
          setVideoAjj(result.data.video_ajj || '')

          // Also fetch from dedicated link-video endpoint
          fetchLinkVideo()
        }
      } else {
        console.warn(`AK06 API returned ${response.status}`)
      }
    } catch (err) {
      console.error("Error fetching AK06:", err)
    }
  }, [id, authLoading])

  useEffect(() => { fetchAk06Data() }, [fetchAk06Data])

  // Fetch saved link video from dedicated endpoint
  const fetchLinkVideo = useCallback(async () => {
    if (!jadwalId) return
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/jadwal/${jadwalId}/link-video`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.data?.link_video) {
          setVideoAjj(data.data.link_video)
        }
      }
    } catch {
      // silent
    }
  }, [jadwalId])

  // Signing state hook
  const signing = useSigningState({
    pageKey: 'ak06',
    isAsesor,
    tahap,
    barcodes: barcodes as any,
    setBarcodes: setBarcodes as any,
    asesorList,
    userId: user?.id,
    userName: user?.name,
    isSaving,
    idIzin: id,
    jadwalId,
    nextPageName: nextStepLabel,
    onRefresh: fetchAk06Data,
  })


  // Map komentar asesor when feedback data and asesorList are available
  useEffect(() => {
    if (feedbackData && asesorList.length > 0) {
      const komentarMap: Record<number, string> = {}
      if (feedbackData.catatan_asesor1 && asesorList[0]) {
        komentarMap[asesorList[0].id] = feedbackData.catatan_asesor1
      }
      if (feedbackData.catatan_asesor2 && asesorList[1]) {
        komentarMap[asesorList[1].id] = feedbackData.catatan_asesor2
      }
      setKomentarAsesor(komentarMap)
    }
  }, [feedbackData, asesorList])

  // Keep hasSigned derived from hook
  const hasSigned = isAsesor ? signing.asesorHasSigned : signing.asesiHasSigned


  const handleAspekChange = (id: string, field: keyof Pick<AspekItem, 'validitas' | 'reliabel' | 'fleksibel' | 'adil'>) => {
    if (isFormDisabled || signing.allSigned) return
    setAspekItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: !item[field] }
      }
      return item
    }))
  }

  const handleSave = async () => {
    // Tahap 0: skip save/TTD, langsung navigasi next
    if (tahap === 0) {
      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak06'))
      const nextStep = asesmenSteps[currentStepIndex + 1]
      navigate(nextStep ? nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`) : `/asesi/asesmen/${id}/selesai`)
      return
    }
    // If user already signed â†’ check absen akhir before navigate
    if (hasSigned) {
      const needsAbsenAkhir = await shouldShowAkhirModal()
      if (needsAbsenAkhir) {
        // If luring, no video, and no one signed yet â†’ require upload
        if (jenisKelas === '3' && !videoAjj && !signing.asesorHasSigned && !signing.asesiHasSigned) {
          setPendingAfterAbsen(true)
          setShowDriveUploader(true)
          return
        }
        setPendingAfterAbsen(true)
        setShowAkhirModal(true)
        return
      }
      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak06'))
      const nextStep = asesmenSteps[currentStepIndex + 1]
      if (nextStep) {
        const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
        navigate(nextPath)
      } else {
        navigate(`/asesi/asesmen/${id}/selesai`)
      }
      return
    }

    if (!signing.agreedChecklist) {
      showWarning('Silakan centang pernyataan terlebih dahulu')
      return
    }

    if (!id) {
      showWarning('ID tidak ditemukan')
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")

      // Prepare answers array for aspek
      const answers = aspekItems.map((item) => ({
        aspek_id: parseInt(item.id),
        validitas: item.validitas || null,
        reliabel: item.reliabel || null,
        fleksibel: item.fleksibel || null,
        adil: item.adil || null,
      }))

      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ak06`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          rekomendasi1: rekomendasiPrinsip,
          rekomendasi2: rekomendasiDimensi,
          catatan_asesor1: komentarAsesor[asesorList[0]?.id] || '',
          catatan_asesor2: komentarAsesor[asesorList[1]?.id] || '',
          dimensi_kompetensi: metode ? {
            task_skills: getDimensiKompetensiLabel(),
            task_management_skills: getDimensiKompetensiLabel(),
            contingency_management_skills: getDimensiKompetensiLabel(),
            job_role_environment_skills: getDimensiKompetensiLabel(),
            transfer_skills: getDimensiKompetensiLabel(),
          } : undefined,
        }),
      })

      if (response.ok) {
        showSuccess('AK 06 berhasil disimpan!')

        // Generate QR via hook
        if (isAsesor) {
          await signing.generateQR()
          signing.publishUpdate()
        }

        // Auto-check absen akhir setelah save pertama â€” biar ga kelewat
        const needsAbsenAkhir = await shouldShowAkhirModal()
        if (needsAbsenAkhir) {
          if (jenisKelas === '3' && !videoAjj && !signing.asesorHasSigned && !signing.asesiHasSigned) {
            setShowDriveUploader(true)
            return
          }
          setShowAkhirModal(true)
        } else {
          const currentIdx = asesmenSteps.findIndex(s => s.href.includes('ak06'))
          const nextStep = asesmenSteps[currentIdx + 1]
          if (nextStep) {
            navigate(nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`))
          } else {
            navigate(`/asesi/asesmen/${id}/selesai`)
          }
        }
      } else {
        const msg = await extractApiError(response, 'Gagal menyimpan data. Silakan coba lagi.')
        showError(msg)
      }
    } catch (err) {
      console.error('Error saving AK06:', err)
      showError(extractErrorMessage(err, 'Terjadi kesalahan. Silakan coba lagi.'))
    } finally {
      setIsSaving(false)
    }
  }

  // Get dimensi kompetensi labels based on jenjang and metode (same as MAPA01)
  const getDimensiKompetensiLabel = (): string => {
    const jenjangNum = parseInt(jenjang || "0")

    // jenjang < 4: L/CL T/DPT
    if (jenjangNum < 4) {
      return "L/CL<br/> T/DPT"
    }
    // jenjang > 3 AND portofolio: TL/VP T/PW T/VPK
    else if (metode === "portofolio") {
      return "TL/VP<br/> T/PW<br/> T/VPK"
    }
    // jenjang > 3 AND observasi: L/DIT T/DPT
    else {
      return "L/DIT<br/> T/DPT"
    }
  }

  // Handle absen akhir submit - navigate after success
  const handleAbsenAkhirSubmit = async (imageBlob: Blob) => {
    await submitAbsenAkhir(imageBlob)
  }


  const handleDriveUploadSuccess = useCallback(async (webViewLinks: string[]) => {
    try {
      const token = localStorage.getItem('access_token')
      let allOk = true

      for (const link of webViewLinks) {
        const res = await fetch(`${API_BASE_URL}/jadwal/${jadwalId}/link-video`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ link_video: link }),
        })
        if (!res.ok) allOk = false
      }

      if (allOk) {
        setVideoAjj(webViewLinks[0] || '')
        setShowDriveUploader(false)
        showSuccess('Video AJJ berhasil diupload ke Google Drive!')

        // Re-upload mode (already signed) â€” just close and stay
        if (signing.allSigned) return

        // First-time upload flow â€” proceed to absen akhir
        const needsAbsenAkhir = await shouldShowAkhirModal()
        if (needsAbsenAkhir) {
          setShowAkhirModal(true)
        } else {
          setPendingAfterAbsen(false)
          const currentIdx = asesmenSteps.findIndex(s => s.href.includes('ak06'))
          const nextStep = asesmenSteps[currentIdx + 1]
          if (nextStep) {
            navigate(nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`))
          } else {
            navigate(`/asesi/asesmen/${id}/selesai`)
          }
        }
      } else {
        showWarning('Gagal menyimpan beberapa tautan. Silakan coba upload ulang.')
      }
    } catch (err) {
      showError(extractErrorMessage(err, 'Gagal menyimpan tautan video'))
    }
  }, [jadwalId, signing.allSigned, shouldShowAkhirModal, showSuccess, showWarning, showError, asesmenSteps, id, navigate, setVideoAjj, setShowAkhirModal, setPendingAfterAbsen])

  const handleAkhirModalClose = () => {
    _handleAkhirModalClose()
    if (pendingAfterAbsen) {
      setPendingAfterAbsen(false)
      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak06'))
      const nextStep = asesmenSteps[currentStepIndex + 1]
      if (nextStep) {
        const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
        navigate(nextPath)
      } else {
        navigate(`/asesi/asesmen/${id}/selesai`)
      }
    }
  }

  if (!aspekItems.length) return <FullPageLoader text="Memuat data..." />

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Breadcrumb */}
      <AsesmenBreadcrumb currentPage="AK.06" />

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ak06'))?.number || 7} steps={asesmenSteps} id={id} metode={metode}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', margin: '0' }}>
            FR.AK.06. MENINJAU PROSES ASESMEN
          </h2>
        </div>

        {/* IDENTITAS Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '30%', background: '#fff', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)</td>
              <td style={{ width: '12%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{tuk || '-'}</td>
            </tr>
            {asesorList.length > 1 ? (
              asesorList.map((asesor, idx) => (
                <tr key={asesor.id}>
                  <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
          </tbody>
        </table>

        {/* PENJELASAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'left', border: '1px solid #000', padding: '6px' }}>Penjelasan:</th>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                1. Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.<br />
                2. Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan / atau peserta kelompok yang homogen.<br />
                3. Isilah pemenuhan dimensi kompetensi dengan menulis kode rekaman formulir yang membuktikan terpenuhinya dimensi kompetensi.
              </td>
            </tr>
          </tbody>
        </table>

        {/* KONSEP ASESMEN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <th rowSpan={2} style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Aspek yang ditinjau</th>
              <th colSpan={4} style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Kesesuaian dengan prinsip asesmen</th>
            </tr>
            <tr>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Validitas</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Reliabel</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Fleksibel</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Adil</th>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Prosedur asesmen:<br />â€¢ Rencana asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.fleksibel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'fleksibel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'adil')} disabled={isFormDisabled || signing.allSigned} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>â€¢ Persiapan asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.fleksibel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'fleksibel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'adil')} disabled={isFormDisabled || signing.allSigned} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>â€¢ Implementasi asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.fleksibel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'fleksibel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'adil')} disabled={isFormDisabled || signing.allSigned} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>â€¢ Keputusan asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ background: '#000', border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.id || '', 'adil')} disabled={isFormDisabled || signing.allSigned} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>â€¢ Umpan balik asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled || signing.allSigned} />
              </td>
              <td style={{ background: '#000', border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.id || '', 'adil')} disabled={isFormDisabled || signing.allSigned} />
              </td>
            </tr>

            <tr>
              <td colSpan={5} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                Rekomendasi untuk peningkatan<br />
                <textarea
                  value={rekomendasiPrinsip}
                  onChange={(e) => setRekomendasiPrinsip(e.target.value)}
                  disabled={isFormDisabled || signing.allSigned}
                  style={{
                    width: '100%',
                    height: '120px',
                    border: '1px solid #ccc',
                    padding: '6px',
                    fontSize: '13px',
                    resize: 'none',
                    cursor: (isFormDisabled || signing.allSigned) ? 'not-allowed' : 'text'
                  }}
                  placeholder="Tuliskan rekomendasi..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* DIMENSI KOMPETENSI Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <th rowSpan={2} style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Aspek yang ditinjau</th>
              <th colSpan={5} style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Pemenuhan dimensi kompetensi</th>
            </tr>
            <tr>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Task Skills</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Task Management Skills</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Contingency Management Skills</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Job Role/Environment Skills</th>
              <th style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Transfer Skills</th>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                <b>Konsistensi keputusan asesmen</b><br />
                Bukti dari berbagai asesmen diperiksa untuk konsistensi dimensi kompetensi
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
            </tr>

            <tr>
              <td colSpan={6} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                Rekomendasi untuk peningkatan:<br />
                <textarea
                  value={rekomendasiDimensi}
                  onChange={(e) => setRekomendasiDimensi(e.target.value)}
                  disabled={isFormDisabled || signing.allSigned}
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '6px',
                    border: '1px solid #ccc',
                    fontSize: '13px',
                    resize: 'none',
                    cursor: (isFormDisabled || signing.allSigned) ? 'not-allowed' : 'text'
                  }}
                  placeholder="Tuliskan rekomendasi..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Lead Asesor/Asesor</td>
              <td style={{ width: '33%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Tanggal Tanda Tangan</td>
              <td style={{ width: '34%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Komentar</td>
            </tr>
            {asesorList.map((asesor, index) => {
              // Check if this is the logged-in asesor's comment
              const isOwnComment = (
                (isAsesor1 && index === 0) ||  // asesor_1 can edit asesor_1's comment
                (isAsesor2 && index === 1)      // asesor_2 can edit asesor_2's comment
              )
              const isCommentDisabled = (isAsesor && !isOwnComment) || signing.allSigned

              // Get barcode data for this asesor
              const asesorBarcode = index === 0 ? barcodes.asesor1 : barcodes.asesor2

              return (
                <tr key={asesor.id}>
                  <td style={{ height: '100px', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                    {asesor.nama?.toUpperCase() || ''}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top', textAlign: 'center' }}>
                    {asesorBarcode ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img
                          src={asesorBarcode.url}
                          alt={`QR ${asesor.nama}`}
                          style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                        />
                        {asesorBarcode.tanggal && (
                          <div style={{ fontSize: '11px', color: '#333' }}>
                            {new Date(asesorBarcode.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ minHeight: '50px' }}></div>
                    )}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <textarea
                      value={komentarAsesor[asesor.id] || ''}
                      onChange={(e) => setKomentarAsesor(prev => ({ ...prev, [asesor.id]: e.target.value }))}
                      disabled={isCommentDisabled}
                      style={{
                        width: '100%',
                        height: '80px',
                        border: '1px solid #ccc',
                        padding: '6px',
                        fontSize: '13px',
                        resize: 'none',
                        cursor: isCommentDisabled ? 'not-allowed' : 'text'
                      }}
                      placeholder="Tuliskan komentar..."
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          {!signing.allSigned && (
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={signing.agreedChecklist}
                onChange={() => signing.setAgreedChecklist(!signing.agreedChecklist)}
                disabled={signing.allSigned}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa peninjauan proses asesmen ini telah saya lakukan dengan objektif dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {isAsesor && (
              <ActionButton
                variant="secondary"
                onClick={() => {
                  const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak06'))
                  const prevStep = asesmenSteps[currentStepIndex - 1]
                  if (prevStep) {
                    const prevPath = prevStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
                    navigate(prevPath)
                  }
                }}
              >
                Kembali
              </ActionButton>
            )}

            {/* Re-upload video button â€” visible after all signed */}
            {signing.allSigned && isAsesor1 && (
              <ActionButton
                variant="secondary"
                onClick={() => setShowDriveUploader(true)}
              >
                Upload Ulang Video
              </ActionButton>
            )}

            <ActionButton variant="primary" disabled={signing.buttonDisabled} onClick={handleSave}>
              {isSaving ? "Menyimpan..." : signing.buttonText}
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>


      {/* Google Drive Uploader */}
      {showDriveUploader && (
        <GoogleDriveUploader
          googleClientId={googleClientId}
          folderName={`${id} - ${namaAsesi}`}
          parentFolderId={driveParentFolderId}
          namaAsesi={namaAsesi || ''}
          onUploadSuccess={handleDriveUploadSuccess}
          onClose={() => {
            setShowDriveUploader(false)
            // Reset pending absen â€” user cancel upload, biar ga stuck
            setPendingAfterAbsen(false)
          }}
        />
      )}

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />

      {/* Absen Akhir Modal */}
      <WebcamModal
        isOpen={showAkhirModal}
        onClose={handleAkhirModalClose}
        onSubmit={handleAbsenAkhirSubmit}
        title="Absen Keluar Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen keluar"
        canClose={true}
      />
    </div>
  )
}
