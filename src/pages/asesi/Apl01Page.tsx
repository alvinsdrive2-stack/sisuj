import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { kegiatanService } from "@/lib/kegiatan-service"
import { CustomCheckbox } from "@/components/ui/Checkbox"

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
  kode_pos: number | null
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

export default function Apl01Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin

  const { asesorList } = useDataDokumenPraAsesmen(idIzin)

  const [_dataPribadi, setDataPribadi] = useState<DataPribadi | null>(null)
  const [_dataPekerjaan, setDataPekerjaan] = useState<DataPekerjaan | null>(null)
  const [dataSertifikasi, setDataSertifikasi] = useState<DataSertifikasi | null>(null)
  const [dataUnitKompetensi, setDataUnitKompetensi] = useState<UnitKompetensi[]>([])
  const [buktiPersyaratan, setBuktiPersyaratan] = useState<BuktiPersyaratan[]>([])
  const [buktiAdministratif, setBuktiAdministratif] = useState<BuktiAdministratif[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false) // Setter unused until POST is implemented
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
    kode_pos: null,
    telepon_kantor: "",
    fax: "",
    email_kantor: ""
  })

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        if (!idIzin) {
          setIsLoading(false)
          return
        }

        // Fetch APL 01 data
        const apl01Response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${idIzin}/apl01`, {
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
      } catch (error) {
        // Continue with empty form
      } finally {
        setIsLoading(false)
      }
    }

    if (idIzin) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [idIzin])

  const handleSave = async () => {
    const targetIdIzin = idIzin || user?.id_izin
    if (!targetIdIzin) {
      return
    }

    // Jika asesor, langsung navigate tanpa save
    if (isAsesor) {
      navigate(`/asesi/praasesmen/${targetIdIzin}/apl02`)
      return
    }

    // Asesi - save data pekerjaan dulu
    try {
      setIsSaving(true)
      await kegiatanService.saveApl01DataPekerjaan(targetIdIzin, formDataPekerjaan)
      navigate(`/asesi/praasesmen/${targetIdIzin}/apl02`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan data pekerjaan")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data APL 01..." />
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

            
            <div style={{  padding: '4px ', marginBottom: '5px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>Bagian 1 :  Rincian Data Pemohon Sertifikasi</span>
            </div>
            <div style={{  padding: '2px 12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', color: '#000', }}>Pada bagian ini, cantumkan data pribadi, data pendidikan formal serta data pekerjaan 
anda pada saat ini.</span>
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
                  disabled={isAsesor || isSaving}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
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
                  disabled={isAsesor || isSaving}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Alamat Perusahaan</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' }}>
                <textarea
                  value={formDataPekerjaan.alamat_kantor || ""}
                  onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, alamat_kantor: e.target.value })}
                  disabled={isAsesor || isSaving}
                  rows={3}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', resize: 'vertical', textTransform: 'uppercase', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
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
                          disabled={isAsesor || isSaving}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
                        />
                      </td>
                      <td style={{ width: '40px', textTransform: 'uppercase', padding: '6px 8px'  }}>Fax</td>
                      <td style={{ padding: '2px' }}>
                        <input
                          type="text"
                          value={formDataPekerjaan.fax || ""}
                          onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, fax: e.target.value })}
                          disabled={isAsesor || isSaving}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: '50px', padding: '2px', textTransform: 'uppercase' }}>Email</td>
                      <td  style={{ padding: '2px' }}>
                        <input
                          type="email"
                          value={formDataPekerjaan.email_kantor || ""}
                          onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, email_kantor: e.target.value })}
                          disabled={isAsesor || isSaving}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
                        />
                      </td>
                      <td style={{ width: '200px', background: '#fff', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Kode Pos</td>
              <td style={{ verticalAlign: 'middle' }}>
                <input
                  type="number"
                  value={formDataPekerjaan.kode_pos || ""}
                  onChange={(e) => setFormDataPekerjaan({ ...formDataPekerjaan, kode_pos: e.target.value ? parseInt(e.target.value) : null })}
                  disabled={isAsesor || isSaving}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', cursor: (isAsesor || isSaving) ? 'not-allowed' : 'text', background: (isAsesor || isSaving) ? '#f5f5f5' : '#fff' }}
                />
              </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{  padding: '4px ', marginBottom: '5px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>Bagian  2 :  Data Sertifikasi</span>
            </div>
            <div style={{  padding: '2px 12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', color: '#000', }}>Tuliskan Judul dan Nomor Skema Sertifikasi serta Daftar Unit Kompetensi sesuai kemasan pada skema sertifikasi yang anda ajukan untuk mendapatkan pengakuan sesuai dengan latar belakang pendidikan, pelatihan serta pengalaman kerja yang anda miliki.</span>
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={option.checked} onChange={() => {}} disabled />
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Sertifikasi</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Sertifikasi Ulang</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Pengakuan Kompetensi Terkini (PKT)</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Rekognisi pembelajaran lampau</td>
                </tr>
                <tr>
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Lainnya:</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* D. DAFTAR UNIT KOMPETENSI */}
        <div style={{  padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>DAFTAR UNIT KOMPETENSI</span>
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
        <div style={{  padding: '4px ', marginBottom: '5px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>Bagian  3  :  Bukti Kelengkapan  Pemohon </span>
            </div>
        {/* E. BUKTI PERSYARATAN */}
        <div style={{  padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>A. BUKTI PERSYARATAN</span>
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
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
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>B. BUKTI ADMINISTRATIF</span>
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={false} onChange={() => {}} disabled />
                    </div>
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

        {/* G. CATATAN / REKOMENDASI */}
        <div style={{ padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>G. CATATAN / REKOMENDASI</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            {/* Rekomendasi & Pemohon Row 1 */}
            <tr>
              <td rowSpan={3} style={{ width: '60%', border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Rekomendasi (diisi oleh LSP):</span><br /><br />
                Berdasarkan ketentuan persyaratan dasar,<br />
                maka pemohon:<br /><br />
                <span style={{ fontWeight: 'bold' }}>Diterima/ Tidak diterima</span> *) sebagai peserta
                sertifikasi<br /><br />
                * coret yang tidak sesuai
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Pemohon :</td>
            </tr>
            {/* Pemohon Row 2 */}
            <tr>
              <td style={{ width: '20%', border: '1px solid #000', padding: '8px' }}>Nama</td>
              <td style={{ width: '20%', border: '1px solid #000', padding: '8px' }}>{formDataPribadi.nama?.toUpperCase() || ''}</td>
            </tr>
            {/* Pemohon Row 3 - Signature */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan /<br />Tanggal</td>
              <td style={{ height: '140px', border: '1px solid #000', padding: '8px' }}></td>
            </tr>

            {/* Catatan & Admin Row 1 */}
            {asesorList.length > 0 ? (
              // Dynamic Asesor List
              asesorList.map((asesor, idx) => (
                <React.Fragment key={asesor.id}>
                  {idx === 0 && (
                    <tr>
                      <td rowSpan={asesorList.length * 4} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 'bold' }}>Catatan :</span>
                      </td>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Admin / Asesor:</td>
                    </tr>
                  )}
                  {idx > 0 && (
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesor:</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Nama</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.nama?.toUpperCase() || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan / tanggal</td>
                    <td style={{ height: '90px', border: '1px solid #000', padding: '8px' }}></td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              // Static Admin (fallback)
              <>
                <tr>
                  <td rowSpan={4} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                    <span style={{ fontWeight: 'bold' }}>Catatan :</span>
                  </td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Admin:</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>Nama</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan / tanggal</td>
                  <td style={{ height: '90px', border: '1px solid #000', padding: '8px' }}></td>
                </tr>
              </>
            )}
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
