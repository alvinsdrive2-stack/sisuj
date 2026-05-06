import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/config/api"

interface Asesor {
  id: number
  nama: string
  noreg: string
}

interface DataDokumenPraAsesmenData {
  jabatan_kerja: string
  nomor_skema: string
  jenjang: string
  tahap?: number
  metode?: string
  tuk: string
  id_asesor_1: number
  id_asesor_2: number
  nama_asesi: string
  asesor_1: string
  asesor_2: string
  noreg_asesor_1: string
  noreg_asesor_2: string
  tanggal_uji: string
  tanggal_selesai: string | null
  jenis_kelas: string
  nama_penyusun: string | null
  nama_validator: string | null
  tanggal_penyusun: string | null
  tanggal_validator: string | null
  barcode_penyusun: string | null
  barcode_validator: string | null
  noreg_penyusun: string | null
  noreg_validator: string | null
  jadwal_id?: string | null
}

interface DataDokumenPraAsesmenResponse {
  message: string
  data: DataDokumenPraAsesmenData
}

interface UseDataDokumenPraAsesmenResult {
  jabatanKerja: string
  nomorSkema: string
  jenjang: string
  tahap: number
  metode: string
  tuk: string
  asesorList: Asesor[]
  namaAsesor: string
  namaAsesi: string
  tanggalUji: string
  tanggalSelesai: string | null
  jenisKelas: string
  namaPenyusun: string | null
  namaValidator: string | null
  tanggalPenyusun: string | null
  tanggalValidator: string | null
  barcodePenyusun: string | null
  barcodeValidator: string | null
  noregPenyusun: string | null
  noregValidator: string | null
  jadwalId: string | null
  isLoading: boolean
  error: string | null
}

export function useDataDokumenPraAsesmen(idIzin: string | undefined): UseDataDokumenPraAsesmenResult {
  const [data, setData] = useState<{
    jabatanKerja: string
    nomorSkema: string
    jenjang: string
    tahap: number
    metode: string
    tuk: string
    asesorList: Asesor[]
    namaAsesor: string
    namaAsesi: string
    tanggalUji: string
    tanggalSelesai: string | null
    jenisKelas: string
    namaPenyusun: string | null
    namaValidator: string | null
    tanggalPenyusun: string | null
    tanggalValidator: string | null
    barcodePenyusun: string | null
    barcodeValidator: string | null
    noregPenyusun: string | null
    noregValidator: string | null
    jadwalId: string | null
  }>({
    jabatanKerja: '',
    nomorSkema: '',
    jenjang: '0',
    tahap: 0,
    metode: '',
    tuk: '',
    asesorList: [],
    namaAsesor: '',
    namaAsesi: '',
    tanggalUji: '',
    tanggalSelesai: null,
    jenisKelas: '',
    namaPenyusun: null,
    namaValidator: null,
    tanggalPenyusun: null,
    tanggalValidator: null,
    barcodePenyusun: null,
    barcodeValidator: null,
    noregPenyusun: null,
    noregValidator: null,
    jadwalId: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!idIzin) {
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/data-dokumen`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: DataDokumenPraAsesmenResponse = await response.json()
          if (result.message === "Success" && result.data) {
            // Build asesor list dynamically
            const asesorList: Asesor[] = []

            if (result.data.asesor_1) {
              asesorList.push({
                id: result.data.id_asesor_1,
                nama: result.data.asesor_1,
                noreg: result.data.noreg_asesor_1 || '',
              })
            }

            if (result.data.asesor_2) {
              asesorList.push({
                id: result.data.id_asesor_2,
                nama: result.data.asesor_2,
                noreg: result.data.noreg_asesor_2 || '',
              })
            }

            // Combine asesor names for backward compatibility
            const namaAsesor = asesorList.map(a => a.nama).join(', ')

            setData({
              jabatanKerja: result.data.jabatan_kerja || '',
              nomorSkema: result.data.nomor_skema || '',
              jenjang: result.data.jenjang || '0',
              tahap: result.data.tahap ?? 0,
              metode: result.data.metode || '',
              tuk: result.data.tuk || '',
              asesorList,
              namaAsesor,
              namaAsesi: result.data.nama_asesi || '',
              tanggalUji: result.data.tanggal_uji || '',
              tanggalSelesai: result.data.tanggal_selesai,
              jenisKelas: result.data.jenis_kelas || '',
              namaPenyusun: result.data.nama_penyusun || null,
              namaValidator: result.data.nama_validator || null,
              tanggalPenyusun: result.data.tanggal_penyusun || null,
              tanggalValidator: result.data.tanggal_validator || null,
              barcodePenyusun: result.data.barcode_penyusun || null,
              barcodeValidator: result.data.barcode_validator || null,
              noregPenyusun: result.data.noreg_penyusun || null,
              noregValidator: result.data.noreg_validator || null,
              jadwalId: result.data.jadwal_id || null,
            })
          }
        } else {
          console.warn(`Data Dokumen PraAsesmen API returned ${response.status}`)
        }
      } catch (err) {
        console.error("Error fetching data dokumen praasesmen:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [idIzin])

  return {
    ...data,
    isLoading,
    error,
  }
}
