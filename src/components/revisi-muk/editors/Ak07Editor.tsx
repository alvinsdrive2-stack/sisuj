/**
 * Editor Revisi MUK — FR.AK.07 (Penyesuaian & Rencana Asesmen).
 * Semantik `value` per kelompok (urut) — meniru FrAk07Page persis:
 *  urut 1: bool | urut 2: bool (+custom_name utk ref terakhir tiap kategori)
 *  urut 3: {bool, text} | urut 4: string
 */
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
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

interface Referensi {
  id: number
  nama: string | null
  jawaban?: boolean | string | { bool: boolean; text: string } | null
}
interface Kategori {
  id: number | null
  kategori: string | null
  nama: string | null
  urut: number | null
  id_kelompok: number | null
  referensis: Referensi[]
}
interface KelompokItem {
  id: number
  nama: string
  urut: number
  kategoris: Kategori[]
}
interface Ak07Response {
  message: string
  data?: {
    data?: { kelompoks?: KelompokItem[] }
    kelompoks?: KelompokItem[]
  }
}

/** Key state per referensi: refId_kategoriId_kelompokId (persis FrAk07Page). */
const refKey = (refId: number, kategoriId: number | null, kelompokId: number) =>
  `${refId}_${kategoriId}_${kelompokId}`

export function Ak07Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak07Response>(praUrl(idIzin, 'ak07'))

  const [kelompoks, setKelompoks] = useState<KelompokItem[]>([])
  const [selected, setSelected] = useState<Record<string, boolean | null>>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // nested data.data atau langsung data (mirip FrAk07Page)
    const inner = data?.data?.data || data?.data
    const kelompokList = inner?.kelompoks
    if (!kelompokList) return
    setKelompoks(kelompokList)

    const newSelected: Record<string, boolean | null> = {}
    const newText: Record<number, string> = {}
    kelompokList.forEach((item) => {
      item.kategoris.forEach((kategori) => {
        kategori.referensis.forEach((ref) => {
          const j = ref.jawaban
          if (typeof j === 'object' && j !== null && 'text' in j) {
            newText[ref.id] = j.text
          } else if (typeof j === 'string' && j) {
            newText[ref.id] = j
          }
          if (typeof j === 'object' && j !== null && 'bool' in j) {
            newSelected[refKey(ref.id, kategori.id, item.id)] = j.bool
          } else if (j === true || j === false) {
            newSelected[refKey(ref.id, kategori.id, item.id)] = j
          }
        })
      })
    })
    setSelected(newSelected)
    setTextAnswers(newText)
  }, [data])

  const setState = (key: string, v: boolean | null) =>
    setSelected((prev) => ({ ...prev, [key]: v }))
  const isChecked = (key: string) => selected[key] === true
  const isAnswered = (key: string) => selected[key] === true || selected[key] === false

  const handleSave = async () => {
    if (kelompoks.length === 0) {
      toast.showWarning('Data FR.AK.07 belum termuat')
      return
    }
    setIsSaving(true)
    try {
      const answers: {
        referensi_id: number
        kelompok_id: number
        value: boolean | string | { bool: boolean; text: string }
        custom_name?: string
      }[] = []

      const byUrut = (urut: number) => kelompoks.find((d) => d.urut === urut)

      // Kelompok urut 1 (Potensi Asesi) — boolean per item
      const potensi = byUrut(1)
      if (potensi) {
        potensi.kategoris.forEach((kategori) => {
          kategori.referensis.forEach((ref) => {
            answers.push({
              referensi_id: ref.id,
              kelompok_id: potensi.id,
              value: isChecked(refKey(ref.id, kategori.id, potensi.id)),
            })
          })
        })
      }

      // Kelompok urut 2 (Modifikasi) — boolean; ref terakhir tiap kategori dgn custom_name
      const modifikasi = byUrut(2)
      if (modifikasi) {
        modifikasi.kategoris.forEach((kategori) => {
          kategori.referensis.forEach((ref, refIdx) => {
            const isLast = refIdx === kategori.referensis.length - 1
            const key = refKey(ref.id, kategori.id, modifikasi.id)
            if (!isAnswered(key)) return
            if (isLast) {
              answers.push({
                referensi_id: ref.id,
                kelompok_id: modifikasi.id,
                value: selected[key] === true,
                custom_name: textAnswers[ref.id] || '',
              })
            } else {
              answers.push({
                referensi_id: ref.id,
                kelompok_id: modifikasi.id,
                value: selected[key] === true,
              })
            }
          })
        })
      }

      // Kelompok urut 3 (Rekaman Rencana Asesmen) — {bool, text}
      const rencana = byUrut(3)
      if (rencana && rencana.kategoris[0]) {
        const kategoriId = rencana.kategoris[0].id
        rencana.kategoris[0].referensis.forEach((ref) => {
          answers.push({
            referensi_id: ref.id,
            kelompok_id: rencana.id,
            value: {
              bool: isChecked(refKey(ref.id, kategoriId, rencana.id)),
              text: textAnswers[ref.id] || '',
            },
          })
        })
      }

      // Kelompok urut 4 (Hasil Penyesuaian) — string
      const hasil = byUrut(4)
      if (hasil && hasil.kategoris[0]) {
        hasil.kategoris[0].referensis.forEach((ref) => {
          const userInput = textAnswers[ref.id]
          const finalValue =
            userInput !== undefined
              ? userInput
              : typeof ref.jawaban === 'string'
                ? ref.jawaban
                : ''
          answers.push({
            referensi_id: ref.id,
            kelompok_id: hasil.id,
            value: finalValue,
          })
        })
      }

      await saveDoc(praUrl(idIzin, 'ak07'), { answers })
      toast.showSuccess('FR.AK.07 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.07')
    } finally {
      setIsSaving(false)
    }
  }

  const totalRefs = useMemo(
    () =>
      kelompoks.reduce(
        (n, k) => n + k.kategoris.reduce((m, kat) => m + kat.referensis.length, 0),
        0
      ),
    [kelompoks]
  )

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompoks.length === 0) return <DocError message="Data FR.AK.07 tidak ditemukan." onRetry={reload} />

  const renderKelompok = (item: KelompokItem) => {
    switch (item.urut) {
      case 1:
      case 2:
        return (
          <div className="space-y-4">
            {item.kategoris.map((kategori, katIdx) => (
              <div key={kategori.id ?? katIdx}>
                {(kategori.nama || kategori.kategori) && (
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    {kategori.nama || kategori.kategori}
                  </div>
                )}
                <div className="space-y-2">
                  {kategori.referensis.map((ref, refIdx) => {
                    const key = refKey(ref.id, kategori.id, item.id)
                    const isLast = refIdx === kategori.referensis.length - 1
                    return (
                      <div
                        key={ref.id}
                        className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 mt-0.5 accent-primary shrink-0"
                            checked={selected[key] === true}
                            onChange={() =>
                              setState(key, selected[key] === true ? null : true)
                            }
                          />
                          <span>{ref.nama ?? '-'}</span>
                        </label>
                        {item.urut === 2 && isLast && (
                          <div className="mt-2 pl-6">
                            <TextField
                              value={textAnswers[ref.id] ?? ''}
                              onChange={(v) =>
                                setTextAnswers((prev) => ({ ...prev, [ref.id]: v }))
                              }
                              placeholder="Nama (isi bila tidak tercantum di atas)"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-2">
            {(item.kategoris[0]?.referensis ?? []).map((ref) => {
              const key = refKey(ref.id, item.kategoris[0]?.id ?? null, item.id)
              return (
                <div
                  key={ref.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="text-sm text-slate-700 mb-2">{ref.nama ?? '-'}</div>
                  <KompetenToggle
                    value={selected[key] ?? null}
                    onChange={(v) => setState(key, v)}
                    labels={['Ya', 'Tidak']}
                  />
                  <div className="mt-2">
                    <TextField
                      value={textAnswers[ref.id] ?? ''}
                      onChange={(v) => setTextAnswers((prev) => ({ ...prev, [ref.id]: v }))}
                      placeholder="Keterangan"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )
      case 4:
        return (
          <div className="space-y-3">
            {(item.kategoris[0]?.referensis ?? []).map((ref) => (
              <FieldRow key={ref.id} label={ref.nama ?? '-'}>
                <TextField
                  value={textAnswers[ref.id] ?? ''}
                  onChange={(v) => setTextAnswers((prev) => ({ ...prev, [ref.id]: v }))}
                />
              </FieldRow>
            ))}
          </div>
        )
      default:
        return (
          <div className="text-xs text-slate-400">
            Kelompok dengan urut={item.urut} tidak dikenal — dilewati saat simpan.
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {kelompoks.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{item.nama}</h3>
            {renderKelompok(item)}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4">
          <SaveBar
            isSaving={isSaving}
            onSave={handleSave}
            note={`${totalRefs} referensi — item kosong pada kelompok modifikasi tidak dikirim.`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
