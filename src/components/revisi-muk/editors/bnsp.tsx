/**
 * Kit gaya BNSP untuk editor Revisi MUK — meniru 1:1 markup tabel dokumen
 * di halaman asesi (pra-asesmen & asesmen) agar admin merevisi dengan
 * tampilan yang sama seperti output dokumennya.
 *
 * ⚠️ DILARANG memanggil /qr/* atau useSigningState dari folder revisi-muk.
 * Tanda tangan di sini HANYA read-only (gambar barcode existing dari
 * `data.barcodes` pada response GET dokumen — tanpa tombol generate).
 */
import type { CSSProperties, ReactNode } from 'react'
import { CustomCheckbox } from '@/components/ui/Checkbox'

// ── Style dasar (identik dgn halaman asesi) ─────────────────────────────

/** Tabel dokumen BNSP: border 2px hitam, font 13, putih. */
export const bnspTable: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '15px',
  fontSize: '13px',
  background: '#fff',
  border: '2px solid #000',
}

/** Sel standar dokumen (border 1px, padding 6). */
export const bnspTd: CSSProperties = { border: '1px solid #000', padding: '6px' }

/** Baris header merah dokumen (bg #d10000, putih, bold, center). */
export const bnspHdRow: CSSProperties = {
  background: '#d10000',
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
}

/** Sel header merah. */
export const bnspTh: CSSProperties = { ...bnspTd, ...bnspHdRow }

/** Textarea gaya asesi di dalam sel dokumen. */
export const bnspTextarea: CSSProperties = {
  width: '100%',
  height: '80px',
  border: '1px solid #ccc',
  padding: '6px',
  fontSize: '13px',
  resize: 'none' as const,
}

/** Judul dokumen di atas tabel. */
export function DocTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px', letterSpacing: '1px' }}>
        {children}
      </h1>
    </div>
  )
}

// ── Identitas dokumen ────────────────────────────────────────────────────

export interface DokumenHeaderData {
  jabatanKerja: string
  nomorSkema: string
  tuk: string
  namaAsesi: string
  asesorList: { id: number; nama: string; noreg: string }[]
  tanggalUji: string
  tanggalSelesai: string | null
  metode?: string
  namaPenyusun?: string | null
  namaValidator?: string | null
  noregPenyusun?: string | null
  noregValidator?: string | null
  tanggalPenyusun?: string | null
  tanggalValidator?: string | null
  barcodePenyusun?: string | null
  barcodeValidator?: string | null
  /** Jenjang skema (angka) — APL02 pakai utk tampilkan opsi Portofolio. */
  jenjang?: string
}

export function fmtTanggalId(v?: string | null): string {
  if (!v) return ''
  return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Tabel identitas dokumen (Skema Sertifikasi / TUK / Asesor / Asesi / Tanggal)
 * — markup identik dgn tabel IDENTITAS di halaman asesi (mis. Ia01Page).
 * `extraRows` utk dokumen yang butuh baris tambahan di bawah tanggal.
 */
export function IdentitasTable({
  header,
  extraRows,
}: {
  header: DokumenHeaderData
  extraRows?: ReactNode
}) {
  const asesorList = header.asesorList ?? []
  return (
    <table style={bnspTable}>
      <tbody>
        <tr>
          <td rowSpan={2} style={{ ...bnspTd, width: '30%' }}>
            Skema Sertifikasi (<del>KKNI</del>/Okupasi/<del>Klaster</del>)
          </td>
          <td style={{ ...bnspTd, width: '12%' }}>Judul</td>
          <td style={{ ...bnspTd, width: '3%', textAlign: 'end' }}>:</td>
          <td style={{ ...bnspTd, textTransform: 'uppercase' }}>{header.jabatanKerja || '-'}</td>
        </tr>
        <tr>
          <td style={bnspTd}>Nomor</td>
          <td style={{ ...bnspTd, textAlign: 'end' }}>:</td>
          <td style={{ ...bnspTd, textTransform: 'uppercase' }}>{header.nomorSkema || '-'}</td>
        </tr>
        <tr>
          <td style={bnspTd}>TUK</td>
          <td style={{ ...bnspTd, textAlign: 'end' }}>:</td>
          <td colSpan={2} style={{ ...bnspTd, textTransform: 'uppercase' }}>{header.tuk || '-'}</td>
        </tr>
        {asesorList.length > 1 ? (
          asesorList.map((asesor, idx) => (
            <tr key={asesor.id}>
              <td style={bnspTd}>Nama Asesor {idx + 1}</td>
              <td style={{ ...bnspTd, textAlign: 'end' }}>:</td>
              <td colSpan={2} style={bnspTd}>
                {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td style={bnspTd}>Nama Asesor</td>
            <td style={{ ...bnspTd, textAlign: 'end' }}>:</td>
            <td colSpan={2} style={bnspTd}>
              {asesorList[0]?.nama?.toUpperCase() || ''}
              {asesorList[0]?.noreg && ` (${asesorList[0].noreg})`}
            </td>
          </tr>
        )}
        <tr>
          <td style={bnspTd}>Nama Asesi</td>
          <td style={{ ...bnspTd, textAlign: 'end' }}>:</td>
          <td colSpan={2} style={{ ...bnspTd, textTransform: 'uppercase' }}>
            {header.namaAsesi?.toUpperCase() || '-'}
          </td>
        </tr>
        <tr>
          <td rowSpan={2} style={bnspTd}>Tanggal Asesmen</td>
          <td style={{ ...bnspTd, textAlign: 'right' }}>Mulai :</td>
          <td colSpan={2} style={bnspTd}>{fmtTanggalId(header.tanggalUji) || '-'}</td>
        </tr>
        <tr>
          <td style={{ ...bnspTd, textAlign: 'right' }}>Selesai :</td>
          <td colSpan={2} style={bnspTd}>{fmtTanggalId(header.tanggalSelesai ?? header.tanggalUji) || '-'}</td>
        </tr>
        {extraRows}
      </tbody>
    </table>
  )
}

// ── Tanda tangan read-only ───────────────────────────────────────────────

/** Satu entri barcode dari response GET dokumen: data.barcodes.{asesi|asesor1|asesor2}. */
export interface TtdBarcode {
  url: string
  tanggal: string
  nama: string
}

export type Barcodes = {
  asesi?: TtdBarcode | null
  asesor1?: TtdBarcode | null
  asesor2?: TtdBarcode | null
}

/** Isi sel ttd read-only: gambar barcode existing + nama + tanggal (atau kosong). */
export function TtdCell({ barcode }: { barcode?: TtdBarcode | null }) {
  if (!barcode?.url) return null
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={barcode.url} alt={`TTD ${barcode.nama || ''}`} width={80} height={80} style={{ maxWidth: '100%' }} />
      <br />
      <span style={{ fontSize: '11px' }}>
        {barcode.nama || ''}
        {barcode.tanggal ? ` — ${fmtTanggalId(barcode.tanggal)}` : ''}
      </span>
    </div>
  )
}

/** Checkbox centang gaya dokumen (CustomCheckbox komponen yang sama dipakai asesi). */
export function Check({
  checked,
  onChange,
  disabled,
  style,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  style?: CSSProperties
}) {
  return (
    <CustomCheckbox
      checked={checked}
      onChange={() => onChange()}
      disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    />
  )
}
