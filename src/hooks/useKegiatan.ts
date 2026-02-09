import { useState, useEffect, useRef } from "react"
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

export function useKegiatanAsesor() {
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setKegiatanRef = useRef(setKegiatan)
  setKegiatanRef.current = setKegiatan

  useEffect(() => {
    const fetchKegiatanAsesor = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await kegiatanService.getKegiatanAsesor()
        console.log('Kegiatan Asesor Response:', response)
        console.log('Kegiatan Data:', response.data)
        setKegiatanRef.current?.(response.data)
      } catch (err) {
        console.error('Error fetching kegiatan asesor:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan asesor")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanAsesor()
  }, [])

  return { kegiatan, isLoading, error }
}

export function useKegiatanAsesi() {
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setKegiatanRef = useRef(setKegiatan)
  setKegiatanRef.current = setKegiatan

  useEffect(() => {
    const fetchKegiatanAsesi = async () => {
      setIsLoading(true)
      setError(null)

      // Skip fetching for asesor role (they access via different flow)
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          // Check if user is asesor by decoding JWT
          const payload = JSON.parse(atob(token.split('.')[1]))
          const role = payload?.role?.name?.toLowerCase?.() || ''

          if (role === 'asesor') {
            setIsLoading(false)
            return
          }
        } catch (e) {
          // If token parsing fails, continue with fetch
        }
      }

      try {
        const response = await kegiatanService.getKegiatanAsesi()
        setKegiatanRef.current?.(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch kegiatan asesi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchKegiatanAsesi()
  }, [])

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
        console.log('Kegiatan Admin TUK Response:', response)
        console.log('Kegiatan Admin TUK Data:', response.data.data)
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
        console.log(`Kegiatan Direktur Response (ttd=${ttd}):`, response)
        console.log(`Kegiatan Direktur Data (ttd=${ttd}):`, response.data.data)
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

  useEffect(() => {
    const fetchListAsesi = async () => {
      if (!jadwalId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const response = await kegiatanService.getListAsesi(jadwalId)
        console.log('List Asesi Response:', response)
        setAsesiListRef.current?.(response.list_asesi)
      } catch (err) {
        console.error('Error fetching list asesi:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch list asesi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchListAsesi()
  }, [jadwalId])

  return { asesiList, isLoading, error }
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
        console.log(`Kegiatan Komtek Response (ttd=${ttd}):`, response)
        console.log(`Kegiatan Komtek Data (ttd=${ttd}):`, response.data.data)
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
