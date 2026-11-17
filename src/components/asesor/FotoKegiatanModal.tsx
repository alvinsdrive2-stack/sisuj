import { useEffect, useRef, useState } from "react"
import { Camera, Upload, X, Image as ImageIcon, ExternalLink, AlertCircle } from "lucide-react"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import { API_BASE_URL } from "@/config/api"
import { apiFetch } from "@/lib/api-fetch"

interface FotoKegiatanModalProps {
  isOpen: boolean
  idIzin: string
  nama: string
  existingUrl?: string | null
  onClose: () => void
  onSuccess: () => void
}

export function FotoKegiatanModal({
  isOpen,
  idIzin,
  nama,
  existingUrl,
  onClose,
  onSuccess,
}: FotoKegiatanModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setPreview(null)
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [isOpen, idIzin])

  if (!isOpen) return null

  const isPdf = existingUrl?.toLowerCase().endsWith('.pdf')

  const handlePick = (picked: File) => {
    setFile(picked)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(picked)
  }

  const handleSubmit = async () => {
    if (!file) {
      toast("Pilih foto terlebih dahulu", "error")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await apiFetch(`${API_BASE_URL}/bukti/${idIzin}/foto-kegiatan`, {
        method: 'POST',
        body: formData,
      })

      if (res.redirected) {
        toast("Upload gagal: file ditolak server (kemungkinan terlalu besar)", "error")
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Gagal upload foto kegiatan' }))
        throw new Error(err.message || 'Gagal upload foto kegiatan')
      }

      toast('Foto kegiatan berhasil disimpan!', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal mengupload foto kegiatan', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon style={{ width: '20px', height: '20px', color: '#059669' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Foto Kegiatan</h3>
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

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            background: '#f9fafb',
            minHeight: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {preview ? (
              <img src={preview} alt="Preview foto kegiatan" style={{ width: '100%', maxHeight: '340px', objectFit: 'contain' }} />
            ) : existingUrl ? (
              isPdf ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>File foto kegiatan tersimpan sebagai PDF</p>
                  <a
                    href={existingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', background: '#3b82f6', color: '#fff',
                      borderRadius: '6px', fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                    }}
                  >
                    <ExternalLink style={{ width: '12px', height: '12px' }} />
                    Buka File
                  </a>
                </div>
              ) : (
                <img src={existingUrl} alt="Foto kegiatan" style={{ width: '100%', maxHeight: '340px', objectFit: 'contain' }} />
              )
            ) : (
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', width: '100%', height: '240px',
                  cursor: 'pointer', color: '#6b7280', fontSize: '13px', fontWeight: '500',
                }}
              >
                <Camera style={{ width: '36px', height: '36px', color: '#9ca3af' }} />
                Belum ada foto kegiatan
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const picked = e.target.files?.[0]
                    if (picked) handlePick(picked)
                  }}
                />
              </label>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : existingUrl ? 'Foto sudah tersimpan' : 'Belum dipilih'}
            </span>
            <label
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: '#fff', color: '#374151', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Upload style={{ width: '14px', height: '14px' }} />
              {existingUrl || preview ? 'Ganti Foto' : 'Pilih Foto'}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const picked = e.target.files?.[0]
                  if (picked) handlePick(picked)
                }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', padding: '10px 12px', background: '#fef3c7', borderRadius: '8px' }}>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: '#92400e', margin: 0 }}>
              Maksimal 10MB per foto (JPG/PNG/WebP).
            </p>
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
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
            disabled={uploading || !file}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: '#059669',
              color: '#fff', fontSize: '13px', fontWeight: '600',
              cursor: uploading || !file ? 'not-allowed' : 'pointer',
              opacity: uploading || !file ? 0.6 : 1,
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
                Simpan Foto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
