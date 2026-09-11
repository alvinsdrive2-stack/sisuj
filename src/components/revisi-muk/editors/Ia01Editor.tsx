/**
 * Editor Revisi MUK — FR.IA.01 (Menchecklist Kompetensi).
 * Tampilan = form FR.IA.01 halaman asesi (Ia01Page): identitas, panduan asesor,
 * kelompok pekerjaan (accordion), tabel observasi per unit, umpan balik,
 * rekomendasi + ttd read-only (barcode existing, tanpa generate).
 * Payload persis Ia01Page: filter pencapaian !== null, feedback sama untuk
 * semua kelompok, is_kompeten dihitung dari jawaban.
 */
import { Fragment, useEffect, useMemo, useState } from 'react'
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
import { Barcodes, DocTitle, IdentitasTable, fmtTanggalId } from './bnsp'

interface Soal {
  id: number
  no: number
  penilaian_lanjut: string | null
  pencapaian: boolean | null
  kuk?: { id: number; nama: string } | null
}
interface Subunit {
  id: number
  nama: string
  soal: Soal[]
}
interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
  subunits: Subunit[]
}
interface KelompokKerjaItem {
  id: number
  nama: string
  urut: number
  deskripsi?: string
  umpan_balik: string | null
  units: Unit[]
}
interface Ia01Data {
  barcodes?: Barcodes
  kelompok_kerja: { id?: number; kelompok_kerja?: KelompokKerjaItem[] } | KelompokKerjaItem[]
}
interface Ia01Response {
  message: string
  data?: Ia01Data
}

interface SoalAnswer {
  pencapaian: boolean | null
  penilaian_lanjut: string
}

export function Ia01Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ia01Response>(asesmenUrl(idIzin, 'ia01'))

  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [kelompokData, setKelompokData] = useState<KelompokKerjaItem[]>([])
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [answers, setAnswers] = useState<Record<number, SoalAnswer>>({})
  const [umpanBalik, setUmpanBalik] = useState('')
  const [expandedKelompok, setExpandedKelompok] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const inner = data?.data
    const kk = inner?.kelompok_kerja
    if (!kk) return

    setBarcodes(inner?.barcodes)

    // dokumen_id: nested {id, kelompok_kerja: [...]} atau flat [...]
    let dokId: number | null = null
    if (!Array.isArray(kk) && typeof kk.id === 'number') dokId = kk.id
    else if (Array.isArray(kk) && kk.length > 0) dokId = kk[0]?.id ?? null
    setDokumenId(dokId)

    const items: KelompokKerjaItem[] = Array.isArray(kk)
      ? kk
      : (kk.kelompok_kerja ?? [])
    setKelompokData(items)
    setExpandedKelompok(new Set(items.map((k) => k.id)))

    const init: Record<number, SoalAnswer> = {}
    let firstUmpanBalik = ''
    items.forEach((kelompok) => {
      if (!firstUmpanBalik && kelompok.umpan_balik) firstUmpanBalik = kelompok.umpan_balik
      kelompok.units.forEach((unit) => {
        unit.subunits.forEach((subunit) => {
          subunit.soal.forEach((soal) => {
            init[soal.id] = {
              pencapaian: soal.pencapaian ?? null,
              penilaian_lanjut: soal.penilaian_lanjut ?? '',
            }
          })
        })
      })
    })
    setAnswers(init)
    setUmpanBalik(firstUmpanBalik)
  }, [data])

  const toggleKelompok = (kelompokId: number) => {
    setExpandedKelompok((prev) => {
      const next = new Set(prev)
      if (next.has(kelompokId)) next.delete(kelompokId)
      else next.add(kelompokId)
      return next
    })
  }

  // Klik nilai sama = kosongkan soal itu; nilai baru = isi semua soal
  // (handlePencapaianChange Ia01Page).
  const handlePencapaianChange = (soalId: number, value: boolean) => {
    if (isSaving) return
    setAnswers((prev) => {
      const currentValue = prev[soalId]?.pencapaian
      if (currentValue === value) {
        return {
          ...prev,
          [soalId]: { ...prev[soalId], pencapaian: null },
        }
      }
      const updated: Record<number, SoalAnswer> = {}
      Object.keys(prev).forEach((key) => {
        const id = parseInt(key, 10)
        updated[id] = { ...prev[id], pencapaian: value }
      })
      return updated
    })
  }

  const setAnswer = (soalId: number, patch: Partial<SoalAnswer>) =>
    setAnswers((prev) => ({ ...prev, [soalId]: { ...prev[soalId], ...patch } }))

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.pencapaian !== null).length,
    [answers]
  )

  const handleSave = async () => {
    if (!dokumenId) {
      toast.showWarning('Data dokumen belum lengkap')
      return
    }
    setIsSaving(true)
    try {
      const payloadAnswers = Object.entries(answers)
        .filter(([, a]) => a.pencapaian !== null)
        .map(([soalId, a]) => ({
          soal_id: parseInt(soalId, 10),
          penilaian_lanjut: a.penilaian_lanjut.trim() || null,
          pencapaian: a.pencapaian,
        }))
      await saveDoc(asesmenUrl(idIzin, 'ia01'), {
        dokumen_id: dokumenId,
        answers: payloadAnswers,
        feedback: kelompokData.map((k) => ({ kelompok_id: k.id, umpan_balik: umpanBalik })),
        is_kompeten: payloadAnswers.length > 0 && payloadAnswers.every((a) => a.pencapaian === true),
      })
      toast.showSuccess('FR.IA.01 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.IA.01')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (kelompokData.length === 0) return <DocError message="Data FR.IA.01 tidak ditemukan." onRetry={reload} />

  const asesorList = dokumenHeader?.asesorList ?? []

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.IA.01.&nbsp;&nbsp;CEKLIS OBSERVASI AKTIVITAS DITEMPAT KERJA ATAU TEMPAT KERJA SIMULASI</DocTitle>

      {/* IDENTITAS */}
      {dokumenHeader && <IdentitasTable header={dokumenHeader} />}

      {/* PANDUAN BAGI ASESOR */}
      <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
        <div style={{ background: BRANDING.primaryColor, color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          PANDUAN BAGI ASESOR
        </div>
        <div style={{ padding: '10px', fontSize: '12px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Lengkapi nama unit kompetensi, elemen, dan kriteria unjuk kerja sesuai kolom dalam tabel.</li>
            <li>Isi standar industri atau tempat kerja.</li>
            <li>Beri tanda centang (✓) pada kolom "YA" jika asesi kompeten, dan "Tidak" jika sebaliknya.</li>
            <li>Penilaian lanjut diisi bila hasil belum dapat disimpulkan.</li>
            <li>Isi kolom KUK sesuai SKKNI.</li>
          </ul>
        </div>
      </div>

      {/* KELOMPOK PEKERJAAN */}
      {kelompokData.map((kelompok) => {
        const unitsWithSoal = kelompok.units.filter((unit) =>
          unit.subunits.some((subunit) => subunit.soal.length > 0)
        )
        return (
          <div key={kelompok.id} style={{ marginBottom: '15px' }}>
            {/* Kelompok Header (accordion) */}
            <div
              onClick={() => toggleKelompok(kelompok.id)}
              style={{
                background: BRANDING.primaryColor,
                color: '#fff',
                padding: '10px 12px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
              }}
            >
              <div>
                <span>Kelompok Pekerjaan {kelompok.urut}</span>
                {kelompok.deskripsi && (
                  <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'normal', marginTop: '2px', whiteSpace: 'pre-line' }}>
                    {kelompok.deskripsi}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '16px' }}>{expandedKelompok.has(kelompok.id) ? '▼' : '▶'}</span>
            </div>

            {expandedKelompok.has(kelompok.id) && (
              <>
                <br />
                {/* Units Table - Header */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '2px solid #000', borderTop: 'none' }}>
                  <thead>
                    <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                      <th style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>
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
                    {unitsWithSoal.map((unit, index) => (
                      <tr key={unit.id_unit}>
                        {index === 0 && (
                          <td rowSpan={unitsWithSoal.length} style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                            {kelompok.nama}
                            {kelompok.deskripsi && (
                              <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '4px', whiteSpace: 'pre-line' }}>
                                {kelompok.deskripsi}
                              </div>
                            )}
                          </td>
                        )}
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                          {index + 1}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <br />
                {/* Observation Table - per unit */}
                {unitsWithSoal.map((unit, filteredIndex) => (
                  <div key={unit.id_unit} style={{ marginBottom: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '20%', border: '1px solid #000', padding: '6px', background: '#fff' }}>Unit Kompetensi {filteredIndex + 1}</td>
                          <td style={{ width: '2%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                          <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '6px', background: '#fff' }}>Judul Unit</td>
                          <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                          <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                        </tr>
                      </tbody>
                    </table>
                    <br />
                    {/* Soal Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '2px solid #000', borderTop: 'none' }}>
                      <thead>
                        <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                          <th rowSpan={2} style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                          <th rowSpan={2} style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Elemen</th>
                          <th rowSpan={2} style={{ width: '35%', border: '1px solid #000', padding: '6px' }}>Kriteria Unjuk Kerja</th>
                          <th rowSpan={2} style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Standar Industri / Tempat Kerja</th>
                          <th colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Pencapaian</th>
                          <th rowSpan={2} style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Penilaian Lanjut</th>
                        </tr>
                        <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                          <th style={{ width: '5%', border: '1px solid #000', padding: '4px' }}>Ya</th>
                          <th style={{ width: '5%', border: '1px solid #000', padding: '4px' }}>Tidak</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unit.subunits.map((subunit) =>
                          subunit.soal.map((soal) => (
                            <tr key={soal.id}>
                              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{soal.no}</td>
                              <td style={{ border: '1px solid #000', padding: '6px' }}>{subunit.nama}</td>
                              <td style={{ border: '1px solid #000', padding: '6px' }}>{soal.kuk?.nama ?? ''}</td>
                              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>SKKNI</td>
                              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                                <CustomCheckbox
                                  checked={answers[soal.id]?.pencapaian === true}
                                  onChange={() => handlePencapaianChange(soal.id, true)}
                                  disabled={isSaving}
                                  style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                                <CustomCheckbox
                                  checked={answers[soal.id]?.pencapaian === false}
                                  onChange={() => handlePencapaianChange(soal.id, false)}
                                  disabled={isSaving}
                                  style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                                />
                              </td>
                              <td style={{ border: '1px solid #000', padding: '6px' }}>
                                <input
                                  type="text"
                                  value={answers[soal.id]?.penilaian_lanjut || ''}
                                  onChange={(e) => setAnswer(soal.id, { penilaian_lanjut: e.target.value })}
                                  disabled={isSaving}
                                  style={{
                                    width: '100%',
                                    border: '1px solid #ccc',
                                    padding: '4px',
                                    fontSize: '12px',
                                    cursor: isSaving ? 'not-allowed' : 'text',
                                  }}
                                  placeholder="Isi penilaian lanjut..."
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}
          </div>
        )
      })}

      {/* UMPAN BALIK - Single at the end */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
              <b>Umpan Balik untuk asesi:</b>
              <br />
              <textarea
                value={umpanBalik}
                onChange={(e) => setUmpanBalik(e.target.value)}
                disabled={isSaving}
                style={{
                  width: '100%',
                  minHeight: '70px',
                  border: '1px solid #ccc',
                  padding: '6px',
                  fontSize: '12px',
                  resize: 'vertical',
                  cursor: isSaving ? 'not-allowed' : 'text',
                  marginTop: '8px',
                }}
                placeholder="Tuliskan umpan balik untuk asesi..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* REKOMENDASI & TTD Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}><b>Rekomendasi:</b></td>
            <td colSpan={2} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}><b>Asesi</b></td>
          </tr>
          <tr>
            <td rowSpan={3 + 3 * asesorList.length} style={{ width: '50%', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', cursor: 'default' }}>
                <CustomCheckbox
                  checked={Object.values(answers).every((a) => a.pencapaian === true)}
                  onChange={() => {}}
                  disabled
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12px' }}>Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <b>KOMPETEN</b>.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'default' }}>
                <CustomCheckbox
                  checked={Object.values(answers).some((a) => a.pencapaian === false)}
                  onChange={() => {}}
                  disabled
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12px' }}>Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan <b>BELUM KOMPETEN</b>.</span>
              </label>
            </td>
            <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '35%', border: '1px solid #000', padding: '6px' }}>: {dokumenHeader?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan / Tanggal</td>
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
            <td colSpan={2} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}><b>Asesor</b></td>
            <td></td>
          </tr>
          {asesorList.map((asesor, idx) => {
            const asesorBarcode = idx === 0 ? barcodes?.asesor1 : barcodes?.asesor2
            const label = asesorList.length > 1 ? `Asesor ${idx + 1}` : 'Asesor'
            return (
              <Fragment key={asesor.id}>
                <tr>
                  <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Nama {label}</td>
                  <td style={{ width: '35%', border: '1px solid #000', padding: '6px' }}>: {asesor.nama?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg{asesorList.length > 1 ? ` ${idx + 1}` : ''}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>: {asesor.noreg || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan / Tanggal</td>
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

      <SaveBar
        isSaving={isSaving}
        onSave={handleSave}
        note={`${answeredCount} dari ${Object.keys(answers).length} KUK terjawab — baris belum dijawab tidak diubah.`}
      />
    </div>
  )
}
