/**
 * Editor Revisi MUK — FR.AK.02 (Pencatatan Penilaian Bukti).
 * Semua 7 kolom metode bukti per unit dikirim (bool), + is_kompeten, tindak lanjut,
 * komentar — meniru Ak02Page.
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
  TextareaField,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface UnitKompetensiAPI {
  id: number
  kode: string
  nama: string
  observasi: boolean
  portofolio: boolean
  pertanyaan_wawancara: boolean
  pertanyaan_lisan: boolean
  pertanyaan_tertulis: boolean
  proyek_kerja: boolean
  lainnya?: boolean
}
interface Ak02Response {
  message: string
  data?: {
    data_unit_kompetensi?: UnitKompetensiAPI[]
    is_kompeten?: boolean
    tindak_lanjut?: string
    komentar?: string
  }
}

interface EvidenceCheck {
  observasi: boolean
  portofolio: boolean
  pertanyaan_wawancara: boolean
  pertanyaan_lisan: boolean
  pertanyaan_tertulis: boolean
  proyek_kerja: boolean
  lainnya: boolean
}

const METODE: { key: keyof EvidenceCheck; label: string }[] = [
  { key: 'observasi', label: 'Observasi' },
  { key: 'portofolio', label: 'Portofolio' },
  { key: 'pertanyaan_wawancara', label: 'Wawancara' },
  { key: 'pertanyaan_lisan', label: 'Pertanyaan Lisan' },
  { key: 'pertanyaan_tertulis', label: 'Pertanyaan Tertulis' },
  { key: 'proyek_kerja', label: 'Proyek Kerja' },
  { key: 'lainnya', label: 'Lainnya' },
]

export function Ak02Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak02Response>(asesmenUrl(idIzin, 'ak02'))

  const [units, setUnits] = useState<UnitKompetensiAPI[]>([])
  const [checks, setChecks] = useState<Record<number, EvidenceCheck>>({})
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [tindakLanjut, setTindakLanjut] = useState('')
  const [komentar, setKomentar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.data_unit_kompetensi) return
    setUnits(inner.data_unit_kompetensi)
    const init: Record<number, EvidenceCheck> = {}
    inner.data_unit_kompetensi.forEach((unit) => {
      init[unit.id] = {
        observasi: unit.observasi,
        portofolio: unit.portofolio,
        pertanyaan_wawancara: unit.pertanyaan_wawancara,
        pertanyaan_lisan: unit.pertanyaan_lisan,
        pertanyaan_tertulis: unit.pertanyaan_tertulis,
        proyek_kerja: unit.proyek_kerja,
        lainnya: unit.lainnya ?? false,
      }
    })
    setChecks(init)
    setIsKompeten(inner.is_kompeten ?? null)
    setTindakLanjut(inner.tindak_lanjut || '')
    setKomentar(inner.komentar || '')
  }, [data])

  const setCheck = (unitId: number, key: keyof EvidenceCheck, v: boolean) =>
    setChecks((prev) => ({
      ...prev,
      [unitId]: { ...prev[unitId], [key]: v },
    }))

  const handleSave = async () => {
    if (isKompeten === null) {
      toast.showWarning('Pilih dulu hasil penilaian (Kompeten / Belum Kompeten)')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak02'), {
        answers: units.map((unit) => ({
          id_unit_kompetensi: unit.id,
          observasi: checks[unit.id]?.observasi || false,
          portofolio: checks[unit.id]?.portofolio || false,
          pertanyaan_wawancara: checks[unit.id]?.pertanyaan_wawancara || false,
          pertanyaan_lisan: checks[unit.id]?.pertanyaan_lisan || false,
          pertanyaan_tertulis: checks[unit.id]?.pertanyaan_tertulis || false,
          proyek_kerja: checks[unit.id]?.proyek_kerja || false,
          lainnya: checks[unit.id]?.lainnya || false,
        })),
        is_kompeten: isKompeten,
        tindak_lanjut: tindakLanjut,
        komentar: komentar,
      })
      toast.showSuccess('FR.AK.02 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.02')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (units.length === 0) return <DocError message="Data FR.AK.02 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Metode Bukti per Unit Kompetensi
          </h3>
          <div className="space-y-3">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="text-sm font-medium text-slate-800 mb-2">
                  {unit.kode} — {unit.nama}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {METODE.map(({ key, label }) => (
                    <label
                      key={key}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary"
                        checked={checks[unit.id]?.[key] ?? false}
                        onChange={(e) => setCheck(unit.id, key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <FieldRow label="Hasil Penilaian" hint="Wajib dipilih sebelum menyimpan.">
            <KompetenToggle value={isKompeten} onChange={setIsKompeten} />
          </FieldRow>
          <FieldRow label="Tindak Lanjut">
            <TextareaField
              value={tindakLanjut}
              onChange={setTindakLanjut}
              rows={2}
              placeholder="Bila belum kompeten"
            />
          </FieldRow>
          <FieldRow label="Komentar / Kesepakatan">
            <TextareaField value={komentar} onChange={setKomentar} rows={2} />
          </FieldRow>
          <SaveBar isSaving={isSaving} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  )
}
