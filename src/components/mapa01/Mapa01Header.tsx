/**
 * Mapa01Header.tsx
 * Header section - FR. MAPA.01 MERENCANAKAN AKTIVITAS DAN PROSES ASESMEN
 */

interface Mapa01HeaderProps {
  judul?: string
  nomor?: string
}

export function Mapa01Header({
  judul = 'TEKNISI JEMBATAN RANGKA BAJA',
  nomor = 'SKEMA-26/LSP-GKK/2022'
}: Mapa01HeaderProps) {
  return (
    <>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
          FR. MAPA.01 MERENCANAKAN AKTIVITAS DAN PROSES ASESMEN
        </h2>
      </div>

      {/* Skema Sertifikasi Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px',
        marginBottom: '16px'
      }}>
        <tbody>
          <tr>
            <td style={{
              width: '35%',
              border: '2px solid #000',
              padding: '4pt 5pt',
              verticalAlign: 'middle',
              background: '#fff'
            }}>
              Skema Sertifikasi Okupasi Nasional
            </td>
            <td style={{
              width: '10%',
              border: '1px solid #000',
              borderTopWidth: '2px',
              padding: '4pt 6pt',
              verticalAlign: 'middle',
              textAlign: 'left',
              background: '#fff'
            }}>
              Judul
            </td>
            <td style={{
              width: '3%',
              border: '1px solid #000',
              borderTopWidth: '2px',
              padding: '4pt 6pt',
              verticalAlign: 'middle',
              textAlign: 'left',
              background: '#fff'
            }}>
              :
            </td>
            <td style={{
              border: '2px solid #000',
              borderLeftWidth: '1px',
              padding: '4pt 6pt',
              verticalAlign: 'middle',
              background: '#fff'
            }}>
              {judul}
            </td>
          </tr>
          <tr>
            <td style={{
              border: '2px solid #000',
              borderTopWidth: '1px',
              padding: '4pt 5pt',
              verticalAlign: 'middle',
              background: '#fff'
            }}>
              {/* Empty cell */}
            </td>
            <td style={{
              border: '1px solid #000',
              borderBottomWidth: '2px',
              padding: '4pt 6pt',
              verticalAlign: 'middle',
              textAlign: 'left',
              background: '#fff'
            }}>
              Nomor
            </td>
            <td style={{
              border: '1px solid #000',
              borderBottomWidth: '2px',
              padding: '4pt 6pt',
              verticalAlign: 'middle',
              textAlign: 'left',
              background: '#fff'
            }}>
              :
            </td>
            <td style={{
              border: '2px solid #000',
              borderLeftWidth: '1px',
              borderTopWidth: '1px',
              padding: '4pt 6pt',
              verticalAlign: 'middle',
              background: '#fff'
            }}>
              {nomor}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
