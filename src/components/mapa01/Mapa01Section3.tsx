/**
 * Mapa01Section3.tsx
 * Section 3: Modifikasi dan Kontekstualisasi - 100% width with thin borders
 */
import { useState, useMemo, useEffect, useRef } from "react"
import { CustomRadio } from "@/components/ui/Radio"

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

interface Mapa01Section3Props {
  referensiForm?: ReferensiFormItem[]
}

interface Section3Item {
  id: number
  label: string
  prefixLabel: string
  value: boolean
  alasan: string
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
  header: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  content: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
} as const;

// ============== COMPONENT ==============
export function Mapa01Section3({ referensiForm }: Mapa01Section3Props) {
  const headerStyle = {
    ...cellStyles.header,
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

  // Build section3 items from referensiForm (kelompok 3)
  const initialItems = useMemo(() => {
    const items: Section3Item[] = []

    // Labels mapping for section 3
    const labelMapping: Record<string, { prefix: string; label: string }> = {
      "Karakteristik kandidat: ": {
        prefix: "3.1. a.",
        label: "Karakteristik kandidat:"
      },
      "Kebutuhan kontekstualisasi terkait tempat kerja:": {
        prefix: "3.1. b.",
        label: "Kebutuhan kontekstualisasi terkait tempat kerja:"
      },
      "Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan": {
        prefix: "3.2.",
        label: "Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan"
      },
      "Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi": {
        prefix: "3.3.",
        label: "Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi"
      },
      "Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat asesmen": {
        prefix: "3.4.",
        label: "Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat asesmen"
      }
    }

    if (referensiForm) {
      // Find kelompok with id 3 (section 3 data)
      const kelompok3 = referensiForm.find(item => item.kelompok.id === 3)
      if (kelompok3) {
        kelompok3.kelompok.kategoris?.forEach((kategori) => {
          kategori.subkategoris?.forEach((subkategori) => {
            subkategori.referensis?.forEach((ref) => {
              const mapping = labelMapping[ref.nama]
              if (mapping) {
                items.push({
                  id: ref.id,
                  label: mapping.label,
                  prefixLabel: mapping.prefix,
                  value: ref.value,
                  alasan: ''
                })
              }
            })
          })
        })
      }
    }

    return items
  }, [referensiForm])

  const [items, setItems] = useState<Section3Item[]>(initialItems)
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement>>({})

  // Sync items when initialItems changes
  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems)
    }
  }, [initialItems])

  // Auto-resize textareas when items change
  useEffect(() => {
    items.forEach(item => {
      if (item.value && item.alasan) {
        const textarea = textareaRefs.current[item.id]
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }
      }
    })
  }, [items])

  const handleRadioChange = (id: number, value: boolean) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, value } : item
    ))
  }

  const handleAlasanChange = (id: number, alasan: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, alasan } : item
    ))
  }

  // Auto-resize textarea based on content
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
    handleAlasanChange(parseInt(textarea.name.replace('section3-alasan-', '')), textarea.value)
  }

  return (
    <>
      {/* Section 3 Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '26pt' }}>
            <td style={headerStyle} colSpan={2}>
              <p style={headerTextStyle}>
                3. Modifikasi dan Kontekstualisasi:
              </p>
            </td>
          </tr>

          {/* Dynamic rows from API */}
          {items.map((item, index) => (
            <tr key={item.id}>
              <td style={{ ...cellStyles.content, background: '#fff', verticalAlign: 'top' }}>
                <p style={{ ...paraStyle, paddingLeft: index < 2 ? (index === 0 ? '6px' : '28px') : '23px' }}>
                  {item.prefixLabel} {item.label}
                </p>
              </td>
              <td style={{ ...cellStyles.content, background: '#fff', verticalAlign: 'top', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '12px' }}>
                  {/* Ya radio */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <CustomRadio
                      name={`section3-${item.id}`}
                      value="ya"
                      checked={item.value === true}
                      onChange={() => handleRadioChange(item.id, true)}
                    />
                    <span style={{ fontSize: '12px' }}>Ada</span>
                  </label>

                  {/* Tidak radio */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <CustomRadio
                      name={`section3-${item.id}`}
                      value="tidak"
                      checked={item.value === false}
                      onChange={() => handleRadioChange(item.id, false)}
                    />
                    <span style={{ fontSize: '12px' }}>Tidak ada</span>
                  </label>
                </div>

                {/* Text field when "Ada" is selected */}
                {item.value && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '11px', margin: '0 0 6px 0', fontWeight: '500' }}>Jika ada, tuliskan:</p>
                    <textarea
                      ref={(el) => { if (el) textareaRefs.current[item.id] = el }}
                      name={`section3-alasan-${item.id}`}
                      value={item.alasan}
                      onChange={handleTextareaResize}
                      placeholder="Alasan/keterangan..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        outline: 'none',
                        background: '#fff',
                        resize: 'none',
                        minHeight: '40px',
                        height: item.alasan ? 'auto' : '40px',
                        overflow: 'hidden',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ padding: '0 0 0 14px', margin: 0, fontSize: '12px', textAlign: 'left' }}>
        *Pilih salah satu opsi
      </p>

      <p style={{ padding: '5px 0 0 0', margin: 0 }}><br /></p>
    </>
  )
}
