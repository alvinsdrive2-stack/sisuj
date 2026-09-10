import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FilePenLine, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FullPageLoader } from '@/components/ui/loading-spinner'
import { useDataDokumenPraAsesmen } from '@/hooks/useDataDokumenPraAsesmen'
import { useDataDokumenAsesmen } from '@/hooks/useDataDokumenAsesmen'
import { getAsesmenSteps } from '@/lib/asesmen-steps'
import { REVISI_MUK_DOCS, type MukDocConfig } from '@/lib/revisi-muk-config'

export default function RevisiMukDetailPage() {
  // Retry = remount inner → hook fetch ulang dari nol
  const [retryKey, setRetryKey] = useState(0)
  return <RevisiMukDetailInner key={retryKey} onRetry={() => setRetryKey((k) => k + 1)} />
}

function RevisiMukDetailInner({ onRetry }: { onRetry: () => void }) {
  const { idIzin } = useParams<{ idIzin: string }>()
  const navigate = useNavigate()
  const pra = useDataDokumenPraAsesmen(idIzin)
  const ases = useDataDokumenAsesmen(idIzin)

  const praDocs = REVISI_MUK_DOCS.filter((d) => d.tahap === 'praasesmen')

  // Urutan asesmen mengikuti breadcrumb asesi: getAsesmenSteps dengan peran asesor
  // (daftar terlengkap). Gagal fetch data asesmen → fallback tampilkan semua dokumen
  // asesmen sesuai urutan registry supaya halaman tetap bisa dipakai.
  const asesmenDocs = useMemo<MukDocConfig[]>(() => {
    const all = REVISI_MUK_DOCS.filter((d) => d.tahap === 'asesmen')
    if (ases.fetchFailed) return all
    const steps = getAsesmenSteps(ases.jenjang, true, 'asesor_1', 2, ases.metode, 1, ases.isPaket)
    const keys = new Set(
      steps.map((s) => s.href.split('/').pop()).filter((k): k is string => !!k)
    )
    return all.filter((d) => keys.has(d.key))
  }, [ases.fetchFailed, ases.jenjang, ases.metode, ases.isPaket])

  if (pra.isLoading || ases.isLoading) {
    return <FullPageLoader text="Memuat data asesi..." />
  }

  if (pra.fetchFailed) {
    return (
      <ErrorState
        message="Gagal memuat data asesi. Periksa koneksi Anda, lalu coba lagi."
        error={pra.error ?? undefined}
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Link
        to="/admin-lsp/revisi-muk"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke daftar
      </Link>

      {/* Header identitas asesi */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-800">{pra.namaAsesi || '—'}</h2>
              <p className="text-sm text-slate-500 font-mono">{idIzin}</p>
            </div>
            {ases.isPaket && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                Varian KAN (Paket Soal)
              </span>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-sm">
            <IdentitasItem label="ID BNSP" value={pra.jadwalId || '-'} />
            <IdentitasItem label="Jabatan / Skema" value={pra.jabatanKerja || '-'} />
            <IdentitasItem label="Nomor Skema" value={pra.nomorSkema || '-'} />
            <IdentitasItem label="TUK" value={pra.tuk || '-'} />
            <IdentitasItem label="Jenjang" value={pra.jenjang || '-'} />
            <IdentitasItem label="Metode" value={ases.metode || pra.metode || '-'} />
            <IdentitasItem label="Tanggal Uji" value={pra.tanggalUji || '-'} />
            <IdentitasItem label="Asesor" value={pra.namaAsesor || '-'} />
          </dl>
        </CardContent>
      </Card>

      {/* Dokumen Pra-Asesmen */}
      <DocSection
        title="Dokumen Pra-Asesmen"
        docs={praDocs}
        isPaket={ases.isPaket}
        onOpen={(doc) =>
          navigate(`/admin-lsp/revisi-muk/${encodeURIComponent(idIzin ?? '')}/${doc.key}`)
        }
      />

      {/* Dokumen Asesmen */}
      <DocSection
        title="Dokumen Asesmen"
        docs={asesmenDocs}
        isPaket={ases.isPaket}
        onOpen={(doc) =>
          navigate(`/admin-lsp/revisi-muk/${encodeURIComponent(idIzin ?? '')}/${doc.key}`)
        }
      />
    </div>
  )
}

function IdentitasItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-slate-700 font-medium truncate" title={value}>
        {value}
      </dd>
    </div>
  )
}

function DocSection({
  title,
  docs,
  isPaket,
  onOpen,
}: {
  title: string
  docs: MukDocConfig[]
  isPaket: boolean
  onOpen: (doc: MukDocConfig) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">{title}</h3>
      {docs.length === 0 ? (
        <EmptyState title="Tidak ada dokumen" message="Tidak ada dokumen pada tahap ini untuk skema asesi ini." />
      ) : (
        <Card>
          <CardContent className="p-0">
            {docs.map((doc) => {
              const isEdit = doc.mode === 'edit'
              const actionLabel = isEdit
                ? 'Revisi Jawaban'
                : doc.mode === 'readonly-file'
                  ? 'Lihat File'
                  : 'Lihat PDF'
              return (
                <div
                  key={doc.key}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800">{doc.label}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {isEdit ? (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700">
                            Bisa direvisi
                          </span>
                        ) : doc.mode === 'readonly-file' ? (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-500">
                            Read-only (file)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-500">
                            Read-only (PDF)
                          </span>
                        )}
                        {isEdit && isPaket && doc.kanCapable && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-700">
                            Varian KAN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpen(doc)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isEdit
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {isEdit && <FilePenLine className="w-3.5 h-3.5" />}
                    {actionLabel}
                  </button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
