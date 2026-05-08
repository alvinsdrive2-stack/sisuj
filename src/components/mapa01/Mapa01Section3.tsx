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

interface Mapa01Section3Props {
  referensiForm?: ReferensiFormItem[]
  kelompokKerja?: KelompokKerja[]
  isAsesor?: boolean
  disabled?: boolean
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
export function Mapa01Section3({ referensiForm, kelompokKerja, isAsesor = false, disabled = false }: Mapa01Section3Props) {
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
  const kelompokTextareaRefs = useRef<Record<number, HTMLTextAreaElement>>({})
  const [kelompokAlasan, setKelompokAlasan] = useState<Record<number, string>>({})

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
    // Auto-resize kelompok textareas
    Object.values(kelompokTextareaRefs.current).forEach(textarea => {
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    })
  }, [items, kelompokAlasan])

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

  const handleKelompokAlasanChange = (id: number, value: string) => {
    setKelompokAlasan(prev => ({ ...prev, [id]: value }))
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
                  {/* Ada radio */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    <CustomRadio
                      name={`section3-${item.id}`}
                      value="ya"
                      checked={item.value === true}
                      onChange={() => !disabled && isAsesor && handleRadioChange(item.id, true)}
                      disabled={disabled || !isAsesor}
                    />
                    <span style={{ fontSize: '12px' }}>Ada</span>
                  </label>

                  {/* Tidak ada radio */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    <CustomRadio
                      name={`section3-${item.id}`}
                      value="tidak"
                      checked={item.value === false}
                      onChange={() => !disabled && isAsesor && handleRadioChange(item.id, false)}
                      disabled={disabled || !isAsesor}
                    />
                    <span style={{ fontSize: '12px' }}>Tidak ada</span>
                  </label>
                </div>

                {/* Text field — only show if "Ada" selected */}
                {item.value && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '11px', margin: '0 0 6px 0', fontWeight: '500' }}>Jika ada, tuliskan:</p>
                  <textarea
                    ref={(el) => { if (el) textareaRefs.current[item.id] = el }}
                    name={`section3-alasan-${item.id}`}
                    value={item.alasan}
                    onChange={(e) => {
                      const textarea = e.target
                      textarea.style.height = 'auto'
                      textarea.style.height = textarea.scrollHeight + 'px'
                      handleAlasanChange(item.id, textarea.value)
                    }}
                    placeholder="Alasan/keterangan..."
                    disabled={disabled || !isAsesor}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      outline: 'none',
                      background: (disabled || !isAsesor) ? '#f5f5f5' : '#fff',
                      resize: 'none',
                      minHeight: '40px',
                      height: item.alasan ? 'auto' : '40px',
                      overflow: 'hidden',
                      fontFamily: 'inherit',
                      cursor: (disabled || !isAsesor) ? 'not-allowed' : 'text',
                      opacity: (disabled || !isAsesor) ? 0.6 : 1
                    }}
                  />
                </div>
                )}

                {/* Kelompok Pekerjaan — only show below item 3.4 (last item) */}
                {index === items.length - 1 && kelompokKerja && kelompokKerja.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #000', paddingTop: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Kelompok Pekerjaan:</div>
                    {kelompokKerja.map((kelompok, kIdx) => (
                      <div key={kelompok.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <div style={{ fontWeight: '500' }}>Kelompok {kIdx + 1}:</div>
                        {kelompok.units.map(u => (
                          <div key={u.id_unit} style={{ paddingLeft: '16px' }}>- {u.kode_unit}</div>
                        ))}
                        <textarea
                          ref={(el) => { if (el) kelompokTextareaRefs.current[kelompok.id] = el }}
                          value={kelompokAlasan[kelompok.id] || ''}
                          onChange={(e) => {
                            const ta = e.target
                            ta.style.height = 'auto'
                            ta.style.height = ta.scrollHeight + 'px'
                            handleKelompokAlasanChange(kelompok.id, ta.value)
                          }}
                          placeholder="Alasan/keterangan..."
                          disabled={disabled}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '12px',
                            lineHeight: '1.5',
                            border: '1px solid #000',
                            borderRadius: '4px',
                            outline: 'none',
                            background: disabled ? '#f5f5f5' : '#fff',
                            resize: 'none',
                            minHeight: '40px',
                            overflow: 'hidden',
                            fontFamily: 'inherit',
                            cursor: disabled ? 'not-allowed' : 'text',
                            opacity: disabled ? 0.6 : 1,
                            marginTop: '4px'
                          }}
                        />
                      </div>
                    ))}
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
