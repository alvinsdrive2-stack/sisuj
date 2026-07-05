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

const labelCell = () => ({
  ...cell('25%'),
  fontWeight: 'bold' as const,
  background: '#fff' as const,
  textTransform: 'uppercase' as const,
})

const dividerCell = () => ({
  ...cell('5%'),
  textAlign: 'center' as const,
  padding: '6px 2px',
})

const th = (w?: string) => ({
  ...cell(w),
  fontWeight: 'bold' as const,
  background: '#c40000' as const,
  color: '#fff' as const,
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

function IdentityTable({ items }: { items: { label: string; value?: string }[] }) {
  const filtered = items.filter(i => i.value)
  if (filtered.length === 0) return null

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
      <tbody>
        {filtered.map((r, i) => (
          <tr key={i}>
            <td style={{ ...cell('30%'), fontWeight: 'bold', textTransform: 'uppercase' }}>{r.label}</td>
            <td style={{ ...cell('5%'), textAlign: 'center' }}>:</td>
            <td style={{ ...cell(), textTransform: 'uppercase' }}>{r.value}</td>
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
      <IdentityTable items={[
        { label: 'Skema Sertifikasi', value: s.nama_jabatan },
        { label: 'No. Skema', value: s.no_skema },
        { label: 'Kualifikasi', value: s.kualifikasi },
        { label: 'Jenjang', value: s.jenjang },
        { label: 'SKKNI', value: s.skkni },
      ]} />

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

      {/* Daftar Unit Kompetensi */}
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Daftar Unit Kompetensi</h3>
      <table style={tableStyle()}>
        <thead>
          <tr><th style={th('8%')}>No</th><th style={th('30%')}>Kode Unit</th><th style={th()}>Judul Unit</th><th style={th('25%')}>Jenis Standar</th></tr>
        </thead>
        <tbody>
          {units.length === 0 && <tr><td colSpan={4} style={cell()}>Tidak ada data</td></tr>}
          {units.map((u: any, i: number) => (
            <tr key={u.id || i}><td style={cell('8%')}>{i + 1}</td><td style={cell('30%')}>{u.kode || '-'}</td><td style={cell()}>{u.nama || '-'}</td>
              {i === 0 && <td rowSpan={units.length} style={{ ...cell('25%'), textAlign: 'center', verticalAlign: 'middle' }}>{s.skkni || 'SKKNI'}</td>}
            </tr>
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

      {/* Panduan */}
      <div style={{ marginBottom: '15px', border: '1px solid #000', background: '#fff' }}>
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

      {kelompoks.map((kel: any, i: number) => (
        <div key={kel.id || i} style={{ marginBottom: '20px' }}>
          {/* Red header */}
          <div style={{ background: '#c40000', color: '#fff', padding: '10px 12px', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
            Kelompok Pekerjaan {kel.urut || i + 1}
          </div>

          {(kel.units || []).map((unit: any, ui: number) => (
            <div key={unit.id || ui} style={{ marginLeft: '10px', marginBottom: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '1px solid #000', marginBottom: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '20%', border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Unit Kompetensi</td>
                    <td style={{ width: '3%', border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.unit?.kode || unit.kode_unit || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Judul Unit</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'end' }}>:</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{unit.unit?.nama || unit.nama_unit || '-'}</td>
                  </tr>
                </tbody>
              </table>

              {(unit.questions || []).length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '1px solid #000' }}>
                  <thead>
                    <tr style={{ background: '#c40000', color: '#fff' }}>
                      <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                      <th style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>KUK</th>
                      <th style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Sub Unit</th>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>Soal / Pertanyaan</th>
                      <th style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Jenis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.questions.map((q: any, qi: number) => (
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
  const units = (kelompoks[0]?.units || [])
  const soalList = data?.soal || []
  const referensi = data?.referensi_form || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia04a}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

      {/* Panduan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>PANDUAN BAGI ASESOR</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <ul style={{ margin: '5px 0 5px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '6px' }}>Tentukan proyek singkat atau kegiatan terstruktur lainnya yang harus dipersiapkan dan dipresentasikan oleh asesi.</li>
                <li style={{ marginBottom: '6px' }}>Proyek singkat atau kegiatan terstruktur lainnya dibuat untuk keseluruhan unit kompetensi dalam Skema Sertifikasi atau untuk masing-masing kelompok pekerjaan.</li>
                <li style={{ marginBottom: '0' }}>Kumpulkan hasil proyek singkat atau kegiatan terstruktur lainnya sesuai dengan hasil keluaran yang telah ditetapkan.</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Kelompok Kerja */}
      {kelompoks.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold' }}>
              <td rowSpan={units.length + 1} style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #000', padding: '6px' }}>
                {kelompoks[0]?.nama || 'Kelompok Pekerjaan'}
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
                    {decodeHtmlEntities(soalItem.soal || '-')}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {soalItem.jawaban ? (
                      <div style={{ margin: '5px 0', lineHeight: '1.6' }}>{soalItem.jawaban}</div>
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
          {/* Red header */}
          <div style={{ background: '#c40000', color: '#fff', padding: '10px 12px', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
            {kel.nama_kelompok || `Kelompok ${i + 1}`}
          </div>
          {(kel.questions || []).length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#fff', border: '1px solid #000' }}>
              <thead>
                <tr style={{ background: '#c40000', color: '#fff' }}>
                  <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</th>
                  <th style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Unit</th>
                  <th style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>KUK</th>
                  <th style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Sub Unit</th>
                  <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan</th>
                  <th style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Jenis</th>
                </tr>
              </thead>
              <tbody>
                {kel.questions.map((q: any, qi: number) => (
                  <tr key={q.id || qi}>
                    <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>{q.no || qi + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{q.unitkompetensi?.kode || '-'}</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{q.kuk?.kode || '-'}</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{q.subunitkompetensi?.kode || '-'}</td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{q.soal || '-'}</td>
                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{q.jenis || '-'}</td>
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
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ak02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview — data tidak dapat diedit</p>

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
