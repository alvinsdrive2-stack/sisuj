import { useState } from "react"
import { useParams } from "react-router-dom"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { DokumenPraAsesmenCtx } from "@/contexts/AsesmenDataContext"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface PraAsesmenDataGateProps {
  children: React.ReactNode
}

export default function PraAsesmenDataGate({ children }: PraAsesmenDataGateProps) {
  // Retry = remount inner → hook fetch ulang dari nol (state ikut reset)
  const [retryKey, setRetryKey] = useState(0)
  return (
    <PraAsesmenDataGateInner key={retryKey} onRetry={() => setRetryKey(k => k + 1)}>
      {children}
    </PraAsesmenDataGateInner>
  )
}

function PraAsesmenDataGateInner({ children, onRetry }: PraAsesmenDataGateProps & { onRetry: () => void }) {
  const { idIzin } = useParams<{ idIzin?: string }>()

  const praData = useDataDokumenPraAsesmen(idIzin)

  if (praData.isLoading) {
    return <FullPageLoader text="Memuat data pra-asesmen..." />
  }

  // Fetch gagal → jangan render halaman dgn default tahap 0 (mematikan gating ttd secara senyap)
  if (praData.fetchFailed) {
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
    <DokumenPraAsesmenCtx.Provider value={praData}>
      {children}
    </DokumenPraAsesmenCtx.Provider>
  )
}
