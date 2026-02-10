import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import { ToastProvider } from './contexts/ToastContext'
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
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DashboardLayout from './components/DashboardLayout'
import { Toaster } from './components/ui/toast'

// Admin LSP Pages
import DashboardAdminLSP from './pages/admin-lsp/DashboardAdminLSP'

// Direktur Pages
import TandatanganDirektur from './pages/direktur/TandatanganDirektur'
import SudahDitandatangani from './pages/direktur/SudahDitandatangani'
import BelumDitandatangani from './pages/direktur/BelumDitandatangani'

// Komtek Pages
import TandatanganKomtek from './pages/komtek/TandatanganKomtek'
import SudahDitandatanganiKomtek from './pages/komtek/SudahDitandatangani'
import BelumDitandatanganiKomtek from './pages/komtek/BelumDitandatangani'

// Manajer Pages
import DashboardManajer from './pages/manajer/DashboardManajer'

// Admin TUK Pages
import DashboardAdminTUK from './pages/admin-tuk/DashboardAdminTUK'
import ListAsesiAdminTUK from './pages/admin-tuk/ListAsesiAdminTUK'

// Asesor Pages
import DashboardAsesor from './pages/asesor/DashboardAsesor'
import ListAsesiAsesor from './pages/asesor/ListAsesiAsesor'
import AsesiPage from './pages/asesor/AsesiPage'

// Asesi Pages
import DashboardAsesiPage from './pages/asesi/DashboardAsesiPage'
import PraAsesmenPage from './pages/asesi/PraAsesmenPage'
import AsesmenPage from './pages/asesi/AsesmenPage'
import Ia04aPage from './pages/asesi/asesmen/Ia04aPage'
import UploadTugasPage from './pages/asesi/asesmen/UploadTugasPage'
import Ia04bPage from './pages/asesi/asesmen/Ia04bPage'
import Ia05Page from './pages/asesi/asesmen/Ia05Page'
import Ak02Page from './pages/asesi/asesmen/Ak02Page'
import Ak03Page from './pages/asesi/asesmen/Ak03Page'
import Ak06Page from './pages/asesi/asesmen/Ak06Page'
import AsesmenSelesaiPage from './pages/asesi/asesmen/AsesmenSelesaiPage'
import Apl01Page from './pages/asesi/Apl01Page'
import Apl02Page from './pages/asesi/Apl02Page'
import Apl02SuccessPage from './pages/asesi/Apl02SuccessPage'
import Ak01SuccessPage from './pages/asesi/Ak01SuccessPage'
import Mapa01Page from './pages/asesi/Mapa01Page'
import Mapa02Page from './pages/asesi/Mapa02Page'
import FrAk07Page from './pages/asesi/FrAk07Page'
import FrAk04Page from './pages/asesi/FrAk04Page'
import K3AsesmenPage from './pages/asesi/K3AsesmenPage'
import FrAk01Page from './pages/asesi/FrAk01Page'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
        <Toaster />
        <Router>
        <Routes>
          {/* Public Routes */}
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
                    <Route path="belum-ditandatangani" element={<BelumDitandatangani />} />
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
                    <Route path="belum-ditandatangani" element={<BelumDitandatanganiKomtek />} />
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
                    <Route path="asesi" element={<AsesiPage />} />
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
              <AsesorRoute>
                <Ak02Page />
              </AsesorRoute>
            }
          />
          <Route
            path="/asesi/asesmen/:id/ak03"
            element={
              <AsesorRoute>
                <Ak03Page />
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
      </Router>
      </ToastProvider>
    </ThemeProvider>
    </AuthProvider>
  )
}

export default App
