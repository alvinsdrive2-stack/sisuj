import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface DocumentInfo {
  icon: LucideIcon
  label: string
  value: string
}

export type DokumenStatusState = 'approved' | 'pending' | 'not-generated'

export interface DokumenStatusItem {
  key: string
  label: string
  state: DokumenStatusState
}

interface DocumentCardProps {
  nomorKegiatan: string
  skemaSertifikasi: string
  documentInfo: DocumentInfo[]
  jenisAsesmen: string
  badges?: ReactNode[]
  actions?: ReactNode[]
  dokumenStatus?: DokumenStatusItem[]
  cardClassName?: string
  cornerElement?: ReactNode
  onClick?: () => void
}

export function DocumentCard({
  nomorKegiatan,
  skemaSertifikasi,
  documentInfo,
  jenisAsesmen,
  badges = [],
  actions = [],
  dokumenStatus,
  cardClassName = "",
  cornerElement,
  onClick
}: DocumentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 border border-slate-200 rounded-lg transition-all ${onClick ? 'cursor-pointer hover:border-primary hover:shadow-md' : ''} ${cardClassName}`}
    >
      {cornerElement && (
        <div className="absolute top-3 right-3 z-10">{cornerElement}</div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-slate-800">{nomorKegiatan}</h4>
            {badges}
          </div>
          <p className="text-lg font-medium text-primary mb-3">{skemaSertifikasi}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {documentInfo.map((info, idx) => {
              const Icon = info.icon
              return (
                <div key={idx} className="flex items-center gap-2 text-slate-600">
                  <Icon className="w-4 h-4" />
                  <span>{info.label}: {info.value}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2">Jenis Asesmen: {jenisAsesmen}</p>

          {dokumenStatus && dokumenStatus.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 mr-1">Dokumen:</span>
              {dokumenStatus.map((d) => {
                const styles =
                  d.state === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : d.state === 'pending'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                const dot =
                  d.state === 'approved'
                    ? 'bg-emerald-500'
                    : d.state === 'pending'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
                const suffix =
                  d.state === 'approved'
                    ? '✓'
                    : d.state === 'pending'
                      ? '!'
                      : '–'
                return (
                  <span
                    key={d.key}
                    title={`${d.label}: ${d.state === 'approved' ? 'Sudah TTD' : d.state === 'pending' ? 'Belum TTD' : 'Belum tersedia'}`}
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${styles}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {d.label}
                    <span className="font-bold">{suffix}</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {actions.length > 0 && (
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {actions}
        </div>
      )}
    </div>
  )
}
