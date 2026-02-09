/**
 * Mapa01Section3.tsx
 * Section 3: Modifikasi dan Kontekstualisasi - 100% width with thin borders
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

const cellStyles = {
  header: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
  content: createCellStyle(BORDER.thin, BORDER.thin, BORDER.thin, BORDER.thin),
} as const;

// ============== COMPONENT ==============
export function Mapa01Section3() {
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

          {/* 3.1 a. Karakteristik kandidat */}
          <tr style={{ height: '41pt' }}>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={paraStyle}>
                3.1. a. Karakteristik kandidat:
              </p>
            </td>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={paraStyle}>
                Ada / tidak ada *) karateristik khusus kandidat
              </p>
              <p style={{ ...paraStyle, paddingTop: '8px' }}>
                Jika ada, tuliskan ........................
              </p>
            </td>
          </tr>

          {/* 3.1 b. Kebutuhan kontekstualisasi */}
          <tr style={{ height: '41pt' }}>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={{ ...paraStyle, paddingLeft: '28px' }}>
                b. Kebutuhan kontekstualisasi terkait tempat kerja:
              </p>
            </td>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={paraStyle}>
                Ada / tidak ada *) kebutuhan kontekstualisasi.
              </p>
              <p style={{ ...paraStyle, paddingTop: '8px' }}>
                Jika ada, tuiiskan ........................
              </p>
            </td>
          </tr>

          {/* 3.2 Saran */}
          <tr style={{ height: '46pt' }}>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={{ ...paraStyle, paddingLeft: '23px' }}>
                3.2. Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan
              </p>
            </td>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={paraStyle}>
                Ada / tidak ada *) saran.
              </p>
              <p style={{ ...paraStyle, paddingTop: '8px' }}>
                Jika ada, tuliskan .........................
              </p>
            </td>
          </tr>

          {/* 3.3 Penyesuaian */}
          <tr style={{ height: '46pt' }}>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={{ ...paraStyle, paddingLeft: '23px' }}>
                3.3. Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi
              </p>
            </td>
             <td style={{ ...cellStyles.content, background: '#fff', marginLeft: '2px' }}>
              <p style={paraStyle}>
                Ada / tidak ada *) peluang.
              </p>
              <p style={{ ...paraStyle, paddingTop: '8px' }}>
                Jika ada, tuliskan .........................
              </p>
            </td>
          </tr>
        </tbody>
      
        <tbody>
          <tr style={{ height: '70pt' }}>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={{ ...paraStyle, paddingLeft: '23px' }}>
                3.4. Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat asesmen
              </p>
            </td>
            <td style={{ ...cellStyles.content, background: '#fff' }}>
              <p style={paraStyle}>
                Ada / tidak ada *) peluang.
              </p>
              <p style={{ ...paraStyle, paddingTop: '8px' }}>
                Jika ada, tuliskan .........................
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ padding: '0 0 0 14px', margin: 0, fontSize: '12px', textAlign: 'left' }}>
        *Coret yang tidak perlu
      </p>

      <p style={{ padding: '5px 0 0 0', margin: 0 }}><br /></p>
    </>
  )
}
