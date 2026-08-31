import { ReactNode } from "react"
import { useParams } from "react-router-dom"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { FullPageLoader } from "@/components/ui/loading-spinner"

// Runtime gate: jadwal paket soal (is_paket) render halaman KAN,
// selain itu halaman regular. Env VITE_SAAT_INI=KAN tetap memaksa KAN
// (paritas dengan perilaku build-time lama).
export default function KanPaketRoute({ kan, regular }: { kan: ReactNode; regular: ReactNode }) {
  const { id } = useParams<{ id?: string }>()
  const { isPaket, isLoading } = useDataDokumenAsesmen(id)

  if (import.meta.env.VITE_SAAT_INI === 'KAN') return <>{kan}</>
  if (isLoading) return <FullPageLoader text="Memuat..." />
  return <>{isPaket ? kan : regular}</>
}
