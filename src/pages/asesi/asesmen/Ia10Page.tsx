import React, { useState, useEffect } from "react"
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

interface PertanyaanYaTidak {
  id: number
  pertanyaan: string
  ya: boolean
  tidak: boolean
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
  const [pertanyaanList, setPertanyaanList] = useState<PertanyaanYaTidak[]>([
    {
      id: 1,
      pertanyaan: "Apakah asesi bekerja dengan mempertimbangkan Kesehatan, Keamanan dan Keselamatan Kerja?",
      ya: false,
      tidak: false,
    },
    {
      id: 2,
      pertanyaan: "Apakah asesi berinteraksi dengan harmonis didalam kelompoknya?",
      ya: false,
      tidak: false,
    },
    {
      id: 3,
      pertanyaan: "Apakah asesi dapat mengelola tugas-tugas secara bersamaan?",
      ya: false,
      tidak: false,
    },
    {
      id: 4,
      pertanyaan: "Apakah asesi dapat dengan cepat beradaptasi dengan peralatan dan lingkungan yang baru?",
      ya: false,
      tidak: false,
    },
  ])

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false)
    }
  }, [authLoading])

  const handleYaChange = (id: number, checked: boolean) => {
    setPertanyaanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ya: checked, tidak: checked ? false : p.tidak } : p))
    )
  }

  const handleTidakChange = (id: number, checked: boolean) => {
    setPertanyaanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tidak: checked, ya: checked ? false : p.ya } : p))
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
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Nama Pengawas/penyelia/atasan/orang lain di perusahaan :</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Tempat kerja :</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Alamat :</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Telepon :</td></tr>
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
            {pertanyaanList.map((p) => (
              <tr key={p.id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>- {p.pertanyaan}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox
                    checked={p.ya}
                    onChange={(e) => handleYaChange(p.id, e.target.checked)}
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                  <CustomCheckbox
                    checked={p.tidak}
                    onChange={(e) => handleTidakChange(p.id, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            <b>
        {/* Essay Questions */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "13px", background: "#fff", border: "2px solid #000" }}>
          <tbody>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Apa hubungan Anda dengan asesi?</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Berapa lama Anda bekerja dengan asesi?</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Seberapa dekat Anda bekerja dengan asesi di area yang dinilai?</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Apa pengalaman teknis dan / atau kualifikasi Anda di bidang yang dinilai? (termasuk asesmen atau kualifikasi pelatihan)</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px" }}>Secara keseluruhan, apakah Anda yakin asesi melakukan sesuai standar yang diminta oleh unit kompetensi secara konsisten?</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px", height: "80px" }}>Identifikasi kebutuhan pelatihan lebih lanjut untuk asesi:</td></tr>
            <tr><td style={{ border: "1px solid #000", padding: "6px", height: "60px" }}>Ada komentar lain:</td></tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>
                Tanda tangan Asesor 1: <span style={{ float: "right" }}>Tanggal:</span>
                <div style={{ height: "60px" }}></div>
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}>
                Tanda tangan Asesor 2: <span style={{ float: "right" }}>Tanggal:</span>
                <div style={{ height: "60px" }}></div>
              </td>
            </tr>
          </tbody>
        </table></b>

        {/* Footer */}
        <div style={{ fontSize: "10px", marginTop: "10px", color: "#666" }}>
          *Diadopsi dari template yang disediakan di Departemen Pendidikan dan Pelatihan, Australia.
          <br />
          Merancang alat asesmen untuk hasil yang berkualitas di VET. 2008
        </div>

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
                const currentStepIndex = asesmenSteps.findIndex((s) => s.href.includes("ia10"))
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
