import { useEffect, useState } from "react"
import { Camera, Upload, X, Image as ImageIcon, ExternalLink, AlertCircle, UserCheck } from "lucide-react"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import { API_BASE_URL } from "@/config/api"
import { apiFetch } from "@/lib/api-fetch"

type AbsenPhase = 'praasesmen' | 'asesmen'

interface AbsenSlot {
  label: string
  url: string | null
}

interface FotoKegiatanModalProps {
  isOpen: boolean
  idIzin: string
  nama: string
  existingUrl?: string | null
  phase: AbsenPhase
  absenAwalUrl: string | null
  absenAkhirUrl: string | null
  onClose: () => void
  onSuccess: () => void
}

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,.pdf"

export function FotoKegiatanModal({
  isOpen,
  idIzin,
  nama,
  existingUrl,
  phase,
  absenAwalUrl,
  absenAkhirUrl,
  onClose,
  onSuccess,
}: FotoKegiatanModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setPreview(null)
      setUploading(false)
      setUploadingSlot(null)
    }
  }, [isOpen, idIzin])

  if (!isOpen) return null

  const phaseLabel = phase === 'asesmen' ? 'Asesmen' : 'Pra-Asesmen'

  const slots: AbsenSlot[] = [
    { label: `Absen Masuk — ${phaseLabel}`, url: absenAwalUrl },
    { label: `Absen Selesai — ${phaseLabel}`, url: absenAkhirUrl },
  ]

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

  const handleAbsenUpload = async (kind: 'awal' | 'akhir', picked: File) => {
    setUploadingSlot(kind)
    try {
      const formData = new FormData()
      formData.append('image', picked, `absen-${kind}.jpg`)

      const res = await apiFetch(`${API_BASE_URL}/${phase}/${idIzin}/absen-${kind}`, {
        method: 'POST',
        body: formData,
      })

      if (res.redirected) {
        toast("Upload gagal: file ditolak server (kemungkinan terlalu besar)", "error")
        return
      }

      const result = await res.json().catch(() => ({ message: 'Gagal menyimpan foto absen' }))

      if (!res.ok) {
        throw new Error(result.message || 'Gagal menyimpan foto absen')
      }

      toast(`Foto ${kind === 'awal' ? 'absen masuk' : 'absen selesai'} berhasil disimpan!`, 'success')
      onSuccess()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal mengupload foto absen', 'error')
    } finally {
      setUploadingSlot(null)
    }
  }

  const renderPreview = (url: string, alt: string, height = 'max-h-[300px]') => {
    if (url.toLowerCase().endsWith('.pdf')) {
      return (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>File tersimpan sebagai PDF</p>
          <a
            href={url}
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
      )
    }

    return (
      <img
        src={url}
        alt={alt}
        style={{ width: '100%', objectFit: 'contain' }}
        className={height}
      />
    )
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
          maxWidth: '640px',
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
          {/* Foto kegiatan asesi */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            background: '#f9fafb',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {preview ? (
              <img src={preview} alt="Preview foto kegiatan" style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }} />
            ) : existingUrl ? (
              renderPreview(existingUrl, 'Foto kegiatan', 'max-h-[320px]')
            ) : (
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', width: '100%', height: '200px',
                  cursor: 'pointer', color: '#6b7280', fontSize: '13px', fontWeight: '500',
                }}
              >
                <Camera style={{ width: '36px', height: '36px', color: '#9ca3af' }} />
                Belum ada foto kegiatan
                <input
                  type="file"
                  accept={ACCEPT}
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
                accept={ACCEPT}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const picked = e.target.files?.[0]
                  if (picked) handlePick(picked)
                }}
              />
            </label>
          </div>

          {/* Absen asesor sendiri */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <UserCheck style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Absen Saya (Asesor)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {slots.map((slot, index) => {
                const kind = index === 0 ? 'awal' : 'akhir'
                const isUploading = uploadingSlot === kind
                return (
                  <div
                    key={slot.label}
                    style={{
                      border: `1px solid ${slot.url ? '#d1fae5' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      padding: '12px',
                      background: slot.url ? '#f0fdf4' : '#f9fafb',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{slot.label}</span>
                    </div>

                    <div style={{
                      height: '140px', borderRadius: '8px', overflow: 'hidden',
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {slot.url ? (
                        renderPreview(slot.url, slot.label, 'max-h-[140px]')
                      ) : (
                        <Camera style={{ width: '28px', height: '28px', color: '#d1d5db' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        {slot.url ? 'Sudah diupload' : 'Belum ada foto'}
                      </span>
                      <label
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', borderRadius: '8px',
                          border: '1px solid #d1d5db', background: '#fff',
                          color: '#374151', fontSize: '12px', fontWeight: '600',
                          cursor: isUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        {isUploading ? (
                          <>
                            <SimpleSpinner size="sm" className="text-slate-600" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload style={{ width: '12px', height: '12px' }} />
                            {slot.url ? 'Ganti' : 'Upload'}
                          </>
                        )}
                        <input
                          type="file"
                          accept={ACCEPT}
                          style={{ display: 'none' }}
                          disabled={isUploading || !!uploadingSlot}
                          onChange={(e) => {
                            const picked = e.target.files?.[0]
                            if (picked) handleAbsenUpload(kind, picked)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px', padding: '10px 12px', background: '#fef3c7', borderRadius: '8px' }}>
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
            Tutup
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
                Simpan Foto Kegiatan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
