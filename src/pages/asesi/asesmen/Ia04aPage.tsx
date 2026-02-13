import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useKegiatanAsesi, useKegiatanAsesor } from "@/hooks/useKegiatan"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"

interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
}

interface KelompokKerja {
  id: number
  nama: string
  urut: string
  units: Unit[]
}

interface KelompokKerjaData {
  id: number
  kode: string
  nama_dokumen: string
  kelompok_kerja: KelompokKerja[]
}

interface ReferensiForm {
  id: number
  nama: string
}

interface Soal {
  id: number
  urut: string
  jenis: string
  soal: string
  jawaban: string
  is_komentar: string | null
}

interface Ia04aResponse {
  message: string
  data: {
    kelompok_kerja: KelompokKerjaData
    referensi_form: ReferensiForm[]
    soal: Soal[]
    barcodes?: {
      asesi?: { url: string; tanggal: string; nombre: string }
      asesor1?: { url: string; tanggal: string; nombre: string } | null
      asesor2?: { url: string; tanggal: string; nombre: string } | null
    }
  }
}

interface ApiResponse {
  message: string
  data: Ia04aResponse["data"]
}

type BarcodeData = {
  url: string
  tanggal: string
  nama: string
}

interface ListItem {
  content: string
  level: number
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// Helper function to parse content into list items
function parseListContent(content: string): { type: 'ol' | 'ul' | 'p', items: ListItem[] } {
  // First decode HTML entities, then replace <br /> with newlines
  const cleanContent = decodeHtmlEntities(content)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .trim()

  // Check for numbered list (1., 2., 3., etc)
  const numberedPattern = /^\d+\.\s+/m
  if (numberedPattern.test(cleanContent)) {
    // Split by numbered items (e.g., "1.", "2.", etc)
    const parts = cleanContent.split(/\n(?=\d+\.\s+)/)
    const items: ListItem[] = []

    // Check if the content starts with text (not a number)
    const firstLine = parts[0]?.split('\n')[0]?.trim() || ''
    const hasTextBeforeNumbers = !/^\d+\.\s+/.test(firstLine)

    for (const part of parts) {
      if (!part.trim()) continue

      const lines = part.split('\n').filter(l => l.trim())
      const mainItemLines: string[] = []
      const bulletLines: string[] = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // Check if this line is a bullet (•, -, *)
        if (/^[•\-\*]\s+/.test(trimmed)) {
          bulletLines.push(trimmed)
        } else {
          mainItemLines.push(trimmed)
        }
      }

      // Add main item (joined with spaces for proper wrapping)
      if (mainItemLines.length > 0) {
        const itemContent = mainItemLines.join(' ')
        // If there's text before numbers, indent the numbered items
        const isNumberedItem = /^\d+\.\s+/.test(itemContent)
        const level = (hasTextBeforeNumbers && isNumberedItem) ? 1 : 0
        items.push({ content: itemContent, level })
      }

      // Add bullet items (nested, indented more)
      for (const bullet of bulletLines) {
        items.push({ content: bullet, level: 2 })
      }
    }

    return { type: 'ol', items }
  }

  // Check for bullet points (•, -, *, etc)
  const bulletPattern = /[•\-\*]\s+/m
  if (bulletPattern.test(cleanContent)) {
    const lines = cleanContent.split('\n')
    const items: ListItem[] = []
    for (const line of lines) {
      const trimmed = line.trimEnd()
      const leadingSpaces = line.match(/^\s*/)?.[0].length || 0
      const level = Math.floor(leadingSpaces / 2) // Each 2 spaces = 1 level
      items.push({ content: trimmed, level })
    }
    return { type: 'ul', items: items.filter(item => item.content.trim()) }
  }

  // Return as paragraph if no list pattern found
  return { type: 'p', items: [{ content: cleanContent, level: 0 }] }
}

export default function Ia04aPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { jabatanKerja, nomorSkema, namaAsesor: _namaAsesor, tuk, asesorList, namaAsesi } = useDataDokumenAsesmen(id)
  const { role: asesorRole, isAsesor1 } = useAsesorRole(id)
  const { showSuccess, showWarning, showError } = useToast()
  const { kegiatan: kegiatanAsesi } = useKegiatanAsesi()
  const { kegiatan: kegiatanAsesor } = useKegiatanAsesor()

  const [ia04aData, setIa04aData] = useState<Ia04aResponse["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [umpanBalikMap, setUmpanBalikMap] = useState<Record<number, string>>({})
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData
    asesor?: Record<string, BarcodeData>
  } | null>(null)

  // Get dynamic steps based on asesor role
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to load
      if (authLoading) {
        return
      }

      if (!id) {
        console.error("No id_izin found in user data")
        console.log("User:", user)
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("access_token")

        console.log("=== FETCHING IA04A ===")
        console.log("ID:", id)

        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia04a`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: ApiResponse = await response.json()
          if (result.message === "Success") {
            setIa04aData(result.data)

            // Initialize umpan balik map from soal with is_komentar === "2"
            const umpanBalikInit: Record<number, string> = {}
            result.data.soal.forEach(soal => {
              if (soal.is_komentar === "2" && soal.jawaban) {
                umpanBalikInit[soal.id] = soal.jawaban
              }
            })
            setUmpanBalikMap(umpanBalikInit)

            // Set barcodes - transform from old format if needed
            if (result.data.barcodes) {
              const apiBarcodes = result.data.barcodes as {
                asesi?: BarcodeData
                asesor1?: BarcodeData | null
                asesor2?: BarcodeData | null
                asesor?: Record<string, BarcodeData>
              }

              // Transform old format (asesor1, asesor2) to new dynamic format
              const transformedAsesor: Record<string, BarcodeData> = {}

              // Only map non-null barcodes
              if (apiBarcodes.asesor1 && asesorList[0]) {
                transformedAsesor[String(asesorList[0].id)] = apiBarcodes.asesor1
              }
              if (apiBarcodes.asesor2 && asesorList[1]) {
                transformedAsesor[String(asesorList[1].id)] = apiBarcodes.asesor2
              }

              setBarcodes({
                asesi: apiBarcodes.asesi,
                asesor: transformedAsesor
              })
            }

            console.log("IA04A Data:", result.data)
          }
        } else {
          console.warn(`IA04A API returned ${response.status}`)
        }
      } catch (error) {
        console.error("Error fetching IA04A:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, authLoading, user, asesorList])

  const handleNext = async () => {
    if (!agreedChecklist) {
      showWarning('Silakan centang pernyataan terlebih dahulu')
      return
    }

    // Asesor 1 wajib isi umpan balik (cari soal dengan is_komentar === "2")
    const umpanBalikSoal = ia04aData?.soal.find(s => s.is_komentar === "2")
    if (isAsesor && isAsesor1 && umpanBalikSoal) {
      const umpanBalikValue = umpanBalikMap[umpanBalikSoal.id] || ''
      if (!umpanBalikValue.trim()) {
        showWarning('Silakan isi umpan balik terlebih dahulu')
        return
      }
    }

    const isAsesor2 = isAsesor && !isAsesor1
    const umpanBalikSoalId = umpanBalikSoal?.id
    const umpanBalikValue = umpanBalikSoalId ? (umpanBalikMap[umpanBalikSoalId] || '') : ''
    const isAsesor1WithUmpan = isAsesor && isAsesor1 && umpanBalikValue.trim()
    const jadwalId = isAsesor ? kegiatanAsesor?.jadwal_id : kegiatanAsesi?.jadwal_id
    const token = localStorage.getItem("access_token")

    // Asesor_2 hanya generate QR/tanda tangan jika belum ada
    if (isAsesor2) {
      if (!jadwalId) {
        showError('Jadwal tidak ditemukan')
        return
      }

      // Cek apakah QR asesor_2 sudah ada
      const currentAsesorId = String(user?.id)
      const hasExistingQR = barcodes?.asesor?.[currentAsesorId]?.url

      if (hasExistingQR) {
        // QR sudah ada, langsung navigate
        setTimeout(() => {
          navigate(`/asesi/asesmen/${id}/upload-tugas`)
        }, 500)
        return
      }

      try {
        const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${id}/ia04a`, {
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
            const currentAsesorId = String(user?.id)
            setBarcodes(prev => ({
              asesi: prev?.asesi,
              asesor: {
                ...prev?.asesor,
                [currentAsesorId]: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name }
              }
            }))
            showSuccess('Tanda tangan berhasil disimpan!')
            setTimeout(() => {
              navigate(`/asesi/asesmen/${id}/upload-tugas`)
            }, 500)
            return
          }
        } else {
          showError('Gagal generate tanda tangan')
        }
      } catch (qrError) {
        console.error('Error generating QR:', qrError)
        showError('Gagal generate tanda tangan')
      }

      // Fallback navigate jika gagal
      navigate(`/asesi/asesmen/${id}/upload-tugas`)
      return
    }

    // Asesor_1: simpan umpan balik, lalu generate QR
    if (isAsesor1WithUmpan && umpanBalikSoalId) {
      try {
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia04a`, {
          method: 'POST',
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            soal_id: umpanBalikSoalId,
            jawaban: umpanBalikValue,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          console.log("Umpan balik saved:", result)
          showSuccess('Umpan balik berhasil disimpan!')

          // Setelah simpan umpan, lanjut generate QR untuk asesor_1 hanya jika belum ada
          if (jadwalId) {
            // Cek apakah QR asesor_1 sudah ada
            const currentAsesorId = String(user?.id)
            const hasExistingQR = barcodes?.asesor?.[currentAsesorId]?.url

            if (hasExistingQR) {
              // QR sudah ada, langsung navigate
              setTimeout(() => {
                navigate(`/asesi/asesmen/${id}/upload-tugas`)
              }, 500)
              return
            }
            try {
              const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${id}/ia04a`, {
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
                  const currentAsesorId = String(user?.id)
                  setBarcodes(prev => ({
                    asesi: prev?.asesi,
                    asesor: {
                      ...prev?.asesor,
                      [currentAsesorId]: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name }
                    }
                  }))
                  showSuccess('IA 04.A berhasil disimpan!')
                  setTimeout(() => {
                    navigate(`/asesi/asesmen/${id}/upload-tugas`)
                  }, 500)
                  return
                }
              }
            } catch (qrError) {
              console.error('Error generating QR:', qrError)
              // Tetap lanjut walau QR gagal
              showSuccess('IA 04.A berhasil disimpan!')
              setTimeout(() => {
                navigate(`/asesi/asesmen/${id}/upload-tugas`)
              }, 500)
            }
          }
        } else {
          console.error('Failed to save umpan balik:', response.status)
        }
      } catch (err) {
        console.error('Error in asesor_1 flow:', err)
      }
    }

    // Asesi: langsung navigate (ga ada QR)
    if (!isAsesor) {
      showSuccess('IA 04.A berhasil disimpan!')
      setTimeout(() => {
        navigate(`/asesi/asesmen/${id}/upload-tugas`)
      }, 500)
      return
    }

    showSuccess('IA 04.A berhasil disimpan!')
    setTimeout(() => {
      navigate(`/asesi/asesmen/${id}/upload-tugas`)
    }, 500)
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data IA.04.A..." />
      </div>
    )
  }

  const kelompokKerja = ia04aData?.kelompok_kerja.kelompok_kerja[0]
  const units = kelompokKerja?.units || []

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>IA.04.A</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={1} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', letterSpacing: '1px' }}>
            {ia04aData?.kelompok_kerja.kode}
          </h1> {ia04aData?.kelompok_kerja.nama_dokumen || 'FR.IA.04. PENJELASAN SINGKAT PROYEK TERKAIT PEKERJAAN KEGIATAN TERSTRUKTUR LAINNYA'}
        </div>

        {/* Info Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</td>
              <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{jabatanKerja?.toLocaleUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{nomorSkema?.toUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{tuk?.toUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList.map((asesor, idx) => (
                  <span key={asesor.id}>
                    {idx > 0 && ', '}
                    {asesor.nama?.toUpperCase() || ''}
                  </span>
                ))}
              </td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '12px', marginTop: '5px' }}>*Coret yang tidak perlu</div>

        {/* Panduan Bagi Asesor */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold' }}>
              <td>PANDUAN BAGI ASESOR</td>
            </tr>
            <tr>
              <td style={{ background: '#e9e9e9e', border: '1px solid #000', padding: '6px' }}>
                <ul style={{ margin: '5px 0 5px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '6px' }}>Tentukan proyek singkat atau kegiatan terstruktur lainnya yang harus dipersiapkan dan dipresentasikan oleh asesi.</li>
                  <li style={{ marginBottom: '6px' }}>Proyek singkat atau kegiatan terstruktur lainnya dibuat untuk keseluruhan unit kompetensi dalam Skema Sertifikasi atau untuk masing-masing kelompok pekerjaan.</li>
                  <li style={{ marginBottom: '0' }}>Kumpulkan hasil proyek singkat atau kegiatan terstruktur lainnya sesuai dengan hasil keluaran yang telah ditetapkan.</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Kelompok Pekerjaan Table */}
        {kelompokKerja && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
            <tbody>
              <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold' }}>
                <td rowSpan={units.length + 1} style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #000', padding: '6px' }}>
                  {kelompokKerja.nama}
                </td>
                <td style={{ width: '8%', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>No.</td>
                <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Kode Unit</td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Judul Unit</td>
              </tr>
              {units.map((unit, index) => (
                <tr key={unit.id_unit}>
                  <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <br />
        {/* Soal Sections */}
        {ia04aData?.soal.map((soalItem) => (
          <table key={soalItem.id} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ width: '28%', background: '#e9e9e9e', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>
                  {soalItem.soal}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {soalItem.is_komentar === "2" ? (
                    // Umpan balik - editable for asesor_1
                    isAsesor && isAsesor1 ? (
                      <textarea
                        value={umpanBalikMap[soalItem.id] || ''}
                        onChange={(e) => setUmpanBalikMap(prev => ({ ...prev, [soalItem.id]: e.target.value }))}
                        style={{ width: '100%', height: '100px', border: '1px solid #ccc', padding: '8px', fontSize: '13px', resize: 'none', fontFamily: 'Arial, Helvetica, sans-serif' }}
                        placeholder="Tuliskan umpan balik untuk asesi..."
                      />
                    ) : (
                      <p style={{ margin: '5px 0' }}>{umpanBalikMap[soalItem.id] || soalItem.jawaban || '-'}</p>
                    )
                  ) : soalItem.jenis === '1' ? (() => {
                    const parsed = parseListContent(soalItem.jawaban)
                    if (parsed.type === 'ol') {
                      return (
                        <ol style={{ margin: '5px 0 5px 18px', paddingLeft: '18px' }}>
                          {parsed.items.map((item, idx) => (
                            <li key={idx} style={{ marginLeft: `${item.level * 20}px`, marginBottom: '4px' }}>
                              {item.content}
                            </li>
                          ))}
                        </ol>
                      )
                    } else if (parsed.type === 'ul') {
                      return (
                        <ul style={{ margin: '5px 0 5px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                          {parsed.items.map((item, idx) => (
                            <li key={idx} style={{ marginLeft: `${item.level * 20}px`, marginBottom: '4px' }}>
                              {item.content}
                            </li>
                          ))}
                        </ul>
                      )
                    } else {
                      return <p style={{ margin: '5px 0' }}>{parsed.items[0].content}</p>
                    }
                  })() : (
                    <div style={{ height: '60px' }}></div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        ))}

        {/* Signature Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #000' }}>
              <td>Tanda Tangan Asesi</td>
              <td colSpan={asesorList.length}>Tanda Tangan Asesor</td>
              <td style={{ display: asesorList.length > 0 ? 'none' : 'table-cell' }}>Nama & Tanda Tangan Supervisor Tempat Kerja</td>
            </tr>
            {/* Asesi Signature Row */}
            <tr>
              <td style={{ height: '120px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {barcodes.asesi.nama}
                    </div>
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
              {asesorList.map((asesor) => {
                const asesorBarcode = barcodes?.asesor?.[String(asesor.id)]
                return (
                  <td key={asesor.id} style={{ height: '120px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {asesorBarcode?.url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {asesorBarcode.nama.toUpperCase()}
                        </div>
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
                )
              })}
              <td style={{ display: asesorList.length > 0 ? 'none' : 'table-cell', height: '120px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </tbody>
        </table>

        {/* Status Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>STATUS</td>
              <td style={{ width: '8%', border: '1px solid #000', padding: '6px' }}>NO</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>NAMA</td>
              <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>NOMOR MET</td>
              <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>TANDA TANGAN DAN TANGGAL</td>
            </tr>
            <tr style={{ background: '#e9e9e9e', fontWeight: 'bold' }}>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>PENYUSUN</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>2</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr style={{ background: '#e9e9e9e', fontWeight: 'bold' }}>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>VALIDATOR</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>2</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa saya telah memahami instruksi tugas terstruktur dan akan menyelesaikan tugas tersebut sesuai dengan ketentuan yang berlaku. Saya bertanggung jawab penuh atas keaslian dan kelengkapan tugas yang saya serahkan.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={() => navigate("/asesi/dashboard")}>
              Kembali
            </ActionButton>
            <ActionButton variant="primary" disabled={!agreedChecklist} onClick={handleNext}>
              Lanjut
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
