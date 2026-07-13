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
  ia08: 'FR.IA.08. VERIFIKASI PORTOFOLIO',
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

  const renderCheckboxCell = (checked: boolean) => (
    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', cursor: 'not-allowed', userSelect: 'none', background: '#f5f5f5' }}>
      <CustomCheckbox
        checked={checked}
        onChange={() => {}}
        disabled
        style={{ pointerEvents: 'none' }}
      />
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
      {/* Skema Sertifikasi */}
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px', fontSize: '13px', background: '#fff' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', fontWeight: 'bold' }}>
              Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)
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
        /* ═══ PORTOFOLIO ═══ */
        <>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0', fontSize: '13px', background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '5%' }}>No.</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '20%' }}>Kode Unit</th>
                <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Judul Unit</th>
              </tr>
            </thead>
            <tbody>
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
        /* ═══ OBSERVASI ═══ */
        kelompoks.map((kelompok: any) => (
          <div key={kelompok.id}>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0', fontSize: '13px', background: '#fff' }}>
              <thead>
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
              </thead>
              <tbody>
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
    </div>
  )
}

// ============================================================
//  MAPA 01
// ============================================================

export function Mapa01View({ data, mode }: { data: any; mode: 'portofolio' | 'observasi' }) {
  const kelompoks = getKelompoks(data)
  const allUnits = kelompoks.flatMap((k: any) => k.units || [])
  const referensi = data?.referensi_form || []

  return (
    <div>
      {data?.skkni && <p style={{ fontSize: '13px', marginBottom: '10px' }}>SKKNI: {data.skkni}</p>}
      {data?.metode && <p style={{ fontSize: '13px', marginBottom: '10px' }}>Metode Asesmen: {data.metode}</p>}
      {data?.nama_jabatan_kerja && (
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
          Jabatan: {data.nama_jabatan_kerja}
        </p>
      )}

      {mode === 'portofolio' ? (
        <table style={tableStyle()}>
          <thead><tr><th style={th('10%')}>No</th><th style={th('35%')}>Kode Unit</th><th style={th()}>Nama Unit</th></tr></thead>
          <tbody>
            {allUnits.length === 0 && <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#999' }}>Tidak ada data</td></tr>}
            {allUnits.map((unit: any, i: number) => (
              <tr key={unit.id_unit || i}><td style={cell('10%')}>{i + 1}</td><td style={cell('35%')}>{unit.kode_unit || '-'}</td><td style={cell()}>{unit.nama_unit || '-'}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        kelompoks.map((k: any, i: number) => (
          <div key={k.id || i} style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '4px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>
                {k.urut ? `Kelompok Pekerjaan ${k.urut}. ` : ''}{k.nama || '-'}
              </p>
              {k.deskripsi && <p style={{ fontSize: '12px', fontStyle: 'italic', margin: '0 0 4px 0', whiteSpace: 'pre-line' }}>{k.deskripsi}</p>}
            </div>
            {(k.units || []).length > 0 && (
              <table style={tableStyle()}>
                <thead><tr><th style={th('10%')}>No</th><th style={th('35%')}>Kode Unit</th><th style={th()}>Nama Unit</th></tr></thead>
                <tbody>
                  {k.units.map((u: any, ui: number) => (
                    <tr key={u.id_unit || ui}><td style={cell('10%')}>{ui + 1}</td><td style={cell('35%')}>{u.kode_unit || '-'}</td><td style={cell()}>{u.nama_unit || '-'}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}

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

  return (
    <div>
      <p style={{ fontSize: '13px', marginBottom: '15px' }}>
        Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
        <tbody>
          <tr style={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Unit kompetensi</th>
            {methods.map((m) => (
              <th key={m} style={{ border: '1px solid #000', padding: '8px 4px', width: '20px', textAlign: 'center', verticalAlign: 'middle', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '12px', lineHeight: '1.3' }}>
                    {m}
                  </div>
                </div>
              </th>
            ))}
          </tr>
          {units.length === 0 && (
            <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '13px' }}>Tidak ada data</td></tr>
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
                  <td key={m} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                    {val ? '✓' : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
