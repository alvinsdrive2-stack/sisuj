import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useEffect, useState } from "react"

interface BuktiAsesmen {
  id: number
  nama: string
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

export default function FrAk01Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin } = useParams()

  const [buktiList, setBuktiList] = useState<BuktiAsesmen[]>([])
  const [formData, setFormData] = useState<Ak01Data>({
    buktiYangDikumpulkan: []
  })
  const [loading, setLoading] = useState(true)
  const [actualIdIzin, setActualIdIzin] = useState<string | undefined>(idIzin)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params or fetch from list-asesi
        let fetchedIdIzin = idIzin

        if (!fetchedIdIzin && kegiatan?.jadwal_id) {
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
          console.error("No id_izin found")
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
          const buktiData = await buktiRes.json()
          setBuktiList(buktiData.data || [])
        }

        // TODO: Fetch existing AK01 data if any
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [idIzin, kegiatan])

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

  const handleSave = () => {
    // TODO: Implement save logic
    navigate("/asesi/praasesmen/ak01-success")
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    )
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
                Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%', fontWeight: 'bold' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.skemaJudul || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.skemaNomor || '-'}</td>
            </tr>

            {/* Identitas */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.tuk || 'Sewaktu/Tempat Kerja/Mandiri*'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.namaAsesor || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.namaAsesi || user?.name || '-'}</td>
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
                      const isFirstColumn = index % 2 === 0
                      const isFirstInRow = index % 2 === 0
                      return (
                        <tr key={bukti.id}>
                          {isFirstInRow && (
                            <>
                              <td style={{ padding: '2px 4px', border: 'none' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={formData.buktiYangDikumpulkan?.includes(bukti.id) || false}
                                    onChange={(e) => handleBuktiChange(bukti.id, e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                  />
                                  {bukti.nama}
                                </label>
                              </td>
                              {buktiList[index + 1] ? (
                                <td style={{ padding: '2px 4px', border: 'none' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      checked={formData.buktiYangDikumpulkan?.includes(buktiList[index + 1].id) || false}
                                      onChange={(e) => handleBuktiChange(buktiList[index + 1].id, e.target.checked)}
                                      style={{ width: '18px', height: '18px' }}
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
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.hariTanggal || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Waktu</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.waktu || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{formData.tukPelaksanaan || ''}</td>
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
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                Tanda tangan Asesor : {formData.tandaTanganAsesor || '.............................................'}<br />
                Tanggal : {formData.tanggalTandaTanganAsesor || '.............................................'}
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', height: '70px', verticalAlign: 'bottom' }}>
                Tanda tangan Asesi : {formData.tandaTanganAsesi || '..............................................'}<br />
                Tanggal : {formData.tanggalTandaTanganAsesi || '.............................................'}
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '12px' }}>* Coret yang tidak perlu</p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={handleBack}
            style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '13px', cursor: 'pointer' }}
          >
            Kembali
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '8px 16px', background: '#0066cc', color: '#fff', fontSize: '13px', cursor: 'pointer', border: 'none' }}
          >
            Selesai
          </button>
        </div>
      </AsesiLayout>
    </div>
  )
}
