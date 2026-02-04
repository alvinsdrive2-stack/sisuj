/**
 * Mapa01Section1.tsx
 * Section 1: Pendekatan Asesmen - 1:1 dengan HTML Word
 */

// ============== CONSTANTS ==============
const COLORS = {
  BLACK: '#000',
  WHITE: '#FFF',
  RED: '#C00000',
} as const;

const SIZES = {
  col1_1: '32pt',
  col1_2: '84pt',
  col2_1: '92pt',
  col2_2: '137pt',
  col2_3: '159pt',
  col2_1_2: '296pt',
  colFull: '388pt',
} as const;

const BORDER = {
  thin: '1pt solid #666',   // border dalam - gray lebih light
  thick: '1.5pt solid #000', // border luar - hitam lebih tebal
} as const;

// ============== STYLE OBJECTS ==============
const tableStyle = {
  borderCollapse: 'collapse' as const,
  marginLeft: '6.67pt',
};

const headerCellStyle = {
  width: SIZES.colFull,
  borderTop: BORDER.thick,
  borderLeft: BORDER.thick,
  borderBottom: BORDER.thick,
  borderRight: BORDER.thick,
  backgroundColor: COLORS.RED,
};

const headerTextStyle = {
  color: COLORS.WHITE,
  fontWeight: 'bold' as const,
  fontSize: '12pt',
  padding: '5pt',
  margin: 0,
  textAlign: 'left' as const,
};

const paraStyle = { padding: '5pt', margin: 0, textAlign: 'left' as const };

// ============== HELPER FUNCTIONS ==============
function createCellStyle(
  borderTop: string,
  borderLeft: string,
  borderBottom: string,
  borderRight: string,
  width?: string
) {
  return {
    width,
    borderTop,
    borderLeft,
    borderBottom,
    borderRight,
  };
}

const cellStyles = {
  rowHeader: createCellStyle(BORDER.thick, BORDER.thick, BORDER.thin, BORDER.thin, SIZES.col1_1),
  labelTop: createCellStyle(BORDER.thick, BORDER.thin, BORDER.thin, BORDER.thin, SIZES.col1_2),
  labelMiddle: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin, SIZES.col1_2),
  labelBottom: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thick, BORDER.thin, SIZES.col1_2),
  contentTop: createCellStyle(BORDER.thick, BORDER.thin, BORDER.thin, BORDER.thick, SIZES.colFull),
  contentMiddle: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thick, SIZES.colFull),
  contentBottom: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thick, BORDER.thick, SIZES.colFull),
  contentTop2col: createCellStyle(BORDER.thick, BORDER.thin, BORDER.thin, BORDER.thick, SIZES.col2_1_2),
  contentMiddle2col: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thick, SIZES.col2_1_2),
  contentBottom2col: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thick, BORDER.thick, SIZES.col2_1_2),
  subLabel: createCellStyle(BORDER.thick, BORDER.thin, BORDER.thin, BORDER.thin, SIZES.col2_1),
  subContent1: createCellStyle(BORDER.thick, BORDER.thin, BORDER.thin, BORDER.thin, SIZES.col2_2),
  subContent2: createCellStyle(BORDER.thick, BORDER.thin, BORDER.thin, BORDER.thick, SIZES.col2_3),
} as const;

// ============== COMPONENTS ==============
interface TableCellProps {
  style: React.CSSProperties;
  rowSpan?: number;
  colSpan?: number;
  children: React.ReactNode;
}

function TableCell({ style, rowSpan, colSpan, children }: TableCellProps) {
  // Only add white background if there isn't already a backgroundColor set
  const finalStyle = style.backgroundColor || style.background
    ? style
    : { ...style, background: '#fff' };

  return (
    <td style={finalStyle} rowSpan={rowSpan} colSpan={colSpan}>
      {children}
    </td>
  );
}

interface TableRowProps {
  height?: string;
  children: React.ReactNode;
}

function TableRow({ height, children }: TableRowProps) {
  return <tr style={{ height }}>{children}</tr>;
}

interface CheckboxItemProps {
  text: string;
  indent?: string;
}

function CheckboxItem({ text, indent = '10pt' }: CheckboxItemProps) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <li style={{ padding: 0, margin: 0 }}>
        <p style={{
          padding: `3pt 0pt 0pt ${indent}`,
          margin: 0,
          textIndent: '0pt',
          lineHeight: '150%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          <span style={{
            color: COLORS.BLACK,
            fontFamily: '"Segoe UI Symbol", sans-serif',
            fontSize: '16pt',
            verticalAlign: 'baseline',
            marginRight: '4pt',
            flexShrink: 0
          }}>
            ☐
          </span>
          <span style={{ fontSize: '12pt', color: COLORS.BLACK }}>
            {text}
          </span>
        </p>
      </li>
    </ul>
  );
}

// ============== MAIN COMPONENT ==============
export function Mapa01Section1() {
  return (
    <>
      {/* Section 1 Header */}
      <table style={tableStyle} cellSpacing="0">
        <tbody>
          <TableRow height="23pt">
            <TableCell {...{ style: headerCellStyle, colSpan: 5 }}>
              <p style={headerTextStyle}>1. Pendekatan Asesmen</p>
            </TableCell>
          </TableRow>

          {/* 1.1 Asesi */}
          <TableRow height="30pt">
            <TableCell style={cellStyles.rowHeader} rowSpan={19}>
              <p style={paraStyle}>1.1.</p>
            </TableCell>
            <TableCell style={cellStyles.labelTop} rowSpan={5}>
              <p style={paraStyle}>Asesi</p>
            </TableCell>
            <TableCell style={cellStyles.contentTop} colSpan={3}>
              <CheckboxItem text="Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi." />
            </TableCell>
          </TableRow>

          <TableRow height="30pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi." />
            </TableCell>
          </TableRow>

          <TableRow height="45pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <p style={{ padding: '0 0 0 43pt', margin: 0, lineHeight: '12pt', textAlign: 'left' }}></p>
              <CheckboxItem text="Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi." />
            </TableCell>
          </TableRow>

          <TableRow height="45pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <p style={{ padding: '0 0 0 43pt', margin: 0, lineHeight: '12pt', textAlign: 'left' }}></p>
              <CheckboxItem text=" Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya belum berbasis standar kompetensi." />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Pelatihan/belajar mandiri atau otodidak." />
            </TableCell>
          </TableRow>

          {/* Tujuan Asesmen */}
          <TableRow height="23pt">
            <TableCell style={cellStyles.labelMiddle} rowSpan={4}>
              <p style={{ ...paraStyle, padding: '5pt 27pt 5pt 5pt', lineHeight: '108%' }}>Tujuan Asesmen</p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Sertifikasi" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Pengakuan Kompetensi Terkini (PKT)" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Rekognisi pembelajaran lampau (RPL)" />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Lainnya:" />
            </TableCell>
          </TableRow>

          {/* Konteks Asesmen */}
          <TableRow height="30pt">
            <TableCell style={cellStyles.labelMiddle} rowSpan={8}>
              <p style={{ ...paraStyle, lineHeight: '108%' }}>Konteks Asesmen:</p>
            </TableCell>
            <TableCell style={cellStyles.subLabel}>
              <p style={{ padding: '7pt 0 0 6pt', margin: 0, textAlign: 'left' }}>Lingkungan</p>
            </TableCell>
            <TableCell style={cellStyles.subContent1}>
              <CheckboxItem text="Tempat kerja nyata" />
            </TableCell>
            <TableCell style={cellStyles.subContent2}>
              <CheckboxItem text="Tempat kerja simulasi" />
            </TableCell>
          </TableRow>

          <TableRow height="55pt">
            <TableCell style={cellStyles.subLabel}>
              <p style={{ padding: '0 0 0 6pt', margin: 0, lineHeight: '108%', fontSize: '11pt', textAlign: 'left' }}>Peluang untuk mengumpulkan bukti dalam</p>
              <p style={{ padding: '0 0 0 6pt', margin: 0, lineHeight: '12pt', fontSize: '11pt', textAlign: 'left' }}>sejumlah situasi</p>
            </TableCell>
            <TableCell style={cellStyles.subContent1}>
              <p style={{ padding: '2pt 0 0 0', margin: 0 }}><br /></p>
              <CheckboxItem text="Tersedia" />
            </TableCell>
            <TableCell style={cellStyles.subContent2}>
              <p style={{ padding: '2pt 0 0 0', margin: 0 }}><br /></p>
              <CheckboxItem text="Terbatas" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.subLabel} rowSpan={3}>
              <p style={{ padding: '0 3pt 0 6pt', margin: 0, lineHeight: '108%', textAlign: 'left' }}>Hubungan antara standar kompetensi dan:</p>
            </TableCell>
            <TableCell style={cellStyles.contentTop2col} colSpan={2}>
              <CheckboxItem text="Bukti untuk mendukung asesmen / RPL:" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem text="Aktivitas kerja di tempat kerja kandidat: " />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem text="Kegiatan Pembelajaran:" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.subLabel} rowSpan={3}>
              <p style={{ padding: '0 24pt 0 6pt', margin: 0, lineHeight: '108%', textAlign: 'left' }}>Siapa yang melakukan asesmen / RPL</p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem text="LSP Gatensi Karya Konstruksi" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem text="Organisasi Pelatihan" />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem text="asesor perusahaan" />
            </TableCell>
          </TableRow>

          {/* Orang yang relevan */}
          <TableRow height="23pt">
            <TableCell style={cellStyles.labelBottom} rowSpan={2}>
              <p style={{ ...paraStyle, lineHeight: '108%' }}>Orang yang relevan untuk dikonfirmasi</p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Manajer sertifikasi LSP Gatensi Karya Konstruksi" />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Master Assessor / Master Trainer / Asesor Utama kompetensi" />
            </TableCell>
          </TableRow>
          <TableRow height="30pt">
            <TableCell style={{ ...cellStyles.rowHeader, borderTop: 'none' }} rowSpan={2}>
              <p style={{ margin: 0 }}><br /></p>
            </TableCell>
            <TableCell style={{ ...cellStyles.labelTop, borderTop: 'none' }} rowSpan={2}>
              <p style={{ margin: 0 }}><br /></p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem text="Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar" />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem text="Lainnya:" />
            </TableCell>
          </TableRow>

          {/* 1.2 Tolok ukur asesmen */}
          <TableRow height="23pt">
            <TableCell style={cellStyles.rowHeader} rowSpan={5}>
              <p style={paraStyle}>1.2</p>
            </TableCell>
            <TableCell style={cellStyles.labelTop} rowSpan={5}>
              <p style={{ ...paraStyle, lineHeight: '108%' }}>Tolok ukur asesmen</p>
            </TableCell>
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem text="Standar Kompetensi: SKKNI 079 Tahun 2015" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem text="Kriteria asesmen dari kurikulum pelatihan" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem text="Spesifikasi kinerja suatu perusahaan atau industri:" />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem text="Spesifikasi Produk:" />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem text="Pedoman khusus:" />
            </TableCell>
          </TableRow>
        </tbody>
      </table>

      <p style={{ margin: 0 }}><br /></p>
    </>
  );
}
