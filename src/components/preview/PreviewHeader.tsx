interface PreviewHeaderProps {
  title: string
  jabatan?: string
  skema?: string
  kualifikasi?: string
  onBack: () => void
}

export default function PreviewHeader({ title, jabatan, skema, kualifikasi, onBack }: PreviewHeaderProps) {
  return (
    <>
      {/* Back button */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #999',
            padding: '6px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            color: '#333',
            borderRadius: '4px',
          }}
        >
          &larr; Kembali
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
          {title}
        </h1>
        <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>*Preview — data tidak dapat diedit</p>
      </div>

      {/* Identity Table */}
      {(jabatan || skema || kualifikasi) && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            {jabatan && (
              <tr>
                <td style={{ width: '25%', border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#f9f9f9' }}>Skema Sertifikasi</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '8px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '8px', textTransform: 'uppercase' }}>{jabatan}</td>
              </tr>
            )}
            {skema && (
              <tr>
                <td style={{ width: '25%', border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#f9f9f9' }}>Nomor Skema</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '8px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '8px', textTransform: 'uppercase' }}>{skema}</td>
              </tr>
            )}
            {kualifikasi && (
              <tr>
                <td style={{ width: '25%', border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#f9f9f9' }}>Kualifikasi</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '8px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{kualifikasi}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  )
}
