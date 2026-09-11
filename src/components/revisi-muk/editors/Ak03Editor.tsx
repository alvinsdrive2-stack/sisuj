/**
 * Editor Revisi MUK — FR.AK.03 (Umpan Balik Asesi).
 * Tampilan = form FR.AK.03 halaman asesi (Ak03Page): tabel KOMPONEN/Hasil/
 * Catatan dengan checkbox Ya-Tidak saling meniadakan + catatan umum.
 * Payload persis Ak03Page: semua soal dikirim (is_kompeten boleh null) + catatan umum.
 */
import { useEffect, useState } from 'react'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { DocTitle } from './bnsp'

interface SoalAPI {
  id: number
  soal: string
  is_kompeten: boolean | null
  catatan?: string | null
}
interface Ak03Response {
  message: string
  data?: {
    soal: SoalAPI[]
    catatan?: string | null
  }
}

interface FeedbackItem {
  id: number
  pertanyaan: string
  ya: boolean
  tidak: boolean
  catatan: string
}

export function Ak03Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak03Response>(asesmenUrl(idIzin, 'ak03'))

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [catatanUmum, setCatatanUmum] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.soal) return
    setFeedbackItems(
      inner.soal.map((soal) => ({
        id: soal.id,
        pertanyaan: soal.soal,
        ya: soal.is_kompeten === true,
        tidak: soal.is_kompeten === false,
        catatan: soal.catatan || '',
      }))
    )
    setCatatanUmum(inner.catatan || '')
  }, [data])

  // Ya/Tidak saling meniadakan (handleFeedbackChange Ak03Page).
  const handleFeedbackChange = (id: number, field: 'ya' | 'tidak') => {
    if (isSaving) return
    setFeedbackItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === 'ya') {
            return { ...item, ya: !item.ya, tidak: false }
          }
          return { ...item, ya: false, tidak: !item.tidak }
        }
        return item
      })
    )
  }

  const handleCatatanChange = (id: number, value: string) => {
    setFeedbackItems((prev) => prev.map((item) => (item.id === id ? { ...item, catatan: value } : item)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak03'), {
        answers: feedbackItems.map((item) => ({
          soal_id: item.id,
          is_kompeten: item.ya ? true : item.tidak ? false : null,
          catatan: item.catatan,
        })),
        catatan: catatanUmum,
      })
      toast.showSuccess('FR.AK.03 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.03')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (feedbackItems.length === 0)
    return <DocError message="Data FR.AK.03 tidak ditemukan." onRetry={reload} />

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.AK.03&nbsp; UMPAN BALIK ASESI</DocTitle>

      <p style={{ fontSize: '13px', marginBottom: '15px' }}>
        Umpan balik dari Asesi (diisi oleh Asesi setelah pengambilan keputusan) :
      </p>

      {/* UMPAN BALIK Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr style={{ background: '#d10000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <th rowSpan={2} style={{ width: '55%', border: '1px solid #000', padding: '6px' }}>KOMPONEN</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Hasil</th>
            <th rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Catatan/Komentar Asesi</th>
          </tr>
          <tr style={{ background: '#d10000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '50px', border: '1px solid #000', padding: '6px' }}>Ya</th>
            <th style={{ width: '50px', border: '1px solid #000', padding: '6px' }}>Tidak</th>
          </tr>

          {feedbackItems.map((item) => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{item.pertanyaan}</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                <CustomCheckbox checked={item.ya} onChange={() => handleFeedbackChange(item.id, 'ya')} disabled={isSaving} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                <CustomCheckbox checked={item.tidak} onChange={() => handleFeedbackChange(item.id, 'tidak')} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={item.catatan}
                  onChange={(e) => handleCatatanChange(item.id, e.target.value)}
                  disabled={isSaving}
                  style={{ width: '100%', height: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isSaving ? 'not-allowed' : 'text' }}
                  placeholder="Tuliskan catatan..."
                />
              </td>
            </tr>
          ))}
          <tr>
            <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}><b>Catatan :</b></td>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={catatanUmum}
                onChange={(e) => setCatatanUmum(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Tuliskan catatan umum..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Semua pernyataan dikirim ulang saat simpan (is_kompeten + catatan per soal, catatan umum)."
      />
    </div>
  )
}
