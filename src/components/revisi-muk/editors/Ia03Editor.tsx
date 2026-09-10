/**
 * Editor Revisi MUK — FR.IA.03 (Pertanyaan Terstruktur Wawancara / Observasi).
 * Meniru payload Ia03Page: SEMUA soal dikirim, fallback ke nilai existing per soal.
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
  TextField,
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
  tanggapan: string | null
  pencapaian: boolean | null
  unitkompetensi?: { id: number; kode: string } | null
  kuk?: { id: number; kode: string } | null
}
interface KelompokKerja {
  id: number
  nama: string
  urut: string
  soal: Soal[]
}
interface Ia03Response {
  message: string
  data?: {
    kelompok_kerja: {
      id: number
      kode: string
      nama_dokumen: string
      kelompok_kerja: KelompokKerja[]
    }
    umpan_balik?: string
  }
}

export function Ia03Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia03Response>(asesmenUrl(idIzin, 'ia03'))

  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [kelompokData, setKelompokData] = useState<KelompokKerja[]>([])
  const [tanggapan, setTanggapan] = useState<Record<number, string>>({})
  const [pencapaian, setPencapaian] = useState<Record<number, boolean | null>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.kelompok_kerja) return
    setDokumenId(inner.kelompok_kerja.id)
    const items = inner.kelompok_kerja.kelompok_kerja ?? []
    setKelompokData(items)
    const t: Record<number, string> = {}
    const p: Record<number, boolean | null> = {}
    items.forEach((kelompok) => {
      kelompok.soal.forEach((soal) => {
        if (soal.tanggapan) t[soal.id] = soal.tanggapan
        if (soal.pencapaian !== null) p[soal.id] = soal.pencapaian
      })
    })
    setTanggapan(t)
    setPencapaian(p)
    setUmpanBalik(inner.umpan_balik ?? '')
  }, [data])

  const handleSave = async () => {
    if (!dokumenId) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      const answers = kelompokData.flatMap((kelompok) =>
        kelompok.soal.map((soal) => ({
          soal_id: soal.id,
          tanggapan: tanggapan[soal.id] || soal.tanggapan || '',
          pencapaian: pencapaian[soal.id] ?? soal.pencapaian ?? false,
        }))
      )
      await saveDoc(asesmenUrl(idIzin, 'ia03'), {
        dokumen_id: dokumenId,
        answers,
        umpan_balik: umpanBalik,
        is_kompeten: answers.length > 0 && answers.every((a) => a.pencapaian === true),
      })
      toast.showSuccess('FR.IA.03 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.03')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompokData.length === 0) return <DocError message="Data FR.IA.03 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      {kelompokData.map((kelompok) => (
        <Card key={kelompok.id}>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{kelompok.nama}</h3>
            <div className="space-y-3">
              {kelompok.soal.map((soal) => (
                <div
                  key={soal.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="text-sm font-medium text-slate-800 mb-1">
                    {soal.no}. {soal.soal}
                  </div>
                  {(soal.unitkompetensi?.kode || soal.kuk?.kode) && (
                    <div className="text-xs text-slate-400 mb-2">
                      {[soal.unitkompetensi?.kode, soal.kuk?.kode]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  )}
                  <div className="mb-2">
                    <TextField
                      value={tanggapan[soal.id] ?? ''}
                      onChange={(v) =>
                        setTanggapan((prev) => ({ ...prev, [soal.id]: v }))
                      }
                      maxLength={255}
                      placeholder="Tanggapan asesi (maks. 255 karakter)"
                    />
                  </div>
                  <KompetenToggle
                    value={pencapaian[soal.id] ?? null}
                    onChange={(v) =>
                      setPencapaian((prev) => ({ ...prev, [soal.id]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-700 mb-1.5">Umpan Balik</div>
          <TextareaField
            value={umpanBalik}
            onChange={setUmpanBalik}
            rows={3}
            placeholder="Umpan balik untuk asesi"
          />
          <SaveBar isSaving={isSaving} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  )
}
