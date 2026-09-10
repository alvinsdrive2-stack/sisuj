import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { DocError, DocLoading, useDocFetch } from '@/components/revisi-muk/editors/shared'
import { praUrl } from '@/lib/revisi-muk-api'

interface FileK3Response {
  message: string
  data?: { file?: string }
}

/** Panel read-only file Tata Tertib & K3 (GET /praasesmen/{id}/file-k3). */
export function K3FilePanel({ idIzin }: { idIzin: string }) {
  const { data, isLoading, error, reload } = useDocFetch<FileK3Response>(praUrl(idIzin, 'file-k3'))

  if (isLoading) return <DocLoading text="Memuat file K3..." />
  if (error) return <DocError message={error} onRetry={reload} />

  const file = data?.data?.file
  if (!file) {
    return (
      <EmptyState
        title="File belum tersedia"
        message="File Tata Tertib & K3 untuk asesi ini belum diunggah."
      />
    )
  }

  const url = `${file}${file.includes('?') ? '&' : '?'}t=${Date.now()}`

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700">File Tata Tertib &amp; K3</h3>
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
        <iframe
          src={`${url}#toolbar=0`}
          title="File Tata Tertib dan K3"
          className="w-full h-[70vh] min-h-[420px] rounded-md border border-slate-200 bg-slate-50"
        />
      </CardContent>
    </Card>
  )
}
