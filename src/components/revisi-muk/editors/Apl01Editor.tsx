/**
 * Editor Revisi MUK — FR.APL.01 (Pendaftaran Sertifikasi).
 * Hanya data pekerjaan yang editable — meniru payload Apl01Page (formDataPekerjaan).
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

interface DataPekerjaan {
  perusahaan: string
  jabatan: string
  alamat_kantor: string | null
  kode_pos: number | string | null
  telepon_kantor: string | null
  fax: string | null
  email_kantor: string | null
}
interface Apl01Response {
  message: string
  data?: {
    data_pekerjaan?: DataPekerjaan
  }
}

const FIELDS: { key: keyof DataPekerjaan; label: string }[] = [
  { key: 'perusahaan', label: 'Perusahaan / Institusi' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'alamat_kantor', label: 'Alamat Kantor' },
  { key: 'kode_pos', label: 'Kode Pos' },
  { key: 'telepon_kantor', label: 'Telepon Kantor' },
  { key: 'fax', label: 'Fax' },
  { key: 'email_kantor', label: 'Email Kantor' },
]

export function Apl01Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Apl01Response>(praUrl(idIzin, 'apl01'))

  const [form, setForm] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const pekerjaan = data?.data?.data_pekerjaan
    if (!pekerjaan) return
    const init: Record<string, string> = {}
    FIELDS.forEach(({ key }) => {
      init[key] = String((pekerjaan[key] as string | number | null) ?? '')
    })
    setForm(init)
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(praUrl(idIzin, 'apl01'), {
        perusahaan: form.perusahaan ?? '',
        jabatan: form.jabatan ?? '',
        alamat_kantor: form.alamat_kantor ?? '',
        kode_pos: form.kode_pos || null,
        telepon_kantor: form.telepon_kantor ?? '',
        fax: form.fax ?? '',
        email_kantor: form.email_kantor ?? '',
      })
      toast.showSuccess('FR.APL.01 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.APL.01')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (!data?.data?.data_pekerjaan) return <DocError message="Data FR.APL.01 tidak ditemukan." onRetry={reload} />

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Data Pekerjaan Asesi</h3>
        <p className="text-xs text-slate-400 mb-2">Hanya bagian pekerjaan yang dapat direvisi.</p>
        {FIELDS.map(({ key, label }) => (
          <FieldRow key={key} label={label}>
            <TextField
              value={form[key] ?? ''}
              onChange={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
            />
          </FieldRow>
        ))}
        <SaveBar isSaving={isSaving} onSave={handleSave} />
      </CardContent>
    </Card>
  )
}
