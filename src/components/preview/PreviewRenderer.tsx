import { useState } from "react"
import { Mapa01View, Mapa02View, Ia04aView, Ia01View, Ia03View, Ak02View, Ia08View, Ia09View } from "./asesi-views"
import { BRANDING } from "@/config/branding"

// â”€â”€ Helpers â”€â”€

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
  background: BRANDING.primaryColor,
  color: '#fff' as const,
  textAlign: 'center' as const,
})

const decodeHtmlEntities = (html: string) => {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = html
  return textArea.value
}

// â”€â”€ Document Titles â”€â”€

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

// â”€â”€ Shared Identity Table â”€â”€

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

// â”€â”€ APL 01 â”€â”€

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
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

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
                <tr key={p.id || i}><td style={cell('8%')}>{p.no || i + 1}</td><td style={cell()}>{p.bukti || '-'}</td><td style={cell('15%')}>{p.checked ? 'âœ“' : '-'}</td></tr>
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
            <thead><tr><th style={th('8%')}>No</th><th style={th()}>Nama Dokumen</th><th style={th('10%')}>Ada</th></tr></thead>
            <tbody>
              {administratif.map((a: any, i: number) => (
                <tr key={a.id || i}>
                  <td style={cell('8%')}>{i + 1}</td>
                  <td style={cell()}>{a.bukti || '-'}</td>
                  <td style={cell('10%')}>{a.checked || a.foto_url || a.ktp_url ? 'Ada' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// â”€â”€ APL 02 â”€â”€

export function Apl02Preview({ data }: { data: any }) {
  const units = data?.data_unit || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.apl02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

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

// â”€â”€ MAPA 01 â”€â”€

export function Mapa01Preview({ data }: { data: any }) {
  const [viewMode, setViewMode] = useState<'portofolio' | 'observasi' | null>(null)

  if (!viewMode) {
    return (
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
          {DOC_TITLES.mapa01}
        </h1>
        <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px', marginBottom: '40px' }}>
          <button onClick={() => setViewMode('portofolio')} style={{
            padding: '16px 40px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            background: BRANDING.primaryColor, color: '#fff', border: 'none', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            Tampilan Portofolio
          </button>
          <button onClick={() => setViewMode('observasi')} style={{
            padding: '16px 40px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            background: '#333', color: '#fff', border: 'none', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            Tampilan Observasi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.mapa01}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setViewMode(null)} style={{
          padding: '4px 12px', fontSize: '12px', cursor: 'pointer',
          background: '#f0f0f0', color: '#333', border: '1px solid #999', borderRadius: '4px',
        }}>
          &larr; Ganti Tampilan
        </button>
      </div>

      <Mapa01View data={data} mode={viewMode} />
    </div>
  )
}

// â”€â”€ MAPA 02 â”€â”€

export function Mapa02Preview({ data }: { data: any }) {
  const [viewMode, setViewMode] = useState<'portofolio' | 'observasi' | null>(null)

  if (!viewMode) {
    return (
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
          {DOC_TITLES.mapa02}
        </h1>
        <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px', marginBottom: '40px' }}>
          <button onClick={() => setViewMode('portofolio')} style={{
            padding: '16px 40px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            background: BRANDING.primaryColor, color: '#fff', border: 'none', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            Tampilan Portofolio
          </button>
          <button onClick={() => setViewMode('observasi')} style={{
            padding: '16px 40px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            background: '#333', color: '#fff', border: 'none', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            Tampilan Observasi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.mapa02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setViewMode(null)} style={{
          padding: '4px 12px', fontSize: '12px', cursor: 'pointer',
          background: '#f0f0f0', color: '#333', border: '1px solid #999', borderRadius: '4px',
        }}>
          &larr; Ganti Tampilan
        </button>
      </div>

      <Mapa02View data={data} mode={viewMode} />
    </div>
  )
}

// â”€â”€ IA 01 / IA 03 â”€â”€

export function Ia01Preview({ data, docType }: { data: any; docType: string }) {
  const isIa03 = docType === 'ia03'

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES[docType] || DOC_TITLES.ia01}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

      {isIa03 ? <Ia03View data={data} /> : <Ia01View data={data} />}
    </div>
  )
}

// â”€â”€ IA 02 (HTML content) â”€â”€

export function Ia02Preview({ data }: { data: any }) {
  const questions = data?.questions

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

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

// â”€â”€ IA 04.A â”€â”€

export function Ia04aPreview({ data }: { data: any }) {
  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia04a}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

      {/* Panduan */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold' }}>
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

      <Ia04aView data={data} />
    </div>
  )
}

// â”€â”€ IA 04.B â”€â”€

export function Ia04bPreview({ data }: { data: any }) {
  const soalList = data?.soal || []
  const rekomendasi = data?.rekomendasi || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia04b}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

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

// â”€â”€ IA 05 â”€â”€

export function Ia05Preview({ data }: { data: any }) {
  const soalList = data?.soal || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ia05}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

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

// â”€â”€ IA 08 / IA 09 â”€â”€

export function Ia08Preview({ data, docType }: { data: any; docType: string }) {
  const isIa09 = docType === 'ia09'

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES[docType] || DOC_TITLES.ia08}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

      {isIa09 ? <Ia09View data={data} /> : <Ia08View data={data} />}
    </div>
  )
}

// â”€â”€ AK 02 â”€â”€

export function Ak02Preview({ data }: { data: any }) {
  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ak02}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>
      <Ak02View data={data} />
    </div>
  )
}

// â”€â”€ AK 03 â”€â”€

export function Ak03Preview({ data }: { data: any }) {
  const soalList = data?.soal || []

  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {DOC_TITLES.ak03}
      </h1>
      <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>*Preview â€” data tidak dapat diedit</p>

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


