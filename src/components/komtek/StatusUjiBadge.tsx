import { Badge } from "@/components/ui/badge"
import type { StatusUji } from "@/lib/kegiatan-service"

/**
 * Penanda hasil uji dari absen akhir asesmen (asesi + asesor1 + asesor2).
 * Hover menampilkan rincian: berapa asesi yang absen + status absen tiap asesor.
 */
export function StatusUjiBadge({ status }: { status?: StatusUji | null }) {
  if (!status) {
    return <Badge className="bg-slate-100 text-slate-700">Status uji tidak tersedia</Badge>
  }

  const judul = [
    `Asesi absen: ${status.asesi_absen}/${status.asesi_total}`,
    `Asesor 1: ${status.asesor1_absen ? "sudah absen" : "belum absen"}`,
    status.punya_asesor2
      ? `Asesor 2: ${status.asesor2_absen ? "sudah absen" : "belum absen"}`
      : "Asesor 2: tidak ada",
  ].join("\n")

  return (
    <span title={judul}>
      {status.sudah_uji ? (
        <Badge className="bg-emerald-100 text-emerald-700">Uji sudah dilaksanakan</Badge>
      ) : (
        <Badge className="bg-rose-100 text-rose-700">Uji belum dilaksanakan</Badge>
      )}
    </span>
  )
}
