import { useState, useEffect, useCallback } from "react"
import { X, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { extractErrorMessage, extractApiError } from "@/lib/error-utils"
import { useAuth } from "@/contexts/auth-context"
import { RoleId } from "@/lib/rbac-config"
import { API_BASE_URL } from "@/config/api"

// Status TTD Surat Perjanjian Bebas Konflik Kepentingan (backend: perjanjianAsesorStatus)
export interface PerjanjianAsesorStatus {
  jumlah_asesor: number
  nama_asesor1: string
  nama_asesor2: string | null
  id_user_asesor1: number | null
  id_user_asesor2: number | null
  ttd_asesor1: boolean
  ttd_asesor2: boolean | null
  all_signed: boolean
  url_pdf: string
}

/**
 * Floating modal status TTD Surat Perjanjian Bebas Konflik Kepentingan asesor.
 * Muncul di setiap step praasesmen selama belum all_signed.
 * zIndex 10000 → DI ATAS modal foto absen masuk (WebcamModal zIndex 9999).
 */
export function PerjanjianAsesorModal({ idIzin }: { idIzin?: string }) {
  const { user } = useAuth()
  const [status, setStatus] = useState<PerjanjianAsesorStatus | null>(null)
  const [show, setShow] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  const refresh = useCallback(async () => {
    if (!idIzin) return
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/perjanjian-asesor`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) return
      const result = await res.json()
      if (result?.data) {
        setStatus(result.data)
        if (!result.data.all_signed) setShow(true)
      }
    } catch {
      // Gagal fetch bukan alasan nge-block alur absen — diamkan.
    }
  }, [idIzin])

  useEffect(() => { refresh() }, [refresh])

  if (!show || !status || status.all_signed) return null

  // Slot TTD viewer ini: 1/2 kalau dia asesor jadwal ini yang belum TTD.
  const mySlot = (() => {
    if (user?.role?.id !== RoleId.ASESOR) return null
    if (status.id_user_asesor1 === user.id && !status.ttd_asesor1) return 1
    if (status.id_user_asesor2 && status.id_user_asesor2 === user.id && !status.ttd_asesor2) return 2
    return null
  })()

  const handleTtd = async () => {
    if (!idIzin) return
    setIsSigning(true)
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/perjanjian-asesor/ttd`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const apiMsg = await extractApiError(res, "Gagal menandatangani surat")
        throw new Error(apiMsg)
      }
      toast("Surat perjanjian bebas konflik kepentingan berhasil ditandatangani", "success")
      // Hide dulu biar gak numpuk, refresh status di belakang.
      setShow(false)
      await refresh()
    } catch (error) {
      toast(extractErrorMessage(error, "Gagal menandatangani surat"), "error")
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', background: '#fffbeb', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', margin: 0 }}>Surat Perjanjian Bebas Konflik Kepentingan</h3>
          </div>
          <button
            onClick={() => setShow(false)}
            style={{ padding: '4px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', borderRadius: '4px' }}
            aria-label="Tutup"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Body: surat langsung tampil di modal */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <iframe
            src={`${status.url_pdf}#view=FitH`}
            title="Surat Perjanjian Bebas Konflik Kepentingan"
            style={{ border: 'none', width: '100%', flex: 1, minHeight: '60vh', background: '#f5f5f5' }}
          />
        </div>

        {/* Footer: tombol TTD kanan bawah */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
          {mySlot ? (
            <button
              onClick={handleTtd}
              disabled={isSigning}
              style={{ padding: '8px 14px', fontSize: '13px', border: 'none', background: isSigning ? '#93c5fd' : '#0066cc', color: '#fff', cursor: isSigning ? 'not-allowed' : 'pointer', borderRadius: '4px', fontWeight: 600 }}
            >
              {isSigning ? 'Memproses...' : 'Tandatangani Sekarang'}
            </button>
          ) : (
            <button
              onClick={() => setShow(false)}
              style={{ padding: '8px 14px', fontSize: '13px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 600 }}
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
