import { useState, useEffect } from "react"
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
import { WebcamModal } from "@/components/ui/WebcamModal"

interface Pertanyaan {
  id: number
  no: string
  pertanyaan: string
  kesimpulan: string
  k: boolean
  bk: boolean
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
  const { isAsesor } = useKegiatanByRole()

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
  const [isLoading, setIsLoading] = useState(true)
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([
    {
      id: 1,
      no: "1",
      pertanyaan:
        "Mengapa penting menerapkan ketentuan perencanaan sesuai prosedur, dan apa dampaknya jika diabaikan?",
      kesimpulan:
        "Penerapan ketentuan yang benar memastikan proses perencanaan berjalan efisien dan dapat dipertanggungjawabkan. Jika prosedur diabaikan maka dapat terjadi risiko kesalahan desain dan kegagalan struktur.",
      k: false,
      bk: false,
    },
  ])

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false)
    }
  }, [authLoading])

  const handleKChange = (id: number, checked: boolean) => {
    setPertanyaanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, k: checked, bk: checked ? false : p.bk } : p))
    )
  }

  const handleBKChange = (id: number, checked: boolean) => {
    setPertanyaanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bk: checked, k: checked ? false : p.k } : p))
    )
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
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>1</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Referensi Kerja</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>2</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Laporan Pekerjaan</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>3</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}>Dokumentasi Pekerjaan</td>
            </tr>
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
                <td style={{ border: "1px solid #000", padding: "6px" }}>{p.pertanyaan}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{p.kesimpulan}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox
                    checked={p.k}
                    onChange={() => handleKChange(p.id, !p.k)}
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox
                    checked={p.bk}
                    onChange={() => handleBKChange(p.id, !p.bk)}
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
              <td style={{ border: "1px solid #000", padding: "6px", height: "60px" }}></td>
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
              <td style={{ border: "1px solid #000", padding: "6px", height: "60px" }}></td>
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
                  <td style={{ border: "1px solid #000", padding: "6px", height: "60px" }}></td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ marginTop: "20px" }}>
          {/* Pernyataan Checkbox */}
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
                style={{ marginTop: "2px" }}
              />
              <span style={{ fontSize: "13px", color: "#333" }}>
                Saya menyatakan data ini telah diisi dengan benar.
              </span>
            </label>
          </div>

          <AsesorSignatureGuard
            missingAsesorLabels={[]}
            allAsesorSigned={true}
            isAsesor={isAsesor}
          />

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <ActionButton variant="secondary" onClick={() => navigate(-1)}>
              Kembali
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={!agreedChecklist}
              onClick={() => {
                const currentStepIndex = asesmenSteps.findIndex((s) => s.href.includes("ia09"))
                const nextStep = asesmenSteps[currentStepIndex + 1]
                if (nextStep) {
                  const nextPath = nextStep.href.replace("/asesi/asesmen/", `/asesi/asesmen/${id}/`)
                  navigate(nextPath)
                }
              }}
            >
              Lanjut
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
