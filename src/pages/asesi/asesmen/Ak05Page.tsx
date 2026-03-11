import React, { useState, useEffect } from "react"
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
import { WebcamModal } from "@/components/ui/WebcamModal"

type BarcodeData = {
  url: string
  tanggal: string
  nama: string
}

interface Ak05Data {
  kompeten: boolean
  keterangan: string
  aspek_positif_negatif: string
  pencatatan_penolakan: string
  saran: string
  catatan: string
}

export default function Ak05Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role } = useAsesorRole(id)
  const { jenjang, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesor, namaAsesi } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { kegiatan } = useKegiatanByRole()

  // Get dynamic steps - AK.05 is only for asesor
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  // Redirect asesi away from this page
  useEffect(() => {
    if (!isAsesor && !authLoading) {
      navigate('/asesi/dashboard')
    }
  }, [isAsesor, authLoading, navigate])

  // All asesor can edit (removed restriction to asesor_1 only)
  const canEdit = isAsesor

  const resolvedAsesorRole = role || 'none'
  const asesmenSteps = getAsesmenSteps(jenjang, isAsesor, resolvedAsesorRole, asesorList.length)
  const currentStep = asesmenSteps.find(s => s.href.includes('ak05'))?.number

  // Absen check
  const {
    showAwalModal,
    showAkhirModal,
    setShowAkhirModal,
    submitAbsenAwal,
    submitAbsenAkhir,
    handleAwalModalClose,
    handleAkhirModalClose,
    shouldShowAkhirModal,
  } = useAbsenCheck({
    phase: 'asesmen',
    role: 'auto',
    checkOnMount: true,
    idIzin: id,
    asesorList
  })

  // Form state - from GET API
  const [ak05Data, setAk05Data] = useState<Ak05Data>({
    kompeten: false,
    keterangan: '',
    aspek_positif_negatif: '',
    pencatatan_penolakan: '',
    saran: '',
    catatan: '',
  })
  const [barcodes, setBarcodes] = useState<{
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  }>({ asesor1: null, asesor2: null })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch AK05 data - GET only
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !id) return

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak05`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.message === "Success" && result.data) {
            // kompeten: true = K, false = BK
            setAk05Data({
              kompeten: result.data.kompeten || false,
              keterangan: result.data.answers?.keterangan || '',
              aspek_positif_negatif: result.data.answers?.aspek || '',
              pencatatan_penolakan: result.data.answers?.pencatatan_penolakan || '',
              saran: result.data.answers?.saran || '',
              catatan: result.data.answers?.catatan || '',
            })
            // Handle barcodes
            if (result.data.barcodes) {
              setBarcodes({
                asesor1: result.data.barcodes.asesor1 || null,
                asesor2: result.data.barcodes.asesor2 || null,
              })
            }
          }
        }
      } catch (err) {
        console.error("Error fetching AK05:", err)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [id, authLoading])

  const handleSave = async () => {
    if (!id) {
      showWarning('ID tidak ditemukan')
      return
    }

    try {
      const token = localStorage.getItem("access_token")

      // POST AK05 data
      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak05`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kompeten: ak05Data.kompeten,
          keterangan: ak05Data.keterangan,
          aspek: ak05Data.aspek_positif_negatif,
          pencatatan_penolakan: ak05Data.pencatatan_penolakan,
          saran: ak05Data.saran,
          catatan: ak05Data.catatan,
        }),
      })

      if (response.ok) {
        showSuccess('AK 05 berhasil disimpan!')

        // POST QR for asesor if not exists
        const existingQR = role === 'asesor_1' ? barcodes.asesor1?.url : barcodes.asesor2?.url

        if (!existingQR) {
          const jadwalId = kegiatan?.jadwal_id

          if (jadwalId) {
            try {
              const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${id}/ak05`, {
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
                  if (role === 'asesor_1') {
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
      } else {
        showError('Gagal menyimpan data. Silakan coba lagi.')
        return
      }
    } catch (err) {
      console.error('Error saving AK05:', err)
      showError('Terjadi kesalahan. Silakan coba lagi.')
      return
    }

    // Check if absen akhir is needed
    const needAbsenAkhir = await shouldShowAkhirModal()
    if (needAbsenAkhir) {
      setShowAkhirModal(true)
    } else {
      setTimeout(() => navigate(`/asesi/asesmen/${id}/ak06`), 500)
    }
  }

  // Handle absen akhir submit
  const handleAbsenAkhirSubmit = async (imageBlob: Blob) => {
    await submitAbsenAkhir(imageBlob)
    setTimeout(() => navigate(`/asesi/asesmen/${id}/ak06`), 500)
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data AK.05..." />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesor/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>AK.05</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={currentStep || 7} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            FR.AK.05 &nbsp;&nbsp; LAPORAN ASESMEN
          </h1>
        </div>

        {/* HEADER Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)</td>
              <td style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ width: '5%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{tuk || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesor?.toUpperCase() || user?.name?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
          </tbody>
        </table>

        {/* TABEL ASESI - Single row for current asesi */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }} rowSpan={2}>No.</th>
              <th style={{ width: '35%', border: '1px solid #000', padding: '6px' }} rowSpan={2}>Nama Asesi</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Rekomendasi</th>
              <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }} rowSpan={2}>Keterangan**</th>
            </tr>
            <tr style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>K</th>
              <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>BK</th>
            </tr>

            <tr>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1.</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi || '-'}</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                <CustomCheckbox
                  checked={ak05Data.kompeten}
                  onChange={() => canEdit && setAk05Data(prev => ({ ...prev, kompeten: !prev.kompeten }))}
                  style={{ cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}
                />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                <CustomCheckbox
                  checked={!ak05Data.kompeten}
                  onChange={() => canEdit && setAk05Data(prev => ({ ...prev, kompeten: !prev.kompeten }))}
                  style={{ cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}
                />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={ak05Data.keterangan}
                  onChange={(e) => canEdit && setAk05Data(prev => ({ ...prev, keterangan: e.target.value }))}
                  disabled={!canEdit}
                  style={{ width: '100%', height: 'auto', minHeight: '40px', border: '1px solid #ccc', padding: '4px', fontSize: '13px', resize: 'vertical', cursor: canEdit ? 'text' : 'not-allowed' }}
                  placeholder="Keterangan..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '11px', color: '#666', marginBottom: '15px' }}>
          ** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila mengases satu skema
        </p>

        {/* CATATAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Aspek Negatif dan Positif dalam Asesmen</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={ak05Data.aspek_positif_negatif}
                  onChange={(e) => canEdit && setAk05Data(prev => ({ ...prev, aspek_positif_negatif: e.target.value }))}
                  disabled={!canEdit}
                  style={{ width: '100%', height: 'auto', minHeight: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'vertical', cursor: canEdit ? 'text' : 'not-allowed' }}
                  placeholder="Tuliskan aspek positif dan negatif..."
                />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Pencatatan Penolakan Hasil Asesmen</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={ak05Data.pencatatan_penolakan}
                  onChange={(e) => canEdit && setAk05Data(prev => ({ ...prev, pencatatan_penolakan: e.target.value }))}
                  disabled={!canEdit}
                  style={{ width: '100%', height: 'auto', minHeight: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'vertical', cursor: canEdit ? 'text' : 'not-allowed' }}
                  placeholder="Tuliskan pencatatan penolakan..."
                />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Saran Perbaikan :<br />(Asesor/Personil Terkait)</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={ak05Data.saran}
                  onChange={(e) => canEdit && setAk05Data(prev => ({ ...prev, saran: e.target.value }))}
                  disabled={!canEdit}
                  style={{ width: '100%', height: 'auto', minHeight: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'vertical', cursor: canEdit ? 'text' : 'not-allowed' }}
                  placeholder="Tuliskan saran perbaikan..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER Table - Both Asesor Signatures, Catatan only for Asesor 1 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            {asesorList.map((asesor, index) => {
              const asesorBarcode = index === 0 ? barcodes.asesor1 : barcodes.asesor2
              const label = `Asesor ${index + 1}`
              return (
                <React.Fragment key={asesor.id}>
                  {/* Row 1: Catatan (only for Asesor 1) OR Label (for Asesor 2) */}
                  <tr>
                    {index === 0 ? (
                      <td style={{ width: '27%', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }} rowSpan={asesorList.length * 4}>
                        <b>Catatan Asesor 1 :</b>
                        <div style={{ marginTop: '8px' }}>
                          <textarea
                            value={ak05Data.catatan}
                            onChange={(e) => canEdit && setAk05Data(prev => ({ ...prev, catatan: e.target.value }))}
                            disabled={!canEdit}
                            style={{ width: '100%', height: 'auto', minHeight: '80px', border: '1px solid #ccc', padding: '4px', fontSize: '12px', resize: 'vertical', cursor: canEdit ? 'text' : 'not-allowed' }}
                            placeholder="Tuliskan catatan..."
                          />
                        </div>
                      </td>
                    ) : (
                      ""
                    )}
                    <td colSpan={3} style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>{label}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{asesor.nama?.toUpperCase() || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{asesor.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan / Tanggal</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {asesorBarcode ? (
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
                      ) : (
                        <div style={{ minHeight: '50px' }}></div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>

        {!canEdit && (
          <p style={{ fontSize: '12px', color: '#d10000', fontStyle: 'italic', marginBottom: '15px' }}>
            * Hanya Asesor 1 yang dapat mengisi form ini
          </p>
        )}

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton
              variant="secondary"
              onClick={() => {
                const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak05'))
                const prevStep = asesmenSteps[currentStepIndex - 1]
                if (prevStep) {
                  const prevPath = prevStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
                  navigate(prevPath)
                }
              }}
            >
              Kembali
            </ActionButton>
            <ActionButton variant="primary" onClick={handleSave}>
              Lanjut
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
