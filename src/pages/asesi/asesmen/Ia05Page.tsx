import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomRadio } from "@/components/ui/Radio"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"

interface Unit {
  id: number
  kode: string
}

interface Kuk {
  id: number
  kode: string
}

interface Soal {
  id: number
  no: string
  id_unitkompetensi: string
  id_kuk: string | null
  jenis: string
  soal: string
  jawab_a: string
  jawab_b: string
  jawab_c: string
  jawab_d: string
  file_a: string | null
  file_b: string | null
  file_c: string | null
  file_d: string | null
  kunci_jawaban: string
  jawaban_asesi: string | null
  unit: Unit
  kuk: Kuk | null
}

interface Dokumen {
  id: number
  nama_dokumen: string
}

interface Ia05Response {
  message: string
  data: {
    dokumen: Dokumen
    soal: Soal[]
  }
}

interface ApiResponse {
  message: string
  data: Ia05Response["data"]
}

export default function Ia05Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)
  const { jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, idAsesor1: _idAsesor1 } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()

  // Get dynamic steps
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const isAsesi = user?.role?.name?.toLowerCase() === 'asesi'
  // Check if current asesor is asesor1 (can edit) or asesor2 (read-only)
  // const isAsesor1 = isAsesor && user?.id === idAsesor1
  const canEditIa05 = isAsesi // Only asesi can answer the questions
  // const canEditGrading = isAsesor1 // Only asesor1 can grade the answers
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  const [ia05Data, setIa05Data] = useState<Ia05Response["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPernyataanAgreed, setIsPernyataanAgreed] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia05`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: ApiResponse = await response.json()
          if (result.message === "Success") {
            // Sort soal by no (numeric)
            const sortedSoal = result.data.soal.sort((a, b) => {
              const numA = parseInt(a.no) || 0
              const numB = parseInt(b.no) || 0
              return numA - numB
            })
            setIa05Data({ ...result.data, soal: sortedSoal })

            // Initialize answers from jawaban_asesi
            const newAnswers: Record<number, 'A' | 'B' | 'C' | 'D'> = {}
            sortedSoal.forEach((soal) => {
              if (soal.jawaban_asesi) {
                newAnswers[soal.id] = soal.jawaban_asesi as 'A' | 'B' | 'C' | 'D'
              }
            })
            setAnswers(newAnswers)
          }
        }
      } catch (error) {
        console.error("Error fetching IA.05 data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleAnswerChange = (soalId: number, answer: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({ ...prev, [soalId]: answer }))
  }

  const handleSubmit = async () => {
    if (!ia05Data) {
      showWarning('Data belum dimuat.')
      return
    }

    if (!id) {
      showWarning('ID tidak ditemukan.')
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('access_token')

      // Build answers array for POST
      const answersPayload = ia05Data.soal
        .filter(soal => answers[soal.id]) // Only include answered questions
        .map(soal => ({
          soal_id: soal.id,
          jawaban: answers[soal.id]
        }))

      const payload = {
        id_izin: parseInt(id),
        dokumen_id: ia05Data.dokumen.id,
        answers: answersPayload
      }

      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia05`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showSuccess('IA 05 berhasil disimpan!')
        // Navigate to next step based on asesmenSteps
        const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ia05'))
        const nextStep = asesmenSteps[currentStepIndex + 1]
        if (nextStep) {
          if (nextStep.href.includes('ak02')) {
            setTimeout(() => navigate(`/asesi/asesmen/${id}/ak02`), 500)
          } else if (nextStep.href.includes('ak03')) {
            setTimeout(() => navigate(`/asesi/asesmen/${id}/ak03`), 500)
          } else if (nextStep.href.includes('selesai')) {
            setTimeout(() => navigate(`/asesi/asesmen/${id}/selesai`), 500)
          } else {
            const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
            setTimeout(() => navigate(nextPath), 500)
          }
        } else {
          setTimeout(() => navigate(`/asesi/asesmen/${id}/selesai`), 500)
        }
      } else {
        const result = await response.json()
        showError(`Gagal menyimpan: ${result.message || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error saving IA05:', error)
      showError('Gagal menyimpan data. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const isQuestionAnswered = (soalId: number) => answers[soalId]

  if (isLoading) {
    return <FullPageLoader text="Memuat data IA.05..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(isAsesor ? "/asesor/dashboard" : "/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>IA.05</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ia05'))?.number || 4} steps={asesmenSteps} id={id}>
                {/* IDENTITAS Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi<br />(̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</td>
              <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{tuk || '-'}</td>
            </tr>
            {asesorList.length > 1 ? (
              asesorList.map((asesor, idx) => (
                <tr key={asesor.id}>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    {asesor.nama?.toUpperCase() || ''}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesorList[0]?.nama?.toUpperCase() || ''}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID')}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Waktu</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>60 menit</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>*Coret yang tidak perlu</div>

        {/* SOAL Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold' }}>
              <td style={{ width: '160', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>KUK</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>SOAL, Pilih Jawaban semua pertanyaan berikut (A / B / C / D) :</td>
            </tr>
            {ia05Data?.soal.map((soal) => (
              <React.Fragment key={soal.id}>
                <tr>
                  <td className="kuk" style={{
                    background: isQuestionAnswered(soal.id) ? '#d58a94' : '#d58a94',
                    color: isQuestionAnswered(soal.id) ? '#000' : '#000',
                    width: '160px',
                    textAlign: 'center',
                    border: '1px solid #000',
                    padding: '6px',
                    fontWeight: isQuestionAnswered(soal.id) ? 'bold' : 'normal'
                  }}>
                    {soal.unit.kode}<br />{soal.kuk?.kode || ''}
                  </td>
                  <td style={{ width: '40', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{soal.no}.</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{soal.soal}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: !canEditIa05 ? 'default' : 'pointer' }} onClick={() => canEditIa05 && handleAnswerChange(soal.id, 'A')}>
                      <CustomRadio
                        name={`soal-${soal.id}`}
                        value="A"
                        checked={answers[soal.id] === 'A'}
                        onChange={() => {}}
                        disabled={!canEditIa05}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>a. {soal.jawab_a}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: !canEditIa05 ? 'default' : 'pointer' }} onClick={() => canEditIa05 && handleAnswerChange(soal.id, 'B')}>
                      <CustomRadio
                        name={`soal-${soal.id}`}
                        value="B"
                        checked={answers[soal.id] === 'B'}
                        onChange={() => {}}
                        disabled={!canEditIa05}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>b. {soal.jawab_b}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: !canEditIa05 ? 'default' : 'pointer' }} onClick={() => canEditIa05 && handleAnswerChange(soal.id, 'C')}>
                      <CustomRadio
                        name={`soal-${soal.id}`}
                        value="C"
                        checked={answers[soal.id] === 'C'}
                        onChange={() => {}}
                        disabled={!canEditIa05}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>c. {soal.jawab_c}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: !canEditIa05 ? 'default' : 'pointer' }} onClick={() => canEditIa05 && handleAnswerChange(soal.id, 'D')}>
                      <CustomRadio
                        name={`soal-${soal.id}`}
                        value="D"
                        checked={answers[soal.id] === 'D'}
                        onChange={() => {}}
                        disabled={!canEditIa05}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>d. {soal.jawab_d}</span>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* LANJUTAN IA05 - Only visible to asesor (view-only) */}
        {isAsesor && (
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>FR.05.C. LEMBAR JAWABAN PERTANYAAN TERTULIS PILIHAN GANDA</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#f8f8f8' }}>
              <tbody>
                <tr>
                  <th colSpan={2} style={{ background: '#c00000', color: 'white', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>Lembar Jawaban</th>
                  <th colSpan={2} style={{ background: '#c00000', color: 'white', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>Rekomendasi</th>
                </tr>
                <tr>
                  <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>No.</th>
                  <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>Jawaban</th>
                  <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>K</th>
                  <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>BK</th>
                </tr>

                {ia05Data?.soal.map((soal) => {
                  const isCorrect = soal.jawaban_asesi === soal.kunci_jawaban
                  const hasAnswer = !!soal.jawaban_asesi

                  return (
                    <tr key={`grading-${soal.id}`}>
                      <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', backgroundColor: '#fff' }}>{soal.no}</td>
                      <td style={{ border: '1px solid #000', padding: '5px', backgroundColor: '#fff' }}>
                        {soal.jawaban_asesi ? (
                          <span>{soal.jawaban_asesi} - {String(soal[`jawab_${soal.jawaban_asesi.toLowerCase()}` as keyof Soal] || '')}</span>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>Belum dijawab</span>
                        )}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center',backgroundColor: '#fff' }}>
                        <CustomCheckbox
                          checked={hasAnswer && isCorrect}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </td>
                      <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center',backgroundColor: '#fff' }}>
                        <CustomCheckbox
                          checked={hasAnswer && !isCorrect}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </td>
                    </tr>
                  )
                })}

                {/* Summary Row */}
                
              </tbody>
            </table>
          </div>
        )}

        {/* PENYUSUN DAN VALIDATOR Table */}
        <h2 style={{ fontSize: '14px', marginBottom: '10px' }}>PENYUSUN DAN VALIDATOR</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ width: '140', border: '1px solid #000', padding: '6px',backgroundColor: '#fff' }}>Status</th>
              <th style={{ width: '40', border: '1px solid #000', padding: '6px',backgroundColor: '#fff' }}>No</th>
              <th style={{ border: '1px solid #000', padding: '6px',backgroundColor: '#fff' }}>Nama</th>
              <th style={{ width: '180', border: '1px solid #000', padding: '6px',backgroundColor: '#fff' }}>Nomor MET</th>
              <th style={{ width: '180', border: '1px solid #000', padding: '6px',backgroundColor: '#fff' }}>Tanda Tangan Dan Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {/* Penyusun rows */}
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Penyusun</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>

            {/* Validator rows */}
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Validator</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPernyataanAgreed}
                onChange={(e) => setIsPernyataanAgreed(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa jawaban yang saya berikan adalah benar dan sesuai dengan pengetahuan yang saya miliki. Saya bertanggung jawab penuh atas keaslian dan kelengkapan jawaban yang saya serahkan.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={() => navigate(`/asesi/asesmen/${id}/ia04b`)}>
              Kembali
            </ActionButton>
            <ActionButton variant="primary" disabled={isSaving || !isPernyataanAgreed} onClick={handleSubmit}>
              {isSaving ? "Menyimpan..." : "Lanjut"}
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
