/**
 * Editor Revisi MUK — FR.IA.08 (Validasi Portofolia & Wawancara).
 * Tampilan = form FR.IA.08 halaman asesi (Ia08Page): identitas, panduan,
 * tabel dokumen portofolio (aturan bukti), cek list wawancara, bukti tambahan,
 * rekomendasi asesor, ttd read-only (barcode existing, tanpa generate).
 * file_id WAJIB berasal dari GET (exists:apl2_files) — tidak boleh dikarang;
 * valid/asli/terkini/memadai per file + unit_answers + rekomendasi.
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

interface Ia08File {
  id: number
  original_name: string
  path: string
  filetype: string | null
  answer?: {
    valid: boolean | null
    asli: boolean | null
    terkini: boolean | null
    memadai: boolean | null
  }
}
interface WawancaraItem {
  id: number
  unit_kompetensi: string
  no_elemen: string
  materi: string
  checked: boolean
}
interface Soal2Item {
  id: number
  id_dokumen?: number | string
  unit?: { kode: string } | null
  subunit?: { kode: string; nama?: string } | null
  kuk?: { nama: string } | null
}
interface Ia08Response {
  message: string
  data?: {
    files?: Ia08File[]
    soal?: { '2'?: Soal2Item[] }
    unit_answers?: Record<string, boolean>
    recommendation?: {
      bukti_tambahan?: string
      is_kompeten?: boolean
      rekomendasi_unit?: string
      rekomendasi_elemen?: string
      rekomendasi_kuk?: string
    }
    dokumen?: { id: number }
    barcodes?: Barcodes
  }
}

export function Ia08Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia08Response>(asesmenUrl(idIzin, 'ia08'))

  const [files, setFiles] = useState<Ia08File[]>([])
  const [wawancara, setWawancara] = useState<WawancaraItem[]>([])
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [buktiTambahan, setBuktiTambahan] = useState('')
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [rekomendasiUnit, setRekomendasiUnit] = useState('')
  const [rekomendasiElemen, setRekomendasiElemen] = useState('')
  const [rekomendasiKuk, setRekomendasiKuk] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return

    if (inner.files) setFiles(inner.files)

    if (inner.soal?.['2']) {
      const savedUnit = inner.unit_answers || {}
      setWawancara(
        inner.soal['2'].map((item, index) => ({
          id: item.id || index + 1,
          unit_kompetensi: item.unit?.kode || '-',
          no_elemen: item.subunit?.kode || '-',
          materi: item.kuk?.nama || item.subunit?.nama || '-',
          checked: savedUnit[String(item.id)] === true,
        }))
      )
      if (!inner.dokumen?.id && inner.soal['2'][0]?.id_dokumen) {
        setDokumenId(Number(inner.soal['2'][0].id_dokumen))
      }
    }
    if (inner.dokumen?.id) setDokumenId(inner.dokumen.id)

    if (inner.barcodes) setBarcodes(inner.barcodes)

    if (inner.recommendation) {
      const rec = inner.recommendation
      if (rec.bukti_tambahan) setBuktiTambahan(rec.bukti_tambahan)
      if (rec.is_kompeten === true || rec.is_kompeten === false) setIsKompeten(rec.is_kompeten)
      if (rec.rekomendasi_unit) setRekomendasiUnit(rec.rekomendasi_unit)
      if (rec.rekomendasi_elemen) setRekomendasiElemen(rec.rekomendasi_elemen)
      if (rec.rekomendasi_kuk) setRekomendasiKuk(rec.rekomendasi_kuk)
    }
  }, [data])

  // Klik nilai sama = kosongkan (handleFileCheck Ia08Page).
  const setFileKriteria = (fileId: number, field: 'valid' | 'asli' | 'terkini' | 'memadai', value: boolean) => {
    if (isSaving) return
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f
        const current = f.answer?.[field]
        const newVal = current === value ? null : value
        return {
          ...f,
          answer: { ...(f.answer || { valid: null, asli: null, terkini: null, memadai: null }), [field]: newVal },
        }
      })
    )
  }

  const handleSave = async () => {
    if (isKompeten === null) {
      toast.showWarning('Pilih dulu rekomendasi hasil (Kompeten / Belum Kompeten)')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia08'), {
        dokumen_id: dokumenId,
        apl2_answers: files.map((f) => ({
          file_id: f.id,
          valid: f.answer?.valid ?? null,
          asli: f.answer?.asli ?? null,
          terkini: f.answer?.terkini ?? null,
          memadai: f.answer?.memadai ?? null,
        })),
        unit_answers: wawancara.map((item) => ({
          soal_id: item.id,
          is_checked: item.checked,
        })),
        bukti_tambahan: buktiTambahan,
        is_kompeten: isKompeten,
        rekomendasi_unit: rekomendasiUnit,
        rekomendasi_elemen: rekomendasiElemen,
        rekomendasi_kuk: rekomendasiKuk,
      })
      toast.showSuccess('FR.IA.08 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.08')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (files.length === 0 && wawancara.length === 0)
    return <DocError message="Data FR.IA.08 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const inputStyle = {
    width: '100%',
    border: '1px solid #ccc',
    padding: '4px',
    fontSize: '12px',
    cursor: isSaving ? 'not-allowed' : 'text',
  } as const

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.IA.08. CEKLIS VERIFIKASI PORTOFOLIO</DocTitle>

      {/* Identitas Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>
              Skema Sertifikasi<br /><span style={{ fontSize: '12px' }}>(KKNI/Okupasi/Klaster)</span>
            </td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          {asesorList.length > 1 ? (
            <>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor 1</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor 2</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[1]?.nama?.toUpperCase() || ''}{asesorList[1]?.noreg && ` (${asesorList[1].noreg})`}</td>
              </tr>
            </>
          ) : (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}</td>
            </tr>
          )}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{fmtTanggalId(header?.tanggalUji) || '-'}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '12px', marginBottom: '15px' }}>*Coret yang tidak perlu</div>

      {/* Panduan Bagi Asesor */}
      <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
        <div style={{ background: BRANDING.primaryColor, color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          PANDUAN BAGI ASESOR
        </div>
        <div style={{ padding: '10px', fontSize: '12px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Verifikasi portofolio dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.</li>
            <li>Isilah bukti portofolio sesuai ketentuan bukti berkualitas dan relevan dengan standar kompetensi kerja.</li>
            <li>Lakukan verifikasi portofolio berdasarkan aturan bukti.</li>
            <li>Berikan hasil verifikasi portofolio dengan memberi centang (√).</li>
            <li>Jika belum memenuhi aturan bukti maka lanjutkan wawancara.</li>
          </ul>
        </div>
      </div>

      {/* Dokumen Portofolio Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <td rowSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Dokumen Portofolio</td>
            <td colSpan={8} style={{ border: '1px solid #000', padding: '6px' }}>Aturan Bukti</td>
          </tr>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Valid</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Asli</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Terkini</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Memadai</td>
          </tr>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Ya</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '8%' }}>Tidak</td>
          </tr>
          {files.map((file) => (
            <tr key={file.id}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <a href={file.path} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', fontWeight: 'bold', textDecoration: 'underline' }}>{file.original_name}</a>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.valid === true} onChange={() => setFileKriteria(file.id, 'valid', true)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.valid === false} onChange={() => setFileKriteria(file.id, 'valid', false)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.asli === true} onChange={() => setFileKriteria(file.id, 'asli', true)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.asli === false} onChange={() => setFileKriteria(file.id, 'asli', false)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.terkini === true} onChange={() => setFileKriteria(file.id, 'terkini', true)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.terkini === false} onChange={() => setFileKriteria(file.id, 'terkini', false)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.memadai === true} onChange={() => setFileKriteria(file.id, 'memadai', true)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={file.answer?.memadai === false} onChange={() => setFileKriteria(file.id, 'memadai', false)} disabled={isSaving} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cek List Wawancara Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <td style={{ border: '1px solid #000', padding: '6px', width: '5%' }}>Cek List</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '25%' }}>No. Unit Kompetensi</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>No. Elemen</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Materi/Substansi Wawancara</td>
          </tr>
          {wawancara.map((item) => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox
                  checked={item.checked}
                  onChange={() =>
                    !isSaving &&
                    setWawancara((prev) =>
                      prev.map((it) => (it.id === item.id ? { ...it, checked: !it.checked } : it))
                    )
                  }
                  disabled={isSaving}
                />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{item.unit_kompetensi}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.no_elemen}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{item.materi}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bukti Tambahan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}><b>Bukti tambahan diperlukan pada unit / elemen kompetensi</b></td>
          </tr>
          <tr>
            <td style={{ height: '80px', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
              <b>Sebagai berikut :</b>
              <textarea
                value={buktiTambahan}
                onChange={(e) => setBuktiTambahan(e.target.value)}
                disabled={isSaving}
                style={{
                  width: '100%',
                  minHeight: '50px',
                  border: '1px solid #ccc',
                  padding: '6px',
                  fontSize: '12px',
                  resize: 'vertical',
                  cursor: isSaving ? 'not-allowed' : 'text',
                  marginTop: '6px',
                }}
                placeholder="Isi bukti tambahan..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Rekomendasi */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ background: BRANDING.primaryColor, color: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Rekomendasi Asesor</td>
            <td style={{ border: '1px solid #000', padding: '6px', width: '80%' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <CustomCheckbox
                  checked={isKompeten === true}
                  onChange={() => setIsKompeten(isKompeten === true ? null : true)}
                  disabled={isSaving}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12px' }}>Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <b>KOMPETEN</b></span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <CustomCheckbox
                  checked={isKompeten === false}
                  onChange={() => setIsKompeten(isKompeten === false ? null : false)}
                  disabled={isSaving}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12px' }}>Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan uji demonstrasi pada:</span>
              </label>
              {isKompeten === false && (
                <div style={{ marginLeft: '24px', marginTop: '10px' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>Unit :</label>
                    <input
                      type="text"
                      value={rekomendasiUnit}
                      onChange={(e) => setRekomendasiUnit(e.target.value)}
                      disabled={isSaving}
                      style={inputStyle}
                      placeholder="Isi unit..."
                    />
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>Elemen :</label>
                    <input
                      type="text"
                      value={rekomendasiElemen}
                      onChange={(e) => setRekomendasiElemen(e.target.value)}
                      disabled={isSaving}
                      style={inputStyle}
                      placeholder="Isi elemen..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>KUK :</label>
                    <input
                      type="text"
                      value={rekomendasiKuk}
                      onChange={(e) => setRekomendasiKuk(e.target.value)}
                      disabled={isSaving}
                      style={inputStyle}
                      placeholder="Isi KUK..."
                    />
                  </div>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature Tables — Asesi */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}><b>Asesi</b></td>
          </tr>
          <tr>
            <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
              {barcodes?.asesi?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <img src={barcodes.asesi.url} alt="Tanda Tangan Asesi" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                  {barcodes.asesi.tanggal && (
                    <div style={{ fontSize: '11px', color: '#333' }}>
                      {fmtTanggalId(barcodes.asesi.tanggal)}
                    </div>
                  )}
                </div>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Asesor 1 */}
      {asesorList.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}><b>Asesor {asesorList.length > 1 ? '1' : ''}</b></td>
            </tr>
            <tr>
              <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.nama?.toUpperCase() || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[0]?.noreg || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesor1?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesor1.url} alt={`Tanda Tangan ${asesorList[0]?.nama}`} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {barcodes.asesor1.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {fmtTanggalId(barcodes.asesor1.tanggal)}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Asesor 2 */}
      {asesorList.length > 1 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}><b>Asesor 2</b></td>
            </tr>
            <tr>
              <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[1]?.nama?.toUpperCase() || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{asesorList[1]?.noreg || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesor2?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesor2.url} alt={`Tanda Tangan ${asesorList[1]?.nama}`} style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {barcodes.asesor2.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {fmtTanggalId(barcodes.asesor2.tanggal)}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Daftar file berasal dari portofolio asesi — hanya status validasinya yang diubah."
      />
    </div>
  )
}
