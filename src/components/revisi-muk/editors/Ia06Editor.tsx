/**
 * Editor Revisi MUK — FR.IA.06 (Lembar Jawaban Pertanyaan Tertulis Esai).
 * Varian BNSP (Ia06Page): jawaban + skor 0-3 editable, umpan balik editable,
 * penyusun/validator kosong persis halaman asesi.
 * Varian KAN (Ia06KANPage): view-only (jawaban/skor/umpan balik tampil apa adanya),
 * penyusun/validator terisi dari dokumenHeader.
 * Backend membaca jawaban+skor via array_key_exists → SELALU kirim keduanya
 * (jawaban string, skor 0..3 atau null), meniru Ia06Page.
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
import { Barcodes, fmtTanggalId } from './bnsp'

interface SoalEsai {
  id: number
  no: string
  unit_kode: string
  kuk_kode: string
  soal: string
  jawaban?: string
  skor?: number
}
interface Ia06Response {
  message: string
  data?: {
    dokumen?: { id: number; nama_dokumen?: string } | null
    soal_list?: SoalEsai[]
    umpan_balik?: string
    barcodes?: Barcodes
  }
}

export function Ia06Editor({ idIzin, onSaved, dokumenHeader, kan }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia06Response>(asesmenUrl(idIzin, 'ia06'))

  const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [skor, setSkor] = useState<Record<number, number | null>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    const soalList = inner?.soal_list
    if (!soalList) return
    const j: Record<number, string> = {}
    const s: Record<number, number | null> = {}
    soalList.forEach((soal) => {
      if (soal.jawaban) j[soal.id] = soal.jawaban
      s[soal.id] = soal.skor ?? null
    })
    setJawaban(j)
    setSkor(s)
    setUmpanBalik(inner?.umpan_balik ?? '')
    if (inner.barcodes) setBarcodes(inner.barcodes)
  }, [data])

  const handleSave = async () => {
    const soalList = data?.data?.soal_list ?? []
    if (soalList.length === 0) {
      toast.showWarning('Data soal belum termuat')
      return
    }
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        // dokumen_id wajib di backend — fallback 0 mirip Ia06Page
        dokumen_id: data?.data?.dokumen?.id ?? 0,
        // selalu kirim jawaban + skor (backend pakai array_key_exists)
        answers: soalList.map((s) => ({
          soal_id: s.id,
          jawaban: jawaban[s.id] || '',
          skor: skor[s.id] ?? null,
        })),
        umpan_balik: umpanBalik,
        unit_elemen_kuk: null,
      }
      await saveDoc(asesmenUrl(idIzin, 'ia06'), payload)
      toast.showSuccess('FR.IA.06 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.06')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  const soalList = data?.data?.soal_list ?? []
  if (soalList.length === 0) return <DocError message="Data FR.IA.06 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const today = fmtTanggalId(new Date().toISOString())

  const totalSkor = Object.values(skor).reduce<number>((a, b) => a + (b || 0), 0)

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

  const skorLegenda = (
    <>
      <br />0 = Jawaban tidak sesuai, keliru atau tidak menjawab.
      <br />1 = Jawaban sebagian benar, namun tidak lengkap/ kurang tepat.
      <br />2 = Jawaban benar dan sesuai, namun belum sepenuhnya lengkap.
      <br />3 = Jawaban lengkap, tepat, runtut dan sesuai konteks.
    </>
  )

  const soalTable = (
    <table style={{ border: '2px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
      <tbody>
        <tr>
          <td style={{ ...kanTd, width: '100px', textAlign: 'center', backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', padding: '4px 8px', fontSize: '11pt' }}>KUK</td>
          <td colSpan={2} style={{ ...kanTd, textAlign: 'center', backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', padding: '4px 8px', fontSize: '11pt' }}>SOAL ESAI</td>
        </tr>
        {soalList.map((soal, idx) => (
          <tr key={soal.id}>
            <td style={{ ...kanTd, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#d58a94' }}>
              {soal.unit_kode && <>{soal.unit_kode}<br /></>}
              {soal.kuk_kode || ''}
            </td>
            <td style={{ ...kanTd, width: '40px', textAlign: 'center' }}>{idx + 1}.</td>
            <td style={kanTd}>{soal.soal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const ttdAsesiCell = (showFallback: boolean) => (
    <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
      {barcodes?.asesi?.url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <img src={barcodes.asesi.url} alt="barcode asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
          {barcodes.asesi.tanggal && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(barcodes.asesi.tanggal)}</div>}
        </div>
      ) : showFallback ? (
        <span style={{ color: '#999' }}>Belum ditandatangani</span>
      ) : null}
    </td>
  )

  const ttdAsesorTables = (showFallback: boolean) =>
    asesorList.map((a, idx) => {
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
              {asesorBarcode?.url ? (
                <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={asesorBarcode.url} alt="barcode asesor" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {asesorBarcode.tanggal && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(asesorBarcode.tanggal)}</div>}
                  </div>
                </td>
              ) : showFallback ? (
                <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <span style={{ color: '#999' }}>Belum ditandatangani</span>
                </td>
              ) : (
                <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}></td>
              )}
            </tr>
          </tbody>
        </table>
      )
    })

  /* ==================== VARIAN KAN (view-only) ==================== */
  if (kan) {
    const kompeten = soalList.length > 0 && soalList.every((s) => (skor[s.id] ?? 0) > 0)
    const semuaDiskor = soalList.length > 0 && soalList.every((s) => skor[s.id] !== undefined && skor[s.id] !== null)
    const salahSoal = soalList.filter((s) => skor[s.id] === 0)
    const defaultUmpanBalik =
      salahSoal.length > 0
        ? salahSoal.map((s, i) => `- No. ${s.no || i + 1} - KUK: ${s.unit_kode || ''}${s.kuk_kode ? ` / ${s.kuk_kode}` : ''}`).join('\n')
        : 'Seluruh jawaban benar'
    const umpanTampil = umpanBalik || (semuaDiskor ? defaultUmpanBalik : '')

    return (
      <div style={{ fontFamily: kanFont, fontSize: '12pt' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD', marginBottom: '16px' }}>
          FR.IA.06. LEMBAR JAWABAN PERTANYAAN TERTULIS ESAI
        </div>

        {identitasTable}
        <p style={{ fontSize: '12px', margin: '4px 0' }}>*Coret yang tidak perlu</p>

        {panduan('PANDUAN BAGI ASESOR', [
          <>Pertanyaan esai merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</>,
          <>Asesor menilai jawaban peserta uji berdasarkan jawaban yang diberikan. Penilaian dilakukan dengan memberikan tanda centang pada salah satu kolom skor penilaian 0, 1, 2, atau 3 sesuai dengan tingkat kesesuaian dan kelengkapan jawaban peserta, dengan ketentuan sebagai berikut:{skorLegenda}</>,
          <>Dibutuhkan jastifikasi profesional asesor untuk memutuskan hal ini.</>,
          <>Seluruh hasil penilaian di jumlahkan dan di catat pada kolom Rekapitulasi Skor Penilaian Pertanyaan Esai.</>,
        ])}
        {panduan('PANDUAN BAGI ASESI', [
          <>Pertanyaan esai merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</>,
          <>Baca dengan teliti dan cermat pertanyaan esai pada lembar soal.</>,
          <>Tuliskan jawaban Anda pada Lembar Jawaban Pertanyaan Tertulis Esai.</>,
        ])}

        {soalTable}
        <br />

        <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>PENYUSUN DAN VALIDATOR</h2>
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
        <br /><br /><br />

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4F81BD' }}>FR.IA.06. LEMBAR JAWABAN PERTANYAAN TERTULIS ESAI</h2>
        {identitasTable}
        <p style={{ fontSize: '12px', margin: '4px 0' }}>*Coret yang tidak perlu</p>

        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr style={{ backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td rowSpan={2} style={kanTd}>KUK</td>
              <td rowSpan={2} colSpan={2} style={kanTd}>JAWABAN SOAL ESAI</td>
              <td colSpan={4} style={kanTd}>Skor Penilaian</td>
            </tr>
            <tr style={{ backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ ...kanTd, width: '5%' }}>0</td>
              <td style={{ ...kanTd, width: '5%' }}>1</td>
              <td style={{ ...kanTd, width: '5%' }}>2</td>
              <td style={{ ...kanTd, width: '5%' }}>3</td>
            </tr>
            {soalList.map((soal, idx) => (
              <tr key={soal.id}>
                <td style={{ ...kanTd, textAlign: 'center', backgroundColor: '#d58a94', width: '15%' }}>{idx + 1}</td>
                <td style={{ ...kanTd, width: '5%', textAlign: 'center', backgroundColor: '#d58a94' }}>{idx + 1}</td>
                <td style={{ ...kanTd, textAlign: 'left' }}>
                  {jawaban[soal.id] ? (
                    <div style={{ marginTop: '4px', padding: '4px', border: '1px dashed #999', background: '#f9f9f9' }}>
                      <b>Jawaban Asesi:</b><br />{jawaban[soal.id]}
                    </div>
                  ) : null}
                </td>
                {[0, 1, 2, 3].map((n) => (
                  <td key={n} style={{ ...kanTd, textAlign: 'center', verticalAlign: 'middle' }}>
                    <CustomCheckbox checked={skor[soal.id] === n} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <br />

        <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', textAlign: 'center' }}>
          <tbody>
            <tr style={{ fontWeight: 'bold', backgroundColor: BRANDING.primaryColor, color: '#fff' }}>
              <td colSpan={2} style={{ ...kanTd, textAlign: 'center' }}>
                Rekapitulasi Skor Penilaian Pertanyaan IA06<br />
                <span style={{ fontWeight: 'normal' }}>( Penilaian = Jumlah skor seluruh butir soal)</span>
              </td>
            </tr>
            <tr>
              <td style={{ ...kanTd, textAlign: 'center', fontWeight: 'bold', width: '50%' }}>Total Skor Penilaian</td>
              <td style={{ ...kanTd, textAlign: 'center', width: '50%', fontSize: '14pt' }}>{totalSkor}</td>
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
                Aspek pengetahuan seluruh unit kompetensi yang diujikan (<strong>{!kompeten && semuaDiskor ? <s>tercapai</s> : 'tercapai'} / {kompeten ? <s>belum tercapai</s> : 'belum tercapai'}</strong>)* <br /><br />Tuliskan unit/elemen/KUK jika belum tercapai: ...
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
              {ttdAsesiCell(false)}
            </tr>
          </tbody>
        </table>
        {ttdAsesorTables(false)}

        <SaveBar
          isSaving={isSaving}
          onSave={handleSave}
          note="Varian KAN bersifat view-only — jawaban, skor & umpan balik tidak diubah, simpan hanya menyegarkan data dokumen."
        />
      </div>
    )
  }

  /* ==================== VARIAN BNSP ==================== */
  return (
    <div style={{ fontFamily: kanFont, fontSize: '12pt' }}>
      <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD', marginBottom: '16px' }}>
        FR.IA.06C. LEMBAR JAWABAN PERTANYAAN TERTULIS ESAI
      </div>

      {identitasTable}
      <p style={{ fontSize: '12px', margin: '4px 0' }}>*Coret yang tidak perlu</p>

      {panduan('PANDUAN BAGI ASESOR', [
        <>Pertanyaan pilihan ganda merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</>,
        <>Asesor menilai jawaban peserta uji berdasarkan jawaban yang diberikan. Penilaian dilakukan dengan memberikan tanda centang (✓) pada salah satu kolom skor penilaian 0, 1, 2, atau 3 sesuai dengan tingkat kesesuaian dan kelengkapan jawaban peserta, dengan ketentuan sebagai berikut:{skorLegenda}</>,
        <>Dibutuhkan jastifikasi profesional asesor untuk memutuskan hal ini.</>,
        <>Seluruh hasil penilaian di jumlahkan dan di catat pada kolom Rekapitulasi Skor Penilaian Pertanyaan Esai.</>,
      ])}
      {panduan('PANDUAN BAGI ASESI', [
        <>Pertanyaan esai merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</>,
        <>Baca dengan teliti dan cermat pertanyaan esai pada lembar soal.</>,
        <>Tuliskan jawaban Anda pada Lembar Jawaban Pertanyaan Tertulis Esai.</>,
      ])}

      {soalTable}
      <br />

      {/* PENYUSUN DAN VALIDATOR — kosong, persis Ia06Page */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>PENYUSUN DAN VALIDATOR</h2>
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
            <td style={kanTd}></td>
            <td style={kanTd}></td>
            <td style={{ ...kanTd, height: '50px' }}></td>
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
            <td style={kanTd}></td>
            <td style={kanTd}></td>
            <td style={{ ...kanTd, height: '50px' }}></td>
          </tr>
          <tr>
            <td style={{ ...kanTd, textAlign: 'center' }}>2</td>
            <td style={kanTd}></td>
            <td style={kanTd}></td>
            <td style={{ ...kanTd, height: '50px' }}></td>
          </tr>
        </tbody>
      </table>
      <br /><br /><br />

      <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4F81BD' }}>FR.IA.06C. LEMBAR JAWABAN PERTANYAAN TERTULIS ESAI</h2>
      {identitasTable}
      <p style={{ fontSize: '12px', margin: '4px 0' }}>*Coret yang tidak perlu</p>

      <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
        <tbody>
          <tr style={{ backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <td rowSpan={2} style={kanTd}>KUK</td>
            <td rowSpan={2} colSpan={2} style={kanTd}>JAWABAN SOAL ESAI</td>
            <td colSpan={4} style={kanTd}>Skor Penilaian</td>
          </tr>
          <tr style={{ backgroundColor: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <td style={{ ...kanTd, width: '5%' }}>0</td>
            <td style={{ ...kanTd, width: '5%' }}>1</td>
            <td style={{ ...kanTd, width: '5%' }}>2</td>
            <td style={{ ...kanTd, width: '5%' }}>3</td>
          </tr>
          {soalList.map((soal, idx) => (
            <tr key={soal.id}>
              <td style={{ ...kanTd, textAlign: 'center', backgroundColor: '#d58a94', width: '15%' }}>{idx + 1}</td>
              <td style={{ ...kanTd, width: '5%', textAlign: 'center', backgroundColor: '#d58a94' }}>{idx + 1}</td>
              <td style={{ ...kanTd, textAlign: 'left' }}>
                <textarea
                  style={{ width: '100%', border: '1px solid #000', padding: '4px', marginTop: '4px', minHeight: '60px', fontSize: '11pt' }}
                  value={jawaban[soal.id] || ''}
                  onChange={(e) => !isSaving && setJawaban((prev) => ({ ...prev, [soal.id]: e.target.value }))}
                  disabled={isSaving}
                  placeholder="Tulis jawaban Anda di sini..."
                />
              </td>
              {[0, 1, 2, 3].map((n) => (
                <td key={n} style={{ ...kanTd, textAlign: 'center', verticalAlign: 'middle' }}>
                  <CustomCheckbox
                    checked={skor[soal.id] === n}
                    onChange={() => !isSaving && setSkor((prev) => ({ ...prev, [soal.id]: prev[soal.id] === n ? null : n }))}
                    disabled={isSaving}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <br />

      <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', textAlign: 'center' }}>
        <tbody>
          <tr style={{ fontWeight: 'bold', backgroundColor: BRANDING.primaryColor, color: '#fff' }}>
            <td colSpan={2} style={{ ...kanTd, textAlign: 'center' }}>
              Rekapitulasi Skor Penilaian Pertanyaan IA06<br />
              <span style={{ fontWeight: 'normal' }}>( Penilaian = Jumlah skor seluruh butir soal)</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...kanTd, textAlign: 'center', fontWeight: 'bold', width: '50%' }}>Total Skor Penilaian</td>
            <td style={{ ...kanTd, textAlign: 'center', width: '50%', fontSize: '14pt' }}>{totalSkor}</td>
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
              Aspek pengetahuan seluruh unit kompetensi yang diujikan (tercapai / belum tercapai)* <br /><br />Tuliskan unit/elemen/KUK jika belum tercapai:
              <textarea
                style={{ width: '100%', border: '1px solid #000', padding: '8px', minHeight: '60px', fontSize: '12pt', marginTop: '8px' }}
                value={umpanBalik}
                onChange={(e) => setUmpanBalik(e.target.value)}
                disabled={isSaving}
                placeholder="Tulis umpan balik..."
              />
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
            {ttdAsesiCell(true)}
          </tr>
        </tbody>
      </table>
      {ttdAsesorTables(true)}

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Semua jawaban + skor selalu dikirim ulang saat simpan (backend membaca keduanya)."
      />
    </div>
  )
}
