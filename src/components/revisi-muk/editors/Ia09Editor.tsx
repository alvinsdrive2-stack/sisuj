/**
 * Editor Revisi MUK — FR.IA.09 (Pertanyaan Wawancara / Observasi Tempat Kerja).
 * Meniru Ia09Page: semua pertanyaan dikirim dgn kesimpulan + is_kompeten (bool).
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  KompetenToggle,
  SaveBar,
  TextareaField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface Soal2Item {
  id: number
  no: string
  soal: string
}
interface Ia09Response {
  message: string
  data?: {
    soal?: { '2'?: Soal2Item[] }
    answers?: Record<string, { kesimpulan?: string; is_kompeten?: boolean }>
    dokumen?: { id: number }
  }
}

interface Pertanyaan {
  id: number
  no: string
  pertanyaan: string
  kesimpulan: string
  k: boolean
}

const bersihkan = (s: string) => s.replace(/&#039;/g, ' ')

export function Ia09Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia09Response>(asesmenUrl(idIzin, 'ia09'))

  const [dokumenId, setDokumenId] = useState<number | undefined>(undefined)
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    const soal2 = inner?.soal?.['2']
    if (!soal2) return
    const saved = inner?.answers || {}
    setDokumenId(inner?.dokumen?.id)
    setPertanyaanList(
      soal2.map((item) => {
        const s = saved[String(item.id)] || {}
        return {
          id: item.id,
          no: item.no || '1',
          pertanyaan: bersihkan(item.soal || '-'),
          kesimpulan: bersihkan(s.kesimpulan || ''),
          k: s.is_kompeten === true,
        }
      })
    )
  }, [data])

  const setItem = (id: number, patch: Partial<Pertanyaan>) =>
    setPertanyaanList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia09'), {
        ...(dokumenId ? { dokumen_id: dokumenId } : {}),
        answers: pertanyaanList.map((p) => ({
          soal_id: p.id,
          kesimpulan: p.kesimpulan,
          is_kompeten: p.k,
        })),
      })
      toast.showSuccess('FR.IA.09 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.09')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (pertanyaanList.length === 0)
    return <DocError message="Data FR.IA.09 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          {pertanyaanList.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className="text-sm font-medium text-slate-800 mb-2">
                {p.no}. {p.pertanyaan}
              </div>
              <div className="mb-2">
                <TextareaField
                  value={p.kesimpulan}
                  onChange={(v) => setItem(p.id, { kesimpulan: v })}
                  rows={2}
                  placeholder="Kesimpulan"
                />
              </div>
              <KompetenToggle
                value={p.k ? true : false}
                onChange={(v) => setItem(p.id, { k: v === true })}
                labels={['Kompeten', 'Belum Kompeten']}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SaveBar isSaving={isSaving} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  )
}
