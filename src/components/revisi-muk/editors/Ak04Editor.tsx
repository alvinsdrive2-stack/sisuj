/**
 * Editor Revisi MUK — FR.AK.04 (Formulir Banding / Keberatan).
 * Tampilan = form FR.AK.04 halaman asesi (FrAk04Page): satu tabel utama
 * (identitas, pertanyaan YA/TIDAK, info skema, alasan banding, ttd).
 * Jawaban hanya true atau null (mirip mapping FrAk04Page: jawaban === true ? true : null).
 * Barcode ttd asesi read-only (tampil bila ada jawaban, seperti halaman asesi).
 */
import { useEffect, useState } from 'react'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { DocTitle, fmtTanggalId } from './bnsp'

interface Referensi {
  id: number
  nama: string
  jawaban: boolean
}
interface Kelompok {
  id: number
  nama: string | null
  urut: number
  referensis: Referensi[]
}
interface Ak04Barcode {
  url: string
  tanggal: string
  nama: string
}
interface Ak04Response {
  message: string
  data?:
    | {
        kelompoks: Kelompok[]
        alasan: string
        barcodes?: {
          asesi?: Ak04Barcode
          asesor1?: Ak04Barcode | null
          asesor2?: Ak04Barcode | null
        }
      }
    | { data: { kelompoks: Kelompok[]; alasan: string; barcodes?: { asesi?: Ak04Barcode; asesor1?: Ak04Barcode | null; asesor2?: Ak04Barcode | null } } }
}

export function Ak04Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak04Response>(praUrl(idIzin, 'ak04'))

  const [kelompoks, setKelompoks] = useState<Kelompok[]>([])
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({})
  const [alasan, setAlasan] = useState('')
  const [asesiBarcode, setAsesiBarcode] = useState<Ak04Barcode | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // dukung struktur flat maupun nested data.data (mirip FrAk04Page)
    const raw = data?.data
    const inner =
      raw && 'data' in raw && raw.data && 'kelompoks' in raw.data ? raw.data : raw
    if (!inner || !('kelompoks' in inner) || !inner.kelompoks) return
    setKelompoks(inner.kelompoks)
    const init: Record<number, boolean | null> = {}
    inner.kelompoks.forEach((k) => {
      k.referensis.forEach((ref) => {
        init[ref.id] = ref.jawaban === true
      })
    })
    setAnswers(init)
    setAlasan(inner.alasan ?? '')
    if (inner.barcodes?.asesi?.url) setAsesiBarcode(inner.barcodes.asesi)
  }, [data])

  // Ya/Tidak: klik nilai sama = kosongkan (handleAnswerChange FrAk04Page)
  const handleAnswerChange = (refId: number, value: boolean) => {
    if (isSaving) return
    setAnswers((prev) => {
      const current = prev[refId]
      if (current === value) {
        const { [refId]: _drop, ...rest } = prev
        return rest
      }
      return { ...prev, [refId]: value }
    })
  }
  // Klik sel pertanyaan: null -> true -> false -> null (handleCellClick FrAk04Page)
  const handleCellClick = (refId: number) => {
    if (isSaving) return
    setAnswers((prev) => {
      const current = prev[refId]
      if (current === undefined || current === null) {
        return { ...prev, [refId]: true }
      } else if (current === true) {
        return { ...prev, [refId]: false }
      } else {
        const { [refId]: _drop, ...rest } = prev
        return rest
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const kelompokId = kelompoks[0]?.id || 1
      await saveDoc(praUrl(idIzin, 'ak04'), {
        answers: Object.entries(answers).map(([referensiId, jawaban]) => ({
          referensi_id: Number(referensiId),
          kelompok_id: kelompokId,
          jawaban: jawaban === true ? true : null,
        })),
        alasan,
      })
      toast.showSuccess('FR.AK.04 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.04')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompoks.length === 0) return <DocError message="Data FR.AK.04 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const hasTrueAnswer = Object.values(answers).some((a) => a === true)
  const td = { border: '1px solid #000', padding: '6px 8px' } as const

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.AK.04 BANDING ASESMEN</DocTitle>

      {/* Main Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '13px', background: '#fff' }}>
        <tbody>
          {/* Nama Asesi */}
          <tr>
            <td style={{ ...td, width: '25%' }}>Nama Asesi</td>
            <td colSpan={3} style={td}>: {header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>

          {/* Nama Asesor */}
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={td}>Nama Asesor {idx + 1}</td>
                <td colSpan={3} style={td}>: {asesor.nama?.toUpperCase() || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={td}>Nama Asesor</td>
              <td colSpan={3} style={td}>: {asesorList[0]?.nama?.toUpperCase() || ''}</td>
            </tr>
          )}

          {/* Tanggal Asesmen */}
          <tr>
            <td style={td}>Tanggal Asesmen</td>
            <td colSpan={3} style={td}>: {fmtTanggalId(header?.tanggalUji)}</td>
          </tr>

          {/* Header Row */}
          <tr>
            <td colSpan={2} style={{ ...td, fontWeight: 'bold' }}>
              Jawablah dengan Ya atau Tidak pertanyaan-pertanyaan berikut ini :
            </td>
            <td style={{ ...td, width: '10%', fontWeight: 'bold', textAlign: 'center' }}>YA</td>
            <td style={{ ...td, width: '10%', fontWeight: 'bold', textAlign: 'center' }}>TIDAK</td>
          </tr>

          {/* Questions */}
          {kelompoks.map((kelompok) =>
            kelompok.referensis.map((ref) => {
              const answer = answers[ref.id]
              return (
                <tr key={ref.id}>
                  <td
                    colSpan={2}
                    style={{ width: '95%', border: '1px solid #000', padding: '6px 8px', cursor: isSaving ? 'default' : 'pointer' }}
                    onClick={() => handleCellClick(ref.id)}
                  >
                    {ref.nama}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 30px', textAlign: 'center' }}>
                    <CustomCheckbox
                      checked={answer === true}
                      onChange={() => handleAnswerChange(ref.id, true)}
                      disabled={isSaving}
                      style={{ width: '5%', height: '18px', cursor: isSaving ? 'not-allowed' : 'pointer' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 30px', textAlign: 'center' }}>
                    <CustomCheckbox
                      checked={answer === false}
                      onChange={() => handleAnswerChange(ref.id, false)}
                      disabled={isSaving}
                      style={{ width: '5%', height: '18px', cursor: isSaving ? 'not-allowed' : 'pointer' }}
                    />
                  </td>
                </tr>
              )
            })
          )}

          {/* Skema Sertifikasi Info */}
          <tr>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '8px' }}>
              Banding ini diajukan atas Keputusan Asesmen yang dibuat terhadap Skema Sertifikasi (<del>KKNI</del>/Okupasi/<del>Klaster</del>) berikut :
              <br /><br />
              Skema Sertifikasi : {header?.jabatanKerja?.toUpperCase() || ''}<br />
              No. Skema Sertifikasi : {header?.nomorSkema?.toUpperCase() || ''}
            </td>
          </tr>

          {/* Alasan Banding */}
          <tr>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
              <div style={{ marginBottom: '8px' }}>Banding ini diajukan atas alasan sebagai berikut :</div>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                disabled={isSaving}
                placeholder="Tuliskan alasan banding..."
                style={{
                  width: '100%',
                  minHeight: '70px',
                  border: '1px solid #ccc',
                  padding: '8px',
                  fontSize: '13px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  resize: 'vertical',
                  cursor: isSaving ? 'not-allowed' : 'text',
                  background: isSaving ? '#f5f5f5' : '#fff',
                }}
              />
            </td>
          </tr>

          {/* Info */}
          <tr>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '8px' }}>
              Anda mempunyai hak mengajukan banding jika Anda menilai proses asesmen tidak sesuai SOP dan tidak memenuhi Prinsip Asesmen.
            </td>
          </tr>

          {/* Tanda Tangan — barcode asesi existing read-only */}
          <tr>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', minHeight: '80px' }}>
              <div>Tanda tangan Asesi : {header?.namaAsesi?.toUpperCase() || ''}</div>
              {asesiBarcode?.url && hasTrueAnswer ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '8px' }}>
                  <img src={asesiBarcode.url} alt="Tanda Tangan Asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                  <div style={{ fontSize: '11px', color: '#333' }}>Tanggal : {fmtTanggalId(asesiBarcode.tanggal)}</div>
                </div>
              ) : (
                <div style={{ marginTop: '8px' }}>
                  <br />
                  Tanggal : {fmtTanggalId(header?.tanggalUji)}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Centang hanya item yang dibandingkan; klik ulang untuk mengosongkan."
      />
    </div>
  )
}
