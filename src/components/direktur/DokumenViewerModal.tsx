import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { useEffect } from "react"
import { FileText } from "lucide-react"
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

  if (!isOpen) return null

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
          {url?.endsWith('.pdf') ? (
            <object
              data={url + '#toolbar=0&navpanes=0&scrollbar=0'}
              type="application/pdf"
              className="w-full h-full"
            >
              <p className="text-center py-10 text-slate-600">Loading preview...</p>
            </object>
          ) : (
            <img
              src={url || ''}
              alt={title}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
          <a
            href={url || ''}
            download
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Download
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
