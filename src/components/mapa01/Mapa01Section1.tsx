/**
 * Mapa01Section1.tsx
 * Section 1: Pendekatan Asesmen - All 100% width with thin borders
 */
import { useState, useMemo, useEffect } from "react"
import { CustomCheckbox } from "@/components/ui/Checkbox"

// ============== TYPES ==============
interface Referensi {
  id: number
  nama: string
  value: boolean
}

interface Subkategori {
  id: number | null
  nama: string
  urut: number | null
  referensis: Referensi[]
}

interface Kategori {
  id: number | null
  kategori: string | null
  nama: string
  urut: number | null
  id_kelompok: number | null
  subkategoris: Subkategori[]
}

interface KelompokForm {
  id: number
  nama: string | null
  urut: number
  kategoris: Kategori[]
}

interface ReferensiFormItem {
  kelompok: KelompokForm
}

interface Mapa01Section1Props {
  referensiForm?: ReferensiFormItem[]
}

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
export function Mapa01Section1({ referensiForm }: Mapa01Section1Props) {
  // Build checkbox states from referensiForm data
  const initialCheckboxStates = useMemo(() => {
    const states: Record<string, boolean> = {}
    if (referensiForm) {
      console.log('Building checkbox states from referensiForm:', referensiForm)
      referensiForm.forEach((item) => {
        const kelompok = item.kelompok
        kelompok.kategoris?.forEach((kategori) => {
          console.log('Kategori:', kategori.nama, kategori)
          kategori.subkategoris?.forEach((subkategori) => {
            subkategori.referensis?.forEach((ref) => {
              console.log('Referensi:', ref.id, ref.nama, ref.value)
              states[`ref_${ref.id}`] = ref.value
            })
          })
        })
      })
      console.log('Final states:', states)
    }
    return states
  }, [referensiForm])

  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({})

  // Sync checkbox states when referensiForm loads
  useEffect(() => {
    console.log('initialCheckboxStates changed:', initialCheckboxStates)
    if (Object.keys(initialCheckboxStates).length > 0) {
      setCheckboxStates(initialCheckboxStates)
    }
  }, [initialCheckboxStates])

  useEffect(() => {
    console.log('checkboxStates updated:', checkboxStates)
  }, [checkboxStates])

  const toggleCheckbox = (text: string) => {
    setCheckboxStates(prev => ({ ...prev, [text]: !prev[text] }))
  }

  // Helper to find checkbox state by referensi id
  const getCheckedState = (kategoriNama: string, refNama: string, defaultKey: string): boolean => {
    console.log('getCheckedState called:', { kategoriNama, refNama, defaultKey })
    if (referensiForm) {
      for (const item of referensiForm) {
        const kelompok = item.kelompok
        for (const kategori of kelompok.kategoris || []) {
          console.log('Checking kategori:', kategori.nama, '===', kategoriNama, '?', kategori.nama === kategoriNama)
          if (kategori.nama === kategoriNama) {
            for (const subkategori of kategori.subkategoris || []) {
              for (const ref of subkategori.referensis || []) {
                // Normalize text for comparison (remove extra spaces, punctuation)
                const normalizedRefNama = ref.nama?.trim().replace(/\s+/g, ' ').toLowerCase() || ''
                const normalizedSearch = refNama.trim().replace(/\s+/g, ' ').toLowerCase()
                console.log('Comparing:', normalizedRefNama, '===', normalizedSearch, '?', normalizedRefNama === normalizedSearch)
                if (normalizedRefNama === normalizedSearch || normalizedRefNama.includes(normalizedSearch)) {
                  const result = checkboxStates[`ref_${ref.id}`] ?? false
                  console.log('Found match! ref id:', ref.id, 'value:', result)
                  return result
                }
              }
            }
          }
        }
      }
    }
    console.log('No match found, using default:', checkboxStates[defaultKey] || false)
    return checkboxStates[defaultKey] || false
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
                checked={getCheckedState("Asesi", "Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi.", "hasil_pelatihan")}
                onToggle={() => toggleCheckbox("hasil_pelatihan")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="30pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi."
                checked={getCheckedState("Asesi", "Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi.", "hasil_pelatihan_tidak_kompetensi")}
                onToggle={() => toggleCheckbox("hasil_pelatihan_tidak_kompetensi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="45pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <p style={{ padding: '0 0 0 43pt', margin: 0, lineHeight: '12pt', textAlign: 'left' }}></p>
              <CheckboxItem
                text="Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi."
                checked={getCheckedState("Asesi", "Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.", "pekerja_berpengalaman_telusur")}
                onToggle={() => toggleCheckbox("pekerja_berpengalaman_telusur")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="45pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <p style={{ padding: '0 0 0 43pt', margin: 0, lineHeight: '12pt', textAlign: 'left' }}></p>
              <CheckboxItem
                text="Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya belum berbasis standar kompetensi."
                checked={getCheckedState("Asesi", "Pekerja berpengalaman, dimana berasal dari industry/tempat kerja yang dalam operasionalnya belum berbasis standar kompetensi", "pekerja_berpengalaman_tidak_telusur")}
                onToggle={() => toggleCheckbox("pekerja_berpengalaman_tidak_telusur")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Pelatihan/belajar mandiri atau otodidak."
                checked={getCheckedState("Asesi", "Pelatihan/belajar mandiri atau otodidak.", "otodidak")}
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
                checked={getCheckedState("Tujuan Asesmen", "Sertifikasi", "sertifikasi")}
                onToggle={() => toggleCheckbox("sertifikasi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Pengakuan Kompetensi Terkini (PKT)"
                checked={getCheckedState("Tujuan Asesmen", "Pengakuan Kompetensi Terkini (PKT)", "pkt")}
                onToggle={() => toggleCheckbox("pkt")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Rekognisi pembelajaran lampau (RPL)"
                checked={getCheckedState("Tujuan Asesmen", "Rekognisi pembelajaran lampau (RPL)", "rpl")}
                onToggle={() => toggleCheckbox("rpl")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Lainnya"
                checked={getCheckedState("Tujuan Asesmen", "Lainnya", "tujuan_lainnya")}
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
                checked={getCheckedState("Konteks Asesmen", "Tempat kerja nyata", "tempat_kerja_nyata")}
                onToggle={() => toggleCheckbox("tempat_kerja_nyata")}
              />
            </TableCell>
            <TableCell style={cellStyles.subContent2}>
              <CheckboxItem
                text="Tempat kerja simulasi"
                checked={getCheckedState("Konteks Asesmen", "Tempat kerja simulasi", "tempat_kerja_simulasi")}
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
                checked={getCheckedState("Konteks Asesmen", "Tersedia", "tersedia")}
                onToggle={() => toggleCheckbox("tersedia")}
              />
            </TableCell>
            <TableCell style={cellStyles.subContent2}>
              <p style={{ padding: '2pt 0 0 0', margin: 0 }}><br /></p>
              <CheckboxItem
                text="Terbatas"
                checked={getCheckedState("Konteks Asesmen", "Terbatas", "terbatas")}
                onToggle={() => toggleCheckbox("terbatas")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.subLabel} rowSpan={3}>
              <p style={{ padding: '0 3pt 0 6pt', margin: 0, lineHeight: '108%', textAlign: 'left' }}>Hubungan antara standar kompetensi dan</p>
            </TableCell>
            <TableCell style={cellStyles.contentTop2col} colSpan={2}>
              <CheckboxItem
                text="Bukti untuk mendukung asesmen / RPL"
                checked={getCheckedState("Konteks Asesmen", "Bukti untuk mendukung asesmen / RPL", "bukti_asesmen_rpl")}
                onToggle={() => toggleCheckbox("bukti_asesmen_rpl")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="Aktivitas kerja di tempat kerja kandidat"
                checked={getCheckedState("Konteks Asesmen", "Aktivitas kerja di tempat kerja kandidat", "aktivitas_kerja")}
                onToggle={() => toggleCheckbox("aktivitas_kerja")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="Kegiatan Pembelajaran"
                checked={getCheckedState("Konteks Asesmen", "Kegiatan Pembelajaran", "kegiatan_pembelajaran")}
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
                checked={getCheckedState("Konteks Asesmen", "LSP Gatensi Karya Konstruksi", "lsp_gatensi")}
                onToggle={() => toggleCheckbox("lsp_gatensi")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="Organisasi Pelatihan"
                checked={getCheckedState("Konteks Asesmen", "Organisasi Pelatihan", "organisasi_pelatihan")}
                onToggle={() => toggleCheckbox("organisasi_pelatihan")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle2col} colSpan={2}>
              <CheckboxItem
                text="asesor perusahaan"
                checked={getCheckedState("Konteks Asesmen", "asesor perusahaan", "asesor_perusahaan")}
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
                checked={getCheckedState("Orang yang relevan untuk dikonfirmasi", "Manajer sertifikasi LSP Gatensi Karya Konstruksi", "manajer_sertifikasi_lsp")}
                onToggle={() => toggleCheckbox("manajer_sertifikasi_lsp")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Master Assessor / Master Trainer / Asesor Utama kompetensi"
                checked={getCheckedState("Orang yang relevan untuk dikonfirmasi", "Master Assessor / Master Trainer / Asesor Utama kompetensi", "master_assessor_lsp")}
                onToggle={() => toggleCheckbox("master_assessor_lsp")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="30pt">
            <TableCell style={cellStyles.contentMiddle} colSpan={3}>
              <CheckboxItem
                text="Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar"
                checked={getCheckedState("Orang yang relevan untuk dikonfirmasi", "Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar", "manajer_pelatihan_lsp")}
                onToggle={() => toggleCheckbox("manajer_pelatihan_lsp")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Lainnya"
                checked={getCheckedState("Orang yang relevan untuk dikonfirmasi", "Lainnya", "orang_lainnya")}
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
                text="Standar Kompetensi"
                checked={getCheckedState("Tolok ukur asesmen", "Standar Kompetensi", "skkni")}
                onToggle={() => toggleCheckbox("skkni")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Kriteria asesmen dari kurikulum pelatihan"
                checked={getCheckedState("Tolok ukur asesmen", "Kriteria asesmen dari kurikulum pelatihan", "kriteria_kurikulum")}
                onToggle={() => toggleCheckbox("kriteria_kurikulum")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Spesifikasi kinerja suatu perusahaan atau industri"
                checked={getCheckedState("Tolok ukur asesmen", "Spesifikasi kinerja suatu perusahaan atau industri", "spesifikasi_kinerja")}
                onToggle={() => toggleCheckbox("spesifikasi_kinerja")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="23pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Spesifikasi Produk"
                checked={getCheckedState("Tolok ukur asesmen", "Spesifikasi Produk", "spesifikasi_produk")}
                onToggle={() => toggleCheckbox("spesifikasi_produk")}
              />
            </TableCell>
          </TableRow>

          <TableRow height="24pt">
            <TableCell style={cellStyles.contentBottom} colSpan={3}>
              <CheckboxItem
                text="Pedoman khusus"
                checked={getCheckedState("Tolok ukur asesmen", "Pedoman khusus", "pedoman_khusus")}
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
