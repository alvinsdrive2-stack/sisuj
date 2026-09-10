/**
 * Editor Revisi MUK — FR.IA.10 (Pertanyaan Wawancara pada Tempat Kerja /
 * Penilaian Diri oleh Pengawas).
 * Meniru Ia10Page: answers Ya/Tidak + essay_answers (grup 3 & 4) + data pengawas.
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

interface ReferensiItem {
  id: number
  nama: string
}
interface Ia10Response {
  message: string
  data?: {
    dokumen_id?: number
    referensi_form?: {
      '2'?: ReferensiItem[]
      '3'?: ReferensiItem[]
      '4'?: ReferensiItem[]
    }
    answers?: Record<string, boolean>
    essay_answers?: Record<string, string>
    form_data?: {
      nama_pengawas?: string
      tempat_kerja?: string
      alamat?: string
      telepon?: string
    }
  }
}

interface YaTidakItem {
  id: number
  pertanyaan: string
  jawaban: boolean | null
}
interface EssayItem {
  id: number
  pertanyaan: string
  jawaban: string
}

const emptyForm = { nama_pengawas: '', tempat_kerja: '', alamat: '', telepon: '' }

export function Ia10Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia10Response>(asesmenUrl(idIzin, 'ia10'))

  const [dokumenId, setDokumenId] = useState<number | undefined>(undefined)
  const [yaTidakList, setYaTidakList] = useState<YaTidakItem[]>([])
  const [essayList, setEssayList] = useState<EssayItem[]>([])
  const [additionalList, setAdditionalList] = useState<EssayItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    setDokumenId(inner.dokumen_id)
    const savedAnswers = inner.answers || {}
    const savedEssay = inner.essay_answers || {}

    if (inner.form_data) {
      setForm({
        nama_pengawas: inner.form_data.nama_pengawas || '',
        tempat_kerja: inner.form_data.tempat_kerja || '',
        alamat: inner.form_data.alamat || '',
        telepon: inner.form_data.telepon || '',
      })
    }
    if (inner.referensi_form?.['2']) {
      setYaTidakList(
        inner.referensi_form['2'].map((item) => ({
          id: item.id,
          pertanyaan: item.nama,
          jawaban: savedAnswers[String(item.id)] ?? null,
        }))
      )
    }
    if (inner.referensi_form?.['3']) {
      setEssayList(
        inner.referensi_form['3'].map((item) => ({
          id: item.id,
          pertanyaan: item.nama,
          jawaban: savedEssay[String(item.id)] || '',
        }))
      )
    }
    if (inner.referensi_form?.['4']) {
      setAdditionalList(
        inner.referensi_form['4'].map((item) => ({
          id: item.id,
          pertanyaan: item.nama,
          jawaban: savedEssay[String(item.id)] || '',
        }))
      )
    }
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia10'), {
        ...(dokumenId !== undefined ? { dokumen_id: dokumenId } : {}),
        answers: yaTidakList.map((p) => ({
          referensi_id: p.id,
          answer: p.jawaban,
        })),
        essay_answers: [
          ...essayList.map((e) => ({ referensi_id: e.id, essay_answer: e.jawaban })),
          ...additionalList.map((a) => ({ referensi_id: a.id, essay_answer: a.jawaban || '' })),
        ],
        nama_pengawas: form.nama_pengawas,
        tempat_kerja: form.tempat_kerja,
        alamat: form.alamat,
        telepon: form.telepon,
      })
      toast.showSuccess('FR.IA.10 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.10')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (yaTidakList.length === 0 && essayList.length === 0 && additionalList.length === 0)
    return <DocError message="Data FR.IA.10 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      {yaTidakList.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {yaTidakList.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="text-sm text-slate-700 mb-2">{p.pertanyaan}</div>
                <KompetenToggle
                  value={p.jawaban}
                  onChange={(v) =>
                    setYaTidakList((prev) =>
                      prev.map((it) => (it.id === p.id ? { ...it, jawaban: v } : it))
                    )
                  }
                  labels={['Ya', 'Tidak']}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {essayList.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {essayList.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="text-sm font-medium text-slate-800 mb-2">{e.pertanyaan}</div>
                <TextareaField
                  value={e.jawaban}
                  onChange={(v) =>
                    setEssayList((prev) =>
                      prev.map((it) => (it.id === e.id ? { ...it, jawaban: v } : it))
                    )
                  }
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {additionalList.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {additionalList.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="text-sm font-medium text-slate-800 mb-2">{a.pertanyaan}</div>
                <TextareaField
                  value={a.jawaban}
                  onChange={(v) =>
                    setAdditionalList((prev) =>
                      prev.map((it) => (it.id === a.id ? { ...it, jawaban: v } : it))
                    )
                  }
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Data Pengawas / Penilai di Tempat Kerja</h3>
          <FieldRow label="Nama Pengawas">
            <TextField
              value={form.nama_pengawas}
              onChange={(v) => setForm((prev) => ({ ...prev, nama_pengawas: v }))}
            />
          </FieldRow>
          <FieldRow label="Tempat Kerja">
            <TextField
              value={form.tempat_kerja}
              onChange={(v) => setForm((prev) => ({ ...prev, tempat_kerja: v }))}
            />
          </FieldRow>
          <FieldRow label="Alamat">
            <TextField
              value={form.alamat}
              onChange={(v) => setForm((prev) => ({ ...prev, alamat: v }))}
            />
          </FieldRow>
          <FieldRow label="Telepon">
            <TextField
              value={form.telepon}
              onChange={(v) => setForm((prev) => ({ ...prev, telepon: v }))}
            />
          </FieldRow>
          <SaveBar isSaving={isSaving} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  )
}
