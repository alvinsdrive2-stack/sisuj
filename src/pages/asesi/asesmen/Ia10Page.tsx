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

interface ReferensiItem {
  id: number
  nama: string
  id_kelompok: number
  no: number
  jawaban?: string
}

interface DataPihak {
  id: number
  nama: string
  tempat_kerja: string
  alamat: string
  telepon: string
  no: number
}

interface PertanyaanYaTidak {
  id: number
  pertanyaan: string
  ya: boolean
  tidak: boolean
}

interface EssayQuestion {
  id: number
  pertanyaan: string
  jawaban: string
}

interface Ia10Response {
  message: string
  data?: {
    dokumen_id?: number
    referensi_form?: {
      "1"?: ReferensiItem[]
      "2"?: ReferensiItem[]
      "3"?: ReferensiItem[]
      "4"?: ReferensiItem[]
    }
    barcodes?: {
      asesi?: BarcodeData | null
      asesor1?: BarcodeData | null
      asesor2?: BarcodeData | null
    }
  }
}

export default function Ia10Page() {
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
  const [dataPihak, setDataPihak] = useState<DataPihak[]>([])
  const [pertanyaanYaTidakList, setPertanyaanYaTidakList] = useState<PertanyaanYaTidak[]>([])
  const [essayList, setEssayList] = useState<EssayQuestion[]>([])
  const [additionalList, setAdditionalList] = useState<ReferensiItem[]>([])
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData | null
    asesor1?: BarcodeData | null
    asesor2?: BarcodeData | null
  } | null>(null)

  const fetchIa10Data = useCallback(async () => {
    if (!id || authLoading) return
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia10`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      })
      if (response.ok) {
        const result: Ia10Response = await response.json()
        if (result.message === "Success" && result.data) {
          if (result.data.referensi_form?.["1"]) {
            const pihak = result.data.referensi_form["1"]
            setDataPihak(pihak.map((item: any) => ({
              id: item.id,
              nama: item.nama || "",
              tempat_kerja: item.tempat_kerja || "",
              alamat: item.alamat || "",
              telepon: item.telepon || "",
              no: item.no || 1,
            })))
          }
          if (result.data.referensi_form?.["2"]) {
            setPertanyaanYaTidakList(result.data.referensi_form["2"].map((item: any) => ({ id: item.id, pertanyaan: item.nama, ya: false, tidak: false })))
          }
          if (result.data.referensi_form?.["3"]) {
            setEssayList(result.data.referensi_form["3"].map((item: any) => ({ id: item.id, pertanyaan: item.nama, jawaban: "" })))
          }
          if (result.data.referensi_form?.["4"]) {
            setAdditionalList(result.data.referensi_form["4"].map((item: any) => ({ id: item.id, nama: item.nama, id_kelompok: item.id_kelompok, no: item.no })))
          }
          if (result.data.barcodes) {
            setBarcodes({ asesi: result.data.barcodes.asesi, asesor1: result.data.barcodes.asesor1, asesor2: result.data.barcodes.asesor2 })
          }
          if (result.data.dokumen_id) {
            setDokumenId(result.data.dokumen_id)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching IA10:", err)
    } finally {
      setIsLoading(false)
    }
  }, [id, authLoading])

  useEffect(() => { fetchIa10Data() }, [fetchIa10Data])

  const { publishUpdate } = useRealtimeSync({
    channelName: `asesmen:${id}`,
    onUpdate: fetchIa10Data
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

  const handleYaChange = (id: number, value: boolean) => {
    setPertanyaanYaTidakList(prev => prev.map(p => p.id === id ? { ...p, ya: value, tidak: value ? false : p.tidak } : p))
  }

  const handleTidakChange = (id: number, value: boolean) => {
    setPertanyaanYaTidakList(prev => prev.map(p => p.id === id ? { ...p, tidak: value, ya: value ? false : p.ya } : p))
  }

  const handleEssayChange = (id: number, value: string) => {
    setEssayList(prev => prev.map(e => e.id === id ? { ...e, jawaban: value } : e))
  }

  const handleAdditionalChange = (id: number, value: string) => {
    setAdditionalList(prev => prev.map(a => a.id === id ? { ...a, jawaban: value } : a))
  }

  const handleDataPihakChange = (idx: number, field: keyof DataPihak, value: string) => {
    setDataPihak(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  const handleSave = async () => {
    if (hasSigned) {
      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ia10'))
      const nextStep = asesmenSteps[currentStepIndex + 1]
      if (nextStep) {
        const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
        navigate(nextPath)
      } else {
        navigate(`/asesi/asesmen/${id}/selesai`)
      }
      return
    }

    if (!agreedChecklist) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")

      const payload = {
        dokumen_id: dokumenId,
        ...(dataPihak[0] ? {
          nama_pengawas: dataPihak[0].nama,
          tempat_kerja: dataPihak[0].tempat_kerja,
          alamat: dataPihak[0].alamat,
          telepon: dataPihak[0].telepon,
        } : {}),
        answers: pertanyaanYaTidakList.map(p => ({
          referensi_id: p.id,
          answer: p.ya,
        })),
        essay_answers: [
          ...essayList.map(e => ({
            referensi_id: e.id,
            essay_answer: e.jawaban,
          })),
          ...additionalList.map(a => ({
            referensi_id: a.id,
            essay_answer: a.jawaban || "",
          })),
        ],
      }

      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia10`, {
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
              const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ia10`, {
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
            const qrResponse = await fetch(`${API_BASE_URL}/qr/${id}/ia10`, {
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
      console.error("Error saving IA10:", err)
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
        <FullPageLoader text="Memuat data IA.10..." />
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
            <span>IA.10</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout
        currentStep={asesmenSteps.find((s) => s.href.includes("ia10"))?.number || 1}
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
            FR.IA.10. &nbsp; KLARIFIKASI BUKTI PIHAK KETIGA
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
              <td
                rowSpan={2}
                style={{ width: "30%", border: "1px solid #000", padding: "6px" }}
              >
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
        <div style={{ fontSize: "11px", color: "#666", textAlign: "right", marginBottom: "10px" }}><i>Informasi Rahasia</i></div>

        {/* Panduan */}
        <div style={{ border: "2px solid #000", marginBottom: "15px" }}>
          <div style={{ background: "#c00000", color: "#000", fontWeight: "bold", padding: "6px" }}>
            PANDUAN BAGI ASESOR
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px" }}>
                  1. Verifikasi pihak ketiga dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dilakukan untuk masing-masing kelompok pekerjaan dalam satu skema sertifikasi.
                  <br /><br />
                  2. Tentukan pihak ketiga yang akan dimintai verifikasi.
                  <br /><br />
                  3. Ajukan pertanyaan kepada pihak ketiga.
                  <br /><br />
                  4. Berikan penilaian kepada asesi berdasarkan verifikasi pihak ketiga.
                  <br /><br />
                  5. Pertanyaan/pernyataan dapat dikembangkan sesuai dengan konteks pekerjaan dan relasi.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Data Pihak */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "13px", background: "#fff", border: "2px solid #000" }}>
          <tbody>
            {dataPihak.map((d, idx) => (
              <tr key={d.id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  <b>{(d.no || idx + 1)}. {d.nama}</b>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
                    <div>
                      <label style={{ fontSize: "12px" }}>Nama:</label>
                      <input
                        type="text"
                        value={d.nama}
                        onChange={e => handleDataPihakChange(idx, "nama", e.target.value)}
                        disabled={isAsesor || allSigned}
                        style={{ width: "100%", padding: "4px", border: "1px solid #ccc", fontSize: "12px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px" }}>Tempat Kerja:</label>
                      <input
                        type="text"
                        value={d.tempat_kerja}
                        onChange={e => handleDataPihakChange(idx, "tempat_kerja", e.target.value)}
                        disabled={isAsesor || allSigned}
                        style={{ width: "100%", padding: "4px", border: "1px solid #ccc", fontSize: "12px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px" }}>Alamat:</label>
                      <input
                        type="text"
                        value={d.alamat}
                        onChange={e => handleDataPihakChange(idx, "alamat", e.target.value)}
                        disabled={isAsesor || allSigned}
                        style={{ width: "100%", padding: "4px", border: "1px solid #ccc", fontSize: "12px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px" }}>Telepon:</label>
                      <input
                        type="text"
                        value={d.telepon}
                        onChange={e => handleDataPihakChange(idx, "telepon", e.target.value)}
                        disabled={isAsesor || allSigned}
                        style={{ width: "100%", padding: "4px", border: "1px solid #ccc", fontSize: "12px" }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pertanyaan Ya/Tidak */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "13px", background: "#fff", border: "2px solid #000" }}>
          <thead>
            <tr style={{ background: "#f0f0f0", fontWeight: "bold", textAlign: "center" }}>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Pertanyaan</th>
              <th style={{ width: "60px", border: "1px solid #000", padding: "6px" }}>Ya</th>
              <th style={{ width: "60px", border: "1px solid #000", padding: "6px" }}>Tidak</th>
            </tr>
          </thead>
          <tbody>
            {pertanyaanYaTidakList.map((p) => (
              <tr key={p.id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>- {p.pertanyaan}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox checked={p.ya} onChange={() => !isAsesor && handleYaChange(p.id, !p.ya)} disabled={true || allSigned} />
                </td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox checked={p.tidak} onChange={() => !isAsesor && handleTidakChange(p.id, !p.tidak)} disabled={true || allSigned} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Essay Questions */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "13px", background: "#fff", border: "2px solid #000" }}>
          <tbody>
            {essayList.map((e) => (
              <tr key={e.id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  <b>{e.pertanyaan}</b>
                  <textarea
                    value={e.jawaban}
                    onChange={(ev) => handleEssayChange(e.id, ev.target.value)}
                    disabled={isAsesor || allSigned}
                    style={{ width: "100%", minHeight: "60px", marginTop: "4px", padding: "4px", border: "1px solid #ccc" }}
                  />
                </td>
              </tr>
            ))}
            {additionalList.map((a) => (
              <tr key={a.id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  <b>{a.no}. {a.nama}</b>
                  <textarea
                    value={a.jawaban || ""}
                    onChange={(ev) => handleAdditionalChange(a.id, ev.target.value)}
                    disabled={isAsesor || allSigned}
                    style={{ width: "100%", minHeight: "60px", marginTop: "4px", padding: "4px", border: "1px solid #ccc" }}
                  />
                </td>
              </tr>
            ))}
            {/* Signature rows */}
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>
                <b>Tanda Tangan Asesor 1:</b> {barcodes?.asesor1?.url ? (
                  <span style={{ float: "right" }}>
                    <img src={barcodes.asesor1.url} alt="TTD" style={{ height: "40px" }} />
                    {barcodes.asesor1.tanggal && <span> {new Date(barcodes.asesor1.tanggal).toLocaleDateString("id-ID")}</span>}
                  </span>
                ) : <span style={{ float: "right" }}>Tanggal: </span>}
              </td>
            </tr>
            {asesorList.length > 1 && (
              <tr>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  <b>Tanda Tangan Asesor 2:</b> {barcodes?.asesor2?.url ? (
                    <span style={{ float: "right" }}>
                      <img src={barcodes.asesor2.url} alt="TTD" style={{ height: "40px" }} />
                      {barcodes.asesor2.tanggal && <span> {new Date(barcodes.asesor2.tanggal).toLocaleDateString("id-ID")}</span>}
                    </span>
                  ) : <span style={{ float: "right" }}>Tanggal: </span>}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ fontSize: "10px", marginTop: "10px", color: "#666" }}>
          *Diadopsi dari template yang disediakan di Departemen Pendidikan dan Pelatihan, Australia.
          <br />
          Merancang alat asesmen untuk hasil yang berkualitas di VET. 2008
        </div>

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
