import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { FullPageLoader } from '@/components/ui/loading-spinner'
import { K3FilePanel } from '@/components/revisi-muk/K3FilePanel'
import { PdfPreviewPanel } from '@/components/revisi-muk/PdfPreviewPanel'
import { Apl01Editor } from '@/components/revisi-muk/editors/Apl01Editor'
import { Apl02Editor } from '@/components/revisi-muk/editors/Apl02Editor'
import { Ak01Editor } from '@/components/revisi-muk/editors/Ak01Editor'
import { Ak04Editor } from '@/components/revisi-muk/editors/Ak04Editor'
import { Ak07Editor } from '@/components/revisi-muk/editors/Ak07Editor'
import { Ia01Editor } from '@/components/revisi-muk/editors/Ia01Editor'
import { Ia03Editor } from '@/components/revisi-muk/editors/Ia03Editor'
import { Ia04aEditor } from '@/components/revisi-muk/editors/Ia04aEditor'
import { Ia04bEditor } from '@/components/revisi-muk/editors/Ia04bEditor'
import { Ia05Editor } from '@/components/revisi-muk/editors/Ia05Editor'
import { Ia06Editor } from '@/components/revisi-muk/editors/Ia06Editor'
import { Ia08Editor } from '@/components/revisi-muk/editors/Ia08Editor'
import { Ia09Editor } from '@/components/revisi-muk/editors/Ia09Editor'
import { Ia10Editor } from '@/components/revisi-muk/editors/Ia10Editor'
import { Ak02Editor } from '@/components/revisi-muk/editors/Ak02Editor'
import { Ak03Editor } from '@/components/revisi-muk/editors/Ak03Editor'
import { Ak05Editor } from '@/components/revisi-muk/editors/Ak05Editor'
import { Ak06Editor } from '@/components/revisi-muk/editors/Ak06Editor'
import type { MukEditorProps } from '@/components/revisi-muk/editors/shared'
import { useDataDokumenPraAsesmen } from '@/hooks/useDataDokumenPraAsesmen'
import { useDataDokumenAsesmen } from '@/hooks/useDataDokumenAsesmen'
import { getMukDoc } from '@/lib/revisi-muk-config'

/** Peta key dokumen → komponen editor. */
const EDITORS: Record<string, (props: MukEditorProps) => React.ReactNode> = {
  apl01: Apl01Editor,
  apl02: Apl02Editor,
  ak01: Ak01Editor,
  ak04: Ak04Editor,
  ak07: Ak07Editor,
  ia01: Ia01Editor,
  ia03: Ia03Editor,
  ia04a: Ia04aEditor,
  ia04b: Ia04bEditor,
  ia05: Ia05Editor,
  ia06: Ia06Editor,
  ia08: Ia08Editor,
  ia09: Ia09Editor,
  ia10: Ia10Editor,
  ak02: Ak02Editor,
  ak03: Ak03Editor,
  ak05: Ak05Editor,
  ak06: Ak06Editor,
}

export default function RevisiMukEditorPage() {
  const { idIzin = '', doc: docKey = '' } = useParams<{ idIzin: string; doc: string }>()
  const [refreshSignal, setRefreshSignal] = useState(0)

  const pra = useDataDokumenPraAsesmen(idIzin)
  const ases = useDataDokumenAsesmen(idIzin)

  const doc = getMukDoc(docKey)

  if (!doc || !doc.key) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={FileQuestion}
          title="Dokumen tidak dikenal"
          message={`Tidak ada dokumen dengan kunci "${docKey}" pada daftar Revisi MUK.`}
        />
      </div>
    )
  }

  if (pra.isLoading || ases.isLoading) {
    return <FullPageLoader text="Memuat dokumen..." />
  }

  const onSaved = () => setRefreshSignal((s) => s + 1)
  // Toggle BNSP/KAN hanya relevan untuk asesi paket; bila data asesmen gagal
  // dimuat, tetap tampilkan supaya fitur tidak hilang diam-diam.
  const docKan = doc.kanCapable && doc.pdfDocKan && (ases.isPaket || ases.fetchFailed)
    ? doc.pdfDocKan
    : undefined

  const header = (
    <div className="space-y-1">
      <BackLink idIzin={idIzin} />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-bold text-slate-800">{doc.label}</h1>
        <span className="text-sm text-slate-500">
          {pra.namaAsesi || '—'} · <span className="font-mono">{idIzin}</span>
        </span>
      </div>
    </div>
  )

  if (doc.mode === 'readonly-file') {
    return (
      <div className="space-y-4">
        {header}
        <K3FilePanel idIzin={idIzin} />
      </div>
    )
  }

  if (doc.mode === 'readonly-pdf') {
    return (
      <div className="space-y-4">
        {header}
        <PdfPreviewPanel
          tahap={doc.tahap}
          doc={doc.pdfDoc ?? doc.key}
          idIzin={idIzin}
          refreshSignal={refreshSignal}
        />
      </div>
    )
  }

  const Editor = EDITORS[doc.key]
  if (!Editor) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title="Editor belum tersedia"
          message={`Editor untuk ${doc.label} belum tersedia. PDF tetap bisa dilihat di bawah.`}
        />
        <PdfPreviewPanel
          tahap={doc.tahap}
          doc={doc.pdfDoc ?? doc.key}
          docKan={docKan}
          idIzin={idIzin}
          refreshSignal={refreshSignal}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {header}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div>
          <Editor idIzin={idIzin} onSaved={onSaved} />
        </div>
        <div>
          <PdfPreviewPanel
            tahap={doc.tahap}
            doc={doc.pdfDoc ?? doc.key}
            docKan={docKan}
            idIzin={idIzin}
            refreshSignal={refreshSignal}
            title="Pratinjau PDF (otomatis ter-update)"
          />
        </div>
      </div>
    </div>
  )
}

function BackLink({ idIzin }: { idIzin?: string }) {
  return (
    <Link
      to={idIzin ? `/admin-lsp/revisi-muk/${encodeURIComponent(idIzin)}` : '/admin-lsp/revisi-muk'}
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali ke daftar dokumen
    </Link>
  )
}
