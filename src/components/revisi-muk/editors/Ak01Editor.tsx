/**
 * Editor Revisi MUK — FR.AK.01 (Pernyataan Persetujuan Asesmen).
 * Barcodes diabaikan sepenuhnya — hanya jawaban bukti + waktu yang direvisi.
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  FieldRow,
  SaveBar,
  TextField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface BuktiAsesmen {
  id: number
  nama: string
  jawaban?: boolean
}
interface Ak01Response {
  message: string
  data?: {
    items?: BuktiAsesmen[]
    waktu?: string
  }
}

export function Ak01Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak01Response>(praUrl(idIzin, 'ak01'))

  const [items, setItems] = useState<BuktiAsesmen[]>([])
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [waktu, setWaktu] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.items) return
    setItems(inner.items)
    const init: Record<number, boolean> = {}
    inner.items.forEach((it) => {
      init[it.id] = it.jawaban === true
    })
    setChecked(init)
    setWaktu(inner.waktu ?? '')
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(praUrl(idIzin, 'ak01'), {
        answers: items.map((it) => ({
          id_referensi: it.id,
          jawaban: checked[it.id] ?? false,
        })),
        waktu: waktu || '00:00 - Selesai',
      })
      toast.showSuccess('FR.AK.01 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.01')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (items.length === 0) return <DocError message="Data FR.AK.01 tidak ditemukan." onRetry={reload} />

  const checkedCount = items.filter((it) => checked[it.id]).length

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Bukti yang Dikumpulkan (centang sesuai persetujuan asesi)
          </h3>
          <div className="space-y-2">
            {items.map((it) => (
              <label
                key={it.id}
                className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100/60 transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                  checked={checked[it.id] ?? false}
                  onChange={() =>
                    setChecked((prev) => ({ ...prev, [it.id]: !(prev[it.id] ?? false) }))
                  }
                />
                <span>{it.nama}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <FieldRow
            label="Waktu Asesmen"
            hint="Format sesuai dokumen: HH:MM - Selesai"
          >
            <TextField value={waktu} onChange={setWaktu} placeholder="mis. 09:00 - Selesai" />
          </FieldRow>
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note={`${checkedCount} dari ${items.length} bukti dicentang. Barcode tanda tangan diabaikan.`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
