/**
 * Dropdown pemilih satu dokumen bukti APL-02 untuk satu baris pertanyaan FR.IA.09.
 * Dipakai di halaman asesmen asesi (Ia09Page) dan editor revisi MUK (Ia09Editor) —
 * perilakunya harus identik, jadi komponennya disatukan di sini.
 */
export interface Apl02FileOption {
  id: number
  name: string
  path: string
}

interface Props {
  files: Apl02FileOption[]
  value: number | null
  disabled?: boolean
  onChange: (fileId: number | null) => void
}

export function DokumenBuktiSelect({ files, value, disabled = false, onChange }: Props) {
  if (files.length === 0) {
    return <span style={{ color: '#888' }}>Tidak ada file APL-02</span>
  }
  return (
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      style={{
        border: '1px solid #999',
        borderRadius: '3px',
        padding: '2px 4px',
        background: '#fff',
        font: 'inherit',
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        maxWidth: '100%',
      }}
    >
      <option value="">Pilih disini</option>
      {files.map((f) => (
        <option key={f.id} value={f.id}>{f.name}</option>
      ))}
    </select>
  )
}
