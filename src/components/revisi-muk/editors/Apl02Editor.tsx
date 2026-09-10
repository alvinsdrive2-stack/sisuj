/**
 * Editor Revisi MUK — FR.APL.02 (Asesmen Mandiri).
 * Hati-hati: POST wajib tiap answer punya ≥1 file → file existing dari GET
 * (`subunit.files`) dikirim ulang sebagai file_ids; admin hanya merevisi `kompeten`.
 * is_dilanjutkan: true punya efek lanjut → konfirmasi sebelum simpan.
 */
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  KompetenToggle,
  RadioChoice,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'

interface ServerFile {
  id: number
  name: string
  path: string
}
interface Subunit {
  id: string
  no_elemen: string
  judul_elemen: string
  kompeten?: boolean
  kuk_list: { no_kuk: string; judul_kuk: string }[]
  files: ServerFile[]
}
interface Unit {
  id: string
  kode: string
  judul_kompetensi: string
  subunits: Subunit[]
}
interface Apl02Response {
  message: string
  data?: {
    metode?: 'observasi' | 'portofolio'
    is_dilanjutkan?: boolean
    units: Unit[]
  }
}

type Metode = 'observasi' | 'portofolio'

export function Apl02Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Apl02Response>(praUrl(idIzin, 'apl02'))

  const [units, setUnits] = useState<Unit[]>([])
  const [kompetenMap, setKompetenMap] = useState<Record<string, boolean>>({})
  const [metode, setMetode] = useState<Metode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.units) return
    setUnits(inner.units)
    setMetode(inner.metode ?? null)
    const init: Record<string, boolean> = {}
    inner.units.forEach((unit) => {
      unit.subunits.forEach((subunit) => {
        // Default 'K' bila belum pernah disimpan (mirip Apl02Page asesi)
        init[subunit.id] = subunit.kompeten !== false
      })
    })
    setKompetenMap(init)
  }, [data])

  const totalSubunit = useMemo(
    () => units.reduce((n, u) => n + u.subunits.length, 0),
    [units]
  )
  const subunitTanpaFile = useMemo(
    () =>
      units.flatMap((u) => u.subunits).filter((s) => !s.files || s.files.length === 0)
        .length,
    [units]
  )

  const doSave = async () => {
    setConfirmOpen(false)
    setIsSaving(true)
    try {
      const answers = units.flatMap((unit) =>
        unit.subunits.map((subunit) => ({
          subunit_id: subunit.id,
          kompeten: kompetenMap[subunit.id] ?? true,
          // file existing wajib dikirim ulang (validasi backend: ≥1 file per answer)
          file_ids: (subunit.files ?? []).map((f) => f.id),
          file_urls: [] as { url: string; name: string }[],
        }))
      )
      await saveDoc(praUrl(idIzin, 'apl02'), {
        metode: metode ?? '',
        is_dilanjutkan: true,
        answers,
      })
      toast.showSuccess('FR.APL.02 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.APL.02')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClick = () => {
    if (units.length === 0) {
      toast.showWarning('Tidak ada data elemen untuk disimpan')
      return
    }
    if (subunitTanpaFile > 0) {
      toast.showWarning(
        `${subunitTanpaFile} elemen belum punya file bukti — APL.02 tidak bisa disimpan sebelum asesi mengunggah filenya.`
      )
      return
    }
    setConfirmOpen(true)
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (units.length === 0) return <DocError message="Data FR.APL.02 tidak ditemukan." onRetry={reload} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-700 mb-1.5">Metode Asesmen</div>
          <RadioChoice<Metode>
            name="apl02-metode"
            value={metode}
            onChange={setMetode}
            options={[
              { value: 'observasi', label: 'Observasi / Demonstrasi' },
              { value: 'portofolio', label: 'Portofolio' },
            ]}
          />
        </CardContent>
      </Card>

      {units.map((unit) => (
        <Card key={unit.id}>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              {unit.kode} — {unit.judul_kompetensi}
            </h3>
            <div className="space-y-3">
              {unit.subunits.map((subunit) => (
                <div
                  key={subunit.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="text-sm font-medium text-slate-800">
                    {subunit.no_elemen} {subunit.judul_elemen}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <KompetenToggle
                      value={kompetenMap[subunit.id] ?? true}
                      onChange={(v) =>
                        setKompetenMap((prev) => ({ ...prev, [subunit.id]: v === true }))
                      }
                    />
                    <span className="text-xs text-slate-400">
                      {subunit.files?.length
                        ? `${subunit.files.length} file bukti terlampir (ikut dikirim ulang)`
                        : 'Belum ada file bukti'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4">
          <SaveBar
            isSaving={isSaving}
            onSave={handleSaveClick}
            note={`${totalSubunit} elemen — file bukti existing dikirim ulang tanpa diubah.`}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Simpan Revisi APL 02?"
        message="Penyimpanan menandai asesmen mandiri ini dilanjutkan (is_dilanjutkan). Lanjutkan simpan?"
        confirmText="Ya, Simpan"
        onConfirm={doSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
