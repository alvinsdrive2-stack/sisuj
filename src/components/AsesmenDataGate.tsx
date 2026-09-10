import { useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { RoleId } from "@/lib/rbac-config"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { DokumenAsesmenCtx, DokumenPraAsesmenCtx } from "@/contexts/AsesmenDataContext"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface AsesmenDataGateProps {
  children: React.ReactNode
}

export default function AsesmenDataGate({ children }: AsesmenDataGateProps) {
  // Retry = remount inner → hook fetch ulang dari nol (state ikut reset)
  const [retryKey, setRetryKey] = useState(0)
  return (
    <AsesmenDataGateInner key={retryKey} onRetry={() => setRetryKey(k => k + 1)}>
      {children}
    </AsesmenDataGateInner>
  )
}

function AsesmenDataGateInner({ children, onRetry }: AsesmenDataGateProps & { onRetry: () => void }) {
  const { id } = useParams<{ id?: string }>()
  const { user } = useAuth()

  const asesmenData = useDataDokumenAsesmen(id)
  const praData = useDataDokumenPraAsesmen(id)
  const { role: asesorRole } = useAsesorRole(id)

  const isAsesor = user?.role?.id === RoleId.ASESOR
  const roleResolved = !isAsesor || asesorRole !== "none"

  if (asesmenData.isLoading || praData.isLoading || !roleResolved) {
    return <FullPageLoader text="Memuat data asesmen..." />
  }

  // Fetch gagal → jangan render halaman dgn default tahap 0 (mematikan gating ttd secara senyap)
  if (asesmenData.fetchFailed || praData.fetchFailed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px' }}>
        <p style={{ color: '#b91c1c', textAlign: 'center', margin: 0 }}>
          Gagal memuat data. Periksa koneksi Anda, lalu coba lagi.
        </p>
        <button
          onClick={onRetry}
          style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <DokumenAsesmenCtx.Provider value={asesmenData}>
      <DokumenPraAsesmenCtx.Provider value={praData}>
        {children}
      </DokumenPraAsesmenCtx.Provider>
    </DokumenAsesmenCtx.Provider>
  )
}
