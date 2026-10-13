/**
 * Editor Revisi MUK — FR.IA.09 (Pertanyaan Wawancara / Observasi Tempat Kerja).
 * Tampilan = form FR.IA.09 halaman asesi (Ia09Page): identitas, panduan,
 * tabel bukti, tabel pertanyaan wawancara (Kesimpulan/K/BK), ttd read-only
 * (barcode existing, tanpa generate).
 * Payload persis Ia09Page: semua pertanyaan dikirim dgn kesimpulan + is_kompeten (bool).
 */
import { useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { API_BASE_URL } from '@/config/api'
import { asesmenUrl, getJson } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { Barcodes, DocTitle, fmtTanggalId } from './bnsp'

interface Soal2Item {
  id: number
  no: string
  soal: string
}
interface Ia09File {
  id: number
  original_name: string
  path: string
  filetype: string | null
}
interface Ia09Response {
  message: string
  data?: {
    soal?: { '2'?: Soal2Item[] }
    files?: Ia09File[]
    answers?: Record<string, { kesimpulan?: string; is_kompeten?: boolean; apl2_file_ids?: number[] }>
    dokumen?: { id: number }
    barcodes?: Barcodes
  }
}

interface Pertanyaan {
  id: number
  no: string
  pertanyaan: string
  kesimpulan: string
  k: boolean
  bk: boolean
  /** id file APL-02 yang ditunjuk sebagai bukti baris ini. */
  apl2FileIds: number[]
}

/** Satu file bukti APL-02 yang bisa dipilih. */
interface Apl02FileOption {
  id: number
  name: string
  path: string
}

const bersihkan = (s: string) => s.replace(/&#039;/g, ' ')

export function Ia09Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia09Response>(asesmenUrl(idIzin, 'ia09'))

  const [dokumenId, setDokumenId] = useState<number | undefined>(undefined)
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([])
  const [ia09Files, setIa09Files] = useState<Ia09File[]>([])
  const [apl02Files, setApl02Files] = useState<Apl02FileOption[]>([])
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  // Daftar file bukti APL-02 — sumber isi dropdown kolom Bukti APL-02.
  // Gagal ambil → dropdown kosong, editor tetap jalan.
  useEffect(() => {
    let batal = false
    getJson<{ message: string; data: Array<{ id: number; name?: string; original_name?: string; path: string }> }>(
      `${API_BASE_URL}/praasesmen/${encodeURIComponent(idIzin)}/apl02/files`
    )
      .then((res) => {
        if (batal || res?.message !== 'Success' || !Array.isArray(res.data)) return
        setApl02Files(
          res.data.map((f) => ({ id: f.id, name: f.original_name || f.name || `File ${f.id}`, path: f.path }))
        )
      })
      .catch(() => {})
    return () => {
      batal = true
    }
  }, [idIzin])

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    if (inner.files) setIa09Files(inner.files)
    if (inner.barcodes) setBarcodes(inner.barcodes)
    const soal2 = inner.soal?.['2']
    if (!soal2) return
    const saved = inner.answers || {}
    setDokumenId(inner.dokumen?.id)
    setPertanyaanList(
      soal2.map((item) => {
        const s = saved[String(item.id)] || {}
        return {
          id: item.id,
          no: item.no || '1',
          pertanyaan: bersihkan(item.soal || '-'),
          kesimpulan: bersihkan(s.kesimpulan || ''),
          k: s.is_kompeten === true,
          bk: s.is_kompeten === false,
          apl2FileIds: Array.isArray(s.apl2_file_ids) ? s.apl2_file_ids : [],
        }
      })
    )
  }, [data])

  // K/BK saling meniadakan (handleKChange/handleBKChange Ia09Page).
  const handleKChange = (id: number, value: boolean) => {
    if (isSaving) return
    setPertanyaanList((prev) => prev.map((p) => (p.id === id ? { ...p, k: value, bk: value ? false : p.bk } : p)))
  }
  const handleBKChange = (id: number, value: boolean) => {
    if (isSaving) return
    setPertanyaanList((prev) => prev.map((p) => (p.id === id ? { ...p, bk: value, k: value ? false : p.k } : p)))
  }

  /** Tambah/lepas satu file APL-02 sebagai bukti baris pertanyaan. */
  const handleApl02FileToggle = (soalId: number, fileId: number) => {
    if (isSaving) return
    setPertanyaanList((prev) =>
      prev.map((p) => {
        if (p.id !== soalId) return p
        const sudahAda = p.apl2FileIds.includes(fileId)
        return {
          ...p,
          apl2FileIds: sudahAda ? p.apl2FileIds.filter((fid) => fid !== fileId) : [...p.apl2FileIds, fileId],
        }
      })
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia09'), {
        ...(dokumenId ? { dokumen_id: dokumenId } : {}),
        answers: pertanyaanList.map((p) => ({
          soal_id: p.id,
          kesimpulan: p.kesimpulan,
          is_kompeten: p.k,
          apl2_file_ids: p.apl2FileIds,
        })),
      })
      toast.showSuccess('FR.IA.09 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.09')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (pertanyaanList.length === 0)
    return <DocError message="Data FR.IA.09 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.IA.09.&nbsp;&nbsp;PERTANYAAN WAWANCARA</DocTitle>

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

      {/* Panduan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td
              style={{
                background: BRANDING.primaryColor,
                color: '#fff',
                padding: '6px',
                fontWeight: 'bold',
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              PANDUAN BAGI ASESOR
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px', fontSize: '12px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Pertanyaan wawancara dapat dilakukan untuk keseluruhan unit kompetensi atau kelompok pekerjaan.</li>
                <li>Isilah bukti portofolio sesuai dengan bukti pada FR.IA.08.</li>
                <li>Ajukan pertanyaan verifikasi portofolio untuk semua unit kompetensi.</li>
                <li>Ajukan pertanyaan kepada asesi sebagai tindak lanjut verifikasi portofolio.</li>
                <li>Jika hasil verifikasi belum memadai, ajukan pertanyaan tambahan.</li>
                <li>Tuliskan pencapaian dengan mencentang (√) "Ya" atau "Tidak".</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bukti */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <thead>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No.</th>
            <th style={{ border: '1px solid #000', padding: '6px' }}>Bukti - Bukti Kompetensi</th>
          </tr>
        </thead>
        <tbody>
          {ia09Files.map((f, i) => (
            <tr key={f.id}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <a href={f.path} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', fontWeight: 'bold', textDecoration: 'underline' }}>{f.original_name}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pertanyaan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <thead>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No.</th>
            <th style={{ width: '32%', border: '1px solid #000', padding: '6px' }}>Daftar Pertanyaan Wawancara</th>
            <th style={{ width: '26%', border: '1px solid #000', padding: '6px' }}>Kesimpulan Jawaban Asesi</th>
            <th style={{ width: '8%', border: '1px solid #000', padding: '6px' }}>K</th>
            <th style={{ width: '8%', border: '1px solid #000', padding: '6px' }}>BK</th>
            <th style={{ width: '21%', border: '1px solid #000', padding: '6px' }}>Bukti APL-02</th>
          </tr>
        </thead>
        <tbody>
          {pertanyaanList.map((p) => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{p.no}</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-line' }}>{p.pertanyaan}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={p.kesimpulan}
                  onChange={(e) =>
                    setPertanyaanList((prev) =>
                      prev.map((item) => (item.id === p.id ? { ...item, kesimpulan: e.target.value } : item))
                    )
                  }
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    border: '1px solid #ccc',
                    padding: '4px',
                    fontSize: '12px',
                    resize: 'vertical',
                    cursor: isSaving ? 'not-allowed' : 'text',
                  }}
                />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={p.k} onChange={() => handleKChange(p.id, !p.k)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <CustomCheckbox checked={p.bk} onChange={() => handleBKChange(p.id, !p.bk)} disabled={isSaving} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {apl02Files.length === 0 ? (
                  <span style={{ fontSize: '11px', color: '#888' }}>Tidak ada file APL-02</span>
                ) : (
                  <>
                    <details style={{ fontSize: '11px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                        {p.apl2FileIds.length > 0 ? `${p.apl2FileIds.length} file dipilih` : 'Pilih file...'}
                      </summary>
                      <div style={{ marginTop: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                        {apl02Files.map((f) => (
                          <label
                            key={f.id}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', padding: '2px 0', cursor: isSaving ? 'not-allowed' : 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              checked={p.apl2FileIds.includes(f.id)}
                              disabled={isSaving}
                              onChange={() => handleApl02FileToggle(p.id, f.id)}
                              style={{ marginTop: '2px', flexShrink: 0 }}
                            />
                            <span style={{ wordBreak: 'break-word' }}>{f.name}</span>
                          </label>
                        ))}
                      </div>
                    </details>
                    {p.apl2FileIds.length > 0 && (
                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {p.apl2FileIds.map((fid) => {
                          const f = apl02Files.find((x) => x.id === fid)
                          if (!f) return null
                          return (
                            <a
                              key={fid}
                              href={f.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '11px', color: '#0066cc', textDecoration: 'underline', wordBreak: 'break-word' }}
                            >
                              {f.name}
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tanda Tangan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          {/* Asesi */}
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
              Asesi :
            </td>
          </tr>
          <tr>
            <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              {header?.namaAsesi?.toUpperCase() || ''}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', height: '60px', textAlign: 'center' }}>
              {barcodes?.asesi?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <img src={barcodes.asesi.url} alt="Tanda Tangan" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                  {barcodes.asesi.tanggal && (
                    <div style={{ fontSize: '11px' }}>
                      {fmtTanggalId(barcodes.asesi.tanggal)}
                    </div>
                  )}
                </div>
              ) : null}
            </td>
          </tr>

          {/* Asesor 1 */}
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
              Asesor 1 :
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              {asesorList[0]?.nama?.toUpperCase() || ''}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              {asesorList[0]?.noreg || ''}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', height: '60px', textAlign: 'center' }}>
              {barcodes?.asesor1?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <img src={barcodes.asesor1.url} alt="Tanda Tangan" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                  {barcodes.asesor1.tanggal && (
                    <div style={{ fontSize: '11px' }}>
                      {fmtTanggalId(barcodes.asesor1.tanggal)}
                    </div>
                  )}
                </div>
              ) : null}
            </td>
          </tr>

          {/* Asesor 2 */}
          {asesorList.length > 1 && (
            <>
              <tr>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
                  Asesor 2 :
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesorList[1]?.nama?.toUpperCase() || ''}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesorList[1]?.noreg || ''}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px', height: '60px', textAlign: 'center' }}>
                  {barcodes?.asesor2?.url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <img src={barcodes.asesor2.url} alt="Tanda Tangan" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                      {barcodes.asesor2.tanggal && (
                        <div style={{ fontSize: '11px' }}>
                          {fmtTanggalId(barcodes.asesor2.tanggal)}
                        </div>
                      )}
                    </div>
                  ) : null}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Semua pertanyaan dikirim ulang saat simpan (kesimpulan + status K/BK + bukti APL-02)."
      />
    </div>
  )
}
