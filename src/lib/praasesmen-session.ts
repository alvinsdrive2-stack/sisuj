/**
 * Sumber tunggal penentuan id_izin untuk halaman pra-asesmen (APL01/APL02/dll).
 *
 * Latar belakang bug: dulu halaman memakai `idIzinFromUrl` begitu flag
 * `isUuidFlow` ada di sessionStorage. Flag itu TIDAK dibersihkan saat login,
 * sedangkan token di localStorage dipakai bersama antar-tab. Akibatnya asesi A
 * bisa membuka/menandatangani dokumen milik asesi B, dan barcode ttd tercatat
 * atas `auth()->user()->id` milik A.
 *
 * Aturan sekarang:
 * 1. Sesi UUID (asesi tanpa login / link `wa_uuid`) → pakai id_izin hasil
 *    resolve server yang disimpan di sessionStorage, BUKAN dari URL.
 * 2. Login asesi nyata → selalu `user.id_izin`. URL diabaikan sepenuhnya.
 * 3. Sesi UUID yang tersisa milik izin lain sementara user sudah login dengan
 *    izin berbeda → dibuang (self-heal), pakai id_izin milik user.
 * 4. Asesor → tetap memakai id_izin dari URL (membuka dokumen asesi binaannya).
 */

const UUID_FLAG_KEY = "isUuidFlow"
const UUID_DATA_KEY = "praasesmen_uuid_data"

export type PraAsesmenUuidSession = {
  id_izin?: string | null
  jadwal_id?: string | number | null
  jenis_kelas_id?: string | number | null
}

type MinimalUser = {
  id?: number | string | null
  id_izin?: string | null
} | null

/** Baca sesi UUID pra-asesmen dari sessionStorage (null jika tidak ada/rusak). */
export function getUuidSession(): PraAsesmenUuidSession | null {
  if (typeof sessionStorage === "undefined") return null
  const raw = sessionStorage.getItem(UUID_DATA_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PraAsesmenUuidSession
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

/** Hapus seluruh jejak sesi UUID (flag + data). */
export function clearUuidSession(): void {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.removeItem(UUID_FLAG_KEY)
  sessionStorage.removeItem(UUID_DATA_KEY)
}

export function hasUuidSession(): boolean {
  if (typeof sessionStorage === "undefined") return false
  return !!sessionStorage.getItem(UUID_FLAG_KEY) || getUuidSession() !== null
}

type ResolveArgs = {
  idIzinFromUrl?: string | null
  user?: MinimalUser
  isAsesor?: boolean
}

export type ResolvedIzin = {
  idIzin?: string
  isUuidSession: boolean
}

export function resolvePraasesmenIzin({ idIzinFromUrl, user, isAsesor }: ResolveArgs): ResolvedIzin {
  const uuid = hasUuidSession() ? getUuidSession() : null
  const uuidIzin = uuid?.id_izin || undefined
  const userId = Number(user?.id ?? 0)
  const userIzin = user?.id_izin || undefined
  // Login nyata = punya user id (>0) dan punya id_izin dari /auth/me.
  const hasRealLogin = userId > 0 && !!userIzin

  // Sesi UUID basi: user sudah login dengan izin lain.
  if (hasRealLogin && uuidIzin && uuidIzin !== userIzin) {
    clearUuidSession()
    return { idIzin: userIzin, isUuidSession: false }
  }

  if (uuid) {
    // Flow UUID: id_izin hasil resolve server, jangan percaya URL mentah.
    return { idIzin: uuidIzin || idIzinFromUrl || undefined, isUuidSession: true }
  }

  if (isAsesor) {
    return { idIzin: idIzinFromUrl || undefined, isUuidSession: false }
  }

  // Asesi login normal: kunci ke izin miliknya sendiri, abaikan URL.
  return { idIzin: userIzin, isUuidSession: false }
}
