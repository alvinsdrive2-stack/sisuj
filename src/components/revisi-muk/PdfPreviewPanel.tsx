import { useMemo, useState } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buildMukPdfUrl } from '@/lib/revisi-muk-api'
import type { MukTahap } from '@/lib/revisi-muk-config'

interface PdfPreviewPanelProps {
  tahap: MukTahap
  /** Token dokumen versi BNSP di MukPdfService::DOCS. */
  doc: string
  /** Token varian KAN — bila ada, tampilkan toggle BNSP/KAN. */
  docKan?: string
  idIzin: string
  /** Naikkan nilainya dari luar untuk auto-refresh PDF (dipanggil setelah simpan). */
  refreshSignal?: number
  title?: string
}

/**
 * Panel iframe PDF dinamis /pdf_muk — dirender on-the-fly dari DB sehingga selalu
 * menampilkan jawaban terbaru. /pdf_muk throttled 30 req/menit → tombol refresh
 * diberi cooldown 2 detik.
 */
export function PdfPreviewPanel({
  tahap,
  doc,
  docKan,
  idIzin,
  refreshSignal = 0,
  title = 'Pratinjau PDF',
}: PdfPreviewPanelProps) {
  const [kanView, setKanView] = useState(false)
  const [cacheKey, setCacheKey] = useState(0)
  const [cooldown, setCooldown] = useState(false)

  const url = useMemo(() => {
    const token = kanView && docKan ? docKan : doc
    return `${buildMukPdfUrl(tahap, token, idIzin)}?t=${refreshSignal}-${cacheKey}`
  }, [tahap, doc, docKan, idIzin, kanView, refreshSignal, cacheKey])

  const handleRefresh = () => {
    if (cooldown) return
    setCacheKey((k) => k + 1)
    setCooldown(true)
    setTimeout(() => setCooldown(false), 2000)
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
          <div className="flex items-center gap-1.5">
            {docKan && (
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                <button
                  onClick={() => setKanView(false)}
                  className={`px-2.5 py-1.5 font-semibold transition-colors cursor-pointer ${
                    !kanView ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Versi BNSP
                </button>
                <button
                  onClick={() => setKanView(true)}
                  className={`px-2.5 py-1.5 font-semibold transition-colors cursor-pointer ${
                    kanView ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Versi KAN
                </button>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={cooldown}
              title="Muat ulang PDF"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              title="Buka di tab baru"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <iframe
          key={url}
          src={`${url}#toolbar=0`}
          title={title}
          className="w-full h-[70vh] min-h-[420px] rounded-md border border-slate-200 bg-slate-50"
        />
      </CardContent>
    </Card>
  )
}
