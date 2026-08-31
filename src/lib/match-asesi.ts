/**
 * Cari id_izin milik user yang login dari list_asesi.
 * Match by user_id dulu (akurat — nama bisa kembar), nama hanya fallback.
 */
export function matchAsesiIdIzin(
  list: any[] | null | undefined,
  user: { id?: number | string; name?: string } | null | undefined
): string | null {
  if (!Array.isArray(list) || list.length === 0) return null
  const byId = user?.id != null
    ? list.find(a => a.user_id != null && String(a.user_id) === String(user.id))
    : undefined
  if (byId?.id_izin) return byId.id_izin
  const byNama = user?.name
    ? list.find(a => a.nama === user.name)
    : undefined
  return byNama?.id_izin ?? null
}
