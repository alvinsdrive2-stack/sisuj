/**
 * Mapa01Section2.tsx
 * Section 2: Mempersiapkan Rencana Asesmen - 100% width with thin borders
 */

// ============== CONSTANTS ==============
const COLORS = {
  BLACK: '#000',
  WHITE: '#FFF',
  RED: '#C00000',
} as const;

const BORDER = {
  thin: '1px solid #000',
} as const;

// ============== HELPER FUNCTIONS ==============
function createCellStyle(
  borderTop: string,
  borderLeft: string,
  borderBottom: string,
  borderRight: string
) {
  return {
    borderTop,
    borderLeft,
    borderBottom,
    borderRight,
  };
}

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
  const headerStyle = {
    ...createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
    backgroundColor: COLORS.RED,
  };

  const headerTextStyle = {
    color: COLORS.WHITE,
    fontWeight: 'bold' as const,
    fontSize: '12px',
    padding: '6px 8px',
    margin: 0,
    textAlign: 'left' as const,
  };

  return (
    <>
      {/* Section 2 Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '23pt' }}>
            <td style={headerStyle} colSpan={4}>
              <p style={headerTextStyle}>2. Mempersiapkan Rencana Asesmen</p>
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
  const headerCellStyle = createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin);
  const contentCellStyle = createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin);

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '37pt' }}>
            <td style={{ ...headerCellStyle, background: '#fff' }} rowSpan={kelompok.units.length + 1}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'left' }}>
                Kelompok Pekerjaan {kelompok.urut}
              </p>
            </td>
            <td style={{ ...headerCellStyle, background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>No.</p>
            </td>
            <td style={{ ...headerCellStyle, background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                Kode Unit
              </p>
            </td>
            <td style={{ ...headerCellStyle, background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '12px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                Judul Unit
              </p>
            </td>
          </tr>

          {/* Unit Rows */}
          {kelompok.units.map((unit, idx) => (
            <tr key={unit.id_unit} style={{ height: idx === 0 ? '78pt' : '25pt' }}>
              <td style={{
                ...contentCellStyle,
                padding: '6px 8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                background: '#fff'
              }}>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  {idx + 1}.
                </p>
              </td>
              <td style={{
                ...contentCellStyle,
                padding: '6px 8px',
                textAlign: 'center',
                verticalAlign: 'middle',
                background: '#fff'
              }}>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  {unit.kode_unit}
                </p>
              </td>
              <td style={{
                ...contentCellStyle,
                padding: '6px 8px',
                lineHeight: '150%',
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

      <p style={{ padding: '10px 0 0 0', margin: 0 }}><br /></p>
    </>
  )
}

interface Mapa01MetodeTableProps {
  units: Unit[]
}

function Mapa01MetodeTable({ units }: Mapa01MetodeTableProps) {
  const headerCellStyle = createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin);

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '12px' }} cellSpacing="0">
        <tbody>
          {/* Header Row - Metode dan Perangkat Asesmen */}
          <tr style={{ height: '13pt' }}>
            <td style={{ ...headerCellStyle, background: '#fff' }}></td>
            <td style={{ ...headerCellStyle, background: '#fff' }}></td>
            <td style={{ ...headerCellStyle, background: '#fff' }} colSpan={3}></td>
            <td style={{ ...headerCellStyle, background: '#fff' }} colSpan={6}>
              <p style={{ fontWeight: 'bold', fontSize: '11px', color: COLORS.BLACK, padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                Metode dan Perangkat Asesmen
              </p>
            </td>
          </tr>

          {/* Second Header Row - Bukti-Bukti and Jenis Bukti */}
          <tr style={{ height: '77pt' }}>
            <td style={{ ...headerCellStyle, background: '#fff' }} rowSpan={2}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '11px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                Unit Kompetensi
              </p>
            </td>
            <td style={{ ...headerCellStyle, background: '#fff' }} rowSpan={2}>
              <p style={{ fontWeight: 'bold', fontSize: '11px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                Bukti-Bukti <span style={{ fontSize: '10px' }}>(Kinerja, Produk, Portofolio, dan / atau Pengetahuan) diidentifikasi berdasarkan Kriteria Unjuk Kerja dan Pendekatan Asesmen.</span>
              </p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }} colSpan={3}>
              <p style={{ fontWeight: 'bold', fontSize: '11px', margin: 0, textAlign: 'center' }}>Jenis Bukti</p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', textAlign: 'center', background: '#fff' }} colSpan={6}>
              <p style={{ fontWeight: 'bold', fontSize: '11px', margin: 0 }}>
                CL (Ceklis Observasi), DIT (Daftar Instruksi Terstruktur), DPL (Daftar Pertanyaan Lisan), DPT (Daftar Pertanyaan Tertulis), VPK (Verifikasi Pihak Ketiga), CVP (Ceklis Verifikasi Portofolio), CRP (Ceklis Reviu Produk), PW (Pertanyaan
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '11px', padding: '6px 8px', margin: 0, lineHeight: '12px' }}>
                Wawancara)
              </p>
            </td>
          </tr>

          {/* Third Header Row - L, T L, T and Method Columns */}
          <tr style={{ height: '139pt' }}>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0 }}>L</p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0 }}>T L</p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', textAlign: 'center', background: '#fff' }}>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0 }}>T</p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0, textAlign: 'center' }}>
                Obsevasi langsung
              </p>
              <p style={{ fontSize: '10px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                (kerja nyata/aktivitas waktu nyata di tempat kerja di lingkungan tempat kerja yang disimulasikan)
              </p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0, textAlign: 'center' }}>
                Kegiatan Terstruktur
              </p>
              <p style={{ fontSize: '10px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                (latihan simulasi dan bermain peran, proyek, presentasi, lembar kegiatan)
              </p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0, textAlign: 'center' }}>
                Tanya Jawab
              </p>
              <p style={{ fontSize: '10px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                (pertanyaan tertulis, wawancara, asesmen diri, tanya jawab lisan, angket, ujian lisan atau tertulis)
              </p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0, textAlign: 'center' }}>
                Verifikasi Portfolio
              </p>
              <p style={{ fontSize: '10px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                (sampel pekerjaan yang disusun oleh Asesi, produk dengan dokumentasi pendukung, bukti sejarah, jurnal atau buku catatan, informasi tentang pengalaman hidup)
              </p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '10px', margin: 0, textAlign: 'center' }}>
                Reviu Produk
              </p>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontSize: '10px', margin: 0, textAlign: 'center' }}>
                Produk hasil proyek, contoh hasil kerja/produk
              </p>
            </td>
            <td style={{ ...headerCellStyle, padding: '6px 8px', background: '#fff' }}>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontWeight: 'bold', fontSize: '10px', padding: '6px 8px', margin: 0, textAlign: 'center' }}>
                Verifikasi Pihak Ketiga
              </p>
              <p style={{ padding: '6px 8px', margin: 0 }}><br /></p>
              <p style={{ fontSize: '10px', margin: 0, textAlign: 'center' }}>
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
            />
          ))}
        </tbody>
      </table>

      <p style={{ padding: '10px 0 0 0', margin: 0 }}><br /></p>
    </>
  )
}

interface Mapa01UnitAssessmentProps {
  unit: Unit
  idx: number
}

function Mapa01UnitAssessment({ unit, idx }: Mapa01UnitAssessmentProps) {
  const cellStyle = createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin);

  return (
    <tr style={{ height: 'auto' }}>
      {/* Unit Kompetensi column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontSize: '12px', lineHeight: '13pt' }}>
          {idx + 1}. {unit.nama_unit}
        </p>
      </td>

      {/* Bukti-Bukti column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontSize: '12px', lineHeight: '12pt' }}>
          Hasil tanya jawab tentang:
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', lineHeight: '12pt' }}>
          {unit.nama_unit}
        </p>
      </td>

      {/* L column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br />L</p>
      </td>

      {/* T L column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
        <p style={{ fontWeight: 'bold', fontSize: '11px', margin: 0 }}></p>
      </td>

      {/* T column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>T</p>
      </td>

      {/* Observasi Langsung column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Kegiatan Terstruktur column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Tanya Jawab column (DPT) */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>DPT</p>
      </td>

      {/* Verifikasi Portfolio column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Reviu Produk column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>

      {/* Verifikasi Pihak Ketiga column */}
      <td style={{
        ...cellStyle,
        padding: '6px 8px',
        verticalAlign: 'middle',
        background: '#fff'
      }}>
        <p style={{ margin: 0 }}><br /></p>
      </td>
    </tr>
  )
}
