interface PerPageSelectProps {
  value: number
  onChange: (perPage: number) => void
  className?: string
}

export const PER_PAGE_OPTIONS = [10, 20, 30, 50, 100]

export function PerPageSelect({ value, onChange, className = "" }: PerPageSelectProps) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="text-slate-600">Tampilkan</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 border border-slate-300 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
      >
        {PER_PAGE_OPTIONS.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  )
}
