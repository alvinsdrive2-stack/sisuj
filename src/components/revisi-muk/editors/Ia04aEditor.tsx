/**
 * Editor Revisi MUK — FR.IA.04.A (Observasi / Demonstrasi Dukungan).
 * Tampilan = form FR.IA.04.A halaman asesi (Ia04aPage): info skema, panduan
 * asesor, tabel kelompok pekerjaan, soal + umpan balik, ttd & status read-only
 * (barcode existing, tanpa generate).
 * Satu-satunya yang dapat direvisi = jawaban soal umpan balik (is_komentar "2"/true),
 * payload persis Ia04aPage asesor_1: {soal_id, jawaban}.
 */
import { useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { EmptyState } from '@/components/ui/EmptyState'
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
  units: Unit[]
}
interface KelompokKerjaData {
  id: number
  kode: string
  nama_dokumen: string
  kelompok_kerja: KelompokKerja[]
}
interface Soal {
  id: number
  urut: string
  jenis: string | number
  soal: string
  jawaban: string
  is_komentar: string | boolean | null
}
interface Ia04aResponse {
  message: string
  data?: {
    kelompok_kerja?: KelompokKerjaData
    soal?: Soal[]
    barcodes?: Barcodes
  }
}

const isUmpanBalik = (soal: Soal) => soal.is_komentar === '2' || soal.is_komentar === true

export function Ia04aEditor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia04aResponse>(asesmenUrl(idIzin, 'ia04a'))

  const [dokumen, setDokumen] = useState<KelompokKerjaData | undefined>(undefined)
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [umpanBalikSoalId, setUmpanBalikSoalId] = useState<number | null>(null)
  const [jawaban, setJawaban] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    setDokumen(inner.kelompok_kerja)
    setBarcodes(inner.barcodes)
    const soal = inner.soal
    if (!soal) return
    const target = soal.find(isUmpanBalik)
    if (target) {
      setUmpanBalikSoalId(target.id)
      setJawaban(target.jawaban ?? '')
    } else {
      setUmpanBalikSoalId(null)
    }
  }, [data])

  const handleSave = async () => {
    if (!umpanBalikSoalId) {
      toast.showWarning('Tidak ada soal umpan balik untuk disimpan')
      return
    }
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ia04a'), {
        soal_id: umpanBalikSoalId,
        jawaban: jawaban || '',
      })
      toast.showSuccess('FR.IA.04.A berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.04.A')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />

  if (!umpanBalikSoalId) {
    return (
      <EmptyState
        title="Tidak ada yang bisa direvisi"
        message="Dokumen IA.04.A ini tidak memiliki soal umpan balik asesor."
      />
    )
  }

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const soalList = data?.data?.soal ?? []
  // KP1 units ikut disertakan di semua kelompok (semuaKelompokIncludeKP1 Ia04aPage)
  const semuaKelompok = dokumen?.kelompok_kerja ?? []
  const kelompokPertama = semuaKelompok[0]
  const semuaKelompokIncludeKP1 = semuaKelompok.map((k) =>
    k.id === kelompokPertama?.id
      ? k
      : { ...k, units: [...(kelompokPertama?.units || []), ...k.units] }
  )

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>
        {dokumen?.kode || 'FR.IA.04.A'}{' '}
        {dokumen?.nama_dokumen || 'FR.IA.04. PENJELASAN SINGKAT PROYEK TERKAIT PEKERJAAN KEGIATAN TERSTRUKTUR LAINNYA'}
      </DocTitle>

      {/* Info Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ background: '#e9e9e9e' }}>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (<del>KKNI</del>/Okupasi/<del>Klaster</del>)</td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.jabatanKerja?.toLocaleUpperCase() || ''}</td>
          </tr>
          <tr style={{ background: '#e9e9e9e' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.nomorSkema?.toUpperCase() || ''}</td>
          </tr>
          <tr style={{ background: '#e9e9e9e' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.tuk?.toUpperCase() || ''}</td>
          </tr>
          {asesorList.length > 1 ? (
            asesorList.map((asesor, idx) => (
              <tr key={asesor.id} style={{ background: '#e9e9e9e' }}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {asesor.nama?.toUpperCase() || ''}
                </td>
              </tr>
            ))
          ) : (
            <tr style={{ background: '#e9e9e9e' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList[0]?.nama?.toUpperCase() || ''}
              </td>
            </tr>
          )}
          <tr style={{ background: '#e9e9e9e' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr style={{ background: '#e9e9e9e' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
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
            <td style={{ background: '#e9e9e9e', border: '1px solid #000', padding: '6px' }}>
              <ul style={{ margin: '5px 0 5px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '6px' }}>Tentukan proyek singkat atau kegiatan terstruktur lainnya yang harus dipersiapkan dan dipresentasikan oleh asesi.</li>
                <li style={{ marginBottom: '6px' }}>Proyek singkat atau kegiatan terstruktur lainnya dibuat untuk keseluruhan unit kompetensi dalam Skema Sertifikasi atau untuk masing-masing kelompok pekerjaan.</li>
                <li style={{ marginBottom: '0' }}>Kumpulkan hasil proyek singkat atau kegiatan terstruktur lainnya sesuai dengan hasil keluaran yang telah ditetapkan.</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Kelompok Pekerjaan Tables (KP1 units included in all) */}
      {semuaKelompokIncludeKP1.map((kelompok) => (
        <div key={kelompok.id}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
            <tbody>
              <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold' }}>
                <td rowSpan={kelompok.units.length + 1} style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #000', padding: '6px' }}>
                  {kelompok.nama}
                  {kelompok.deskripsi && (
                    <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '4px', whiteSpace: 'pre-line' }}>
                      {kelompok.deskripsi}
                    </div>
                  )}
                </td>
                <td style={{ width: '8%', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>No.</td>
                <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Kode Unit</td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Judul Unit</td>
              </tr>
              {kelompok.units.map((unit, index) => (
                <tr key={unit.id_unit}>
                  <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
        </div>
      ))}

      {/* Soal Sections */}
      {soalList.map((soalItem) => (
        <table key={soalItem.id} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '28%', background: '#e9e9e9e', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>
                {soalItem.soal}
              </td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {isUmpanBalik(soalItem) ? (
                  // Umpan balik — bagian yang direvisi
                  <textarea
                    value={soalItem.id === umpanBalikSoalId ? jawaban : (soalItem.jawaban ?? '')}
                    onChange={(e) => soalItem.id === umpanBalikSoalId && setJawaban(e.target.value)}
                    disabled={isSaving || soalItem.id !== umpanBalikSoalId}
                    style={{ width: '100%', height: '100px', border: '1px solid #ccc', padding: '8px', fontSize: '13px', resize: 'none', fontFamily: 'Arial, Helvetica, sans-serif', cursor: isSaving || soalItem.id !== umpanBalikSoalId ? 'not-allowed' : 'text' }}
                    placeholder="Tuliskan umpan balik untuk asesi (minimal 10 karakter / 3 kata)..."
                  />
                ) : (
                  <div
                    style={{ margin: '5px 0', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: soalItem.jawaban }}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      {/* Signature Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #000' }}>
            <td>Tanda Tangan Asesi</td>
            <td colSpan={asesorList.length}>Tanda Tangan Asesor</td>
            <td style={{ display: asesorList.length > 0 ? 'none' : 'table-cell' }}>Nama & Tanda Tangan Supervisor Tempat Kerja</td>
          </tr>
          {/* Asesi Signature Row */}
          <tr>
            <td style={{ height: '120px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
              {barcodes?.asesi?.url ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {barcodes.asesi.nama}
                  </div>
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
            {asesorList.map((asesor, idx) => {
              const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
              return (
                <td key={asesor.id} style={{ height: '120px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                  {asesorBarcode?.url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {asesorBarcode.nama.toUpperCase()}
                      </div>
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
              )
            })}
            <td style={{ display: asesorList.length > 0 ? 'none' : 'table-cell', height: '120px', border: '1px solid #000', padding: '6px' }}></td>
          </tr>
        </tbody>
      </table>

      {/* Status Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>STATUS</td>
            <td style={{ width: '8%', border: '1px solid #000', padding: '6px' }}>NO</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>NAMA</td>
            <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>NOMOR MET</td>
            <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>TANDA TANGAN DAN TANGGAL</td>
          </tr>
          {/* PENYUSUN */}
          {(header?.namaPenyusun || header?.barcodePenyusun) ? (
            <tr style={{ background: '#e9e9e9e', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>PENYUSUN</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaPenyusun?.toUpperCase() || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.noregPenyusun || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {header?.barcodePenyusun ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={header.barcodePenyusun} alt="TTD Penyusun" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {header?.tanggalPenyusun && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {fmtTanggalId(header.tanggalPenyusun)}
                      </div>
                    )}
                  </div>
                ) : '-'}
              </td>
            </tr>
          ) : (
            <>
              <tr style={{ background: '#e9e9e9e', fontWeight: 'bold' }}>
                <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>PENYUSUN</td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              </tr>
              <tr style={{ background: '#e9e9e9e' }}>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>2</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              </tr>
            </>
          )}
          {/* VALIDATOR */}
          {(header?.namaValidator || header?.barcodeValidator) ? (
            <tr style={{ background: '#e9e9e9e', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>VALIDATOR</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.namaValidator?.toUpperCase() || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.noregValidator || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {header?.barcodeValidator ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={header.barcodeValidator} alt="TTD Validator" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    {header?.tanggalValidator && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {fmtTanggalId(header.tanggalValidator)}
                      </div>
                    )}
                  </div>
                ) : '-'}
              </td>
            </tr>
          ) : (
            <>
              <tr style={{ background: '#e9e9e9e', fontWeight: 'bold' }}>
                <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>VALIDATOR</td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              </tr>
              <tr style={{ background: '#e9e9e9e' }}>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>2</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note="Hanya jawaban umpan balik pada dokumen IA.04.A yang dapat direvisi."
      />
    </div>
  )
}
