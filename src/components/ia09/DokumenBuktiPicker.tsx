/**
 * Pemilih dokumen bukti APL-02 untuk satu baris pertanyaan FR.IA.09.
 *
 * Dipakai di dua tempat: halaman asesmen asesi (Ia09Page) dan editor revisi MUK
 * (Ia09Editor) — perilakunya harus identik, jadi komponennya disatukan di sini.
 *
 * File terpilih ditampilkan sebagai daftar di bawah tombol, bukan cuma dihitung
 * jumlahnya, supaya asesor langsung lihat bukti apa yang nempel di baris itu.
 */
import { useState } from 'react'

export interface Apl02FileOption {
  id: number
  name: string
  path: string
}

interface Props {
  files: Apl02FileOption[]
  selectedIds: number[]
  disabled?: boolean
  onToggle: (fileId: number) => void
}

export function DokumenBuktiPicker({ files, selectedIds, disabled = false, onToggle }: Props) {
  const [terbuka, setTerbuka] = useState(false)

  if (files.length === 0) {
    return <span style={{ fontSize: '11px', color: '#888' }}>Tidak ada file APL-02</span>
  }

  return (
    <div style={{ fontSize: '11px' }}>
      <div style={{ marginBottom: '4px' }}>Berdasarkan bukti :</div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setTerbuka((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          padding: '5px 8px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#0066cc',
          background: '#eef4fb',
          border: '1px solid #0066cc',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          textAlign: 'left',
        }}
      >
        <span>
          {selectedIds.length > 0 ? `${selectedIds.length} file dipilih` : 'Pilih dokumen bukti'}
        </span>
        <span style={{ fontSize: '9px' }}>{terbuka ? '▲' : '▼'}</span>
      </button>

      {terbuka && (
        <div
          style={{
            marginTop: '4px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        >
          {files.map((f) => {
            const dipilih = selectedIds.includes(f.id)
            return (
              <label
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  padding: '5px 8px',
                  borderBottom: '1px solid #eee',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  background: dipilih ? '#eef4fb' : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={dipilih}
                  disabled={disabled}
                  onChange={() => onToggle(f.id)}
                  style={{ marginTop: '2px', flexShrink: 0 }}
                />
                <span style={{ wordBreak: 'break-word', lineHeight: 1.3 }}>{f.name}</span>
              </label>
            )
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none' }}>
          {selectedIds.map((fid) => {
            const f = files.find((x) => x.id === fid)
            if (!f) return null
            return (
              <li key={fid} style={{ marginBottom: '2px' }}>
                <a
                  href={f.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0066cc', textDecoration: 'underline', wordBreak: 'break-word' }}
                >
                  {f.name}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
