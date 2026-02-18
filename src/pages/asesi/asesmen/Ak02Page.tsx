import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"

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
  const { jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { kegiatan, isAsesor } = useKegiatanByRole()

  // Get dynamic steps
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  // Disable form if asesor_2 (only asesor_1 can fill)
  const isFormDisabled = isAsesor && !isAsesor1

  // Form state
  const [evidenceChecks, setEvidenceChecks] = useState<Record<number, EvidenceCheck>>({})
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [tindakLanjut, setTindakLanjut] = useState('')
  const [komentar, setKomentar] = useState('')
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  } | null>(null)

  // Unit kompetensi state
  const [unitKompetensi, setUnitKompetensi] = useState<UnitKompetensi[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch unit kompetensi data
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to load
      if (authLoading) {
        return
      }

      if (!id) {
        console.error("No id_izin found")
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak02`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: Ak02Response = await response.json()
          if (result.message === "Success" && result.data?.data_unit_kompetensi) {
            // Set barcodes from API
            if (result.data.barcodes) {
              setBarcodes({
                asesi: result.data.barcodes.asesi,
                asesor1: result.data.barcodes.asesor1,
                asesor2: result.data.barcodes.asesor2,
              })
            }

            // Transform API data and set evidenceChecks
            const units: UnitKompetensi[] = []
            const checks: Record<number, EvidenceCheck> = {}

            result.data.data_unit_kompetensi.forEach((unit) => {
              units.push({
                id: unit.id,
                kode: unit.kode,
                nama: unit.nama,
              })

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

            // Set other fields from API
            setIsKompeten(result.data.is_kompeten ?? null)
            setTindakLanjut(result.data.tindak_lanjut || '')
            setKomentar(result.data.komentar || '')
          }
        } else {
          console.warn(`Unit Kompetensi AK02 API returned ${response.status}`)
        }
      } catch (err) {
        console.error("Error fetching unit kompetensi AK02:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, authLoading])

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
            FR.AK.02 &nbsp;&nbsp; FRASEMEN ANTARA ASESOR
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
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px',textAlign: 'right' }}>Selesai :</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '13px', marginBottom: '15px' }}>
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
        </p>

        {/* MATRIKS KOMPETENSI Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Unit kompetensi</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Observasi demonstrasi</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Portofolio</th>
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
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.portofolio || false}
                    onChange={() => handleEvidenceChange(unit.id, 'portofolio')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.pertanyaan_wawancara || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pertanyaan_wawancara')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.pertanyaan_lisan || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pertanyaan_lisan')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.pertanyaan_tertulis || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pertanyaan_tertulis')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={evidenceChecks[unit.id]?.proyek_kerja || false}
                    onChange={() => handleEvidenceChange(unit.id, 'proyek_kerja')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
              </tr>
            ))}

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}><b>Rekomendasi hasil asesmen</b></td>
              <td colSpan={6} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '20px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}>
                  <CustomCheckbox
                    checked={isKompeten === true}
                    onChange={() => setIsKompeten(isKompeten === true ? null : true)}
                    disabled={isFormDisabled}
                  />
                  Kompeten
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}>
                  <CustomCheckbox
                    checked={isKompeten === false}
                    onChange={() => setIsKompeten(isKompeten === false ? null : false)}
                    disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                  style={{ width: '100%', height: '70px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isFormDisabled ? 'not-allowed' : 'text' }}
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
                  disabled={isFormDisabled}
                  style={{ width: '100%', height: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isFormDisabled ? 'not-allowed' : 'text' }}
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
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px'  }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa hasil frageman antara asesor ini telah saya isi dengan jujur dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>

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
              disabled={!agreedChecklist}
              onClick={async () => {
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

                try {
                  const token = localStorage.getItem("access_token")

                  // Prepare answers array
                  const answers = unitKompetensi.map((unit) => ({
                    id_unit_kompetensi: unit.id,
                    observasi: evidenceChecks[unit.id]?.observasi || false,
                    portofolio: evidenceChecks[unit.id]?.portofolio || false,
                    pertanyaan_wawancara: evidenceChecks[unit.id]?.pertanyaan_wawancara || false,
                    pertanyaan_lisan: evidenceChecks[unit.id]?.pertanyaan_lisan || false,
                    pertanyaan_tertulis: evidenceChecks[unit.id]?.pertanyaan_tertulis || false,
                    proyek_kerja: evidenceChecks[unit.id]?.proyek_kerja || false,
                  }))

                  const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak02`, {
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

                    // Generate QR for asesor only if not exists
                    if (isAsesor) {
                      const jadwalId = kegiatan?.jadwal_id
                      const existingAsesorQR = isAsesor1 ? barcodes?.asesor1?.url : barcodes?.asesor2?.url

                      if (jadwalId && !existingAsesorQR) {
                        try {
                          const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${id}/ak02`, {
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
                    }

                    // Find current step (AK.02) and navigate to next step
                    const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak02'))
                    const nextStep = asesmenSteps[currentStepIndex + 1]
                    if (nextStep) {
                      const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
                      setTimeout(() => navigate(nextPath), 1500)
                    } else {
                      setTimeout(() => navigate(`/asesi/asesmen/${id}/selesai`), 1500)
                    }
                  } else {
                    console.error('Failed to save AK02:', response.status)
                    showError('Gagal menyimpan data. Silakan coba lagi.')
                  }
                } catch (err) {
                  console.error('Error saving AK02:', err)
                  showError('Terjadi kesalahan. Silakan coba lagi.')
                }
              }}
            >
              Simpan & Lanjut
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
