import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/config/api"
import { Search, X } from "lucide-react"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface Jabatan {
  id_jabatan_kerja: string
  jabatan_kerja: string
}

const ITEMS_PER_PAGE = 20

export default function PreviewIndexPage() {
  const navigate = useNavigate()
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

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

  const filtered = useMemo(() => {
    if (!search.trim()) return jabatanList
    return jabatanList.filter((j) =>
      j.jabatan_kerja.toLowerCase().includes(search.toLowerCase())
    )
  }, [jabatanList, search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  if (loading) return <FullPageLoader text="Memuat daftar jabatan..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Preview Soal & Dokumen</h2>
        <p className="text-slate-600">Pilih jabatan untuk melihat preview dokumen asesmen</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Cari Jabatan Kerja / Skema Sertifikasi
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ketik nama jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List jabatan */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Search className="w-12 h-12 mb-3" />
          <p className="text-sm">Jabatan tidak ditemukan</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-slate-500 mb-1">
            Menampilkan {filtered.length} jabatan
          </div>

          <Card>
            <CardContent className="p-0">
              {paginated.map((j, i) => (
                <button
                  key={j.id_jabatan_kerja}
                  onClick={() => navigate(`${basePath}/preview/${j.id_jabatan_kerja}/apl01`)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-primary/5 border-b border-slate-100 last:border-0 text-slate-700 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  {j.jabatan_kerja}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="text-sm text-slate-500">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  &larr; Sebelumnya
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Smart page number logic: show pages around current page
                  let pageNum: number | null = null
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (i === 0) {
                    pageNum = 1
                  } else if (i === 6) {
                    pageNum = totalPages
                  } else if (page <= 4) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = page - 3 + i
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pageNum!)}
                      className={`w-8 h-8 text-sm rounded-md transition-colors ${
                        page === pageNum
                          ? "bg-primary text-white font-bold"
                          : "border border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  Selanjutnya &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
