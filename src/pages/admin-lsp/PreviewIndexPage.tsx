import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/config/api"
import { Search, FileText, BookOpen, ClipboardCheck, Eye } from "lucide-react"
import { FullPageLoader } from "@/components/ui/loading-spinner"

interface Jabatan {
  id_jabatan_kerja: string
  jabatan_kerja: string
}

const PRAASESMEN_DOCS = [
  { type: "apl01", label: "APL 01", desc: "Asesmen Mandiri" },
  { type: "apl02", label: "APL 02", desc: "Bukti Kompetensi" },
  { type: "mapa01", label: "MAPA 01", desc: "Matrix Program Asesmen" },
  { type: "mapa02", label: "MAPA 02", desc: "Matrix Program Asesmen Lanjutan" },
]

const ASESMEN_DOCS = [
  { type: "ia01", label: "IA 01", desc: "Tugas Praktik Demonstrasi" },
  { type: "ia02", label: "IA 02", desc: "TPD - Tugas Praktik Demonstrasi" },
  { type: "ia03", label: "IA 03", desc: "Tugas Praktik Demonstrasi" },
  { type: "ia04a", label: "IA 04.A", desc: "Lembar Observasi" },
  { type: "ia04b", label: "IA 04.B", desc: "Pertanyaan Tertulis/Lisan/Wawancara" },
  { type: "ia05", label: "IA 05", desc: "Tes Tulis" },
  { type: "ia08", label: "IA 08", desc: "Verifikasi Portofolio" },
  { type: "ia09", label: "IA 09", desc: "Daftar Periksa Portofolio" },
  { type: "ak02", label: "AK 02", desc: "Rekapitulasi Penilaian" },
  { type: "ak03", label: "AK 03", desc: "Penetapan Kompetensi" },
]

const DOC_ICON = FileText

export default function PreviewIndexPage() {
  const navigate = useNavigate()
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [selectedJabatan, setSelectedJabatan] = useState<Jabatan | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

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
        <p className="text-slate-600">Pilih jabatan untuk melihat preview dokumen asesmen</p>
      </div>

      {/* Jabatan Selector */}
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
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedJabatan(null)
              }}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {search && filtered.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              {filtered.map((j) => (
                <button
                  key={j.id_jabatan_kerja}
                  onClick={() => {
                    setSelectedJabatan(j)
                    setSearch(j.jabatan_kerja)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 border-b border-slate-100 last:border-0 ${
                    selectedJabatan?.id_jabatan_kerja === j.id_jabatan_kerja
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-700"
                  }`}
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

      {/* Document Grid — show only if jabatan selected */}
      {selectedJabatan && (
        <div className="space-y-6">
          {/* PraAsesmen Docs */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-sky-600" />
              Pra Asesmen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {PRAASESMEN_DOCS.map((doc) => (
                <button
                  key={doc.type}
                  onClick={() =>
                    navigate(
                      `/admin-lsp/preview/${selectedJabatan.id_jabatan_kerja}/${doc.type}`
                    )
                  }
                  className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:border-primary hover:shadow-md transition-all bg-white text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                    <DOC_ICON className="w-5 h-5 text-sky-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{doc.label}</span>
                  <span className="text-xs text-slate-500">{doc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Asesmen Docs */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Asesmen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ASESMEN_DOCS.map((doc) => (
                <button
                  key={doc.type}
                  onClick={() =>
                    navigate(
                      `/admin-lsp/preview/${selectedJabatan.id_jabatan_kerja}/${doc.type}`
                    )
                  }
                  className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:border-primary hover:shadow-md transition-all bg-white text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <DOC_ICON className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{doc.label}</span>
                  <span className="text-xs text-slate-500">{doc.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedJabatan && !search && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Eye className="w-12 h-12 mb-3" />
          <p className="text-sm">Cari dan pilih jabatan untuk melihat preview dokumen</p>
        </div>
      )}
    </div>
  )
}
