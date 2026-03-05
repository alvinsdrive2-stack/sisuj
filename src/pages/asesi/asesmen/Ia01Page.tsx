import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"
import { WebcamModal } from "@/components/ui/WebcamModal"

export default function Ia01Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { jabatanKerja, nomorSkema, namaAsesor: _namaAsesor, tuk, asesorList, namaAsesi } = useDataDokumenAsesmen(id)
  const { role: asesorRole, isAsesor1 } = useAsesorRole(id)
  const { showSuccess, showWarning } = useToast()
  const { kegiatan, isAsesor } = useKegiatanByRole()

  const [isLoading, setIsLoading] = useState(true)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const jenjangId = kegiatan?.jenjang_id || "0"

  // Absen check - auto-detect role
  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'asesmen',
    role: 'auto',
    checkOnMount: true,
    idIzin: id,
    asesorList
  })

  // Get dynamic steps based on jenjang and asesor role
  const asesmenSteps = getAsesmenSteps(jenjangId, isAsesor, asesorRole, asesorList.length)

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return

      if (!id) {
        console.error("No id_izin found in user data")
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia01`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          console.log("IA01 data:", result)
        }
      } catch (error) {
        console.error("Error fetching IA01:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, authLoading, user, asesorList])

  const handleNext = async () => {
    if (!agreedChecklist) {
      showWarning('Silakan centang pernyataan terlebih dahulu')
      return
    }

    // Generate QR if needed
    const jadwalId = kegiatan?.jadwal_id
    const token = localStorage.getItem("access_token")

    if (jadwalId) {
      try {
        const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${id}/ia01`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_jadwal: jadwalId
          })
        })

        if (qrResponse.ok) {
          console.log("QR IA01 generated")
        }
      } catch (qrError) {
        console.error('Error generating QR:', qrError)
      }
    }

    showSuccess('IA.01 berhasil disimpan!')
    setTimeout(() => {
      navigate(`/asesi/asesmen/${id}/ia02`)
    }, 500)
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data IA.01..." />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>IA.01</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={1} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', letterSpacing: '1px' }}>
            FR.IA.01. FORMULIR ASESMEN MANDIRI
          </h1>
        </div>

        {/* Placeholder Content */}
        <div style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
            Halaman ini sedang dalam pengembangan
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Formulir IA.01 akan ditampilkan di sini
          </p>
        </div>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa saya telah memahami instruksi tugas terstruktur dan akan menyelesaikan tugas tersebut sesuai dengan ketentuan yang berlaku.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={() => navigate("/asesi/dashboard")}>
              Kembali
            </ActionButton>
            <ActionButton variant="primary" disabled={!agreedChecklist} onClick={handleNext}>
              Lanjut
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>

      {/* Absen Awal Modal */}
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
