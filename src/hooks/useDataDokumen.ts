import { useState, useEffect } from "react"

interface DataDokumenData {
  jabatan_kerja: string
  nomor_skema: string
  tuk: string
  asesor_1: string
  asesor_2: string
  noreg_asesor_1: string
  noreg_asesor_2: string
  tanggal_uji: string
  tanggal_selesai: string | null
  jenis_kelas: string
}

interface DataDokumenResponse {
  message: string
  data: DataDokumenData
}

interface UseDataDokumenResult {
  jabatanKerja: string
  nomorSkema: string
  tuk: string
  namaAsesor: string
  asesor1: string
  asesor2: string
  noregAsesor1: string
  noregAsesor2: string
  tanggalUji: string
  tanggalSelesai: string | null
  jenisKelas: string
  isLoading: boolean
  error: string | null
}

export function useDataDokumen(idIzin: string | undefined): UseDataDokumenResult {
  const [data, setData] = useState<{
    jabatanKerja: string
    nomorSkema: string
    tuk: string
    namaAsesor: string
    asesor1: string
    asesor2: string
    noregAsesor1: string
    noregAsesor2: string
    tanggalUji: string
    tanggalSelesai: string | null
    jenisKelas: string
  }>({
    jabatanKerja: '',
    nomorSkema: '',
    tuk: 'Sewaktu / Tempat Kerja / Mandiri',
    namaAsesor: '',
    asesor1: '',
    asesor2: '',
    noregAsesor1: '',
    noregAsesor2: '',
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
          const result: DataDokumenResponse = await response.json()
          if (result.message === "Success" && result.data) {
            // Combine asesor 1 and 2
            const namaAsesor = result.data.asesor_1
              ? result.data.asesor_2
                ? `${result.data.asesor_1}, ${result.data.asesor_2}`
                : result.data.asesor_1
              : ''

            setData({
              jabatanKerja: result.data.jabatan_kerja || '',
              nomorSkema: result.data.nomor_skema || '',
              tuk: result.data.tuk || 'Sewaktu / Tempat Kerja / Mandiri',
              namaAsesor,
              asesor1: result.data.asesor_1 || '',
              asesor2: result.data.asesor_2 || '',
              noregAsesor1: result.data.noreg_asesor_1 || '',
              noregAsesor2: result.data.noreg_asesor_2 || '',
              tanggalUji: result.data.tanggal_uji || '',
              tanggalSelesai: result.data.tanggal_selesai,
              jenisKelas: result.data.jenis_kelas || '',
            })
          }
        } else {
          console.warn(`Data Dokumen API returned ${response.status}`)
        }
      } catch (err) {
        console.error("Error fetching data dokumen:", err)
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
