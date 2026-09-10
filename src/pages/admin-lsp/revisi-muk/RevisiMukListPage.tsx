import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePenLine, Info, Search, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FullPageLoader } from '@/components/ui/loading-spinner'
import { API_BASE_URL } from '@/config/api'
import { apiFetch } from '@/lib/api-fetch'

interface IdIzinRow {
  id_izin: string
  nama: string
  jadwal_id: string
  tanggal_uji?: string | null
}

/** Laravel paginator terbungkus: { message, data: { current_page, data, last_page, per_page, total } } */
interface IdIzinPaginator {
  current_page: number
  data: IdIzinRow[]
  last_page: number
  per_page: number
  total: number
}

const PER_PAGE = 20

function fmtTanggalUji(value?: string | null): string {
  if (!value) return '-'
  const d = value.slice(0, 10).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : value
}

export default function RevisiMukListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<IdIzinRow[]>([])
  const [paginator, setPaginator] = useState<IdIzinPaginator | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Debounce search 300ms + reset ke halaman 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(PER_PAGE),
          sort_by: 'jadwals.tanggal_uji',
          sort_order: 'desc',
        })
        if (debouncedSearch) params.set('search', debouncedSearch)
        const res = await apiFetch(`${API_BASE_URL}/asesi-jadwal/id-izins?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`)
        const p: IdIzinPaginator | undefined = json?.data
        if (!alive) return
        setPaginator(p ?? null)
        setRows(p?.data ?? [])
      } catch (err) {
        if (!alive) return
        setPaginator(null)
        setRows([])
        setError(err instanceof Error ? err.message : 'Gagal memuat data')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [debouncedSearch, page, reloadKey])

  if (loading && rows.length === 0 && !error) {
    return <FullPageLoader text="Memuat daftar asesi..." />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Revisi MUK</h2>
        <p className="text-slate-600">
          Lihat dan perbaiki jawaban dokumen MUK per asesi — perubahan otomatis tampil di PDF dinamis
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Cari Nama / ID Izin / ID BNSP
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ketik nama asesi, id izin, atau id BNSP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState
          message="Gagal memuat daftar asesi. Periksa koneksi Anda, lalu coba lagi."
          error={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada data"
          message={
            debouncedSearch
              ? `Tidak ada asesi yang cocok dengan pencarian "${debouncedSearch}".`
              : 'Belum ada data asesi-jadwal yang tersedia.'
          }
        />
      ) : (
        <>
          <div className="text-sm text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Hanya id izin mulai I-2026 ke atas yang tersedia di daftar ini.
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">ID Izin</th>
                    <th className="text-left font-semibold px-4 py-3">Nama</th>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">ID BNSP</th>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Tanggal Uji</th>
                    <th className="text-right font-semibold px-4 py-3 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.id_izin}
                      className={`border-t border-slate-100 hover:bg-primary/5 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {row.id_izin}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{row.nama}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.jadwal_id}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {fmtTanggalUji(row.tanggal_uji)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            navigate(`/admin-lsp/revisi-muk/${encodeURIComponent(row.id_izin)}`)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          <FilePenLine className="w-3.5 h-3.5" />
                          Revisi Jawaban
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {paginator && (
            <Pagination
              page={paginator.current_page}
              lastPage={paginator.last_page}
              total={paginator.total}
              perPage={paginator.per_page}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
    </div>
  )
}
