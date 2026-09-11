/**
 * Editor Revisi MUK — FR.IA.04.B (Observasi / Demonstrasi).
 * Tampilan = form FR.IA.04.B halaman asesi: varian BNSP (Ia04bPage: Ya/Tdk +
 * rekomendasi) atau varian KAN (Ia04bKANPage: skor 0-3 + rekapitulasi +
 * penyusun/validator + umpan balik) sesuai prop `kan`.
 * Hanya jawaban teks asesi yang direvisi (payload POST /ia04b tetap) —
 * skor/pencapaian & ttd ditampilkan read-only dari data existing.
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

interface Soal {
  id: number
  no: string
  jenis: string
  soal: string
  soal1: string
  soal2: string | null
  is_komentar: string | null
  jawaban?: string
  pencapaian?: boolean | number
  unit_kode?: string
}
interface Ia04bResponse {
  message: string
  data?: {
    dokumen: { id: number; nama_dokumen: string }
    soal: Soal[]
    rekomendasi?: { id: number; soal?: string; rekomendasi?: boolean }
    komentar?: string
    barcodes?: Barcodes
  }
}

const hdStyle = {
  background: BRANDING.primaryColor,
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
} as const

export function Ia04bEditor({ idIzin, onSaved, dokumenHeader, kan }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia04bResponse>(asesmenUrl(idIzin, 'ia04b'))

  const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    if (inner.barcodes) setBarcodes(inner.barcodes)
    const soal = inner.soal
    if (!soal) return
    const init: Record<number, string> = {}
    soal.forEach((s) => {
      if (s.jawaban) init[s.id] = s.jawaban
    })
    setJawaban(init)
  }, [data])

  const handleSave = async () => {
    const inner = data?.data
    if (!inner?.dokumen?.id) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia04b'), {
        dokumen_id: inner.dokumen.id,
        answers: inner.soal.map((s) => ({
          soal_id: s.id,
          jawaban: jawaban[s.id] || s.jawaban || '',
        })),
      })
      toast.showSuccess('FR.IA.04.B berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.04.B')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  const soalList = data?.data?.soal ?? []
  const dokumen = data?.data?.dokumen
  const rekomendasi = data?.data?.rekomendasi
  const komentar = data?.data?.komentar
  if (soalList.length === 0)
    return <DocError message="Data FR.IA.04.B tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const today = fmtTanggalId(new Date().toISOString())

  // Pencapaian read-only: Ya = boolean true / skor > 1; Tidak = false / 0.
  const isYa = (p?: boolean | number) => p === true || (typeof p === 'number' && p > 1)
  const isTidak = (p?: boolean | number) => p === false || p === 0
  const skorKan = (p?: boolean | number): number =>
    p === undefined || p === null ? -1 : typeof p === 'boolean' ? (p ? 3 : 0) : p

  // ===== Varian KAN =====
  if (kan) {
    const totalSkor = soalList.reduce((acc, s) => {
      const sk = skorKan(s.pencapaian)
      return acc + (sk > 0 ? sk : 0)
    }, 0)
    const jumlahSalah = soalList.filter((s) => skorKan(s.pencapaian) === 0).length
    const adaNilaiNol = jumlahSalah > 0
    const komentarAuto =
      jumlahSalah === 0
        ? 'Seluruh jawaban kompeten'
        : soalList
            .filter((s) => skorKan(s.pencapaian) === 0)
            .map((s) => `- No. ${s.no} - ${s.soal2 || s.soal}`)
            .join('\n')
    const komentarTampil = komentar || komentarAuto

    const kanTd: React.CSSProperties = { border: '1px solid #000', padding: '6px' }

    return (
      <div style={{ fontFamily: '"Open Sans",Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif', fontSize: '13px' }}>
        {/* Title */}
        <table width="100%" cellPadding={5} style={{ border: '0', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '0', fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD' }}>
                FR.IA.04.B {dokumen?.nama_dokumen || 'LEMBAR PERIKSA KEGIATAN TERSTRUKTUR'}
              </td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* Identitas */}
        <table width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '2px solid #000', background: '#fff' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '30%', verticalAlign: 'top', ...kanTd }}>Skema Sertifikasi (KKNI/Okupasi/Klaster)</td>
              <td style={{ width: '12%', ...kanTd }}>Judul</td>
              <td style={kanTd}>{header?.jabatanKerja?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={kanTd}>Nomor</td>
              <td style={kanTd}>{header?.nomorSkema?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={kanTd}>TUK</td>
              <td style={kanTd}>:</td>
              <td style={kanTd}>{header?.tuk?.toUpperCase() || '-'}</td>
            </tr>
            {asesorList.map((a, i) => (
              <tr key={a.id}>
                <td style={kanTd}>Nama Asesor {i + 1}</td>
                <td style={kanTd}>:</td>
                <td style={kanTd}>{a.nama?.toUpperCase() || '-'}</td>
              </tr>
            ))}
            <tr>
              <td style={kanTd}>Nama Asesi</td>
              <td style={kanTd}>:</td>
              <td style={kanTd}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={kanTd}>Tanggal</td>
              <td style={kanTd}>:</td>
              <td style={kanTd}>{today}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '12px' }}>*Coret yang tidak perlu</p>

        {/* Panduan Asesor */}
        <table width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', background: BRANDING.primaryColor, color: '#fff', border: '1px solid #000' }}>PANDUAN BAGI ASESOR</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', fontSize: '12px' }}>
                <ul style={{ margin: '4px 0 4px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '4px' }}>Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.</li>
                  <li style={{ marginBottom: '4px' }}>Penilaian dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dapat pula dilakukan untuk masing-masing kelompok pekerjaan.</li>
                  <li style={{ marginBottom: '4px' }}>Pertanyaan disampaikan oleh asesor pada saat asesi melakukan presentasi kegiatan terstruktur.</li>
                  <li style={{ marginBottom: '4px' }}>
                    Asesor menilai jawaban peserta uji berdasarkan jawaban yang diberikan. Penilaian dilakukan dengan memberikan tanda centang (✓) pada salah satu kolom skor penilaian 0, 1, 2, atau 3 sesuai dengan tingkat kesesuaian dan kelengkapan jawaban peserta, dengan ketentuan sebagai berikut:
                    <br />0 = Jawaban tidak sesuai, keliru, atau tidak menjawab
                    <br />1 = Jawaban sebagian benar, namun tidak lengkap/kurang tepat.
                    <br />2 = Jawaban benar dan sesuai, namun belum sepenuhnya lengkap.
                    <br />3 = Jawaban lengkap, tepat, runtut dan sesuai konteks
                  </li>
                  <li style={{ marginBottom: '4px' }}>Dibutuhkan jastifikasi profesional asesor untuk memutuskan hal ini.</li>
                  <li style={{ marginBottom: '4px' }}>Seluruh hasil penilaian dijumlahkan dan dicatat pada kolom Rekapitulasi Skor Penilaian Pertanyaan Lisan.</li>
                  <li style={{ marginBottom: '0' }}>Durasi presentasi yaitu 15 menit dan tanya jawab 15 menit.</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* Soal Table */}
        <table width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
          <tbody>
            <tr style={{ ...hdStyle, border: '1px solid #000', padding: '6px' }}>
              <td rowSpan={2} style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</td>
              <td colSpan={3} style={{ width: '14%', border: '1px solid #000', padding: '6px' }}>Aspek Penilaian</td>
              <td colSpan={4} style={{ width: '14%', border: '1px solid #000', padding: '6px' }}>Pencapaian</td>
            </tr>
            <tr style={{ ...hdStyle, border: '1px solid #000', padding: '6px' }}>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Lingkup Penyajian Proyek atau Kegiatan Terstruktur Lainnya</td>
              <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Daftar Pertanyaan</td>
              <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Kesesuaian dengan standar kompetensi kerja</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>0</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>1</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>2</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>3</td>
            </tr>
            {soalList.map((soal, idx) => {
              const sk = skorKan(soal.pencapaian)
              return (
                <tr key={soal.id}>
                  <td style={{ textAlign: 'center', verticalAlign: 'top', ...kanTd }}>{soal.no || idx + 1}</td>
                  <td style={{ verticalAlign: 'top', ...kanTd }}>{soal.soal}</td>
                  <td style={{ verticalAlign: 'top', ...kanTd }}>
                    <div>{soal.soal1}</div>
                    <p style={{ margin: '8px 0 4px 0', fontSize: '12px', fontWeight: 'bold' }}>Jawaban asesi:</p>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '12px' }}>{jawaban[soal.id] || '-'}</div>
                  </td>
                  <td style={{ verticalAlign: 'top', ...kanTd }}>Kode Unit : {soal.soal2 || soal.unit_kode || ''}</td>
                  {[0, 1, 2, 3].map((n) => (
                    <td key={n} style={{ textAlign: 'center', verticalAlign: 'middle', ...kanTd }}>
                      <CustomCheckbox checked={sk === n} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <br />

        {/* Penyusun dan Validator */}
        <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>PENYUSUN DAN VALIDATOR</h2>
        <table width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
          <tbody>
            <tr style={{ background: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ width: '15%', ...kanTd }}>Status</td>
              <td style={{ width: '8%', ...kanTd }}>No</td>
              <td style={kanTd}>Nama</td>
              <td style={{ width: '20%', ...kanTd }}>Nomor MET</td>
              <td style={{ width: '20%', ...kanTd }}>Tanda Tangan Dan Tanggal</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td rowSpan={2} style={kanTd}>Penyusun</td>
              <td style={{ textAlign: 'center', ...kanTd }}>1</td>
              <td style={kanTd}>{header?.namaPenyusun || ''}</td>
              <td style={kanTd}>{header?.noregPenyusun || ''}</td>
              <td style={{ height: '50px', verticalAlign: 'middle', textAlign: 'center', ...kanTd }}>
                {header?.barcodePenyusun ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={header.barcodePenyusun} style={{ height: '40px', width: '40px', objectFit: 'contain' }} alt="barcode penyusun" />
                    {header.tanggalPenyusun && (
                      <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(header.tanggalPenyusun)}</div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', ...kanTd }}>2</td>
              <td style={kanTd}></td>
              <td style={kanTd}></td>
              <td style={{ height: '50px', ...kanTd }}></td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td rowSpan={2} style={kanTd}>Validator</td>
              <td style={{ textAlign: 'center', ...kanTd }}>1</td>
              <td style={kanTd}>{header?.namaValidator || ''}</td>
              <td style={kanTd}>{header?.noregValidator || ''}</td>
              <td style={{ height: '50px', verticalAlign: 'middle', textAlign: 'center', ...kanTd }}>
                {header?.barcodeValidator ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={header.barcodeValidator} style={{ height: '40px', width: '40px', objectFit: 'contain' }} alt="barcode validator" />
                    {header.tanggalValidator && (
                      <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(header.tanggalValidator)}</div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center', ...kanTd }}>2</td>
              <td style={kanTd}></td>
              <td style={kanTd}></td>
              <td style={{ height: '50px', ...kanTd }}></td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* Rekapitulasi */}
        <table width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
          <tbody>
            <tr style={{ ...hdStyle, border: '1px solid #000', padding: '6px' }}>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                Rekapitulasi Skor Penilaian Pertanyaan IA04B <span style={{ fontWeight: 'normal' }}><br />(Penilaian = Jumlah skor seluruh butir soal)</span>
              </td>
            </tr>
            <tr style={{ textAlign: 'center' }}>
              <td style={{ fontWeight: 'bold', ...kanTd }}>Total Skor Penilaian</td>
              <td style={{ fontWeight: 'bold', height: '50px', ...kanTd, fontSize: '18px' }}>{totalSkor}</td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* Umpan Balik */}
        <table width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', ...kanTd }}>Umpan balik untuk asesi:</td>
              <td style={kanTd}>:</td>
              <td style={kanTd}>
                Aspek pengetahuan seluruh unit kompetensi yang diujikan (
                <strong>
                  {adaNilaiNol ? <s>tercapai</s> : 'tercapai'} / {adaNilaiNol ? 'belum tercapai' : <s>belum tercapai</s>}
                </strong>
                )* <br /><br />
                Tuliskan unit/elemen/KUK jika belum tercapai:
                {komentarTampil ? (
                  <div style={{ marginTop: '6px' }}>
                    <strong>Umpan Balik Asesor:</strong>
                    <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-line' }}>{komentarTampil}</p>
                  </div>
                ) : null}
              </td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3} style={kanTd}>Asesi :</td>
            </tr>
            <tr>
              <td style={{ width: '20%', ...kanTd }}>Nama</td>
              <td style={{ width: '5%', ...kanTd }}>:</td>
              <td style={kanTd}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td style={kanTd}>Tanda tangan/ Tanggal</td>
              <td style={kanTd}>:</td>
              <td style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center', ...kanTd }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesi.url} style={{ height: '50px', width: '50px', objectFit: 'contain' }} alt="barcode asesi" />
                    {barcodes.asesi.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(barcodes.asesi.tanggal)}</div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TTD Asesor */}
        {asesorList.map((a, i) => {
          const asesorBc = i === 0 ? barcodes?.asesor1 : barcodes?.asesor2
          return (
            <table key={a.id} width="100%" cellPadding={5} style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
              <tbody>
                <tr style={{ fontWeight: 'bold' }}>
                  <td colSpan={3} style={kanTd}>Asesor {asesorList.length > 1 ? i + 1 : ''} :</td>
                </tr>
                <tr>
                  <td style={{ width: '20%', ...kanTd }}>Nama</td>
                  <td style={{ width: '5%', ...kanTd }}>:</td>
                  <td style={kanTd}>{a.nama?.toUpperCase() || ''}</td>
                </tr>
                {a.noreg ? (
                  <tr>
                    <td style={kanTd}>No. Reg</td>
                    <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
                    <td style={kanTd}>{a.noreg || ''}</td>
                  </tr>
                ) : null}
                <tr>
                  <td style={kanTd}>Tanda tangan/ Tanggal</td>
                  <td style={kanTd}>:</td>
                  <td style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center', ...kanTd }}>
                    {asesorBc?.url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img src={asesorBc.url} style={{ height: '50px', width: '50px', objectFit: 'contain' }} alt={`QR ${a.nama || 'asesor'}`} />
                        {asesorBc.tanggal && (
                          <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(asesorBc.tanggal)}</div>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          )
        })}
        <br />

        <SaveBar
          isSaving={isSaving}
          onSave={handleSave}
          note={`${soalList.length} soal — hanya jawaban teks asesi yang direvisi; skor (0-3) & umpan balik tidak diubah.`}
        />
      </div>
    )
  }

  // ===== Varian BNSP =====
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>
        FR.IA.04.B&nbsp; {dokumen?.nama_dokumen || 'LEMBAR PERIKSA KEGIATAN TERSTRUKTUR'}
      </DocTitle>

      {/* Info Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '13px', background: '#ffffff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ background: '#ffffff' }}>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>
              Skema Sertifikasi (<del>KKNI</del>/Okupasi/<del>Klaster</del>)
            </td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.jabatanKerja?.toLocaleUpperCase() || ''}</td>
          </tr>
          <tr style={{ background: '#ffffff' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.nomorSkema?.toUpperCase() || ''}</td>
          </tr>
          <tr style={{ background: '#ffffff' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.tuk?.toLocaleUpperCase() || ''}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id} style={{ background: '#ffffff' }}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesor.nama?.toUpperCase() || ''}</td>
              </tr>
            ))
          ) : (
            <tr style={{ background: '#ffffff' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}</td>
            </tr>
          )}
          <tr style={{ background: '#ffffff' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr style={{ background: '#ffffff' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{today}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '12px', marginTop: '5px' }}>*Coret yang tidak perlu</div>

      {/* Panduan Bagi Asesor */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold' }}>
            <td>PANDUAN BAGI ASESOR</td>
          </tr>
          <tr>
            <td style={{ background: '#ffffffe', border: '1px solid #000', padding: '6px' }}>
              <ul style={{ margin: '4px 0 4px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '4px' }}>Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.</li>
                <li style={{ marginBottom: '4px' }}>Penilaian dapat dilakukan untuk keseluruhan unit kompetensi atau per kelompok pekerjaan.</li>
                <li style={{ marginBottom: '4px' }}>Pertanyaan disampaikan oleh asesor saat asesi melakukan presentasi.</li>
                <li style={{ marginBottom: '4px' }}>Pertanyaan untuk pemenuhan pencapaian 5 dimensi kompetensi.</li>
                <li style={{ marginBottom: '4px' }}>Isilah kolom lingkup penyajian proyek sesuai sektor/sub-sektor/profesi.</li>
                <li style={{ marginBottom: '0' }}>Berikan keputusan pencapaian berdasarkan kesimpulan jawaban asesi.</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Main Assessment Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          {/* Header Row 1 */}
          <tr style={{ ...hdStyle, border: '1px solid #000', padding: '6px' }}>
            <td rowSpan={2} style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</td>
            <td colSpan={3} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Aspek Penilaian</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Pencapaian</td>
          </tr>
          {/* Header Row 2 */}
          <tr style={{ ...hdStyle, border: '1px solid #000', padding: '6px' }}>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Lingkup Penyajian proyek atau kegiatan terstruktur lainnya</td>
            <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Daftar Pertanyaan</td>
            <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Kesesuaian dengan standar kompetensi kerja</td>
            <td style={{ width: '7%', border: '1px solid #000', padding: '6px' }}>Ya</td>
            <td style={{ width: '7%', border: '1px solid #000', padding: '6px' }}>Tdk</td>
          </tr>

          {/* Data Rows */}
          {soalList.map((item) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{item.no}</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{item.soal}</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                <div>{(item.soal1 ?? '').replace(/\r\n/g, ' ')}</div>
                <p style={{ margin: '8px 0 4px 0', fontSize: '12px', fontWeight: 'bold' }}>Jawaban asesi:</p>
                <textarea
                  value={jawaban[item.id] || ''}
                  onChange={(e) => !isSaving && setJawaban((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  disabled={isSaving}
                  placeholder="Jawaban..."
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    cursor: isSaving ? 'not-allowed' : 'text',
                    backgroundColor: '#fff',
                    resize: 'none',
                    overflow: 'hidden',
                    minHeight: '60px',
                    height: 'auto',
                  }}
                />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{(item.soal2 ?? '').replace(/\r\n/g, ' ')}</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={isYa(item.pencapaian)} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={isTidak(item.pencapaian)} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rekomendasi Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', fontWeight: 'bold', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
              {rekomendasi?.soal || 'Rekomendasi Asesor:'}
            </td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              Asesi telah memenuhi/belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan:<br /><br />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CustomCheckbox checked={rekomendasi?.rekomendasi === true} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                Kompeten
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CustomCheckbox checked={rekomendasi?.rekomendasi === false} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                Belum Kompeten
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Asesi Signature Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ fontWeight: 'bold' }}>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesi :</td>
          </tr>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
              {barcodes?.asesi?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <img
                    src={barcodes.asesi.url}
                    alt="Tanda Tangan Asesi"
                    style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                  />
                  {barcodes.asesi.tanggal && (
                    <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(barcodes.asesi.tanggal)}</div>
                  )}
                </div>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Asesor Signature Table */}
      {asesorList.map((asesor, idx) => {
        const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
        return asesorBarcode?.url ? (
          <table key={asesor.id} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesor {idx + 1} :</td>
              </tr>
              <tr>
                <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorBarcode.nama?.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img
                      src={asesorBarcode.url}
                      alt={`Tanda Tangan Asesor ${idx + 1}`}
                      style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                    />
                    {asesorBarcode.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(asesorBarcode.tanggal)}</div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ) : null
      })}

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note={`${soalList.length} soal — hanya jawaban teks asesi yang direvisi; pencapaian (Ya/Tdk) & rekomendasi tidak diubah.`}
      />
    </div>
  )
}
