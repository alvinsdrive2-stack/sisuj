import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"
import { AsesorSignatureGuard } from "@/components/AsesorSignatureGuard"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { API_BASE_URL } from "@/config/api"

interface BarcodeData {
  url: string
  tanggal: string
  nama: string
}

interface Pertanyaan {
  id: number
  no: string
  pertanyaan: string
  kesimpulan: string
  k: boolean
  bk: boolean
}

interface BuktiItem {
  id: number
  no: string
  nama: string
}

interface Ia09Response {
  message: string
  data?: {
    soal?: {
      "1"?: Array<{ id: number; soal: string; no: string; id_kelompok: string }>
      "2"?: Array<{ id: number; soal: string; no: string; id_kelompok: string }>
    }
    dokumen?: { id: number; nama_dokumen: string }
    barcodes?: {
      asesi?: BarcodeData | null
      asesor1?: BarcodeData | null
      asesor2?: BarcodeData | null
    }
  }
}

export default function Ia09Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const {
    jabatanKerja,
    nomorSkema,
    tuk,
    jenjang,
    metode,
    asesorList,
    namaAsesi,
    namaAsesor: _namaAsesor,
    tanggalUji,
  } = useDataDokumenAsesmen(id)
  const { kegiatan, isAsesor } = useKegiatanByRole()
  const { isAsesor1 } = useAsesorRole(id)

  const asesmenSteps = getAsesmenSteps(
    jenjang,
    isAsesor,
    undefined,
    asesorList.length,
    metode
  )

  const {
    showAwalModal,
    submitAbsenAwal,
    handleAwalModalClose,
  } = useAbsenCheck({
    phase: "asesmen",
    role: "auto",
    checkOnMount: true,
    idIzin: id,
    asesorList,
  })

  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [dokumenId, setDokumenId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([])
  const [buktiList, setBuktiList] = useState<BuktiItem[]>([])
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData | null
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  } | null>(null)

  const fetchIa09Data = useCallback(async () => {
    if (!id || authLoading) return
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia09`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      })
      if (response.ok) {
        const result: Ia09Response = await response.json()
        if (result.message === "Success" && result.data) {
          if (result.data.soal?.["1"]) {
            const buktiItems = result.data.soal["1"].map((item: any, index: number) => ({
              id: item.id || index + 1, no: item.no || String(index + 1), nama: item.soal || "-",
            }))
            setBuktiList(buktiItems)
          }
          if (result.data.soal?.["2"]) {
            const pertanyaanData = result.data.soal["2"].map((item: any) => ({
              id: item.id, no: item.no || "1", pertanyaan: item.soal || "-", kesimpulan: "", k: false, bk: false,
            }))
            setPertanyaanList(pertanyaanData)
          }
          if (result.data.barcodes) {
            setBarcodes({ asesi: result.data.barcodes.asesi, asesor1: result.data.barcodes.asesor1, asesor2: result.data.barcodes.asesor2 })
          }
          if (result.data.dokumen?.id) {
            setDokumenId(result.data.dokumen.id)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching IA09:", err)
    } finally {
      setIsLoading(false)
    }
  }, [id, authLoading])

  useEffect(() => { fetchIa09Data() }, [fetchIa09Data])

  const { publishUpdate } = useRealtimeSync({
    channelName: `asesmen:${id}`,
    onUpdate: fetchIa09Data
  })

  const asesiHasSigned = !!barcodes?.asesi?.url
  const asesorHasSigned = (() => {
    if (!isAsesor) return false
    const idx = asesorList.findIndex(a => String(a.id) === String(user?.id))
    return (idx === 0 || idx === -1) ? !!barcodes?.asesor1?.url : !!barcodes?.asesor2?.url
  })()
  const hasSigned = isAsesor ? asesorHasSigned : asesiHasSigned
  const allSigned = asesiHasSigned && (asesorList.length === 0 || (
    !!barcodes?.asesor1?.url && (asesorList.length < 2 || !!barcodes?.asesor2?.url)
  ))
  const asesor1Signed = !!barcodes?.asesor1?.url
  const asesor2Signed = !!barcodes?.asesor2?.url
  const allAsesorSigned = isAsesor || asesorList.length === 0 || (asesor1Signed && (asesorList.length < 2 || asesor2Signed))
  const missingAsesorLabels = asesorList.length === 0 ? [] : [
    !asesor1Signed && "Asesor 1",
    asesorList.length >= 2 && !asesor2Signed && "Asesor 2",
  ].filter(Boolean) as string[]

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

  const handleKChange = (id: number, value: boolean) => {
    setPertanyaanList(prev => prev.map(p => p.id === id ? { ...p, k: value, bk: value ? false : p.bk } : p))
  }

  const handleBKChange = (id: number, value: boolean) => {
    setPertanyaanList(prev => prev.map(p => p.id === id ? { ...p, bk: value, k: value ? false : p.k } : p))
  }

  const handleSave = async () => {
    if (hasSigned) {
      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ia09'))
      const nextStep = asesmenSteps[currentStepIndex + 1]
      if (nextStep) {
        const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
        navigate(nextPath)
      } else {
        navigate(`/asesi/asesmen/${id}/selesai`)
      }
      return
    }

    if (!agreedChecklist) {
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")

      // POST answers
      const payload = {
        dokumen_id: dokumenId,
        answers: pertanyaanList.map(p => ({
          soal_id: p.id,
          kesimpulan: p.kesimpulan,
          is_kompeten: p.k,
        })),
      }

      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia09`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Generate QR for asesor if needed
        if (isAsesor) {
          const existingAsesorQR = isAsesor1 ? barcodes?.asesor1?.url : barcodes?.asesor2?.url
          if (!existingAsesorQR) {
            try {
              const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ia09`, {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ id_jadwal: kegiatan?.jadwal_id }),
              })
              if (qrResponse.ok) {
                const qrResult = await qrResponse.json()
                if (qrResult.message === "Success" && qrResult.data?.url_image) {
                  if (isAsesor1) {
                    setBarcodes(prev => ({ ...prev, asesor1: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || "" } }))
                  } else {
                    setBarcodes(prev => ({ ...prev, asesor2: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || "" } }))
                  }
                }
              }
            } catch (qrErr) {
              console.error("Error generating QR:", qrErr)
            }
          }
        }
        publishUpdate()

        // Generate QR for asesi if needed
        if (!barcodes?.asesi?.url) {
          try {
            const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ia09`, {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ id_jadwal: kegiatan?.jadwal_id }),
            })
            if (qrResponse.ok) {
              const qrResult = await qrResponse.json()
              if (qrResult.message === "Success" && qrResult.data?.url_image) {
                setBarcodes(prev => ({ ...prev, asesi: { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: namaAsesi || "" } }))
              }
            }
          } catch (qrErr) {
            console.error("Error generating QR:", qrErr)
          }
        }
      }
    } catch (err) {
      console.error("Error saving IA09:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data IA.09..." />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <DashboardNavbar userName={user?.name} />

      <div style={{ borderBottom: "1px solid #999", background: "#fff" }}>
        <div style={{ padding: "12px 16px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#666" }}>
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() =>
                navigate(isAsesor ? "/asesor/dashboard" : "/asesi/dashboard")
              }
            >
              Dashboard
            </span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>IA.09</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout
        currentStep={asesmenSteps.find((s) => s.href.includes("ia09"))?.number || 1}
        steps={asesmenSteps}
        id={id}
      >
        {/* Title */}
        <div style={{ marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#000",
              marginBottom: "4px",
              letterSpacing: "1px",
            }}
          >
            FR.IA.09. &nbsp; PERTANYAAN WAWANCARA
          </h1>
        </div>

        {/* Header Info Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "13px",
            background: "#fff",
            border: "2px solid #000",
          }}
        >
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: "30%", border: "1px solid #000", padding: "6px" }}>
                Skema Sertifikasi
                <br />
                <span style={{ fontSize: "11px" }}>(KKNI/Okupasi/Klaster)</span>
              </td>
              <td style={{ width: "12%", border: "1px solid #000", padding: "6px" }}>Judul</td>
              <td style={{ width: "3%", border: "1px solid #000", padding: "6px", textAlign: "end" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px", textTransform: "uppercase" }}>
                {jabatanKerja || "-"}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Nomor</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "end" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px", textTransform: "uppercase" }}>
                {nomorSkema || "-"}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>TUK</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "end" }}>:</td>
              <td colSpan={2} style={{ border: "1px solid #000", padding: "6px", textTransform: "uppercase" }}>
                {tuk || "-"}
              </td>
            </tr>
            {asesorList.map((asesor, idx) => (
              <tr key={asesor.id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  Nama Asesor {asesorList.length > 1 ? idx + 1 : ""}
                </td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "end" }}>:</td>
                <td colSpan={2} style={{ border: "1px solid #000", padding: "6px" }}>
                  {asesor.nama?.toUpperCase() || ""}
                  {asesor.noreg && ` (${asesor.noreg})`}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Nama Asesi</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "end" }}>:</td>
              <td colSpan={2} style={{ border: "1px solid #000", padding: "6px", textTransform: "uppercase" }}>
                {namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || "-"}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Tanggal</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "end" }}>:</td>
              <td colSpan={2} style={{ border: "1px solid #000", padding: "6px" }}>
                {tanggalUji ? new Date(tanggalUji).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>*Coret yang tidak perlu</div>

        {/* Panduan */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "15px",
            fontSize: "13px",
            background: "#fff",
            border: "2px solid #000",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  background: "#c40000",
                  color: "#fff",
                  padding: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  textAlign: "left",
                }}
              >
                PANDUAN BAGI ASESOR
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px", fontSize: "12px" }}>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>Pertanyaan wawancara dapat dilakukan untuk keseluruhan unit kompetensi atau kelompok pekerjaan.</li>
                  <li>Isilah bukti portofolio sesuai dengan bukti pada FR.IA.08.</li>
                  <li>Ajukan pertanyaan verifikasi portofolio untuk semua unit kompetensi.</li>
                  <li>Ajukan pertanyaan kepada asesi sebagai tindak lanjut verifikasi portofolio.</li>
                  <li>Jika hasil verifikasi belum memadai, ajukan pertanyaan tambahan.</li>
                  <li>Tuliskan pencapaian dengan mencentang (√) "Ya" atau "Tidak".</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bukti */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "15px",
            fontSize: "13px",
            background: "#fff",
            border: "2px solid #000",
          }}
        >
          <thead>
            <tr style={{ background: "#c40000", color: "#fff", fontWeight: "bold", textAlign: "center" }}>
              <th style={{ width: "5%", border: "1px solid #000", padding: "6px" }}>No.</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Bukti – Bukti Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            {buktiList.map((b) => (
              <tr key={b.id}>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{b.no}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{b.nama}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pertanyaan */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "15px",
            fontSize: "13px",
            background: "#fff",
            border: "2px solid #000",
          }}
        >
          <thead>
            <tr style={{ background: "#c40000", color: "#fff", fontWeight: "bold", textAlign: "center" }}>
              <th style={{ width: "5%", border: "1px solid #000", padding: "6px" }}>No.</th>
              <th style={{ width: "40%", border: "1px solid #000", padding: "6px" }}>Daftar Pertanyaan Wawancara</th>
              <th style={{ width: "35%", border: "1px solid #000", padding: "6px" }}>Kesimpulan Jawaban Asesi</th>
              <th style={{ width: "10%", border: "1px solid #000", padding: "6px" }}>K</th>
              <th style={{ width: "10%", border: "1px solid #000", padding: "6px" }}>BK</th>
            </tr>
          </thead>
          <tbody>
            {pertanyaanList.map((p) => (
              <tr key={p.id}>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{p.no}</td>
                <td style={{ border: "1px solid #000", padding: "6px", whiteSpace: "pre-line" }}>{p.pertanyaan}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  <textarea
                    value={p.kesimpulan}
                    onChange={(e) => {
                      setPertanyaanList(prev => prev.map(item =>
                        item.id === p.id ? { ...item, kesimpulan: e.target.value } : item
                      ))
                    }}
                    disabled={isAsesor || allSigned}
                    style={{
                      width: "100%",
                      minHeight: "60px",
                      border: "1px solid #ccc",
                      padding: "4px",
                      fontSize: "12px",
                      resize: "vertical",
                    }}
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox
                    checked={p.k}
                    onChange={() => !isAsesor && handleKChange(p.id, !p.k)}
                    disabled={true || allSigned}
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox
                    checked={p.bk}
                    onChange={() => !isAsesor && handleBKChange(p.id, !p.bk)}
                    disabled={true || allSigned}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tanda Tangan */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "13px",
            background: "#fff",
            border: "2px solid #000",
          }}
        >
          <tbody>
            {/* Asesi */}
            <tr>
              <td colSpan={3} style={{ border: "1px solid #000", padding: "6px", fontWeight: "bold" }}>
                Asesi :
              </td>
            </tr>
            <tr>
              <td style={{ width: "20%", border: "1px solid #000", padding: "6px" }}>Nama</td>
              <td style={{ width: "5%", border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>
                {namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ""}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Tanda tangan dan Tanggal</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px", height: "60px", textAlign: "center" }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <img src={barcodes.asesi.url} alt="Tanda Tangan" style={{ height: "50px", width: "50px", objectFit: "contain" }} />
                    {barcodes.asesi.tanggal && (
                      <div style={{ fontSize: "11px" }}>
                        {new Date(barcodes.asesi.tanggal).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>

            {/* Asesor 1 */}
            <tr>
              <td colSpan={3} style={{ border: "1px solid #000", padding: "6px", fontWeight: "bold" }}>
                Asesor 1 :
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Nama</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>
                {asesorList[0]?.nama?.toUpperCase() || ""}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>No. Reg</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>
                {asesorList[0]?.noreg || ""}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Tanda tangan dan Tanggal</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
              <td style={{ border: "1px solid #000", padding: "6px", height: "60px", textAlign: "center" }}>
                {barcodes?.asesor1?.url ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <img src={barcodes.asesor1.url} alt="Tanda Tangan" style={{ height: "50px", width: "50px", objectFit: "contain" }} />
                    {barcodes.asesor1.tanggal && (
                      <div style={{ fontSize: "11px" }}>
                        {new Date(barcodes.asesor1.tanggal).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>

            {/* Asesor 2 */}
            {asesorList.length > 1 && (
              <>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "6px", fontWeight: "bold" }}>
                    Asesor 2 :
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>Nama</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    {asesorList[1]?.nama?.toUpperCase() || ""}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>No. Reg</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    {asesorList[1]?.noreg || ""}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>Tanda tangan dan Tanggal</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>:</td>
                  <td style={{ border: "1px solid #000", padding: "6px", height: "60px", textAlign: "center" }}>
                    {barcodes?.asesor2?.url ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <img src={barcodes.asesor2.url} alt="Tanda Tangan" style={{ height: "50px", width: "50px", objectFit: "contain" }} />
                        {barcodes.asesor2.tanggal && (
                          <div style={{ fontSize: "11px" }}>
                            {new Date(barcodes.asesor2.tanggal).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ marginTop: "20px" }}>
          {/* Pernyataan Checkbox */}
          {!allSigned && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #999",
              borderRadius: "4px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                disabled={allSigned}
                style={{ marginTop: "2px" }}
              />
              <span style={{ fontSize: "13px", color: "#333" }}>
                Saya menyatakan data ini telah diisi dengan benar.
              </span>
            </label>
          </div>
          )}

          <AsesorSignatureGuard
            missingAsesorLabels={missingAsesorLabels}
            allAsesorSigned={allAsesorSigned}
            isAsesor={isAsesor}
          />

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <ActionButton variant="secondary" onClick={() => navigate(-1)}>
              Kembali
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={isSaving || (!allSigned && !agreedChecklist) || (!isAsesor && !allAsesorSigned)}
              onClick={handleSave}
            >
              {isSaving ? "Menyimpan..." : allSigned ? "Lanjut" : "Simpan & Tanda Tangan"}
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>

      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />
    </div>
  )
}
