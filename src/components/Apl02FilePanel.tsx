import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/config/api"
import { FileIcon, FileImage, FileText, FileSpreadsheet, FileArchive, Download, ChevronDown, ChevronRight } from "lucide-react"

interface Apl02File {
  id: number
  name: string
  path: string
  kebenaran?: boolean
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
        const headers = { Accept: "application/json", Authorization: `Bearer ${token}` }

        const [filesRes, kebenaranRes] = await Promise.all([
          fetch(`${API_BASE_URL}/praasesmen/${idIzin}/apl02/files`, { headers }),
          fetch(`${API_BASE_URL}/kegiatan/${idIzin}/dokumen-asesi`, { headers }),
        ])

        let allFiles: Apl02File[] = []

        if (filesRes.ok) {
          const json = await filesRes.json()
          if (json.data && Array.isArray(json.data)) {
            allFiles = json.data
          }
        }

        if (kebenaranRes.ok) {
          try {
            const kebenaranJson = await kebenaranRes.json()
            if ((kebenaranJson.success || kebenaranJson.message === "Success") && kebenaranJson.data) {
              const kebenaranFiles: Apl02File[] = []
              if (kebenaranJson.data.ktp) {
                kebenaranFiles.push({ id: -3, name: 'KTP (Kebenaran Data)', path: kebenaranJson.data.ktp, kebenaran: true })
              }
              if (kebenaranJson.data.npwp) {
                kebenaranFiles.push({ id: -4, name: 'NPWP (Kebenaran Data)', path: kebenaranJson.data.npwp, kebenaran: true })
              }
              if (kebenaranJson.data.ijazah) {
                kebenaranFiles.push({ id: -1, name: 'Ijazah (Kebenaran Data)', path: kebenaranJson.data.ijazah, kebenaran: true })
              }
              if (kebenaranJson.data.referensi_kerja) {
                kebenaranFiles.push({ id: -2, name: 'Referensi Kerja (Kebenaran Data)', path: kebenaranJson.data.referensi_kerja, kebenaran: true })
              }
              allFiles = [...kebenaranFiles, ...allFiles]
            }
          } catch { /* ignore */ }
        }

        if (allFiles.length > 0 || filesRes.ok) {
          setFiles(allFiles)
        } else if (!filesRes.ok) {
          throw new Error(`HTTP ${filesRes.status}`)
        } else {
          throw new Error("Gagal muat file")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal muat file APL02")
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [idIzin])

  const getExt = (name: string, path?: string) =>
    (name.includes('.') ? name.split('.').pop() : path?.split('.').pop()?.split('?')[0])?.toLowerCase()

  const fileIcon = (name: string, path?: string) => {
    const ext = getExt(name, path)
    if (!ext) return FileIcon
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return FileImage
    if (['pdf'].includes(ext)) return FileText
    if (['doc', 'docx'].includes(ext)) return FileText
    if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
    if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)) return FileArchive
    return FileIcon
  }

  const stripExt = (name: string) => name.replace(/\.[^.]+$/, '')

  return (
    <div className={`w-full ${collapsed ? 'lg:w-[200px]' : 'lg:w-[600px]'}`} style={{ flexShrink: 0, overflow: collapsed ? 'hidden' : 'auto', maxHeight: '500px', transition: 'width 0.25s ease' }}>
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
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#333', flex: 1 }}>File Referensi</span>
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
                const ext = getExt(file.name, file.path)
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
                const Icon = fileIcon(file.name, file.path)
                return (
                <div key={file.id}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                      borderRadius: '6px', cursor: 'pointer',
                      background: file.kebenaran ? (isOpen ? '#ede9fe' : '#f5f3ff') : (isOpen ? '#eef2ff' : '#f8f9fa'),
                      border: file.kebenaran
                        ? `1px solid ${isOpen ? '#c4b5fd' : '#ddd6fe'}`
                        : `1px solid ${isOpen ? '#c7d2fe' : '#e8e8e8'}`,
                    }}
                    onClick={() => setExpandedFile(isOpen ? null : file.id)}
                  >
                    <Icon size={16} style={{ color: file.kebenaran ? '#7c3aed' : '#666', flexShrink: 0 }} />
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
