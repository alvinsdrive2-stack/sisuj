/**
 * Editor Revisi MUK — FR.AK.04 (Formulir Banding / Keberatan).
 * Jawaban hanya true atau null (mirip mapping Ak04Page: jawaban === true ? true : null).
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  TextareaField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface Referensi {
  id: number
  nama: string
  jawaban: boolean
}
interface Kelompok {
  id: number
  nama: string | null
  urut: number
  referensis: Referensi[]
}
interface Ak04Response {
  message: string
  data?:
    | {
        kelompoks: Kelompok[]
        alasan: string
      }
    | { data: { kelompoks: Kelompok[]; alasan: string } }
}

export function Ak04Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak04Response>(praUrl(idIzin, 'ak04'))

  const [kelompoks, setKelompoks] = useState<Kelompok[]>([])
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({})
  const [alasan, setAlasan] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // dukung struktur flat maupun nested data.data (mirip FrAk04Page)
    const raw = data?.data
    const inner =
      raw && 'data' in raw && raw.data && 'kelompoks' in raw.data ? raw.data : raw
    if (!inner || !('kelompoks' in inner) || !inner.kelompoks) return
    setKelompoks(inner.kelompoks)
    const init: Record<number, boolean | null> = {}
    inner.kelompoks.forEach((k) => {
      k.referensis.forEach((ref) => {
        init[ref.id] = ref.jawaban === true
      })
    })
    setAnswers(init)
    setAlasan(inner.alasan ?? '')
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const kelompokId = kelompoks[0]?.id || 1
      await saveDoc(praUrl(idIzin, 'ak04'), {
        answers: Object.entries(answers).map(([referensiId, jawaban]) => ({
          referensi_id: Number(referensiId),
          kelompok_id: kelompokId,
          jawaban: jawaban === true ? true : null,
        })),
        alasan,
      })
      toast.showSuccess('FR.AK.04 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.04')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompoks.length === 0) return <DocError message="Data FR.AK.04 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      {kelompoks.map((kelompok) => (
        <Card key={kelompok.id}>
          <CardContent className="p-4">
            {kelompok.nama && (
              <h3 className="text-sm font-bold text-slate-800 mb-3">{kelompok.nama}</h3>
            )}
            <div className="space-y-2">
              {kelompok.referensis.map((ref) => (
                <label
                  key={ref.id}
                  className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100/60 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                    checked={answers[ref.id] === true}
                    onChange={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [ref.id]: prev[ref.id] === true ? null : true,
                      }))
                    }
                  />
                  <span>{ref.nama}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-700 mb-1.5">
            Alasan Banding / Keberatan
          </div>
          <TextareaField
            value={alasan}
            onChange={setAlasan}
            rows={4}
            placeholder="Uraian alasan asesi mengajukan banding"
          />
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note="Centang hanya item yang dibandingkan; klik ulang untuk mengosongkan."
          />
        </CardContent>
      </Card>
    </div>
  )
}
