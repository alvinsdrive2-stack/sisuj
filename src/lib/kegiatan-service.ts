const API_BASE_URL = "https://backend.devgatensi.site/api"

// Kegiatan / Jadwal Types
export interface Kegiatan {
  id: number
  nama_kegiatan: string
  tuk_id: string
  asesor_id: string
  asesor2_id: string | null
  skema_id: string
  jenjang_id: string
  tanggal_uji: string
  tanggal_selesai: string | null
  is_started: string // "0" or "1"
  jenis_kelas: string
  tahap: string
  tuk: {
    id: string
    nama: string
    alamat: string
  }
  asesor: {
    id: number
    nama: string
    noreg: string
  }
  asesor2: {
    id: number
    nama: string
    noreg: string
  } | null
  skema: {
    id: string
    nama: string
  }
}

export interface KegiatanResponse {
  message: string
  data: Kegiatan[]
}

// Kegiatan Asesor Response (single object with jadwal_id)
export interface KegiatanAsesor {
  jadwal_id: string
  id_izin?: string
  nama_kegiatan: string
  tuk_id: string
  asesor_id: string
  asesor2_id: string | null
  skema_id: string
  jenjang_id: string
  tanggal_uji: string
  tanggal_selesai: string | null
  is_started: string
  is_started_praasesmen: string
  jenis_kelas: string
  tahap: string
  tuk: {
    id: string
    nama: string
    alamat: string
  }
  asesor: {
    id: number
    nama: string
    noreg: string
  }
  asesor2: {
    id: number
    nama: string
    noreg: string
  } | null
  skema: {
    id: string
    nama: string
  }
}

// Admin TUK / Komtek response (includes id field)
export interface KegiatanWithId extends KegiatanAsesor {
  id: number
}

export interface KegiatanAsesorResponse {
  message: string
  data: KegiatanAsesor
}

// Paginated response for admin TUK
export interface PaginatedKegiatanResponse {
  message: string
  data: {
    current_page: number
    data: KegiatanAsesor[]
    first_page_url: string | null
    from: number | null
    last_page: number
    last_page_url: string | null
    links: Array<{
      url: string | null
      label: string
      page: number | null
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number | null
    total: number
  }
}

class KegiatanService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return localStorage.getItem("access_token")
  }

  async getAllKegiatan(): Promise<KegiatanResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan" }))
      throw new Error(error.message || "Failed to fetch kegiatan")
    }

    return response.json()
  }

  // Get kegiatan by status (started/not started)
  async getKegiatanByStatus(isStarted: boolean): Promise<Kegiatan[]> {
    const allKegiatan = await this.getAllKegiatan()
    return allKegiatan.data.filter(k => k.is_started === (isStarted ? "1" : "0"))
  }

  // Get kegiatan by TUK
  async getKegiatanByTUK(tukId: string): Promise<Kegiatan[]> {
    const allKegiatan = await this.getAllKegiatan()
    return allKegiatan.data.filter(k => k.tuk_id === tukId)
  }

  // Get kegiatan by Asesor
  async getKegiatanByAsesor(asesorId: string): Promise<Kegiatan[]> {
    const allKegiatan = await this.getAllKegiatan()
    return allKegiatan.data.filter(k =>
      k.asesor_id === asesorId || k.asesor2_id === asesorId
    )
  }

  // Get upcoming kegiatan
  async getUpcomingKegiatan(): Promise<Kegiatan[]> {
    const allKegiatan = await this.getAllKegiatan()
    const now = new Date()
    return allKegiatan.data.filter(k => {
      const tanggalUji = new Date(k.tanggal_uji)
      return tanggalUji >= now
    }).sort((a, b) =>
      new Date(a.tanggal_uji).getTime() - new Date(b.tanggal_uji).getTime()
    )
  }

  // Get today's kegiatan
  async getTodayKegiatan(): Promise<Kegiatan[]> {
    const allKegiatan = await this.getAllKegiatan()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return allKegiatan.data.filter(k => {
      const tanggalUji = new Date(k.tanggal_uji)
      tanggalUji.setHours(0, 0, 0, 0)
      return tanggalUji.getTime() === today.getTime()
    })
  }

  // Get kegiatan asesor (single object)
  async getKegiatanAsesor(): Promise<KegiatanAsesorResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/asesor`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan asesor" }))
      throw new Error(error.message || "Failed to fetch kegiatan asesor")
    }

    return response.json()
  }

  // Get kegiatan asesi (single object)
  async getKegiatanAsesi(): Promise<KegiatanAsesorResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/asesi`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan asesi" }))
      throw new Error(error.message || "Failed to fetch kegiatan asesi")
    }

    return response.json()
  }

  // Get kegiatan for admin TUK (paginated, by date)
  async getKegiatanAdminTUK(tanggalUji: string): Promise<PaginatedKegiatanResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/admin-tuk?tanggal_uji=${tanggalUji}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan admin TUK" }))
      throw new Error(error.message || "Failed to fetch kegiatan admin TUK")
    }

    return response.json()
  }

  // Get kegiatan for direktur (paginated, by ttd status)
  async getKegiatanDirektur(ttd: boolean): Promise<PaginatedKegiatanResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/direktur?ttd=${ttd}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan direktur" }))
      throw new Error(error.message || "Failed to fetch kegiatan direktur")
    }

    return response.json()
  }

  // Get kegiatan for komtek (paginated, by ttd status)
  async getKegiatanKomtek(ttd: boolean): Promise<PaginatedKegiatanResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/komtek?ttd=${ttd}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan komtek" }))
      throw new Error(error.message || "Failed to fetch kegiatan komtek")
    }

    return response.json()
  }

  // Start assessment
  async startAssessment(jadwalId: string): Promise<{ message: string }> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/${jadwalId}/start`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to start assessment" }))
      throw new Error(error.message || "Failed to start assessment")
    }

    return response.json()
  }

  // Start pra-asesmen
  async startPraAsesmen(jadwalId: string): Promise<{ message: string }> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/${jadwalId}/start-praasesmen`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to start pra-asesmen" }))
      throw new Error(error.message || "Failed to start pra-asesmen")
    }

    return response.json()
  }

  // Get list asesi by jadwal ID
  async getListAsesi(jadwalId: string): Promise<ListAsesiResponse> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}/kegiatan/${jadwalId}/list-asesi`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch list asesi" }))
      throw new Error(error.message || "Failed to fetch list asesi")
    }

    return response.json()
  }
}

// List Asesi Types
export interface AsesiItem {
  jadwal_id: string
  id_izin: string
  nama: string
  is_started: boolean
  started_at: string | null
  kompeten: string
}

export interface ListAsesiResponse {
  message: string
  list_asesi: AsesiItem[]
}

export const kegiatanService = new KegiatanService()
