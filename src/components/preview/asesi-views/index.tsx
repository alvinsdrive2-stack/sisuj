/**
 * Shared pure rendering views for preview (admin-lsp) and asesi pages.
 * NO hooks, NO side effects. Pure presentational.
 */

import { CustomCheckbox } from "@/components/ui/Checkbox"

// ── Helpers ──

const tableStyle = (borderW?: string) => ({
  width: '100%' as const,
  borderCollapse: 'collapse' as const,
  marginBottom: '15px',
  fontSize: '13px',
  background: '#fff',
  border: (borderW || '1px') + ' solid #000',
})

const cell = (w?: string) => ({
  border: '1px solid #000' as const,
  padding: '6px',
  width: w || 'auto',
})

const th = (w?: string) => ({
  ...cell(w),
  fontWeight: 'bold' as const,
  background: '#c00000' as const,
  color: '#fff' as const,
  textAlign: 'center' as const,
})

const decodeHtmlEntities = (html: string) => {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = html
  return textArea.value
}

// ── Shared helpers for Ia08/Ia09 identity tables ──

const tableBordered = (borderW = '2px') => ({
  width: '100%' as const,
  borderCollapse: 'collapse' as const,
  marginBottom: '15px',
  fontSize: '13px',
  background: '#fff',
  border: `${borderW} solid #000`,
})

const cellBordered = () => ({
  border: '1px solid #000' as const,
  padding: '6px',
})

/**
 * Normalize kelompok_kerja from preview API.
 * Can be array direkt or { kelompok_kerja: [...] }
 */
function getKelompoks(data: any): any[] {
  const raw = data?.kelompok_kerja
  if (Array.isArray(raw)) return raw
  if (raw?.kelompok_kerja) return raw.kelompok_kerja
  return []
}

// ── DOC TITLES ──

export const DOC_TITLES: Record<string, string> = {
  apl01: 'FR.APL.01. ASESMEN MANDIRI',
  apl02: 'FR.APL.02. BUKTI KOMPETENSI',
  mapa01: 'FR.MAPA.01. MATRIX PROGRAM ASESMEN',
  mapa02: 'FR.MAPA.02. MATRIX PROGRAM ASESMEN LANJUTAN',
  ia01: 'FR.IA.01. TPD - TUGAS PRAKTIK DEMONSTRASI',
  ia02: 'FR.IA.02. TPD - TUGAS PRAKTIK DEMONSTRASI',
  ia03: 'FR.IA.03. TPD - TUGAS PRAKTIK DEMONSTRASI',
  ia04a: 'FR.IA.04.A. LEMBAR OBSERVASI',
  ia04b: 'FR.IA.04.B. PERTANYAAN TERTULIS/LISAN/WAWANCARA',
  ia05: 'FR.IA.05. TES TULIS',
  ia08: 'FR.IA.08. CEKLIS VERIFIKASI PORTOFOLIO',
  ia09: 'FR.IA.09. DAFTAR PERIKSA PORTOFOLIO',
  ak02: 'FR.AK.02. REKAPITULASI PENILAIAN',
  ak03: 'FR.AK.03. PENETAPAN KOMPETENSI',
}

// ============================================================
//  MAPA 02
// ============================================================

export function Mapa02View({ data, mode }: { data: any; mode: 'portofolio' | 'observasi' }) {
  const kelompoks = getKelompoks(data)
  const allUnits = kelompoks.flatMap((k: any) => k.units || [])
  const referensiMAPA02 = data?.referensi_form?.find((r: any) => r.kategori === "MAPA02_1")
  const keteranganReferensi = data?.referensi_form?.find((r: any) => r.kategori === "MAPA02-1")

  const renderCheckboxCell = (checked: boolean) => (
    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', cursor: 'not-allowed', userSelect: 'none', background: '#f5f5f5' }}>
      <CustomCheckbox checked={checked} onChange={() => {}} disabled style={{ pointerEvents: 'none' }} />
    </td>
  )

  const renderInstrumentTable = () => {
    if (!referensiMAPA02) return null
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px', fontSize: '12px', background: '#fff' }}>
        <tbody>
          <tr>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', background: '#c00000', color: '#fff' }}>No.</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff' }}>Instrumen Asesmen</th>
            <th colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              Potensi Asesi **
            </th>
          </tr>
          <tr>
            {[1, 2, 3, 4, 5].map(p => (
              <th key={p} style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '8%' }}>{p}</th>
            ))}
          </tr>
          {referensiMAPA02.referensis.map((ref: any, refIndex: number) => (
            <tr key={ref.id}>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{refIndex + 1}.</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{ref.nama}</td>
              {[1, 2, 3, 4, 5].map(potensi => (
                renderCheckboxCell(ref.isdefault === 1 && ref.potensi_asesi_index === potensi)
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '16px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>
          FR. MAPA.02 - {(data?.kelompok_kerja?.nama_dokumen || data?.nama_jabatan_kerja || 'FORMULIR MAPA 02').toUpperCase()}
        </h1>
      </div>

      {/* Skema Sertifikasi */}
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px', fontSize: '13px', background: '#fff' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', fontWeight: 'bold' }}>
              Skema Sertifikasi<br />(̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶
            </td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
              {(data?.nama_jabatan_kerja || '').toUpperCase()}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
              {data?.kode || ''}
            </td>
          </tr>
        </tbody>
      </table>

      {mode === 'portofolio' ? (
        <>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0', fontSize: '13px', background: '#fff' }}>
            <tbody>
              <tr>
                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '5%' }}>No.</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '20%' }}>Kode Unit</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Judul Unit</th>
              </tr>
              {allUnits.length === 0 && <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
              {allUnits.map((unit: any, i: number) => (
                <tr key={unit.id_unit || i}>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{i + 1}.</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{unit.kode_unit}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{unit.nama_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          {renderInstrumentTable()}
        </>
      ) : (
        kelompoks.map((kelompok: any) => (
          <div key={kelompok.id}>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0', fontSize: '13px', background: '#fff' }}>
              <tbody>
                <tr>
                  <th rowSpan={(kelompok.units || []).length + 1} style={{ border: '1px solid #000', padding: '6px 8px', width: '25%', verticalAlign: 'top', textAlign: 'left' }}>
                    {kelompok.nama}
                    {kelompok.deskripsi && (
                      <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'normal', marginTop: '4px', whiteSpace: 'pre-line' }}>{kelompok.deskripsi}</div>
                    )}
                  </th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '5%' }}>No.</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '20%' }}>Kode Unit</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Judul Unit</th>
                </tr>
                {(kelompok.units || []).length === 0 && <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
                {(kelompok.units || []).map((unit: any, i: number) => (
                  <tr key={unit.id_unit || i}>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{i + 1}.</td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{unit.kode_unit}</td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{unit.nama_unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            {renderInstrumentTable()}
          </div>
        ))
      )}

      {kelompoks.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data kelompok kerja</p>}

      {/* Keterangan */}
      {keteranganReferensi && (
        <div style={{ background: '#ffffff', border: '1px solid #6f6f6f', marginBottom: '16px', padding: '12px', fontSize: '14px' }}>
          <style>{`.keterangan-list ul, .keterangan-list ol { list-style-type: decimal; padding-left: 24px; margin: 8px 0; } .keterangan-list li { margin-bottom: 4px; }`}</style>
          <div className="keterangan-list" dangerouslySetInnerHTML={{ __html: keteranganReferensi.referensis[0]?.nama || '' }} />
        </div>
      )}

      {/* Tanda Tangan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '28pt' }}>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Status</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>No</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>Nama</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Nomor MET</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000', padding: '6px 8px' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Tanda Tangan dan Tanggal</span></td>
          </tr>
          <tr style={{ height: '91pt' }}>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '15px 0 0 0', background: '#fff' }}><span style={{ fontSize: '12px', paddingLeft: '15px' }}>Penyusun</span></td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', background: '#fff' }}><span style={{ fontSize: '12px', textAlign: 'center' }}>1</span></td>
            <td style={{ border: '1px solid #000', padding: '7px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '13px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '8px', background: '#fff', textAlign: 'center' }}></td>
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
            <td style={{ border: '1px solid #000', padding: '7px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '13px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '8px', background: '#fff', textAlign: 'center' }}></td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
//  MAPA 01
// ============================================================

export function Mapa01View({ data, mode }: { data: any; mode: 'portofolio' | 'observasi' }) {
  const kelompoks = getKelompoks(data)
  const allUnits = kelompoks.flatMap((k: any) => k.units || [])
  const referensiForm = data?.referensi_form || []

  return (
    <div>
      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: '16px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
          FR. MAPA.01 MERENCANAKAN AKTIVITAS DAN PROSES ASESMEN
        </h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>
              Skema Sertifikasi Okupasi Nasional
            </td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>Judul</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>
              {data?.nama_jabatan_kerja || data?.kelompok_kerja?.nama_dokumen || ''}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>
              {data?.kode || ''}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>SKKNI</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>
              {data?.skkni || ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ─── SECTION 1: Pendekatan Asesmen ─── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '23pt' }}>
            <td style={{ borderTop: '1px solid #000', borderLeft: '1px solid #000', borderBottom: '1px solid #000', borderRight: '1px solid #000', backgroundColor: '#C00000' }} colSpan={5}>
              <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'left' }}>1. Pendekatan Asesmen</p>
            </td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', background: '#fff', width: '5%' }}><p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>1.1.</p></td>
            <td style={{ border: '1px solid #000', background: '#fff', width: '20%' }}><p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>Asesi</p></td>
            <td style={{ border: '1px solid #000', background: '#fff' }} colSpan={3}>
              <p style={{ padding: '6px 8px', margin: 0, fontSize: '12px', fontStyle: 'italic' }}>
                {referensiForm.length > 0 ? `${referensiForm.length} referensi tersedia` : 'Data referensi tidak tersedia di preview'}
              </p>
            </td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', background: '#fff' }}><p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>Tujuan Asesmen</p></td>
            <td style={{ border: '1px solid #000', background: '#fff' }} colSpan={3}></td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', background: '#fff' }}><p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>Konteks Asesmen</p></td>
            <td style={{ border: '1px solid #000', background: '#fff' }} colSpan={3}></td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', background: '#fff' }}><p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>Tolok ukur asesmen</p></td>
            <td style={{ border: '1px solid #000', background: '#fff' }} colSpan={3}></td>
          </tr>
        </tbody>
      </table>
      <p style={{ margin: 0 }}><br /></p>

      {/* ─── SECTION 2: Mempersiapkan Rencana Asesmen ─── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', backgroundColor: '#C00000' }} colSpan={4}>
              <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'left' }}>2. Mempersiapkan Rencana Asesmen</p>
            </td>
          </tr>
        </tbody>
      </table>

      {mode === 'portofolio' ? (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} cellSpacing="0">
            <tbody>
              <tr style={{ height: '37pt' }}>
                <td style={{ border: '1px solid #000', background: '#fff', width: '10%' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>No.</p>
                </td>
                <td style={{ border: '1px solid #000', background: '#fff', width: '25%' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>Kode Unit</p>
                </td>
                <td style={{ border: '1px solid #000', background: '#fff' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>Judul Unit</p>
                </td>
              </tr>
              {allUnits.length === 0 && <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
              {allUnits.map((unit: any, i: number) => (
                <tr key={unit.id_unit || i}>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', background: '#fff' }}>
                    <p style={{ margin: 0, fontSize: '12px' }}>{i + 1}.</p>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', background: '#fff' }}>
                    <p style={{ margin: 0, fontSize: '12px' }}>{unit.kode_unit}</p>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>
                    <p style={{ margin: 0, fontSize: '12px' }}>{unit.nama_unit}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        kelompoks.map((kel: any) => (
          <div key={kel.id}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} cellSpacing="0">
              <tbody>
                <tr style={{ height: '37pt' }}>
                  <td style={{ border: '1px solid #000', background: '#fff' }} rowSpan={(kel.units || []).length + 1}>
                    <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'left' }}>
                      Kelompok Pekerjaan {kel.urut}
                    </p>
                    {kel.deskripsi && (
                      <p style={{ fontSize: '11px', padding: '0 8px 6px 8px', margin: 0, fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                        {kel.deskripsi}
                      </p>
                    )}
                  </td>
                  <td style={{ border: '1px solid #000', background: '#fff' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>No.</p>
                  </td>
                  <td style={{ border: '1px solid #000', background: '#fff' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>Kode Unit</p>
                  </td>
                  <td style={{ border: '1px solid #000', background: '#fff' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>Judul Unit</p>
                  </td>
                </tr>
                {(kel.units || []).length === 0 && <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
                {(kel.units || []).map((unit: any, i: number) => (
                  <tr key={unit.id_unit || i}>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', background: '#fff' }}>
                      <p style={{ margin: 0, fontSize: '12px' }}>{i + 1}.</p>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', background: '#fff' }}>
                      <p style={{ margin: 0, fontSize: '12px' }}>{unit.kode_unit}</p>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', background: '#fff' }}>
                      <p style={{ margin: 0, fontSize: '12px' }}>{unit.nama_unit}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ padding: '10px 0 0 0', margin: 0 }}><br /></p>
          </div>
        ))
      )}

      {kelompoks.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data kelompok kerja</p>}

      {/* ─── SECTION 3: Modifikasi ─── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '26pt' }}>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000' }} colSpan={2}>
              <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'left' }}>
                3. Modifikasi dan Kontekstualisasi:
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>3.1. a. Karakteristik kandidat:</p>
            </td>
            <td style={{ border: '1px solid #000', background: '#fff', padding: '12px 16px', fontSize: '12px', fontStyle: 'italic' }}>
              Data tidak tersedia di preview
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>3.1. b. Kebutuhan kontekstualisasi terkait tempat kerja:</p>
            </td>
            <td style={{ border: '1px solid #000', background: '#fff', padding: '12px 16px', fontSize: '12px', fontStyle: 'italic' }}>
              Data tidak tersedia di preview
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>3.2. Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan</p>
            </td>
            <td style={{ border: '1px solid #000', background: '#fff', padding: '12px 16px', fontSize: '12px', fontStyle: 'italic' }}>
              Data tidak tersedia di preview
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>3.3. Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi</p>
            </td>
            <td style={{ border: '1px solid #000', background: '#fff', padding: '12px 16px', fontSize: '12px', fontStyle: 'italic' }}>
              Data tidak tersedia di preview
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0, fontSize: '12px' }}>3.4. Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat asesmen</p>
            </td>
            <td style={{ border: '1px solid #000', background: '#fff', padding: '12px 16px', fontSize: '12px', fontStyle: 'italic' }}>
              Data tidak tersedia di preview
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ padding: '0 0 0 14px', margin: 0, fontSize: '12px', textAlign: 'left' }}>*Pilih salah satu opsi</p>
      <p style={{ padding: '5px 0 0 0', margin: 0 }}><br /></p>

      {/* ─── TANDA TANGAN ─── */}
      <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', paddingLeft: '13px' }}>
        Konfirmasi dengan orang yang relevan:
      </p>
      <p style={{ margin: 0 }}><br /></p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '28pt' }}>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', padding: '6px 8px' }}>Status</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>No</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>Nama</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Nomor MET</span></td>
            <td style={{ backgroundColor: '#C00000', border: '1px solid #000' }}><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Tanda Tangan dan Tanggal</span></td>
          </tr>
          <tr style={{ height: '91pt' }}>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '15px 0 0 0', background: '#fff' }}><span style={{ fontSize: '12px', paddingLeft: '15px' }}>Penyusun</span></td>
            <td style={{ border: '1px solid #000', padding: '6px 8px', background: '#fff' }}><span style={{ fontSize: '12px', textAlign: 'center' }}>1</span></td>
            <td style={{ border: '1px solid #000', padding: '7px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '13px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '8px', background: '#fff', textAlign: 'center' }}></td>
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
            <td style={{ border: '1px solid #000', padding: '7px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '13px 8px', background: '#fff', fontSize: '12px' }}></td>
            <td style={{ border: '1px solid #000', padding: '8px', background: '#fff', textAlign: 'center' }}></td>
          </tr>
          <tr style={{ height: '23pt' }}>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
            <td style={{ border: '1px solid #000', padding: '1px 8px', background: '#fff' }}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
//  IA 04.A
// ============================================================

export function Ia04aView({ data }: { data: any }) {
  const kelompoks = getKelompoks(data)
  const units = kelompoks[0]?.units || []
  const soalList = data?.soal || []
  const referensi = data?.referensi_form || []

  return (
    <div>
      {/* Kelompok Kerja */}
      {kelompoks.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c00000', color: '#fff', fontWeight: 'bold' }}>
              <td rowSpan={units.length + 1} style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #000', padding: '6px' }}>
                {kelompoks[0]?.nama || 'Kelompok Pekerjaan'}
                {kelompoks[0]?.deskripsi && (
                  <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '4px', whiteSpace: 'pre-line' }}>{kelompoks[0].deskripsi}</div>
                )}
              </td>
              <td style={{ width: '8%', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>No.</td>
              <td style={{ width: '25%', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Kode Unit</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Judul Unit</td>
            </tr>
            {units.map((unit: any, index: number) => (
              <tr key={unit.id_unit || index}>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{index + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Soal Sections */}
      {soalList.length > 0 && (
        <>
          <br />
          {soalList.map((soalItem: any, i: number) => (
            <table key={soalItem.id || i} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff', border: '1px solid #000', marginTop: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '28%', fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>
                    <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(soalItem.soal || '-') }} />
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {soalItem.jawaban ? (
                      <div style={{ margin: '5px 0', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(soalItem.jawaban) }} />
                    ) : (
                      <div style={{ height: '40px' }}></div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
        </>
      )}

      {data?.persiapan_kegiatan && (
        <div style={{ marginBottom: '15px', marginTop: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Persiapan Kegiatan</h3>
          <p style={{ fontSize: '13px', padding: '10px', border: '1px solid #000' }}>{data.persiapan_kegiatan}</p>
        </div>
      )}

      {data?.hal_demonstrasi && (
        <div style={{ marginBottom: '15px', marginTop: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Hal yang Didemonstrasikan</h3>
          <p style={{ fontSize: '13px', padding: '10px', border: '1px solid #000' }}>{data.hal_demonstrasi}</p>
        </div>
      )}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('10%')}>No</th><th style={th()}>Nama Referensi</th></tr></thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}><td style={cell('10%')}>{i + 1}</td><td style={cell()}>{r.nama || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ============================================================
//  IA 01
// ============================================================

export function Ia01View({ data }: { data: any }) {
  const kelompoks = getKelompoks(data)
  const referensi = data?.referensi_form || []

  return (
    <div>
      {/* Panduan */}
      <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
        <div style={{ background: '#c40000', color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
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

      {kelompoks.map((kel: any) => (
        <div key={kel.id} style={{ marginBottom: '20px' }}>
          {/* Red header */}
          <div style={{ background: '#c40000', color: '#fff', padding: '10px 12px', fontSize: '13px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold' }}>Kelompok Pekerjaan {kel.urut || ''}</div>
            {kel.deskripsi && <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'normal', marginTop: '2px', whiteSpace: 'pre-line' }}>{kel.deskripsi}</div>}
          </div>

          {/* Units table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
            <thead>
              <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                <th style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>
                  Kelompok Pekerjaan {kel.urut || ''}
                </th>
                <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                <th style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Kode Unit</th>
                <th style={{ border: '1px solid #000', padding: '6px' }}>Judul Unit</th>
              </tr>
            </thead>
            <tbody>
              {(kel.units || []).length === 0 && <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
              {(kel.units || []).map((unit: any, index: number) => (
                <tr key={unit.id_unit || index}>
                  {index === 0 && (
                    <td rowSpan={(kel.units || []).length} style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                      {kel.nama}
                      {kel.deskripsi && <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '4px', whiteSpace: 'pre-line' }}>{kel.deskripsi}</div>}
                    </td>
                  )}
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />

          {/* Per-unit observation table */}
          {(kel.units || []).map((unit: any, ui: number) => {
            const questions = unit.questions || unit.subunits?.flatMap((s: any) => s.soal) || []
            if (questions.length === 0) return null
            return (
              <div key={unit.id_unit || ui} style={{ marginBottom: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '20%', border: '1px solid #000', padding: '6px', background: '#fff' }}>Unit Kompetensi {ui + 1}</td>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
                  <thead>
                    <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                      <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                      <th style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>KUK</th>
                      <th style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Sub Unit</th>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>Soal / Pertanyaan</th>
                      <th style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Jenis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q: any, qi: number) => (
                      <tr key={q.id || qi}>
                        <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{q.no || qi + 1}</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{q.kuk?.kode || q.id_kuk || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{q.subunitkompetensi?.kode || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{q.soal || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{q.jenis || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      ))}

      {kelompoks.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('10%')}>No</th><th style={th()}>Nama Referensi</th></tr></thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}><td style={cell('10%')}>{i + 1}</td><td style={cell()}>{r.nama || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ============================================================
//  IA 03
// ============================================================

export function Ia03View({ data }: { data: any }) {
  const kelompoks = getKelompoks(data)
  const referensi = data?.referensi_form || []

  return (
    <div>
      {/* Panduan */}
      <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
        <div style={{ background: '#c40000', color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
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

      {kelompoks.map((kel: any) => (
        <div key={kel.id} style={{ marginBottom: '20px' }}>
          {/* Units table with kelompok header */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
            <thead>
              <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                <th style={{ width: '18%', border: '1px solid #000', padding: '6px' }}>
                  Kelompok Pekerjaan {kel.urut || ''}
                  {kel.deskripsi && (
                    <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'normal', marginTop: '2px', whiteSpace: 'pre-line' }}>
                      {kel.deskripsi}
                    </div>
                  )}
                </th>
                <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                <th style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Kode Unit</th>
                <th style={{ border: '1px solid #000', padding: '6px' }}>Judul Unit</th>
              </tr>
            </thead>
            <tbody>
              {(kel.units || []).length === 0 && <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
              {(kel.units || []).map((unit: any, index: number) => (
                <tr key={unit.id_unit || index}>
                  {index === 0 && (
                    <td rowSpan={(kel.units || []).length} style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}></td>
                  )}
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.kode_unit}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.nama_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />

          {/* Questions table */}
          {(kel.soal || kel.units?.flatMap((u: any) => u.questions || []) || []).length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
              <thead>
                <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                  <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan</th>
                  <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>Ya</th>
                  <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>Tidak</th>
                </tr>
              </thead>
              <tbody>
                {kel.soal?.length > 0 ? (
                  /* Ia03-style: soal langsung di kelompok */
                  kel.soal.map((soal: any) => (
                    <tr key={soal.id}>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>
                        {soal.no}. {soal.soal}
                        <br /><br />
                        <span style={{ fontSize: '11px' }}>
                          Uk.{soal.unitkompetensi?.kode || ''} EK.{soal.subunitkompetensi?.kode || ''} KUK.{soal.kuk?.kode || ''}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>-</td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>-</td>
                    </tr>
                  ))
                ) : (
                  /* Fallback: questions from units */
                  (kel.units || []).flatMap((u: any) => u.questions || []).map((q: any, qi: number) => (
                    <tr key={q.id || qi}>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>
                        {q.no || qi + 1}. {q.soal || '-'}
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>-</td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>-</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {kelompoks.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('10%')}>No</th><th style={th()}>Nama Referensi</th></tr></thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}><td style={cell('10%')}>{i + 1}</td><td style={cell()}>{r.nama || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ============================================================
//  AK 02
// ============================================================

export function Ak02View({ data }: { data: any }) {
  const units = data?.data_unit_kompetensi || []

  const methods = [
    'Observasi Demonstrasi',
    'Portofolio',
    'Pertanyaan Wawancara',
    'Pertanyaan Lisan',
    'Pertanyaan Tertulis',
    'Proyek Kerja',
    'Lainnya',
  ]

  const getMethodKey = (label: string) => {
    const map: Record<string, string> = {
      'Observasi Demonstrasi': 'observasi',
      'Portofolio': 'portofolio',
      'Pertanyaan Wawancara': 'pertanyaan_wawancara',
      'Pertanyaan Lisan': 'pertanyaan_lisan',
      'Pertanyaan Tertulis': 'pertanyaan_tertulis',
      'Proyek Kerja': 'proyek_kerja',
      'Lainnya': 'lainnya',
    }
    return map[label] || ''
  }

  // Map methods to multi-line labels matching real page
  const methodLines = [
    ['Observasi Demonstrasi'],
    ['Portofolio'],
    ['Pernyataan Pihak Ketiga', 'Pertanyaan wawancara'],
    ['Pertanyaan Lisan'],
    ['Pertanyaan Tertulis'],
    ['Proyek Kerja'],
    ['Lainnya'],
  ]

  return (
    <div>
      {/* Identity Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)</td>
            <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.jabatan_kerja || data?.nama_jabatan_kerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.nomor_skema || data?.kode || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.tuk || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.nama_asesi || '-'}</td>
          </tr>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Tanggal Asesmen</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>Mulai :</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>-</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>Selesai :</td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>-</td>
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
            {methodLines.map((lines) => (
              <th key={lines.join('')} style={{ border: '1px solid #000', padding: '8px 4px', width: '20px', textAlign: 'center', verticalAlign: 'middle', position: 'relative' }}>
                <div style={{ writingMode: 'vertical-rl', whiteSpace: 'nowrap', visibility: 'hidden', fontSize: '12px', lineHeight: '1.3' }}>
                  {lines.map((line, i) => (
                    <span key={i}>{line}{i < lines.length - 1 && <br/>}</span>
                  ))}
                </div>
                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '12px', lineHeight: '1.3' }}>
                    {lines.map((line, i) => (
                      <span key={i}>{line}{i < lines.length - 1 && <br/>}</span>
                    ))}
                  </div>
                </div>
              </th>
            ))}
          </tr>

          {units.length === 0 && (
            <tr>
              <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                Tidak ada data
              </td>
            </tr>
          )}
          {units.map((u: any, i: number) => (
            <tr key={u.id || i}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {u.kode || '-'}<br />{u.nama || '-'}
              </td>
              {methods.map((m) => {
                const key = getMethodKey(m)
                const val = u[key]
                return (
                  <td key={m} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                    {val ? <CustomCheckbox checked disabled style={{ pointerEvents: 'none' }} onChange={() => {}} /> : ''}
                  </td>
                )
              })}
            </tr>
          ))}

          {/* Rekomendasi */}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}><b>Rekomendasi hasil asesmen</b></td>
            <td colSpan={7} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '13px' }}>
              <span style={{ marginRight: '20px' }}>Kompeten</span>
              <span>Belum kompeten</span>
            </td>
          </tr>

          {/* Tindak lanjut */}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <b>Tindak lanjut yang dibutuhkan</b>
            </td>
            <td colSpan={7} style={{ border: '1px solid #000', padding: '6px', fontSize: '13px', fontStyle: 'italic' }}>
              -
            </td>
          </tr>

          {/* Komentar */}
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}><b>Komentar / Observasi oleh asesor</b></td>
            <td colSpan={7} style={{ border: '1px solid #000', padding: '6px', fontSize: '13px', fontStyle: 'italic' }}>
              -
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tanda Tangan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}><b>Asesi :</b></td>
          </tr>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.nama_asesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
            <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
          </tr>
        </tbody>
      </table>

      {/* Lampiran */}
      <div style={{ fontSize: '13px', marginBottom: '15px' }}>
        <b>LAMPIRAN DOKUMEN:</b><br />
        1. Dokumen APL 01 peserta<br />
        2. Dokumen APL 02 peserta<br />
        3. Bukti-bukti berkualitas peserta<br />
        4. Tinjauan proses asesmen
      </div>
    </div>
  )
}

// ============================================================
//  IA 08
// ============================================================

export function Ia08View({ data }: { data: any }) {
  const soalList = data?.soal || []

  return (
    <div>
      {/* Identity Table */}
      <table style={tableBordered()}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', ...cellBordered() }}>
              Skema Sertifikasi<br /><span style={{ fontSize: '12px' }}>(KKNI/Okupasi/Klaster)</span>
            </td>
            <td style={{ width: '12%', ...cellBordered() }}>Judul</td>
            <td style={{ width: '3%', ...cellBordered(), textAlign: 'center' }}>:</td>
            <td style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.nama_jabatan_kerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>Nomor</td>
            <td style={{ ...cellBordered(), textAlign: 'center' }}>:</td>
            <td style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.kode || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>TUK</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.tuk || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>Nama Asesi</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.nama_asesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>Tanggal</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ ...cellBordered() }}>-</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '12px', marginBottom: '15px' }}>*Coret yang tidak perlu</div>

      {/* Panduan */}
      <div style={{ marginBottom: '15px', border: '2px solid #000', background: '#fff' }}>
        <div style={{ background: '#c40000', color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px' }}>
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

      {/* Soal / Wawancara table */}
      {soalList.length > 0 ? (
        soalList.map((kel: any, i: number) => (
          <div key={kel.id_kelompok || i} style={{ marginBottom: '20px' }}>
            <div style={{ background: '#c40000', color: '#fff', padding: '10px 12px', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
              {kel.nama_kelompok || `Kelompok ${i + 1}`}
            </div>

            {/* Dokumen Portofolio placeholder */}
            <div style={{ marginBottom: '15px', padding: '12px', border: '1px solid #ccc', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
              Data portofolio tidak tersedia di preview
            </div>

            {(kel.questions || []).length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '2px solid #000' }}>
                <tbody>
                  <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '5%' }}>No</td>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '18%' }}>Unit Kompetensi</td>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '12%' }}>KUK</td>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '15%' }}>Sub Unit</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>Materi / Pertanyaan</td>
                  </tr>
                  {kel.questions.map((q: any, qi: number) => (
                    <tr key={q.id || qi}>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{q.no || qi + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>{q.unitkompetensi?.kode || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>{q.kuk?.kode || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>{q.subunitkompetensi?.kode || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>{q.soal || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      ) : (
        <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>
      )}

      {/* Tanda Tangan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Asesi :</td>
          </tr>
          <tr>
            <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.nama_asesi || data?.nama_asesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', height: '60px' }}></td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Asesor 1 :</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', height: '60px' }}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
//  IA 09
// ============================================================

export function Ia09View({ data }: { data: any }) {
  const soalList = data?.soal || []

  return (
    <div>
      {/* Identity Table */}
      <table style={tableBordered()}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '30%', ...cellBordered() }}>
              Skema Sertifikasi<br /><span style={{ fontSize: '11px' }}>(KKNI/Okupasi/Klaster)</span>
            </td>
            <td style={{ width: '12%', ...cellBordered() }}>Judul</td>
            <td style={{ width: '3%', ...cellBordered(), textAlign: 'end' }}>:</td>
            <td style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.nama_jabatan_kerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>Nomor</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.kode || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>TUK</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.tuk || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>Nama Asesi</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ ...cellBordered(), textTransform: 'uppercase' }}>{data?.nama_asesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cellBordered() }}>Tanggal</td>
            <td style={{ ...cellBordered(), textAlign: 'end' }}>:</td>
            <td colSpan={2} style={{ ...cellBordered() }}>-</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>*Coret yang tidak perlu</div>

      {/* Panduan */}
      <table style={tableBordered()}>
        <tbody>
          <tr>
            <td style={{ background: '#c40000', color: '#fff', padding: '6px', fontWeight: 'bold', fontSize: '13px', textAlign: 'left' }}>
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

      {/* Bukti placeholder */}
      <div style={{ marginBottom: '15px', padding: '12px', border: '1px solid #ccc', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
        Data bukti portofolio tidak tersedia di preview
      </div>

      {/* Pertanyaan Table */}
      {soalList.length > 0 ? (
        soalList.map((kel: any, i: number) => (
          <div key={kel.id_kelompok || i} style={{ marginBottom: '20px' }}>
            <div style={{ background: '#c40000', color: '#fff', padding: '10px 12px', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
              {kel.nama_kelompok || `Kelompok ${i + 1}`}
            </div>
            {(kel.questions || []).length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
                <tbody>
                  <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '5%' }}>No.</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>Daftar Pertanyaan Wawancara</td>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>K</td>
                    <td style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>BK</td>
                  </tr>
                  {kel.questions.map((q: any, qi: number) => (
                    <tr key={q.id || qi}>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{q.no || qi + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-line' }}>
                        {q.soal || '-'}
                        {q.unitkompetensi?.kode && (
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            Unit: {q.unitkompetensi?.kode} | KUK: {q.kuk?.kode || '-'} | Sub: {q.subunitkompetensi?.kode || '-'}
                          </div>
                        )}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>-</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      ) : (
        <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>
      )}

      {/* Tanda Tangan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Asesi :</td>
          </tr>
          <tr>
            <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{data?.nama_asesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', height: '60px' }}></td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Asesor 1 :</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', height: '60px' }}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
