/**
 * Editor Revisi MUK — FR.AK.01 (Pernyataan Persetujuan Asesmen).
 * Tampilan = form FR.AK.01 halaman asesi (FrAk01Page): satu tabel dokumen
 * (skema, identitas, bukti dikumpulkan, pelaksanaan, pernyataan, ttd).
 * Barcodes ttd read-only (gambar existing); hanya jawaban bukti + waktu yang
 * direvisi.
 */
import { useEffect, useState } from 'react'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { DocTitle, fmtTanggalId } from './bnsp'

interface BuktiAsesmen {
  id: number
  nama: string
  jawaban?: boolean
}
interface Ak01Barcode {
  url: string
  tanggal: string
  nama: string
}
interface Ak01Barcodes {
  asesi?: Ak01Barcode | null
  asesor1?: Ak01Barcode | null
  asesor2?: Ak01Barcode | null
}
interface Ak01Response {
  message: string
  data?: {
    barcodes?: Ak01Barcodes
    items?: BuktiAsesmen[]
    waktu?: string
  }
}

const td = { border: '1px solid #000', padding: '6px 8px' } as const

/** "Jumat, 06 Februari 2026" — persis formatTanggalUji FrAk01Page. */
function hariTanggalId(v?: string | null): string {
  if (!v) return ''
  const date = new Date(v)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/** Sel ttd read-only: barcode existing atau titik-titik (seperti halaman asesi). */
function TtdContent({ label, barcode, fallback }: { label: string; barcode?: Ak01Barcode | null; fallback?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {label}<br />
      {barcode?.url ? (
        <>
          <img src={barcode.url} alt={label} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
            {barcode.nama?.toUpperCase()}
          </div>
          {barcode.tanggal && (
            <span style={{ fontSize: '10px', color: '#666' }}>{fmtTanggalId(barcode.tanggal)}</span>
          )}
        </>
      ) : (
        <span>{fallback || '.............................................'}</span>
      )}
    </div>
  )
}

export function Ak01Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak01Response>(praUrl(idIzin, 'ak01'))

  const [items, setItems] = useState<BuktiAsesmen[]>([])
  const [barcodes, setBarcodes] = useState<Ak01Barcodes | undefined>(undefined)
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [waktu, setWaktu] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.items) return
    setItems(inner.items)
    setBarcodes(inner.barcodes)
    const init: Record<number, boolean> = {}
    inner.items.forEach((it) => {
      init[it.id] = it.jawaban === true
    })
    setChecked(init)
    setWaktu(inner.waktu ?? '')
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(praUrl(idIzin, 'ak01'), {
        answers: items.map((it) => ({
          id_referensi: it.id,
          jawaban: checked[it.id] ?? false,
        })),
        waktu: waktu || '00:00 - Selesai',
      })
      toast.showSuccess('FR.AK.01 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.01')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (items.length === 0) return <DocError message="Data FR.AK.01 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const checkedCount = items.filter((it) => checked[it.id]).length

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.AK.01 - PERSETUJUAN ASESMEN</DocTitle>

      {/* Form Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: '#fff' }}>
        <tbody>
          {/* Penjelasan */}
          <tr>
            <td colSpan={4} style={td}>
              Persetujuan Asesmen ini untuk menjamin bahwa Asesi telah diberi arahan
              secara rinci tentang perencanaan dan proses asesmen
            </td>
          </tr>

          {/* Skema Sertifikasi */}
          <tr>
            <td rowSpan={2} style={{ ...td, width: '35%', fontWeight: 'bold', verticalAlign: 'top' }}>
              Skema Sertifikasi<br />(<del>KKNI</del>/Okupasi/<del>Klaster</del>)
            </td>
            <td style={{ ...td, width: '15%', fontWeight: 'bold' }}>Judul</td>
            <td style={{ ...td, width: '5%', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={td}>{header?.jabatanKerja?.toUpperCase() || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...td, fontWeight: 'bold' }}>Nomor</td>
            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={td}>{header?.nomorSkema?.toUpperCase() || '-'}</td>
          </tr>

          {/* Identitas */}
          <tr>
            <td style={{ ...td, fontWeight: 'bold' }}>TUK</td>
            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td colSpan={2} style={td}>{header?.tuk?.toUpperCase() || 'Sewaktu/Tempat Kerja/Mandiri*'}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ ...td, fontWeight: 'bold' }}>Nama Asesor {idx + 1}</td>
                <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={td}>
                  {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ ...td, fontWeight: 'bold' }}>Nama Asesor</td>
              <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={td}>
                {asesorList.length > 0
                  ? `${asesorList[0].nama?.toUpperCase() || ''}${asesorList[0].noreg ? ` (${asesorList[0].noreg})` : ''}`
                  : '-'}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ ...td, fontWeight: 'bold' }}>Nama Asesi</td>
            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td colSpan={2} style={td}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
          </tr>

          {/* Bukti yang akan dikumpulkan — 2 kolom, editable (bagian yang direvisi) */}
          <tr>
            <td style={{ ...td, fontWeight: 'bold', verticalAlign: 'top' }}>
              Bukti yang akan dikumpulkan :
            </td>
            <td colSpan={3} style={td}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {items.map((bukti, index) => {
                    const isFirstInRow = index % 2 === 0
                    return (
                      <tr key={bukti.id}>
                        {isFirstInRow && (
                          <>
                            <td style={{ padding: '2px 4px', border: 'none' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                <CustomCheckbox
                                  checked={checked[bukti.id] ?? false}
                                  onChange={() =>
                                    setChecked((prev) => ({ ...prev, [bukti.id]: !(prev[bukti.id] ?? false) }))
                                  }
                                  disabled={isSaving}
                                />
                                {bukti.nama}
                              </label>
                            </td>
                            {items[index + 1] ? (
                              <td style={{ padding: '2px 4px', border: 'none' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                  <CustomCheckbox
                                    checked={checked[items[index + 1].id] ?? false}
                                    onChange={() =>
                                      setChecked((prev) => ({ ...prev, [items[index + 1].id]: !(prev[items[index + 1].id] ?? false) }))
                                    }
                                    disabled={isSaving}
                                  />
                                  {items[index + 1].nama}
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
            <td rowSpan={3} style={{ ...td, fontWeight: 'bold', verticalAlign: 'top' }}>
              Pelaksanaan asesmen disepakati pada:
            </td>
            <td style={{ ...td, fontWeight: 'bold' }}>Hari / Tanggal</td>
            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={td}>{hariTanggalId(header?.tanggalUji)}</td>
          </tr>
          <tr>
            <td style={{ ...td, fontWeight: 'bold' }}>Waktu</td>
            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={td}>
              <input
                type="text"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                disabled={isSaving}
                placeholder="mis. 09:00 - Selesai"
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  width: '180px',
                  cursor: isSaving ? 'not-allowed' : 'text',
                  background: isSaving ? '#f5f5f5' : '#fff',
                }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ ...td, fontWeight: 'bold' }}>TUK</td>
            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={td}>{header?.tuk?.toUpperCase() || ''}</td>
          </tr>

          {/* Pernyataan Asesi (hak banding) */}
          <tr>
            <td colSpan={4} style={td}>
              <span style={{ fontWeight: 'bold' }}>Asesi :</span><br /><br />
              Bahwa saya telah mendapatkan penjelasan terkait hak dan prosedur banding asesmen dari asesor.
            </td>
          </tr>
          {/* Pernyataan Asesor */}
          <tr>
            <td colSpan={4} style={td}>
              <span style={{ fontWeight: 'bold' }}>Asesor :</span><br /><br />
              Menyatakan tidak akan membuka hasil pekerjaan yang saya peroleh karena
              penugasan saya sebagai Asesor dalam pekerjaan Asesmen kepada siapapun
              atau organisasi apapun selain kepada pihak yang berwenang sehubungan
              dengan kewajiban saya sebagai Asesor yang ditugaskan oleh LSP.
            </td>
          </tr>

          {/* Pernyataan Asesi */}
          <tr>
            <td colSpan={4} style={td}>
              <span style={{ fontWeight: 'bold' }}>Asesi :</span><br /><br />
              Saya setuju mengikuti asesmen dengan pemahaman bahwa informasi yang
              dikumpulkan hanya digunakan untuk pengembangan profesional dan hanya
              dapat diakses oleh orang tertentu saja.
            </td>
          </tr>

          {/* Tanda Tangan — barcode existing read-only */}
          {barcodes?.asesor2?.url ? (
            <>
              <tr>
                <td colSpan={2} style={{ ...td, height: '70px', verticalAlign: 'bottom' }}>
                  <TtdContent label="Tanda tangan Asesor 1 :" barcode={barcodes?.asesor1} />
                </td>
                <td colSpan={2} style={{ ...td, height: '70px', verticalAlign: 'bottom' }}>
                  <TtdContent label="Tanda tangan Asesor 2 :" barcode={barcodes?.asesor2} />
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ ...td, height: '70px', verticalAlign: 'bottom' }}>
                  <TtdContent label="Tanda tangan Asesi :" barcode={barcodes?.asesi} fallback=".............................................." />
                </td>
              </tr>
            </>
          ) : (
            <tr>
              <td colSpan={2} style={{ ...td, height: '70px', verticalAlign: 'bottom' }}>
                <TtdContent label="Tanda tangan Asesor :" barcode={barcodes?.asesor1} />
              </td>
              <td colSpan={2} style={{ ...td, height: '70px', verticalAlign: 'bottom' }}>
                <TtdContent label="Tanda tangan Asesi :" barcode={barcodes?.asesi} fallback=".............................................." />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p style={{ fontSize: '12px' }}>* Coret yang tidak perlu</p>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note={`${checkedCount} dari ${items.length} bukti dicentang.`}
      />
    </div>
  )
}
