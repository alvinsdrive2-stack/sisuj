import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
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
import { API_BASE_URL } from "@/config/api"

interface UnitKompetensiAPI {
  id: number
  kode: string
  nama: string
  observasi: boolean
  portofolio: boolean
  pertanyaan_wawancara: boolean
  pertanyaan_lisan: boolean
  pertanyaan_tertulis: boolean
  proyek_kerja: boolean
}

interface UnitKompetensi {
  id: number
  kode: string
  nama: string
}

type BarcodeData = {
  url: string
  tanggal: string
  nama: string
}

interface Ak02Response {
  message: string
  data: {
    barcodes?: {
      asesi?: BarcodeData
      asesor1?: BarcodeData | null
      asesor2?: BarcodeData | null
    }
    data_unit_kompetensi: UnitKompetensiAPI[]
    is_kompeten: boolean
    tindak_lanjut: string
    komentar: string
  }
}

interface EvidenceCheck {
  observasi: boolean
  portofolio: boolean
  pertanyaan_wawancara: boolean
  pertanyaan_lisan: boolean
  pertanyaan_tertulis: boolean
  proyek_kerja: boolean
}

export default function Ak02Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole, isAsesor1 } = useAsesorRole(id)
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { kegiatan, isAsesor } = useKegiatanByRole()

  // Get dynamic steps
  const asesmenSteps = getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode)

  // All asesor can fill (removed restriction to asesor_1 only)
  const isFormDisabled = !isAsesor
  const showPortofolio = parseInt(jenjang || '0') >= 4

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  // Note: absen akhir for asesi is now handled in Ak03Page
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

  // Form state
  const [evidenceChecks, setEvidenceChecks] = useState<Record<number, EvidenceCheck>>({})
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [tindakLanjut, setTindakLanjut] = useState('')
  const [komentar, setKomentar] = useState('')
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  } | null>(null)

  // Unit kompetensi state
  const [unitKompetensi, setUnitKompetensi] = useState<UnitKompetensi[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch unit kompetensi data
  const fetchAk02Data = useCallback(async () => {
    if (authLoading) return
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ak02`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result: Ak02Response = await response.json()
        if (result.message === "Success" && result.data?.data_unit_kompetensi) {
          if (result.data.barcodes) {
            setBarcodes({
              asesi: result.data.barcodes.asesi,
              asesor1: result.data.barcodes.asesor1,
              asesor2: result.data.barcodes.asesor2,
            })
          }

          const units: UnitKompetensi[] = []
          const checks: Record<number, EvidenceCheck> = {}

          result.data.data_unit_kompetensi.forEach((unit) => {
            units.push({ id: unit.id, kode: unit.kode, nama: unit.nama })
            checks[unit.id] = {
              observasi: unit.observasi,
              portofolio: unit.portofolio,
              pertanyaan_wawancara: unit.pertanyaan_wawancara,
              pertanyaan_lisan: unit.pertanyaan_lisan,
              pertanyaan_tertulis: unit.pertanyaan_tertulis,
              proyek_kerja: unit.proyek_kerja,
            }
          })

          setUnitKompetensi(units)
          setEvidenceChecks(checks)
          setIsKompeten(result.data.is_kompeten ?? null)
          setTindakLanjut(result.data.tindak_lanjut || '')
          setKomentar(result.data.komentar || '')
        }
      }
    } catch (err) {
      console.error("Error fetching AK02:", err)
    } finally {
      setIsLoading(false)
    }
  }, [id, authLoading])

  useEffect(() => { fetchAk02Data() }, [fetchAk02Data])

  // SSE: auto-refresh when another user saves
  const { publishUpdate } = useRealtimeSync({
    channelName: `asesmen:${id}`,
    onUpdate: fetchAk02Data
  })

  // Manual signature check (SSE-only — no polling)
  const asesor1Signed = !!barcodes?.asesor1?.url
  const asesor2Signed = !!barcodes?.asesor2?.url
  const allAsesorSigned = isAsesor || asesorList.length === 0 || (asesor1Signed && (asesorList.length < 2 || asesor2Signed))
  const missingAsesorLabels = asesorList.length === 0 ? [] : [
    !asesor1Signed && "Asesor 1",
    asesorList.length >= 2 && !asesor2Signed && "Asesor 2",
  ].filter(Boolean) as string[]

  // Sign-then-redirect + view-only
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

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data AK.02..." />
      </div>
    )
  }

  const handleEvidenceChange = (unitId: number, field: keyof EvidenceCheck) => {
    setEvidenceChecks(prev => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: !prev[unitId]?.[field]
      }
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(isAsesor ? "/asesor/dashboard" : "/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>AK.02</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ak02'))?.number || 5} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
            FR.AK.02 &nbsp;&nbsp; FORMULIR REKAMAN ASESMEN KOMPETENSI
          </h1>
        </div>

        {/* IDENTITAS Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</td>
              <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px',textAlign: 'end' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{tuk || '-'}</td>
            </tr>
            {asesorList.length > 1 ? (
              asesorList.map((asesor, idx) => (
                <tr key={asesor.id}>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Tanggal Asesmen</td>
              <td style={{ border: '1px solid #000', padding: '6px',textAlign: 'right' }}>Mulai :</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{tanggalUji ? new Date(tanggalUji).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px',textAlign: 'right' }}>Selesai :</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{tanggalUji ? new Date(tanggalUji).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '13px', marginBottom: '15px' }}>
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
        </p>

        {/* MATRIKS KOMPETENSI Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Unit kompetensi</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Observasi demonstrasi</th>
              {showPortofolio && <th style={{ border: '1px solid #000', padding: '6px' }}>Portofolio</th>}
              <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan wawancara</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan lisan</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan tertulis</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Proyek kerja</th>
            </tr>

            {unitKompetensi.map((unit) => (
              <tr key={unit.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {unit.kode}<br />
                  {unit.nama}
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.observasi || false}
                    onChange={() => handleEvidenceChange(unit.id, 'observasi')}
                    disabled={isFormDisabled || allSigned}
                    style={{ cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                {showPortofolio && (
                  <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                    <CustomCheckbox
                      checked={evidenceChecks[unit.id]?.portofolio || false}
                      onChange={() => handleEvidenceChange(unit.id, 'portofolio')}
                      disabled={isFormDisabled || allSigned}
                      style={{ cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}
                    />
                  </td>
                )}
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.pertanyaan_wawancara || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pertanyaan_wawancara')}
                    disabled={isFormDisabled || allSigned}
                    style={{ cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.pertanyaan_lisan || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pertanyaan_lisan')}
                    disabled={isFormDisabled || allSigned}
                    style={{ cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.pertanyaan_tertulis || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pertanyaan_tertulis')}
                    disabled={isFormDisabled || allSigned}
                    style={{ cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.proyek_kerja || false}
                    onChange={() => handleEvidenceChange(unit.id, 'proyek_kerja')}
                    disabled={isFormDisabled || allSigned}
                    style={{ cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}
                  />
                </td>
              </tr>
            ))}

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}><b>Rekomendasi hasil asesmen</b></td>
              <td colSpan={6} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '20px', cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}>
                  <CustomCheckbox
                    checked={isKompeten === true}
                    onChange={() => setIsKompeten(isKompeten === true ? null : true)}
                    disabled={isFormDisabled || allSigned}
                  />
                  Kompeten
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'pointer' }}>
                  <CustomCheckbox
                    checked={isKompeten === false}
                    onChange={() => setIsKompeten(isKompeten === false ? null : false)}
                    disabled={isFormDisabled || allSigned}
                  />
                  Belum kompeten
                </label>
              </td>
            </tr>

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <b>Tindak lanjut yang dibutuhkan</b><br />
                <span style={{ fontSize: '13px' }}>(Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)</span>
              </td>
              <td colSpan={6} style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  disabled={isFormDisabled || allSigned}
                  style={{ width: '100%', height: '70px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'text' }}
                  placeholder="Tuliskan tindak lanjut..."
                />
              </td>
            </tr>

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}><b>Komentar / Observasi oleh asesor</b></td>
              <td colSpan={6} style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  disabled={isFormDisabled || allSigned}
                  style={{ width: '100%', height: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: (isFormDisabled || allSigned) ? 'not-allowed' : 'text' }}
                  placeholder="Tuliskan komentar..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}><b>Asesi :</b></td>
            </tr>
            <tr>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img
                      src={barcodes.asesi.url}
                      alt="Tanda Tangan Asesi"
                      style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                    />
                    {barcodes.asesi.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {new Date(barcodes.asesi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>

            {/* Asesor rows - dynamic */}
            {asesorList.map((asesor, idx) => {
              const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
              const label = asesorList.length > 1 ? `Nama Asesor ${idx + 1}` : 'Nama Asesor'
              return (
                <React.Fragment key={asesor.id}>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{label}</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{asesor.nama?.toUpperCase() || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg {asesorList.length > 1 ? idx + 1 : ''}</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{asesor.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                    <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                      {asesorBarcode?.url ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <img
                            src={asesorBarcode.url}
                            alt={`Tanda Tangan ${asesor.nama}`}
                            style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                          />
                          {asesorBarcode.tanggal && (
                            <div style={{ fontSize: '11px', color: '#333' }}>
                              {new Date(asesorBarcode.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>

        {/* LAMPIRAN DOKUMEN */}
        <div style={{ fontSize: '13px', marginBottom: '15px' }}>
          <b>LAMPIRAN DOKUMEN:</b><br />
          1. Dokumen APL 01 peserta<br />
          2. Dokumen APL 02 peserta<br />
          3. Bukti-bukti berkualitas peserta<br />
          4. Tinjauan proses asesmen
        </div>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          {!allSigned && (
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px'  }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                disabled={allSigned}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa hasil frageman antara asesor ini telah saya isi dengan jujur dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>
          )}

          <AsesorSignatureGuard
            missingAsesorLabels={missingAsesorLabels}
            allAsesorSigned={allAsesorSigned}
            isAsesor={isAsesor}
          />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton
              variant="secondary"
              onClick={() => {
                const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak02'))
                const prevStep = asesmenSteps[currentStepIndex - 1]
                if (prevStep) {
                  const prevPath = prevStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
                  navigate(prevPath)
                } else {
                  navigate(`/asesi/asesmen/${id}/ia05`)
                }
              }}
            >
              Kembali
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={isSaving || (!allSigned && !agreedChecklist)}
              onClick={async () => {
                // If user already signed → navigate to next page
                if (hasSigned) {
                  const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak02'))
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
                  showWarning('Silakan centang pernyataan terlebih dahulu')
                  return
                }

                if (isKompeten === null) {
                  showWarning('Silakan pilih rekomendasi (Kompeten / Belum kompeten)')
                  return
                }

                if (!id) {
                  showWarning('ID tidak ditemukan')
                  return
                }

                setIsSaving(true)
                try {
                  const token = localStorage.getItem("access_token")

                  // Prepare answers array
                  const answers = unitKompetensi.map((unit) => ({
                    id_unit_kompetensi: unit.id,
                    observasi: evidenceChecks[unit.id]?.observasi || false,
                    ...(showPortofolio ? { portofolio: evidenceChecks[unit.id]?.portofolio || false } : {}),
                    pertanyaan_wawancara: evidenceChecks[unit.id]?.pertanyaan_wawancara || false,
                    pertanyaan_lisan: evidenceChecks[unit.id]?.pertanyaan_lisan || false,
                    pertanyaan_tertulis: evidenceChecks[unit.id]?.pertanyaan_tertulis || false,
                    proyek_kerja: evidenceChecks[unit.id]?.proyek_kerja || false,
                  }))

                  const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ak02`, {
                    method: 'POST',
                    headers: {
                      "Accept": "application/json",
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      answers,
                      is_kompeten: isKompeten,
                      tindak_lanjut: tindakLanjut,
                      komentar: komentar,
                    }),
                  })

                  if (response.ok) {
                    showSuccess('AK 02 berhasil disimpan!')

                    // Update state directly from response
                    const result: Ak02Response = await response.json()
                    if (result.data) {
                      if (result.data.barcodes) {
                        setBarcodes({
                          asesi: result.data.barcodes.asesi,
                          asesor1: result.data.barcodes.asesor1,
                          asesor2: result.data.barcodes.asesor2,
                        })
                      }
                      if (result.data.is_kompeten !== undefined) setIsKompeten(result.data.is_kompeten)
                      if (result.data.tindak_lanjut !== undefined) setTindakLanjut(result.data.tindak_lanjut)
                      if (result.data.komentar !== undefined) setKomentar(result.data.komentar)
                    }

                    // Generate QR for asesor if not exists
                    if (isAsesor) {
                      const existingAsesorQR = isAsesor1 ? barcodes?.asesor1?.url : barcodes?.asesor2?.url

                      if (jadwalId && !existingAsesorQR) {
                        try {
                          const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ak02`, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              id_jadwal: jadwalId
                            })
                          })

                          if (qrResponse.ok) {
                            const qrResult = await qrResponse.json()
                            if (qrResult.message === "Success" && qrResult.data?.url_image) {
                              // Update barcodes based on asesor role
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
                    } else {
                      // For asesi: generate QR if not exists
                      const existingAsesiQR = barcodes?.asesi?.url

                      if (jadwalId && !existingAsesiQR) {
                        try {
                          const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ak02`, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              id_jadwal: jadwalId
                            })
                          })

                          if (qrResponse.ok) {
                            const qrResult = await qrResponse.json()
                            if (qrResult.message === "Success" && qrResult.data?.url_image) {
                              setBarcodes(prev => ({ ...prev, asesi: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || namaAsesi || '' } }))
                            }
                          }
                        } catch (qrError) {
                          console.error('Error generating asesi QR:', qrError)
                        }
                      }
                    }
                    publishUpdate()
                  } else {
                    console.error('Failed to save AK02:', response.status)
                    showError('Gagal menyimpan data. Silakan coba lagi.')
                  }
                } catch (err) {
                  console.error('Error saving AK02:', err)
                  showError('Terjadi kesalahan. Silakan coba lagi.')
                } finally {
                  setIsSaving(false)
                }
              }}
            >
              {isSaving ? "Menyimpan..." : allSigned ? "Lanjut" : "Simpan & Tanda Tangan"}
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>

      {/* Absen Awal Modal */}
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
