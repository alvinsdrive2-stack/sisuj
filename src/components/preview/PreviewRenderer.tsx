// ── Helpers ──

const tableStyle = () => ({
  width: '100%' as const,
  borderCollapse: 'collapse' as const,
  marginBottom: '15px',
  fontSize: '13px',
  background: '#fff',
  border: '2px solid #000',
})

const cell = (w?: string) => ({
  border: '1px solid #000' as const,
  padding: '8px',
  width: w || 'auto',
})

const labelCell = () => ({
  ...cell('25%'),
  fontWeight: 'bold' as const,
  background: '#f9f9f9' as const,
})

const dividerCell = () => ({
  ...cell('5%'),
  textAlign: 'center' as const,
  borderLeft: 'none' as const,
  borderRight: 'none' as const,
})

const th = (w?: string) => ({
  ...cell(w),
  fontWeight: 'bold' as const,
  background: '#f0f0f0' as const,
  textAlign: 'center' as const,
})

const decodeHtmlEntities = (html: string) => {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = html
  return textArea.value
}

// ── Document Titles ──

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

// ── Shared Identity Table ──

function IdentityTable({ jabatan, skema, kualifikasi }: { jabatan?: string; skema?: string; kualifikasi?: string }) {
  const rows: { label: string; value: string }[] = []
  if (jabatan) rows.push({ label: 'Skema Sertifikasi', value: jabatan })
  if (skema) rows.push({ label: 'Nomor', value: skema })
  if (kualifikasi) rows.push({ label: 'Kualifikasi', value: kualifikasi })

  if (rows.length === 0) return null

  return (
    <table style={tableStyle()}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={labelCell()}>{r.label}</td>
            <td style={dividerCell()}>:</td>
            <td style={cell()}>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── APL 01 ──

export function Apl01Preview({ data }: { data: any }) {
  const s = data?.data_sertifikasi || {}
  const units = data?.data_unit_kompetensi || []
  const persyaratan = data?.bukti_persyaratan || []
  const administratif = data?.bukti_administratif || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.apl01}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {/* Identity Table */}
      <IdentityTable jabatan={s.nama_jabatan} skema={s.no_skema} kualifikasi={s.kualifikasi} />

      {/* Data Sertifikasi */}
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Data Sertifikasi</h3>
      <table style={tableStyle()}>
        <tbody>
          <tr><td style={labelCell()}>Nama Jabatan</td><td style={dividerCell()}>:</td><td style={cell()}>{s.nama_jabatan || '-'}</td></tr>
          <tr><td style={labelCell()}>No. Skema</td><td style={dividerCell()}>:</td><td style={cell()}>{s.no_skema || '-'}</td></tr>
          {s.kualifikasi && <tr><td style={labelCell()}>Kualifikasi</td><td style={dividerCell()}>:</td><td style={cell()}>{s.kualifikasi}</td></tr>}
          {s.jenjang && <tr><td style={labelCell()}>Jenjang</td><td style={dividerCell()}>:</td><td style={cell()}>{s.jenjang}</td></tr>}
          {s.skkni && <tr><td style={labelCell()}>SKKNI</td><td style={dividerCell()}>:</td><td style={cell()}>{s.skkni}</td></tr>}
        </tbody>
      </table>

      {/* Unit Kompetensi */}
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Unit Kompetensi</h3>
      <table style={tableStyle()}>
        <thead>
          <tr><th style={th('8%')}>No</th><th style={th('30%')}>Kode Unit</th><th style={th()}>Judul Unit</th></tr>
        </thead>
        <tbody>
          {units.length === 0 && <tr><td colSpan={3} style={cell()}>Tidak ada data</td></tr>}
          {units.map((u: any, i: number) => (
            <tr key={u.id || i}><td style={cell('8%')}>{i + 1}</td><td style={cell('30%')}>{u.kode || '-'}</td><td style={cell()}>{u.nama || '-'}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Bukti Persyaratan */}
      {persyaratan.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Bukti Persyaratan Dasar</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('8%')}>No</th><th style={th()}>Persyaratan</th><th style={th('15%')}>Status</th></tr></thead>
            <tbody>
              {persyaratan.map((p: any, i: number) => (
                <tr key={p.id || i}><td style={cell('8%')}>{p.no || i + 1}</td><td style={cell()}>{p.bukti || '-'}</td><td style={cell('15%')}>{p.checked ? '✔' : '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Bukti Administratif */}
      {administratif.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Bukti Administratif</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('8%')}>No</th><th style={th()}>Nama Dokumen</th><th style={th('15%')}>File</th></tr></thead>
            <tbody>
              {administratif.map((a: any, i: number) => (
                <tr key={a.id || i}><td style={cell('8%')}>{i + 1}</td><td style={cell()}>{a.nama || '-'}</td><td style={cell('15%')}>{a.file_url ? 'Ada' : '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── APL 02 ──

export function Apl02Preview({ data }: { data: any }) {
  const units = data?.data_unit || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.apl02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Unit Kompetensi</h3>
      {units.map((unit: any, idx: number) => (
        <div key={unit.id || idx} style={{ marginBottom: '20px' }}>
          <table style={tableStyle()}>
            <thead>
              <tr><th style={th('15%')}>Kode Unit</th><th style={th()}>Nama Unit</th><th style={th('15%')}>Kompeten</th></tr>
            </thead>
            <tbody>
              <tr><td style={cell('15%')}>{unit.kode || '-'}</td><td style={cell()}>{unit.nama || '-'}</td><td style={cell('15%')}>{unit.kompeten || '-'}</td></tr>
            </tbody>
          </table>

          {(unit.subunits || []).map((sub: any, si: number) => (
            <div key={sub.id || si} style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
                Sub Unit: {sub.kode || ''} - {sub.nama || ''}
              </p>
              {(sub.kuks || []).length > 0 && (
                <table style={tableStyle()}>
                  <thead><tr><th style={th('10%')}>No</th><th style={th('30%')}>Kode KUK</th><th style={th()}>Uraian KUK</th></tr></thead>
                  <tbody>
                    {sub.kuks.map((kuk: any, ki: number) => (
                      <tr key={kuk.id || ki}><td style={cell('10%')}>{ki + 1}</td><td style={cell('30%')}>{kuk.kode || '-'}</td><td style={cell()}>{kuk.nama || '-'}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      ))}
      {units.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data unit kompetensi</p>}
    </div>
  )
}

// ── MAPA 01 ──

export function Mapa01Preview({ data }: { data: any }) {
  const kelompoks = data?.kelompok_kerja || []
  const referensi = data?.referensi_form || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.mapa01}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {data?.skkni && <p style={{ fontSize: '13px', marginBottom: '10px' }}>SKKNI: {data.skkni}</p>}
      {data?.metode && <p style={{ fontSize: '13px', marginBottom: '10px' }}>Metode Asesmen: {data.metode}</p>}
      {data?.nama_jabatan_kerja && (
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
          Jabatan: {data.nama_jabatan_kerja}
        </p>
      )}

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Kelompok Kerja</h3>
      {kelompoks.map((k: any, i: number) => (
        <div key={k.id || i} style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            {k.urut ? `Kelompok Pekerjaan ${k.urut}. ` : ''}{k.nama || '-'}
          </p>
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

// ── MAPA 02 ──

export function Mapa02Preview({ data }: { data: any }) {
  const kelompoks = data?.kelompok_kerja || []
  const referensi = data?.referensi_form || []
  const referensiGlobal = data?.referensi_form_global || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.mapa02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {data?.potensi_asesi_index && (
        <p style={{ fontSize: '13px', marginBottom: '10px' }}>Potensi Asesi Index: {data.potensi_asesi_index}</p>
      )}

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Kelompok Kerja</h3>
      {kelompoks.map((k: any, i: number) => (
        <div key={k.id || i} style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            {k.urut ? `Kelompok Pekerjaan ${k.urut}. ` : ''}{k.nama || '-'}
          </p>
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
      ))}
      {kelompoks.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('10%')}>No</th><th style={th('50%')}>Referensi</th><th style={th()}>Keterangan</th></tr></thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}><td style={cell('10%')}>{i + 1}</td><td style={cell('50%')}>{r.nama || '-'}</td><td style={cell()}>{r.keterangan1 || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {referensiGlobal.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi Global</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('10%')}>No</th><th style={th()}>Nama</th></tr></thead>
            <tbody>
              {referensiGlobal.map((r: any, i: number) => (
                <tr key={r.id || i}><td style={cell('10%')}>{i + 1}</td><td style={cell()}>{r.nama || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── IA 01 / IA 03 ──

export function Ia01Preview({ data, docType }: { data: any; docType: string }) {
  const kelompoks = data?.kelompok_kerja || []
  const referensi = data?.referensi_form || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES[docType] || DOC_TITLES.ia01}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {kelompoks.map((kel: any, i: number) => (
        <div key={kel.id || i} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px', textTransform: 'uppercase' }}>
            {kel.nama || `Kelompok ${i + 1}`}
          </h3>

          {(kel.units || []).map((unit: any, ui: number) => (
            <div key={unit.id || ui} style={{ marginLeft: '10px', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
                {unit.unit?.kode ? `Unit: ${unit.unit.kode}` : unit.kode_unit || ''}
              </p>
              {(unit.questions || []).length > 0 && (
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={th('8%')}>No</th>
                      <th style={th('15%')}>KUK</th>
                      <th style={th('15%')}>Sub Unit</th>
                      <th style={th()}>Soal / Pertanyaan</th>
                      <th style={th('12%')}>Jenis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.questions.map((q: any, qi: number) => (
                      <tr key={q.id || qi}>
                        <td style={cell('8%')}>{q.no || qi + 1}</td>
                        <td style={cell('15%')}>{q.kuk?.kode || q.id_kuk || '-'}</td>
                        <td style={cell('15%')}>{q.subunitkompetensi?.kode || '-'}</td>
                        <td style={cell()}>{q.soal || '-'}</td>
                        <td style={cell('12%')}>{q.jenis || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {(unit.questions || []).length === 0 && (
                <p style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>Tidak ada soal</p>
              )}
            </div>
          ))}
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

// ── IA 02 (HTML content) ──

export function Ia02Preview({ data }: { data: any }) {
  const questions = data?.questions

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {questions?.isi_nonsoal ? (
        <div
          style={{ marginBottom: '20px', padding: '20px', background: '#fff', fontSize: '14px', lineHeight: '1.6' }}
          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(questions.isi_nonsoal) }}
        />
      ) : (
        <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada konten</p>
      )}
    </div>
  )
}

// ── IA 04.A ──

export function Ia04aPreview({ data }: { data: any }) {
  const kelompoks = data?.kelompok_kerja || []
  const soalList = data?.soal || []
  const referensi = data?.referensi_form || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia04a}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {/* Kelompok Kerja */}
      {kelompoks.map((k: any, i: number) => (
        <div key={k.id || i} style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            {k.urut ? `Kelompok ${k.urut}. ` : ''}{k.nama || '-'}
          </p>
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
      ))}

      {/* Soal Observasi */}
      {soalList.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Pertanyaan Observasi</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('8%')}>No</th><th style={th('15%')}>Jenis</th><th style={th()}>Pertanyaan</th><th style={th('15%')}>Jawaban</th></tr></thead>
            <tbody>
              {soalList.map((s: any, i: number) => (
                <tr key={s.id || i}>
                  <td style={cell('8%')}>{s.urut || i + 1}</td>
                  <td style={cell('15%')}>{s.jenis || '-'}</td>
                  <td style={cell()}>{decodeHtmlEntities(s.soal || '-')}</td>
                  <td style={cell('15%')}>{s.jawaban || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data?.persiapan_kegiatan && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Persiapan Kegiatan</h3>
          <p style={{ fontSize: '13px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>{data.persiapan_kegiatan}</p>
        </div>
      )}

      {data?.hal_demonstrasi && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Hal yang Didemonstrasikan</h3>
          <p style={{ fontSize: '13px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>{data.hal_demonstrasi}</p>
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

// ── IA 04.B ──

export function Ia04bPreview({ data }: { data: any }) {
  const soalList = data?.soal || []
  const rekomendasi = data?.rekomendasi || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia04b}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {data?.dokumen?.nama_dokumen && (
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>{data.dokumen.nama_dokumen}</p>
      )}

      {soalList.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Pertanyaan</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={th('8%')}>No</th>
                <th style={th('12%')}>Jenis</th>
                <th style={th('15%')}>Unit</th>
                <th style={th('15%')}>KUK</th>
                <th style={th()}>Soal</th>
              </tr>
            </thead>
            <tbody>
              {soalList.map((s: any, i: number) => (
                <tr key={s.id || i}>
                  <td style={cell('8%')}>{s.no || i + 1}</td>
                  <td style={cell('12%')}>{s.jenis || '-'}</td>
                  <td style={cell('15%')}>{s.unit?.kode || '-'}</td>
                  <td style={cell('15%')}>{s.kuk?.kode || '-'}</td>
                  <td style={cell()}>
                    <div>{s.soal || '-'}</div>
                    {s.soal1 && <div style={{ marginTop: '4px', fontSize: '12px', color: '#555' }}>Sub 1: {s.soal1}</div>}
                    {s.soal2 && <div style={{ marginTop: '2px', fontSize: '12px', color: '#555' }}>Sub 2: {s.soal2}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {rekomendasi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Rekomendasi</h3>
          <table style={tableStyle()}>
            <thead><tr><th style={th('8%')}>No</th><th style={th()}>Rekomendasi</th></tr></thead>
            <tbody>
              {rekomendasi.map((r: any, i: number) => (
                <tr key={r.id || i}><td style={cell('8%')}>{r.no || i + 1}</td><td style={cell()}>{r.soal || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── IA 05 ──

export function Ia05Preview({ data }: { data: any }) {
  const soalList = data?.soal || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia05}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {data?.dokumen?.nama_dokumen && (
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>{data.dokumen.nama_dokumen}</p>
      )}

      {soalList.map((s: any, i: number) => (
        <div key={s.id || i} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
            {s.no || i + 1}. {decodeHtmlEntities(s.soal || '-')}
          </p>
          {s.unit?.kode && <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Unit: {s.unit.kode}</p>}
          {s.kuk?.kode && <p style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>KUK: {s.kuk.kode}</p>}
          <div style={{ marginLeft: '20px', marginTop: '8px' }}>
            {s.jawab_a !== undefined && s.jawab_a !== null && <p style={{ fontSize: '13px', marginBottom: '3px', padding: '4px 8px', background: '#f9f9f9', borderLeft: '3px solid #ddd' }}>A. {decodeHtmlEntities(s.jawab_a)}</p>}
            {s.jawab_b !== undefined && s.jawab_b !== null && <p style={{ fontSize: '13px', marginBottom: '3px', padding: '4px 8px', background: '#f9f9f9', borderLeft: '3px solid #ddd' }}>B. {decodeHtmlEntities(s.jawab_b)}</p>}
            {s.jawab_c !== undefined && s.jawab_c !== null && <p style={{ fontSize: '13px', marginBottom: '3px', padding: '4px 8px', background: '#f9f9f9', borderLeft: '3px solid #ddd' }}>C. {decodeHtmlEntities(s.jawab_c)}</p>}
            {s.jawab_d !== undefined && s.jawab_d !== null && <p style={{ fontSize: '13px', marginBottom: '3px', padding: '4px 8px', background: '#f9f9f9', borderLeft: '3px solid #ddd' }}>D. {decodeHtmlEntities(s.jawab_d)}</p>}
          </div>
        </div>
      ))}
      {soalList.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada soal</p>}
    </div>
  )
}

// ── IA 08 / IA 09 ──

export function Ia08Preview({ data, docType }: { data: any; docType: string }) {
  const soalList = data?.soal || []
  const referensi = data?.referensi || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES[docType] || DOC_TITLES.ia08}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {soalList.map((kel: any, i: number) => (
        <div key={kel.id_kelompok || i} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px', textTransform: 'uppercase' }}>
            {kel.nama_kelompok || `Kelompok ${i + 1}`}
          </h3>
          {(kel.questions || []).length > 0 && (
            <table style={tableStyle()}>
              <thead>
                <tr>
                  <th style={th('8%')}>No</th>
                  <th style={th('15%')}>Unit</th>
                  <th style={th('15%')}>KUK</th>
                  <th style={th('15%')}>Sub Unit</th>
                  <th style={th()}>Pertanyaan</th>
                  <th style={th('12%')}>Jenis</th>
                </tr>
              </thead>
              <tbody>
                {kel.questions.map((q: any, qi: number) => (
                  <tr key={q.id || qi}>
                    <td style={cell('8%')}>{q.no || qi + 1}</td>
                    <td style={cell('15%')}>{q.unitkompetensi?.kode || '-'}</td>
                    <td style={cell('15%')}>{q.kuk?.kode || '-'}</td>
                    <td style={cell('15%')}>{q.subunitkompetensi?.kode || '-'}</td>
                    <td style={cell()}>{q.soal || '-'}</td>
                    <td style={cell('12%')}>{q.jenis || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      {soalList.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>}

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

// ── AK 02 ──

export function Ak02Preview({ data }: { data: any }) {
  const units = data?.data_unit_kompetensi || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ak02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Rekapitulasi Penilaian</h3>
      <table style={tableStyle()}>
        <thead>
          <tr>
            <th style={th('8%')}>No</th>
            <th style={th('15%')}>Kode</th>
            <th style={th()}>Nama Unit</th>
            <th style={th('12%')}>Observasi</th>
            <th style={th('12%')}>Portofolio</th>
            <th style={th('12%')}>Wawancara</th>
          </tr>
        </thead>
        <tbody>
          {units.length === 0 && <tr><td colSpan={6} style={cell()}>Tidak ada data</td></tr>}
          {units.map((u: any, i: number) => (
            <tr key={u.id || i}>
              <td style={cell('8%')}>{i + 1}</td>
              <td style={cell('15%')}>{u.kode || '-'}</td>
              <td style={cell()}>{u.nama || '-'}</td>
              <td style={cell('12%')}>{u.observasi || '-'}</td>
              <td style={cell('12%')}>{u.portofolio || '-'}</td>
              <td style={cell('12%')}>{u.pertanyaan_wawancara || u.pertanyaan_lisan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── AK 03 ──

export function Ak03Preview({ data }: { data: any }) {
  const soalList = data?.soal || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ak03}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Penetapan Kompetensi</h3>
      <table style={tableStyle()}>
        <thead>
          <tr>
            <th style={th('8%')}>No</th>
            <th style={th('15%')}>Jenis</th>
            <th style={th()}>Pernyataan</th>
            <th style={th('15%')}>Kompeten</th>
          </tr>
        </thead>
        <tbody>
          {soalList.length === 0 && <tr><td colSpan={4} style={cell()}>Tidak ada data</td></tr>}
          {soalList.map((s: any, i: number) => (
            <tr key={s.id || i}>
              <td style={cell('8%')}>{s.no || i + 1}</td>
              <td style={cell('15%')}>{s.jenis || '-'}</td>
              <td style={cell()}>{s.soal || '-'}</td>
              <td style={cell('15%')}>{s.is_kompeten ? 'Kompeten' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
