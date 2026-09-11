/**
 * Editor Revisi MUK — FR.IA.03 (Pertanyaan Terstruktur Wawancara / Observasi).
 * Tampilan = form FR.IA.03 halaman asesi (Ia03Page): identitas, panduan asesor,
 * tabel unit per kelompok, tabel pertanyaan + tanggapan, umpan balik,
 * ttd + penyusun/validator read-only (barcode existing, tanpa generate).
 * Payload persis Ia03Page: SEMUA soal dikirim, fallback ke nilai existing per soal.
 */
import { Fragment, useEffect, useRef, useState } from 'react'
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
  tanggapan: string | null
  pencapaian: boolean | null
  unitkompetensi?: { id: number; kode: string } | null
  subunitkompetensi?: { id: number; kode: string } | null
  kuk?: { id: number; kode: string } | null
}
interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
}
interface KelompokKerja {
  id: number
  nama: string
  urut: string
  deskripsi?: string
  units?: Unit[]
  soal: Soal[]
}
interface Ia03Response {
  message: string
  data?: {
    barcodes?: Barcodes
    kelompok_kerja: {
      id: number
      kode: string
      nama_dokumen: string
      kelompok_kerja: KelompokKerja[]
    }
    umpan_balik?: string
  }
}

/** Auto-grow textarea (autoResizeTextarea Ia03Page). */
function autoResizeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function Ia03Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia03Response>(asesmenUrl(idIzin, 'ia03'))

  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [kelompokData, setKelompokData] = useState<KelompokKerja[]>([])
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [tanggapan, setTanggapan] = useState<Record<number, string>>({})
  const [pencapaian, setPencapaian] = useState<Record<number, boolean | null>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement>>({})

  useEffect(() => {
    const inner = data?.data
    if (!inner?.kelompok_kerja) return
    setBarcodes(inner.barcodes)
    setDokumenId(inner.kelompok_kerja.id)
    const items = inner.kelompok_kerja.kelompok_kerja ?? []
    setKelompokData(items)
    const t: Record<number, string> = {}
    const p: Record<number, boolean | null> = {}
    items.forEach((kelompok) => {
      kelompok.soal.forEach((soal) => {
        if (soal.tanggapan) t[soal.id] = soal.tanggapan
        if (soal.pencapaian !== null) p[soal.id] = soal.pencapaian
      })
    })
    setTanggapan(t)
    setPencapaian(p)
    setUmpanBalik(inner.umpan_balik ?? '')
  }, [data])

  // Auto-resize tanggapan yang sudah terisi saat data dimuat (pola Ia03Page).
  useEffect(() => {
    Object.keys(tanggapan).forEach((soalId) => {
      const el = textareaRefs.current[parseInt(soalId, 10)]
      if (el) {
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
    })
  }, [tanggapan])

  const handleSave = async () => {
    if (!dokumenId) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      const answers = kelompokData.flatMap((kelompok) =>
        kelompok.soal.map((soal) => ({
          soal_id: soal.id,
          tanggapan: tanggapan[soal.id] || soal.tanggapan || '',
          pencapaian: pencapaian[soal.id] ?? soal.pencapaian ?? false,
        }))
      )
      await saveDoc(asesmenUrl(idIzin, 'ia03'), {
        dokumen_id: dokumenId,
        answers,
        umpan_balik: umpanBalik,
        is_kompeten: answers.length > 0 && answers.every((a) => a.pencapaian === true),
      })
      toast.showSuccess('FR.IA.03 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.03')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompokData.length === 0) return <DocError message="Data FR.IA.03 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.IA.03.&nbsp;&nbsp;PERTANYAAN UNTUK MENDUKUNG OBSERVASI</DocTitle>

      {/* IDENTITAS */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (<del>KKNI</del>/Okupasi/<del>Klaster</del>)</td>
            <td style={{ width: '2%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList[0]?.nama?.toUpperCase() || ''}{asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{fmtTanggalId(header?.tanggalUji) || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* PANDUAN BAGI ASESOR */}
      <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
        <div style={{ background: BRANDING.primaryColor, color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          PANDUAN BAGI ASESOR
        </div>
        <div style={{ padding: '10px', fontSize: '12px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Formulir ini diisi oleh asesor kompetensi sebelum, pada saat atau setelah melakukan asesmen metode observasi demonstrasi.</li>
            <li>Pertanyaan dibuat dengan tujuan untuk menggali, dapat berisi pertanyaan yang berkaitan dengan dimensi kompetensi.</li>
            <li>Jika pertanyaan disampaikan sebelum asesmen melakukan praktik demonstrasi, maka pertanyaan dibuat berkaitan dengan aspek K3L, SOP, penggunaan peralatan.</li>
            <li>Jika setelah asesmen dilakukan praktik, maka pertanyaan pendukung observasi dapat dilakukan secara lisan.</li>
            <li>Tanggapan asesi ditulis pada kolom tanggapan.</li>
          </ul>
        </div>
      </div>

      {/* KELOMPOK KERJA */}
      {kelompokData.map((kelompok) => (
        <div key={kelompok.id} style={{ marginBottom: '15px' }}>
          {/* Units Table */}
          {kelompok.units && kelompok.units.length > 0 && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
                <thead>
                  <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                    <th style={{ width: '18%', border: '1px solid #000', padding: '6px' }}>
                      Kelompok Pekerjaan {kelompok.urut}
                      {kelompok.deskripsi && (
                        <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'normal', marginTop: '2px', whiteSpace: 'pre-line' }}>
                          {kelompok.deskripsi}
                        </div>
                      )}
                    </th>
                    <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                    <th style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Kode Unit</th>
                    <th style={{ border: '1px solid #000', padding: '6px' }}>Judul Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {kelompok.units.map((unit, index) => (
                    <tr key={unit.id_unit}>
                      {index === 0 && (
                        <td rowSpan={kelompok.units!.length} style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}></td>
                      )}
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <br />
            </>
          )}

          {/* Questions Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-1px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
            <thead>
              <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan</th>
                <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>Ya</th>
                <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>Tidak</th>
              </tr>
            </thead>
            <tbody>
              {kelompok.soal.map((soal) => (
                <Fragment key={soal.id}>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>
                      {soal.no}. {soal.soal}
                      <br /><br />
                      <span style={{ fontSize: '11px' }}>Uk.{soal.unitkompetensi?.kode ?? ''} EK.{soal.subunitkompetensi?.kode ?? ''} KUK.{soal.kuk?.kode ?? ''}</span>
                    </td>
                    <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                      <CustomCheckbox
                        checked={pencapaian[soal.id] === true}
                        onChange={() =>
                          !isSaving && setPencapaian((prev) => ({ ...prev, [soal.id]: true }))
                        }
                        disabled={isSaving}
                        style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                      <CustomCheckbox
                        checked={pencapaian[soal.id] === false}
                        onChange={() =>
                          !isSaving && setPencapaian((prev) => ({ ...prev, [soal.id]: false }))
                        }
                        disabled={isSaving}
                        style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>
                      <b>Tanggapan:</b>
                      <textarea
                        ref={(el) => {
                          if (el) textareaRefs.current[soal.id] = el
                        }}
                        value={tanggapan[soal.id] || ''}
                        onChange={(e) => {
                          setTanggapan((prev) => ({ ...prev, [soal.id]: e.target.value }))
                          autoResizeTextarea(e)
                        }}
                        disabled={isSaving}
                        placeholder="Tulis tanggapan..."
                        style={{
                          width: '100%',
                          minHeight: '50px',
                          height: 'auto',
                          border: '1px solid #ccc',
                          padding: '6px',
                          fontSize: '12px',
                          marginTop: '4px',
                          resize: 'none',
                          overflow: 'hidden',
                          cursor: isSaving ? 'not-allowed' : 'text',
                        }}
                      />
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* UMPAN BALIK */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ height: '80px', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}><b>Umpan balik untuk asesi:</b></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={umpanBalik}
                onChange={(e) => {
                  setUmpanBalik(e.target.value)
                  autoResizeTextarea(e)
                }}
                disabled={isSaving}
                placeholder="Tuliskan umpan balik untuk asesi..."
                style={{
                  width: '100%',
                  minHeight: '70px',
                  height: 'auto',
                  border: '1px solid #ccc',
                  padding: '6px',
                  fontSize: '12px',
                  resize: 'none',
                  overflow: 'hidden',
                  cursor: isSaving ? 'not-allowed' : 'text',
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* TANDA TANGAN */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}><b>Asesi</b></td>
          </tr>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ width: '2%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>: {header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda Tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
              {barcodes?.asesi?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <img
                    src={barcodes.asesi.url}
                    alt="Tanda Tangan Asesi"
                    style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                  />
                  {barcodes.asesi.tanggal && (
                    <div style={{ fontSize: '11px', color: '#333' }}>
                      {fmtTanggalId(barcodes.asesi.tanggal)}
                    </div>
                  )}
                </div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}><b>Asesor</b></td>
          </tr>
          {asesorList.map((asesor, idx) => {
            const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
            const label = asesorList.length > 1 ? `Asesor ${idx + 1}` : 'Asesor'
            return (
              <Fragment key={asesor.id}>
                <tr>
                  <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama {label}</td>
                  <td style={{ width: '2%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>: {asesor.nama?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg{asesorList.length > 1 ? ` ${idx + 1}` : ''}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>: {asesor.noreg || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda Tangan dan Tanggal</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                  <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {asesorBarcode?.url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img
                          src={asesorBarcode.url}
                          alt={`Tanda Tangan ${asesor.nama}`}
                          style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                        />
                        {asesorBarcode.tanggal && (
                          <div style={{ fontSize: '11px', color: '#333' }}>
                            {fmtTanggalId(asesorBarcode.tanggal)}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>

      {/* PENYUSUN DAN VALIDATOR (read-only, dari dokumenHeader) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '28pt' }}>
            <td style={{ backgroundColor: BRANDING.primaryColor, border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Status</span></td>
            <td style={{ backgroundColor: BRANDING.primaryColor, border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>No</span></td>
            <td style={{ backgroundColor: BRANDING.primaryColor, border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>Nama</span></td>
            <td style={{ backgroundColor: BRANDING.primaryColor, border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Nomor MET</span></td>
            <td style={{ backgroundColor: BRANDING.primaryColor, border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Tanda Tangan dan Tanggal</span></td>
          </tr>
          <tr style={{ height: '91pt' }}>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '15px 0 0 0', background: '#fff' }}><span style={{ fontSize: '12px', paddingLeft: '15px' }}>Penyusun</span></td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', background: '#fff' }}><span style={{ fontSize: '12px', textAlign: 'center' }}>1</span></td>
            <td style={{ border: '1px solid #000', padding: '7px 8px', background: '#fff', fontSize: '12px' }}>{header?.namaPenyusun || ''}</td>
            <td style={{ border: '1px solid #000', padding: '13px 8px', background: '#fff', fontSize: '12px' }}>{header?.noregPenyusun || '-'}</td>
            <td style={{ border: '1px solid #000', padding: '8px', background: '#fff', textAlign: 'center' }}>
              {header?.barcodePenyusun ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <img src={header.barcodePenyusun} alt="QR Penyusun" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  {header.tanggalPenyusun && <span style={{ fontSize: '10px' }}>{fmtTanggalId(header.tanggalPenyusun)}</span>}
                </div>
              ) : ''}
            </td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
          </tr>
          <tr style={{ height: '68pt' }}>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '18px 0 0 0', background: '#fff' }}><span style={{ fontSize: '12px', paddingLeft: '18px' }}>Validator</span></td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', background: '#fff' }}><span style={{ fontSize: '12px', textAlign: 'center' }}>1</span></td>
            <td style={{ border: '1px solid #000', padding: '7px 8px', background: '#fff', fontSize: '12px' }}>{header?.namaValidator || ''}</td>
            <td style={{ border: '1px solid #000', padding: '13px 8px', background: '#fff', fontSize: '12px' }}>{header?.noregValidator || '-'}</td>
            <td style={{ border: '1px solid #000', padding: '8px', background: '#fff', textAlign: 'center' }}>
              {header?.barcodeValidator ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <img src={header.barcodeValidator} alt="QR Validator" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  {header.tanggalValidator && <span style={{ fontSize: '10px' }}>{fmtTanggalId(header.tanggalValidator)}</span>}
                </div>
              ) : ''}
            </td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
          </tr>
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Semua soal dikirim ulang saat simpan; jawaban kosong memakai nilai existing."
      />
    </div>
  )
}
