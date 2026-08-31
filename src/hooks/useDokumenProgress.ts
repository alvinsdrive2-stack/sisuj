import { useCallback, useEffect, useRef, useState } from "react"
import { API_BASE_URL } from "@/config/api"

/** key dokumen → url PDF (ada = dokumen sudah di-generate & ditandatangani) */
export type AsesiProgress = Record<string, string>

export const PROGRESS_DOK_KEYS = [
  'apl01', 'apl02', 'mapa01', 'mapa02', 'ak07', 'ak04', 'ak01',
  'ia01', 'ia02', 'ia03', 'ia04a', 'ia04b', 'ia05', 'ia08', 'ia09', 'ia10',
  'ak02', 'ak03', 'ak05', 'ak06',
] as const

export function countFilledDokumen(progress: AsesiProgress | undefined): number {
  if (!progress) return 0
  return PROGRESS_DOK_KEYS.filter(k => !!progress[k]).length
}

/**
 * Progress dokumen per asesi (server-authoritative dari bukti_asesmens).
 * Refetch satu row via refetchOne saat broadcast realtime menyebut id_izin.
 */
export function useDokumenProgress(asesiIds: string[], enabled: boolean) {
  const [progressMap, setProgressMap] = useState<Record<string, AsesiProgress>>({})
  const idsKey = asesiIds.join(',')
  const idsRef = useRef(asesiIds)
  idsRef.current = asesiIds

  const fetchOne = useCallback(async (idIzin: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/dokumen/asesi/${idIzin}`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      })
      if (!response.ok) return
      const result = await response.json()
      if (result?.data) {
        setProgressMap(prev => ({ ...prev, [idIzin]: result.data }))
      }
    } catch {
      // biarkan nilai lama
    }
  }, [])

  const refetch = useCallback(async () => {
    await Promise.all(idsRef.current.map(id => fetchOne(id)))
  }, [fetchOne])

  const refetchOne = useCallback(async (idIzin: string) => {
    await fetchOne(idIzin)
  }, [fetchOne])

  useEffect(() => {
    if (!enabled || !idsKey) return
    refetch()
  }, [enabled, idsKey, refetch])

  return { progressMap, refetch, refetchOne }
}
