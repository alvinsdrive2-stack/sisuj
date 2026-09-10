import { API_BASE_URL } from "@/config/api"

export interface Ak01Status {
  filled: boolean
  missing: string[]
}

/**
 * Cek kelengkapan TTD FR.AK.01 untuk satu asesi.
 * Wajib: asesi + asesor 1, plus asesor 2 kalau data-dokumen asesi menunjuk asesor 2.
 * Fail-open: kalau fetch error, anggap filled supaya tidak memblokir navigasi.
 */
export async function getAk01Status(idIzin: string): Promise<Ak01Status> {
  const token = localStorage.getItem("access_token")
  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` }
  try {
    const [ak01Res, dokRes] = await Promise.all([
      fetch(`${API_BASE_URL}/praasesmen/${idIzin}/ak01`, { headers }),
      fetch(`${API_BASE_URL}/praasesmen/${idIzin}/data-dokumen`, { headers }),
    ])
    const ak01 = ak01Res.ok ? await ak01Res.json() : null
    const dok = dokRes.ok ? await dokRes.json() : null
    const barcodes = ak01?.data?.barcodes
    const asesor2Wajib = !!(dok?.data?.id_asesor_2 && dok?.data?.asesor_2)

    const missing: string[] = []
    if (!barcodes?.asesi?.url) missing.push('Asesi')
    if (!barcodes?.asesor1?.url) missing.push('Asesor 1')
    if (asesor2Wajib && !barcodes?.asesor2?.url) missing.push('Asesor 2')

    return { filled: missing.length === 0, missing }
  } catch {
    return { filled: true, missing: [] }
  }
}