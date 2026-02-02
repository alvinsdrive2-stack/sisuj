import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { XCircle, ArrowLeft } from "lucide-react"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"

interface DataPribadi {
  nama: string
  nik: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  kebangsaan: string
  alamat: string
  telepon_rumah: string | null
  telepon_hp: string
  kode_pos: string | null
  email: string
  kualifikasi: string
}

interface DataPekerjaan {
  perusahaan: string
  jabatan: string
  alamat_kantor: string | null
  kode_pos: string | null
  telepon_kantor: string | null
  fax: string | null
  email_kantor: string | null
}

interface SertifikasiOption {
  id: string
  label: string
  checked: boolean
}

interface DataSertifikasi {
  judul: string
  nomor: string
  options: SertifikasiOption[]
}

interface UnitKompetensi {
  kode: string
  nama: string
}

interface BuktiPersyaratan {
  no: string
  bukti: string
}

interface BuktiAdministratif {
  no: string
  bukti: string
}

interface ApiResponse {
  message: string
  data: {
    data_pribadi: DataPribadi
    data_pekerjaan: DataPekerjaan
    data_sertifikasi?: DataSertifikasi
    is_memenuhi_syarat?: boolean
    skkni?: string
    data_unit_kompetensi?: Array<{
      kode: string
      nama: string
    }>
    bukti_persyaratan?: Array<{
      no: string
      bukti: string
    }>
    bukti_administratif?: Array<{
      no: string
      bukti: string
    }>
  }
}

// Format tanggal: 21-Juli-2000
function formatDateIndo(dateString: string): string {
  const date = new Date(dateString)
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export default function Apl01Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const [dataPribadi, setDataPribadi] = useState<DataPribadi | null>(null)
  const [dataPekerjaan, setDataPekerjaan] = useState<DataPekerjaan | null>(null)
  const [dataSertifikasi, setDataSertifikasi] = useState<DataSertifikasi | null>(null)
  const [dataUnitKompetensi, setDataUnitKompetensi] = useState<UnitKompetensi[]>([])
  const [buktiPersyaratan, setBuktiPersyaratan] = useState<BuktiPersyaratan[]>([])
  const [buktiAdministratif, setBuktiAdministratif] = useState<BuktiAdministratif[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [idIzin, setIdIzin] = useState<string | null>(null)
  const [skkni, setSkkni] = useState<string>("")

  // Form state for data pribadi
  const [formDataPribadi, setFormDataPribadi] = useState<DataPribadi>({
    nama: "",
    nik: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    kebangsaan: "",
    alamat: "",
    telepon_rumah: "",
    telepon_hp: "",
    kode_pos: "",
    email: "",
    kualifikasi: ""
  })

  // Form state for data pekerjaan - sesuai API response
  const [formDataPekerjaan, setFormDataPekerjaan] = useState<DataPekerjaan>({
    perusahaan: "",
    jabatan: "",
    alamat_kantor: "",
    kode_pos: "",
    telepon_kantor: "",
    fax: "",
    email_kantor: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        if (!kegiatan?.jadwal_id) {
          console.error("No jadwal_id found in kegiatan")
          setIsLoading(false)
          return
        }

        // Fetch id_izin dari list-asesi endpoint
        const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        let fetchedIdIzin: string | null = null

        if (listAsesiResponse.ok) {
          const listResult = await listAsesiResponse.json()
          if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
            // Ambil id_izin dari asesi pertama (seharusnya asesi yang sedang login)
            fetchedIdIzin = listResult.list_asesi[0].id_izin
            setIdIzin(fetchedIdIzin)
          }
        }

        if (!fetchedIdIzin) {
          console.error("No id_izin found in list-asesi response")
          setIsLoading(false)
          return
        }

        // Fetch APL 01 data pakai id_izin
        const apl01Response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/apl01`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (apl01Response.ok) {
          const result: ApiResponse = await apl01Response.json()
          if (result.message === "Success") {
            setDataPribadi(result.data.data_pribadi)
            setDataPekerjaan(result.data.data_pekerjaan)
            setFormDataPribadi(result.data.data_pribadi)
            setFormDataPekerjaan(result.data.data_pekerjaan)
            if (result.data.data_sertifikasi) {
              setDataSertifikasi(result.data.data_sertifikasi)
            }
            if (result.data.data_unit_kompetensi) {
              setDataUnitKompetensi(result.data.data_unit_kompetensi)
            }
            if (result.data.bukti_persyaratan) {
              setBuktiPersyaratan(result.data.bukti_persyaratan)
            }
            if (result.data.bukti_administratif) {
              setBuktiAdministratif(result.data.bukti_administratif)
            }
            if (result.data.skkni) {
              setSkkni(result.data.skkni)
            }
          }
        }
        // If API fails (404, 500, etc), continue with empty form
      } catch (error) {
        console.error("Error fetching APL 01:", error)
        // Continue with empty form, don't show toast error
      } finally {
        setIsLoading(false)
      }
    }

    if (kegiatan) {
      fetchData()
    }
  }, [kegiatan])

  const handleSave = async () => {
    // Langsung navigasi ke APL 02 tanpa POST dulu
    navigate(`/asesi/praasesmen/${idIzin}/apl02`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f5f5f5' }}>
        <div className="text-center">
          <SimpleSpinner size="lg" className="mx-auto mb-4" style={{ color: '#666' }} />
          <p style={{ color: '#666' }}>Memuat data APL 01...</p>
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
            <span>FR APL 01</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={2}>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>FR. APL.01 - FORMULIR APL 01</h2>
              <p style={{ fontSize: '13px', color: '#666' }}>Isi atau lengkapi data formulir APL 01 di bawah ini</p>
            </div>

            {/* A. DATA PRIBADI */}
            <div style={{  padding: '8px 12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>A. DATA PRIBADI</span>
            </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Nama</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={formDataPribadi.nama}
                  disabled
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>No. NIK</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={formDataPribadi.nik}
                  disabled
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Tempat/tgl. Lahir</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={formDataPribadi.tempat_lahir}
                    disabled
                    placeholder="Tempat Lahir"
                    style={{ flex: 1, padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                  />
                  <input
                    type="date"
                    value={formDataPribadi.tanggal_lahir}
                    disabled
                    style={{ flex: 1, padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5' }}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Jenis kelamin</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <select
                  value={formDataPribadi.jenis_kelamin}
                  disabled
                  style={{ padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', minWidth: '150px', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                >
                  <option value="">Pilih</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Kebangsaan</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={formDataPribadi.kebangsaan}
                  disabled
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Alamat</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <textarea
                  value={formDataPribadi.alamat}
                  disabled
                  rows={3}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', resize: 'vertical', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>No. Telp/E-mail</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '80px', padding: '2px', textTransform: 'uppercase' }}>Rumah</td>
                      <td style={{ padding: '2px' }}>
                        <input
                          type="text"
                          value={formDataPribadi.telepon_rumah || ""}
                          disabled
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                        />
                      </td>
                      <td style={{ width: '30px', padding: '2px', textTransform: 'uppercase' }}>HP</td>
                      <td style={{ padding: '2px' }}>
                        <input
                          type="text"
                          value={formDataPribadi.telepon_hp}
                          disabled
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: '80px', padding: '2px', textTransform: 'uppercase' }}>Email</td>
                      <td colSpan={3} style={{ padding: '2px' }}>
                        <input
                          type="email"
                          value={formDataPribadi.email}
                          disabled
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Kualifikasi/Pendidikan</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={formDataPribadi.kualifikasi}
                  disabled
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'not-allowed', background: '#f5f5f5', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* B. DATA PEKERJAAN */}
        <div style={{  padding: '8px 12px', marginBottom: '10px'}}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>B. DATA PEKERJAAN</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Nama Perusahaan</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={formDataPekerjaan.perusahaan}
                  onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, perusahaan: e.target.value })}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Jabatan</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={formDataPekerjaan.jabatan}
                  onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, jabatan: e.target.value })}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Alamat Perusahaan</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <textarea
                  value={formDataPekerjaan.alamat_kantor || ""}
                  onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, alamat_kantor: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', resize: 'vertical', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>No. Telp/Fax/Email</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50px', padding: '2px', textTransform: 'uppercase' }}>Telp</td>
                      <td style={{ padding: '2px' }}>
                        <input
                          type="text"
                          value={formDataPekerjaan.telepon_kantor || ""}
                          onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, telepon_kantor: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase' }}
                        />
                      </td>
                      <td style={{ width: '40px', padding: '2px', textTransform: 'uppercase' }}>Fax</td>
                      <td style={{ padding: '2px' }}>
                        <input
                          type="text"
                          value={formDataPekerjaan.fax || ""}
                          onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, fax: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: '50px', padding: '2px', textTransform: 'uppercase' }}>Email</td>
                      <td colSpan={3} style={{ padding: '2px' }}>
                        <input
                          type="email"
                          value={formDataPekerjaan.email_kantor || ""}
                          onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, email_kantor: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase' }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* C. DATA SERTIFIKASI */}
        <div style={{  padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>C. DATA SERTIFIKASI</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '14px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            {/* Skema Sertifikasi */}
            <tr>
              <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Skema Sertifikasi Okupasi Nasional
              </td>
              <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>Judul</td>
              <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle' }}>
                : {dataSertifikasi?.judul || '-'}
              </td>
            </tr>
            <tr>
              <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>Nomor</td>
              <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle' }}>
                : {dataSertifikasi?.nomor || '-'}
              </td>
            </tr>

            {/* Tujuan Asesmen */}
            {dataSertifikasi?.options && dataSertifikasi.options.length > 0 ? (
              dataSertifikasi.options.map((option, index) => (
                <tr key={option.id}>
                  {index === 0 && (
                    <td rowSpan={dataSertifikasi.options.length} style={{ width: '25%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Tujuan Asesmen
                    </td>
                  )}
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <input type="checkbox" checked={option.checked} disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>{option.label}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td rowSpan={5} style={{ width: '25%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Tujuan Asesmen
                  </td>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Sertifikasi</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Sertifikasi Ulang</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Pengakuan Kompetensi Terkini (PKT)</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Rekognisi pembelajaran lampau</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Lainnya:</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* D. DAFTAR UNIT KOMPETENSI */}
        <div style={{  padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>D. DAFTAR UNIT KOMPETENSI</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#c40000', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50px', textTransform: 'uppercase' }}>No</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '150px', textTransform: 'uppercase' }}>Kode Unit</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', textTransform: 'uppercase' }}>Judul Unit</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '180px', textTransform: 'uppercase' }}>Jenis Standar (SKKNI / Standar Internasional / Standar Khusus)</th>
            </tr>
          </thead>
          <tbody>
            {dataUnitKompetensi.length > 0 ? (
              dataUnitKompetensi.map((unit, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{unit.kode}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{unit.nama}</td>
                  {index === 0 && (
                    <td rowSpan={dataUnitKompetensi.length} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {skkni || '-'}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', color: '#999' }}>Belum ada data unit kompetensi</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* E. BUKTI PERSYARATAN */}
        <div style={{  padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>E. BUKTI PERSYARATAN</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#c40000', color: '#fff' }}>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50px', verticalAlign: 'middle', textTransform: 'uppercase' }}>No</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', verticalAlign: 'middle', textTransform: 'uppercase' }}>Bukti Persyaratan Dasar</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', textTransform: 'uppercase' }}>Ada</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Tidak Ada</th>
            </tr>
            <tr style={{ background: '#c40000', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px', textTransform: 'uppercase' }}>Memenuhi Syarat</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px', textTransform: 'uppercase' }}>Tidak Memenuhi</th>
            </tr>
          </thead>
          <tbody>
            {buktiPersyaratan.length > 0 ? (
              buktiPersyaratan.map((bukti, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{bukti.no}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{bukti.bukti}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', color: '#999' }}>Belum ada data bukti persyaratan</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* F. BUKTI ADMINISTRATIF */}
        <div style={{ padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>F. BUKTI ADMINISTRATIF</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#c40000', color: '#fff' }}>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50px', verticalAlign: 'middle', textTransform: 'uppercase' }}>No</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', verticalAlign: 'middle', textTransform: 'uppercase' }}>Bukti Administratif</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', textTransform: 'uppercase' }}>Ada</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Tidak Ada</th>
            </tr>
            <tr style={{ background: '#c40000', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px', textTransform: 'uppercase' }}>Memenuhi Syarat</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '100px', textTransform: 'uppercase' }}>Tidak Memenuhi</th>
            </tr>
          </thead>
          <tbody>
            {buktiAdministratif.length > 0 ? (
              buktiAdministratif.map((bukti, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{bukti.no}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{bukti.bukti}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', color: '#999' }}>Belum ada data bukti administratif</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* G. CATATAN */}
        <div style={{ padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>G. CATATAN</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px' }}>
                <textarea
                  placeholder="Tulis catatan di sini..."
                  rows={5}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #808080', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', resize: 'vertical', textTransform: 'uppercase' }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(-1)}
            disabled={isSaving}
            style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '13px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1 }}
          >
            Kembali
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ padding: '8px 16px', background: '#0066cc', color: '#fff', fontSize: '13px', cursor: isSaving ? 'not-allowed' : 'pointer', border: 'none', opacity: isSaving ? 0.5 : 1 }}
          >
            {isSaving ? "Menyimpan..." : "Simpan & Lanjut ke APL 02"}
          </button>
        </div>
      </AsesiLayout>
    </div>
  )
}
