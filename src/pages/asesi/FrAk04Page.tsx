import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"

interface Referensi {
  id: number
  nama: string
}

interface Kelompok {
  id: number
  nama: string | null
  urut: number
  referensis: Referensi[]
}

interface Ak04DataItem {
  kelompok: Kelompok
}

interface ApiResponse {
  message: string
  data: Ak04DataItem[]
}

type AnswerType = 'ya' | 'tidak' | null

export default function FrAk04Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin } = useParams<{ idIzin: string }>()
  const [ak04Data, setAk04Data] = useState<Ak04DataItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [answers, setAnswers] = useState<Record<number, AnswerType>>({})
  const [alasanBanding, setAlasanBanding] = useState('')

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params
        let actualIdIzin = idIzin

        if (!actualIdIzin && kegiatan?.jadwal_id) {
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
          console.error("No id_izin found")
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
          }
        } else {
          console.warn(`AK04 API returned ${ak04Response.status}`)
        }
      } catch (error) {
        console.error("Error fetching AK 04:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [idIzin, kegiatan])

  const handleBack = () => {
    navigate(-1)
  }

  const handleAnswerChange = (refId: number, value: AnswerType) => {
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

  const handleSave = async () => {
    if (!agreedChecklist) {
      alert("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    try {
      // TODO: POST data to backend
      console.log("Submitting AK04 data:", {
        answers,
        alasanBanding,
      })

      // Get actual idIzin
      let actualIdIzin = idIzin
      if (!actualIdIzin && kegiatan?.jadwal_id) {
        const token = localStorage.getItem("access_token")
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

      navigate(`/asesi/praasesmen/${actualIdIzin}/k3-asesmen`)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSaving(false)
    }
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
            <p style={{ color: '#666' }}>Memuat data AK 04...</p>
          </div>
        </div>
      </div>
    )
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
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>: {user?.name || ''}</td>
              </tr>

              {/* Nama Asesor */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>Nama Asesor</td>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>: </td>
              </tr>

              {/* Tanggal Asesmen */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>Tanggal Asesmen</td>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>: {new Date().toLocaleDateString('id-ID')}</td>
              </tr>

              {/* Header Row */}
              <tr>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
                  Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini :
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '10%', fontWeight: 'bold', textAlign: 'center' }}>YA</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '10%', fontWeight: 'bold', textAlign: 'center' }}>TIDAK</td>
              </tr>

              {/* Questions */}
              {ak04Data?.[0]?.kelompok.referensis.map((ref) => {
                const answer = answers[ref.id]

                return (
                  <tr key={ref.id}>
                    <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                      {ref.nama}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={answer === 'ya'}
                        onChange={() => handleAnswerChange(ref.id, 'ya')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={answer === 'tidak'}
                        onChange={() => handleAnswerChange(ref.id, 'tidak')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                )
              })}

              {/* Skema Sertifikasi Info */}
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '8px' }}>
                  Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap Skema Sertifikasi (Kualifikasi/Klaster/Okupasi) berikut :
                  <br /><br />
                  Skema Sertifikasi : Teknisi Jembatan Rangka Baja<br />
                  No. Skema Sertifikasi : SKEMA-26/LSP-GKK/2022
                </td>
              </tr>

              {/* Alasan Banding */}
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                  <div style={{ marginBottom: '8px' }}>Banding ini diajukan atas alasan sebagai berikut :</div>
                  <textarea
                    value={alasanBanding}
                    onChange={(e) => setAlasanBanding(e.target.value)}
                    placeholder="Tuliskan alasan banding..."
                    style={{
                      width: '100%',
                      minHeight: '70px',
                      border: '1px solid #ccc',
                      padding: '8px',
                      fontSize: '13px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      resize: 'vertical'
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
                  Tanda tangan Asesi : .............................................<br /><br />
                  Tanggal : .......................................................
                </td>
              </tr>
            </tbody>
          </table>

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
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen AK 04 (Banding Asesmen) ini dengan sebenar-benarnya.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleBack}
              disabled={isSaving}
              style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '13px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1 }}
            >
              Kembali
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !agreedChecklist}
              style={{ padding: '8px 16px', background: agreedChecklist ? '#0066cc' : '#999', color: '#fff', fontSize: '13px', cursor: isSaving || !agreedChecklist ? 'not-allowed' : 'pointer', border: 'none', opacity: isSaving || !agreedChecklist ? 0.5 : 1 }}
            >
              {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
            </button>
          </div>
        </div>
      </AsesiLayout>
    </div>
  )
}
