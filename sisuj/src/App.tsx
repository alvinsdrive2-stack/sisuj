import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import { ToastProvider } from './contexts/ToastContext'
import { DokumenModalProvider, useDokumenModal } from './contexts/DokumenModalContext'
import { DaftarHadirModalProvider, useDaftarHadirModal } from './contexts/DaftarHadirModalContext'
import ProtectedRoute from './components/ProtectedRoute'
import {
  AdminLSPRoute,
  AdminTUKRoute,
  AsesorRoute,
  AsesiRoute,
  KomtekRoute,
  DirekturLSPRoute,
  ManajerSertifikasiRoute,
  AsesiOrAsesorRoute,
} from './components/RoleRoute'
import PublicRoute from './components/PublicRoute'
import DefaultRoute from './components/DefaultRoute'
import DokumenFullscreenModal from './components/komtek/DokumenFullscreenModal'
import { DaftarHadirModal } from './components/admin-tuk/DaftarHadirModal'
import { KegiatanModal } from './components/admin-tuk/KegiatanModal'
import DashboardLayout from './components/DashboardLayout'
import { Toaster } from './components/ui/toast'
import { FullPageLoader } from './components/ui/loading-spinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// Route-level code splitting — each page loads only when navigated to
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CapturePage = lazy(() => import('./pages/CapturePage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))

// Admin LSP Pages
const DashboardAdminLSP = lazy(() => import('./pages/admin-lsp/DashboardAdminLSP'))

// Direktur Pages
const TandatanganDirektur = lazy(() => import('./pages/direktur/TandatanganDirektur'))
const SudahDitandatangani = lazy(() => import('./pages/direktur/SudahDitandatangani'))
const DetailDokumenDirekturPage = lazy(() => import('./pages/direktur/DetailDokumenDirekturPage'))
const BelumDitandatangani = lazy(() => import('./pages/direktur/BelumDitandatangani'))

// Komtek Pages
const TandatanganKomtek = lazy(() => import('./pages/komtek/TandatanganKomtek'))
const SudahDitandatanganiKomtek = lazy(() => import('./pages/komtek/SudahDitandatangani'))
const BelumDitandatanganiKomtek = lazy(() => import('./pages/komtek/BelumDitandatangani'))
const DaftarAsesiPage = lazy(() => import('./pages/komtek/DaftarAsesiPage'))
const DaftarAsesiSudahPage = lazy(() => import('./pages/komtek/DaftarAsesiSudahPage'))
const EditJadwalPage = lazy(() => import('./pages/komtek/EditJadwalPage'))

// Manajer Pages
const DashboardManajer = lazy(() => import('./pages/manajer/DashboardManajer'))

// Admin TUK Pages
const DashboardAdminTUK = lazy(() => import('./pages/admin-tuk/DashboardAdminTUK'))
const ListAsesiAdminTUK = lazy(() => import('./pages/admin-tuk/ListAsesiAdminTUK'))

// Asesor Pages
const DashboardAsesor = lazy(() => import('./pages/asesor/DashboardAsesor'))
const ListAsesiAsesor = lazy(() => import('./pages/asesor/ListAsesiAsesor'))
const AsesiPage = lazy(() => import('./pages/asesor/AsesiPage'))

// Asesi Pages
const DashboardAsesiPage = lazy(() => import('./pages/asesi/DashboardAsesiPage'))
const PraAsesmenPage = lazy(() => import('./pages/asesi/PraAsesmenPage'))
const AsesmenPage = lazy(() => import('./pages/asesi/AsesmenPage'))
const Ia01Page = lazy(() => import('./pages/asesi/asesmen/Ia01Page'))
const Ia02Page = lazy(() => import('./pages/asesi/asesmen/Ia02Page'))
const Ia03Page = lazy(() => import('./pages/asesi/asesmen/Ia03Page'))
const Ia04aPage = lazy(() => import('./pages/asesi/asesmen/Ia04aPage'))
const UploadTugasPage = lazy(() => import('./pages/asesi/asesmen/UploadTugasPage'))
const Ia04bPage = lazy(() => import('./pages/asesi/asesmen/Ia04bPage'))
const Ia05Page = lazy(() => import('./pages/asesi/asesmen/Ia05Page'))
const Ia08Page = lazy(() => import('./pages/asesi/asesmen/Ia08Page'))
const Ia09Page = lazy(() => import('./pages/asesi/asesmen/Ia09Page'))
const Ia10Page = lazy(() => import('./pages/asesi/asesmen/Ia10Page'))
const UjianPage = lazy(() => import('./pages/asesi/asesmen/UjianPage'))
const Ak02Page = lazy(() => import('./pages/asesi/asesmen/Ak02Page'))
const Ak03Page = lazy(() => import('./pages/asesi/asesmen/Ak03Page'))
const Ak05Page = lazy(() => import('./pages/asesi/asesmen/Ak05Page'))
const Ak06Page = lazy(() => import('./pages/asesi/asesmen/Ak06Page'))
const AsesmenSelesaiPage = lazy(() => import('./pages/asesi/asesmen/AsesmenSelesaiPage'))
const Apl01Page = lazy(() => import('./pages/asesi/Apl01Page'))
const Apl02Page = lazy(() => import('./pages/asesi/Apl02Page'))
const Apl02SuccessPage = lazy(() => import('./pages/asesi/Apl02SuccessPage'))
const Ak01SuccessPage = lazy(() => import('./pages/asesi/Ak01SuccessPage'))
const Mapa01Page = lazy(() => import('./pages/asesi/Mapa01Page'))
const Mapa02Page = lazy(() => import('./pages/asesi/Mapa02Page'))
const FrAk07Page = lazy(() => import('./pages/asesi/FrAk07Page'))
const FrAk04Page = lazy(() => import('./pages/asesi/FrAk04Page'))
const K3AsesmenPage = lazy(() => import('./pages/asesi/K3AsesmenPage'))
const FrAk01Page = lazy(() => import('./pages/asesi/FrAk01Page'))

// Catch chunk load failures (lazy import network errors) and reload
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || ''
  if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed')) {
    window.location.reload()
  }
})

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
        <DokumenModalProvider>
        <DaftarHadirModalProvider>
        <Toaster />
        <Router>
        <ErrorBoundary>
        <Suspense fallback={<FullPageLoader text="Memuat..." />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Admin LSP */}
          <Route
            path="/admin-lsp/*"
            element={
              <AdminLSPRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardAdminLSP />} />
                    <Route path="reports" element={<div className="p-4"><h2 className="text-xl font-bold">Laporan Sertifikasi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="users" element={<div className="p-4"><h2 className="text-xl font-bold">Manajemen User</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="settings" element={<div className="p-4"><h2 className="text-xl font-bold">Pengaturan</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </AdminLSPRoute>
            }
          />

          {/* Protected Routes - Direktur */}
          <Route
            path="/direktur/*"
            element={
              <DirekturLSPRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="tandatangan" element={<TandatanganDirektur />} />
                    <Route path="sudah-ditandatangani" element={<SudahDitandatangani />} />
                    <Route path="sudah-ditandatangani/:id" element={<DetailDokumenDirekturPage />} />
                    <Route path="belum-ditandatangani" element={<BelumDitandatangani />} />
                    <Route path="belum-ditandatangani/:id" element={<DetailDokumenDirekturPage />} />
                    <Route path="" element={<Navigate to="tandatangan" replace />} />
                  </Routes>
                </DashboardLayout>
              </DirekturLSPRoute>
            }
          />

          {/* Protected Routes - Komtek */}
          <Route
            path="/komtek/*"
            element={
              <KomtekRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="tandatangan" element={<TandatanganKomtek />} />
                    <Route path="sudah-ditandatangani" element={<SudahDitandatanganiKomtek />} />
                    <Route path="sudah-ditandatangani/:jadwalId" element={<DaftarAsesiSudahPage />} />
                    <Route path="belum-ditandatangani" element={<BelumDitandatanganiKomtek />} />
                    <Route path="belum-ditandatangani/:jadwalId" element={<DaftarAsesiPage />} />
                    <Route path="edit-jadwal/:jadwalId" element={<EditJadwalPage />} />
                    <Route path="" element={<Navigate to="tandatangan" replace />} />
                  </Routes>
                </DashboardLayout>
              </KomtekRoute>
            }
          />

          {/* Protected Routes - Manajer Sertifikasi */}
          <Route
            path="/manajer/*"
            element={
              <ManajerSertifikasiRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardManajer />} />
                    <Route path="monitoring" element={<div className="p-4"><h2 className="text-xl font-bold">Monitoring Sertifikasi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="asesi" element={<div className="p-4"><h2 className="text-xl font-bold">Daftar Asesi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ManajerSertifikasiRoute>
            }
          />

          {/* Protected Routes - Admin TUK */}
          <Route
            path="/admin-tuk/*"
            element={
              <AdminTUKRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardAdminTUK />} />
                    <Route path="list-asesi/:jadwalId" element={<ListAsesiAdminTUK />} />
                    <Route path="verification" element={<div className="p-4"><h2 className="text-xl font-bold">Verifikasi Asesi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="activity" element={<div className="p-4"><h2 className="text-xl font-bold">Kegiatan</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="schedule" element={<div className="p-4"><h2 className="text-xl font-bold">Jadwal Asesmen</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </AdminTUKRoute>
            }
          />

          {/* Protected Routes - Asesor */}
          <Route
            path="/asesor/*"
            element={
              <AsesorRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardAsesor />} />
                    <Route path="list-asesi/:jadwalId" element={<ListAsesiAsesor />} />
                    <Route path="schedule" element={<div className="p-4"><h2 className="text-xl font-bold">Jadwal Asesmen</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="assessment" element={<div className="p-4"><h2 className="text-xl font-bold">Penilaian</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="asesi/:jadwalId" element={<AsesiPage />} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </AsesorRoute>
            }
          />

          {/* Protected Routes - Asesi */}
          <Route
            path="/asesi/dashboard"
            element={
              <AsesiRoute>
                <DashboardAsesiPage />
              </AsesiRoute>
            }
          />
          <Route
            path="/asesi/praasesmen"
            element={
              <AsesiOrAsesorRoute>
                <PraAsesmenPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/apl01"
            element={
              <AsesiOrAsesorRoute>
                <Apl01Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/apl02"
            element={
              <AsesiOrAsesorRoute>
                <Apl02Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/apl02/success"
            element={
              <AsesiOrAsesorRoute>
                <Apl02SuccessPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/mapa01"
            element={
              <AsesiOrAsesorRoute>
                <Mapa01Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/mapa02"
            element={
              <AsesiOrAsesorRoute>
                <Mapa02Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/fr-ak-07"
            element={
              <AsesiOrAsesorRoute>
                <FrAk07Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/fr-ak-04"
            element={
              <AsesiOrAsesorRoute>
                <FrAk04Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/k3-asesmen"
            element={
              <AsesiOrAsesorRoute>
                <K3AsesmenPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/:idIzin/fr-ak-01"
            element={
              <AsesiOrAsesorRoute>
                <FrAk01Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/praasesmen/ak01-success"
            element={
              <AsesiOrAsesorRoute>
                <Ak01SuccessPage />
              </AsesiOrAsesorRoute>
            }
          />

          {/* Asesmen Routes */}
          <Route
            path="/asesi/asesmen"
            element={
              <AsesiOrAsesorRoute>
                <AsesmenPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia01"
            element={
              <AsesiOrAsesorRoute>
                <Ia01Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia02"
            element={
              <AsesiOrAsesorRoute>
                <Ia02Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia03"
            element={
              <AsesiOrAsesorRoute>
                <Ia03Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia04a"
            element={
              <AsesiOrAsesorRoute>
                <Ia04aPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/upload-tugas"
            element={
              <AsesiOrAsesorRoute>
                <UploadTugasPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia04b"
            element={
              <AsesiOrAsesorRoute>
                <Ia04bPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/uji"
            element={
              <AsesiRoute>
                <UjianPage />
              </AsesiRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia05"
            element={
              <AsesiOrAsesorRoute>
                <Ia05Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ak02"
            element={
              <AsesiOrAsesorRoute>
                <Ak02Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ak03"
            element={
              <AsesiOrAsesorRoute>
                <Ak03Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ak05"
            element={
              <AsesorRoute>
                <Ak05Page />
              </AsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ak06"
            element={
              <AsesorRoute>
                <Ak06Page />
              </AsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia08"
            element={
              <AsesiOrAsesorRoute>
                <Ia08Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia09"
            element={
              <AsesiOrAsesorRoute>
                <Ia09Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ia10"
            element={
              <AsesiOrAsesorRoute>
                <Ia10Page />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/selesai"
            element={
              <AsesiOrAsesorRoute>
                <AsesmenSelesaiPage />
              </AsesiOrAsesorRoute>
            }
          />
          <Route
            path="/asesi/*"
            element={
              <AsesiRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="profile" element={<div className="p-4"><h2 className="text-xl font-bold">Profil Saya</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="assessment" element={<div className="p-4"><h2 className="text-xl font-bold">Sertifikasi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="documents" element={<div className="p-4"><h2 className="text-xl font-bold">Dokumen</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </AsesiRoute>
            }
          />

          {/* Legacy Dashboard Route - Redirects based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<DefaultRoute />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </Router>
      <GlobalDokumenFullscreenModal />
      <GlobalDaftarHadirModal />
      </DaftarHadirModalProvider>
      </DokumenModalProvider>
      </ToastProvider>
    </ThemeProvider>
    </AuthProvider>
  )
}

function GlobalDokumenFullscreenModal() {
  const { isOpen, closeModal, asesiId, asesiNama, onPenilaianSuccess, readOnly } = useDokumenModal()
  return (
    <DokumenFullscreenModal
      isOpen={isOpen}
      onClose={closeModal}
      asesiId={asesiId}
      asesiNama={asesiNama}
      onPenilaianSuccess={onPenilaianSuccess || undefined}
      readOnly={readOnly}
    />
  )
}

function GlobalDaftarHadirModal() {
  const { isOpen, mode, personType, personId, personName, jadwalId, closeModal, isKegiatanModalOpen, kegiatanModalType, kegiatanModalJadwalId, closeKegiatanModal } = useDaftarHadirModal()
  return (
    <>
      <DaftarHadirModal
        isOpen={isOpen}
        mode={mode}
        personType={personType}
        personId={personId}
        personName={personName}
        jadwalId={jadwalId}
        onClose={closeModal}
      />
      <KegiatanModal
        isOpen={isKegiatanModalOpen}
        type={kegiatanModalType}
        jadwalId={kegiatanModalJadwalId}
        onClose={closeKegiatanModal}
      />
    </>
  )
}

export default App
