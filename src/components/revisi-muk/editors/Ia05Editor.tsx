/**
 * Editor Revisi MUK — FR.IA.05 (Pertanyaan Lisan Tertulis Pilihan Ganda).
 * Meniru payload Ia05Page: hanya soal yang terjawab dikirim, umpan_balik opsional.
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  RadioChoice,
  SaveBar,
  TextareaField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface Soal {
  id: number
  no: number
  soal: string
  jawab_a?: string | null
  jawab_b?: string | null
  jawab_c?: string | null
  jawab_d?: string | null
  file_a?: string | null
  file_b?: string | null
  file_c?: string | null
  file_d?: string | null
  kunci_jawaban?: string | null
  jawaban_asesi: string | null
  unit?: string | null
  kuk?: string | null
}
interface Ia05Response {
  message: string
  data?: {
    dokumen: { id: number; nama_dokumen: string }
    soal: Soal[]
    umpan_balik?: string
  }
}

type Pilihan = 'A' | 'B' | 'C' | 'D'
const PILIHAN: Pilihan[] = ['A', 'B', 'C', 'D']

export function Ia05Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia05Response>(asesmenUrl(idIzin, 'ia05'))

  const [jawaban, setJawaban] = useState<Record<number, Pilihan>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.soal) return
    const init: Record<number, Pilihan> = {}
    inner.soal.forEach((s) => {
      const j = (s.jawaban_asesi ?? '').toUpperCase()
      if ((PILIHAN as string[]).includes(j)) init[s.id] = j as Pilihan
    })
    setJawaban(init)
    setUmpanBalik(inner.umpan_balik ?? '')
  }, [data])

  const handleSave = async () => {
    const inner = data?.data
    if (!inner?.dokumen?.id) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      const answers = inner.soal
        .filter((s) => jawaban[s.id])
        .map((s) => ({ soal_id: s.id, jawaban: jawaban[s.id] }))
      await saveDoc(asesmenUrl(idIzin, 'ia05'), {
        id_izin: idIzin,
        dokumen_id: inner.dokumen.id,
        answers,
        umpan_balik: umpanBalik || undefined,
      })
      toast.showSuccess('FR.IA.05 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.05')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  const soalList = data?.data?.soal ?? []
  if (soalList.length === 0) return <DocError message="Data FR.IA.05 tidak ditemukan." onRetry={reload} />

  const answeredCount = soalList.filter((s) => jawaban[s.id]).length

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          {soalList.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="text-sm font-medium text-slate-800 mb-1">
                {s.no}. {s.soal}
              </div>
              {(s.unit || s.kuk) && (
                <div className="text-xs text-slate-400 mb-2">
                  {[s.unit, s.kuk].filter(Boolean).join(' • ')}
                </div>
              )}
              <RadioChoice<Pilihan>
                name={`ia05-${s.id}`}
                value={jawaban[s.id] ?? null}
                onChange={(v) => setJawaban((prev) => ({ ...prev, [s.id]: v }))}
                options={PILIHAN.map((k) => ({
                  value: k,
                  label: `${k}. ${s[`jawab_${k.toLowerCase()}` as 'jawab_a' | 'jawab_b' | 'jawab_c' | 'jawab_d'] ?? '-'}`,
                }))}
              />
              {s.kunci_jawaban && (
                <div className="text-xs text-emerald-600 font-semibold mt-2">
                  Kunci jawaban: {s.kunci_jawaban.toUpperCase()}
                </div>
              )}
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
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note={`${answeredCount} dari ${soalList.length} soal terjawab — soal tanpa jawaban tidak diubah.`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
