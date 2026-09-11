/**
 * Editor Revisi MUK — FR.AK.07 (Penyesuaian & Rencana Asesmen).
 * Tampilan = form FR.AK.07 halaman asesi (FrAk07Page): tabel identitas,
 * panduan, potensi asesi, tabel modifikasi (Ya/Tidak/Keterangan), rekaman
 * rencana asesmen, hasil penyesuaian, tabel ttd (barcode existing read-only).
 * Semantik `value` per kelompok (urut) — meniru FrAk07Page persis:
 *  urut 1: bool | urut 2: bool (+custom_name utk ref terakhir tiap kategori)
 *  urut 3: {bool, text} | urut 4: string
 */
import { useEffect, useMemo, useState } from 'react'
import { BRANDING } from '@/config/branding'
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

interface Referensi {
  id: number
  nama: string | null
  jawaban?: boolean | string | { bool: boolean; text: string } | null
}
interface Kategori {
  id: number | null
  kategori: string | null
  nama: string | null
  urut: number | null
  id_kelompok: number | null
  referensis: Referensi[]
}
interface KelompokItem {
  id: number
  nama: string
  urut: number
  kategoris: Kategori[]
}
interface Ak07Barcode {
  url: string
  tanggal: string
  nama: string
}
interface Ak07Barcodes {
  asesi?: Ak07Barcode
  asesor1?: Ak07Barcode
  asesor2?: Ak07Barcode
  /** Format baru: barcode per id asesor. */
  asesor?: Record<string, Ak07Barcode>
}
interface Ak07Response {
  message: string
  data?: {
    data?: { barcodes?: Ak07Barcodes; kelompoks?: KelompokItem[] }
    barcodes?: Ak07Barcodes
    kelompoks?: KelompokItem[]
  }
}

/** Key state per referensi: refId_kategoriId_kelompokId (persis FrAk07Page). */
const refKey = (refId: number, kategoriId: number | null, kelompokId: number) =>
  `${refId}_${kategoriId}_${kelompokId}`

const hdStyle = { border: '1px solid #000', padding: '6px 8px', background: BRANDING.primaryColor, color: '#fff', fontSize: '14px' } as const
const txtStyle = { width: '100%', padding: '4px', border: '1px solid #ccc', fontSize: '12px', minHeight: '24px', height: '24px', overflow: 'hidden', resize: 'none', fontFamily: 'Arial, Helvetica, sans-serif', boxSizing: 'border-box' } as const

/** Textarea auto-grow 1 baris gaya asesi. */
function AutoTextarea({
  value,
  onChange,
  disabled,
  placeholder,
  prefillHeight,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
  prefillHeight?: boolean
}) {
  return (
    <textarea
      value={value}
      onInput={(e) => {
        const el = e.currentTarget
        el.style.height = '24px'
        el.style.height = el.scrollHeight + 'px'
      }}
      ref={(el) => {
        if (el && prefillHeight) {
          el.style.height = '24px'
          el.style.height = el.scrollHeight + 'px'
        }
      }}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={1}
      style={{ ...txtStyle, cursor: disabled ? 'not-allowed' : 'text', background: disabled ? '#f5f5f5' : '#fff' }}
      placeholder={placeholder}
    />
  )
}

export function Ak07Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak07Response>(praUrl(idIzin, 'ak07'))

  const [kelompoks, setKelompoks] = useState<KelompokItem[]>([])
  const [barcodes, setBarcodes] = useState<Ak07Barcodes | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean | null>>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // nested data.data atau langsung data (mirip FrAk07Page)
    const inner = data?.data?.data || data?.data
    const kelompokList = inner?.kelompoks
    if (!kelompokList) return
    setKelompoks(kelompokList)
    setBarcodes(inner?.barcodes ?? data?.data?.barcodes ?? null)

    const newSelected: Record<string, boolean | null> = {}
    const newText: Record<number, string> = {}
    kelompokList.forEach((item) => {
      item.kategoris.forEach((kategori) => {
        kategori.referensis.forEach((ref) => {
          const j = ref.jawaban
          if (typeof j === 'object' && j !== null && 'text' in j) {
            newText[ref.id] = j.text
          } else if (typeof j === 'string' && j) {
            newText[ref.id] = j
          }
          if (typeof j === 'object' && j !== null && 'bool' in j) {
            newSelected[refKey(ref.id, kategori.id, item.id)] = j.bool
          } else if (j === true || j === false) {
            newSelected[refKey(ref.id, kategori.id, item.id)] = j
          }
        })
      })
    })
    setSelected(newSelected)
    setTextAnswers(newText)
  }, [data])

  // Klik ulang nilai sama = kosongkan (null), klik shift = terapkan ke semua
  // baris bernama — persis handleReferenceChange/handleBulkToggle FrAk07Page.
  const handleReferenceChange = (
    kategoris: Kategori[],
    kelompokId: number,
    kategoriId: number | null,
    refId: number,
    value: boolean,
    shiftKey?: boolean
  ) => {
    if (shiftKey) {
      const updates: Record<string, boolean | null> = {}
      kategoris.forEach((kategori) => {
        if (!kategori.nama) return
        kategori.referensis.forEach((ref, idx) => {
          if (!ref.nama) return
          if (idx === kategori.referensis.length - 1) return // skip baris keterangan
          updates[refKey(ref.id, kategori.id, kelompokId)] = value
        })
      })
      setSelected((prev) => ({ ...prev, ...updates }))
      return
    }
    const key = refKey(refId, kategoriId, kelompokId)
    setSelected((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }))
  }

  const handleSave = async () => {
    if (kelompoks.length === 0) {
      toast.showWarning('Data FR.AK.07 belum termuat')
      return
    }
    setIsSaving(true)
    try {
      const answers: {
        referensi_id: number
        kelompok_id: number
        value: boolean | string | { bool: boolean; text: string }
        custom_name?: string
      }[] = []

      const byUrut = (urut: number) => kelompoks.find((d) => d.urut === urut)
      const stateOf = (key: string) => selected[key] ?? null

      // Kelompok urut 1 (Potensi Asesi) — boolean per item
      const potensi = byUrut(1)
      if (potensi) {
        potensi.kategoris.forEach((kategori) => {
          kategori.referensis.forEach((ref) => {
            answers.push({
              referensi_id: ref.id,
              kelompok_id: potensi.id,
              value: stateOf(refKey(ref.id, kategori.id, potensi.id)) === true,
            })
          })
        })
      }

      // Kelompok urut 2 (Modifikasi) — boolean; ref terakhir tiap kategori dgn custom_name
      const modifikasi = byUrut(2)
      if (modifikasi) {
        modifikasi.kategoris.forEach((kategori) => {
          kategori.referensis.forEach((ref, refIdx) => {
            const isLast = refIdx === kategori.referensis.length - 1
            const key = refKey(ref.id, kategori.id, modifikasi.id)
            if (!isAnswered(key)) return
            if (isLast) {
              answers.push({
                referensi_id: ref.id,
                kelompok_id: modifikasi.id,
                value: selected[key] === true,
                custom_name: textAnswers[ref.id] || '',
              })
            } else {
              answers.push({
                referensi_id: ref.id,
                kelompok_id: modifikasi.id,
                value: selected[key] === true,
              })
            }
          })
        })
      }

      // Kelompok urut 3 (Rekaman Rencana Asesmen) — {bool, text}
      const rencana = byUrut(3)
      if (rencana && rencana.kategoris[0]) {
        const kategoriId = rencana.kategoris[0].id
        rencana.kategoris[0].referensis.forEach((ref) => {
          answers.push({
            referensi_id: ref.id,
            kelompok_id: rencana.id,
            value: {
              bool: stateOf(refKey(ref.id, kategoriId, rencana.id)) === true,
              text: textAnswers[ref.id] || '',
            },
          })
        })
      }

      // Kelompok urut 4 (Hasil Penyesuaian) — string
      const hasil = byUrut(4)
      if (hasil && hasil.kategoris[0]) {
        hasil.kategoris[0].referensis.forEach((ref) => {
          const userInput = textAnswers[ref.id]
          const finalValue =
            userInput !== undefined
              ? userInput
              : typeof ref.jawaban === 'string'
                ? ref.jawaban
                : ''
          answers.push({
            referensi_id: ref.id,
            kelompok_id: hasil.id,
            value: finalValue,
          })
        })
      }

      await saveDoc(praUrl(idIzin, 'ak07'), { answers })
      toast.showSuccess('FR.AK.07 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.07')
    } finally {
      setIsSaving(false)
    }
  }

  const isAnswered = (key: string) => selected[key] === true || selected[key] === false

  const totalRefs = useMemo(
    () =>
      kelompoks.reduce(
        (n, k) => n + k.kategoris.reduce((m, kat) => m + kat.referensis.length, 0),
        0
      ),
    [kelompoks]
  )

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompoks.length === 0) return <DocError message="Data FR.AK.07 tidak ditemukan." onRetry={reload} />

  const byUrut = (urut: number) => kelompoks.find((d) => d.urut === urut)
  const potensiAsesiData = byUrut(1)
  const modifikasiData = byUrut(2)
  const rencanaAsesmenData = byUrut(3)
  const hasilPenyesuaianData = byUrut(4)
  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const isDisabled = isSaving
  const barcodeAsesor = (asesorId: number, idx: number) =>
    barcodes?.asesor?.[String(asesorId)] ?? (idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2)

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.AK.07 - FORMULIR PENYESUAIAN ASESMEN</DocTitle>

      {/* Identitas Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '13px', background: '#fff' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', fontWeight: 'bold', verticalAlign: 'top' }}>
              Skema Sertifikasi<br />
              <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(<del>KKNI</del>/Okupasi/<del>Klaster</del>)</span>
            </td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%', fontWeight: 'bold' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{header?.jabatanKerja?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{header?.nomorSkema?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{header?.tuk?.toUpperCase() || 'Sewaktu/Tempat Kerja/Mandiri*'}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesor {idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                  {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                {asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{header?.namaAsesi || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{fmtTanggalId(header?.tanggalUji)}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: '11px', marginBottom: '12px', color: '#666' }}>*Coret yang tidak perlu</p>

      {/* Panduan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#f0f0f0' }}>PANDUAN BAGI ASESOR</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', lineHeight: '1.6' }}>
              • Formulir ini digunakan pada saat pelaksanaan pra asesmen<br />
              • Formulir ini terdiri dari dua bagian yaitu A dan B<br />
              • Coretlah pada tanda * yang tidak sesuai<br />
              • Berilah tanda √ Ya atau Tidak pada tanda ** sesuai pilihan<br />
              • Berilah tanda √ pada kotak ☐ pada kolom potensi asesi<br />
              • Formulir ini juga digunakan untuk bagian B<br />
              • Berilah tanda √ Ya atau Tidak pada tanda *** sesuai pilihan
            </td>
          </tr>
        </tbody>
      </table>

      {/* Potensi Asesi */}
      {potensiAsesiData && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '20%', fontWeight: 'bold', verticalAlign: 'top' }}>
                Potensi Asesi
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                {(potensiAsesiData.kategoris[0]?.referensis ?? []).map((ref) => {
                  const katId = potensiAsesiData.kategoris[0]?.id || null
                  const checked = selected[refKey(ref.id, katId, potensiAsesiData.id)] === true
                  return (
                    <div key={ref.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ marginRight: '10px' }}>
                        <CustomCheckbox
                          checked={checked}
                          disabled={isDisabled}
                          onChange={() => !isSaving && handleReferenceChange(potensiAsesiData.kategoris, potensiAsesiData.id, katId, ref.id, true)}
                        />
                      </div>
                      <span style={{ flex: 1, fontSize: '14px' }}>{ref.nama}</span>
                    </div>
                  )
                })}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Bagian A - Mengidentifikasi Persyaratan Modifikasi */}
      {modifikasiData && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
          <tbody>
            <tr>
              <th style={{ ...hdStyle, width: '5%' }}>No</th>
              <th style={{ ...hdStyle, width: '35%' }}>Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi</th>
              <th style={{ ...hdStyle, width: '60px', textAlign: 'center' }}>Ya</th>
              <th style={{ ...hdStyle, width: '60px', textAlign: 'center' }}>Tidak</th>
              <th style={hdStyle}>Keterangan</th>
            </tr>

            {modifikasiData.kategoris.map((kategori, kategoriIndex) => {
              if (!kategori.nama) return null
              const allReferensis = kategori.referensis

              return allReferensis.map((ref, refIdx) => {
                const key = refKey(ref.id, kategori.id, modifikasiData.id)
                const isFirstRow = refIdx === 0
                const borderBottom = refIdx < allReferensis.length - 1 ? '1px solid #ccc' : '1px solid #000'

                return (
                  <tr key={`${kategori.id || kategoriIndex}-${ref.id}`}>
                    {isFirstRow && (
                      <>
                        <td rowSpan={allReferensis.length} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                          {kategori.urut || kategoriIndex + 1}
                        </td>
                        <td rowSpan={allReferensis.length} style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top' }}>
                          {kategori.nama}
                        </td>
                      </>
                    )}
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', borderBottom }}>
                      <CustomCheckbox
                        checked={selected[key] === true}
                        onChange={(shiftKey) => {
                          if (isSaving) return
                          handleReferenceChange(modifikasiData.kategoris, modifikasiData.id, kategori.id, ref.id, true, shiftKey)
                        }}
                        disabled={isDisabled}
                      />
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', borderBottom }}>
                      <CustomCheckbox
                        checked={selected[key] === false}
                        onChange={(shiftKey) => {
                          if (isSaving) return
                          handleReferenceChange(modifikasiData.kategoris, modifikasiData.id, kategori.id, ref.id, false, shiftKey)
                        }}
                        disabled={isDisabled}
                      />
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', borderBottom, fontSize: '14px' }}>
                      {refIdx !== allReferensis.length - 1 && ref.nama}
                      {refIdx === allReferensis.length - 1 && (
                        <textarea
                          value={textAnswers[ref.id] ?? ref.nama ?? ''}
                          onChange={(e) => setTextAnswers((prev) => ({ ...prev, [ref.id]: e.target.value }))}
                          disabled={isDisabled}
                          rows={1}
                          style={{ ...txtStyle, minHeight: '24px', overflow: 'hidden', marginTop: '4px', display: 'block', cursor: isDisabled ? 'not-allowed' : 'text', background: isDisabled ? '#f5f5f5' : '#fff' }}
                          placeholder="Isi keterangan..."
                        />
                      )}
                    </td>
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      )}

      {/* Rekaman Rencana Asesmen */}
      {rencanaAsesmenData && rencanaAsesmenData.kategoris[0]?.referensis && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
          <tbody>
            <tr>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '55%', background: '#fff', color: '#000', textAlign: 'left', fontSize: '14px' }}>Rekaman Rencana Asesmen</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '60px', background: '#fff', color: '#000', textAlign: 'center', fontSize: '14px' }}>Ya</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '60px', background: '#fff', color: '#000', textAlign: 'center', fontSize: '14px' }}>Tidak</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '20%', background: '#fff', color: '#000', textAlign: 'left', fontSize: '14px' }}>Keterangan</th>
            </tr>

            {rencanaAsesmenData.kategoris[0].referensis.map((ref, refIdx) => {
              const kategoriId = rencanaAsesmenData.kategoris[0]?.id || null
              const key = refKey(ref.id, kategoriId, rencanaAsesmenData.id)
              return (
                <tr key={ref.id}>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'top', borderRight: 'none' }}>
                    {refIdx + 1}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top', borderLeft: 'none' }}>
                    {ref.nama}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                    <CustomCheckbox
                      checked={selected[key] === true}
                      onChange={(shiftKey) => {
                        if (isSaving) return
                        handleReferenceChange(rencanaAsesmenData.kategoris, rencanaAsesmenData.id, kategoriId, ref.id, true, shiftKey)
                      }}
                      disabled={isDisabled}
                    />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                    <CustomCheckbox
                      checked={selected[key] === false}
                      onChange={(shiftKey) => {
                        if (isSaving) return
                        handleReferenceChange(rencanaAsesmenData.kategoris, rencanaAsesmenData.id, kategoriId, ref.id, false, shiftKey)
                      }}
                      disabled={isDisabled}
                    />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '14px' }}>
                    <AutoTextarea
                      value={textAnswers[ref.id] || ''}
                      onChange={(v) => setTextAnswers((prev) => ({ ...prev, [ref.id]: v }))}
                      disabled={isDisabled}
                      placeholder="Keterangan..."
                      prefillHeight
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Hasil Penyesuaian */}
      {hasilPenyesuaianData && hasilPenyesuaianData.kategoris[0]?.referensis && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
          <tbody>
            <tr>
              <th colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', width: '45%', background: '#fff', color: '#000', fontSize: '14px', textAlign: 'left' }}>Hasil Penyesuaian yang wajar dan beralasan disepakati menggunakan:</th>
            </tr>

            {hasilPenyesuaianData.kategoris[0].referensis.map((ref, refIdx) => (
              <tr key={ref.id}>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left', verticalAlign: 'top', borderRight: 'none' }}>
                  {refIdx + 1}) {ref.nama}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top', borderLeft: 'none', borderRight: 'none' }}>
                  :
                </td>
                <td style={{ border: '1px solid #000', padding: '4px', fontSize: '14px', borderLeft: 'none' }}>
                  <AutoTextarea
                    value={textAnswers[ref.id] ?? (typeof ref.jawaban === 'string' ? ref.jawaban : '')}
                    onChange={(v) => setTextAnswers((prev) => ({ ...prev, [ref.id]: v }))}
                    disabled={isDisabled}
                    placeholder="Jawaban..."
                    prefillHeight
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Tanda Tangan — barcode existing read-only */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
        <tbody>
          {asesorList.length > 0 ? (
            asesorList.map((asesor, idx) => {
              const bc = barcodeAsesor(asesor.id, idx)
              const label = asesorList.length > 1 ? `Nama Asesor ${idx + 1}` : 'Nama Asesor'
              return (
                <tr key={asesor.id}>
                  <td style={{ border: '1px solid #000', padding: '8px', width: '50%', height: '100px' }}>
                    <div>{label} : {asesor.nama?.toUpperCase() || ''}</div>
                    {asesor.noreg && <div>No. Reg : {asesor.noreg}</div>}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px', width: '50%', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ marginBottom: '4px', textAlign: 'left' }}>Tanggal dan Tanda Tangan Asesor :</div>
                    {bc?.url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img src={bc.url} alt={`Tanda Tangan ${asesor.nama}`} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                        {bc.tanggal && (
                          <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(bc.tanggal)}</div>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', width: '50%', height: '100px' }}>
                <div>Nama Asesor : {header?.asesorList?.[0]?.nama?.toUpperCase() || ''}</div>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', width: '50%', verticalAlign: 'middle', textAlign: 'center' }}>
                <div style={{ marginBottom: '4px', textAlign: 'left' }}>Tanggal dan Tanda Tangan Asesor :</div>
                {barcodes?.asesor1?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesor1.url} alt="Tanda Tangan Asesor" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>{barcodes.asesor1.nama}</div>
                    {barcodes.asesor1.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(barcodes.asesor1.tanggal)}</div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', height: '100px' }}>
              <div>Nama Asesi :</div>
              <div>{header?.namaAsesi?.toUpperCase() || ''}</div>
            </td>
            <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
              <div style={{ marginBottom: '4px', textAlign: 'left' }}>Tanggal dan Tanda Tangan Asesi :</div>
              {barcodes?.asesi?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <img src={barcodes.asesi.url} alt="Tanda Tangan Asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                  {barcodes.asesi.tanggal && (
                    <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(barcodes.asesi.tanggal)}</div>
                  )}
                </div>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note={`${totalRefs} referensi — item kosong pada kelompok modifikasi tidak dikirim.`}
      />
    </div>
  )
}
