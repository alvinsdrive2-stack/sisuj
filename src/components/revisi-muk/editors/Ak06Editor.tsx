/**
 * Editor Revisi MUK — FR.AK.06 (Meninjau Proses Asesmen).
 * Tampilan = form FR.AK.06 halaman asesi (Ak06Page): identitas, penjelasan,
 * tabel kesesuaian prinsip asesmen (baris aspek typed + kolom Fleksibel
 * dihitamkan utk Keputusan/Umpan balik), tabel dimensi kompetensi, ttd +
 * komentar per asesor (barcode existing read-only).
 * Payload persis editor sebelumnya: answers + rekomendasi1/2 + catatan_asesor1/2.
 * dimensi_kompetensi tidak dikirim → nilai lama dipertahankan backend.
 */
import { useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { Barcodes, DocTitle, fmtTanggalId } from './bnsp'

interface AspekAPI {
  aspek_id: string
  nama: string
  validitas: boolean | null
  reliabel: boolean | null
  fleksibel: boolean | null
  adil: boolean | null
}
interface Ak06Response {
  message: string
  data?: {
    aspek?: AspekAPI[]
    feedback?: {
      rekomendasi1?: string
      rekomendasi2?: string
      catatan_asesor1?: string
      catatan_asesor2?: string
    }
    barcodes?: Barcodes
  }
}

interface AspekItem {
  id: string
  nama: string
  validitas: boolean | null
  reliabel: boolean | null
  fleksibel: boolean | null
  adil: boolean | null
}

type AspekKey = keyof Omit<AspekItem, 'id' | 'nama'>

export function Ak06Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak06Response>(asesmenUrl(idIzin, 'ak06'))

  const [aspekItems, setAspekItems] = useState<AspekItem[]>([])
  const [rekomendasi1, setRekomendasi1] = useState('')
  const [rekomendasi2, setRekomendasi2] = useState('')
  const [catatanAsesor1, setCatatanAsesor1] = useState('')
  const [catatanAsesor2, setCatatanAsesor2] = useState('')
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.aspek) return
    setAspekItems(
      inner.aspek.map((item) => ({
        id: item.aspek_id,
        nama: item.nama,
        validitas: item.validitas ?? null,
        reliabel: item.reliabel ?? null,
        fleksibel: item.fleksibel ?? null,
        adil: item.adil ?? null,
      }))
    )
    setRekomendasi1(inner.feedback?.rekomendasi1 || '')
    setRekomendasi2(inner.feedback?.rekomendasi2 || '')
    setCatatanAsesor1(inner.feedback?.catatan_asesor1 || '')
    setCatatanAsesor2(inner.feedback?.catatan_asesor2 || '')
    if (inner.barcodes) setBarcodes(inner.barcodes)
  }, [data])

  const findAspek = (nama: string) => aspekItems.find((a) => a.nama.includes(nama))

  const handleAspekChange = (id: string, field: AspekKey) => {
    if (isSaving) return
    setAspekItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: !item[field] } : item))
    )
  }

  // Get dimensi kompetensi labels based on jenjang and metode (same as Ak06Page/MAPA01)
  const getDimensiKompetensiLabel = (): string => {
    const jenjangNum = parseInt(dokumenHeader?.jenjang || '0')

    // jenjang < 4: L/CL T/DPT
    if (jenjangNum < 4) {
      return 'L/CL<br/> T/DPT'
    }
    // jenjang > 3 AND portofolio: TL/VP T/PW T/VPK
    else if (dokumenHeader?.metode === 'portofolio') {
      return 'TL/VP<br/> T/PW<br/> T/VPK'
    }
    // jenjang > 3 AND observasi: L/DIT T/DPT
    else {
      return 'L/DIT<br/> T/DPT'
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak06'), {
        answers: aspekItems.map((item) => ({
          aspek_id: parseInt(item.id, 10),
          validitas: item.validitas ?? null,
          reliabel: item.reliabel ?? null,
          fleksibel: item.fleksibel ?? null,
          adil: item.adil ?? null,
        })),
        rekomendasi1,
        rekomendasi2,
        catatan_asesor1: catatanAsesor1,
        catatan_asesor2: catatanAsesor2,
      })
      toast.showSuccess('FR.AK.06 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.06')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (aspekItems.length === 0)
    return <DocError message="Data FR.AK.06 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []

  // Baris aspek typed — persis Ak06Page (bullet •, kolom Fleksibel dihitamkan
  // pada Keputusan & Umpan balik asesmen).
  const aspekRows: { label: React.ReactNode; nama: string; fleksibelHitam?: boolean }[] = [
    {
      label: (
        <>
          Prosedur asesmen:
          <br />• Rencana asesmen
        </>
      ),
      nama: 'Rencana asesmen',
    },
    { label: <>• Persiapan asesmen</>, nama: 'Persiapan asesmen' },
    { label: <>• Implementasi asesmen</>, nama: 'Implementasi asesmen' },
    { label: <>• Keputusan asesmen</>, nama: 'Keputusan asesmen', fleksibelHitam: true },
    { label: <>• Umpan balik asesmen</>, nama: 'Umpan balik asesmen', fleksibelHitam: true },
  ]

  const hdStyle = {
    background: BRANDING.primaryColor,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    border: '1px solid #000',
    padding: '6px',
  } as const

  const ttdRows = asesorList.length > 0 ? asesorList : [{ id: 0, nama: '', noreg: '' }]

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.AK.06. MENINJAU PROSES ASESMEN</DocTitle>

      {/* IDENTITAS Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', background: '#fff', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)</td>
            <td style={{ width: '12%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{header?.tuk || '-'}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{fmtTanggalId(new Date().toISOString())}</td>
          </tr>
        </tbody>
      </table>

      {/* PENJELASAN Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <th style={{ ...hdStyle, textAlign: 'left' }}>Penjelasan:</th>
          </tr>
          <tr>
            <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
              1. Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.<br />
              2. Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan / atau peserta kelompok yang homogen.<br />
              3. Isilah pemenuhan dimensi kompetensi dengan menulis kode rekaman formulir yang membuktikan terpenuhinya dimensi kompetensi.
            </td>
          </tr>
        </tbody>
      </table>

      {/* KONSEP ASESMEN Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <th rowSpan={2} style={hdStyle}>Aspek yang ditinjau</th>
            <th colSpan={4} style={hdStyle}>Kesesuaian dengan prinsip asesmen</th>
          </tr>
          <tr>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Validitas</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Reliabel</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Fleksibel</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Adil</th>
          </tr>

          {aspekRows.map((row, rowIdx) => {
            const aspek = findAspek(row.nama)
            const id = aspek?.id || ''
            const cell = (field: AspekKey) => (
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox
                  checked={(aspek?.[field] as boolean | null | undefined) || false}
                  onChange={() => handleAspekChange(id, field)}
                  disabled={isSaving}
                />
              </td>
            )
            return (
              <tr key={rowIdx}>
                <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>{row.label}</td>
                {cell('validitas')}
                {cell('reliabel')}
                {row.fleksibelHitam ? (
                  <td style={{ background: '#000', border: '1px solid #000', padding: '6px' }}></td>
                ) : (
                  cell('fleksibel')
                )}
                {cell('adil')}
              </tr>
            )
          })}

          <tr>
            <td colSpan={5} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
              Rekomendasi untuk peningkatan<br />
              <textarea
                value={rekomendasi1}
                onChange={(e) => setRekomendasi1(e.target.value)}
                disabled={isSaving}
                style={{
                  width: '100%',
                  height: '120px',
                  border: '1px solid #ccc',
                  padding: '6px',
                  fontSize: '13px',
                  resize: 'none',
                  cursor: isSaving ? 'not-allowed' : 'text',
                }}
                placeholder="Tuliskan rekomendasi..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* DIMENSI KOMPETENSI Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <th rowSpan={2} style={hdStyle}>Aspek yang ditinjau</th>
            <th colSpan={5} style={hdStyle}>Pemenuhan dimensi kompetensi</th>
          </tr>
          <tr>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Task Skills</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Task Management Skills</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Contingency Management Skills</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Job Role/Environment Skills</th>
            <th style={{ ...hdStyle, fontStyle: 'italic' }}>Transfer Skills</th>
          </tr>

          <tr>
            <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
              <b>Konsistensi keputusan asesmen</b><br />
              Bukti dari berbagai asesmen diperiksa untuk konsistensi dimensi kompetensi
            </td>
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }} dangerouslySetInnerHTML={{ __html: getDimensiKompetensiLabel() }} />
          </tr>

          <tr>
            <td colSpan={6} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
              Rekomendasi untuk peningkatan:<br />
              <textarea
                value={rekomendasi2}
                onChange={(e) => setRekomendasi2(e.target.value)}
                disabled={isSaving}
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '6px',
                  border: '1px solid #ccc',
                  fontSize: '13px',
                  resize: 'none',
                  cursor: isSaving ? 'not-allowed' : 'text',
                }}
                placeholder="Tuliskan rekomendasi..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* TANDA TANGAN Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '33%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Lead Asesor/Asesor</td>
            <td style={{ width: '33%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Tanggal Tanda Tangan</td>
            <td style={{ width: '34%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Komentar</td>
          </tr>
          {ttdRows.map((asesor, index) => {
            const asesorBarcode = index === 0 ? barcodes?.asesor1 : barcodes?.asesor2
            const komentar = index === 0 ? catatanAsesor1 : catatanAsesor2
            const setKomentar = (v: string) => (index === 0 ? setCatatanAsesor1(v) : setCatatanAsesor2(v))
            return (
              <tr key={asesor.id || index}>
                <td style={{ height: '100px', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                  {asesor.nama?.toUpperCase() || ''}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top', textAlign: 'center' }}>
                  {asesorBarcode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <img
                        src={asesorBarcode.url}
                        alt={`QR ${asesor.nama}`}
                        style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                      />
                      {asesorBarcode.tanggal && (
                        <div style={{ fontSize: '11px', color: '#333' }}>
                          {fmtTanggalId(asesorBarcode.tanggal)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ minHeight: '50px' }}></div>
                  )}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  <textarea
                    value={komentar}
                    onChange={(e) => setKomentar(e.target.value)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      height: '80px',
                      border: '1px solid #ccc',
                      padding: '6px',
                      fontSize: '13px',
                      resize: 'none',
                      cursor: isSaving ? 'not-allowed' : 'text',
                    }}
                    placeholder="Tuliskan komentar..."
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Dimensi kompetensi (jenjang/metode) tidak diubah oleh revisi ini."
      />
    </div>
  )
}
