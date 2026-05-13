import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/config/api"
import { FileIcon, FileImage, FileText, FileSpreadsheet, FileArchive, Download, ChevronDown, ChevronRight } from "lucide-react"

interface Apl02File {
  id: number
  name: string
  path: string
}

interface Apl02FilePanelProps {
  idIzin?: string
  onCollapse?: (collapsed: boolean) => void
}

export default function Apl02FilePanel({ idIzin, onCollapse }: Apl02FilePanelProps) {
  const [files, setFiles] = useState<Apl02File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedFile, setExpandedFile] = useState<number | null>(null)
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    onCollapse?.(true)
  }, [])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapse?.(next)
  }

  useEffect(() => {
    if (!idIzin) return

    const fetchFiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("access_token")
        const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/apl02/files`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (json.data && Array.isArray(json.data)) {
          setFiles(json.data)
        } else {
          throw new Error(json.message || "Gagal muat file")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal muat file APL02")
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [idIzin])

  const stripExt = (name: string) => name.replace(/\.[^.]+$/, '')

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (!ext) return FileIcon
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return FileImage
    if (['pdf'].includes(ext)) return FileText
    if (['doc', 'docx'].includes(ext)) return FileText
    if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
    if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)) return FileArchive
    return FileIcon
  }

  return (
    <div className={`w-full ${collapsed ? 'lg:w-[200px]' : 'lg:w-[600px]'}`} style={{ flexShrink: 0, overflow: collapsed ? 'hidden' : undefined, transition: 'width 0.25s ease' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Header - click to collapse */}
        <div style={{ padding: '12px 16px', borderBottom: collapsed ? 'none' : '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={toggleCollapse}>
          {collapsed ? <ChevronRight size={16} style={{ color: '#999', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#999', flexShrink: 0 }} />}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d2137" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#333', flex: 1 }}>{collapsed ? 'File Referensi' : 'File Referensi'}</span>
        </div>

        {/* Content */}
        {!collapsed && <div style={{ padding: '12px 16px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #e0e0e0', borderTopColor: '#0d2137', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : error ? (
            <p style={{ fontSize: '12px', color: '#e74c3c', textAlign: 'center', padding: '16px 0' }}>{error}</p>
          ) : files.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '16px 0' }}>Belum ada file</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((file) => {
                const isOpen = expandedFile === file.id
                const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
                return (
                <div key={file.id}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                      borderRadius: '6px', cursor: 'pointer',
                      background: isOpen ? '#eef2ff' : '#f8f9fa',
                      border: `1px solid ${isOpen ? '#c7d2fe' : '#e8e8e8'}`,
                    }}
                    onClick={() => setExpandedFile(isOpen ? null : file.id)}
                  >
                    {(() => { const Icon = fileIcon(file.name); return <Icon size={16} style={{ color: '#666', flexShrink: 0 }} />; })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#222', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stripExt(file.name)}</p>
                    </div>
                    <ChevronDown size={14} style={{ color: '#999', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    <a href={file.path} download={file.name} style={{ color: '#999', padding: '4px', display: 'flex' }} title="Download" onClick={(e) => e.stopPropagation()}>
                      <Download size={14} />
                    </a>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '4px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                      {isImage ? (
                        <img src={file.path} alt={stripExt(file.name)} style={{ width: '100%', display: 'block' }} />
                      ) : (
                        <iframe src={`${file.path}#toolbar=0`} title={stripExt(file.name)} style={{ width: '100%', height: '600px', border: 'none', display: 'block' }} />
                      )}
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          )}
        </div>}
      </div>
    </div>
  )
}
