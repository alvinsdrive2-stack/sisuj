import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useEffect, useState } from "react"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"

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
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin

  const [buktiList, setBuktiList] = useState<BuktiAsesmen[]>([])
  const [formData, setFormData] = useState<Ak01Data>({
    buktiYangDikumpulkan: []
  })
  const [loading, setLoading] = useState(true)
  const [actualIdIzin, setActualIdIzin] = useState<string | undefined>(idIzin)
  const { jabatanKerja, nomorSkema, tuk, namaAsesor, asesorList, namaAsesi } = useDataDokumenPraAsesmen(actualIdIzin)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params or fetch from list-asesi
        let fetchedIdIzin = idIzin

        if (!fetchedIdIzin && !isAsesor && kegiatan?.jadwal_id) {
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
        setLoading(false)
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
          <ActionButton variant="secondary" onClick={handleBack}>
            Kembali
          </ActionButton>
          <ActionButton variant="primary" onClick={handleSave}>
            Selesai
          </ActionButton>
        </div>
      </AsesiLayout>
    </div>
  )
}
