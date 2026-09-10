/**
 * Registry dokumen MUK untuk fitur Revisi MUK (admin LSP).
 *
 * ⚠️ LARANGAN KERAS: kode di folder pages/admin-lsp/revisi-muk & components/revisi-muk
 * TIDAK BOLEH memanggil endpoint `/qr/*` atau memakai useSigningState/generateQR —
 * memanggilnya dengan token admin akan mencetak barcode ttd `id_role=2` palsu.
 * Revisi jawaban HANYA lewat endpoint GET/submit dokumen yang sama dengan flow asesi,
 * TANPA varian `?version=kan` (halaman asesi/KAN lama tidak pernah memakainya —
 * editor wajib menulis ke tabel yang sama persis dengan flow asesi).
 */

export type MukTahap = 'praasesmen' | 'asesmen'

/** edit = ada editor jawaban; readonly-pdf = hanya lihat PDF /pdf_muk; readonly-file = lihat file (K3). */
export type MukDocMode = 'edit' | 'readonly-pdf' | 'readonly-file'

export interface MukDocConfig {
  /** Key URL: /admin-lsp/revisi-muk/:idIzin/:key */
  key: string
  /** Label tampilan — mengikuti label breadcrumb asesi (asesmen-steps.ts). */
  label: string
  tahap: MukTahap
  mode: MukDocMode
  /** Token dokumen di MukPdfService::DOCS untuk panel PDF; undefined = tidak ada PDF /pdf_muk. */
  pdfDoc?: string
  /** Token PDF varian KAN untuk asesi is_paket (tab sekunder — data KAN lama tersimpan di jalur normal). */
  pdfDocKan?: string
  /** True bila dokumen punya varian KAN → badge "Varian KAN" pada asesi is_paket. */
  kanCapable?: boolean
}

/** Urutan = urutan flow: pra-asesmen (APL→MAPA→AK.07→AK.04→K3) lalu asesmen (sesuai asesmen-steps.ts). */
export const REVISI_MUK_DOCS: MukDocConfig[] = [
  // ── Pra-Asesmen ──
  { key: 'apl01', label: 'APL 01', tahap: 'praasesmen', mode: 'edit', pdfDoc: 'apl01' },
  { key: 'apl02', label: 'APL 02', tahap: 'praasesmen', mode: 'edit', pdfDoc: 'apl02' },
  { key: 'mapa01', label: 'MAPA 01', tahap: 'praasesmen', mode: 'readonly-pdf', pdfDoc: 'mapa01' },
  { key: 'mapa02', label: 'MAPA 02', tahap: 'praasesmen', mode: 'readonly-pdf', pdfDoc: 'mapa02' },
  { key: 'ak07', label: 'AK.07', tahap: 'praasesmen', mode: 'edit', pdfDoc: 'ak07' },
  { key: 'ak04', label: 'AK.04', tahap: 'praasesmen', mode: 'edit', pdfDoc: 'ak04' },
  { key: 'k3', label: 'Tata Tertib dan K3', tahap: 'praasesmen', mode: 'readonly-file' },
  // ── Asesmen ──
  { key: 'ak01', label: 'AK.01', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ak01' },
  { key: 'ia01', label: 'IA.01', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia01' },
  { key: 'ia02', label: 'IA.02', tahap: 'asesmen', mode: 'readonly-pdf', pdfDoc: 'ia02' },
  { key: 'ia03', label: 'IA.03', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia03' },
  { key: 'ia04a', label: 'IA.04.A', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia04a' },
  { key: 'ia04b', label: 'IA.04.B', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia04b', pdfDocKan: 'kan-ia04b', kanCapable: true },
  { key: 'ia05', label: 'IA.05', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia05', pdfDocKan: 'kan-ia05', kanCapable: true },
  { key: 'ia06', label: 'IA.06', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia06', pdfDocKan: 'kan-ia06', kanCapable: true },
  { key: 'ia08', label: 'IA.08', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia08' },
  { key: 'ia09', label: 'IA.09', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia09' },
  { key: 'ia10', label: 'IA.10', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ia10' },
  { key: 'ak02', label: 'AK.02', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ak02', pdfDocKan: 'kan-ak02', kanCapable: true },
  { key: 'ak03', label: 'AK.03', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ak03' },
  { key: 'ak05', label: 'AK.05', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ak05' },
  { key: 'ak06', label: 'AK.06', tahap: 'asesmen', mode: 'edit', pdfDoc: 'ak06' },
]

export function getMukDoc(key: string | undefined): MukDocConfig | undefined {
  return REVISI_MUK_DOCS.find(d => d.key === key)
}
