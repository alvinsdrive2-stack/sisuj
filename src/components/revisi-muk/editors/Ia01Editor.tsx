/**
 * Editor Revisi MUK — FR.IA.01 (Menchecklist Kompetensi).
 * Meniru persis payload Ia01Page asesi (tanpa barcode/ttd): filter pencapaian !== null,
 * feedback sama untuk semua kelompok, is_kompeten dihitung dari jawaban.
 */
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  KompetenToggle,
  SaveBar,
  TextareaField,
  TextField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface Soal {
  id: number
  no: number
  penilaian_lanjut: string | null
  pencapaian: boolean | null
  kuk?: { id: number; nama: string } | null
}
interface Subunit {
  id: number
  nama: string
  soal: Soal[]
}
interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
  subunits: Subunit[]
}
interface KelompokKerjaItem {
  id: number
  nama: string
  urut: number
  umpan_balik: string | null
  units: Unit[]
}
interface Ia01Data {
  kelompok_kerja: { id?: number; kelompok_kerja?: KelompokKerjaItem[] } | KelompokKerjaItem[]
}
interface Ia01Response {
  message: string
  data?: Ia01Data
}

interface SoalAnswer {
  pencapaian: boolean | null
  penilaian_lanjut: string
}

export function Ia01Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia01Response>(asesmenUrl(idIzin, 'ia01'))

  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [kelompokData, setKelompokData] = useState<KelompokKerjaItem[]>([])
  const [answers, setAnswers] = useState<Record<number, SoalAnswer>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    const kk = inner?.kelompok_kerja
    if (!kk) return

    // dokumen_id: nested {id, kelompok_kerja: [...]} atau flat [...]
    let dokId: number | null = null
    if (!Array.isArray(kk) && typeof kk.id === 'number') dokId = kk.id
    else if (Array.isArray(kk) && kk.length > 0) dokId = kk[0]?.id ?? null
    setDokumenId(dokId)

    const items: KelompokKerjaItem[] = Array.isArray(kk)
      ? kk
      : (kk.kelompok_kerja ?? [])
    setKelompokData(items)

    const init: Record<number, SoalAnswer> = {}
    let firstUmpanBalik = ''
    items.forEach((kelompok) => {
      if (!firstUmpanBalik && kelompok.umpan_balik) firstUmpanBalik = kelompok.umpan_balik
      kelompok.units.forEach((unit) => {
        unit.subunits.forEach((subunit) => {
          subunit.soal.forEach((soal) => {
            init[soal.id] = {
              pencapaian: soal.pencapaian ?? null,
              penilaian_lanjut: soal.penilaian_lanjut ?? '',
            }
          })
        })
      })
    })
    setAnswers(init)
    setUmpanBalik(firstUmpanBalik)
  }, [data])

  const setAnswer = (soalId: number, patch: Partial<SoalAnswer>) =>
    setAnswers((prev) => ({ ...prev, [soalId]: { ...prev[soalId], ...patch } }))

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.pencapaian !== null).length,
    [answers]
  )

  const handleSave = async () => {
    if (!dokumenId) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      const payloadAnswers = Object.entries(answers)
        .filter(([, a]) => a.pencapaian !== null)
        .map(([soalId, a]) => ({
          soal_id: parseInt(soalId, 10),
          penilaian_lanjut: a.penilaian_lanjut.trim() || null,
          pencapaian: a.pencapaian,
        }))
      await saveDoc(asesmenUrl(idIzin, 'ia01'), {
        dokumen_id: dokumenId,
        answers: payloadAnswers,
        feedback: kelompokData.map((k) => ({ kelompok_id: k.id, umpan_balik: umpanBalik })),
        is_kompeten: payloadAnswers.length > 0 && payloadAnswers.every((a) => a.pencapaian === true),
      })
      toast.showSuccess('FR.IA.01 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.01')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompokData.length === 0) return <DocError message="Data FR.IA.01 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      {kelompokData.map((kelompok) => (
        <Card key={kelompok.id}>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {kelompok.nama}
            </h3>
            <div className="space-y-4 mt-3">
              {kelompok.units.map((unit) => (
                <div key={unit.id_unit}>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {unit.kode_unit} — {unit.nama_unit}
                  </div>
                  {unit.subunits.map((subunit) => (
                    <div key={subunit.id} className="mt-2">
                      <div className="text-sm font-medium text-slate-700">{subunit.nama}</div>
                      <div className="space-y-2 mt-1.5">
                        {subunit.soal.map((soal) => (
                          <div
                            key={soal.id}
                            className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                          >
                            <div className="text-sm text-slate-700 mb-2">
                              {soal.no}. {soal.kuk?.nama ?? ''}
                            </div>
                            <KompetenToggle
                              value={answers[soal.id]?.pencapaian ?? null}
                              onChange={(v) => setAnswer(soal.id, { pencapaian: v })}
                            />
                            <div className="mt-2">
                              <TextField
                                value={answers[soal.id]?.penilaian_lanjut ?? ''}
                                onChange={(v) => setAnswer(soal.id, { penilaian_lanjut: v })}
                                placeholder="Penilaian lanjut (opsional)"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note={`${answeredCount} dari ${Object.keys(answers).length} KUK terjawab — baris belum dijawab tidak diubah.`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
