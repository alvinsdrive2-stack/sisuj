/**
 * Mapa01Section2.tsx
 * Section 2: Mempersiapkan Rencana Asesmen - 1:1 dengan HTML Word
 */

// ============== CONSTANTS ==============
const COLORS = {
  BLACK: '#000',
  WHITE: '#FFF',
  RED: '#C00000',
} as const;

const BORDER = {
  thin: '1pt solid #000',
  thick: '2pt solid #000',
} as const;

const tableStyle = {
  borderCollapse: 'collapse' as const,
  marginLeft: '6.67pt',
};

const headerStyle = {
  width: '504pt',
  borderTop: BORDER.thick,
  borderLeft: BORDER.thick,
  borderBottom: BORDER.thick,
  borderRight: BORDER.thick,
  backgroundColor: COLORS.RED,
};

const headerTextStyle = {
  color: COLORS.WHITE,
  fontWeight: 'bold' as const,
  fontSize: '14pt',
  padding: '6pt',
  margin: 0,
  textAlign: 'left' as const,
};

// ============== TYPES ==============
interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
}

interface KelompokKerja {
  id: number
  nama: string
  urut: string
  units: Unit[]
}

interface Mapa01Section2Props {
  kelompokKerja: KelompokKerja[]
}

// ============== COMPONENTS ==============
export function Mapa01Section2({ kelompokKerja }: Mapa01Section2Props) {
  return (
    <>
      {/* Section 2 Header */}
      <table style={tableStyle} cellSpacing="0">
        <tbody>
          <tr style={{ height: '26pt' }}>
            <td style={headerStyle} colSpan={4}>
              <p style={headerTextStyle}>2.  Mempersiapkan Rencana Asesmen</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Loop Kelompok Kerja */}
      {kelompokKerja.map((kelompok) => (
        <Mapa01KelompokPekerja key={kelompok.id} kelompok={kelompok} />
      ))}
    </>
  )
}

interface Mapa01KelompokPekerjaProps {
  kelompok: KelompokKerja
}

function Mapa01KelompokPekerja({ kelompok }: Mapa01KelompokPekerjaProps) {
  return (
    <>
      <Mapa01KelompokTable kelompok={kelompok} />
      <Mapa01MetodeTable units={kelompok.units} />
    </>
  )
}

interface Mapa01KelompokTableProps {
  kelompok: KelompokKerja
}

function Mapa01KelompokTable({ kelompok }: Mapa01KelompokTableProps) {
  const kelompokTableStyle = {
    borderCollapse: 'collapse' as const,
    marginLeft: '7pt',
  };

  return (
    <>
      <table style={kelompokTableStyle} cellSpacing="0">
        <tbody>
          <tr style={{ height: '37pt' }}>
            <td style={{
              width: '91pt',
              borderTop: BORDER.thick,
              borderLeft: BORDER.thick,
              borderBottom: BORDER.thick,
              borderRight: BORDER.thin,
              background: '#fff'
            }} rowSpan={kelompok.units.length + 1}>
              <p style={{ padding: '0 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '12pt', padding: '0 12pt 0 12pt', margin: 0, textIndent: '4pt', textAlign: 'left' }}>
                Kelompok Pekerjaan {kelompok.urut}
              </p>
            </td>
            <td style={{
              width: '36pt',
              borderTop: BORDER.thick,
              borderLeft: BORDER.thin,
              borderBottom: BORDER.thin,
              borderRight: BORDER.thin,
              background: '#fff'
            }}>
              <p style={{ padding: '1pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '12pt', padding: '0 1pt 0 1pt', margin: 0, textAlign: 'center' }}>No.</p>
            </td>
            <td style={{
              width: '134pt',
              borderTop: BORDER.thick,
              borderLeft: BORDER.thin,
              borderBottom: BORDER.thin,
              borderRight: BORDER.thin,
              background: '#fff'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '12pt', padding: '11pt 1pt 11pt 1pt', margin: 0, textAlign: 'center' }}>
                Kode Unit
              </p>
            </td>
            <td style={{
              width: '243pt',
              borderTop: BORDER.thick,
              borderLeft: BORDER.thin,
              borderBottom: BORDER.thin,
              borderRight: BORDER.thick,
              background: '#fff'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '12pt', padding: '11pt 1pt 11pt 1pt', margin: 0, textAlign: 'center' }}>
                Judul Unit
              </p>
            </td>
          </tr>

          {/* Unit Rows */}
          {kelompok.units.map((unit, idx) => (
            <tr key={unit.id_unit} style={{ height: idx === 0 ? '78pt' : '25pt' }}>
              <td style={{
                padding: '8pt 1pt',
                textAlign: 'center',
                verticalAlign: 'middle',
                borderTop: BORDER.thin,
                borderLeft: BORDER.thin,
                borderBottom: BORDER.thin,
                borderRight: BORDER.thin,
                background: '#fff'
              }}>
                <p style={{ margin: 0, fontSize: '11pt' }}>
                  {idx + 1}.
                </p>
              </td>
              <td style={{
                padding: '8pt 1pt',
                textAlign: 'center',
                verticalAlign: 'middle',
                borderTop: BORDER.thin,
                borderLeft: BORDER.thin,
                borderBottom: BORDER.thin,
                borderRight: BORDER.thin,
                background: '#fff'
              }}>
                <p style={{ margin: 0, fontSize: '11pt' }}>
                  {unit.kode_unit}
                </p>
              </td>
              <td style={{
                padding: '8pt 8pt',
                lineHeight: '150%',
                borderTop: BORDER.thin,
                borderLeft: BORDER.thin,
                borderBottom: BORDER.thin,
                borderRight: BORDER.thick,
                verticalAlign: 'middle',
                background: '#fff'
              }}>
                <p style={{ margin: 0, lineHeight: '150%', textAlign: 'justify' }}>
                  {unit.nama_unit}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ padding: '10pt 0 0 0', margin: 0 }}><br /></p>
    </>
  )
}

interface Mapa01MetodeTableProps {
  units: Unit[]
}

function Mapa01MetodeTable({ units }: Mapa01MetodeTableProps) {
  const metodeTableStyle = {
    borderCollapse: 'collapse' as const,
    marginLeft: '8.71pt',
    fontSize: '10pt',
  };

  return (
    <>
      <table style={metodeTableStyle} cellSpacing="0">
        <tbody>
          {/* Header Row - Metode dan Perangkat Asesmen */}
          <tr style={{ height: '13pt' }}>
            <td style={{ width: '93pt', borderTop: BORDER.thick, borderLeft: BORDER.thick, borderRight: BORDER.thin, background: '#fff' }}></td>
            <td style={{ width: '82pt', borderTop: BORDER.thick, borderLeft: BORDER.thin, borderRight: BORDER.thin, background: '#fff' }}></td>
            <td style={{ width: '51pt', borderTop: BORDER.thick, borderLeft: BORDER.thin, borderRight: BORDER.thin, background: '#fff' }} colSpan={3}></td>
            <td style={{ width: '277pt', borderTop: BORDER.thick, borderLeft: BORDER.thin, borderRight: BORDER.thick, background: '#fff' }} colSpan={6}>
              <p style={{ fontWeight: 'bold', fontSize: '11pt', color: COLORS.BLACK, padding: '0 0 0 56pt', margin: 0, lineHeight: '12pt' }}>
                Metode dan Perangkat Asesmen
              </p>
            </td>
          </tr>

          {/* Second Header Row - Bukti-Bukti and Jenis Bukti */}
          <tr style={{ height: '77pt' }}>
            <td style={{
              width: '93pt',
              borderLeft: BORDER.thick,
              borderBottom: BORDER.thick,
              borderRight: BORDER.thin,
              background: '#fff'
            }} rowSpan={2}>
              <p style={{ padding: '19pt 11pt 19pt 11pt', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '11pt', padding: '0 11pt 0 11pt', margin: 0, textIndent: '17pt' }}>
                Unit Kompetensi
              </p>
            </td>
            <td style={{
              width: '82pt',
              borderLeft: BORDER.thin,
              borderBottom: BORDER.thick,
              borderRight: BORDER.thin,
              background: '#fff'
            }} rowSpan={2}>
              <p style={{ fontWeight: 'bold', fontSize: '11pt', padding: '14pt 11pt 14pt 11pt', margin: 0, textAlign: 'center' }}>
                Bukti-Bukti <span style={{ fontSize: '9pt' }}>(Kinerja, Produk, Portofolio, dan / atau Pengetahuan) diidentifikasi berdasarkan Kriteria Unjuk Kerja dan Pendekatan Asesmen.</span>
              </p>
            </td>
            <td style={{
              width: '51pt',
              borderTop: BORDER.thick,
              borderLeft: BORDER.thin,
              borderBottom: BORDER.thin,
              borderRight: BORDER.thin,
              padding: '12pt 12pt 9pt 12pt',
              background: '#fff'
            }} colSpan={3}>
              <p style={{ fontWeight: 'bold', fontSize: '11pt', margin: 0 }}>Jenis Bukti</p>
            </td>
            <td style={{
              width: '277pt',
              borderTop: BORDER.thick,
              borderLeft: BORDER.thin,
              borderBottom: BORDER.thin,
              borderRight: BORDER.thick,
              padding: '1pt 16pt 12pt 16pt',
              textAlign: 'center',
              background: '#fff'
            }} colSpan={6}>
              <p style={{ fontWeight: 'bold', fontSize: '11pt', margin: 0 }}>
                CL (Ceklis Observasi), DIT (Daftar Instruksi Terstruktur), DPL (Daftar Pertanyaan Lisan), DPT (Daftar Pertanyaan Tertulis), VPK (Verifikasi Pihak Ketiga), CVP (Ceklis Verifikasi Portofolio), CRP (Ceklis Reviu Produk), PW (Pertanyaan
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '11pt', padding: '0 0 0 4pt', margin: 0, lineHeight: '11pt' }}>
                Wawancara)
              </p>
            </td>
          </tr>

          {/* Third Header Row - L, T L, T and Method Columns */}
          <tr style={{ height: '139pt' }}>
            <td style={{ width: '17pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '5pt', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '9pt', margin: 0 }}>L</p>
            </td>
            <td style={{ width: '20pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '5pt 7pt 5pt 5pt', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '9pt', margin: 0 }}>T L</p>
            </td>
            <td style={{ width: '14pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '3pt 5pt 3pt 3pt', textAlign: 'center', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '9pt', margin: 0 }}>T</p>
            </td>
            <td style={{ width: '41pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '5pt 4pt 5pt 4pt', background: '#fff' }}>
              <p style={{ padding: '5pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '8pt', margin: 0, textAlign: 'center' }}>
                Obsevasi langsung
              </p>
              <p style={{ fontSize: '7pt', padding: '0 3pt 0 4pt', margin: 0, textAlign: 'center' }}>
                (kerja nyata/aktivitas waktu nyata di tempat kerja di lingkungan tempat kerja yang disimulasikan)
              </p>
            </td>
            <td style={{ width: '47pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '4pt 4pt 4pt 4pt', background: '#fff' }}>
              <p style={{ margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '8pt', margin: 0, textAlign: 'center' }}>
                Kegiatan Terstruktur
              </p>
              <p style={{ fontSize: '7pt', padding: '0 4pt 0 4pt', margin: 0, textAlign: 'center' }}>
                (latihan simulasi dan bermain peran, proyek, presentasi, lembar kegiatan)
              </p>
            </td>
            <td style={{ width: '47pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '5pt 0 0 0', background: '#fff' }}>
              <p style={{ padding: '5pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '8pt', margin: 0, textAlign: 'center' }}>
                Tanya Jawab
              </p>
              <p style={{ fontSize: '7pt', padding: '0 5pt 0 6pt', margin: 0, textAlign: 'center' }}>
                (pertanyaan tertulis, wawancara, asesmen diri, tanya jawab lisan, angket, ujian lisan atau tertulis)
              </p>
            </td>
            <td style={{ width: '50pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '3pt 0 0 0', background: '#fff' }}>
              <p style={{ padding: '3pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '8pt', padding: '0 0 0 1pt', margin: 0, textAlign: 'center' }}>
                Verifikasi Portfolio
              </p>
              <p style={{ fontSize: '7pt', padding: '0 7pt 0 7pt', margin: 0, textAlign: 'center' }}>
                (sampel pekerjaan yang disusun oleh Asesi, produk dengan dokumentasi pendukung, bukti sejarah, jurnal atau buku catatan, informasi tentang pengalaman hidup)
              </p>
            </td>
            <td style={{ width: '42pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thin, padding: '2pt 0 0 0', background: '#fff' }}>
              <p style={{ padding: '2pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '8pt', padding: '0 0 0 1pt', margin: 0, textAlign: 'center' }}>
                Reviu Produk
              </p>
              <p style={{ padding: '1pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontSize: '7pt', margin: 0, textAlign: 'center' }}>
                Produk hasil proyek, contoh hasil kerja/produk
              </p>
            </td>
            <td style={{ width: '50pt', borderTop: BORDER.thin, borderLeft: BORDER.thin, borderBottom: BORDER.thin, borderRight: BORDER.thick, padding: '5pt 0 0 0', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '8pt', padding: '5pt 0 0 1pt', margin: 0, textAlign: 'center' }}>
                Verifikasi Pihak Ketiga
              </p>
              <p style={{ padding: '1pt 0 0 0', margin: 0 }}><br /></p>
              <p style={{ fontSize: '7pt', margin: 0, textAlign: 'center' }}>
                (testimoni dan laporan dari atasan, bukti pelatihan, otentikasi pencapaian sebelumnya, wawancara dengan atasan, atau rekan kerja)
              </p>
            </td>
          </tr>

          {/* Unit Assessment Rows - All units in ONE table */}
          {units.map((unit, idx) => (
            <Mapa01UnitAssessment
              key={unit.id_unit}
              unit={unit}
              idx={idx}
              isLastUnit={idx === units.length - 1}
            />
          ))}
        </tbody>
      </table>

      <p style={{ padding: '10pt 0 0 0', margin: 0 }}><br /></p>
    </>
  )
}

interface Mapa01UnitAssessmentProps {
  unit: Unit
  idx: number
  isLastUnit: boolean
}

function Mapa01UnitAssessment({ unit, idx, isLastUnit }: Mapa01UnitAssessmentProps) {
  const bottomBorder = isLastUnit ? BORDER.thick : BORDER.thin

  return (
    <tr style={{ height: 'auto' }}>
      {/* Unit Kompetensi column */}
      <td style={{
        width: '93pt',
        borderTop: BORDER.thick,
        borderLeft: BORDER.thick,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 9pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontSize: '11px', lineHeight: '13pt' }}>
          {idx + 1}. {unit.nama_unit}
        </p>
      </td>

      {/* Bukti-Bukti column */}
      <td style={{
        width: '82pt',
        borderTop: BORDER.thick,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 5pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontSize: '10px', lineHeight: '12pt' }}>
          Hasil tanya jawab tentang:
        </p>
        <p style={{ margin: '4pt 0 0 0', fontSize: '10px', lineHeight: '12pt' }}>
          {unit.nama_unit}
        </p>
      </td>

      {/* L column */}
      <td style={{
        width: '17pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 3pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* T L column */}
      <td style={{
        width: '20pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 3pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
        <p style={{ fontWeight: 'bold', fontSize: '9pt', margin: 0 }}>T L</p>
      </td>

      {/* T column */}
      <td style={{
        width: '14pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 3pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '9pt', textAlign: 'center' }}>T</p>
      </td>

      {/* Observasi Langsung column */}
      <td style={{
        width: '41pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 4pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Kegiatan Terstruktur column */}
      <td style={{
        width: '47pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 4pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Tanya Jawab column (DPT) */}
      <td style={{
        width: '47pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 4pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '9pt', textAlign: 'center' }}>DPT</p>
      </td>

      {/* Verifikasi Portfolio column */}
      <td style={{
        width: '50pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 4pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Reviu Produk column */}
      <td style={{
        width: '42pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thin,
        padding: '8pt 4pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Verifikasi Pihak Ketiga column */}
      <td style={{
        width: '50pt',
        borderTop: BORDER.thin,
        borderLeft: BORDER.thin,
        borderBottom: bottomBorder,
        borderRight: BORDER.thick,
        padding: '8pt 4pt',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>
    </tr>
  )
}

function CheckboxSquare() {
  return (
    <span style={{
      color: COLORS.BLACK,
      fontFamily: '"Segoe UI Symbol", sans-serif',
      fontSize: '14px',
      verticalAlign: '-6px'
    }}>
      ☐
    </span>
  )
}
