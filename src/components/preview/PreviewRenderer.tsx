import PreviewHeader from "./PreviewHeader"

// ── Helpers ──

function tableStyle() {
  return {
    width: '100%' as const,
    borderCollapse: 'collapse' as const,
    marginBottom: '15px',
    fontSize: '13px',
    background: '#fff',
    border: '2px solid #000',
  }
}

function cellStyle(w?: string) {
  return {
    border: '1px solid #000' as const,
    padding: '8px',
    width: w || 'auto',
  }
}

function thCell(w?: string) {
  return {
    ...cellStyle(w),
    fontWeight: 'bold' as const,
    background: '#f0f0f0' as const,
    textAlign: 'center' as const,
  }
}

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

// ── APL 01 Preview ──

export function Apl01Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const sertifikasi = data?.data_sertifikasi || {}
  const units = data?.data_unit_kompetensi || []
  const persyaratan = data?.bukti_persyaratan || []
  const administratif = data?.bukti_administratif || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader
        title={DOC_TITLES.apl01}
        jabatan={sertifikasi.nama_jabatan}
        skema={sertifikasi.no_skema}
        kualifikasi={sertifikasi.kualifikasi}
        onBack={onBack}
      />

      {/* Data Sertifikasi */}
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Data Sertifikasi</h3>
      <table style={tableStyle()}>
        <tbody>
          <tr><td style={cellStyle('25%')}>Nama Jabatan</td><td style={cellStyle('5%')}>=</td><td style={cellStyle()}>{sertifikasi.nama_jabatan || '-'}</td></tr>
          <tr><td style={cellStyle('25%')}>No. Skema</td><td style={cellStyle('5%')}>=</td><td style={cellStyle()}>{sertifikasi.no_skema || '-'}</td></tr>
          <tr><td style={cellStyle('25%')}>Kualifikasi</td><td style={cellStyle('5%')}>=</td><td style={cellStyle()}>{sertifikasi.kualifikasi || '-'}</td></tr>
          {sertifikasi.skkni && (
            <tr><td style={cellStyle('25%')}>SKKNI</td><td style={cellStyle('5%')}>=</td><td style={cellStyle()}>{sertifikasi.skkni}</td></tr>
          )}
        </tbody>
      </table>

      {/* Unit Kompetensi */}
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Unit Kompetensi</h3>
      <table style={tableStyle()}>
        <thead>
          <tr>
            <th style={thCell('10%')}>No</th>
            <th style={thCell('30%')}>Kode Unit</th>
            <th style={thCell()}>Judul Unit</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u: any, i: number) => (
            <tr key={i}>
              <td style={cellStyle('10%')}>{i + 1}</td>
              <td style={cellStyle('30%')}>{u.kode || '-'}</td>
              <td style={cellStyle()}>{u.nama || '-'}</td>
            </tr>
          ))}
          {units.length === 0 && (
            <tr><td colSpan={3} style={cellStyle()}>Tidak ada data</td></tr>
          )}
        </tbody>
      </table>

      {/* Bukti Persyaratan */}
      {persyaratan.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Bukti Persyaratan</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Persyaratan Dasar</th>
                <th style={thCell('15%')}>Status</th>
              </tr>
            </thead>
            <tbody>
              {persyaratan.map((p: any, i: number) => (
                <tr key={i}>
                  <td style={cellStyle('10%')}>{p.no || i + 1}</td>
                  <td style={cellStyle()}>{p.bukti || '-'}</td>
                  <td style={cellStyle('15%')}>{p.checked ? '✔' : '-'}</td>
                </tr>
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
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Nama Dokumen</th>
                <th style={thCell('20%')}>File</th>
              </tr>
            </thead>
            <tbody>
              {administratif.map((a: any, i: number) => (
                <tr key={i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{a.nama || '-'}</td>
                  <td style={cellStyle('20%')}>{a.file_url ? 'Ada' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── APL 02 Preview ──

export function Apl02Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const units = data?.data_unit || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.apl02} onBack={onBack} />

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Unit Kompetensi</h3>
      {units.map((unit: any, idx: number) => (
        <div key={unit.id || idx} style={{ marginBottom: '20px' }}>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('10%')}>Kode</th>
                <th style={thCell()}>Nama Unit</th>
                <th style={thCell('15%')}>Kompeten</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle('10%')}>{unit.kode || '-'}</td>
                <td style={cellStyle()}>{unit.nama || '-'}</td>
                <td style={cellStyle('15%')}>{unit.kompeten || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Subunits */}
          {(unit.subunits || []).map((sub: any, si: number) => (
            <div key={sub.id || si} style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                Sub Unit: {sub.kode || ''} - {sub.nama || ''}
              </p>
              {(sub.kuks || []).length > 0 && (
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thCell('10%')}>No</th>
                      <th style={thCell('30%')}>Kode KUK</th>
                      <th style={thCell()}>Nama KUK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sub.kuks.map((kuk: any, ki: number) => (
                      <tr key={kuk.id || ki}>
                        <td style={cellStyle('10%')}>{ki + 1}</td>
                        <td style={cellStyle('30%')}>{kuk.kode || '-'}</td>
                        <td style={cellStyle()}>{kuk.nama || '-'}</td>
                      </tr>
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

// ── MAPA 01 Preview ──

export function Mapa01Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const kelompoks = data?.kelompok_kerja || []
  const referensi = data?.referensi_form || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader
        title={DOC_TITLES.mapa01}
        jabatan={data?.nama_jabatan_kerja}
        onBack={onBack}
      />

      {data?.skkni && (
        <p style={{ fontSize: '12px', marginBottom: '10px' }}>SKKNI: {data.skkni}</p>
      )}
      {data?.metode && (
        <p style={{ fontSize: '12px', marginBottom: '10px' }}>Metode: {data.metode}</p>
      )}

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Kelompok Kerja</h3>
      {kelompoks.map((k: any, i: number) => (
        <div key={k.id || i} style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            {k.urut ? `Kelompok ${k.urut}. ` : ''}{k.nama || '-'}
          </p>
          {(k.units || []).length > 0 && (
            <table style={tableStyle()}>
              <thead>
                <tr>
                  <th style={thCell('10%')}>No</th>
                  <th style={thCell('35%')}>Kode Unit</th>
                  <th style={thCell()}>Nama Unit</th>
                </tr>
              </thead>
              <tbody>
                {k.units.map((u: any, ui: number) => (
                  <tr key={u.id_unit || ui}>
                    <td style={cellStyle('10%')}>{ui + 1}</td>
                    <td style={cellStyle('35%')}>{u.kode_unit || '-'}</td>
                    <td style={cellStyle()}>{u.nama_unit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Nama Referensi</th>
              </tr>
            </thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{r.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── MAPA 02 Preview ──

export function Mapa02Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const kelompoks = data?.kelompok_kerja || []
  const referensi = data?.referensi_form || []
  const referensiGlobal = data?.referensi_form_global || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.mapa02} onBack={onBack} />

      {data?.potensi_asesi_index && (
        <p style={{ fontSize: '12px', marginBottom: '10px' }}>
          Potensi Asesi Index: {data.potensi_asesi_index}
        </p>
      )}

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Kelompok Kerja</h3>
      {kelompoks.map((k: any, i: number) => (
        <div key={k.id || i} style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            {k.urut ? `Kelompok ${k.urut}. ` : ''}{k.nama || '-'}
          </p>
          {(k.units || []).length > 0 && (
            <table style={tableStyle()}>
              <thead>
                <tr>
                  <th style={thCell('10%')}>No</th>
                  <th style={thCell('35%')}>Kode Unit</th>
                  <th style={thCell()}>Nama Unit</th>
                </tr>
              </thead>
              <tbody>
                {k.units.map((u: any, ui: number) => (
                  <tr key={u.id_unit || ui}>
                    <td style={cellStyle('10%')}>{ui + 1}</td>
                    <td style={cellStyle('35%')}>{u.kode_unit || '-'}</td>
                    <td style={cellStyle()}>{u.nama_unit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Referensi</th>
                <th style={thCell('40%')}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{r.nama || '-'}</td>
                  <td style={cellStyle('40%')}>{r.keterangan1 || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {referensiGlobal.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi Global</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Nama</th>
              </tr>
            </thead>
            <tbody>
              {referensiGlobal.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{r.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── IA 01 / IA 03 Preview ──

export function Ia01Preview({ data, onBack, docType }: { data: any; onBack: () => void; docType: string }) {
  const kelompoks = data?.kelompok_kerja || []
  const referensi = data?.referensi_form || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES[docType] || DOC_TITLES.ia01} onBack={onBack} />

      {kelompoks.map((kel: any, i: number) => (
        <div key={kel.id || i} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            {kel.nama || `Kelompok ${i + 1}`}
          </h3>

          {(kel.units || []).map((unit: any, ui: number) => (
            <div key={unit.id || ui} style={{ marginLeft: '10px', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
                Unit: {unit.unit?.kode || unit.kode_unit || '-'}
              </p>
              {(unit.questions || []).length > 0 && (
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thCell('8%')}>No</th>
                      <th style={thCell('20%')}>KUK</th>
                      <th style={thCell()}>Soal / Pertanyaan</th>
                      <th style={thCell('12%')}>Jenis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.questions.map((q: any, qi: number) => (
                      <tr key={q.id || qi}>
                        <td style={cellStyle('8%')}>{q.no || qi + 1}</td>
                        <td style={cellStyle('20%')}>{q.kuk?.kode || '-'}</td>
                        <td style={cellStyle()}>{q.soal || '-'}</td>
                        <td style={cellStyle('12%')}>{q.jenis || '-'}</td>
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
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Nama Referensi</th>
              </tr>
            </thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{r.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── IA 02 Preview (HTML non-soal) ──

export function Ia02Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const questions = data?.questions

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.ia02} onBack={onBack} />

      {questions?.isi_nonsoal ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '20px',
            background: '#fff',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(questions.isi_nonsoal) }}
        />
      ) : (
        <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada konten</p>
      )}
    </div>
  )
}

// ── IA 04.A Preview ──

export function Ia04aPreview({ data, onBack }: { data: any; onBack: () => void }) {
  const kelompoks = data?.kelompok_kerja || []
  const soalList = data?.soal || []
  const referensi = data?.referensi_form || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.ia04a} onBack={onBack} />

      {/* Kelompok Kerja */}
      {kelompoks.map((k: any, i: number) => (
        <div key={k.id || i} style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            {k.urut ? `Kelompok ${k.urut}. ` : ''}{k.nama || '-'}
          </p>
          {(k.units || []).length > 0 && (
            <table style={tableStyle()}>
              <thead>
                <tr>
                  <th style={thCell('10%')}>No</th>
                  <th style={thCell('35%')}>Kode Unit</th>
                  <th style={thCell()}>Nama Unit</th>
                </tr>
              </thead>
              <tbody>
                {k.units.map((u: any, ui: number) => (
                  <tr key={u.id_unit || ui}>
                    <td style={cellStyle('10%')}>{ui + 1}</td>
                    <td style={cellStyle('35%')}>{u.kode_unit || '-'}</td>
                    <td style={cellStyle()}>{u.nama_unit || '-'}</td>
                  </tr>
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
            <thead>
              <tr>
                <th style={thCell('8%')}>No</th>
                <th style={thCell('15%')}>Jenis</th>
                <th style={thCell()}>Pertanyaan</th>
                <th style={thCell('15%')}>Jawaban</th>
              </tr>
            </thead>
            <tbody>
              {soalList.map((s: any, i: number) => (
                <tr key={s.id || i}>
                  <td style={cellStyle('8%')}>{s.urut || i + 1}</td>
                  <td style={cellStyle('15%')}>{s.jenis || '-'}</td>
                  <td style={cellStyle()}>{decodeHtmlEntities(s.soal || '-')}</td>
                  <td style={cellStyle('15%')}>{s.jawaban || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Persiapan Kegiatan */}
      {data?.persiapan_kegiatan && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Persiapan Kegiatan</h3>
          <p style={{ fontSize: '13px' }}>{data.persiapan_kegiatan}</p>
        </div>
      )}

      {/* Hal Demonstrasi */}
      {data?.hal_demonstrasi && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Hal yang Didemonstrasikan</h3>
          <p style={{ fontSize: '13px' }}>{data.hal_demonstrasi}</p>
        </div>
      )}

      {referensi.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Referensi</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Nama Referensi</th>
              </tr>
            </thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{r.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── IA 04.B Preview ──

export function Ia04bPreview({ data, onBack }: { data: any; onBack: () => void }) {
  const soalList = data?.soal || []
  const rekomendasi = data?.rekomendasi || []
  const dokumen = data?.dokumen

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.ia04b} onBack={onBack} />

      {dokumen && (
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
          {dokumen.nama_dokumen || '-'}
        </p>
      )}

      {soalList.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Soal</h3>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thCell('8%')}>No</th>
                <th style={thCell('15%')}></th>
                <th style={thCell('15%')}>Unit</th>
                <th style={thCell('15%')}>KUK</th>
                <th style={thCell()}>Soal</th>
              </tr>
            </thead>
            <tbody>
              {soalList.map((s: any, i: number) => (
                <tr key={s.id || i}>
                  <td style={cellStyle('8%')}>{s.no || i + 1}</td>
                  <td style={cellStyle('15%')}>{s.jenis || '-'}</td>
                  <td style={cellStyle('15%')}>{s.unit?.kode || '-'}</td>
                  <td style={cellStyle('15%')}>{s.kuk?.kode || '-'}</td>
                  <td style={cellStyle()}>
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
            <thead>
              <tr>
                <th style={thCell('8%')}>No</th>
                <th style={thCell()}>Rekomendasi</th>
              </tr>
            </thead>
            <tbody>
              {rekomendasi.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('8%')}>{r.no || i + 1}</td>
                  <td style={cellStyle()}>{r.soal || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── IA 05 Preview ──

export function Ia05Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const soalList = data?.soal || []
  const dokumen = data?.dokumen

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.ia05} onBack={onBack} />

      {dokumen && (
        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
          {dokumen.nama_dokumen || '-'}
        </p>
      )}

      {soalList.map((s: any, i: number) => (
        <div key={s.id || i} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
            {s.no || i + 1}. {decodeHtmlEntities(s.soal || '-')}
          </p>
          {s.unit?.kode && <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Unit: {s.unit.kode}</p>}
          {s.kuk?.kode && <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>KUK: {s.kuk.kode}</p>}
          <div style={{ marginLeft: '20px', marginTop: '8px' }}>
            {s.jawab_a && <p style={{ fontSize: '13px', marginBottom: '3px' }}>A. {decodeHtmlEntities(s.jawab_a)}</p>}
            {s.jawab_b && <p style={{ fontSize: '13px', marginBottom: '3px' }}>B. {decodeHtmlEntities(s.jawab_b)}</p>}
            {s.jawab_c && <p style={{ fontSize: '13px', marginBottom: '3px' }}>C. {decodeHtmlEntities(s.jawab_c)}</p>}
            {s.jawab_d && <p style={{ fontSize: '13px', marginBottom: '3px' }}>D. {decodeHtmlEntities(s.jawab_d)}</p>}
          </div>
        </div>
      ))}
      {soalList.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada soal</p>}
    </div>
  )
}

// ── IA 08 / IA 09 Preview ──

export function Ia08Preview({ data, onBack, docType }: { data: any; onBack: () => void; docType: string }) {
  const soalList = data?.soal || []
  const referensi = data?.referensi || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES[docType] || DOC_TITLES.ia08} onBack={onBack} />

      {soalList.map((kel: any, i: number) => (
        <div key={kel.id_kelompok || i} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            {kel.nama_kelompok || `Kelompok ${i + 1}`}
          </h3>
          {(kel.questions || []).length > 0 && (
            <table style={tableStyle()}>
              <thead>
                <tr>
                  <th style={thCell('8%')}>No</th>
                  <th style={thCell('15%')}>Unit</th>
                  <th style={thCell('15%')}>KUK</th>
                  <th style={thCell()}>Soal / Pertanyaan</th>
                  <th style={thCell('12%')}>Jenis</th>
                </tr>
              </thead>
              <tbody>
                {kel.questions.map((q: any, qi: number) => (
                  <tr key={q.id || qi}>
                    <td style={cellStyle('8%')}>{q.no || qi + 1}</td>
                    <td style={cellStyle('15%')}>{q.unitkompetensi?.kode || '-'}</td>
                    <td style={cellStyle('15%')}>{q.kuk?.kode || '-'}</td>
                    <td style={cellStyle()}>{q.soal || '-'}</td>
                    <td style={cellStyle('12%')}>{q.jenis || '-'}</td>
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
            <thead>
              <tr>
                <th style={thCell('10%')}>No</th>
                <th style={thCell()}>Nama Referensi</th>
              </tr>
            </thead>
            <tbody>
              {referensi.map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td style={cellStyle('10%')}>{i + 1}</td>
                  <td style={cellStyle()}>{r.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ── AK 02 Preview ──

export function Ak02Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const units = data?.data_unit_kompetensi || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.ak02} onBack={onBack} />

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Rekapitulasi Penilaian Unit Kompetensi</h3>
      <table style={tableStyle()}>
        <thead>
          <tr>
            <th style={thCell('8%')}>No</th>
            <th style={thCell('15%')}>Kode</th>
            <th style={thCell()}>Nama Unit</th>
            <th style={thCell('12%')}>Observasi</th>
            <th style={thCell('12%')}>Portofolio</th>
            <th style={thCell('12%')}>Wawancara</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u: any, i: number) => (
            <tr key={u.id || i}>
              <td style={cellStyle('8%')}>{i + 1}</td>
              <td style={cellStyle('15%')}>{u.kode || '-'}</td>
              <td style={cellStyle()}>{u.nama || '-'}</td>
              <td style={cellStyle('12%')}>{u.observasi || '-'}</td>
              <td style={cellStyle('12%')}>{u.portofolio || '-'}</td>
              <td style={cellStyle('12%')}>{u.pertanyaan_wawancara || u.pertanyaan_lisan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {units.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>}
    </div>
  )
}

// ── AK 03 Preview ──

export function Ak03Preview({ data, onBack }: { data: any; onBack: () => void }) {
  const soalList = data?.soal || []

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <PreviewHeader title={DOC_TITLES.ak03} onBack={onBack} />

      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Penetapan Kompetensi</h3>
      <table style={tableStyle()}>
        <thead>
          <tr>
            <th style={thCell('8%')}>No</th>
            <th style={thCell('15%')}>Jenis</th>
            <th style={thCell()}>Pernyataan</th>
            <th style={thCell('15%')}>Kompeten</th>
          </tr>
        </thead>
        <tbody>
          {soalList.map((s: any, i: number) => (
            <tr key={s.id || i}>
              <td style={cellStyle('8%')}>{s.no || i + 1}</td>
              <td style={cellStyle('15%')}>{s.jenis || '-'}</td>
              <td style={cellStyle()}>{s.soal || '-'}</td>
              <td style={cellStyle('15%')}>{s.is_kompeten ? 'Kompeten' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {soalList.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>Tidak ada data</p>}
    </div>
  )
}
