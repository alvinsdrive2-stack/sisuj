/**
 * Mapa01TandaTangan.tsx
 * Tanda Tangan & Konfirmasi section - 100% width with thin borders
 */

import { useState } from "react"
import { CustomCheckbox } from "../ui/Checkbox"

interface Mapa01TandaTanganProps {
  namaPenyusun?: string | null
  namaValidator?: string | null
  tanggalPenyusun?: string | null
  tanggalValidator?: string | null
  barcodePenyusun?: string | null
  barcodeValidator?: string | null
  noregPenyusun?: string | null
  noregValidator?: string | null
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
export function Mapa01TandaTangan({
  namaPenyusun,
  namaValidator,
  tanggalPenyusun,
  tanggalValidator,
  barcodePenyusun,
  barcodeValidator,
  noregPenyusun,
  noregValidator
}: Mapa01TandaTanganProps) {
  const [checkboxStates, setCheckboxStates] = useState({
    manajerSertifikasi: false,
    masterAssessor: false,
    manajerPelatihan: false,
    lainnya: false,
  })

  const toggleCheckbox = (key: keyof typeof checkboxStates) => {
    setCheckboxStates(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const headerCellStyle = {
    ...cellStyles.header,
    backgroundColor: COLORS.RED,
  };

  const headerTextStyle = {
    color: COLORS.WHITE,
    fontWeight: 'bold' as const,
    fontSize: '12px',
    padding: '6px 8px',
  };

  const contentCellStyle = {
    ...cellStyles.content,
    background: '#fff' as const,
  };

  return (
    <>
      {/* Title */}
      <h1 style={{
        paddingLeft: '13px',
        margin: 0,
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'black',
        fontFamily: 'Arial, sans-serif'
      }}>
        Konfirmasi dengan orang yang relevan:
      </h1>
      <p style={{ margin: 0 }}><br /></p>

      {/* Konfirmasi Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '23pt' }}>
            <td style={headerCellStyle}>
              <span style={{ ...headerTextStyle, textAlign: 'left' }}>
                Orang yang relevan
              </span>
            </td>
            <td style={headerCellStyle}>
              <span style={{ ...headerTextStyle, textAlign: 'center' }}>
                Nama
              </span>
            </td>
            <td style={headerCellStyle}>
              <span style={{ ...headerTextStyle, textAlign: 'left' }}>
                Tandatangan
              </span>
            </td>
          </tr>

          <tr style={{ height: '54pt' }}>
            <td style={{ ...contentCellStyle, padding: '11px 20px' }}>
              <div
                onClick={() => toggleCheckbox('manajerSertifikasi')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
              >
                <CustomCheckbox checked={checkboxStates.manajerSertifikasi} onChange={() => {}} style={{ pointerEvents: 'none' }} />
                <span style={{ fontSize: '12px', color: COLORS.BLACK }}>
                  Manajer sertifikasi
                </span>
              </div>
            </td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
          </tr>

          <tr style={{ height: '53pt' }}>
            <td style={{ ...contentCellStyle, padding: '6px 20px', lineHeight: '12px' }}>
              <div
                onClick={() => toggleCheckbox('masterAssessor')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
              >
                <CustomCheckbox checked={checkboxStates.masterAssessor} onChange={() => {}} style={{ pointerEvents: 'none' }} />
                <span style={{ fontSize: '12px', color: COLORS.BLACK }}>
                  Master Assessor / Master Trainer / Asesor Utama kompetensi
                </span>
              </div>
            </td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
          </tr>

          <tr style={{ height: '53pt' }}>
            <td style={{ ...contentCellStyle, padding: '6px 20px', lineHeight: '12px' }}>
              <div
                onClick={() => toggleCheckbox('manajerPelatihan')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
              >
                <CustomCheckbox checked={checkboxStates.manajerPelatihan} onChange={() => {}} style={{ pointerEvents: 'none' }} />
                <span style={{ fontSize: '12px', color: COLORS.BLACK }}>
                  Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar
                </span>
              </div>
            </td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
          </tr>

          <tr style={{ height: '46pt' }}>
            <td style={{ ...contentCellStyle, padding: '7px 20px' }}>
              <div
                onClick={() => toggleCheckbox('lainnya')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
              >
                <CustomCheckbox checked={checkboxStates.lainnya} onChange={() => {}} style={{ pointerEvents: 'none' }} />
                <span style={{ fontSize: '12px', color: COLORS.BLACK }}>
                  Lainnya:
                </span>
              </div>
            </td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '12px 8px' }}></td>
          </tr>
        </tbody>
      </table>

      <p style={{ paddingTop: '3px', margin: 0 }}><br /></p>

      {/* Tanda Tangan Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '28pt' }}>
            <td style={headerCellStyle}>
              <span style={headerTextStyle}>
                Status
              </span>
            </td>
            <td style={headerCellStyle}>
              <span style={{ ...headerTextStyle, textAlign: 'center' }}>
                No
              </span>
            </td>
            <td style={headerCellStyle}>
              <span style={{ ...headerTextStyle, textAlign: 'center' }}>
                Nama
              </span>
            </td>
            <td style={headerCellStyle}>
              <span style={{ ...headerTextStyle, textAlign: 'left' }}>
                Nomor MET
              </span>
            </td>
            <td style={headerCellStyle}>
              <span style={headerTextStyle}>
                Tanda Tangan dan Tanggal
              </span>
            </td>
          </tr>

          {/* Penyusun */}
          <tr style={{ height: '91pt' }}>
            <td style={{ ...contentCellStyle }} rowSpan={2}>
              <div style={{ padding: '15px 0 0 0' }}></div>
              <span style={{ fontSize: '12px', color: 'black', paddingLeft: '15px' }}>
                Penyusun
              </span>
            </td>
            <td style={{ ...contentCellStyle, padding: '6px 8px' }}>
              <span style={{ fontSize: '12px', color: 'black', textAlign: 'center' }}>1</span>
            </td>
            <td style={{ ...contentCellStyle, padding: '7px 8px', fontSize: '12px' }}>{namaPenyusun || ''}</td>
            <td style={{ ...contentCellStyle, padding: '13px 8px', fontSize: '12px' }}>{noregPenyusun || '-'}</td>
            <td style={{ ...contentCellStyle, padding: '8px', textAlign: 'center' }}>
              {barcodePenyusun ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <img src={barcodePenyusun} alt="QR Penyusun" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  {tanggalPenyusun && <span style={{ fontSize: '10px' }}>{new Date(tanggalPenyusun).toLocaleDateString('id-ID')}</span>}
                </div>
              ) : ''}
            </td>
          </tr>

          <tr style={{ height: '23pt' }}>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
          </tr>

          {/* Validator */}
          <tr style={{ height: '68pt' }}>
            <td style={{ ...contentCellStyle }} rowSpan={2}>
              <div style={{ padding: '18px 0 0 0' }}></div>
              <span style={{ fontSize: '12px', color: 'black', paddingLeft: '18px' }}>
                Validator
              </span>
            </td>
            <td style={{ ...contentCellStyle, padding: '6px 8px' }}>
              <span style={{ fontSize: '12px', color: 'black', textAlign: 'center' }}>1</span>
            </td>
            <td style={{ ...contentCellStyle, padding: '7px 8px', fontSize: '12px' }}>{namaValidator || ''}</td>
            <td style={{ ...contentCellStyle, padding: '13px 8px', fontSize: '12px' }}>{noregValidator || '-'}</td>
            <td style={{ ...contentCellStyle, padding: '8px', textAlign: 'center' }}>
              {barcodeValidator ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <img src={barcodeValidator} alt="QR Validator" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  {tanggalValidator && <span style={{ fontSize: '10px' }}>{new Date(tanggalValidator).toLocaleDateString('id-ID')}</span>}
                </div>
              ) : ''}
            </td>
          </tr>

          <tr style={{ height: '23pt' }}>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
            <td style={{ ...contentCellStyle, padding: '1px 8px' }}></td>
          </tr>
        </tbody>
      </table>
      <br></br>
    </>
  )
}
