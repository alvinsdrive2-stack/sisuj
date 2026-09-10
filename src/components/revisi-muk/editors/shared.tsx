/**
 * Primitif bersama untuk editor Revisi MUK.
 * ⚠️ DILARANG memanggil /qr/* atau useSigningState dari file mana pun di folder ini
 * (lihat komentar larangan di lib/revisi-muk-config.ts).
 */
import { useEffect, useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import { ErrorState } from '@/components/ui/ErrorState'
import { InlineLoader } from '@/components/ui/loading-spinner'
import { getJson, postJson } from '@/lib/revisi-muk-api'

/** Props wajib semua editor dokumen. */
export interface MukEditorProps {
  idIzin: string
  /** Dipanggil setelah simpan sukses — editor page memakainya untuk refresh panel PDF. */
  onSaved: () => void
}

/** Fetch GET dokumen (json utuh) + reload. url null = tidak fetch. */
export function useDocFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!url) {
      setIsLoading(false)
      return
    }
    let alive = true
    setIsLoading(true)
    setError(null)
    getJson<T>(url)
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : 'Gagal memuat data')
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [url, reloadKey])

  return { data, isLoading, error, reload: () => setReloadKey((k) => k + 1) }
}

/** POST simpan jawaban — throw Error dengan pesan server bila gagal. */
export function saveDoc<T = unknown>(url: string, body: unknown): Promise<T> {
  return postJson<T>(url, body)
}

export function DocError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <ErrorState
      title="Gagal memuat dokumen"
      message={message ?? 'Terjadi kesalahan saat memuat data dokumen. Periksa koneksi Anda, lalu coba lagi.'}
      onRetry={onRetry}
    />
  )
}

export function DocLoading({ text = 'Memuat dokumen...' }: { text?: string }) {
  return <InlineLoader text={text} />
}

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="text-sm font-medium text-slate-700 mb-1.5">{label}</div>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'

export function TextField({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function TextareaField({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
}) {
  return (
    <textarea
      className={inputCls + ' resize-y'}
      rows={rows}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/** Pasangan checkbox Kompeten / Belum Kompeten — klik ulang nilai sama = kosongkan (null), mirip halaman asesi. */
export function KompetenToggle({
  value,
  onChange,
  labels = ['Kompeten', 'Belum Kompeten'],
}: {
  value: boolean | null
  onChange: (v: boolean | null) => void
  labels?: [string, string]
}) {
  return (
    <div className="flex items-center gap-5">
      <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary"
          checked={value === true}
          onChange={() => onChange(value === true ? null : true)}
        />
        {labels[0]}
      </label>
      <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary"
          checked={value === false}
          onChange={() => onChange(value === false ? null : false)}
        />
        {labels[1]}
      </label>
    </div>
  )
}

/** Grup radio generik (mis. pilihan A–D). */
export function RadioChoice<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <label key={opt.value} className="inline-flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="radio"
            name={name}
            className="w-4 h-4 mt-0.5 accent-primary shrink-0"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

export function SaveBar({
  isSaving,
  onSave,
  note,
}: {
  isSaving: boolean
  onSave: () => void
  note?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
      {note && <p className="text-xs text-slate-400 mr-auto">{note}</p>}
      <ActionButton variant="primary" loading={isSaving} onClick={onSave}>
        Simpan
      </ActionButton>
    </div>
  )
}
