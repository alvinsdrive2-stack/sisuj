/**
 * Mapa01TandaTangan.tsx
 * Tanda Tangan & Konfirmasi section - 1:1 dengan HTML Word
 */

export function Mapa01TandaTangan() {
  return (
    <>
      {/* Title */}
      <h1 style={{
        paddingLeft: '13pt',
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
      <table style={{
        borderCollapse: 'collapse',
        marginLeft: '6.67pt'
      }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '23pt' }}>
            <td style={{
              width: '220pt',
              borderTop: '2pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px' }}>
                Orang yang relevan
              </span>
            </td>
            <td style={{
              width: '113pt',
              borderTop: '2pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                Nama
              </span>
            </td>
            <td style={{
              width: '178pt',
              borderTop: '2pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px', textAlign: 'left' }}>
                Tandatangan
              </span>
            </td>
          </tr>

          <tr style={{ height: '54pt' }}>
            <td style={{
              width: '220pt',
              borderTop: '1pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '11px 40px 11px 20px',
              background: '#fff'
            }}>
              <CheckboxListItem text="Manajer sertifikasi." />
            </td>
            <td style={{
              width: '113pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '178pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
          </tr>

          <tr style={{ height: '53pt' }}>
            <td style={{
              width: '220pt',
              borderTop: '1pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 40px 6px 20px',
              lineHeight: '12px',
              background: '#fff'
            }}>
              <CheckboxListItem text=" Master Assessor / Master Trainer / Asesor Utama kompetensi" />
            </td>
            <td style={{
              width: '113pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '178pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
          </tr>

          <tr style={{ height: '53pt' }}>
            <td style={{
              width: '220pt',
              borderTop: '1pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 40px 6px 20px',
              lineHeight: '12px',
              background: '#fff'
            }}>

              <CheckboxListItem text="Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar" />
            </td>
            <td style={{
              width: '113pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '178pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
          </tr>

          <tr style={{ height: '46pt' }}>
            <td style={{
              width: '220pt',
              borderTop: '1pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '1pt solid #000',
              padding: '7px 40px 7px 20px',
              background: '#fff'
            }}>
              <CheckboxListItem text="Lainnya:" />
            </td>
            <td style={{
              width: '113pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '1pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '178pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '2pt solid #000',
              padding: '12px 0 0 0',
              background: '#fff'
            }}></td>
          </tr>
        </tbody>
      </table>

      <p style={{ paddingTop: '3px', margin: 0 }}><br /></p>

      {/* Tanda Tangan Table */}
      <table style={{
        borderCollapse: 'collapse',
        marginLeft: '6.67pt'
      }} cellSpacing="0">
        <tbody>
          <tr style={{ height: '28pt' }}>
            <td style={{
              width: '84pt',
              borderTop: '2pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 0 0 0',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px' }}>
                Status
              </span>
            </td>
            <td style={{
              width: '29pt',
              borderTop: '2pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 1px 6px 1px 0 0',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                No
              </span>
            </td>
            <td style={{
              width: '186pt',
              borderTop: '2pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 1px 6px 1px 0 0',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                Nama
              </span>
            </td>
            <td style={{
              width: '107pt',
              borderTop: '2pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 20px 6px 6px 20px 0 0',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px', textAlign: 'left' }}>
                Nomor MET
              </span>
            </td>
            <td style={{
              width: '106pt',
              borderTop: '2pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '6px 17px 10px -5px',
              lineHeight: '14px',
              backgroundColor: '#C00000'
            }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '12px' }}>
                Tanda Tangan dan Tanggal
              </span>
            </td>
          </tr>

          {/* Penyusun */}
          <tr style={{ height: '91pt' }}>
            <td style={{
              width: '84pt',
              borderTop: '1pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              background: '#fff'
            }} rowSpan={2}>
              <div style={{ padding: '15px 0 0 0' }}></div>
              <span style={{ fontSize: '12px', color: 'black', paddingLeft: '15px' }}>
                Penyusun
              </span>
            </td>
            <td style={{
              width: '29pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 1px 6px 1px 0 0',
              background: '#fff'
            }}>
              <span style={{ fontSize: '12px', color: 'black', textAlign: 'center' }}>1</span>
            </td>
            <td style={{
              width: '186pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '7px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '107pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '13px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '106pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '16px 20px 16px 20px 0 0',
              background: '#fff'
            }}></td>
          </tr>

          <tr style={{ height: '23pt' }}>
            <td style={{
              width: '29pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '186pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '107pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '106pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '18px 20px 18px 20px 0 0',
              background: '#fff'
            }}></td>
          </tr>

          {/* Validator */}
          <tr style={{ height: '68pt' }}>
            <td style={{
              width: '84pt',
              borderTop: '1pt solid #000',
              borderLeft: '2pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '1pt solid #000',
              background: '#fff'
            }} rowSpan={2}>
              <div style={{ padding: '18px 0 0 0' }}></div>
              <span style={{ fontSize: '12px', color: 'black', paddingLeft: '18px' }}>
                Validator
              </span>
            </td>
            <td style={{
              width: '29pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '6px 1px 6px 1px 0 0',
              background: '#fff'
            }}>
              <span style={{ fontSize: '12px', color: 'black', textAlign: 'center' }}>1</span>
            </td>
            <td style={{
              width: '186pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '7px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '107pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '1pt solid #000',
              padding: '13px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '106pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '1pt solid #000',
              borderRight: '2pt solid #000',
              padding: '16px 20px 16px 20px 0 0',
              background: '#fff'
            }}></td>
          </tr>

          <tr style={{ height: '23pt' }}>
            <td style={{
              width: '29pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '1pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '186pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '1pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '107pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '1pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
            <td style={{
              width: '106pt',
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderBottom: '2pt solid #000',
              borderRight: '2pt solid #000',
              padding: '1px 0 0 0',
              background: '#fff'
            }}></td>
          </tr>
        </tbody>
      </table>
      <br></br>
    </>
  )
}

function CheckboxListItem({ text }: { text: string }) {
  return (
    <div style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      lineHeight: '150%'
    }}>
      <span style={{
        color: 'black',
        fontFamily: '"Segoe UI Symbol", sans-serif',
        fontSize: '16px',
        verticalAlign: '0px',
        marginRight: '4px'
      }}>
        ☐
      </span>
      <span style={{ fontSize: '12px', color: 'black' }}>
        {text}
      </span>
    </div>
  )
}
