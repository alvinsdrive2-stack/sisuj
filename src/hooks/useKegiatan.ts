import { useState, useEffect, useRef, useCallback } from "react"
import { kegiatanService, Kegiatan, KegiatanAsesor, KegiatanWithId, AsesiItem } from "@/lib/kegiatan-service"

export type { KegiatanAsesor, KegiatanWithId, AsesiItem }

export function useKegiatan() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKegiatan = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await kegiatanService.getAllKegiatan()
      setKegiatans(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch kegiatan")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKegiatan()
  }, [])

  return { kegiatans, isLoading, error, refetch: fetchKegiatan }
}

export function useTodayKegiatan() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchToday = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await kegiatanService.getTodayKegiatan()
        setKegiatans(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch today's kegiatan")
      } finally {
        setIsLoading(false)
      }
    }
    fetchToday()
  }, [])

  return { kegiatans, isLoading, error }
}

export function useUpcomingKegiatan() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to avoid closure/HMR issues
  const setKegiatansRef = useRef(setKegiatans)
  setKegiatansRef.current = setKegiatans

  useEffect(() => {
    const fetchUpcoming = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await kegiatanService.getUpcomingKegiatan()
        // Use ref to avoid HMR issues
        setKegiatansRef.current?.(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch upcoming kegiatan")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  return { kegiatans, isLoading, error }
}

export function useKegiatanAsesor(enabled = true) {
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const setKegiatanRef = useRef(setKegiatan)
  setKegiatanRef.current = setKegiatan

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    const fetchKegiatanAsesor = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await kegiatanService.getKegiatanAsesor()
        // API now returns array - take first item for backward compatibility
        const kegiatanArray = response.data
        setKegiatanRef.current?.(kegiatanArray?.[0] || null)
      } catch (err) {
        console.error('Error fetching kegiatan asesor:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan asesor")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanAsesor()
  }, [enabled])

  return { kegiatan, isLoading, error }
}

// New hook for getting all kegiatan asesor (full array)
export function useKegiatanAsesorList(enabled = true) {
  const [kegiatans, setKegiatans] = useState<KegiatanAsesor[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const setKegiatansRef = useRef(setKegiatans)
  setKegiatansRef.current = setKegiatans

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    const fetchKegiatanAsesor = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await kegiatanService.getKegiatanAsesor()
        setKegiatansRef.current?.(response.data || [])
      } catch (err) {
        console.error('Error fetching kegiatan asesor:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan asesor")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanAsesor()
  }, [enabled])

  return { kegiatans, isLoading, error }
}

export function useKegiatanAsesi(enabled = true) {
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const setKegiatanRef = useRef(setKegiatan)
  setKegiatanRef.current = setKegiatan

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    const fetchKegiatanAsesi = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await kegiatanService.getKegiatanAsesi()
        // API may return array or single object - handle both cases
        const kegiatanData = response.data
        // Check if data is an array
        if (Array.isArray(kegiatanData)) {
          setKegiatanRef.current?.(kegiatanData?.[0] || null)
        } else {
          // Single object case
          setKegiatanRef.current?.(kegiatanData || null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan asesi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanAsesi()
  }, [enabled])

  return { kegiatan, isLoading, error }
}

export function useKegiatanAdminTUK() {
  const [kegiatans, setKegiatans] = useState<KegiatanAsesor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setKegiatansRef = useRef(setKegiatans)
  setKegiatansRef.current = setKegiatans

  useEffect(() => {
    const fetchKegiatanAdminTUK = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const tanggalUji = `${year}-${month}-${day}`

        const response = await kegiatanService.getKegiatanAdminTUK(tanggalUji)
        setKegiatansRef.current?.(response.data.data)
      } catch (err) {
        console.error('Error fetching kegiatan admin TUK:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan admin TUK")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanAdminTUK()
  }, [])

  return { kegiatans, isLoading, error }
}

export function useKegiatanDirektur(ttd: boolean) {
  const [kegiatans, setKegiatans] = useState<KegiatanAsesor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setKegiatansRef = useRef(setKegiatans)
  setKegiatansRef.current = setKegiatans

  useEffect(() => {
    const fetchKegiatanDirektur = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await kegiatanService.getKegiatanDirektur(ttd)
        setKegiatansRef.current?.(response.data.data)
      } catch (err) {
        console.error('Error fetching kegiatan direktur:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan direktur")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanDirektur()
  }, [ttd])

  return { kegiatans, isLoading, error }
}

export function useListAsesi(jadwalId: string) {
  const [asesiList, setAsesiList] = useState<AsesiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setAsesiListRef = useRef(setAsesiList)
  setAsesiListRef.current = setAsesiList

  const fetchListAsesi = useCallback(async () => {
    if (!jadwalId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await kegiatanService.getListAsesi(jadwalId)
      setAsesiListRef.current?.(response.list_asesi)
    } catch (err) {
      console.error('Error fetching list asesi:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch list asesi")
    } finally {
      setIsLoading(false)
    }
  }, [jadwalId])

  useEffect(() => {
    fetchListAsesi()
  }, [fetchListAsesi])

  const refetch = useCallback(() => {
    fetchListAsesi()
  }, [fetchListAsesi])

  return { asesiList, isLoading, error, refetch }
}

export function useKegiatanKomtek(ttd: boolean) {
  const [kegiatans, setKegiatans] = useState<KegiatanAsesor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setKegiatansRef = useRef(setKegiatans)
  setKegiatansRef.current = setKegiatans

  useEffect(() => {
    const fetchKegiatanKomtek = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await kegiatanService.getKegiatanKomtek(ttd)
        setKegiatansRef.current?.(response.data.data)
      } catch (err) {
        console.error('Error fetching kegiatan komtek:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan komtek")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanKomtek()
  }, [ttd])

  return { kegiatans, isLoading, error }
}

// Absen data interface
export interface AbsenData {
  id_izin: string
  url_absen_asesi_awal: string | null
  url_absen_asesi_akhir: string | null
  url_absen_asesi_pra_awal: string | null
  url_absen_asesi_pra_akhir: string | null
  url_absen_asesor1_awal: string | null
  url_absen_asesor1_akhir: string | null
  url_absen_asesor2_awal: string | null
  url_absen_asesor2_akhir: string | null
  url_absen_asesor1_pra_awal: string | null
  url_absen_asesor1_pra_akhir: string | null
  url_absen_asesor2_pra_awal: string | null
  url_absen_asesor2_pra_akhir: string | null
}

// Hook to fetch absen data for multiple asesi
export function useAbsenData(asesiIds: string[], enabled = true) {
  const [absenData, setAbsenData] = useState<Record<string, AbsenData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || asesiIds.length === 0) {
      return
    }

    const fetchAbsenData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("access_token")
        const results: Record<string, AbsenData> = {}

        // Fetch absen data for each asesi in parallel
        await Promise.all(
          asesiIds.map(async (idIzin) => {
            try {
              const response = await fetch(`https://backend.devgatensi.site/api/dokumen/absen/${idIzin}`, {
                headers: {
                  "Accept": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              })

              if (response.ok) {
                const result = await response.json()
                if (result.message === "Success" && result.data) {
                  results[idIzin] = {
                    id_izin: idIzin,
                    ...result.data
                    
                  }
                }
              }
            } catch (err) {
              console.error(`Error fetching absen for ${idIzin}:`, err)
            }
          })
        )

        setAbsenData(results)
      } catch (err) {
        console.error('Error fetching absen data:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch absen data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAbsenData()
  }, [asesiIds.join(','), enabled])

  return { absenData, isLoading, error }
}

// Rekomendasi response interface
export interface RekomendasiData {
  komtek1?: { id: string; rekomendasi: string | null }
  komtek2?: { id: string; rekomendasi: string | null }
  komtek3?: { id: string; rekomendasi: string | null }
}

// Hook to fetch rekomendasi status for multiple id_izin
export function useRekomendasiStatus(kegiatans: KegiatanAsesor[], enabled = true) {
  const [rekomendasiStatus, setRekomendasiStatus] = useState<Record<string, { hasPending: boolean; pendingCount: number; completedCount: number }>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!enabled || kegiatans.length === 0) {
      return
    }

    const fetchRekomendasi = async () => {
      setIsLoading(true)
      const token = localStorage.getItem("access_token")
      const userData = localStorage.getItem("user_data")
      const currentUser = userData ? JSON.parse(userData) : null
      const currentUserId = currentUser?.id?.toString()

      if (!currentUserId) {
        setIsLoading(false)
        return
      }

      const results: Record<string, { hasPending: boolean; pendingCount: number; completedCount: number }> = {}

      // Process each kegiatan
      await Promise.all(
        kegiatans.map(async (kegiatan) => {
          try {
            // First get list asesi for this kegiatan
            const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            })

            if (!listAsesiResponse.ok) return

            const listAsesiData = await listAsesiResponse.json()
            const asesiList = listAsesiData.list_asesi || []

            let pendingCount = 0
            let completedCount = 0

            // Fetch rekomendasi for each asesi's id_izin
            await Promise.all(
              asesiList.map(async (asesi: AsesiItem) => {
                try {
                  const rekomendasiResponse = await fetch(`https://backend.devgatensi.site/api/komtek/rekomendasi/${asesi.id_izin}`, {
                    headers: {
                      "Accept": "application/json",
                      "Authorization": `Bearer ${token}`,
                    },
                  })

                  if (!rekomendasiResponse.ok) return

                  const rekomendasiData: RekomendasiData = await rekomendasiResponse.json()

                  // Check if current user's rekomendasi is pending or completed
                  const komtekKeys: (keyof RekomendasiData)[] = ['komtek1', 'komtek2', 'komtek3']
                  for (const key of komtekKeys) {
                    const komtek = rekomendasiData[key]
                    if (komtek && komtek.id === currentUserId) {
                      if (komtek.rekomendasi === null) {
                        pendingCount++
                      } else {
                        completedCount++
                      }
                      break
                    }
                  }
                } catch (err) {
                  console.error(`Error fetching rekomendasi for ${asesi.id_izin}:`, err)
                }
              })
            )

            results[kegiatan.jadwal_id] = {
              hasPending: pendingCount > 0,
              pendingCount,
              completedCount
            }
          } catch (err) {
            console.error(`Error processing kegiatan ${kegiatan.jadwal_id}:`, err)
          }
        })
      )

      setRekomendasiStatus(results)
      setIsLoading(false)
    }

    fetchRekomendasi()
  }, [kegiatans.map(k => k.jadwal_id).join(','), enabled])

  return { rekomendasiStatus, isLoading }
}

// Hook to fetch rekomendasi status for individual asesi items
export function useAsesiRekomendasiStatus(asesiList: AsesiItem[], enabled = true) {
  const [asesiRekomendasiStatus, setAsesiRekomendasiStatus] = useState<Record<string, { status: 'pending' | 'completed' | 'unknown' }>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!enabled || asesiList.length === 0) {
      return
    }

    const fetchRekomendasi = async () => {
      setIsLoading(true)
      const token = localStorage.getItem("access_token")
      const userData = localStorage.getItem("user_data")
      const currentUser = userData ? JSON.parse(userData) : null
      const currentUserId = currentUser?.id?.toString()

      if (!currentUserId) {
        setIsLoading(false)
        return
      }

      const results: Record<string, { status: 'pending' | 'completed' | 'unknown' }> = {}

      // Fetch rekomendasi for each asesi's id_izin
      await Promise.all(
        asesiList.map(async (asesi) => {
          try {
            const response = await fetch(`https://backend.devgatensi.site/api/komtek/rekomendasi/${asesi.id_izin}`, {
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            })

            if (!response.ok) {
              results[asesi.id_izin] = { status: 'unknown' }
              return
            }

            const rekomendasiData: RekomendasiData = await response.json()

            // Check if current user's rekomendasi is pending or completed
            const komtekKeys: (keyof RekomendasiData)[] = ['komtek1', 'komtek2', 'komtek3']
            let found = false
            for (const key of komtekKeys) {
              const komtek = rekomendasiData[key]
              if (komtek && komtek.id === currentUserId) {
                results[asesi.id_izin] = {
                  status: komtek.rekomendasi === null ? 'pending' : 'completed'
                }
                found = true
                break
              }
            }

            if (!found) {
              results[asesi.id_izin] = { status: 'unknown' }
            }
          } catch (err) {
            console.error(`Error fetching rekomendasi for ${asesi.id_izin}:`, err)
            results[asesi.id_izin] = { status: 'unknown' }
          }
        })
      )

      setAsesiRekomendasiStatus(results)
      setIsLoading(false)
    }

    fetchRekomendasi()
  }, [asesiList.map(a => a.id_izin).join(','), enabled])

  return { asesiRekomendasiStatus, isLoading }
}
