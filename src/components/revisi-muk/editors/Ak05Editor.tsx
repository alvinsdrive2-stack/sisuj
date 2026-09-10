/**
 * Editor Revisi MUK — FR.AK.05 (Pernyataan Hasil Asesmen).
 * ⚠️ Efek samping: POST mengubah kolom kompeten asesi (asesi_jadwals.kompeten,
 * 'K'/'BK') → wajib konfirmasi sebelum simpan.
 */
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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

interface Ak05Response {
  message: string
  data?: {
    kompeten?: boolean
    answers?: {
      keterangan?: string
      aspek?: string
      pencatatan_penolakan?: string
      saran?: string
      catatan?: string
    }
  }
}

export function Ak05Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak05Response>(asesmenUrl(idIzin, 'ak05'))

  const [kompeten, setKompeten] = useState<boolean>(false)
  const [keterangan, setKeterangan] = useState('')
  const [aspek, setAspek] = useState('')
  const [pencatatanPenolakan, setPencatatanPenolakan] = useState('')
  const [saran, setSaran] = useState('')
  const [catatan, setCatatan] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    setKompeten(inner.kompeten || false)
    setKeterangan(inner.answers?.keterangan || '')
    setAspek(inner.answers?.aspek || '')
    setPencatatanPenolakan(inner.answers?.pencatatan_penolakan || '')
    setSaran(inner.answers?.saran || '')
    setCatatan(inner.answers?.catatan || '')
  }, [data])

  const doSave = async () => {
    setConfirmOpen(false)
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak05'), {
        kompeten,
        keterangan,
        aspek,
        pencatatan_penolakan: pencatatanPenolakan,
        saran,
        catatan,
      })
      toast.showSuccess('FR.AK.05 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.05')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClick = () => setConfirmOpen(true)

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (!data?.data) return <DocError message="Data FR.AK.05 tidak ditemukan." onRetry={reload} />

  return (
    <Card>
      <CardContent className="p-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-3 text-xs text-amber-700">
          Perhatian: menyimpan dokumen ini mengubah status kompeten asesi
          (Kompeten / Belum Kompeten) secara langsung.
        </div>
        <FieldRow label="Hasil Asesmen">
          <KompetenToggle
            value={kompeten ? true : false}
            onChange={(v) => setKompeten(v === true)}
          />
        </FieldRow>
        <FieldRow label="Keterangan">
          <TextareaField
            value={keterangan}
            onChange={setKeterangan}
            rows={2}
            placeholder="Keterangan hasil asesmen"
          />
        </FieldRow>
        <FieldRow label="Aspek Positif & Negatif">
          <TextareaField value={aspek} onChange={setAspek} rows={2} />
        </FieldRow>
        <FieldRow label="Pencatatan Penolakan">
          <TextareaField value={pencatatanPenolakan} onChange={setPencatatanPenolakan} rows={2} />
        </FieldRow>
        <FieldRow label="Saran">
          <TextareaField value={saran} onChange={setSaran} rows={2} />
        </FieldRow>
        <FieldRow label="Catatan">
          <TextareaField value={catatan} onChange={setCatatan} rows={2} />
        </FieldRow>
        <SaveBar isSaving={isSaving} onSave={handleSaveClick} />

        <ConfirmDialog
          isOpen={confirmOpen}
          title="Simpan Revisi AK.05?"
          message={`Status asesi akan diubah menjadi "${kompeten ? 'KOMPETEN' : 'BELUM KOMPETEN'}" sesuai pilihan ini. Lanjutkan?`}
          confirmText="Ya, Simpan"
          onConfirm={doSave}
          onCancel={() => setConfirmOpen(false)}
        />
      </CardContent>
    </Card>
  )
}
