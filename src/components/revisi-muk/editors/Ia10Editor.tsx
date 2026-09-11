/**
 * Editor Revisi MUK — FR.IA.10 (Klarifikasi Bukti Pihak Ketiga).
 * Tampilan = form FR.IA.10 halaman asesi (Ia10Page): identitas, panduan,
 * data pihak ketiga, pertanyaan Ya/Tidak (header abu-abu), essay + ttd
 * read-only (barcode existing, tanpa generate).
 * Payload persis editor sebelumnya: answers + essay_answers (grup 3 & 4) + data pengawas.
 */
import { useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
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
import { Barcodes, DocTitle, fmtTanggalId } from './bnsp'

interface ReferensiItem {
  id: number
  nama: string
  no: number
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
    barcodes?: Barcodes
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
interface AdditionalItem {
  id: number
  nama: string
  no: number
  jawaban: string
}

const emptyForm = { nama_pengawas: '', tempat_kerja: '', alamat: '', telepon: '' }

export function Ia10Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia10Response>(asesmenUrl(idIzin, 'ia10'))

  const [dokumenId, setDokumenId] = useState<number | undefined>(undefined)
  const [yaTidakList, setYaTidakList] = useState<YaTidakItem[]>([])
  const [essayList, setEssayList] = useState<EssayItem[]>([])
  const [additionalList, setAdditionalList] = useState<AdditionalItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    setDokumenId(inner.dokumen_id)
    if (inner.barcodes) setBarcodes(inner.barcodes)
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
          nama: item.nama,
          no: item.no,
          jawaban: savedEssay[String(item.id)] || '',
        }))
      )
    }
  }, [data])

  // Ya/Tidak toggle-null (handleYaChange/handleTidakChange Ia10Page).
  const handleYaChange = (id: number) => {
    if (isSaving) return
    setYaTidakList((prev) => prev.map((p) => (p.id === id ? { ...p, jawaban: p.jawaban === true ? null : true } : p)))
  }
  const handleTidakChange = (id: number) => {
    if (isSaving) return
    setYaTidakList((prev) => prev.map((p) => (p.id === id ? { ...p, jawaban: p.jawaban === false ? null : false } : p)))
  }

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

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []

  // Sel tanda tangan inline (persis Ia10Page): label + barcode mengambang kanan.
  const ttdCell = (label: string, bc?: { url: string; tanggal?: string } | null) => (
    <td style={{ border: '1px solid #000', padding: '6px' }}>
      <b>{label}</b>{' '}
      {bc?.url ? (
        <span style={{ float: 'right' }}>
          <img src={bc.url} alt="TTD" style={{ height: '40px' }} />
          {bc.tanggal && <span> {fmtTanggalId(bc.tanggal)}</span>}
        </span>
      ) : (
        <span style={{ float: 'right' }}>Tanggal: </span>
      )}
    </td>
  )

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.IA.10. &nbsp; KLARIFIKASI BUKTI PIHAK KETIGA</DocTitle>

      {/* Header Info Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>
              Skema Sertifikasi
              <br />
              <span style={{ fontSize: '11px' }}>(KKNI/Okupasi/Klaster)</span>
            </td>
            <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>
              {header?.jabatanKerja || '-'}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>
              {header?.nomorSkema || '-'}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>
              {header?.tuk || '-'}
            </td>
          </tr>
          {asesorList.map((asesor, idx) => (
            <tr key={asesor.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                Nama Asesor {asesorList.length > 1 ? idx + 1 : ''}
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                {asesor.nama?.toUpperCase() || ''}
                {asesor.noreg && ` (${asesor.noreg})`}
              </td>
            </tr>
          ))}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>
              {header?.namaAsesi?.toUpperCase() || '-'}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
              {header?.tanggalUji ? fmtTanggalId(header.tanggalUji) : fmtTanggalId(new Date().toISOString())}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>*Coret yang tidak perlu</div>
      <div style={{ fontSize: '11px', color: '#666', textAlign: 'right', marginBottom: '10px' }}><i>Informasi Rahasia</i></div>

      {/* Panduan */}
      <div style={{ border: '2px solid #000', marginBottom: '15px' }}>
        <div style={{ background: BRANDING.primaryColor, color: '#000', fontWeight: 'bold', padding: '6px' }}>
          PANDUAN BAGI ASESOR
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '10px' }}>
                1. Verifikasi pihak ketiga dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.
                <br /><br />
                2. Tentukan pihak ketiga yang akan dimintai verifikasi.
                <br /><br />
                3. Ajukan pertanyaan kepada pihak ketiga.
                <br /><br />
                4. Berikan penilaian kepada asesi berdasarkan verifikasi pihak ketiga.
                <br /><br />
                5. Pertanyaan/pernyataan dapat dikembangkan sesuai dengan konteks pekerjaan dan relasi.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Data Pihak */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>1. Nama Pengawas/Penyelia/Atasan/Orang Lain di Perusahaan :</b>
                <input
                  type="text"
                  value={form.nama_pengawas}
                  onChange={(e) => !isSaving && setForm((prev) => ({ ...prev, nama_pengawas: e.target.value }))}
                  disabled={isSaving}
                  style={{ flex: 1, padding: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>2. Tempat Kerja :</b>
                <input
                  type="text"
                  value={form.tempat_kerja}
                  onChange={(e) => !isSaving && setForm((prev) => ({ ...prev, tempat_kerja: e.target.value }))}
                  disabled={isSaving}
                  style={{ flex: 1, padding: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>3. Alamat :</b>
                <input
                  type="text"
                  value={form.alamat}
                  onChange={(e) => !isSaving && setForm((prev) => ({ ...prev, alamat: e.target.value }))}
                  disabled={isSaving}
                  style={{ flex: 1, padding: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>4. Telepon :</b>
                <input
                  type="text"
                  value={form.telepon}
                  onChange={(e) => !isSaving && setForm((prev) => ({ ...prev, telepon: e.target.value }))}
                  disabled={isSaving}
                  style={{ flex: 1, padding: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Pertanyaan Ya/Tidak */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <thead>
          <tr style={{ background: '#f0f0f0', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan</th>
            <th style={{ width: '60px', border: '1px solid #000', padding: '6px' }}>Ya</th>
            <th style={{ width: '60px', border: '1px solid #000', padding: '6px' }}>Tidak</th>
          </tr>
        </thead>
        <tbody>
          {yaTidakList.map((p) => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>- {p.pertanyaan}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={p.jawaban === true} onChange={() => handleYaChange(p.id)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={p.jawaban === false} onChange={() => handleTidakChange(p.id)} disabled={isSaving} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Essay + Tanda Tangan (satu tabel, persis Ia10Page) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          {essayList.map((e) => (
            <tr key={e.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <b>{e.pertanyaan}</b>
                <textarea
                  value={e.jawaban}
                  onChange={(ev) => !isSaving && setEssayList((prev) => prev.map((it) => (it.id === e.id ? { ...it, jawaban: ev.target.value } : it)))}
                  disabled={isSaving}
                  style={{ width: '100%', minHeight: '60px', marginTop: '4px', padding: '4px', border: '1px solid #ccc' }}
                />
              </td>
            </tr>
          ))}
          {additionalList.map((a) => (
            <tr key={a.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <b>{a.no}. {a.nama}</b>
                <textarea
                  value={a.jawaban || ''}
                  onChange={(ev) => !isSaving && setAdditionalList((prev) => prev.map((it) => (it.id === a.id ? { ...it, jawaban: ev.target.value } : it)))}
                  disabled={isSaving}
                  style={{ width: '100%', minHeight: '60px', marginTop: '4px', padding: '4px', border: '1px solid #ccc' }}
                />
              </td>
            </tr>
          ))}
          {/* Signature rows */}
          <tr>{ttdCell('Tanda Tangan Asesor 1:', barcodes?.asesor1)}</tr>
          {asesorList.length > 1 && <tr>{ttdCell('Tanda Tangan Asesor 2:', barcodes?.asesor2)}</tr>}
          <tr>{ttdCell('Tanda Tangan Asesi:', barcodes?.asesi)}</tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ fontSize: '10px', marginTop: '10px', color: '#666' }}>
        *Diadopsi dari template yang disediakan di Departemen Pendidikan dan Pelatihan, Australia.
        <br />
        Merancang alat asesmen untuk hasil yang berkualitas di VET. 2008
      </div>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Menyimpan jawaban Ya/Tidak, essay (grup 3 & 4), dan data pihak ketiga."
      />
    </div>
  )
}
