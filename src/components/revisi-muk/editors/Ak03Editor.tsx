/**
 * Editor Revisi MUK — FR.AK.03 (Umpan Balik dan Catatan Asesmen).
 * Meniru payload Ak03Page: semua soal dikirim (is_kompeten boleh null) + catatan umum.
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

interface SoalAPI {
  id: number
  no: number
  jenis?: string
  soal: string
  is_kompeten: boolean | null
  catatan?: string | null
}
interface Ak03Response {
  message: string
  data?: {
    soal: SoalAPI[]
    catatan?: string | null
  }
}

interface Item {
  id: number
  pertanyaan: string
  nilai: boolean | null
  catatan: string
}

export function Ak03Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak03Response>(asesmenUrl(idIzin, 'ak03'))

  const [items, setItems] = useState<Item[]>([])
  const [catatanUmum, setCatatanUmum] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.soal) return
    setItems(
      inner.soal.map((s) => ({
        id: s.id,
        pertanyaan: s.soal,
        nilai: s.is_kompeten ?? null,
        catatan: s.catatan ?? '',
      }))
    )
    setCatatanUmum(inner.catatan ?? '')
  }, [data])

  const setItem = (id: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak03'), {
        answers: items.map((it) => ({
          soal_id: it.id,
          is_kompeten: it.nilai,
          catatan: it.catatan,
        })),
        catatan: catatanUmum,
      })
      toast.showSuccess('FR.AK.03 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.03')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (items.length === 0) return <DocError message="Data FR.AK.03 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          {items.map((it, idx) => (
            <div key={it.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="text-sm font-medium text-slate-800 mb-2">
                {idx + 1}. {it.pertanyaan}
              </div>
              <KompetenToggle
                value={it.nilai}
                onChange={(v) => setItem(it.id, { nilai: v })}
              />
              <div className="mt-2">
                <TextareaField
                  value={it.catatan}
                  onChange={(v) => setItem(it.id, { catatan: v })}
                  rows={2}
                  placeholder="Catatan (opsional)"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-700 mb-1.5">Catatan Umum</div>
          <TextareaField
            value={catatanUmum}
            onChange={setCatatanUmum}
            rows={3}
            placeholder="Catatan umum asesmen"
          />
          <SaveBar isSaving={isSaving} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  )
}
