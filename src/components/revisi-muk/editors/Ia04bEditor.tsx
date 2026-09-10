/**
 * Editor Revisi MUK — FR.IA.04.B (Observasi / Demonstrasi).
 * v1 hanya merevisi jawaban teks asesi (endpoint POST /ia04b) — skor/nilai asesor
 * (endpoint nilai-ia04b) di luar scope. Backend otomatis memilih kelompok a/b/c.
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

interface Soal {
  id: number
  no: string
  jenis: string
  soal: string
  soal1: string
  soal2: string
  is_komentar: string | null
  jawaban?: string
  pencapaian?: boolean | number
}
interface Ia04bResponse {
  message: string
  data?: {
    dokumen: { id: number; nama_dokumen: string }
    soal: Soal[]
    rekomendasi?: { id: number; rekomendasi?: boolean }
  }
}

export function Ia04bEditor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia04bResponse>(asesmenUrl(idIzin, 'ia04b'))

  const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const soal = data?.data?.soal
    if (!soal) return
    const init: Record<number, string> = {}
    soal.forEach((s) => {
      if (s.jawaban) init[s.id] = s.jawaban
    })
    setJawaban(init)
  }, [data])

  const handleSave = async () => {
    const inner = data?.data
    if (!inner?.dokumen?.id) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia04b'), {
        dokumen_id: inner.dokumen.id,
        answers: inner.soal.map((s) => ({
          soal_id: s.id,
          jawaban: jawaban[s.id] || s.jawaban || '',
        })),
      })
      toast.showSuccess('FR.IA.04.B berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.04.B')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  const soalList = data?.data?.soal ?? []
  if (soalList.length === 0) return <DocError message="Data FR.IA.04.B tidak ditemukan." onRetry={reload} />

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
                {s.no ? `${s.no}. ` : ''}
                {[s.soal1, s.soal2].filter(Boolean).join(' — ') || s.soal}
              </div>
              <TextareaField
                value={jawaban[s.id] ?? ''}
                onChange={(v) => setJawaban((prev) => ({ ...prev, [s.id]: v }))}
                rows={2}
                placeholder="Jawaban asesi"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note={`${soalList.length} soal — skor penilaian asesor tidak diubah lewat revisi ini.`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
