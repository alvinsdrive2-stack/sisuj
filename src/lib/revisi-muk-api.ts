/**
 * Helper API untuk fitur Revisi MUK. Semua fetch wajib lewat sini (apiFetchJson —
 * Bearer otomatis + auto-logout 401). DILARANG memanggil endpoint /qr/* dari fitur
 * revisi (lihat komentar larangan di revisi-muk-config.ts).
 */
import { API_BASE_URL } from '@/config/api'
import { apiFetchJson } from '@/lib/api-fetch'
import type { MukTahap } from '@/lib/revisi-muk-config'

/** Host PDF publik: API_BASE_URL berakhiran /api, sedangkan /pdf_muk ada di root host. */
export function pdfMukBase(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '')
}

/**
 * URL PDF dinamis MUK — dirender on-the-fly dari DB, jadi selalu berisi jawaban terbaru.
 * idIzin di-encode per segmen path.
 */
export function buildMukPdfUrl(tahap: MukTahap, doc: string, idIzin: string): string {
  return `${pdfMukBase()}/pdf_muk/${tahap}/${doc}/${encodeURIComponent(idIzin)}`
}

export function praUrl(idIzin: string, doc: string): string {
  return `${API_BASE_URL}/praasesmen/${encodeURIComponent(idIzin)}/${doc}`
}

/**
 * URL hapus file APL-02 — TIDAK memakai id_izin (endpoint global per fileId).
 * Hapus = lepas dari semua unit + hapus file di FTP + hapus baris apl2_files.
 */
export function apl02FileDeleteUrl(fileId: number): string {
  return `${API_BASE_URL}/praasesmen/apl02/files/${fileId}`
}

export function asesmenUrl(idIzin: string, doc: string): string {
  return `${API_BASE_URL}/asesmen/${encodeURIComponent(idIzin)}/${doc}`
}

export function getJson<T>(url: string): Promise<T> {
  return apiFetchJson<T>(url)
}

export function postJson<T>(url: string, body: unknown): Promise<T> {
  return apiFetchJson<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function deleteJson<T = unknown>(url: string): Promise<T> {
  return apiFetchJson<T>(url, { method: 'DELETE' })
}

/**
 * POST multipart (unggah file). JANGAN set Content-Type manual — browser yang
 * menulis boundary-nya. Dipakai editor APL-02 revisi untuk unggah file bukti.
 */
export function uploadForm<T = unknown>(url: string, form: FormData): Promise<T> {
  return apiFetchJson<T>(url, { method: 'POST', body: form })
}
