/**
 * Editor Revisi MUK — FR.IA.04.A (Observasi / Demonstrasi Dukungan).
 * Satu-satunya yang dapat direvisi = jawaban soal umpan balik (is_komentar "2"/true),
 * persis perilaku Ia04aPage untuk asesor_1.
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
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
  urut: string
  jenis: string | number
  soal: string
  jawaban: string
  is_komentar: string | boolean | null
}
interface Ia04aResponse {
  message: string
  data?: {
    soal?: Soal[]
  }
}

const isUmpanBalik = (soal: Soal) => soal.is_komentar === '2' || soal.is_komentar === true

export function Ia04aEditor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia04aResponse>(asesmenUrl(idIzin, 'ia04a'))

  const [umpanBalikSoalId, setUmpanBalikSoalId] = useState<number | null>(null)
  const [jawaban, setJawaban] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const soal = data?.data?.soal
    if (!soal) return
    const target = soal.find(isUmpanBalik)
    if (target) {
      setUmpanBalikSoalId(target.id)
      setJawaban(target.jawaban ?? '')
    } else {
      setUmpanBalikSoalId(null)
    }
  }, [data])

  const handleSave = async () => {
    if (!umpanBalikSoalId) {
      toast.showWarning('Tidak ada soal umpan balik untuk disimpan')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia04a'), {
        soal_id: umpanBalikSoalId,
        jawaban: jawaban || '',
      })
      toast.showSuccess('FR.IA.04.A berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.04.A')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />

  if (!umpanBalikSoalId) {
    return (
      <EmptyState
        title="Tidak ada yang bisa direvisi"
        message="Dokumen IA.04.A ini tidak memiliki soal umpan balik asesor."
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Umpan Balik Asesor</h3>
        <p className="text-xs text-slate-400 mb-2">
          Hanya jawaban umpan balik pada dokumen IA.04.A yang dapat direvisi.
        </p>
        <TextareaField
          value={jawaban}
          onChange={setJawaban}
          rows={4}
          placeholder="Umpan balik untuk asesi"
        />
        <SaveBar isSaving={isSaving} onSave={handleSave} />
      </CardContent>
    </Card>
  )
}
