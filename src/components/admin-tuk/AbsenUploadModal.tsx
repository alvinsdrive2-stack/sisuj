import { useEffect, useRef, useState } from "react"
import { Camera, Upload, X, CheckCircle2, AlertCircle } from "lucide-react"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import { API_BASE_URL } from "@/config/api"
import { apiFetch } from "@/lib/api-fetch"

interface AbsenUploadModalProps {
  isOpen: boolean
  idIzin: string
  nama: string
  existing?: Record<string, string | null> | null
  onClose: () => void
  onSuccess: () => void
}

const ABSEN_FIELDS = [
  { key: 'absen_asesi_pra', label: 'Absen Asesi — Pra Asesmen' },
  { key: 'absen_asesi_asesmen', label: 'Absen Asesi — Asesmen' },
  { key: 'absen_asesor1_pra', label: 'Absen Asesor 1 — Pra Asesmen' },
  { key: 'absen_asesor1_asesmen', label: 'Absen Asesor 1 — Asesmen' },
  { key: 'absen_asesor2_pra', label: 'Absen Asesor 2 — Pra Asesmen' },
  { key: 'absen_asesor2_asesmen', label: 'Absen Asesor 2 — Asesmen' },
] as const

const FIELD_URLS: Record<string, string[]> = {
  absen_asesi_pra: ['url_absen_asesi_pra_awal', 'url_absen_asesi_pra_akhir'],
  absen_asesi_asesmen: ['url_absen_asesi_awal', 'url_absen_asesi_akhir'],
  absen_asesor1_pra: ['url_absen_asesor1_pra_awal', 'url_absen_asesor1_pra_akhir'],
  absen_asesor1_asesmen: ['url_absen_asesor1_awal', 'url_absen_asesor1_akhir'],
  absen_asesor2_pra: ['url_absen_asesor2_pra_awal', 'url_absen_asesor2_pra_akhir'],
  absen_asesor2_asesmen: ['url_absen_asesor2_awal', 'url_absen_asesor2_akhir'],
}

export function AbsenUploadModal({ isOpen, idIzin, nama, existing, onClose, onSuccess }: AbsenUploadModalProps) {
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (isOpen) {
      setFiles({})
      setPreviews({})
      setDragKey(null)
    }
  }, [isOpen, idIzin])

  if (!isOpen) return null

  const isFilled = (key: string) =>
    existing ? (FIELD_URLS[key] || []).some(u => !!existing[u]) : false

  const filledCount = ABSEN_FIELDS.filter(f => files[f.key]).length

  const handlePick = (key: string, file: File) => {
    setFiles(prev => ({ ...prev, [key]: file }))
    const reader = new FileReader()
    reader.onload = () => setPreviews(prev => ({ ...prev, [key]: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    setDragKey(null)
    const file = e.dataTransfer.files?.[0]
    if (file) handlePick(key, file)
  }

  const clearPick = (key: string) => {
    setFiles(prev => ({ ...prev, [key]: null }))
    setPreviews(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (inputRefs.current[key]) inputRefs.current[key]!.value = ''
  }

  const handleSubmit = async () => {
    const filled = ABSEN_FIELDS.filter(f => files[f.key])
    if (filled.length === 0) {
      toast("Pilih minimal satu foto absen", "error")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      for (const f of filled) formData.append(f.key, files[f.key]!)
      const res = await apiFetch(`${API_BASE_URL}/absen-upload/${idIzin}`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Gagal upload absen' }))
        throw new Error(err.message || 'Gagal upload absen')
      }
      toast('Foto absen berhasil disimpan!', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal mengupload absen', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      onDragOver={e => e.preventDefault()}
      onDrop={e => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Upload Foto Absen</h3>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{nama} • {idIzin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#6b7280' }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {ABSEN_FIELDS.map(f => {
              const filled = isFilled(f.key)
              const preview = previews[f.key]
              return (
                <div key={f.key} style={{
                  border: `1px solid ${filled ? '#d1fae5' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '12px',
                  background: filled ? '#f0fdf4' : '#f9fafb',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{f.label}</span>
                    {filled && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '600', color: '#059669', whiteSpace: 'nowrap' }}>
                        <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Sudah
                      </span>
                    )}
                  </div>

                  {preview ? (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={preview} alt={f.label} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => clearPick(f.key)}
                        style={{
                          position: 'absolute', top: '6px', right: '6px',
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                      <div style={{ fontSize: '10px', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', position: 'absolute', bottom: '6px', left: '6px', borderRadius: '4px', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {files[f.key]?.name}
                      </div>
                    </div>
                  ) : (
                    <label
                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
                      onDragEnter={e => { e.preventDefault(); setDragKey(f.key) }}
                      onDragLeave={e => { if (e.currentTarget === e.target) setDragKey(null) }}
                      onDrop={e => handleDrop(e, f.key)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        height: '100px', borderRadius: '8px',
                        border: '2px dashed', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '500',
                        flexDirection: 'column',
                        transition: 'all 0.15s ease',
                        ...(dragKey === f.key
                          ? { borderColor: '#4f46e5', background: '#eef2ff', color: '#4f46e5' }
                          : { borderColor: '#d1d5db', background: '#fff', color: '#6b7280' }),
                      }}
                    >
                      <Upload style={{ width: '18px', height: '18px' }} />
                      {dragKey === f.key ? 'Lepaskan di sini' : (filled ? 'Ganti Foto' : 'Drag & Drop / Klik')}
                      <input
                        ref={el => { inputRefs.current[f.key] = el }}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handlePick(f.key, file)
                        }}
                      />
                    </label>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', padding: '10px 12px', background: '#fef3c7', borderRadius: '8px' }}>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: '#92400e', margin: 0 }}>
              Drag & drop atau klik untuk pilih. Maksimal 10MB per foto (JPG/PNG/WebP). Satu foto dipakai untuk absen awal & akhir sekaligus.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{filledCount}/6 foto dipilih</span>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db',
              background: '#fff', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || filledCount === 0}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: '#4f46e5',
              color: '#fff', fontSize: '13px', fontWeight: '600', cursor: uploading || filledCount === 0 ? 'not-allowed' : 'pointer',
              opacity: uploading || filledCount === 0 ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {uploading ? (
              <>
                <SimpleSpinner size="sm" className="text-white" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload style={{ width: '14px', height: '14px' }} />
                Simpan Absen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
