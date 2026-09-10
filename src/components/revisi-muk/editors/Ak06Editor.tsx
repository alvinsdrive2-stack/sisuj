/**
 * Editor Revisi MUK — FR.AK.06 (Umpan Balik Asesmen — konsistensi instrumen).
 * Backend hanya menimpa field yang dikirim (array_filter null) → SEMUA nilai
 * existing dikirim ulang. dimensi_kompetensi tidak dikirim → nilai lama dipertahankan.
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  FieldRow,
  KompetenToggle,
  SaveBar,
  TextField,
  TextareaField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface AspekAPI {
  aspek_id: string
  nama: string
  validitas: boolean | null
  reliabel: boolean | null
  fleksibel: boolean | null
  adil: boolean | null
}
interface Ak06Response {
  message: string
  data?: {
    aspek?: AspekAPI[]
    feedback?: {
      rekomendasi1?: string
      rekomendasi2?: string
      catatan_asesor1?: string
      catatan_asesor2?: string
    }
  }
}

interface AspekItem {
  id: string
  nama: string
  validitas: boolean | null
  reliabel: boolean | null
  fleksibel: boolean | null
  adil: boolean | null
}

const KRITERIA: { key: keyof Omit<AspekItem, 'id' | 'nama'>; label: string }[] = [
  { key: 'validitas', label: 'Validitas' },
  { key: 'reliabel', label: 'Reliabel' },
  { key: 'fleksibel', label: 'Fleksibel' },
  { key: 'adil', label: 'Adil' },
]

export function Ak06Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak06Response>(asesmenUrl(idIzin, 'ak06'))

  const [aspekItems, setAspekItems] = useState<AspekItem[]>([])
  const [rekomendasi1, setRekomendasi1] = useState('')
  const [rekomendasi2, setRekomendasi2] = useState('')
  const [catatanAsesor1, setCatatanAsesor1] = useState('')
  const [catatanAsesor2, setCatatanAsesor2] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.aspek) return
    setAspekItems(
      inner.aspek.map((item) => ({
        id: item.aspek_id,
        nama: item.nama,
        validitas: item.validitas ?? null,
        reliabel: item.reliabel ?? null,
        fleksibel: item.fleksibel ?? null,
        adil: item.adil ?? null,
      }))
    )
    setRekomendasi1(inner.feedback?.rekomendasi1 || '')
    setRekomendasi2(inner.feedback?.rekomendasi2 || '')
    setCatatanAsesor1(inner.feedback?.catatan_asesor1 || '')
    setCatatanAsesor2(inner.feedback?.catatan_asesor2 || '')
  }, [data])

  const setAspek = (id: string, key: keyof Omit<AspekItem, 'id' | 'nama'>, v: boolean | null) =>
    setAspekItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: v } : it)))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak06'), {
        answers: aspekItems.map((item) => ({
          aspek_id: parseInt(item.id, 10),
          validitas: item.validitas ?? null,
          reliabel: item.reliabel ?? null,
          fleksibel: item.fleksibel ?? null,
          adil: item.adil ?? null,
        })),
        rekomendasi1,
        rekomendasi2,
        catatan_asesor1: catatanAsesor1,
        catatan_asesor2: catatanAsesor2,
      })
      toast.showSuccess('FR.AK.06 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.06')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (aspekItems.length === 0) return <DocError message="Data FR.AK.06 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Penilaian Konsistensi Instrumen
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Nilai Ya / Tidak per aspek; klik ulang pilihan yang sama untuk mengosongkan.
          </p>
          <div className="space-y-3">
            {aspekItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="text-sm font-medium text-slate-800 mb-2">{item.nama}</div>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {KRITERIA.map(({ key, label }) => (
                    <div key={key}>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        {label}
                      </div>
                      <KompetenToggle
                        value={item[key]}
                        onChange={(v) => setAspek(item.id, key, v)}
                        labels={['Ya', 'Tidak']}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <FieldRow label="Rekomendasi Prinsip Asesmen">
            <TextField value={rekomendasi1} onChange={setRekomendasi1} />
          </FieldRow>
          <FieldRow label="Rekomendasi Dimensi Kompetensi">
            <TextField value={rekomendasi2} onChange={setRekomendasi2} />
          </FieldRow>
          <FieldRow label="Catatan Asesor 1">
            <TextareaField value={catatanAsesor1} onChange={setCatatanAsesor1} rows={2} />
          </FieldRow>
          <FieldRow label="Catatan Asesor 2">
            <TextareaField value={catatanAsesor2} onChange={setCatatanAsesor2} rows={2} />
          </FieldRow>
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note="Dimensi kompetensi (jenjang/metode) tidak diubah oleh revisi ini."
          />
        </CardContent>
      </Card>
    </div>
  )
}
