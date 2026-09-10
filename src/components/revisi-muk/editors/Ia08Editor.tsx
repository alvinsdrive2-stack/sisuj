/**
 * Editor Revisi MUK — FR.IA.08 (Validasi Portofolia & Wawancara).
 * file_id WAJIB berasal dari GET (exists:apl2_files) — tidak boleh dikarang;
 * valid/asli/terkini/memadai per file + unit_answers + rekomendasi.
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
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface Ia08File {
  id: number
  original_name: string
  path: string
  filetype: string | null
  answer?: {
    valid: boolean
    asli: boolean
    terkini: boolean
    memadai: boolean
  }
}
interface WawancaraItem {
  id: number
  unit_kompetensi: string
  no_elemen: string
  materi: string
  checked: boolean
}
interface Soal2Item {
  id: number
  id_dokumen?: number | string
  unit?: { kode: string } | null
  subunit?: { kode: string; nama?: string } | null
  kuk?: { nama: string } | null
}
interface Ia08Response {
  message: string
  data?: {
    files?: Ia08File[]
    soal?: { '2'?: Soal2Item[] }
    unit_answers?: Record<string, boolean>
    recommendation?: {
      bukti_tambahan?: string
      is_kompeten?: boolean
      rekomendasi_unit?: string
      rekomendasi_elemen?: string
      rekomendasi_kuk?: string
    }
    dokumen?: { id: number }
  }
}

const KRITERIA = ['valid', 'asli', 'terkini', 'memadai'] as const
type Kriteria = (typeof KRITERIA)[number]
const KRITERIA_LABEL: Record<Kriteria, string> = {
  valid: 'Valid',
  asli: 'Asli',
  terkini: 'Terkini',
  memadai: 'Memadai',
}

export function Ia08Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia08Response>(asesmenUrl(idIzin, 'ia08'))

  const [files, setFiles] = useState<Ia08File[]>([])
  const [wawancara, setWawancara] = useState<WawancaraItem[]>([])
  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [buktiTambahan, setBuktiTambahan] = useState('')
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [rekomendasiUnit, setRekomendasiUnit] = useState('')
  const [rekomendasiElemen, setRekomendasiElemen] = useState('')
  const [rekomendasiKuk, setRekomendasiKuk] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return

    if (inner.files) setFiles(inner.files)

    if (inner.soal?.['2']) {
      const savedUnit = inner.unit_answers || {}
      setWawancara(
        inner.soal['2'].map((item, index) => ({
          id: item.id || index + 1,
          unit_kompetensi: item.unit?.kode || '-',
          no_elemen: item.subunit?.kode || '-',
          materi: item.kuk?.nama || item.subunit?.nama || '-',
          checked: savedUnit[String(item.id)] === true,
        }))
      )
      if (!inner.dokumen?.id && inner.soal['2'][0]?.id_dokumen) {
        setDokumenId(Number(inner.soal['2'][0].id_dokumen))
      }
    }
    if (inner.dokumen?.id) setDokumenId(inner.dokumen.id)

    if (inner.recommendation) {
      const rec = inner.recommendation
      if (rec.bukti_tambahan) setBuktiTambahan(rec.bukti_tambahan)
      if (rec.is_kompeten === true || rec.is_kompeten === false) setIsKompeten(rec.is_kompeten)
      if (rec.rekomendasi_unit) setRekomendasiUnit(rec.rekomendasi_unit)
      if (rec.rekomendasi_elemen) setRekomendasiElemen(rec.rekomendasi_elemen)
      if (rec.rekomendasi_kuk) setRekomendasiKuk(rec.rekomendasi_kuk)
    }
  }, [data])

  const setFileKriteria = (fileId: number, k: Kriteria, v: boolean) =>
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              answer: {
                valid: false,
                asli: false,
                terkini: false,
                memadai: false,
                ...f.answer,
                [k]: v,
              },
            }
          : f
      )
    )

  const handleSave = async () => {
    if (isKompeten === null) {
      toast.showWarning('Pilih dulu rekomendasi hasil (Kompeten / Belum Kompeten)')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia08'), {
        dokumen_id: dokumenId,
        apl2_answers: files.map((f) => ({
          file_id: f.id,
          valid: f.answer?.valid ?? null,
          asli: f.answer?.asli ?? null,
          terkini: f.answer?.terkini ?? null,
          memadai: f.answer?.memadai ?? null,
        })),
        unit_answers: wawancara.map((item) => ({
          soal_id: item.id,
          is_checked: item.checked,
        })),
        bukti_tambahan: buktiTambahan,
        is_kompeten: isKompeten,
        rekomendasi_unit: rekomendasiUnit,
        rekomendasi_elemen: rekomendasiElemen,
        rekomendasi_kuk: rekomendasiKuk,
      })
      toast.showSuccess('FR.IA.08 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.08')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (files.length === 0 && wawancara.length === 0)
    return <DocError message="Data FR.IA.08 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Validasi Bukti Portofolio ({files.length} file)
            </h3>
            <div className="space-y-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="text-sm font-medium text-slate-800 mb-2 break-all">
                    {f.original_name}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {KRITERIA.map((k) => (
                      <label
                        key={k}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-primary"
                          checked={f.answer?.[k] === true}
                          onChange={(e) => setFileKriteria(f.id, k, e.target.checked)}
                        />
                        {KRITERIA_LABEL[k]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {wawancara.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Wawancara Pendukung (item yang diperiksa)
            </h3>
            <div className="space-y-2">
              {wawancara.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100/60 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                    checked={item.checked}
                    onChange={() =>
                      setWawancara((prev) =>
                        prev.map((it) =>
                          it.id === item.id ? { ...it, checked: !it.checked } : it
                        )
                      )
                    }
                  />
                  <span>
                    <span className="font-medium">{item.unit_kompetensi}</span>
                    {' · '}{item.no_elemen} — {item.materi}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <FieldRow label="Rekomendasi Hasil Asesmen" hint="Wajib dipilih sebelum menyimpan.">
            <KompetenToggle value={isKompeten} onChange={setIsKompeten} />
          </FieldRow>
          <FieldRow label="Bukti Tambahan">
            <TextField
              value={buktiTambahan}
              onChange={setBuktiTambahan}
              placeholder="Bukti tambahan yang diminta (bila ada)"
            />
          </FieldRow>
          <FieldRow label="Rekomendasi per Unit">
            <TextField value={rekomendasiUnit} onChange={setRekomendasiUnit} />
          </FieldRow>
          <FieldRow label="Rekomendasi per Elemen">
            <TextField value={rekomendasiElemen} onChange={setRekomendasiElemen} />
          </FieldRow>
          <FieldRow label="Rekomendasi per KUK">
            <TextField value={rekomendasiKuk} onChange={setRekomendasiKuk} />
          </FieldRow>
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note="Daftar file berasal dari portofolio asesi — hanya status validasinya yang diubah."
          />
        </CardContent>
      </Card>
    </div>
  )
}
