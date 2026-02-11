import { useState, useEffect } from "react"
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

interface Referensi {
  id: number
  nama: string
  jawaban: boolean
}

interface Kelompok {
  id: number
  nama: string | null
  urut: number
  referensis: Referensi[]
}

interface Ak04Data {
  kelompoks: Kelompok[]
  alasan: string
}

interface ApiResponse {
  message: string
  data: Ak04Data
}

type AnswerType = boolean | null

export default function FrAk04Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { jabatanKerja, nomorSkema, namaAsesor: _namaAsesor, asesorList, namaAsesi } = useDataDokumenPraAsesmen(idIzin)
  const { showSuccess, showError, showWarning } = useToast()
  const [ak04Data, setAk04Data] = useState<Ak04Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [answers, setAnswers] = useState<Record<number, AnswerType>>({})
  const [alasanBanding, setAlasanBanding] = useState('')

  // Only asesi can edit this form
  const isFormDisabled = isAsesor

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params
        let actualIdIzin = idIzin

        if (!actualIdIzin && !isAsesor && kegiatan?.jadwal_id) {
          // Fetch id_izin from list-asesi endpoint if not in URL
          const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })

          if (listAsesiResponse.ok) {
            const listResult = await listAsesiResponse.json()
            if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
              actualIdIzin = listResult.list_asesi[0].id_izin
            }
          }
        }

        if (!actualIdIzin) {
          setIsLoading(false)
          return
        }

        // Fetch AK 04 data
        const ak04Response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/ak04`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (ak04Response.ok) {
          const result: ApiResponse = await ak04Response.json()
          if (result.message === "Success") {
            setAk04Data(result.data)

            // Load existing answers from API
            const initialAnswers: Record<number, AnswerType> = {}
            result.data.kelompoks.forEach(kelompok => {
              kelompok.referensis.forEach(ref => {
                initialAnswers[ref.id] = ref.jawaban
              })
            })
            setAnswers(initialAnswers)

            // Load existing alasan
            if (result.data.alasan) {
              setAlasanBanding(result.data.alasan)
            }
          }
        } else {
          console.warn(`AK04 API returned ${ak04Response.status}`)
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    if (isAsesor && idIzin) {
      fetchData()
    } else if (kegiatan) {
      fetchData()
    }
  }, [idIzin, kegiatan, isAsesor])

  const handleBack = () => {
    navigate(-1)
  }

  const handleAnswerChange = (refId: number, value: boolean) => {
    if (isFormDisabled) return
    setAnswers(prev => {
      const current = prev[refId]
      if (current === value) {
        // Uncheck if clicking the same value
        const { [refId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [refId]: value }
    })
  }

  const handleCellClick = (refId: number) => {
    if (isFormDisabled) return
    setAnswers(prev => {
      const current = prev[refId]
      // Toggle: null -> true -> false -> null
      if (current === undefined || current === null) {
        return { ...prev, [refId]: true }
      } else if (current === true) {
        return { ...prev, [refId]: false }
      } else {
        const { [refId]: _, ...rest } = prev
        return rest
      }
    })
  }

  const handleSave = async () => {
    // Asesor just navigate without validation/saving
    if (isFormDisabled) {
      let actualIdIzin = idIzin
      const token = localStorage.getItem("access_token")

      if (!actualIdIzin && !isAsesor && kegiatan?.jadwal_id) {
        const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (listAsesiResponse.ok) {
          const listResult = await listAsesiResponse.json()
          if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
            actualIdIzin = listResult.list_asesi[0].id_izin
          }
        }
      }

      if (actualIdIzin) {
        navigate(`/asesi/praasesmen/${actualIdIzin}/k3-asesmen`)
      }
      return
    }

    // Asesi - validate and save
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    try {
      // Get actual idIzin
      let actualIdIzin = idIzin
      const token = localStorage.getItem("access_token")

      if (!actualIdIzin && !isAsesor && kegiatan?.jadwal_id) {
        const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (listAsesiResponse.ok) {
          const listResult = await listAsesiResponse.json()
          if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
            actualIdIzin = listResult.list_asesi[0].id_izin
          }
        }
      }

      if (!actualIdIzin) {
        showWarning("ID Izin tidak ditemukan")
        return
      }

      // Prepare answers array
      const kelompokId = ak04Data?.kelompoks?.[0]?.id || 1
      const answersArray = Object.entries(answers).map(([referensiId, jawaban]) => ({
        referensi_id: Number(referensiId),
        kelompok_id: kelompokId,
        jawaban: jawaban === true
      }))

      const payload = {
        answers: answersArray,
        alasan: alasanBanding
      }

      // POST to backend
      const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/ak04`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.message === "AK04 successfully submitted") {
          showSuccess('FR AK 04 berhasil disimpan!')
          setTimeout(() => {
            navigate(`/asesi/praasesmen/${actualIdIzin}/k3-asesmen`)
          }, 500)
        } else {
          showError("Gagal menyimpan data: " + (result.message || "Unknown error"))
        }
      } else {
        showError("Gagal menyimpan data. Status: " + response.status)
      }
    } catch (error) {
      console.error("Error saving AK04:", error)
      showError("Terjadi kesalahan saat menyimpan data")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data AK 04..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
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
            <span>FR.AK.04</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={7}>
        <div style={{ padding: '20px' }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>
              FR.AK.04 BANDING ASESMEN
            </h1>
          </div>

          {/* Main Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '13px', background: '#fff' }}>
            <tbody>
              {/* Nama Asesi */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '25%' }}>Nama Asesi</td>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>: {namaAsesi?.toUpperCase() || user?.name.toUpperCase() || ''}</td>
              </tr>

              {/* Nama Asesor */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>Nama Asesor</td>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>:
                  {asesorList.map((asesor, idx) => (
                    <span key={asesor.id}>
                      {idx > 0 && ', '}
                      {asesor.nama?.toUpperCase() || ''}
                    </span>
                  ))}
                </td>
              </tr>

              {/* Tanggal Asesmen */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>Tanggal Asesmen</td>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>: {new Date().toLocaleDateString('id-ID')}</td>
              </tr>
              <br />
              {/* Header Row */}
              <tr>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
                  Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini :
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '10%', fontWeight: 'bold', textAlign: 'center' }}>YA</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '10%', fontWeight: 'bold', textAlign: 'center' }}>TIDAK</td>
              </tr>

              {/* Questions */}
              {ak04Data?.kelompoks?.[0]?.referensis.map((ref) => {
                const answer = answers[ref.id]

                return (
                  <tr key={ref.id}>
                    <td
                      colSpan={2}
                      style={{ border: '1px solid #000', padding: '6px 8px', cursor: isFormDisabled ? 'default' : 'pointer' }}
                      onClick={() => handleCellClick(ref.id)}
                    >
                      {ref.nama}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 30px', textAlign: 'center' }}>
                      <CustomCheckbox
                        checked={answer === true}
                        onChange={() => handleAnswerChange(ref.id, true)}
                        disabled={isFormDisabled}
                        style={{ width: '18px', height: '18px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 30px', textAlign: 'center' }}>
                      <CustomCheckbox
                        checked={answer === false}
                        onChange={() => handleAnswerChange(ref.id, false)}
                        disabled={isFormDisabled}
                        style={{ width: '18px', height: '18px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                  </tr>
                )
              })}

              {/* Skema Sertifikasi Info */}
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '8px' }}>
                  Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap Skema Sertifikasi (̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶ berikut :
                  <br /><br />
                  Skema Sertifikasi : {jabatanKerja?.toUpperCase() || ''}<br />
                  No. Skema Sertifikasi : {nomorSkema?.toUpperCase() || ''}
                </td>
              </tr>

              {/* Alasan Banding */}
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                  <div style={{ marginBottom: '8px' }}>Banding ini diajukan atas alasan sebagai berikut :</div>
                  <textarea
                    value={alasanBanding}
                    onChange={(e) => setAlasanBanding(e.target.value)}
                    disabled={isFormDisabled}
                    placeholder="Tuliskan alasan banding..."
                    style={{
                      width: '100%',
                      minHeight: '70px',
                      border: '1px solid #ccc',
                      padding: '8px',
                      fontSize: '13px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      resize: 'vertical',
                      cursor: isFormDisabled ? 'not-allowed' : 'text',
                      background: isFormDisabled ? '#f5f5f5' : '#fff'
                    }}
                  />
                </td>
              </tr>

              {/* Info */}
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '8px' }}>
                  Anda mempunyai hak mengajukan banding jika Anda menilai proses asesmen tidak sesuai SOP dan tidak memenuhi Prinsip Asesmen.
                </td>
              </tr>

              {/* Tanda Tangan */}
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', height: '80px' }}>
                  Tanda tangan Asesi : {namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ''}<br /><br />
                  Tanggal : {new Date().toLocaleDateString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Agreement Checklist */}
          <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: isFormDisabled ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={agreedChecklist}
                onChange={(e) => !isFormDisabled && setAgreedChecklist(e.target.checked)}
                disabled={isFormDisabled}
                style={{ marginTop: '2px', width: '16px', height: '16px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen AK 04 (Banding Asesmen) ini dengan sebenar-benarnya.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={handleBack} disabled={isSaving}>
              Kembali
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={isSaving || (!isFormDisabled && !agreedChecklist)}
              onClick={handleSave}
            >
              {isSaving ? "Menyimpan..." : (isFormDisabled ? "Lanjut" : "Simpan & Lanjut")}
            </ActionButton>
          </div>
        </div>
      </AsesiLayout>
    </div>
  )
}
