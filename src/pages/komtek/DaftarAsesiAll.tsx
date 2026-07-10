import { Fragment, useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { Pagination } from "@/components/ui/Pagination"
import { API_BASE_URL } from "@/config/api"
import { Search, Users, ChevronDown, ChevronRight, ExternalLink, FileText, Download } from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"

interface AsesiItem {
  id_izin: string
  nama: string
  jadwal_id: string
  tanggal_uji: string
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface DokumenData {
  [key: string]: string | null
}

const DOC_LABELS: Record<string, string> = {
  apl01: "FR-APL-01",
  apl02: "FR-APL-02",
  mapa01: "FR-MAPA-01",
  mapa02: "FR-MAPA-02",
  ak01: "FR-AK-01",
  ak02: "FR-AK-02",
  ak03: "FR-AK-03",
  ak04: "FR-AK-04",
  ak05: "FR-AK-05",
  ak06: "FR-AK-06",
  ak07: "FR-AK-07",
  ia01: "FR-IA-01",
  ia02: "FR-IA-02",
  ia03: "FR-IA-03",
  ia04a: "FR-IA-04A",
  ia04b: "FR-IA-04B",
  ia05: "FR-IA-05",
  ia08: "FR-IA-08",
  ia09: "FR-IA-09",
  ia10: "FR-IA-10",
  tugas: "Tugas",
  foto_kegiatan: "Foto Kegiatan",
  k3: "K3",
  pernyataan: "Pernyataan",
  // Extra docs
  foto_foto_bersama: "Foto Bersama",
  foto_ttd_asesi_asesmen: "TTD Asesi (Asesmen)",
  foto_ttd_asesi_pra: "TTD Asesi (Pra)",
  foto_ttd_asesor_asesmen: "TTD Asesor (Asesmen)",
  foto_ttd_asesor_pra: "TTD Asesor (Pra)",
  surat_verifikasi_tuk: "Surat Verifikasi TUK",
  spt_asesor: "SPT Asesor",
  spt_komtek: "SPT Komtek",
  sk_komtek: "SK Komtek",
  sk_pelaksanaan_uji: "SK Pelaksanaan Uji",
  sk_penetapan: "SK Penetapan",
  sk_direktur: "SK Direktur",
  ba_komtek: "BA Komtek",
}

const DOC_GROUPS: { title: string; keys: string[] }[] = [
  { title: "Pra Asesmen", keys: ["apl01", "apl02", "mapa01", "mapa02", "ak07", "ak04", "k3"] },
  { title: "Perjanjian Asesmen", keys: ["ak01"] },
  { title: "Asesmen", keys: ["ia01", "ia02", "ia03", "ia04a", "ia04b", "ia05", "ia08", "ia09", "ia10", "ak02", "ak03", "ak05", "ak06", "tugas", "foto_kegiatan", "pernyataan"] },
  { title: "Foto Dokumentasi", keys: ["foto_foto_bersama", "foto_ttd_asesi_asesmen", "foto_ttd_asesi_pra", "foto_ttd_asesor_asesmen", "foto_ttd_asesor_pra"] },
  { title: "Surat Verifikasi TUK", keys: ["surat_verifikasi_tuk"] },
  { title: "SPT", keys: ["spt_asesor", "spt_komtek"] },
  { title: "SK", keys: ["sk_komtek", "sk_pelaksanaan_uji", "sk_penetapan", "sk_direktur"] },
  { title: "BA", keys: ["ba_komtek"] },
]

export default function DaftarAsesiAll() {
  const [data, setData] = useState<AsesiItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Expand & dokumen
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dokumenCache, setDokumenCache] = useState<Record<string, DokumenData>>({})
  const [loadingDocs, setLoadingDocs] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("per_page", "20")
      if (search) params.set("search", search)

      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/dokumen-asesi?${params}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      setData(json.data.data || [])
      setPagination({
        current_page: json.data.current_page,
        last_page: json.data.last_page,
        per_page: json.data.per_page,
        total: json.data.total,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  useEffect(() => {
    setPage(1)
  }, [search])

  // Reset expanded & cache when list changes
  useEffect(() => {
    setExpandedId(null)
    setDokumenCache({})
  }, [data])

  const fetchDokumen = useCallback(async (idIzin: string) => {
    if (dokumenCache[idIzin]) return

    setLoadingDocs(idIzin)
    try {
      const t = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/dokumen/asesi/${idIzin}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${t}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setDokumenCache((prev) => ({ ...prev, [idIzin]: json.data || {} }))
    } catch {
      setDokumenCache((prev) => ({ ...prev, [idIzin]: {} }))
    } finally {
      setLoadingDocs(null)
    }
  }, [dokumenCache])

  const toggleExpand = (idIzin: string) => {
    if (expandedId === idIzin) {
      setExpandedId(null)
    } else {
      setExpandedId(idIzin)
      fetchDokumen(idIzin)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleDownloadAllDocs = (idIzin: string) => {
    const token = localStorage.getItem("access_token")
    const url = `${API_BASE_URL}/dokumen/asesi/${idIzin}/download`
    const a = document.createElement("a")
    a.href = url
    a.target = "_blank"
    a.rel = "noopener"
    // fetch with auth header so backend gets the token
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const objUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objUrl
        link.download = `Dokumen_${idIzin}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(objUrl)
      })
      .catch(() => window.open(url, "_blank"))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Daftar Asesi</h2>
        <p className="text-slate-600">Seluruh data asesi dari semua kegiatan</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama asesi..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Memuat..." : "Cari"}
        </button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Data Asesi
            {isLoading && <SimpleSpinner size="sm" className="ml-2" />}
            {!isLoading && <span className="text-sm font-normal text-slate-500">({pagination.total} asesi)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <ErrorState
              title="Gagal memuat data"
              message={error}
              onRetry={() => window.location.reload()}
            />
          )}

          {!isLoading && !error && data.length === 0 && (
            <EmptyState
              icon={Users}
              title="Tidak ada data asesi"
              message="Coba ubah filter pencarian"
            />
          )}

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="w-10 py-3 px-3" />
                  <th className="w-8 text-left py-3 px-3 font-semibold text-slate-600">No</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-600">Nama</th>
                  <th className="hidden lg:table-cell text-left py-3 px-3 font-semibold text-slate-600">ID Izin</th>
                  <th className="w-20 text-left py-3 px-3 font-semibold text-slate-600">Jadwal ID</th>
                  <th className="w-36 text-left py-3 px-3 font-semibold text-slate-600">Tanggal Uji</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const rowNum = (pagination.current_page - 1) * pagination.per_page + idx + 1
                  const isExpanded = expandedId === item.id_izin
                  const docs = isExpanded ? dokumenCache[item.id_izin] : null
                  const isLoadingThis = loadingDocs === item.id_izin
                  const hasDocs = docs && Object.values(docs).some((v) => v !== null)

                  return (
                    <Fragment key={item.id_izin}>
                      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3">
                          <button
                            onClick={() => toggleExpand(item.id_izin)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-slate-500">{rowNum}</td>
                        <td className="py-2 px-3 font-medium text-slate-800 truncate">{item.nama}</td>
                        <td className="hidden lg:table-cell py-2 px-3">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{item.id_izin}</code>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{item.jadwal_id}</td>
                        <td className="py-2 px-3 text-slate-600 text-right">
                          <span className="block text-xs leading-tight">{formatDate(item.tanggal_uji)}</span>
                          <span className="block text-[11px] text-slate-400 leading-tight">{formatTime(item.tanggal_uji)}</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id_izin}-expanded`} className="border-b border-slate-100 bg-slate-50">
                          <td colSpan={6} className="py-2 px-3">
                            <div className="ml-9">
                              {isLoadingThis && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 py-1">
                                  <SimpleSpinner size="sm" />
                                  Memuat dokumen...
                                </div>
                              )}
                              {!isLoadingThis && docs && !hasDocs && (
                                <p className="text-sm text-slate-400 py-1">Tidak ada dokumen</p>
                              )}
                              {!isLoadingThis && docs && hasDocs && (
                                <div className="space-y-3">
                                  {DOC_GROUPS.map((group) => {
                                    const groupDocs = group.keys
                                      .map((key) => ({ key, label: DOC_LABELS[key] || key.toUpperCase(), url: docs[key] }))
                                      .filter((d) => d.url !== null)

                                    if (groupDocs.length === 0) return null

                                    return (
                                      <div key={group.title}>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{group.title}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {groupDocs.map((doc) => (
                                            <a
                                              key={doc.key}
                                              href={doc.url!}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-200 rounded-md text-xs text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                            >
                                              <FileText className="w-3 h-3 flex-shrink-0" />
                                              {doc.label}
                                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-blue-400" />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  })}
                                  <button
                                    onClick={() => handleDownloadAllDocs(item.id_izin)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download All
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {data.map((item, idx) => {
              const rowNum = (pagination.current_page - 1) * pagination.per_page + idx + 1
              const isExpanded = expandedId === item.id_izin
              const docs = dokumenCache[item.id_izin]
              const hasDocs = docs && Object.values(docs).some((v) => v !== null)
              const isLoadingThis = loadingDocs === item.id_izin

              return (
                <div key={item.id_izin} className="border border-slate-200 rounded-lg">
                  <button
                    onClick={() => toggleExpand(item.id_izin)}
                    className="w-full text-left p-4 space-y-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-slate-400">#{rowNum}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{item.jadwal_id}</Badge>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                      </div>
                    </div>
                    <p className="font-medium text-slate-800">{item.nama}</p>
                    <code className="block text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{item.id_izin}</code>
                    <p className="text-xs text-slate-500">{formatDate(item.tanggal_uji)} • {formatTime(item.tanggal_uji)}</p>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      {isLoadingThis && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                          <SimpleSpinner size="sm" />
                          Memuat dokumen...
                        </div>
                      )}

                      {!isLoadingThis && docs && !hasDocs && (
                        <p className="text-sm text-slate-400 py-2">Tidak ada dokumen</p>
                      )}

                      {!isLoadingThis && docs && hasDocs && (
                        <div className="space-y-3">
                          {DOC_GROUPS.map((group) => {
                            const groupDocs = group.keys
                              .map((key) => ({ key, label: DOC_LABELS[key] || key.toUpperCase(), url: docs[key] }))
                              .filter((d) => d.url !== null)

                            if (groupDocs.length === 0) return null

                            return (
                              <div key={group.title}>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{group.title}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {groupDocs.map((doc) => (
                                    <a
                                      key={doc.key}
                                      href={doc.url!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-200 rounded-md text-xs text-blue-600 hover:bg-blue-50"
                                    >
                                      <FileText className="w-3 h-3 flex-shrink-0" />
                                      {doc.label}
                                      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-blue-400" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                          {hasDocs && (
                            <button
                              onClick={() => handleDownloadAllDocs(item.id_izin)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download All
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Pagination
            page={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
