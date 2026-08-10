import { API_BASE_URL } from "@/config/api"
import { apiFetch, apiFetchJson } from "@/lib/api-fetch"

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
export interface AsesiSkema {
  id_izin: string
  skema_id: string
  skema: { id: number; nama: string }
  kompeten: string
  nama: string
}

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
  tahap: number
  status: string
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
  asesi?: AsesiSkema[]
}

// Admin TUK / Komtek response (includes id field)
export interface KegiatanWithId extends KegiatanAsesor {
  id: number
}

export interface KegiatanAsesorResponse {
  message: string
  data: KegiatanAsesor[]
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
  private kegiatanCache: { data: KegiatanResponse | null; expiry: number } = { data: null, expiry: 0 }
  private cacheTTL = 10_000 // 10 seconds

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private isCacheValid(): boolean {
    return this.kegiatanCache.data !== null && Date.now() < this.kegiatanCache.expiry
  }

  async getAllKegiatan(force = false): Promise<KegiatanResponse> {
    if (!force && this.isCacheValid()) {
      return this.kegiatanCache.data!
    }

    const response = await apiFetch(`${this.baseUrl}/kegiatan`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch kegiatan" }))
      throw new Error(error.message || "Failed to fetch kegiatan")
    }

    const data = await response.json()
    this.kegiatanCache = { data, expiry: Date.now() + this.cacheTTL }
    return data
  }

  // Bypass cache when data might have changed
  invalidateKegiatanCache() {
    this.kegiatanCache = { data: null, expiry: 0 }
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

  // Get kegiatan asesi (single object)
  async getKegiatanAsesi(): Promise<KegiatanAsesorResponse> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/asesi`)
  }

  // Get kegiatan for admin TUK (paginated, by date)
  async getKegiatanAdminTUK(tanggalUji: string): Promise<PaginatedKegiatanResponse> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/admin-tuk?tanggal_uji=${tanggalUji}`)
  }

  // Get kegiatan for direktur (paginated, by ttd status)
  async getKegiatanDirektur(ttd: boolean, page: number = 1, search: string = ''): Promise<PaginatedKegiatanResponse> {
    const params = new URLSearchParams({ ttd: String(ttd), page: String(page) })
    if (search) params.set('search', search)
    return apiFetchJson(`${this.baseUrl}/kegiatan/direktur?${params}`)
  }

  // Get kegiatan for komtek (paginated, by ttd status)
  async getKegiatanKomtek(ttd: boolean, page: number = 1, search: string = ''): Promise<PaginatedKegiatanResponse> {
    const params = new URLSearchParams({ ttd: String(ttd), page: String(page) })
    if (search) params.set('search', search)
    return apiFetchJson(`${this.baseUrl}/kegiatan/komtek?${params}`)
  }

  // Get kegiatan asesor (paginated)
  async getKegiatanAsesor(page: number = 1, search: string = '', tahap?: number): Promise<KegiatanAsesorResponse> {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (tahap !== undefined) params.set('tahap', String(tahap))

    const url = `${this.baseUrl}/kegiatan/asesor?${params}`
    return apiFetchJson(url)
  }

  // Start assessment
  async startAssessment(jadwalId: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/${jadwalId}/start`, { method: "POST" })
  }

  // Start pra-asesmen
  async startPraAsesmen(jadwalId: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/${jadwalId}/start-praasesmen`, { method: "POST" })
  }

  // Reset jadwal ke tahap 1 (pra-asesmen) — khusus admin TUK
  async resetJadwalKeTahapSatu(jadwalId: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/jadwal/${jadwalId}/reset-ke-tahap-1`, { method: "POST" })
  }

  // Reset jawaban asesi tertentu — khusus admin TUK
  async resetJawabanAsesi(idIzin: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/asesi-jadwal/${idIzin}/reset-jawaban`, { method: "POST" })
  }

  // Get list asesi by jadwal ID
  async getListAsesi(jadwalId: string): Promise<ListAsesiResponse> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/${jadwalId}/list-asesi`)
  }

  // Save APL 01 data pekerjaan (khusus asesi)
  async saveApl01DataPekerjaan(
    idIzin: string,
    dataPekerjaan: {
      perusahaan: string
      jabatan: string
      alamat_kantor: string | null
      kode_pos: number | null
      telepon_kantor: string | null
      fax: string | null
      email_kantor: string | null
    }
  ): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/praasesmen/${idIzin}/apl01`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataPekerjaan),
    })
  }

  // Save APL 02 (khusus asesi)
  async saveApl02(
    idIzin: string,
    data: {
      metode: string
      is_dilanjutkan: boolean
      answers: Array<{ subunit_id: number; kompeten: boolean }>
    }
  ): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/praasesmen/${idIzin}/apl02`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  }

  // Generate QR for APL 01
  async generateQRApl01(jadwalId: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/qr/apl02`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_jadwal: jadwalId }),
    })
  }

  // Generate QR for IA05
  async generateQRIa05(idIzin: string, jadwalId: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/qr/${idIzin}/ia05`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_jadwal: jadwalId }),
    })
  }

  // Update jadwal tanggal_uji
  async updateJadwal(idJadwal: string, tanggalUji: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/jadwal/${idJadwal}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tanggal_uji: tanggalUji }),
    })
  }

  // Get history/riwayat kegiatan for admin TUK (paginated)
  async getKegiatanHistoryAdminTUK(page: number = 1): Promise<PaginatedKegiatanResponse> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/admin-tuk?page=${page}`)
  }

  // Get single kegiatan detail by jadwal ID
  async getKegiatanDetail(jadwalId: string): Promise<{ message: string; data: KegiatanAsesor }> {
    return apiFetchJson(`${this.baseUrl}/kegiatan/${jadwalId}/detail`)
  }

  // Generate QR for Ujian
  async generateQRUjian(idIzin: string, jadwalId: string): Promise<{ message: string }> {
    return apiFetchJson(`${this.baseUrl}/qr/${idIzin}/ia05`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_jadwal: jadwalId }),
    })
  }

  // Get link video asesmen (per jadwal)
  async getLinkVideo(jadwalId: string): Promise<{ data: { link_video: string | null } }> {
    return apiFetchJson(`${this.baseUrl}/jadwal/${jadwalId}/link-video`)
  }

  // Update link video asesmen (per jadwal)
  async updateLinkVideo(jadwalId: string, linkVideo: string): Promise<{ data: { link_video: string } }> {
    return apiFetchJson(`${this.baseUrl}/jadwal/${jadwalId}/link-video`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link_video: linkVideo }),
    })
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

export function getUniqueSkemaNames(kegiatan: KegiatanAsesor): string {
  if (kegiatan.asesi && kegiatan.asesi.length > 0) {
    const names = [...new Set(kegiatan.asesi.map(a => a.skema?.nama).filter(Boolean) as string[])]
    return names.join(', ')
  }
  return kegiatan.skema?.nama || '-'
}
