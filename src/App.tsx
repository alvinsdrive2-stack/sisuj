import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import ProtectedRoute from './components/ProtectedRoute'
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

// Asesi Pages
import DashboardAsesiPage from './pages/asesi/DashboardAsesiPage'
import PraAsesmenPage from './pages/asesi/PraAsesmenPage'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster />
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Admin LSP */}
          <Route
            path="/admin-lsp/*"
            element={
              <ProtectedRoute requiredPermissions={["view_all_assessment_status"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardAdminLSP />} />
                    <Route path="reports" element={<div className="p-4"><h2 className="text-xl font-bold">Laporan Sertifikasi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="users" element={<div className="p-4"><h2 className="text-xl font-bold">Manajemen User</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="settings" element={<div className="p-4"><h2 className="text-xl font-bold">Pengaturan</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Direktur */}
          <Route
            path="/direktur/*"
            element={
              <ProtectedRoute requiredPermissions={["sign_document"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="tandatangan" element={<TandatanganDirektur />} />
                    <Route path="sudah-ditandatangani" element={<SudahDitandatangani />} />
                    <Route path="belum-ditandatangani" element={<BelumDitandatangani />} />
                    <Route path="" element={<Navigate to="tandatangan" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Komtek */}
          <Route
            path="/komtek/*"
            element={
              <ProtectedRoute requiredPermissions={["sign_document"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="tandatangan" element={<TandatanganKomtek />} />
                    <Route path="sudah-ditandatangani" element={<SudahDitandatanganiKomtek />} />
                    <Route path="belum-ditandatangani" element={<BelumDitandatanganiKomtek />} />
                    <Route path="" element={<Navigate to="tandatangan" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Manajer Sertifikasi */}
          <Route
            path="/manajer/*"
            element={
              <ProtectedRoute requiredPermissions={["monitor_assessment"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardManajer />} />
                    <Route path="monitoring" element={<div className="p-4"><h2 className="text-xl font-bold">Monitoring Sertifikasi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="asesi" element={<div className="p-4"><h2 className="text-xl font-bold">Daftar Asesi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin TUK */}
          <Route
            path="/admin-tuk/*"
            element={
              <ProtectedRoute requiredPermissions={["verify_personal_documents"]}>
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
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Asesor */}
          <Route
            path="/asesor/*"
            element={
              <ProtectedRoute requiredPermissions={["view_assigned_assesi"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardAsesor />} />
                    <Route path="list-asesi/:jadwalId" element={<ListAsesiAsesor />} />
                    <Route path="schedule" element={<div className="p-4"><h2 className="text-xl font-bold">Jadwal Asesmen</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="assessment" element={<div className="p-4"><h2 className="text-xl font-bold">Penilaian</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="asesi" element={<div className="p-4"><h2 className="text-xl font-bold">Daftar Asesi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Asesi */}
          <Route
            path="/asesi/dashboard"
            element={
              <ProtectedRoute requiredPermissions={["confirm_personal_data"]}>
                <DashboardAsesiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asesi/praasesmen"
            element={
              <ProtectedRoute requiredPermissions={["confirm_personal_data"]}>
                <PraAsesmenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asesi/*"
            element={
              <ProtectedRoute requiredPermissions={["confirm_personal_data"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="profile" element={<div className="p-4"><h2 className="text-xl font-bold">Profil Saya</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="assessment" element={<div className="p-4"><h2 className="text-xl font-bold">Sertifikasi</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="documents" element={<div className="p-4"><h2 className="text-xl font-bold">Dokumen</h2><p className="text-slate-600">Coming soon...</p></div>} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
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
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
    </AuthProvider>
  )
}

export default App
