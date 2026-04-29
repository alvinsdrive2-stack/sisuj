import { createPortal } from "react-dom"
import { X, Download, ExternalLink, FileText } from "lucide-react"
import { useEffect } from "react"

const EMBED_BLOCKED_DOMAINS = ['lspgatensi.id']

function isEmbedBlocked(url: string | null): boolean {
  if (!url) return true
  return EMBED_BLOCKED_DOMAINS.some(domain => url.includes(domain))
}

interface DokumenViewerModalProps {
  isOpen: boolean
  onClose: () => void
  url: string | null
  title: string
}

export function DokumenViewerModal({ isOpen, onClose, url, title }: DokumenViewerModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Auto-open in new tab if embed is blocked, then close modal
  useEffect(() => {
    if (isOpen && url && isEmbedBlocked(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
      onClose()
    }
  }, [isOpen, url, onClose])

  if (!isOpen) return null

  const canEmbed = !isEmbedBlocked(url)

  const content = (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-800">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {canEmbed && url?.endsWith('.pdf') ? (
            <iframe
              src={url + '#toolbar=0&navpanes=0'}
              className="w-full h-full border-0"
              title={title}
            />
          ) : canEmbed ? (
            <img
              src={url || ''}
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
              <FileText className="w-16 h-16 text-primary/30" />
              <p className="text-lg font-medium">Membuka di tab baru...</p>
              <p className="text-sm text-slate-500">Dokumen ini tidak dapat ditampilkan langsung</p>
              <a
                href={url || ''}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Buka Manual
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
          <a
            href={url || ''}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            title="Buka di tab baru"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <a
            href={url || ''}
            download
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
