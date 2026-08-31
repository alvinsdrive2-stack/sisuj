import type { RealtimeStatus } from "@/hooks/useRealtimeSync"

const LABEL: Record<RealtimeStatus, string> = {
  online: 'Live',
  connecting: 'Menyambungkan…',
  offline: 'Koneksi terputus',
}

const DOT: Record<RealtimeStatus, string> = {
  online: 'bg-emerald-500',
  connecting: 'bg-amber-400',
  offline: 'bg-red-500',
}

/**
 * Indikator koneksi realtime. Terima `status` dari useRealtimeSync di parent
 * (satu channel = satu subscription — jangan subscribe dua kali).
 * status 'online' → tidak render (diam kalau semuanya baik-baik saja).
 */
export function RealtimeStatusBanner({ status, className = '' }: { status: RealtimeStatus; className?: string }) {
  if (status === 'online') return null

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        status === 'offline'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      } ${className}`}
      role="status"
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full ${DOT[status]} opacity-60 animate-ping`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${DOT[status]}`} />
      </span>
      {LABEL[status]}
    </div>
  )
}
