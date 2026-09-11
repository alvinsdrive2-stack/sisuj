/**
 * Editor Revisi MUK — FR.AK.02 (Pencatatan Penilaian Bukti / Fragemen Antara Asesor).
 * Varian BNSP (Ak02Page): matriks bukti 7 kolom per unit (editable), rekomendasi
 * Kompeten/Belum kompeten, tindak lanjut + komentar, ttd barcode read-only.
 * Varian KAN (Ak02KANPage): view-only — matriks read-only + rekapitulasi nilai
 * dari endpoint kan-nilai (tanpa edit jawaban/skor).
 * Payload persis editor sebelumnya: answers 7 kolom + is_kompeten + tindak_lanjut + komentar.
 */
import { Fragment, useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { API_BASE_URL } from '@/config/api'
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

interface UnitKompetensiAPI {
  id: number
  kode: string
  nama: string
  observasi: boolean
  portofolio: boolean
  pertanyaan_wawancara: boolean
  pertanyaan_lisan: boolean
  pertanyaan_tertulis: boolean
  proyek_kerja: boolean
  lainnya?: boolean
}
interface Ak02Response {
  message: string
  data?: {
    data_unit_kompetensi?: UnitKompetensiAPI[]
    is_kompeten?: boolean
    isLulus?: boolean
    isTidakLulus?: boolean
    tindak_lanjut?: string
    komentar?: string
    barcodes?: Barcodes
    total_skor_dit?: number | null
    total_skor_pilihan_ganda?: number | null
    total_skor_esai?: number | null
  }
}

interface KanNilaiData {
  jumlah_soal_dit?: number; total_skor_dit?: number; bobot_dit?: number; maks_skor_dit?: number; nilai_skor_dit?: number
  jumlah_soal_pg?: number; total_skor_pg?: number; bobot_pg?: number; maks_skor_pg?: number; nilai_skor_pg?: number
  jumlah_soal_esai?: number; total_skor_esai?: number; bobot_esai?: number; maks_skor_esai?: number; nilai_skor_esai?: number
  skor_nilai_akhir?: number; threshold_passing?: number; is_kompeten?: boolean; is_lulus?: boolean
}

interface EvidenceCheck {
  observasi: boolean
  portofolio: boolean
  pertanyaan_wawancara: boolean
  pertanyaan_lisan: boolean
  pertanyaan_tertulis: boolean
  proyek_kerja: boolean
  lainnya: boolean
}

const EVIDENCE_KEYS = [
  'observasi',
  'portofolio',
  'pertanyaan_wawancara',
  'pertanyaan_lisan',
  'pertanyaan_tertulis',
  'proyek_kerja',
  'lainnya',
] as const
type EvidenceKey = typeof EVIDENCE_KEYS[number]

// Header miring varian BNSP (kelompok 2 baris utk Pernyataan Pihak Ketiga + Wawancara)
const ROTATED_HEADERS: string[][] = [
  ['Observasi Demonstrasi'],
  ['Portofolio'],
  ['Pernyataan Pihak Ketiga', 'Pertanyaan wawancara'],
  ['Pertanyaan Lisan'],
  ['Pertanyaan Tertulis'],
  ['Proyek Kerja'],
  ['Lainnya'],
]
const EVIDENCE_HEADERS: Record<EvidenceKey, string> = {
  observasi: 'Observasi demonstrasi',
  portofolio: 'Portofolio',
  pertanyaan_wawancara: 'Pernyataan Pihak Ketiga Pertanyaan Wawancara',
  pertanyaan_lisan: 'Pertanyaan lisan',
  pertanyaan_tertulis: 'Pertanyaan tertulis',
  proyek_kerja: 'Proyek kerja',
  lainnya: 'Lainnya',
}

export function Ak02Editor({ idIzin, onSaved, dokumenHeader, kan }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak02Response>(asesmenUrl(idIzin, 'ak02'))

  const [units, setUnits] = useState<UnitKompetensiAPI[]>([])
  const [checks, setChecks] = useState<Record<number, EvidenceCheck>>({})
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [tindakLanjut, setTindakLanjut] = useState('')
  const [komentar, setKomentar] = useState('')
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [totalSkorDit, setTotalSkorDit] = useState('')
  const [totalSkorPg, setTotalSkorPg] = useState('')
  const [totalSkorEsai, setTotalSkorEsai] = useState('')
  const [kanNilai, setKanNilai] = useState<KanNilaiData | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner?.data_unit_kompetensi) return
    setUnits(inner.data_unit_kompetensi)
    const init: Record<number, EvidenceCheck> = {}
    inner.data_unit_kompetensi.forEach((unit) => {
      init[unit.id] = {
        observasi: unit.observasi,
        portofolio: unit.portofolio,
        pertanyaan_wawancara: unit.pertanyaan_wawancara,
        pertanyaan_lisan: unit.pertanyaan_lisan,
        pertanyaan_tertulis: unit.pertanyaan_tertulis,
        proyek_kerja: unit.proyek_kerja,
        lainnya: unit.lainnya ?? false,
      }
    })
    setChecks(init)
    if (inner.is_kompeten === true) setIsKompeten(true)
    else if (inner.is_kompeten === false) setIsKompeten(false)
    else if (inner.isLulus === true) setIsKompeten(true)
    else if (inner.isTidakLulus === true) setIsKompeten(false)
    else setIsKompeten(null)
    setTindakLanjut(inner.tindak_lanjut || '')
    setKomentar(inner.komentar || '')
    if (inner.barcodes) setBarcodes(inner.barcodes)
    if (inner.total_skor_dit !== null && inner.total_skor_dit !== undefined) setTotalSkorDit(String(inner.total_skor_dit))
    if (inner.total_skor_pilihan_ganda !== null && inner.total_skor_pilihan_ganda !== undefined) setTotalSkorPg(String(inner.total_skor_pilihan_ganda))
    if (inner.total_skor_esai !== null && inner.total_skor_esai !== undefined) setTotalSkorEsai(String(inner.total_skor_esai))
  }, [data])

  // Total skor + nilai KAN dari endpoint kan-nilai (rekap IA04B/IA05/IA06) — read-only.
  useEffect(() => {
    if (!kan) return
    let cancelled = false
    ;(async () => {
      try {
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${API_BASE_URL}/asesmen/${idIzin}/kan-nilai`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const body = await res.json()
        if (!cancelled && body.message === 'OK' && body.data) setKanNilai(body.data as KanNilaiData)
      } catch {
        /* display-only — abaikan */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [kan, idIzin])

  const setCheck = (unitId: number, key: keyof EvidenceCheck, v: boolean) =>
    setChecks((prev) => ({
      ...prev,
      [unitId]: { ...prev[unitId], [key]: v },
    }))

  const handleSave = async () => {
    if (isKompeten === null) {
      toast.showWarning('Pilih dulu hasil penilaian (Kompeten / Belum Kompeten)')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak02'), {
        answers: units.map((unit) => ({
          id_unit_kompetensi: unit.id,
          observasi: checks[unit.id]?.observasi || false,
          portofolio: checks[unit.id]?.portofolio || false,
          pertanyaan_wawancara: checks[unit.id]?.pertanyaan_wawancara || false,
          pertanyaan_lisan: checks[unit.id]?.pertanyaan_lisan || false,
          pertanyaan_tertulis: checks[unit.id]?.pertanyaan_tertulis || false,
          proyek_kerja: checks[unit.id]?.proyek_kerja || false,
          lainnya: checks[unit.id]?.lainnya || false,
        })),
        is_kompeten: isKompeten,
        tindak_lanjut: tindakLanjut,
        komentar: komentar,
      })
      toast.showSuccess('FR.AK.02 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.02')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (units.length === 0) return <DocError message="Data FR.AK.02 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []

  const kanTd = { border: '0.2px solid black', padding: '4px 6px' } as const
  const kanFont = '"Arial Narrow", Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif'
  const hdDok = { backgroundColor: BRANDING.primaryColor, color: '#fff' } as const

  const barcodeCell = (bc?: { url?: string; tanggal?: string } | null, nama?: string) =>
    bc?.url ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <img src={bc.url} alt={`Tanda Tangan ${nama || ''}`} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
        {bc.tanggal && <div style={{ fontSize: '11px', color: '#333' }}>{fmtTanggalId(bc.tanggal)}</div>}
      </div>
    ) : null

  /* ==================== VARIAN KAN (view-only) ==================== */
  if (kan) {
    const numDit = parseFloat(totalSkorDit) || 0
    const numPg = parseFloat(totalSkorPg) || 0
    const numEsai = parseFloat(totalSkorEsai) || 0
    const nilaiDit = (numDit / 10) * 50
    const nilaiPg = (numPg / 20) * 30
    const nilaiEsai = (numEsai / 10) * 20
    const skorAkhir = nilaiDit + nilaiPg + nilaiEsai
    const thresholdNilai = parseInt(header?.jenjang || '0') >= 7 ? 70 : 65

    return (
      <div style={{ fontFamily: kanFont, fontSize: '12pt' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD', marginBottom: '16px' }}>
          FR.AK.02 &nbsp;&nbsp; FRAGEMEN ANTARA ASESOR
        </div>

        {/* IDENTITAS */}
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
                <td colSpan={2} style={{ ...kanTd, textTransform: 'uppercase' }}>
                  {a?.nama || '-'}{a?.noreg ? ` (${a.noreg})` : ''}
                </td>
              </tr>
            ))}
            <tr>
              <td style={kanTd}>Nama Asesi</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
              <td colSpan={2} style={{ ...kanTd, textTransform: 'uppercase' }}>{header?.namaAsesi || '-'}</td>
            </tr>
            <tr>
              <td rowSpan={2} style={kanTd}>Tanggal Asesmen</td>
              <td style={{ ...kanTd, textAlign: 'right' }}>Mulai :</td>
              <td colSpan={2} style={kanTd}>{header?.tanggalUji ? fmtTanggalId(header.tanggalUji) : '-'}</td>
            </tr>
            <tr>
              <td style={{ ...kanTd, textAlign: 'right' }}>Selesai :</td>
              <td colSpan={2} style={kanTd}>{header?.tanggalSelesai ? fmtTanggalId(header.tanggalSelesai) : '-'}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '13px', margin: '8px 0' }}>
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
        </p>

        {/* MATRIKS KOMPETENSI */}
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', ...hdDok }}>
              <th style={{ ...kanTd, width: '22%' }}>Unit kompetensi</th>
              {EVIDENCE_KEYS.map((k) => (
                <th key={k} style={{ ...kanTd, fontSize: '10pt' }}>{EVIDENCE_HEADERS[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td style={kanTd}>
                  <b>{unit.kode}</b><br />
                  {unit.nama}
                </td>
                {EVIDENCE_KEYS.map((k) => (
                  <td key={k} style={{ ...kanTd, textAlign: 'center', verticalAlign: 'middle' }}>
                    <CustomCheckbox checked={!!checks[unit.id]?.[k]} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <br />

        {/* REKAPITULASI PENILAIAN HASIL UJI */}
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ padding: '10px 14px', fontSize: '13px', lineHeight: 1.4, border: 'none' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '18px' }}>
                  Rekapitulasi Penilaian Hasil Uji
                </div>
                <table width="100%" cellSpacing={0} cellPadding={0} style={{ border: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '0', width: '24px', verticalAlign: 'top', fontWeight: 'bold' }}>A.</td>
                      <td style={{ border: '0' }}>
                        Panduan Penilaian:
                        <ol style={{ marginTop: 0, marginBottom: '8px', paddingLeft: '22px' }}>
                          <li>Tuliskan Total Skor dari setiap masing masing instrumen asesmen (FR. IA 04B, FR. IA 05 dan FR. IA 06).</li>
                          <li>Rumus Skor:</li>
                        </ol>
                        <table width="100%" cellSpacing={0} cellPadding={3} style={{ border: '0', marginLeft: '18px' }}>
                          <tbody>
                            {[
                              { label: 'Skor Pertanyaan DIT', pembagi: '30' },
                              { label: 'Skor Pertanyaan Pilihan Ganda', pembagi: '20' },
                              { label: 'Skor Pertanyaan Esai', pembagi: '30' },
                            ].map(({ label, pembagi }) => (
                              <tr key={label}>
                                <td style={{ border: '0', width: '18px', verticalAlign: 'top' }}>•</td>
                                <td style={{ border: '0', width: '210px' }}>{label}</td>
                                <td style={{ border: '0', width: '15px' }}>=</td>
                                <td style={{ border: '0' }}>
                                  <span style={{ display: 'inline-block', textAlign: 'center', verticalAlign: 'middle', fontStyle: 'italic' }}>
                                    <span style={{ display: 'block', borderBottom: '1px solid #000', padding: '0 8px' }}>Total Skor</span>
                                    <span style={{ display: 'block' }}>{pembagi}</span>
                                  </span>
                                  <span style={{ fontStyle: 'italic' }}> x bobot nilai</span>
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td style={{ border: '0', width: '18px', verticalAlign: 'top' }}>•</td>
                              <td style={{ border: '0' }} colSpan={3}>
                                Total Skor Nilai = Skor FR. IA 04B + Skor FR. IA 05 + Skor FR. IA 06
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '0', height: '18px' }}></td>
                      <td style={{ border: '0' }}></td>
                    </tr>
                    <tr>
                      <td style={{ border: '0', width: '24px', verticalAlign: 'top', fontWeight: 'bold' }}>B.</td>
                      <td style={{ border: '0' }}>
                        Syarat Total Skor Nilai Kompeten/Lulus yaitu:
                        <ol style={{ marginTop: 0, marginBottom: 0, paddingLeft: '22px' }}>
                          <li>Total Skor Nilai &lt; <b>{thresholdNilai}</b> di nyatakan <b>"Tidak Lulus/ Tidak direkomendasikan Kompeten"</b></li>
                          <li>Total Skor Nilai ≧ <b>{thresholdNilai}</b> dapat direkomendasikan <b>"Lulus/ Direkomendasikan Kompeten"</b></li>
                        </ol>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* TABEL NILAI */}
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', ...hdDok }}>
              <th style={{ ...kanTd, width: '28%' }}>Form</th>
              <th style={kanTd}>Jumlah Skor Soal</th>
              <th style={kanTd}>Total Skor</th>
              <th style={kanTd}>Bobot Nilai %</th>
              <th style={kanTd}>Nilai Skor</th>
            </tr>
            <tr>
              <td style={kanTd}>1. FR IA 04B<br />Pertanyaan DIT</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>30</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.total_skor_dit ?? '-'}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.bobot_dit ?? 50}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.nilai_skor_dit != null ? kanNilai.nilai_skor_dit.toFixed(2) : nilaiDit.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={kanTd}>2. FR IA 05<br />Pertanyaan Pilihan Ganda</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>20</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.total_skor_pg ?? '-'}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.bobot_pg ?? 30}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.nilai_skor_pg != null ? kanNilai.nilai_skor_pg.toFixed(2) : nilaiPg.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={kanTd}>3. FR IA 06<br />Pertanyaan Esai</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>30</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.total_skor_esai ?? '-'}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.bobot_esai ?? 20}</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>{kanNilai?.nilai_skor_esai != null ? kanNilai.nilai_skor_esai.toFixed(2) : nilaiEsai.toFixed(2)}</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={4} style={{ ...kanTd, textAlign: 'center', height: '45px' }}>Skor Nilai Akhir</td>
              <td style={{ ...kanTd, textAlign: 'center', fontSize: '13pt' }}>{kanNilai?.skor_nilai_akhir != null ? kanNilai.skor_nilai_akhir.toFixed(2) : skorAkhir.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* REKOMENDASI, TINDAK LANJUT, KOMENTAR */}
        <table style={{ border: '1.4px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ ...kanTd, width: '30%', fontWeight: 'bold' }}>Rekomendasi hasil<br />asesmen</td>
              <td style={kanTd}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <CustomCheckbox checked={isKompeten === false} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                  <span>Tidak Lulus/ Tidak direkomendasikan Kompeten (Nilai total &lt; {thresholdNilai})</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <CustomCheckbox checked={isKompeten === true} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
                  <span>Lulus/ Direkomendasikan Kompeten (Nilai total ≧ {thresholdNilai})</span>
                </label>
              </td>
            </tr>
            <tr>
              <td style={{ ...kanTd, fontWeight: 'bold' }}>
                Tindak lanjut yang<br />dibutuhkan
                <br /><br />
                <span style={{ fontWeight: 'normal' }}>
                  (Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)
                </span>
              </td>
              <td style={{ ...kanTd, verticalAlign: 'top' }}>{tindakLanjut || '-'}</td>
            </tr>
            <tr>
              <td style={{ ...kanTd, fontWeight: 'bold' }}>Komentar/ Observasi<br />oleh asesor</td>
              <td style={{ ...kanTd, verticalAlign: 'top' }}>{komentar || '-'}</td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* TANDA TANGAN */}
        <table style={{ border: '1.4px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding={5} cellSpacing={0}>
          <tbody>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3} style={kanTd}>Asesi :</td>
            </tr>
            <tr>
              <td style={{ ...kanTd, width: '30%' }}>Nama</td>
              <td style={{ ...kanTd, width: '3%', textAlign: 'center' }}>:</td>
              <td style={{ ...kanTd, textTransform: 'uppercase' }}>{header?.namaAsesi || '-'}</td>
            </tr>
            <tr>
              <td style={kanTd}>Tanda tangan<br />dan Tanggal</td>
              <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
              <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodeCell(barcodes?.asesi, header?.namaAsesi)}
              </td>
            </tr>
            {asesorList.map((a, idx) => {
              const asesorBc = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
              return (
                <Fragment key={a.id || idx}>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td colSpan={3} style={kanTd}>Asesor {idx + 1} :</td>
                  </tr>
                  <tr>
                    <td style={kanTd}>Nama</td>
                    <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
                    <td style={{ ...kanTd, textTransform: 'uppercase' }}>{a?.nama || '-'}</td>
                  </tr>
                  <tr>
                    <td style={kanTd}>No. Reg</td>
                    <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
                    <td style={kanTd}>{a?.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={kanTd}>Tanda tangan<br />dan Tanggal</td>
                    <td style={{ ...kanTd, textAlign: 'center' }}>:</td>
                    <td style={{ ...kanTd, height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                      {barcodeCell(asesorBc, a?.nama)}
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>

        <SaveBar
          isSaving={isSaving}
          onSave={handleSave}
          note="Varian KAN bersifat view-only — matriks, rekomendasi & nilai tidak diubah oleh revisi ini."
        />
      </div>
    )
  }

  /* ==================== VARIAN BNSP ==================== */
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
          FR.AK.02 &nbsp;&nbsp; FORMULIR REKAMAN ASESMEN KOMPETENSI
        </h1>
      </div>

      {/* IDENTITAS Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (<del>KKNI</del>/Okupasi/<del>Klaster</del>)</td>
            <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
          </tr>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Tanggal Asesmen</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>Mulai :</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{header?.tanggalUji ? fmtTanggalId(header.tanggalUji) : '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>Selesai :</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{header?.tanggalUji ? fmtTanggalId(header.tanggalUji) : '-'}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: '13px', marginBottom: '15px' }}>
        Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
      </p>

      {/* MATRIKS KOMPETENSI Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr style={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Unit kompetensi</th>
            {ROTATED_HEADERS.map((lines) => (
              <th key={lines.join('')} style={{ border: '1px solid #000', padding: '8px 4px', width: '20px', textAlign: 'center', verticalAlign: 'middle', position: 'relative' }}>
                <div style={{ writingMode: 'vertical-rl', whiteSpace: 'nowrap', visibility: 'hidden', fontSize: '12px', lineHeight: '1.3' }}>
                  {lines.map((line, i) => (
                    <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
                  ))}
                </div>
                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '12px', lineHeight: '1.3' }}>
                    {lines.map((line, i) => (
                      <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              </th>
            ))}
          </tr>

          {units.map((unit) => (
            <tr key={unit.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {unit.kode}<br />
                {unit.nama}
              </td>
              {EVIDENCE_KEYS.map((k) => (
                <td key={k} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <CustomCheckbox
                    checked={checks[unit.id]?.[k] || false}
                    onChange={() => setCheck(unit.id, k, !checks[unit.id]?.[k])}
                    disabled={isSaving}
                  />
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}><b>Rekomendasi hasil asesmen</b></td>
            <td colSpan={7} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '20px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <CustomCheckbox
                  checked={isKompeten === true}
                  onChange={() => !isSaving && setIsKompeten(isKompeten === true ? null : true)}
                  disabled={isSaving}
                />
                Kompeten
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <CustomCheckbox
                  checked={isKompeten === false}
                  onChange={() => !isSaving && setIsKompeten(isKompeten === false ? null : false)}
                  disabled={isSaving}
                />
                Belum kompeten
              </label>
            </td>
          </tr>

          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <b>Tindak lanjut yang dibutuhkan</b><br />
              <span style={{ fontSize: '13px' }}>(Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)</span>
            </td>
            <td colSpan={7} style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={tindakLanjut}
                onChange={(e) => setTindakLanjut(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: '70px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Tuliskan tindak lanjut..."
              />
            </td>
          </tr>

          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}><b>Komentar / Observasi oleh asesor</b></td>
            <td colSpan={7} style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Tuliskan komentar..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* TANDA TANGAN Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}><b>Asesi :</b></td>
          </tr>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
              {barcodeCell(barcodes?.asesi, header?.namaAsesi)}
            </td>
          </tr>

          {asesorList.map((asesor, idx) => {
            const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
            const label = asesorList.length > 1 ? `Nama Asesor ${idx + 1}` : 'Nama Asesor'
            return (
              <Fragment key={asesor.id}>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{label}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{asesor.nama?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg {asesorList.length > 1 ? idx + 1 : ''}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{asesor.noreg || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                  <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {barcodeCell(asesorBarcode, asesor.nama)}
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>

      {/* LAMPIRAN DOKUMEN */}
      <div style={{ fontSize: '13px', marginBottom: '15px' }}>
        <b>LAMPIRAN DOKUMEN:</b><br />
        1. Dokumen APL 01 peserta<br />
        2. Dokumen APL 02 peserta<br />
        3. Bukti-bukti berkualitas peserta<br />
        4. Tinjauan proses asesmen
      </div>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Menyimpan matriks bukti per unit + hasil penilaian (Kompeten / Belum Kompeten) + tindak lanjut + komentar."
      />
    </div>
  )
}
