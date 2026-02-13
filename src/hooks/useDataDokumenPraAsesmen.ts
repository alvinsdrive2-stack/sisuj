import { useState, useEffect } from "react"

interface Asesor {
  id: number
  nama: string
  noreg: string
}

interface DataDokumenPraAsesmenData {
  jabatan_kerja: string
  nomor_skema: string
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
}

interface DataDokumenPraAsesmenResponse {
  message: string
  data: DataDokumenPraAsesmenData
}

interface UseDataDokumenPraAsesmenResult {
  jabatanKerja: string
  nomorSkema: string
  tuk: string
  asesorList: Asesor[]
  namaAsesor: string
  namaAsesi: string
  tanggalUji: string
  tanggalSelesai: string | null
  jenisKelas: string
  isLoading: boolean
  error: string | null
}

export function useDataDokumenPraAsesmen(idIzin: string | undefined): UseDataDokumenPraAsesmenResult {
  const [data, setData] = useState<{
    jabatanKerja: string
    nomorSkema: string
    tuk: string
    asesorList: Asesor[]
    namaAsesor: string
    namaAsesi: string
    tanggalUji: string
    tanggalSelesai: string | null
    jenisKelas: string
  }>({
    jabatanKerja: '',
    nomorSkema: '',
    tuk: '',
    asesorList: [],
    namaAsesor: '',
    namaAsesi: '',
    tanggalUji: '',
    tanggalSelesai: null,
    jenisKelas: '',
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
        const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${idIzin}/data-dokumen`, {
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
              tuk: result.data.tuk || '',
              asesorList,
              namaAsesor,
              namaAsesi: result.data.nama_asesi || '',
              tanggalUji: result.data.tanggal_uji || '',
              tanggalSelesai: result.data.tanggal_selesai,
              jenisKelas: result.data.jenis_kelas || '',
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
