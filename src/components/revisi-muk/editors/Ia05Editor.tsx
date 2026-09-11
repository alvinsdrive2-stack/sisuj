/**
 * Editor Revisi MUK — FR.IA.05 (Pertanyaan Tertulis Pilihan Ganda).
 * Varian BNSP (Ia05Page): identitas, soal A-D (radio editable), lembar jawaban
 * + kunci (read-only), umpan balik (editable), penyusun/validator (read-only).
 * Varian KAN (Ia05KANPage): view-only dokumen (tanpa edit jawaban/umpan balik).
 * Payload persis editor sebelumnya: hanya soal terjawab dikirim, umpan_balik opsional.
 */
import { Fragment, useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { CustomRadio } from '@/components/ui/Radio'
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
import { Barcodes, fmtTanggalId } from './bnsp'

interface Soal {
  id: number
  no: number | string
  soal: string
  jawab_a?: string | null
  jawab_b?: string | null
  jawab_c?: string | null
  jawab_d?: string | null
  kunci_jawaban?: string | null
  jawaban_asesi: string | null
  unit?: string | { kode?: string } | null
  kuk?: string | { kode?: string } | null
}
interface Ia05Response {
  message: string
  data?: {
    dokumen: { id: number; nama_dokumen: string }
    soal: Soal[]
    umpan_balik?: string
    barcodes?: Barcodes
  }
}

type Pilihan = 'A' | 'B' | 'C' | 'D'
const PILIHAN: Pilihan[] = ['A', 'B', 'C', 'D']

const kodeOf = (u?: string | { kode?: string } | null) => (typeof u === 'string' ? u : u?.kode || '')

export function Ia05Editor({ idIzin, onSaved, dokumenHeader, kan }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia05Response>(asesmenUrl(idIzin, 'ia05'))

  const [jawaban, setJawaban] = useState<Record<number, Pilihan>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.soal) return
    const init: Record<number, Pilihan> = {}
    inner.soal.forEach((s) => {
      const j = (s.jawaban_asesi ?? '').toUpperCase()
      if ((PILIHAN as string[]).includes(j)) init[s.id] = j as Pilihan
    })
    setJawaban(init)
    setUmpanBalik(inner.umpan_balik ?? '')
    if (inner.barcodes) setBarcodes(inner.barcodes)
  }, [data])

  const handleSave = async () => {
    const inner = data?.data
    if (!inner?.dokumen?.id) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      const answers = inner.soal
        .filter((s) => jawaban[s.id])
        .map((s) => ({ soal_id: s.id, jawaban: jawaban[s.id] }))
      await saveDoc(asesmenUrl(idIzin, 'ia05'), {
        id_izin: idIzin,
        dokumen_id: inner.dokumen.id,
        answers,
        umpan_balik: umpanBalik || undefined,
      })
      toast.showSuccess('FR.IA.05 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.05')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  // Urut tampil persis halaman asesi (sort by nomor soal).
  const soalList = [...(data?.data?.soal ?? [])].sort(
    (a, b) => (parseInt(String(a.no)) || 0) - (parseInt(String(b.no)) || 0)
  )
  if (soalList.length === 0) return <DocError message="Data FR.IA.05 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const today = fmtTanggalId(new Date().toISOString())

  /* ==================== VARIAN KAN (view-only) ==================== */
  if (kan) {
    const jumlahBenar = soalList.filter((s) => (jawaban[s.id] || (s.jawaban_asesi ?? '')) === s.kunci_jawaban).length
    const jumlahSalah = soalList.length - jumlahBenar
    const ia05Dinilai = soalList.some((s) => jawaban[s.id] || s.jawaban_asesi)
    const ia05Kompeten = jumlahSalah <= 6
    const salahSoal = soalList.filter((s) => {
      const j = jawaban[s.id] || (s.jawaban_asesi ?? '')
      return j && j !== s.kunci_jawaban
    })
    const defaultUmpanBalik =
      salahSoal.length > 0
        ? salahSoal.map((s) => `- No. ${s.no} - Unit: ${kodeOf(s.unit) || '-'}`).join('\n')
        : 'Seluruh jawaban benar'
    const umpanTampil = umpanBalik || (ia05Dinilai ? defaultUmpanBalik : '')

    const kanTd = { border: '0.2px solid black', padding: '4px 6px' } as const
    const kanFont = '"Arial Narrow", Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif'

    const identitasTable = (
      <table style={{ border: '2px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...kanTd, width: '30%' }}>Skema Sertifikasi (KKNI/Okupasi/Klaster)</td>
            <td style={{ ...kanTd, width: '12%' }}>Judul</td>
            <td style={{ ...kanTd, width: '3%', textAlign: 'center' }}>:</td>
            <td style={{ ...kanTd, textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={kanTd}>Nomor</td>
            <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
            <td style={{ ...kanTd, textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={kanTd}>TUK</td>
            <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...kanTd, textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          {asesorList.map((a, i) => (
            <tr key={a.id || i}>
              <td style={kanTd}>Nama Asesor {asesorList.length > 1 ? i + 1 : ''}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ ...kanTd, textTransform: 'uppercase' }}>{a?.nama || '-'}</td>
            </tr>
          ))}
          <tr>
            <td style={kanTd}>Nama Asesi</td>
            <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...kanTd, textTransform: 'uppercase' }}>{header?.namaAsesi || '-'}</td>
          </tr>
          <tr>
            <td style={kanTd}>Tanggal</td>
            <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
            <td colSpan={2} style={kanTd}>{today}</td>
          </tr>
        </tbody>
      </table>
    )

    const panduan = (title: string, li: React.ReactNode[]) => (
      <>
        <div style={{ backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', padding: '4px 8px', fontSize: '11pt' }}>{title}</div>
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ border: 'none', fontSize: '11pt' }}>
                <b>Instruksi:</b>
                <ul style={{ margin: '4px 0 4px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                  {li.map((node, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{node}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
      </>
    )

    const penyusunValidator = (
      <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
        <tbody>
          <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
            <td style={{ ...kanTd, width: '15%' }}>Status</td>
            <td style={{ ...kanTd, width: '8%' }}>No</td>
            <td style={kanTd}>Nama</td>
            <td style={{ ...kanTd, width: '20%' }}>Nomor MET</td>
            <td style={{ ...kanTd, width: '25%' }}>Tanda Tangan Dan Tanggal</td>
          </tr>
          <tr style={{ fontWeight: 'bold' }}>
            <td rowSpan={2} style={kanTd}>PENYUSUN</td>
            <td style={{ ...kanTd, textAlign: 'center' }}>1</td>
            <td style={kanTd}>{header?.namaPenyusun || ''}</td>
            <td style={kanTd}>{header?.noregPenyusun || ''}</td>
            <td style={{ ...kanTd, height: '50px', verticalAlign: 'middle', textAlign: 'center' }}>
              {header?.barcodePenyusun ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <img src={header.barcodePenyusun} alt="barcode penyusun" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
                  {header.tanggalPenyusun && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(header.tanggalPenyusun)}</div>}
                </div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td style={{ ...kanTd, textAlign: 'center' }}>2</td>
            <td style={kanTd}></td>
            <td style={kanTd}></td>
            <td style={{ ...kanTd, height: '50px' }}></td>
          </tr>
          <tr style={{ fontWeight: 'bold' }}>
            <td rowSpan={2} style={kanTd}>VALIDATOR</td>
            <td style={{ ...kanTd, textAlign: 'center' }}>1</td>
            <td style={kanTd}>{header?.namaValidator || ''}</td>
            <td style={kanTd}>{header?.noregValidator || ''}</td>
            <td style={{ ...kanTd, height: '50px', verticalAlign: 'middle', textAlign: 'center' }}>
              {header?.barcodeValidator ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <img src={header.barcodeValidator} alt="barcode validator" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
                  {header.tanggalValidator && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(header.tanggalValidator)}</div>}
                </div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td style={{ ...kanTd, textAlign: 'center' }}>2</td>
            <td style={kanTd}></td>
            <td style={kanTd}></td>
            <td style={{ ...kanTd, height: '50px' }}></td>
          </tr>
        </tbody>
      </table>
    )

    return (
      <div style={{ fontFamily: kanFont, fontSize: '12pt' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD', marginBottom: '16px' }}>
          FR.IA.05. PERTANYAAN TERTULIS PILIHAN GANDA
        </div>

        {identitasTable}
        <p style={{ fontSize: '12px', margin: '4px 0' }}>*Coret yang tidak perlu</p>

        {panduan('PANDUAN BAGI ASESOR', [
          <>Pertanyaan pilihan ganda merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</>,
          <>
            Asesor menilai jawaban peserta uji berdasarkan jawaban yang diberikan. Penilaian dapat diisi dengan centang (✓) pada kolom jawaban benar atau jawaban salah, dengan ketentuan skor penilaian sebagai berikut:
            <br />0 = Jawaban Salah
            <br />1 = Jawaban Benar
          </>,
          <>Dibutuhkan justifikasi profesional asesor untuk memutuskan hal ini.</>,
        ])}
        {panduan('PANDUAN BAGI ASESI', [
          <>Pertanyaan pilihan ganda merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</>,
          <>Baca dengan teliti dan cermat pertanyaan Pilihan Ganda pada lembar soal.</>,
          <>Tuliskan jawaban Anda pada Lembar Jawaban Pertanyaan Pilihan Ganda.</>,
        ])}

        <table style={{ border: '2px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <td style={{ ...kanTd, textAlign: 'center', fontWeight: 'bold', width: '100px', color: '#fff', backgroundColor: BRANDING.primaryColor }}>KUK</td>
              <td colSpan={2} style={{ ...kanTd, fontWeight: 'bold', color: '#fff', backgroundColor: BRANDING.primaryColor }}>
                SOAL, Pilih Jawaban semua pertanyaan berikut (A / B / C / D) :
              </td>
            </tr>
          </thead>
          <tbody>
            {soalList.flatMap((soal) => {
              const cols: { key: Pilihan; label?: string | null }[] = [
                { key: 'A', label: soal.jawab_a },
                { key: 'B', label: soal.jawab_b },
                { key: 'C', label: soal.jawab_c },
                { key: 'D', label: soal.jawab_d },
              ]
              const optionRows = cols.map(({ key, label }) => (
                <tr key={`${soal.id}-${key}`}>
                  <td style={kanTd}></td>
                  <td style={{ ...kanTd, textAlign: 'center' }}>
                    <CustomRadio name={`soal-${soal.id}`} value={key} checked={jawaban[soal.id] === key} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                  </td>
                  <td style={kanTd}>&nbsp; {key.toLowerCase()}. {label}</td>
                </tr>
              ))
              return [
                <tr key={soal.id}>
                  <td style={{ ...kanTd, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#d58a94' }}>
                    {kodeOf(soal.unit)}<br />{kodeOf(soal.kuk) || ''}
                  </td>
                  <td style={{ ...kanTd, width: '40px', textAlign: 'center' }}>{soal.no}.</td>
                  <td style={kanTd}>{soal.soal}</td>
                </tr>,
                ...optionRows,
              ]
            })}
          </tbody>
        </table>
        <br />

        <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>PENYUSUN DAN VALIDATOR</h2>
        {penyusunValidator}
        <br /><br /><br />

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4F81BD' }}>FR.05.C. LEMBAR JAWABAN PERTANYAAN TERTULIS PILIHAN GANDA</h2>
        <br />
        {identitasTable}
        <p style={{ fontSize: '12px', margin: '4px 0' }}>*Coret yang tidak perlu</p>

        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr style={{ backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td colSpan={2} style={kanTd}>Lembar Jawaban</td>
              <td colSpan={2} style={kanTd}>Rekomendasi</td>
            </tr>
            <tr style={{ backgroundColor: '#d58a94', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ ...kanTd, width: '10%' }}>No</td>
              <td style={{ ...kanTd, width: '40%' }}>Jawaban</td>
              <td style={{ ...kanTd, width: '25%' }}>Benar</td>
              <td style={{ ...kanTd, width: '25%' }}>Salah</td>
            </tr>
            {soalList.map((soal) => {
              const hasAnswer = !!jawaban[soal.id]
              const isCorrect = jawaban[soal.id] === soal.kunci_jawaban
              return (
                <tr key={soal.id}>
                  <td style={{ ...kanTd, textAlign: 'center' }}>{soal.no}</td>
                  <td style={kanTd}>
                    {jawaban[soal.id] ? (
                      <>{jawaban[soal.id]} - {soal[`jawab_${jawaban[soal.id]!.toLowerCase()}` as 'jawab_a' | 'jawab_b' | 'jawab_c' | 'jawab_d'] || ''}</>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>Belum dijawab</span>
                    )}
                  </td>
                  <td style={{ ...kanTd, textAlign: 'center' }}>
                    <CustomCheckbox checked={hasAnswer && isCorrect} onChange={() => {}} disabled />
                  </td>
                  <td style={{ ...kanTd, textAlign: 'center' }}>
                    <CustomCheckbox checked={hasAnswer && !isCorrect} onChange={() => {}} disabled />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <br />

        <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', textAlign: 'center' }}>
          <tbody>
            <tr style={{ fontWeight: 'bold', backgroundColor: BRANDING.primaryColor, color: '#fff' }}>
              <td colSpan={2} style={{ ...kanTd, textAlign: 'center' }}>Rekapitulasi Penilaian Pertanyaan Pilihan Ganda</td>
            </tr>
            <tr>
              <td style={{ ...kanTd, fontWeight: 'bold', backgroundColor: BRANDING.primaryColor, color: '#fff' }}>Benar</td>
              <td style={{ ...kanTd, fontWeight: 'bold', backgroundColor: BRANDING.primaryColor, color: '#fff' }}>Salah</td>
            </tr>
            <tr>
              <td style={{ ...kanTd, textAlign: 'center', fontSize: '14pt' }}>{jumlahBenar}</td>
              <td style={{ ...kanTd, textAlign: 'center', fontSize: '14pt' }}>{jumlahSalah}</td>
            </tr>
          </tbody>
        </table>
        <br /><br />

        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ ...kanTd, fontWeight: 'bold', width: '20%' }}>Umpan balik untuk asesi:</td>
              <td style={{ ...kanTd, width: '5%' }}>:</td>
              <td style={kanTd}>
                Aspek pengetahuan seluruh unit kompetensi yang diujikan (<strong>{ia05Dinilai && !ia05Kompeten ? <s>tercapai</s> : 'tercapai'} / {ia05Dinilai && ia05Kompeten ? <s>belum tercapai</s> : 'belum tercapai'}</strong>)* <br /><br />Tuliskan unit/elemen/KUK jika belum tercapai:
                {umpanTampil ? (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Umpan Balik Asesor:</strong>
                    <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-line' }}>{umpanTampil}</p>
                  </div>
                ) : null}
              </td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3} style={kanTd}>Asesi :</td>
            </tr>
            <tr>
              <td style={{ ...kanTd, width: '20%' }}>Nama</td>
              <td style={{ ...kanTd, width: '5%' }}>:</td>
              <td style={kanTd}>{header?.namaAsesi || '-'}</td>
            </tr>
            <tr>
              <td style={kanTd}>Tanda tangan/ Tanggal</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
              <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesi.url} alt="barcode asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {barcodes.asesi.tanggal && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(barcodes.asesi.tanggal)}</div>}
                  </div>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
        {asesorList.map((a, idx) => {
          const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
          return (
            <table key={a.id || idx} style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
              <tbody>
                <tr style={{ fontWeight: 'bold' }}>
                  <td colSpan={3} style={kanTd}>Asesor {asesorList.length > 1 ? idx + 1 : ''} :</td>
                </tr>
                <tr>
                  <td style={{ ...kanTd, width: '20%' }}>Nama</td>
                  <td style={{ ...kanTd, width: '5%' }}>:</td>
                  <td style={kanTd}>{a?.nama || '-'}</td>
                </tr>
                {a.noreg !== undefined && (
                  <tr>
                    <td style={kanTd}>No. Reg</td>
                    <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
                    <td style={kanTd}>{a.noreg || ''}</td>
                  </tr>
                )}
                <tr>
                  <td style={kanTd}>Tanda tangan/ Tanggal</td>
                  <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
                  <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {asesorBarcode?.url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img src={asesorBarcode.url} alt="barcode asesor" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                        {asesorBarcode.tanggal && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(asesorBarcode.tanggal)}</div>}
                      </div>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          )
        })}

        <SaveBar
          isSaving={isSaving}
          onSave={handleSave}
          note="Varian KAN bersifat view-only — jawaban & umpan balik tidak diubah, simpan hanya menyegarkan data dokumen."
        />
      </div>
    )
  }

  /* ==================== VARIAN BNSP ==================== */
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* IDENTITAS Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi<br />(<del>KKNI</del>/Okupasi/<del>Klaster</del>)</td>
            <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{asesor.nama?.toUpperCase() || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}</td>
            </tr>
          )}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{today}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>*Coret yang tidak perlu</div>

      {/* SOAL Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold' }}>
            <td style={{ width: '160px', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>KUK</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>SOAL, Pilih Jawaban semua pertanyaan berikut (A / B / C / D) :</td>
          </tr>
          {soalList.map((s) => (
            <Fragment key={s.id}>
              <tr>
                <td style={{
                  background: '#d58a94',
                  color: '#000',
                  width: '160px',
                  textAlign: 'center',
                  border: '1px solid #000',
                  padding: '6px',
                  fontWeight: jawaban[s.id] ? 'bold' : 'normal',
                }}>
                  {kodeOf(s.unit) || ''}<br />{kodeOf(s.kuk) || ''}
                </td>
                <td style={{ width: '40px', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{s.no}.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{s.soal}</td>
              </tr>
              {PILIHAN.map((k) => (
                <tr key={`${s.id}-${k}`}>
                  <td></td>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isSaving ? 'default' : 'pointer' }} onClick={() => !isSaving && setJawaban((prev) => ({ ...prev, [s.id]: k }))}>
                      <CustomRadio
                        name={`soal-${s.id}`}
                        value={k}
                        checked={jawaban[s.id] === k}
                        onChange={() => {}}
                        disabled={isSaving}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>{k.toLowerCase()}. {s[`jawab_${k.toLowerCase()}` as 'jawab_a' | 'jawab_b' | 'jawab_c' | 'jawab_d'] ?? '-'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* FR.IA.05.C LEMBAR JAWABAN (read-only) */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>FR. IA.05.C. LEMBAR JAWABAN PERTANYAAN TERTULIS PILIHAN GANDA</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#f8f8f8' }}>
          <tbody>
            <tr>
              <th colSpan={2} style={{ background: BRANDING.primaryColor, color: 'white', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>Lembar Jawaban</th>
              <th colSpan={2} style={{ background: BRANDING.primaryColor, color: 'white', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>Rekomendasi</th>
            </tr>
            <tr>
              <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>No.</th>
              <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>Jawaban</th>
              <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>K</th>
              <th style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '5px' }}>BK</th>
            </tr>
            {soalList.map((soal) => {
              const isCorrect = soal.jawaban_asesi === soal.kunci_jawaban
              const hasAnswer = !!soal.jawaban_asesi
              return (
                <tr key={`grading-${soal.id}`}>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', backgroundColor: '#fff' }}>{soal.no}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', backgroundColor: '#fff' }}>
                    {soal.jawaban_asesi ? (
                      <span>{soal.jawaban_asesi} - {String(soal[`jawab_${soal.jawaban_asesi.toLowerCase()}` as 'jawab_a' | 'jawab_b' | 'jawab_c' | 'jawab_d'] || '')}</span>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>Belum dijawab</span>
                    )}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', backgroundColor: '#fff' }}>
                    <CustomCheckbox checked={hasAnswer && isCorrect} onChange={() => {}} disabled={true} />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', backgroundColor: '#fff' }}>
                    <CustomCheckbox checked={hasAnswer && !isCorrect} onChange={() => {}} disabled={true} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* FR.IA.05.B LEMBAR KUNCI (read-only) */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>FR. IA.05.B. LEMBAR KUNCI JAWABAN PERTANYAAN TERTULIS PILIHAN GANDA</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff', border: '2px solid #000' }}>
          <thead>
            <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Lembar Jawaban</th>
            </tr>
            <tr style={{ background: '#c28ea0', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>No.</th>
              <th style={{ width: '90%', border: '1px solid #000', padding: '6px' }}>Jawaban</th>
            </tr>
          </thead>
          <tbody>
            {soalList.map((soal) => (
              <tr key={`summary-${soal.id}`}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{soal.no}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>{soal.kunci_jawaban}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UMPAN BALIK UNTUK ASESI */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
              Umpan balik untuk asesi:
              <textarea
                value={umpanBalik}
                onChange={(e) => setUmpanBalik(e.target.value)}
                disabled={isSaving}
                placeholder="Tuliskan umpan balik untuk asesi..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  resize: 'vertical',
                  cursor: isSaving ? 'not-allowed' : 'text',
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* PENYUSUN DAN VALIDATOR Table */}
      <h2 style={{ fontSize: '14px', marginBottom: '10px' }}>PENYUSUN DAN VALIDATOR</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ width: '140px', border: '1px solid #000', padding: '6px', backgroundColor: '#fff' }}>Status</th>
            <th style={{ width: '40px', border: '1px solid #000', padding: '6px', backgroundColor: '#fff' }}>No</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#fff' }}>Nama</th>
            <th style={{ width: '180px', border: '1px solid #000', padding: '6px', backgroundColor: '#fff' }}>Nomor MET</th>
            <th style={{ width: '180px', border: '1px solid #000', padding: '6px', backgroundColor: '#fff' }}>Tanda Tangan Dan Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Penyusun</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaPenyusun || '-'}</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.noregPenyusun || '-'}</td>
            <td style={{ height: '80px', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
              {header?.barcodePenyusun ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <img src={header.barcodePenyusun} alt="QR Penyusun" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  {header.tanggalPenyusun && <span style={{ fontSize: '11px' }}>{fmtTanggalId(header.tanggalPenyusun)}</span>}
                </div>
              ) : '-'}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Validator</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaValidator || '-'}</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.noregValidator || '-'}</td>
            <td style={{ height: '80px', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
              {header?.barcodeValidator ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <img src={header.barcodeValidator} alt="QR Validator" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  {header.tanggalValidator && <span style={{ fontSize: '11px' }}>{fmtTanggalId(header.tanggalValidator)}</span>}
                </div>
              ) : '-'}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
          </tr>
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note={`${soalList.filter((s) => jawaban[s.id]).length} dari ${soalList.length} soal terjawab — soal tanpa jawaban tidak diubah.`}
      />
    </div>
  )
}
