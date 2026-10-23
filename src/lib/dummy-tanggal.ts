/**
 * =============================================================================
 *  TANGGAL REKAYASA — cabang `dummy`
 * =============================================================================
 *
 * HANYA untuk web dummy. JANGAN merge ke main.
 *
 * Aturan (sama dengan backend App\Support\DummyTanggal):
 *   • Barcode / dokumen asesmen (IA, AK, MAPA, APL) -> tanggal = tanggal_uji jadwal
 *   • Surat (SPT asesor, SPT komtek, SK, BA, surat TUK) -> tanggal = tanggal_uji − 1 hari
 *   • JAM selalu jam aktual (tidak direkayasa)
 *
 * Kenapa modul global (bukan props):
 * Ada 27 halaman asesmen yang memanggil useSigningState dan tidak semuanya
 * meneruskan tanggal uji. Daripada mengubah 27 file, halaman/ hook data
 * men-set tanggal uji aktif sekali lewat setTanggalUjiAktif(), lalu komponen
 * mana pun bisa membacanya tanpa prop drilling.
 */

let tanggalUjiAktif: string | null = null

/** Simpan tanggal uji jadwal yang sedang dibuka. Panggil dari hook data dokumen. */
export function setTanggalUjiAktif(tanggalUji?: string | null): void {
  const bersih = String(tanggalUji ?? '').trim()
  tanggalUjiAktif = bersih === '' ? null : bersih
}

/** Tanggal uji yang sedang aktif (ISO string) atau null bila belum diketahui. */
export function getTanggalUjiAktif(): string | null {
  return tanggalUjiAktif
}

/**
 * Bangun ISO string bertanggal $tanggal dengan JAM dari $jamAcuan (default: sekarang).
 * Mengembalikan jam aktual apa adanya bila tanggal tidak valid.
 */
function gabung(tanggal: string | null, offsetHari: number, jamAcuan: Date): string {
  if (!tanggal) return jamAcuan.toISOString()

  // Backend mengirim "YYYY-MM-DD HH:mm:ss" (spasi, bukan 'T'). Safari/beberapa
  // engine menolak format itu → normalisasi dulu.
  const dinormalisasi = tanggal.includes('T') ? tanggal : tanggal.replace(' ', 'T')

  const dasar = new Date(dinormalisasi)
  if (Number.isNaN(dasar.getTime())) return jamAcuan.toISOString()

  const hasil = new Date(dasar.getTime())
  hasil.setDate(hasil.getDate() + offsetHari)
  // Jam tetap jam aktual (WIB dipertahankan oleh Date lokal browser).
  hasil.setHours(
    jamAcuan.getHours(),
    jamAcuan.getMinutes(),
    jamAcuan.getSeconds(),
    jamAcuan.getMilliseconds()
  )

  return hasil.toISOString()
}

/** ISO timestamp untuk BARCODE & dokumen asesmen: tanggal uji, jam aktual. */
export function tanggalUjiSekarang(jamAcuan: Date = new Date()): string {
  return gabung(tanggalUjiAktif, 0, jamAcuan)
}

/** ISO timestamp untuk SURAT (SPT/SK/BA): H-1 tanggal uji, jam aktual. */
export function tanggalSuratSekarang(jamAcuan: Date = new Date()): string {
  return gabung(tanggalUjiAktif, -1, jamAcuan)
}

/**
 * Format tanggal Indonesia (dd Bulan yyyy) dari ISO string, mengikuti tanggal uji.
 * Dipakai di tempat yang dulu menampilkan `new Date()` mentah.
 */
export function formatTanggalUji(
  opsi: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
): string {
  const tanggal = tanggalUjiAktif ? new Date(tanggalUjiAktif) : new Date()
  return tanggal.toLocaleDateString('id-ID', opsi)
}
