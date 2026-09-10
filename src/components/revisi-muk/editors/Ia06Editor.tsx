/**
 * Editor Revisi MUK — FR.IA.06 (Pertanyaan Wawancara Paket Soal).
 * Backend membaca jawaban+skor via array_key_exists → SELALU kirim keduanya
 * (jawaban string, skor 0..3 atau null), meniru Ia06Page.
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  TextareaField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface SoalEsai {
  id: number
  no: string
  unit_kode: string
  kuk_kode: string
  soal: string
  jawaban?: string
  skor?: number
}
interface Ia06Response {
  message: string
  data?: {
    dokumen?: { id: number; nama_dokumen?: string } | null
    soal_list?: SoalEsai[]
    umpan_balik?: string
  }
}

const SKOR_OPTIONS = [0, 1, 2, 3]

export function Ia06Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia06Response>(asesmenUrl(idIzin, 'ia06'))

  const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [skor, setSkor] = useState<Record<number, number | null>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    const soalList = inner?.soal_list
    if (!soalList) return
    const j: Record<number, string> = {}
    const s: Record<number, number | null> = {}
    soalList.forEach((soal) => {
      if (soal.jawaban) j[soal.id] = soal.jawaban
      s[soal.id] = soal.skor ?? null
    })
    setJawaban(j)
    setSkor(s)
    setUmpanBalik(inner?.umpan_balik ?? '')
  }, [data])

  const handleSave = async () => {
    const soalList = data?.data?.soal_list ?? []
    if (soalList.length === 0) {
      toast.showWarning('Data soal belum termuat')
      return
    }
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        // dokumen_id wajib di backend — fallback 0 mirip Ia06Page
        dokumen_id: data?.data?.dokumen?.id ?? 0,
        // selalu kirim jawaban + skor (backend pakai array_key_exists)
        answers: soalList.map((s) => ({
          soal_id: s.id,
          jawaban: jawaban[s.id] || '',
          skor: skor[s.id] ?? null,
        })),
        umpan_balik: umpanBalik,
        unit_elemen_kuk: null,
      }
      await saveDoc(asesmenUrl(idIzin, 'ia06'), payload)
      toast.showSuccess('FR.IA.06 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.06')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  const soalList = data?.data?.soal_list ?? []
  if (soalList.length === 0) return <DocError message="Data FR.IA.06 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          {soalList.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className="text-sm font-medium text-slate-800 mb-1">
                {s.no}. {s.soal}
              </div>
              {(s.unit_kode || s.kuk_kode) && (
                <div className="text-xs text-slate-400 mb-2">
                  {[s.unit_kode, s.kuk_kode].filter(Boolean).join(' • ')}
                </div>
              )}
              <div className="mb-2">
                <TextareaField
                  value={jawaban[s.id] ?? ''}
                  onChange={(v) => setJawaban((prev) => ({ ...prev, [s.id]: v }))}
                  rows={2}
                  placeholder="Jawaban asesi"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Skor:</span>
                <select
                  value={skor[s.id] === null || skor[s.id] === undefined ? '' : String(skor[s.id])}
                  onChange={(e) =>
                    setSkor((prev) => ({
                      ...prev,
                      [s.id]: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  <option value="">— kosong —</option>
                  {SKOR_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-700 mb-1.5">Umpan Balik</div>
          <TextareaField
            value={umpanBalik}
            onChange={setUmpanBalik}
            rows={3}
            placeholder="Umpan balik untuk asesi"
          />
          <SaveBar isSaving={isSaving} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  )
}
