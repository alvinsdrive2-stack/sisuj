/**
 * Editor Revisi MUK — FR.APL.02 (Asesmen Mandiri).
 * Tampilan = form FR.APL.02 halaman asesi (Apl02Page): tabel identitas,
 * panduan, tabel unit dgn kolom K/BK + bukti (bisa direvisi), tabel rekomendasi
 * dgn metode asesmen + barcode ttd existing (read-only).
 * Hati-hati: POST wajib tiap answer punya ≥1 file → file bukti per elemen yang
 * tampil di kolom Bukti-lah yang dikirim sebagai file_ids. Admin bisa:
 *   - unggah file baru (POST praasesmen/{id}/apl02/files),
 *   - hapus file terunggah (DELETE praasesmen/apl02/files/{fileId} — lepas dari
 *     SEMUA elemen + hapus di FTP),
 *   - pasang/lepas lampiran bukti tiap elemen (disimpan saat Simpan).
 * Admin hanya merevisi `kompeten` & `metode` (metode tetap keputusan asesor).
 * is_dilanjutkan: true punya efek lanjut → konfirmasi sebelum simpan.
 */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { File, Trash2, Upload, X } from 'lucide-react'
import { BRANDING } from '@/config/branding'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { apl02FileDeleteUrl, deleteJson, praUrl, uploadForm } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { DocTitle, fmtTanggalId, type TtdBarcode } from './bnsp'

interface BarcodeInfo {
  url: string | null
  tanggal: string | null
  nama: string | null
}
interface SubunitBarcodes {
  asesi: BarcodeInfo
  asesor1: BarcodeInfo | null
  asesor2: BarcodeInfo | null
}
interface ServerFile {
  id: number
  name: string
  path: string
  filetype?: string | null
}

/** Bukti eksternal (mis. portal PU) = path berupa URL, bukan file di server moon. */
function isExternalFile(file: ServerFile | null | undefined): boolean {
  return !!file?.path && /^https?:\/\//i.test(file.path)
}
interface Subunit {
  id: string
  no_elemen: string
  judul_elemen: string
  kompeten?: boolean
  kuk_list: { no_kuk: string; judul_kuk: string }[]
  files: ServerFile[]
  barcodes?: SubunitBarcodes
}
interface Unit {
  id: string
  kode: string
  judul_kompetensi: string
  subunits: Subunit[]
}
interface Apl02Response {
  message: string
  data?: {
    metode?: 'observasi' | 'portofolio'
    is_dilanjutkan?: boolean
    units: Unit[]
    barcodes?: SubunitBarcodes
  }
}

type Metode = 'observasi' | 'portofolio'

const cell = { border: '1px solid #000', padding: '4px' } as const

/** Chip nama file bukti + aksi revisi (lepas dari elemen / hapus dari server). */
function FileChip({
  file,
  disabled,
  onDetach,
  onDelete,
}: {
  file: ServerFile
  disabled?: boolean
  onDetach: () => void
  onDelete: () => void
}) {
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: '#64748b',
    lineHeight: 1,
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '38px',
        background: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '0 8px 0 12px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#0369a1',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <File size={14} style={{ color: '#0284c7' }} />
      <a
        href={file.path}
        target="_blank"
        rel="noreferrer"
        title="Buka file"
        style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {file.name}
      </a>
      <button
        type="button"
        disabled={disabled}
        onClick={onDetach}
        title="Lepas file ini dari elemen (file tetap terunggah)"
        style={btn}
      >
        <X size={13} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        title="Hapus file dari server (lepas dari semua elemen)"
        style={{ ...btn, color: '#dc2626' }}
      >
        <Trash2 size={13} />
      </button>
    </span>
  )
}

const smallBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#0369a1',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '4px 8px',
  cursor: 'pointer',
  height: '28px',
}

const selectCls: React.CSSProperties = {
  fontSize: '11px',
  height: '28px',
  maxWidth: '260px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '0 4px',
  color: '#0369a1',
  background: '#fff',
}

/** Sel tanda tangan/tanggal read-only: barcode existing atau '-'. */
function TtdBox({ barcode }: { barcode?: TtdBarcode | BarcodeInfo | null }) {
  return (
    <td style={{ ...cell, height: '120px', padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
      {barcode?.url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src={barcode.url} alt="Tanda Tangan" style={{ height: '70px', width: '70px', objectFit: 'contain' }} />
          {barcode.tanggal && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{fmtTanggalId(barcode.tanggal)}</div>
          )}
        </div>
      ) : (
        '-'
      )}
    </td>
  )
}

export function Apl02Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Apl02Response>(praUrl(idIzin, 'apl02'))
  // Katalog semua file APL-02 yang sudah terunggah untuk izin ini (bisa dipasang
  // ke elemen mana pun). Dipakai untuk tombol unggah + pilih bukti per unit.
  const { data: filesData, reload: reloadFiles } = useDocFetch<{ data?: ServerFile[] }>(
    praUrl(idIzin, 'apl02/files')
  )

  const [units, setUnits] = useState<Unit[]>([])
  const [kompetenMap, setKompetenMap] = useState<Record<string, boolean>>({})
  /** Bukti per elemen (subunit_id → daftar file id) — inilah file_ids saat simpan. */
  const [buktiMap, setBuktiMap] = useState<Record<string, number[]>>({})
  const [metode, setMetode] = useState<Metode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [subunitBarcodes, setSubunitBarcodes] = useState<Record<string, SubunitBarcodes>>({})
  const [uploadingUnit, setUploadingUnit] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServerFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const uploadTargetRef = useRef<string | null>(null)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.units) return
    setUnits(inner.units)
    setMetode(inner.metode ?? null)

    const init: Record<string, boolean> = {}
    const bcs: Record<string, SubunitBarcodes> = {}
    const initBukti: Record<string, number[]> = {}
    inner.units.forEach((unit) => {
      unit.subunits.forEach((subunit) => {
        // Default 'K' bila belum pernah disimpan (mirip Apl02Page asesi)
        init[subunit.id] = subunit.kompeten !== false
        if (subunit.barcodes) bcs[subunit.id] = subunit.barcodes
        else if (inner.barcodes) bcs[subunit.id] = inner.barcodes
        initBukti[subunit.id] = (subunit.files ?? []).map((f) => f.id)
      })
    })
    setKompetenMap(init)
    setBuktiMap(initBukti)
    setSubunitBarcodes(bcs)
  }, [data])

  const allFiles = useMemo(() => filesData?.data ?? [], [filesData])

  /** Katalog file: gabungan daftar server + lampiran yang tampil di dokumen. */
  const fileById = useMemo(() => {
    const map = new Map<number, ServerFile>()
    allFiles.forEach((f) => map.set(f.id, f))
    units.forEach((u) =>
      u.subunits.forEach((s) => {
        ;(s.files ?? []).forEach((f) => {
          if (!map.has(f.id)) map.set(f.id, f)
        })
      })
    )
    return map
  }, [allFiles, units])

  const detachFile = (subunitId: string, fileId: number) => {
    setBuktiMap((prev) => ({
      ...prev,
      [subunitId]: (prev[subunitId] ?? []).filter((id) => id !== fileId),
    }))
  }

  const attachFile = (subunitId: string, fileId: number) => {
    setBuktiMap((prev) => {
      const cur = prev[subunitId] ?? []
      if (cur.includes(fileId)) return prev
      return { ...prev, [subunitId]: [...cur, fileId] }
    })
  }

  const pickUpload = (subunitId: string) => {
    uploadTargetRef.current = subunitId
    uploadInputRef.current?.click()
  }

  /** Unggah file baru ke server lalu langsung pasang sebagai bukti elemen ini. */
  const handleUploadPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const subunitId = uploadTargetRef.current
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!picked.length || !subunitId) return

    const form = new FormData()
    picked.forEach((f) => {
      form.append('files[]', f)
      const base = f.name.replace(/\.[^.]+$/, '') || 'bukti'
      form.append('filetypes[]', base.toLowerCase().replace(/\s+/g, '_'))
    })

    setUploadingUnit(subunitId)
    try {
      const res = await uploadForm<{ message: string; files?: { id: number }[] }>(
        praUrl(idIzin, 'apl02/files'),
        form
      )
      const ids = (res.files ?? []).map((f) => f.id)
      reloadFiles()
      ids.forEach((id) => attachFile(subunitId, id))
      toast.showSuccess(`${ids.length} file diunggah & dipasang sebagai bukti elemen ini`)
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Gagal mengunggah file')
    } finally {
      setUploadingUnit(null)
      uploadTargetRef.current = null
    }
  }

  /** Hapus file dari server (lepas dari semua elemen + hapus di FTP). */
  const doDeleteFile = async () => {
    const target = deleteTarget
    if (!target) return
    setIsDeleting(true)
    try {
      await deleteJson(apl02FileDeleteUrl(target.id))
      setBuktiMap((prev) => {
        const next: Record<string, number[]> = {}
        Object.entries(prev).forEach(([key, ids]) => {
          next[key] = ids.filter((id) => id !== target.id)
        })
        return next
      })
      reloadFiles()
      toast.showSuccess(`File "${target.name}" dihapus dari server`)
      setDeleteTarget(null)
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Gagal menghapus file')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalSubunit = useMemo(
    () => units.reduce((n, u) => n + u.subunits.length, 0),
    [units]
  )
  const subunitTanpaFile = useMemo(
    () => units.flatMap((u) => u.subunits).filter((s) => (buktiMap[s.id] ?? []).length === 0).length,
    [units, buktiMap]
  )

  const doSave = async () => {
    setConfirmOpen(false)
    setIsSaving(true)
    try {
      const answers = units.flatMap((unit) =>
        unit.subunits.map((subunit) => ({
          subunit_id: subunit.id,
          kompeten: kompetenMap[subunit.id] ?? true,
          // Bukti yang tampil di kolom "Bukti" elemen ini (validasi backend: ≥1 file per answer)
          file_ids: buktiMap[subunit.id] ?? [],
          file_urls: [] as { url: string; name: string }[],
        }))
      )
      await saveDoc(praUrl(idIzin, 'apl02'), {
        metode: metode ?? '',
        is_dilanjutkan: true,
        answers,
      })
      toast.showSuccess('FR.APL.02 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.APL.02')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClick = () => {
    if (units.length === 0) {
      toast.showWarning('Tidak ada data elemen untuk disimpan')
      return
    }
    if (subunitTanpaFile > 0) {
      toast.showWarning(
        `${subunitTanpaFile} elemen belum punya file bukti — unggah file baru atau pasang bukti yang sudah terunggah sebelum menyimpan.`
      )
      return
    }
    setConfirmOpen(true)
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (units.length === 0) return <DocError message="Data FR.APL.02 tidak ditemukan." onRetry={reload} />

  const jenjang = parseInt(dokumenHeader?.jenjang || '0', 10)
  const header = dokumenHeader
  const namaAsesor = (header?.asesorList ?? [])
    .map((a) => a.nama)
    .filter(Boolean)
    .join(', ')
  const firstSubunitId = Object.keys(subunitBarcodes)[0]
  const asesiBarcode = Object.values(subunitBarcodes).find((b) => b.asesi?.url)?.asesi

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>APL-02 ASESMEN MANDIRI {header?.jabatanKerja || '-'}</DocTitle>

      {/* Tabel identitas dokumen */}
      <table style={{ width: '100%', tableLayout: 'fixed', contain: 'content' as const, borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '12px' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...cell, padding: '6px 8px', width: '25%', fontWeight: 'bold', verticalAlign: 'top', textTransform: 'uppercase' }}>
              Skema Sertifikasi<br />
              <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(<del>KKNI</del>/Okupasi/<del>Klaster</del>)</span>
            </td>
            <td style={{ ...cell, padding: '6px 8px', width: '12%', fontWeight: 'bold', textTransform: 'uppercase' }}>Judul</td>
            <td style={{ ...cell, padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
            <td style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nomor</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>TUK</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesor</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{namaAsesor || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesi</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.namaAsesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tanggal</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{fmtTanggalId(header?.tanggalUji) || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* Panduan */}
      <div style={{ background: BRANDING.primaryColor, color: '#fff', padding: '6px 8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
        Panduan Asesmen Mandiri
      </div>
      <div style={{ background: '#fff', border: '1px solid #000', marginBottom: '20px', fontSize: '11px' }}>
        <div style={{ padding: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Instruksi:</div>
          <ul style={{ margin: '4px 0 4px 20px', padding: 0 }}>
            <li>Baca setiap pertanyaan di kolom sebelah kiri</li>
            <li>Beri tanda centang (v) pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan</li>
            <li>Isi kolom di sebelah kanan dengan mendaftar bukti yang Anda miliki</li>
          </ul>
        </div>
      </div>

      {/* Daftar unit kompetensi — kolom bukti read-only (chip nama file) */}
      {units.map((unit, unitIndex) => (
        <table key={unit.id} style={{ width: '100%', tableLayout: 'fixed', contain: 'content' as const, borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ ...cell, width: '45%', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Kode &amp; Judul<br />Kompetensi {unitIndex + 1} :
              </td>
              <td style={{ ...cell, width: '5%' }}></td>
              <td style={{ ...cell, width: '5%' }}></td>
              <td style={{ ...cell, width: '45%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{unit.kode}</div>
                <div>{unit.judul_kompetensi}</div>
              </td>
            </tr>

            <tr>
              <td style={{ ...cell, width: '45%', fontWeight: 'bold', textTransform: 'uppercase' }}>DAPATKAH SAYA ?</td>
              <td style={{ ...cell, width: '5%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>K</td>
              <td style={{ ...cell, width: '5%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>BK</td>
              <td style={{ ...cell, width: '45%', fontWeight: 'bold', textTransform: 'uppercase' }}>Bukti</td>
            </tr>

            {unit.subunits.map((subunit) => {
              const kukCount = subunit.kuk_list.length
              const buktiIds = buktiMap[subunit.id] ?? []
              const buktiFiles = buktiIds
                .map((id) => fileById.get(id))
                .filter((f): f is ServerFile => Boolean(f))
              const availableFiles = allFiles.filter((f) => !buktiIds.includes(f.id))
              const isUploading = uploadingUnit === subunit.id
              return (
                <Fragment key={subunit.id}>
                  {/* Elemen Header */}
                  <tr>
                    <td style={cell}>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Elemen {subunit.no_elemen} :</span><br />
                      {subunit.judul_elemen}
                    </td>
                    <td style={cell}></td>
                    <td style={cell}></td>
                    <td style={cell}></td>
                  </tr>

                  {/* KUK rows + rowSpan K/BK/Bukti */}
                  {subunit.kuk_list.map((kuk, idx) => (
                    <tr key={kuk.no_kuk}>
                      <td style={{ ...cell, width: '45%', verticalAlign: 'top' }}>
                        {kuk.no_kuk} {kuk.judul_kuk}
                      </td>
                      {idx === 0 && (
                        <>
                          <td rowSpan={kukCount} style={{ ...cell, width: '5%', textAlign: 'center', verticalAlign: 'middle' }}>
                            <CustomCheckbox
                              checked={kompetenMap[subunit.id] === true}
                              onChange={() => setKompetenMap((prev) => ({ ...prev, [subunit.id]: true }))}
                            />
                          </td>
                          <td rowSpan={kukCount} style={{ ...cell, width: '5%', textAlign: 'center', verticalAlign: 'middle' }}>
                            <CustomCheckbox
                              checked={kompetenMap[subunit.id] === false}
                              onChange={() =>
                                setKompetenMap((prev) => ({ ...prev, [subunit.id]: prev[subunit.id] === false ? true : false }))
                              }
                            />
                          </td>
                          <td rowSpan={kukCount} style={{ ...cell, padding: '6px 8px', width: '45%', verticalAlign: 'top' }}>
                            {buktiFiles.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                {buktiFiles.map((file) => (
                                  <FileChip
                                    key={file.id}
                                    file={file}
                                    disabled={isSaving}
                                    onDetach={() => detachFile(subunit.id, file.id)}
                                    onDelete={() => setDeleteTarget(file)}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>Belum ada file bukti</div>
                            )}
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                              {availableFiles.length > 0 && (
                                <select
                                  value=""
                                  disabled={isSaving}
                                  style={selectCls}
                                  title="Pasang file yang sudah terunggah sebagai bukti elemen ini"
                                  onChange={(e) => {
                                    const id = Number(e.target.value)
                                    if (id) attachFile(subunit.id, id)
                                  }}
                                >
                                  <option value="">+ Tambah bukti…</option>
                                  {availableFiles.map((f) => (
                                    <option key={f.id} value={f.id}>
                                      {f.name}
                                      {f.filetype ? ` — ${f.filetype}` : ''}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <button
                                type="button"
                                style={{ ...smallBtn, cursor: isSaving || isUploading ? 'not-allowed' : 'pointer' }}
                                disabled={isSaving || isUploading}
                                onClick={() => pickUpload(subunit.id)}
                                title="Unggah file baru dari komputer lalu pasang sebagai bukti elemen ini"
                              >
                                <Upload size={12} /> {isUploading ? 'Mengunggah…' : 'Unggah file'}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      ))}

      {/* Rekomendasi Untuk Asesi */}
      <div style={{ padding: '8px 12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>REKOMENDASI UNTUK ASESI</span>
      </div>

      <table style={{ width: '100%', maxWidth: '100%', tableLayout: 'fixed', contain: 'content' as const, background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td rowSpan={3 + ((header?.asesorList?.length ?? 0) > 0 ? header!.asesorList.length * 4 : 3)} style={{ width: '30%', border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
              <span style={{ fontWeight: 'bold' }}>
                Rekomendasi Untuk Asesi: Asesmen{' '}
                <span>dapat</span> /{' '}
                <span style={{ textDecoration: 'none' }}>tidak dapat</span> dilanjutkan melalui pendekatan
              </span><br /><br />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <CustomCheckbox
                  checked={metode === 'observasi'}
                  onChange={() => setMetode('observasi')}
                  disabled={isSaving}
                />
                <span>Observasi</span>
              </label>
              {jenjang >= 4 && (
                <>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                    <CustomCheckbox
                      checked={metode === 'portofolio'}
                      onChange={() => setMetode('portofolio')}
                      disabled={isSaving}
                    />
                    <span>Portofolio</span>
                  </label>
                </>
              )}
            </td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesi :</td>
          </tr>
          <tr>
            <td style={{ width: '20%', border: '1px solid #000', padding: '8px' }}>Nama</td>
            <td style={{ width: '25%', border: '1px solid #000', padding: '8px' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
            <TtdBox barcode={asesiBarcode} />
          </tr>

          {(header?.asesorList?.length ?? 0) > 0 ? (
            header!.asesorList.map((asesor, idx) => {
              const asesorBarcode = firstSubunitId
                ? (idx === 0 ? subunitBarcodes[firstSubunitId]?.asesor1 : subunitBarcodes[firstSubunitId]?.asesor2)
                : null
              return (
                <Fragment key={asesor.id}>
                  {idx === 0 && (
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
                    </tr>
                  )}
                  {idx > 0 && (
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesor :</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Nama Asesor {header!.asesorList.length > 1 ? idx + 1 : ''} :</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.nama?.toUpperCase() || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                    <TtdBox barcode={asesorBarcode} />
                  </tr>
                </Fragment>
              )
            })
          ) : (
            <>
              <tr>
                <td></td>
                <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px' }}>Nama Asesor :</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{namaAsesor}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                <TtdBox barcode={firstSubunitId ? subunitBarcodes[firstSubunitId]?.asesor1 : null} />
              </tr>
            </>
          )}
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSaveClick}
        note={`${totalSubunit} elemen — unggah/hapus file bukti & atur lampiran per elemen, lalu Simpan.`}
      />

      {/* Input unggah file — satu input dipakai semua elemen (target ditentukan saat klik) */}
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
        style={{ display: 'none' }}
        onChange={handleUploadPicked}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Simpan Revisi APL 02?"
        message="Penyimpanan menandai asesmen mandiri ini dilanjutkan (is_dilanjutkan). Lanjutkan simpan?"
        confirmText="Ya, Simpan"
        onConfirm={doSave}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={isExternalFile(deleteTarget) ? 'Hapus tautan bukti ini?' : 'Hapus file dari server?'}
        message={
          isExternalFile(deleteTarget)
            ? `"${deleteTarget?.name ?? ''}" adalah berkas/tautan EKSTERNAL (bukan file di server) — akan dilepas dari SEMUA elemen dan datanya dihapus. Lanjutkan?`
            : `File "${deleteTarget?.name ?? ''}" akan dilepas dari SEMUA elemen dan dihapus permanen dari server. Lanjutkan?`
        }
        confirmText={isDeleting ? 'Menghapus…' : 'Ya, Hapus'}
        onConfirm={doDeleteFile}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
