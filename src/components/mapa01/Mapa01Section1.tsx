/**
 * Mapa01Section1.tsx
 * Section 1: Pendekatan Asesmen - All 100% width with thin borders
 */
import { useState } from "react"
import { CustomCheckbox } from "@/components/ui/Checkbox"

// ============== CONSTANTS ==============
const COLORS = {
  BLACK: '#000',
  WHITE: '#FFF',
  RED: '#C00000',
} as const;

const BORDER = {
  thin: '1px solid #000',
} as const;

// ============== STYLE OBJECTS ==============
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const headerCellStyle = {
  borderTop: BORDER.thin,
  borderLeft: BORDER.thin,
  borderBottom: BORDER.thin,
  borderRight: BORDER.thin,
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

const paraStyle = { padding: '6px 8px', margin: 0, textAlign: 'left' as const };

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

const cellStyles = {
  rowHeader: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  labelTop: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  labelMiddle: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  labelBottom: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  contentTop: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  contentMiddle: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  contentBottom: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  contentTop2col: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  contentMiddle2col: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  contentBottom2col: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  subLabel: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  subContent1: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  subContent2: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
} as const;

// ============== COMPONENTS ==============
interface TableCellProps {
  style: React.CSSProperties;
  rowSpan?: number;
  colSpan?: number;
  children: React.ReactNode;
}

function TableCell({ style, rowSpan, colSpan, children }: TableCellProps) {
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
  checked?: boolean;
  onToggle?: () => void;
}

function CheckboxItem({ text, indent = '10pt', checked = false, onToggle }: CheckboxItemProps) {
  const hasToggle = !!onToggle

  return (
    <div
      onClick={onToggle}
      style={{
        padding: `3pt 0pt 0pt ${indent}`,
        margin: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        cursor: hasToggle ? 'pointer' : 'default',
        userSelect: hasToggle ? 'none' : 'auto'
      }}
    >
      <CustomCheckbox checked={checked} onChange={() => {}} style={{ pointerEvents: 'none' }} />
      <span style={{ fontSize: '12px', color: COLORS.BLACK, lineHeight: '1.4' }}>
        {text}
      </span>
    </div>
  );
}

// ============== MAIN COMPONENT ==============
export function Mapa01Section1() {
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({})

  const toggleCheckbox = (text: string) => {
    setCheckboxStates(prev => ({ ...prev, [text]: !prev[text] }))
  }

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
            <TableCell style={cellStyles.rowHeader} rowSpan={21}>
              <p style={paraStyle}>1.1.</p>
            </TableCell>
            <TableCell style={cellStyles.labelTop} rowSpan={5}>
              <p style={paraStyle}>Asesi</p>
            </TableCell>
            <TableCell style={cellStyles.contentTop} colSpan={3}>
              <CheckboxItem
                text="Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi."
                checked={checkboxStates["hasil_pelatihan"] || false}
                onToggle={() => toggleCheckbox("hasil_pelatihan")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="30pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi."
                checked={checkboxStates["hasil_pelatihan_tidak_kompetensi"] || false}
                onToggle={() => toggleCheckbox("hasil_pelatihan_tidak_kompetensi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="45pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <p style={{ padding: '0 0 0 43pt', margin: 0, lineHeight: '12pt', textAlign: 'left' }}></p>
              <CheckboxItem
                text="Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi."
                checked={checkboxStates["pekerja_berpengalaman_telusur"] || false}
                onToggle={() => toggleCheckbox("pekerja_berpengalaman_telusur")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="45pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <p style={{ padding: '0 0 0 43pt', margin: 0, lineHeight: '12pt', textAlign: 'left' }}></p>
              <CheckboxItem
                text=" Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya belum berbasis standar kompetensi."
                checked={checkboxStates["pekerja_berpengalaman_tidak_telusur"] || false}
                onToggle={() => toggleCheckbox("pekerja_berpengalaman_tidak_telusur")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Pelatihan/belajar mandiri atau otodidak."
                checked={checkboxStates["otodidak"] || false}
                onToggle={() => toggleCheckbox("otodidak")}
              />
            </TableCell>
          </TableRow>

          {/* Tujuan Asesmen */}
          <TableRow height="23pt">
            <TableCell style={cellStyles.labelMiddle} rowSpan={4}>
              <p style={{ ...paraStyle, padding: '6px 27pt 6px 6px', lineHeight: '108%' }}>Tujuan Asesmen</p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Sertifikasi"
                checked={checkboxStates["sertifikasi"] || false}
                onToggle={() => toggleCheckbox("sertifikasi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Pengakuan Kompetensi Terkini (PKT)"
                checked={checkboxStates["pkt"] || false}
                onToggle={() => toggleCheckbox("pkt")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Rekognisi pembelajaran lampau (RPL)"
                checked={checkboxStates["rpl"] || false}
                onToggle={() => toggleCheckbox("rpl")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Lainnya:"
                checked={checkboxStates["tujuan_lainnya"] || false}
                onToggle={() => toggleCheckbox("tujuan_lainnya")}
              />
            </TableCell>
          </TableRow>

          {/* Konteks Asesmen */}
          <TableRow height="30pt">
            <TableCell style={cellStyles.labelMiddle} rowSpan={8}>
              <p style={{ ...paraStyle, lineHeight: '108%' }}>Konteks Asesmen:</p>
            </TableCell>
            <TableCell style={cellStyles.subLabel}>
              <p style={{ padding: '7px 0 0 6pt', margin: 0, textAlign: 'left' }}>Lingkungan</p>
            </TableCell>
            <TableCell style={cellStyles.subContent1}>
              <CheckboxItem
                text="Tempat kerja nyata"
                checked={checkboxStates["tempat_kerja_nyata"] || false}
                onToggle={() => toggleCheckbox("tempat_kerja_nyata")}
              />
            </TableCell>
            <TableCell style={cellStyles.subContent2}>
              <CheckboxItem
                text="Tempat kerja simulasi"
                checked={checkboxStates["tempat_kerja_simulasi"] || false}
                onToggle={() => toggleCheckbox("tempat_kerja_simulasi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="55pt">
            <TableCell style={cellStyles.subLabel}>
              <p style={{ padding: '0 0 0 6pt', margin: 0, lineHeight: '108%', fontSize: '11px', textAlign: 'left' }}>Peluang untuk mengumpulkan bukti dalam</p>
              <p style={{ padding: '0 0 0 6pt', margin: 0, lineHeight: '12px', fontSize: '11px', textAlign: 'left' }}>sejumlah situasi</p>
            </TableCell>
            <TableCell style={cellStyles.subContent1}>
              <p style={{ padding: '2pt 0 0 0', margin: 0 }}><br /></p>
              <CheckboxItem
                text="Tersedia"
                checked={checkboxStates["tersedia"] || false}
                onToggle={() => toggleCheckbox("tersedia")}
              />
            </TableCell>
            <TableCell style={cellStyles.subContent2}>
              <p style={{ padding: '2pt 0 0 0', margin: 0 }}><br /></p>
              <CheckboxItem
                text="Terbatas"
                checked={checkboxStates["terbatas"] || false}
                onToggle={() => toggleCheckbox("terbatas")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.subLabel} rowSpan={3}>
              <p style={{ padding: '0 3pt 0 6pt', margin: 0, lineHeight: '108%', textAlign: 'left' }}>Hubungan antara standar kompetensi dan:</p>
            </TableCell>
            <TableCell style={cellStyles.contentTop2col} colSpan={2}>
              <CheckboxItem
                text="Bukti untuk mendukung asesmen / RPL:"
                checked={checkboxStates["bukti_asesmen_rpl"] || false}
                onToggle={() => toggleCheckbox("bukti_asesmen_rpl")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="Aktivitas kerja di tempat kerja kandidat: "
                checked={checkboxStates["aktivitas_kerja"] || false}
                onToggle={() => toggleCheckbox("aktivitas_kerja")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="Kegiatan Pembelajaran:"
                checked={checkboxStates["kegiatan_pembelajaran"] || false}
                onToggle={() => toggleCheckbox("kegiatan_pembelajaran")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.subLabel} rowSpan={3}>
              <p style={{ padding: '0 24pt 0 6pt', margin: 0, lineHeight: '108%', textAlign: 'left' }}>Siapa yang melakukan asesmen / RPL</p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="LSP Gatensi Karya Konstruksi"
                checked={checkboxStates["lsp_gatensi"] || false}
                onToggle={() => toggleCheckbox("lsp_gatensi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="Organisasi Pelatihan"
                checked={checkboxStates["organisasi_pelatihan"] || false}
                onToggle={() => toggleCheckbox("organisasi_pelatihan")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="asesor perusahaan"
                checked={checkboxStates["asesor_perusahaan"] || false}
                onToggle={() => toggleCheckbox("asesor_perusahaan")}
              />
            </TableCell>
          </TableRow>

          {/* Orang yang relevan */}
          <TableRow height="23pt">
            <TableCell style={cellStyles.labelBottom} rowSpan={4}>
              <p style={{ ...paraStyle, lineHeight: '108%' }}>Orang yang relevan untuk dikonfirmasi</p>
            </TableCell>
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Manajer sertifikasi LSP Gatensi Karya Konstruksi"
                checked={checkboxStates["manajer_sertifikasi_lsp"] || false}
                onToggle={() => toggleCheckbox("manajer_sertifikasi_lsp")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Master Assessor / Master Trainer / Asesor Utama kompetensi"
                checked={checkboxStates["master_assessor_lsp"] || false}
                onToggle={() => toggleCheckbox("master_assessor_lsp")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="30pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar"
                checked={checkboxStates["manajer_pelatihan_lsp"] || false}
                onToggle={() => toggleCheckbox("manajer_pelatihan_lsp")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Lainnya:"
                checked={checkboxStates["orang_lainnya"] || false}
                onToggle={() => toggleCheckbox("orang_lainnya")}
              />
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
              <CheckboxItem
                text="Standar Kompetensi: SKKNI 079 Tahun 2015"
                checked={checkboxStates["skkni"] || false}
                onToggle={() => toggleCheckbox("skkni")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Kriteria asesmen dari kurikulum pelatihan"
                checked={checkboxStates["kriteria_kurikulum"] || false}
                onToggle={() => toggleCheckbox("kriteria_kurikulum")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Spesifikasi kinerja suatu perusahaan atau industri:"
                checked={checkboxStates["spesifikasi_kinerja"] || false}
                onToggle={() => toggleCheckbox("spesifikasi_kinerja")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Spesifikasi Produk:"
                checked={checkboxStates["spesifikasi_produk"] || false}
                onToggle={() => toggleCheckbox("spesifikasi_produk")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Pedoman khusus:"
                checked={checkboxStates["pedoman_khusus"] || false}
                onToggle={() => toggleCheckbox("pedoman_khusus")}
              />
            </TableCell>
          </TableRow>
        </tbody>
      </table>

      <p style={{ margin: 0 }}><br /></p>
    </>
  );
}
