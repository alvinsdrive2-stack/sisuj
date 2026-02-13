import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi, useKegiatanAsesor } from "@/hooks/useKegiatan"
import { useEffect, useState } from "react"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { useToast } from "@/contexts/ToastContext"

interface BuktiAsesmen {
  id: number
  nama: string
}

interface BarcodeData {
  url: string
  tanggal: string
  nama: string
}

interface Answer {
  id_referensi: number
  jawaban: boolean
}

interface Ak01Data {
  skemaJudul?: string
  skemaNomor?: string
  tuk?: string
  namaAsesor?: string
  namaAsesi?: string
  hariTanggal?: string
  waktu?: string
  tukPelaksanaan?: string
  buktiYangDikumpulkan?: number[]
  tandaTanganAsesor?: string
  tanggalTandaTanganAsesor?: string
  tandaTanganAsesi?: string
  tanggalTandaTanganAsesi?: string
}

interface Ak01ApiResponse {
  message: string
  data: {
    barcodes?: {
      asesi?: BarcodeData | null
      asesor1?: BarcodeData | null
      asesor2?: BarcodeData | null
    }
    items: BuktiAsesmen[]
  }
}

export default function FrAk01Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan: kegiatanAsesi } = useKegiatanAsesi()
  const { kegiatan: kegiatanAsesor } = useKegiatanAsesor()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const { showSuccess } = useToast()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin

  const [buktiList, setBuktiList] = useState<BuktiAsesmen[]>([])
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData | null
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  } | null>(null)
  const [formData, setFormData] = useState<Ak01Data>({
    buktiYangDikumpulkan: []
  })
  const [loading, setLoading] = useState(true)
  const [actualIdIzin, setActualIdIzin] = useState<string | undefined>(idIzin)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const { jabatanKerja, nomorSkema, tuk, namaAsesor, asesorList, namaAsesi, tanggalUji } = useDataDokumenPraAsesmen(actualIdIzin)

  const jadwalId = isAsesor ? kegiatanAsesor?.jadwal_id : kegiatanAsesi?.jadwal_id

  // Format tanggal_uji untuk Hari/Tanggal dan Waktu
  const formatTanggalUji = (tanggalUjiStr: string) => {
    if (!tanggalUjiStr) return { hariTanggal: '', waktu: '' }

    const date = new Date(tanggalUjiStr)

    // Format Hari/Tanggal: "Jumat, 06 Februari 2026"
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const hariTanggal = `${days[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`

    // Format Waktu: "19:05"
    const waktu = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

    return { hariTanggal, waktu }
  }

  const { hariTanggal, waktu } = formatTanggalUji(tanggalUji)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params or fetch from list-asesi
        let fetchedIdIzin = idIzin

        if (!fetchedIdIzin && !isAsesor && kegiatanAsesi?.jadwal_id) {
          const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatanAsesi.jadwal_id}/list-asesi`, {
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
          setLoading(false)
          return
        }

        // Fetch bukti asesmen options
        const buktiRes = await fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/ak01`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (buktiRes.ok) {
          const result: Ak01ApiResponse = await buktiRes.json()

          // Set bukti list and barcodes
          const data = result.data?.items || []
          setBuktiList(data)

          // Set barcodes from response
          if (result.data?.barcodes) {
            setBarcodes(result.data.barcodes)
          }

          // Set checked items from jawaban field
          const checkedIds = data
            .filter((item: any) => item.jawaban === true)
            .map((item: any) => item.id)
          setFormData(prev => ({ ...prev, buktiYangDikumpulkan: checkedIds }))
        }

        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    if (isAsesor && idIzin) {
      fetchData()
    } else if (kegiatanAsesi) {
      fetchData()
    }
  }, [idIzin, kegiatanAsesi, kegiatanAsesor, isAsesor])

  const handleBack = () => {
    navigate(-1)
  }

  const handleBuktiChange = (buktiId: number, checked: boolean) => {
    setFormData(prev => {
      const current = prev.buktiYangDikumpulkan || []
      if (checked) {
        return { ...prev, buktiYangDikumpulkan: [...current, buktiId] }
      } else {
        return { ...prev, buktiYangDikumpulkan: current.filter(id => id !== buktiId) }
      }
    })
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token")

      // Transform selected bukti to answers format
      const answers: Answer[] = buktiList.map(bukti => ({
        id_referensi: bukti.id,
        jawaban: formData.buktiYangDikumpulkan?.includes(bukti.id) || false
      }))

      const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/ak01`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      })

      if (response.ok) {
        // Generate QR for asesor after save (only if not already exists)
        if (isAsesor && jadwalId) {
          const currentAsesorId = String(user?.id)
          const isAsesor1 = asesorList.length === 0 || asesorList.findIndex(a => String(a.id) === currentAsesorId) === 0
          const barcodeKey = isAsesor1 ? 'asesor1' : 'asesor2'

          // Only generate QR if not exists
          if (!barcodes?.[barcodeKey]?.url) {
            try {
              const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${actualIdIzin}/ak01`, {
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
                  setBarcodes(prev => ({
                    ...prev,
                    [barcodeKey]: {
                      url: qrResult.data.url_image,
                      tanggal: new Date().toISOString(),
                      nama: user?.name || ''
                    }
                  }))
                }
              }
            } catch (qrError) {
              console.error('Error generating QR:', qrError)
            }
          }

          showSuccess('Data berhasil disimpan!')
          setTimeout(() => navigate("/asesi/praasesmen/ak01-success"), 500)
          return
        }

        // Generate QR for asesi (only if not already exists)
        if (!isAsesor && jadwalId && !barcodes?.asesi?.url) {
          try {
            const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${actualIdIzin}/ak01`, {
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
                setBarcodes(prev => ({
                  ...prev,
                  asesi: {
                    url: qrResult.data.url_image,
                    tanggal: new Date().toISOString(),
                    nama: user?.name || ''
                  }
                }))
              }
            }
          } catch (qrError) {
            console.error('Error generating QR:', qrError)
          }
        }

        // Navigate to success page
        navigate("/asesi/praasesmen/ak01-success")
      } else {
        console.error('Failed to save:', await response.text())
      }
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  if (loading) {
    return <FullPageLoader text="Memuat data..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px', color: '#000', padding: '20px' }}>
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
            <span>FR.AK.01</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={9}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>FR.AK.01 - PERSETUJUAN ASESMEN</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>Isi atau lengkapi data formulir AK 01 di bawah ini</p>
        </div>

        {/* Form Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: '#fff' }}>
          <tbody>
            {/* Penjelasan */}
            <tr>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah diberi arahan
                secara rinci tentang perencanaan dan proses asesmen
              </td>
            </tr>

            {/* Skema Sertifikasi */}
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', fontWeight: 'bold', verticalAlign: 'top' }}>
                Skema Sertifikasi<br />(̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%', fontWeight: 'bold' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{jabatanKerja?.toUpperCase() || formData.skemaJudul || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{nomorSkema?.toUpperCase() || formData.skemaNomor || '-'}</td>
            </tr>

            {/* Identitas */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{tuk?.toUpperCase() || formData.tuk || 'Sewaktu/Tempat Kerja/Mandiri*'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                {asesorList.length > 0 ? (
                  asesorList.map((asesor, idx) => (
                    <span key={asesor.id}>
                      {idx > 0 && ', '}
                      {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                    </span>
                  ))
                ) : (
                  namaAsesor?.toUpperCase() || formData.namaAsesor || '-'
                )}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || formData.namaAsesi || '-'}</td>
            </tr>

            {/* Bukti yang akan dikumpulkan */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>
                Bukti yang akan dikumpulkan :
              </td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {buktiList.map((bukti, index) => {
                      const isFirstInRow = index % 2 === 0
                      return (
                        <tr key={bukti.id}>
                          {isFirstInRow && (
                            <>
                              <td style={{ padding: '2px 4px', border: 'none' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <CustomCheckbox
                                    checked={formData.buktiYangDikumpulkan?.includes(bukti.id) || false}
                                    onChange={() => handleBuktiChange(bukti.id, !formData.buktiYangDikumpulkan?.includes(bukti.id))}
                                  />
                                  {bukti.nama}
                                </label>
                              </td>
                              {buktiList[index + 1] ? (
                                <td style={{ padding: '2px 4px', border: 'none' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <CustomCheckbox
                                      checked={formData.buktiYangDikumpulkan?.includes(buktiList[index + 1].id) || false}
                                      onChange={() => handleBuktiChange(buktiList[index + 1].id, !formData.buktiYangDikumpulkan?.includes(buktiList[index + 1].id))}
                                    />
                                    {buktiList[index + 1].nama}
                                  </label>
                                </td>
                              ) : (
                                <td style={{ padding: '2px 4px', border: 'none' }}></td>
                              )}
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Jadwal Pelaksanaan */}
            <tr>
              <td rowSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>
                Pelaksanaan asesmen disepakati pada:
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Hari / Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{hariTanggal || formData.hariTanggal || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Waktu</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{waktu || formData.waktu || ''} - Selesai</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{tuk?.toUpperCase() || formData.tukPelaksanaan || ''}</td>
            </tr>

            {/* Pernyataan Asesor */}
            <tr>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ fontWeight: 'bold' }}>Asesor :</span><br /><br />
                Menyatakan tidak akan membuka hasil pekerjaan yang saya peroleh karena
                penugasan saya sebagai Asesor dalam pekerjaan Asesmen kepada siapapun
                atau organisasi apapun selain kepada pihak yang berwenang sehubungan
                dengan kewajiban saya sebagai Asesor yang ditugaskan oleh LSP.
              </td>
            </tr>

            {/* Pernyataan Asesi */}
            <tr>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ fontWeight: 'bold' }}>Asesi :</span><br /><br />
                Saya setuju mengikuti asesmen dengan pemahaman bahwa informasi yang
                dikumpulkan hanya digunakan untuk pengembangan profesional dan hanya
                dapat diakses oleh orang tertentu saja.
              </td>
            </tr>

            {/* Tanda Tangan */}
            {barcodes?.asesor2?.url ? (
              // Jika ada 2 asesor, tampilkan 2 baris terpisah
              <>
                <tr>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      Tanda tangan Asesor 1 :<br />
                      {barcodes?.asesor1?.url ? (
                        <>
                          <img src={barcodes.asesor1.url} alt="Tanda Tangan Asesor 1" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
                            {barcodes.asesor1.nama?.toUpperCase()}
                          </div>
                          {barcodes?.asesor1?.tanggal && (
                            <span style={{ fontSize: '10px', color: '#666' }}>
                              {new Date(barcodes.asesor1.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{formData.tandaTanganAsesor || '.............................................'}</span>
                      )}
                    </div>
                  </td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      Tanda tangan Asesor 2 :<br />
                      {barcodes?.asesor2?.url ? (
                        <>
                          <img src={barcodes.asesor2.url} alt="Tanda Tangan Asesor 2" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
                            {barcodes.asesor2.nama?.toUpperCase()}
                          </div>
                          {barcodes?.asesor2?.tanggal && (
                            <span style={{ fontSize: '10px', color: '#666' }}>
                              {new Date(barcodes.asesor2.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{formData.tandaTanganAsesor || '.............................................'}</span>
                      )}
                    </div>
                  </td>
                </tr>
                {/* Asesi tetap ditampilkan di baris terpisah */}
                <tr>
                  <td colSpan={4} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      Tanda tangan Asesi :<br />
                      {barcodes?.asesi?.url ? (
                        <>
                          <img src={barcodes.asesi.url} alt="Tanda Tangan Asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
                            {barcodes.asesi.nama?.toUpperCase()}
                          </div>
                          {barcodes?.asesi?.tanggal && (
                            <span style={{ fontSize: '10px', color: '#666' }}>
                              {new Date(barcodes.asesi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{formData.tandaTanganAsesi || '..............................................'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              </>
            ) : (
              // Jika hanya 1 asesor atau belum ada QR, tampilkan 1 baris
              <tr>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    Tanda tangan Asesor :<br />
                    {barcodes?.asesor1?.url ? (
                      <>
                        <img src={barcodes.asesor1.url} alt="Tanda Tangan Asesor" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
                          {barcodes.asesor1.nama?.toUpperCase()}
                        </div>
                        {barcodes?.asesor1?.tanggal && (
                          <span style={{ fontSize: '10px', color: '#666' }}>
                            {new Date(barcodes.asesor1.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </>
                    ) : (
                      <span>{formData.tandaTanganAsesor || '.............................................'}</span>
                    )}
                  </div>
                </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Tanda tangan Asesi :<br />
                  {barcodes?.asesi?.url ? (
                    <>
                      <img src={barcodes.asesi.url} alt="Tanda Tangan Asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
                        {barcodes.asesi.nama?.toUpperCase()}
                      </div>
                      {barcodes?.asesi?.tanggal && (
                        <span style={{ fontSize: '10px', color: '#666' }}>
                          {new Date(barcodes.asesi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>{formData.tandaTanganAsesi || '..............................................'}</span>
                  )}
                </div>
              </td>

            </tr>
            )}
          </tbody>
        </table>

        <p style={{ fontSize: '12px' }}>* Coret yang tidak perlu</p>

        {/* Pernyataan */}
        <div style={{ background: '#fff', border: '1px solid #000', marginBottom: '20px', padding: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <CustomCheckbox
              checked={agreedChecklist}
              onChange={() => setAgreedChecklist(!agreedChecklist)}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
              <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan menyetujui isi FR.AK.01 (Persetujuan Asesmen) ini dengan sebenar-benarnya.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <ActionButton variant="secondary" onClick={handleBack}>
            Kembali
          </ActionButton>
          <ActionButton variant="primary" onClick={handleSave} disabled={!agreedChecklist}>
            Selesai
          </ActionButton>
        </div>
      </AsesiLayout>
    </div>
  )
}
