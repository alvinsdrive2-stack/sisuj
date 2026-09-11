/**
 * Deteksi tipe file dari URL dokumen asesi.
 *
 * URL dokumen di sistem ada 2 bentuk:
 *  1. File statis (moon/storage) — ekstensi di path, mis. .../FR-APL-01-123.pdf
 *  2. Endpoint render dinamis — TANPA ekstensi, mis. .../pdf_muk/praasesmen/apl01/I-2026...
 *     (PDF dirender on-the-fly oleh PdfMukController setiap URL dibuka)
 *
 * Deteksi berbasis ekstensi mentah (`url.split('.').pop()`) salah mengklasifikasikan
 * bentuk (2) sebagai gambar — titik terakhir ada di hostname (lspgatensi.id), bukan
 * ekstensi — sehingga preview di-render sebagai <img> dan tampak blank. Ekstensi
 * wajib diambil dari path bersih query/fragment, dan URL tanpa ekstensi dianggap PDF.
 */
export const getDocFileType = (url: string | null | undefined): string => {
  if (!url) return 'unknown'

  // Endpoint render dinamis selalu mengembalikan PDF
  if (url.includes('/pdf_muk/') || url.includes('/view-muk/')) return 'pdf'

  const path = url.split(/[?#]/)[0]
  const lastSegment = path.split('/').pop() || ''
  if (!lastSegment.includes('.')) return 'pdf'

  return lastSegment.split('.').pop()?.toLowerCase() || 'pdf'
}
