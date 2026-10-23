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
 * JAM VIRTUAL — dipakai untuk gating & countdown, bukan untuk stempel barcode.
 *
 * Mengembalikan tanggal_uji jadwal apa adanya (tanggal + jam uji). Efeknya:
 * selisih terhadap tanggal_uji = 0, sehingga aplikasi menganggap "sekarang"
 * tepat pada waktu uji jadwal — bukan tanggal aktual server/browser.
 *
 * Kalau tanggal uji belum diketahui (mis. halaman daftar tanpa konteks jadwal),
 * kembalikan jam sebenarnya.
 */
export function dummyNow(): Date {
  if (!tanggalUjiAktif) return new Date()

  const dinormalisasi = tanggalUjiAktif.includes('T')
    ? tanggalUjiAktif
    : tanggalUjiAktif.replace(' ', 'T')

  const d = new Date(dinormalisasi)

  return Number.isNaN(d.getTime()) ? new Date() : d
}

/** dummyNow() dalam milidetik — pengganti Date.now() untuk countdown. */
export function dummyNowMs(): number {
  return dummyNow().getTime()
}

/** Tanggal (YYYY-MM-DD) menurut jam virtual — pengganti "hari ini". */
export function dummyTodayISO(): string {
  const d = dummyNow()
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
