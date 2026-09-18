/**
 * Editor Revisi MUK — FR.APL.02 (Asesmen Mandiri).
 * Tampilan sengaja DISAMAKAN dengan halaman praasesmen (src/pages/asesi/Apl02Page.tsx):
 *  - section terpisah "UPLOAD BUKTI DOKUMEN" (drop zone + daftar file terunggah),
 *  - kolom Bukti tiap elemen HANYA untuk memilih file yang sudah terunggah
 *    (dropdown pilihan — tidak ada unggah inline lagi),
 *  - khusus revisi-MUK: mengubah 1 bukti langsung diterapkan ke SELURUH elemen
 *    (delta: file yang ditambah/dilepas di satu elemen ikut ditambah/dilepas di
 *    semua elemen lain) selama toggle "Terapkan ke semua N elemen" aktif.
 * POST wajib tiap answer punya ≥1 file → daftar bukti di kolom Bukti-lah yang
 * dikirim sebagai file_ids. Admin hanya merevisi `kompeten` & `metode` (metode
 * tetap keputusan asesor). is_dilanjutkan: true → konfirmasi sebelum simpan.
 */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, File as FileIcon, FileImage, FileType, Trash2, X } from 'lucide-react'
import { API_BASE_URL } from '@/config/api'
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

/** Ikon file berdasar ekstensi (mengikuti halaman praasesmen Apl02Page). */
function getFileIcon(fileName: string): React.ReactNode {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') return <FileType size={14} style={{ color: '#dc2626' }} />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage size={14} style={{ color: '#059669' }} />
  if (['doc', 'docx'].includes(ext)) return <FileType size={14} style={{ color: '#2563eb' }} />
  return <FileIcon size={14} style={{ color: '#666' }} />
}

/** Chip bukti di kolom Bukti: klik nama = buka file, X = lepas bukti. */
function FileChip({
  file,
  disabled,
  onDetach,
  title,
}: {
  file: ServerFile
  disabled?: boolean
  onDetach: () => void
  title: string
}) {
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
      <FileIcon size={14} style={{ color: '#0284c7' }} />
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
        title={title}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: '2px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#dc2626',
          lineHeight: 1,
        }}
      >
        <X size={13} />
      </button>
    </span>
  )
}

/** Kapsul file di section upload: buka file + hapus permanen dari server. */
function UploadedCapsule({
  file,
  disabled,
  onDelete,
}: {
  file: ServerFile
  disabled?: boolean
  onDelete: () => void
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        height: '38px',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '0 8px 0 12px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#333',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {getFileIcon(file.name)}
        <a
          href={file.path}
          target="_blank"
          rel="noreferrer"
          title="Buka file"
          style={{
            maxWidth: '240px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#0369a1',
            textDecoration: 'none',
          }}
        >
          {file.name}
        </a>
      </span>
      {file.filetype && (
        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{file.filetype}</span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        title={
          isExternalFile(file)
            ? 'Lepas tautan eksternal ini dari semua elemen'
            : 'Hapus file dari server (lepas dari SEMUA elemen)'
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: '2px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#dc2626',
          lineHeight: 1,
        }}
      >
        <Trash2 size={13} />
      </button>
    </span>
  )
}

/**
 * Dropdown pilih bukti per elemen (meniru BuktiDropdown halaman praasesmen). Menu
 * dirender via portal agar tidak terpotong tabel. Tetap terbuka setelah memilih
 * supaya bisa memilih beberapa file sekaligus.
 */
function BuktiPicker({
  uploadedFiles,
  selectedFileIds,
  onToggle,
  disabled,
}: {
  uploadedFiles: ServerFile[]
  selectedFileIds: number[]
  onToggle: (fileId: number) => void
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const kosong = uploadedFiles.length === 0

  const toggleDropdown = () => {
    if (disabled || kosong) return
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = Math.min(uploadedFiles.length * 40 + 20, 180)
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const top =
        spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? rect.top - dropdownHeight - 4 : rect.bottom + 4
      setMenuPosition({ top, left: rect.left, width: Math.max(rect.width, 260) })
    }
    setIsOpen((v) => !v)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setIsOpen(false)
    }
    const close = () => setIsOpen(false)
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || kosong}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: isOpen ? '1px solid #999' : '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 500,
          backgroundColor: disabled || kosong ? '#f5f5f5' : '#fff',
          cursor: disabled || kosong ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          color: '#333',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedFileIds.length > 0 && (
            <span
              style={{
                background: '#666',
                color: '#fff',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {selectedFileIds.length}
            </span>
          )}
          {selectedFileIds.length > 0
            ? 'file dipilih'
            : kosong
              ? '-- Upload file terlebih dahulu --'
              : '-- Pilih File --'}
        </span>
        <span
          style={{
            transition: 'transform 0.3s ease',
            display: 'inline-block',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen &&
        !kosong &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              zIndex: 100000,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '6px',
              maxHeight: '180px',
              overflowY: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {uploadedFiles.map((file, index) => {
              const isSelected = selectedFileIds.includes(file.id)
              return (
                <div
                  key={file.id}
                  onClick={() => onToggle(file.id)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    background: isSelected ? '#e8e8e8' : 'transparent',
                    borderBottom: index === uploadedFiles.length - 1 ? 'none' : '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#333',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <CustomCheckbox checked={isSelected} onChange={() => {}} style={{ pointerEvents: 'none' }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getFileIcon(file.name)}
                    <span>
                      {file.name}
                      {file.filetype ? ` — ${file.filetype}` : ''}
                    </span>
                  </span>
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', color: '#666' }}>
                      <Check size={16} />
                    </span>
                  )}
                </div>
              )
            })}
          </div>,
          document.body
        )}
    </div>
  )
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
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  /** Khusus revisi-MUK: 1 perubahan bukti langsung diterapkan ke semua elemen. */
  const [applyToAll, setApplyToAll] = useState(() => import.meta.env.VITE_APL02_APPLY_TO_ALL !== 'false')
  /** File hasil unggah sesi ini — katalog server bisa telat ter-refresh. */
  const [uploadedLocally, setUploadedLocally] = useState<ServerFile[]>([])
  const [deleteTarget, setDeleteTarget] = useState<ServerFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

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

  /** Katalog file: daftar server + file hasil unggah sesi ini (dedup by id). */
  const allFiles = useMemo(() => {
    const map = new Map<number, ServerFile>()
    ;(filesData?.data ?? []).forEach((f) => map.set(f.id, f))
    uploadedLocally.forEach((f) => map.set(f.id, f))
    return Array.from(map.values())
  }, [filesData, uploadedLocally])

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

  const subunitIds = useMemo(() => units.flatMap((u) => u.subunits.map((s) => s.id)), [units])

  /**
   * Inti revisi-MUK: satu perubahan bukti langsung diterapkan ke SEMUA elemen
   * (delta — hanya file yang diubah, file lain di elemen lain tidak diganggu).
   * Bila toggle "Terapkan ke semua" dimatikan, perubahan hanya untuk elemen itu.
   */
  const changeBukti = (subunitId: string, fileId: number, action: 'attach' | 'detach') => {
    setBuktiMap((prev) => {
      const next: Record<string, number[]> = {}
      Object.entries(prev).forEach(([key, ids]) => {
        const kena = applyToAll || key === subunitId
        if (!kena) {
          next[key] = ids
          return
        }
        next[key] =
          action === 'attach'
            ? ids.includes(fileId)
              ? ids
              : [...ids, fileId]
            : ids.filter((id) => id !== fileId)
      })
      return next
    })
    const nama = fileById.get(fileId)?.name ?? `#${fileId}`
    const verb = action === 'attach' ? 'dipasang di' : 'dilepas dari'
    toast.showSuccess(
      applyToAll ? `Bukti "${nama}" ${verb} semua ${subunitIds.length} elemen` : `Bukti "${nama}" ${verb} elemen ini`
    )
  }

  const toggleBukti = (subunitId: string, fileId: number) => {
    const isAttached = (buktiMap[subunitId] ?? []).includes(fileId)
    changeBukti(subunitId, fileId, isAttached ? 'detach' : 'attach')
  }

  /** Unggah file dari section upload (drop zone / browse), lalu pasang ke semua elemen. */
  const doUpload = async (picked: File[]) => {
    if (!picked.length || isUploading) return
    const form = new FormData()
    picked.forEach((f) => {
      form.append('files[]', f)
      const base = f.name.replace(/\.[^.]+$/, '') || 'bukti'
      form.append('filetypes[]', base.toLowerCase().replace(/\s+/g, '_'))
    })

    setIsUploading(true)
    try {
      const res = await uploadForm<{
        message: string
        files?: { id: number; name?: string; original_name?: string; path?: string; filetype?: string }[]
      }>(praUrl(idIzin, 'apl02/files'), form)
      const fileBase = import.meta.env.VITE_FILE_BASE_URL || API_BASE_URL.replace('/api', '')
      const uploaded: ServerFile[] = (res.files ?? []).map((f) => ({
        id: f.id,
        name: f.original_name || f.name || `file_${f.id}`,
        path: f.path
          ? /^https?:\/\//i.test(f.path)
            ? f.path
            : `${fileBase}${f.path.startsWith('/') ? '' : '/'}${f.path}`
          : '',
        filetype: f.filetype ?? null,
      }))
      if (uploaded.length) setUploadedLocally((prev) => [...prev, ...uploaded])

      if (applyToAll && uploaded.length) {
        const newIds = uploaded.map((f) => f.id)
        setBuktiMap((prev) => {
          const next: Record<string, number[]> = {}
          Object.entries(prev).forEach(([key, ids]) => {
            next[key] = [...ids, ...newIds.filter((id) => !ids.includes(id))]
          })
          return next
        })
      }

      reloadFiles()
      toast.showSuccess(
        uploaded.length === 0
          ? 'Tidak ada file yang diunggah'
          : applyToAll
            ? `${uploaded.length} file diunggah & langsung dipasang di semua ${subunitIds.length} elemen`
            : `${uploaded.length} file diunggah — pilih di kolom Bukti tiap elemen`
      )
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Gagal mengunggah file')
    } finally {
      setIsUploading(false)
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
      setUploadedLocally((prev) => prev.filter((f) => f.id !== target.id))
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

      {/* ===== Section terpisah: Upload Bukti Dokumen (sama seperti praasesmen) ===== */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          marginBottom: '20px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Upload Bukti Dokumen
            </span>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              Upload dokumen pendukung di sini, lalu cukup <strong>pilih</strong> di kolom bukti tiap elemen.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
              title={`Bila aktif: mengubah 1 bukti langsung diterapkan ke ${totalSubunit} elemen`}
            >
              <CustomCheckbox checked={applyToAll} onChange={() => setApplyToAll((v) => !v)} disabled={isSaving} />
              Terapkan ke semua {totalSubunit} elemen
            </label>
            {allFiles.length > 0 && (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
                {allFiles.length} File
              </div>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => {
            if (!isUploading && !isSaving) uploadInputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragOver(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragOver(false)
            if (isUploading || isSaving) return
            const dropped = e.dataTransfer?.files
            if (dropped?.length) doUpload(Array.from(dropped))
          }}
          style={{
            border: `2px dashed ${dragOver ? '#00488f' : '#0066cc'}`,
            borderRadius: '16px',
            padding: '32px 24px 24px',
            textAlign: 'center',
            cursor: isUploading || isSaving ? 'not-allowed' : 'pointer',
            background: dragOver ? '#e8f0fe' : 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
            transition: 'border-color 0.25s, background 0.25s',
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '34px',
                  height: '34px',
                  border: '3px solid #cfe3ff',
                  borderTopColor: '#0066cc',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'apl02spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#00488f' }}>Mengunggah…</span>
            </div>
          ) : (
            <>
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066cc"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '10px' }}
              >
                <path d="M12 16V4" />
                <path d="M8 8l4-4 4 4" />
                <path d="M20 16.5a4 4 0 0 0-2.2-7.4 5.5 5.5 0 0 0-10.5-1A4.5 4.5 0 0 0 4 17.5" />
              </svg>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0066cc', marginBottom: '4px' }}>
                Seret &amp; lepas file di sini
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>atau klik untuk browse</div>
              <div style={{ fontSize: '11px', color: '#999' }}>PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, PPT, PPTX (Maks. 5MB per file)</div>
            </>
          )}
        </div>

        <input
          ref={uploadInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? [])
            e.target.value = ''
            if (picked.length) doUpload(picked)
          }}
        />

        {allFiles.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              File yang Diupload ({allFiles.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {allFiles.map((file) => (
                <UploadedCapsule
                  key={file.id}
                  file={file}
                  disabled={isSaving}
                  onDelete={() => setDeleteTarget(file)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Catatan (sama seperti praasesmen + info penerapan ke semua elemen) */}
      <div style={{ background: '#fff9e6', border: '1px solid #e6b800', marginBottom: '20px', padding: '12px' }}>
        <p style={{ fontSize: '12px', color: '#000', margin: 0 }}>
          <strong>CATATAN:</strong> K = Kompeten, BK = Belum Kompeten. Kolom <strong>Bukti</strong> hanya untuk memilih file yang sudah
          diunggah di section atas.{' '}
          {applyToAll
            ? `Setiap perubahan bukti otomatis diterapkan ke SEMUA ${totalSubunit} elemen — matikan centang "Terapkan ke semua" bila ingin mengatur per elemen.`
            : 'Mode per elemen aktif — perubahan bukti hanya berlaku pada elemen yang diubah.'}
        </p>
      </div>

      <style>{`@keyframes apl02spin { to { transform: rotate(360deg); } }`}</style>

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
                                    title={
                                      applyToAll
                                        ? `Lepas "${file.name}" dari SEMUA ${totalSubunit} elemen`
                                        : `Lepas "${file.name}" dari elemen ini`
                                    }
                                    onDetach={() => changeBukti(subunit.id, file.id, 'detach')}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>Belum ada file bukti</div>
                            )}
                            <BuktiPicker
                              uploadedFiles={allFiles}
                              selectedFileIds={buktiIds}
                              disabled={isSaving}
                              onToggle={(fileId) => toggleBukti(subunit.id, fileId)}
                            />
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
        note={`${totalSubunit} elemen — ${
          applyToAll
            ? 'setiap perubahan bukti diterapkan ke SEMUA elemen'
            : 'atur bukti per elemen (mode per elemen)'
        }, lalu Simpan.`}
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
