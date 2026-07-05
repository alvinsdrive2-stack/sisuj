import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/config/api"
import { Search, Eye } from "lucide-react"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface Jabatan {
  id_jabatan_kerja: string
  jabatan_kerja: string
}

export default function PreviewIndexPage() {
  const navigate = useNavigate()
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const isAdminLsp = window.location.pathname.startsWith('/admin-lsp')
  const basePath = isAdminLsp ? '/admin-lsp' : '/superadmin'

  useEffect(() => {
    const fetchJabatan = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const res = await fetch(`${API_BASE_URL}/jabatan-kerja?all=true`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const json = await res.json()
        if (json.status === "success") {
          setJabatanList(json.data || [])
        }
      } catch (err) {
        console.error("Gagal fetch jabatan:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchJabatan()
  }, [])

  const filtered = jabatanList.filter((j) =>
    j.jabatan_kerja.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <FullPageLoader text="Memuat daftar jabatan..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Preview Soal & Dokumen</h2>
        <p className="text-slate-600">Cari jabatan untuk melihat preview dokumen asesmen</p>
      </div>

      {/* Search Jabatan */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Pilih Jabatan Kerja / Skema Sertifikasi
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {search && filtered.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
              {filtered.map((j) => (
                <button
                  key={j.id_jabatan_kerja}
                  onClick={() => navigate(`${basePath}/preview/${j.id_jabatan_kerja}/apl01`)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 border-b border-slate-100 last:border-0 text-slate-700 transition-colors"
                >
                  {j.jabatan_kerja}
                </button>
              ))}
            </div>
          )}
          {search && filtered.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">Jabatan tidak ditemukan</p>
          )}
        </CardContent>
      </Card>

      {!search && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Eye className="w-12 h-12 mb-3" />
          <p className="text-sm">Cari jabatan untuk mulai preview dokumen</p>
        </div>
      )}
    </div>
  )
}
