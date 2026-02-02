import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"

interface KUK {
  no_kuk: string
  judul_kuk: string
}

interface Subunit {
  id: string
  no_elemen: string
  judul_elemen: string
  kuk_list: KUK[]
}

interface Unit {
  id: string
  kode: string
  judul_kompetensi: string
  subunits: Subunit[]
}

interface Apl02Response {
  message: string
  data: {
    units: Unit[]
  }
}

interface DataDokumenResponse {
  message: string
  data: {
    jabatan_kerja: string
    nomor_skema: string
    tuk: string
    asesor_1: string
    asesor_2: string
    noreg_asesor_1: string
    noreg_asesor_2: string
    tanggal_uji: string
    tanggal_selesai: string | null
    jenis_kelas: string
  }
}

type Apl02Data = {
  jabatan_kerja: string
  no_skema: string
  tuk: string
  nama_asesor: string
  nama_asesi: string
  tanggal: string
  units: Unit[]
}

interface UploadedFile {
  id: string
  name: string
  kukId: string
  file: File
}

export default function Apl02Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const [apl02Data, setApl02Data] = useState<Apl02Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [_idIzin, setIdIzin] = useState<string | null>(null) // Will be used for POST request
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [kukChecklist, setKukChecklist] = useState<Record<string, 'K' | 'BK' | null>>({})
  const [kukBukti, setKukBukti] = useState<Record<string, string[]>>({})
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const toggleDropdown = (kukId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(kukId)) {
        newSet.delete(kukId)
      } else {
        newSet.add(kukId)
      }
      return newSet
    })
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.bukti-dropdown-container')) {
        setOpenDropdowns(new Set())
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCheckboxChange = (kukId: string, value: 'K' | 'BK') => {
    setKukChecklist(prev => {
      const current = prev[kukId]
      if (current === value) {
        // Uncheck if clicking the same value
        const { [kukId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [kukId]: value }
    })
  }

  const handleBuktiChange = (kukId: string, fileName: string) => {
    setKukBukti(prev => {
      const currentFiles = prev[kukId] || []
      if (currentFiles.includes(fileName)) {
        // Remove file if already selected
        return {
          ...prev,
          [kukId]: currentFiles.filter(f => f !== fileName)
        }
      } else {
        // Add file to selection
        return {
          ...prev,
          [kukId]: [...currentFiles, fileName]
        }
      }
    })
    // Close dropdown after selection
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      newSet.delete(kukId)
      return newSet
    })
  }

  const removeBuktiFile = (kukId: string, fileName: string) => {
    setKukBukti(prev => ({
      ...prev,
      [kukId]: (prev[kukId] || []).filter(f => f !== fileName)
    }))
  }

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
            fetchedIdIzin = listResult.list_asesi[0].id_izin
            setIdIzin(fetchedIdIzin)
          }
        }

        if (!fetchedIdIzin) {
          console.error("No id_izin found in list-asesi response")
          setIsLoading(false)
          return
        }

        // Fetch both data-dokumen and apl02 in parallel
        const [dataDokumenResponse, apl02Response] = await Promise.all([
          fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/data-dokumen`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
          fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/apl02`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
        ])

        // Parse data-dokumen response
        let jabatanKerja = ''
        let noSkema = ''
        let tuk = 'Sewaktu / Tempat Kerja / Mandiri'
        let namaAsesor = ''

        if (dataDokumenResponse.ok) {
          const dataDokumenResult: DataDokumenResponse = await dataDokumenResponse.json()
          if (dataDokumenResult.message === "Success" && dataDokumenResult.data) {
            jabatanKerja = dataDokumenResult.data.jabatan_kerja || ''
            noSkema = dataDokumenResult.data.nomor_skema || ''
            tuk = dataDokumenResult.data.tuk || 'Sewaktu / Tempat Kerja / Mandiri'
            // Combine asesor 1 and 2
            namaAsesor = dataDokumenResult.data.asesor_1
              ? dataDokumenResult.data.asesor_2
                ? `${dataDokumenResult.data.asesor_1}, ${dataDokumenResult.data.asesor_2}`
                : dataDokumenResult.data.asesor_1
              : ''
            console.log("Data dokumen fetched:", dataDokumenResult.data)
          }
        }

        // Parse apl02 response
        let units: Unit[] = []
        if (apl02Response.ok) {
          const apl02Result: Apl02Response = await apl02Response.json()
          if (apl02Result.message === "Success" && apl02Result.data) {
            units = apl02Result.data.units || []
            console.log("APL02 units fetched:", units.length)
          }
        }

        // Set combined data
        setApl02Data({
          jabatan_kerja: jabatanKerja,
          no_skema: noSkema,
          tuk: tuk,
          nama_asesor: namaAsesor,
          nama_asesi: user?.name || '',
          tanggal: new Date().toLocaleDateString('id-ID'),
          units: units,
        })
        console.log("APL02 data set complete")
      } catch (error) {
        console.error("Error fetching APL 02:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (kegiatan) {
      fetchData()
    }
  }, [kegiatan, user])

  const handleSubmit = async () => {
    if (!agreedChecklist) {
      alert("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    try {
      // TODO: POST data to backend
      console.log("Submitting APL02 data:", {
        kukChecklist,
        kukBukti,
        uploadedFiles: uploadedFiles.map(f => ({ name: f.name })),
      })

      // Navigate to success page
      navigate(`/asesi/praasesmen/${kegiatan?.jadwal_id}/apl02/success`)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f5f5f5' }}>
        <div className="text-center">
          <div style={{ color: '#666' }}>
            <SimpleSpinner size="lg" className="mx-auto mb-4" />
          </div>
          <p style={{ color: '#666' }}>Memuat data APL 02...</p>
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
            <span>FR APL 02</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={3}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '10px', textTransform: 'uppercase' }}>
                APL-02 ASESMEN MANDIRI<br />{apl02Data?.jabatan_kerja || '-'}
              </h1>
            </div>

        {/* Upload File Section */}
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upload Bukti Dokumen</span>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Upload dokumen pendukung untuk digunakan di kolom bukti</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                {uploadedFiles.length} File
              </div>
            )}
          </div>

          {/* Drop Zone */}
          <div
            onClick={() => document.getElementById('file-upload-input')?.click()}
            style={{
              border: '2px dashed #0066cc',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0052a3'
              e.currentTarget.style.background = 'linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#0066cc'
              e.currentTarget.style.background = 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📁</div>
            <p style={{ fontSize: '14px', color: '#333', margin: 0, fontWeight: '500' }}>
              <span style={{ color: '#0066cc', textDecoration: 'underline' }}>Klik untuk upload</span>
            </p>
            <p style={{ fontSize: '11px', color: '#888', margin: '6px 0 0 0' }}>PDF, JPG, PNG, DOC, DOCX (Maks. 5MB per file)</p>
          </div>

          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = e.target.files
              if (files && files.length > 0) {
                Array.from(files).forEach(file => {
                  const newFile: UploadedFile = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    kukId: '',
                    file,
                  }
                  setUploadedFiles(prev => [...prev, newFile])
                })
              }
              e.target.value = ''
            }}
          />

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                File yang Diupload
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                {uploadedFiles.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: '#fafafa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f0f0'
                      e.currentTarget.style.borderColor = '#d0d0d0'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fafafa'
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ fontSize: '20px' }}>📄</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#333', fontWeight: '500', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {uploadedFile.name}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFiles(prev => prev.filter(f => f.id !== uploadedFile.id))
                      }}
                      style={{
                        padding: '6px 10px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Notice */}
        <div style={{ background: '#fff9e6', border: '1px solid #e6b800', marginBottom: '20px', padding: '12px' }}>
          <p style={{ fontSize: '12px', color: '#000', margin: 0 }}>
            <strong>CATATAN:</strong> K = Kompeten, BK = Belum Kompeten. Isi kolom bukti dengan dokumen pendukung yang Anda miliki.
          </p>
        </div>

        {/* Header Table */}
        {apl02Data && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '25%', fontWeight: 'bold', verticalAlign: 'top', textTransform: 'uppercase' }}>
                  Skema Sertifikasi<br />
                  <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(KKNI/Okupasi/Klaster)</span>
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '12%', fontWeight: 'bold', textTransform: 'uppercase' }}>Judul</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.jabatan_kerja}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nomor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.no_skema}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>TUK</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.tuk || '-'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.nama_asesor || '-'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesi</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.nama_asesi || user?.name || '-'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.tanggal || '-'}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Panduan */}
        <div style={{ background: '#c00000', color: '#fff', padding: '6px 8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Panduan Asesmen Mandiri
        </div>
        <div style={{ background: '#fff', border: '1px solid #000', marginBottom: '20px', fontSize: '11px' }}>
          <div style={{ padding: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Instruksi:</div>
            <ul style={{ margin: '4px 0 4px 20px', padding: 0 }}>
              <li>Baca setiap pertanyaan di kolom sebelah kiri</li>
              <li>Beri tanda centang (√) pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan</li>
              <li>Isi kolom di sebelah kanan dengan mendaftar bukti yang Anda miliki</li>
            </ul>
          </div>
        </div>

        {/* Daftar Unit Kompetensi */}
        {apl02Data?.units.map((unit, unitIndex) => (
          <table key={unit.id} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '11px' }}>
            <tbody>
              {/* Unit Title */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '4px', width: '22%', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Kode & Judul<br />Kompetensi {unitIndex + 1} :
                </td>
                <td colSpan={5} style={{ border: '1px solid #000', padding: '4px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{unit.kode}</div>
                  <div>{unit.judul_kompetensi}</div>
                </td>
              </tr>

              {/* Header Row - DAPATKAH SAYA ? */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>DAPATKAH SAYA ?</td>
                <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>K</td>
                <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>BK</td>
                <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>Bukti</td>
              </tr>

              {/* Subunits & KUK */}
              {unit.subunits.map((subunit) => (
                <React.Fragment key={subunit.id}>
                  {/* Elemen Header */}
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '4px' }}>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Elemen {subunit.no_elemen} :</span><br />
                      {subunit.judul_elemen}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  </tr>

                  {/* Kriteria Unjuk Kerja Header */}
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Kriteria Unjuk Kerja:
                    </td>
                  </tr>

                  {/* KUK Rows */}
                  {subunit.kuk_list.map((kuk) => {
                    const kukId = `${unit.id}-${subunit.id}-${kuk.no_kuk}`
                    const isCheckedK = kukChecklist[kukId] === 'K'
                    const isCheckedBK = kukChecklist[kukId] === 'BK'

                    return (
                      <tr key={kuk.no_kuk}>
                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                          {kuk.no_kuk} {kuk.judul_kuk}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', verticalAlign: 'top' }}>
                          <input
                            type="checkbox"
                            checked={isCheckedK}
                            onChange={() => handleCheckboxChange(kukId, 'K')}
                            style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', verticalAlign: 'top' }}>
                          <input
                            type="checkbox"
                            checked={isCheckedBK}
                            onChange={() => handleCheckboxChange(kukId, 'BK')}
                            style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                          {(() => {
                            const selectedFiles = (kukBukti[kukId] || []) as string[]
                            const isOpen = openDropdowns.has(kukId)
                            return (
                              <>
                                {/* Selected Files as Chips */}
                                {selectedFiles.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                                    {selectedFiles.map((fileName) => (
                                      <span
                                        key={fileName}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          background: '#e3f2fd',
                                          border: '1px solid #0066cc',
                                          borderRadius: '4px',
                                          padding: '2px 6px',
                                          fontSize: '10px',
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        {fileName}
                                        <button
                                          onClick={() => removeBuktiFile(kukId, fileName)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#0066cc',
                                            cursor: 'pointer',
                                            padding: '0',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            lineHeight: 1,
                                          }}
                                          title="Hapus"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Multi-select Dropdown */}
                                <div className="bukti-dropdown-container" style={{ position: 'relative' }}>
                                  <button
                                    onClick={() => toggleDropdown(kukId)}
                                    disabled={uploadedFiles.length === 0}
                                    style={{
                                      width: '100%',
                                      padding: '6px 10px',
                                      border: '1px solid #000',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontFamily: 'Arial, Helvetica, sans-serif',
                                      textTransform: 'uppercase',
                                      backgroundColor: uploadedFiles.length === 0 ? '#f5f5f5' : '#fff',
                                      cursor: uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
                                      textAlign: 'left',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file dipilih` : (uploadedFiles.length === 0 ? '-- Upload file terlebih dahulu --' : '-- Pilih File --')}</span>
                                    <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
                                  </button>

                                  {/* Dropdown Options */}
                                  {isOpen && uploadedFiles.length > 0 && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '100%',
                                      left: 0,
                                      right: 0,
                                      background: '#fff',
                                      border: '1px solid #000',
                                      borderRadius: '4px',
                                      marginTop: '4px',
                                      maxHeight: '150px',
                                      overflowY: 'auto',
                                      zIndex: 100,
                                    }}>
                                      {uploadedFiles.map((file) => {
                                        const isSelected = selectedFiles.includes(file.name)
                                        return (
                                          <div
                                            key={file.id}
                                            onClick={() => handleBuktiChange(kukId, file.name)}
                                            style={{
                                              padding: '6px 10px',
                                              fontSize: '11px',
                                              cursor: 'pointer',
                                              textTransform: 'uppercase',
                                              background: isSelected ? '#e3f2fd' : 'transparent',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                            }}
                                            onMouseEnter={(e) => {
                                              if (!isSelected) {
                                                e.currentTarget.style.background = '#f5f5f5'
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.background = isSelected ? '#e3f2fd' : 'transparent'
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => {}}
                                              onClick={(e) => e.stopPropagation()}
                                              style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                                            />
                                            <span>{file.name}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              </>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ))}


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
              <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen APL 02 (Asesmen Mandiri) ini dengan sebenar-benarnya.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(-1)}
            disabled={isSaving}
            style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '12px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1, textTransform: 'uppercase', fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !agreedChecklist}
            style={{ padding: '8px 16px', background: agreedChecklist ? '#0066cc' : '#999', color: '#fff', fontSize: '12px', cursor: isSaving || !agreedChecklist ? 'not-allowed' : 'pointer', border: 'none', opacity: isSaving || !agreedChecklist ? 0.5 : 1, textTransform: 'uppercase', fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {isSaving ? "Menyimpan..." : "Simpan & Selesaikan"}
          </button>
        </div>
      </AsesiLayout>
    </div>
  )
}
