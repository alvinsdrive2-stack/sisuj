import { FileEdit, RefreshCw, LayoutList } from "lucide-react"

export type JadwalStatusFilterValue = 'all' | 'draft' | 'synced'

interface JadwalStatusFilterProps {
  value: JadwalStatusFilterValue
  onChange: (value: JadwalStatusFilterValue) => void
}

const OPTIONS: Array<{ value: JadwalStatusFilterValue; label: string; icon: typeof LayoutList }> = [
  { value: 'all', label: "Semua", icon: LayoutList },
  { value: 'draft', label: "Draft", icon: FileEdit },
  { value: 'synced', label: "Sudah Sync", icon: RefreshCw },
]

export function JadwalStatusFilter({ value, onChange }: JadwalStatusFilterProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {OPTIONS.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === optionValue
              ? 'bg-primary text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}
