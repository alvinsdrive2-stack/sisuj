import React, { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { File, Trash2, Check, FileImage, FileType, Eye, X } from 'lucide-react'
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useKegiatanByRole } from "@/hooks/useKegiatanByRole"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { CustomRadio } from "@/components/ui/Radio"
import { ActionButton } from "@/components/ui/ActionButton"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { AsesorSignatureGuard } from "@/components/AsesorSignatureGuard"
import { ASESOR_SIGNATURE_POLLING_INTERVAL_MS } from "@/lib/polling-config"
import { WebcamModal } from "@/components/ui/WebcamModal"

// ============== ANIMATED COMPONENTS ==============

// Animated Capsule/Chip with smooth entry and exit
interface AnimatedCapsuleProps {
  fileName: string
  onRemove: () => void
  isExcluded?: boolean // For API files that are excluded
  style?: React.CSSProperties
  file?: { id: number; name: string; path: string } // Full file object for preview
  isAsesor?: boolean
  onView?: (file: { id: number; name: string; path: string }) => void
}

function AnimatedCapsule({ fileName, onRemove, isExcluded, style, file, isAsesor, onView }: AnimatedCapsuleProps) {
  const [isExiting, setIsExiting] = useState(false)
  const capsuleRef = useRef<HTMLSpanElement>(null)

  const handleRemove = () => {
    if (isAsesor) return // Asesor cannot remove files
    setIsExiting(true)
    setTimeout(() => {
      onRemove()
    }, 200)
  }

  const handleClick = () => {
    if (isAsesor && file && onView) {
      console.log('AnimatedCapsule clicked - Opening preview:', file.name)
      onView(file)
    }
  }

  return (
    <span
      ref={capsuleRef}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        height: '38px',
        background: isAsesor ? '#f1f5f9' : (isExcluded ? '#fee' : '#f5f5f5'),
        border: isAsesor ? '1px solid #cbd5e1' : (isExcluded ? '1px solid #fca5a5' : '1px solid #ddd'),
        borderRadius: '6px',
        padding: '0 12px',
        fontSize: '12px',
        fontWeight: '500',
        color: isAsesor ? '#0369a1' : (isExcluded ? '#991b1b' : '#333'),
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transform: isExiting ? 'scale(0.9) translateX(-10px)' : 'scale(1) translateX(0)',
        opacity: isExiting ? 0 : (isExcluded ? 0.6 : 1),
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isAsesor ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isExiting) {
          if (isAsesor) {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.borderColor = '#94a3b8'
          } else {
            e.currentTarget.style.background = isExcluded ? '#fecaca' : '#eee'
            e.currentTarget.style.borderColor = isExcluded ? '#f87171' : '#ccc'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isExiting) {
          if (isAsesor) {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.borderColor = '#cbd5e1'
          } else {
            e.currentTarget.style.background = isExcluded ? '#fee' : '#f5f5f5'
            e.currentTarget.style.borderColor = isExcluded ? '#fca5a5' : '#ddd'
          }
        }
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <File size={14} style={{ color: isAsesor ? '#0284c7' : (isExcluded ? '#dc2626' : '#666') }} />
        <span style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: isAsesor ? '#0284c7' : 'inherit'
        }}>
          {fileName}
        </span>
      </span>
      {/* Show Eye icon for asesor, Trash/Check icon for asesi */}
      {!isAsesor && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: isExcluded ? '#dc2626' : '#999',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isExiting) {
              e.currentTarget.style.background = isExcluded ? '#dc2626' : '#dc2626'
              e.currentTarget.style.color = '#fff'
            }
          }}
          onMouseLeave={(e) => {
            if (!isExiting) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = isExcluded ? '#dc2626' : '#999'
            }
          }}
          title={isExcluded ? 'Sertakan kembali' : 'Hapus dari jawaban'}
        >
          {isExcluded ? <Check size={12} /> : <Trash2 size={12} />}
        </button>
      )}
      {/* Show Eye icon for asesor */}
      {isAsesor && (
        <span style={{ display: 'flex', alignItems: 'center', color: '#0369a1', marginLeft: '4px' }}>
          <Eye size={14} />
        </span>
      )}
    </span>
  )
}

// Server File Capsule with delete button for uploaded files
interface ServerFileCapsuleProps {
  file: { id: number; name: string; path: string }
  onDelete: (fileId: number) => void
  disabled?: boolean
  isAsesor?: boolean
  onView?: (file: { id: number; name: string; path: string }) => void
}

function ServerFileCapsule({ file, onDelete, disabled, isAsesor, onView }: ServerFileCapsuleProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleDelete = () => {
    if (disabled) return
    setShowConfirmDialog(true)
  }

  const confirmDelete = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDelete(file.id)
    }, 200)
    setShowConfirmDialog(false)
  }

  const handleCapsuleClick = () => {
    if (isAsesor && onView) {
      console.log('Opening preview for file:', file.name)
      onView(file)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Button clicked! isAsesor:', isAsesor, 'onView exists:', !!onView)
    if (isAsesor && onView) {
      console.log('Button clicked - Opening preview for file:', file.name)
      onView(file)
    } else if (!disabled) {
      handleDelete()
    }
  }

  console.log('ServerFileCapsule render - isAsesor:', isAsesor, 'disabled:', disabled, 'button should show:', isAsesor || !disabled)

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Hapus File"
        message={`Apakah Anda yakin ingin menghapus file "${file.name}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmColor="#dc2626"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
      />
      <span
        onClick={handleCapsuleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          height: '38px',
          background: isAsesor ? '#e0f2fe' : '#f5f5f5',
          border: isAsesor ? '1px solid #0ea5e9' : '1px solid #ddd',
          borderRadius: '6px',
          padding: '0 12px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#333',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: isExiting ? 'scale(0.9) translateX(-10px)' : 'scale(1) translateX(0)',
          opacity: isExiting ? 0 : 1,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isAsesor ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isExiting) {
            e.currentTarget.style.background = isAsesor ? '#bae6fd' : '#eee'
            e.currentTarget.style.borderColor = isAsesor ? '#0284c7' : '#ccc'
          }
        }}
        onMouseLeave={(e) => {
          if (!isExiting) {
            e.currentTarget.style.background = isAsesor ? '#e0f2fe' : '#f5f5f5'
            e.currentTarget.style.borderColor = isAsesor ? '#0ea5e9' : '#ddd'
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getFileIcon(file.name || '')}
          <span style={{
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {file.name || 'Unknown file'}
          </span>
        </span>
        {/* Show Eye icon for asesor (view mode), Trash icon for asesi (delete mode) */}
        {(isAsesor || !disabled) && (
          <button
            onClick={handleButtonClick}
            onMouseDown={() => console.log('Button mouse down!')}
            style={{
              background: 'transparent',
              border: 'none',
              color: isAsesor ? '#0284c7' : '#999',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isExiting) {
                if (isAsesor) {
                  e.currentTarget.style.background = '#0284c7'
                  e.currentTarget.style.color = '#fff'
                } else if (!disabled) {
                  e.currentTarget.style.background = '#dc2626'
                  e.currentTarget.style.color = '#fff'
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!isExiting) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = isAsesor ? '#0284c7' : '#999'
              }
            }}
            title={isAsesor ? "Lihat preview dokumen" : "Hapus file dari server"}
          >
            {isAsesor ? <Eye size={12} /> : <Trash2 size={12} />}
          </button>
        )}
      </span>
    </>
  )
}

// Helper function to get file icon based on extension
function getFileIcon(fileName: string): React.ReactNode {
  if (!fileName) return <File size={14} style={{ color: '#666' }} />
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return <FileType size={14} style={{ color: '#dc2626' }} />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <FileImage size={14} style={{ color: '#059669' }} />
  if (['doc', 'docx'].includes(ext || '')) return <FileType size={14} style={{ color: '#2563eb' }} />
  return <File size={14} style={{ color: '#666' }} />
}

// Bukti Dropdown Component with its own state (no full page re-render)
interface BuktiDropdownProps {
  kukId: string
  uploadedFiles: Array<{ id: number; name: string; path: string }>
  selectedFileIds: number[]
  onSelectFile: (kukId: string, fileId: number) => void
  disabled?: boolean
}

function BuktiDropdown({ kukId, uploadedFiles, selectedFileIds, onSelectFile, disabled }: BuktiDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="bukti-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || uploadedFiles.length === 0}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: isOpen ? '1px solid #999' : '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: '500',
          backgroundColor: (disabled || uploadedFiles.length === 0) ? '#f5f5f5' : '#fff',
          cursor: (disabled || uploadedFiles.length === 0) ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          color: '#333',
        }}
        onMouseEnter={(e) => {
          if (!disabled && uploadedFiles.length > 0 && !isOpen) {
            e.currentTarget.style.borderColor = '#999'
            e.currentTarget.style.backgroundColor = '#f9f9f9'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#ddd'
            e.currentTarget.style.backgroundColor = (disabled || uploadedFiles.length === 0) ? '#f5f5f5' : '#fff'
          }
        }}
      >
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {selectedFileIds.length > 0 && (
            <span style={{
              background: '#666',
              color: '#fff',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              {selectedFileIds.length}
            </span>
          )}
          {selectedFileIds.length > 0 ? 'file dipilih' : (uploadedFiles.length === 0 ? '-- Upload file terlebih dahulu --' : '-- Pilih File --')}
        </span>
        <span style={{
          transition: 'transform 0.3s ease',
          display: 'inline-block',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </button>

      {isOpen && uploadedFiles.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '6px',
          marginTop: '4px',
          maxHeight: '180px',
          overflowY: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {uploadedFiles.map((file, index) => {
            const isSelected = selectedFileIds.includes(file.id)
            return (
              <div
                key={file.id}
                onClick={() => {
                  onSelectFile(kukId, file.id)
                  setIsOpen(false)
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  background: isSelected ? '#e8e8e8' : 'transparent',
                  borderBottom: index === uploadedFiles.length - 1 ? 'none' : '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  color: '#333',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#f5f5f5'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <CustomCheckbox
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ pointerEvents: 'none' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getFileIcon(file.name || '')}
                  <span>{file.name || 'Unknown file'}</span>
                </span>
                {isSelected && (
                  <span style={{
                    marginLeft: 'auto',
                    color: '#666',
                  }}>
                    <Check size={16} />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Document Preview Modal Component
interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: { id: number; name: string; path: string } | null
}

function DocumentPreviewModal({ isOpen, onClose, file }: DocumentPreviewModalProps) {
  console.log('DocumentPreviewModal render - isOpen:', isOpen, 'file:', file?.name)

  if (!isOpen || !file) {
    console.log('DocumentPreviewModal returning null - isOpen:', isOpen, 'file:', file)
    return null
  }

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !file) return

    const loadPreview = async () => {
      setIsLoading(true)
      setError(null)

      const ext = file.name.split('.').pop()?.toLowerCase()

      // For images, show directly
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
        setIsLoading(false)
      } else if (ext === 'pdf') {
        // For PDF, embed directly
        setIsLoading(false)
      } else if (['doc', 'docx'].includes(ext || '')) {
        // For documents, show as downloadable link (can't preview in browser)
        setIsLoading(false)
      } else {
        // For other files, show as downloadable
        setIsLoading(false)
      }
    }

    loadPreview()
  }, [isOpen, file])

  const getFileTypeDisplay = () => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'PDF Document'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'Gambar'
    if (['doc', 'docx'].includes(ext || '')) return 'Document Microsoft Word'
    return 'File'
  }

  const renderPreview = () => {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return (
        <img
          src={file.path}
          alt={file.name}
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      )
    }

    if (ext === 'pdf') {
      return (
        <iframe
          src={file.path}
          title={file.name}
          style={{
            width: '100%',
            height: '70vh',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
      )
    }

    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666'
      }}>
        <File size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p style={{ marginBottom: '16px' }}>Preview tidak tersedia untuk jenis file ini</p>
        <p style={{ fontSize: '14px' }}>Silakan download untuk melihat isi file</p>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        padding: "16px"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Eye style={{ width: "20px", height: "20px", color: "#0066cc" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
              {getFileTypeDisplay()}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              color: "#6b7280"
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* File Info */}
        <div style={{
          padding: "12px 20px",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <p style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
            margin: "0",
            wordBreak: "break-all"
          }}>
            {file.name}
          </p>
        </div>

        {/* Preview Content */}
        <div style={{
          flex: 1,
          padding: "20px",
          overflow: "auto",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {isLoading ? (
            <div>Memuat preview...</div>
          ) : error ? (
            <div style={{ color: "#dc2626" }}>{error}</div>
          ) : (
            renderPreview()
          )}
        </div>

        {/* Actions */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px"
        }}>
          <a
            href={file.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 20px",
              background: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "none"
            }}
          >
            Download / Open in New Tab
          </a>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

interface KUK {
  no_kuk: string
  judul_kuk: string
}

interface File {
  id: number
  name: string
  path: string
}

interface BarcodeInfo {
  url: string | null
  tanggal: string | null
  nama: string | null
}

interface SubunitBarcodes {
  asesi: BarcodeInfo
  asesor1: BarcodeInfo | null
  asesor2: BarcodeInfo | null
}

interface Subunit {
  id: string
  no_elemen: string
  judul_elemen: string
  kompeten?: boolean
  kuk_list: KUK[]
  files: File[]
  barcodes?: SubunitBarcodes
}

interface Unit {
  id: string
  kode: string
  judul_kompetensi: string
  subunits: Subunit[]
}

interface Apl02Response {
  message: string
  data: {
    metode?: 'observasi' | 'portofolio'
    is_dilanjutkan?: boolean
    id_jadwal?: number
    units: Unit[]
    barcodes?: SubunitBarcodes
  }
}

interface DataDokumenResponse {
  message: string
  data: {
    jabatan_kerja: string
    nomor_skema: string
    tuk: string
    asesor_1: string
    asesor_2: string
    noreg_asesor_1: string
    noreg_asesor_2: string
    tanggal_uji: string
    tanggal_selesai: string | null
    jenis_kelas: string
  }
}

type Apl02Data = {
  jabatan_kerja: string
  no_skema: string
  tuk: string
  nama_asesor: string
  nama_asesi: string
  tanggal: string
  metode?: 'observasi' | 'portofolio'
  units: Unit[]
}

export default function Apl02Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan, isAsesor } = useKegiatanByRole()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()

  // Use idIzin from URL when accessed by asesor, otherwise use from user context
  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { asesorList, namaAsesi, jenjang } = useDataDokumenPraAsesmen(idIzin)
  const { showSuccess, showError, showWarning } = useToast()

  // Get jadwal_id from kegiatan
  const jadwalId = kegiatan?.jadwal_id

  const [apl02Data, setApl02Data] = useState<Apl02Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [_idIzin, setIdIzin] = useState<string | null>(null) // Will be used for POST request
  const [uploadedFilesInfo, setUploadedFilesInfo] = useState<Array<{ id: number; name: string; path: string }>>([])
  const [kukChecklist, setKukChecklist] = useState<Record<string, 'K' | 'BK'>>({})
  const [kukBukti, setKukBukti] = useState<Record<string, number[]>>({}) // Store file IDs instead of names
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [excludedApiFileIds, setExcludedApiFileIds] = useState<Set<number>>(new Set()) // API files excluded from POST
  const [metodeAsesmen, setMetodeAsesmen] = useState<'observasi' | 'portofolio'>('observasi')
  const [subunitBarcodes, setSubunitBarcodes] = useState<Record<string, SubunitBarcodes>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<{ id: number; name: string; path: string } | null>(null)

  // Debug: log isAsesor value
  console.log('Apl02Page render - isAsesor:', isAsesor, 'user role:', user?.role?.name)

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  // Note: asesorList is available after useDataDokumenPraAsesmen is called
  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'praasesmen',
    role: 'auto',
    checkOnMount: true, // Enable for both asesi and asesor
    idIzin: idIzin,
    asesorList: asesorList
  })

  const handleCheckboxChange = (kukId: string, value: 'K' | 'BK', unitId?: string, subunitId?: string) => {
    setKukChecklist(prev => {
      const current = prev[kukId]
      if (current === value) {
        // Uncheck if clicking the same value - also uncheck all KUKs in same element
        const { [kukId]: _, ...rest } = prev
        // Also uncheck all other KUKs in the same element
        if (unitId && subunitId && apl02Data) {
          const unit = apl02Data.units.find(u => u.id === unitId)
          if (unit) {
            const subunit = unit.subunits.find(s => s.id === subunitId)
            if (subunit) {
              subunit.kuk_list.forEach(kuk => {
                const otherKukId = `${unitId}-${subunitId}-${kuk.no_kuk}`
                if (otherKukId !== kukId) {
                  delete rest[otherKukId]
                }
              })
            }
          }
        }
        return rest
      }
      // Set value for this KUK and all KUKs in the same element
      const updated = { ...prev, [kukId]: value }
      if (unitId && subunitId && apl02Data) {
        const unit = apl02Data.units.find(u => u.id === unitId)
        if (unit) {
          const subunit = unit.subunits.find(s => s.id === subunitId)
          if (subunit) {
            subunit.kuk_list.forEach(kuk => {
              const otherKukId = `${unitId}-${subunitId}-${kuk.no_kuk}`
              updated[otherKukId] = value
            })
          }
        }
      }
      return updated
    })
  }

  const handleBuktiChange = (kukId: string, fileId: number, unitId?: string, subunitId?: string) => {
    setKukBukti(prev => {
      const currentFiles = prev[kukId] || []
      const isRemoving = currentFiles.includes(fileId)

      if (isRemoving) {
        // Remove file from this KUK only
        return {
          ...prev,
          [kukId]: currentFiles.filter(f => f !== fileId)
        }
      } else {
        // Add file to this KUK and all KUKs in the same element
        const updated = {
          ...prev,
          [kukId]: [...currentFiles, fileId]
        }

        // Auto-assign to all KUKs in the same element
        if (unitId && subunitId && apl02Data) {
          const unit = apl02Data.units.find(u => u.id === unitId)
          if (unit) {
            const subunit = unit.subunits.find(s => s.id === subunitId)
            if (subunit) {
              subunit.kuk_list.forEach(kuk => {
                const otherKukId = `${unitId}-${subunitId}-${kuk.no_kuk}`
                if (otherKukId !== kukId) {
                  const otherFiles = updated[otherKukId] || []
                  if (!otherFiles.includes(fileId)) {
                    updated[otherKukId] = [...otherFiles, fileId]
                  }
                }
              })
            }
          }
        }

        return updated
      }
    })
  }

  const removeBuktiFile = (kukId: string, fileId: number) => {
    setKukBukti(prev => ({
      ...prev,
      [kukId]: (prev[kukId] || []).filter(f => f !== fileId)
    }))
  }

  const deleteFile = async (fileId: number) => {
    try {
      const token = localStorage.getItem("access_token")

      const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/apl02/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from uploadedFilesInfo
        setUploadedFilesInfo(prev => prev.filter(f => f.id !== fileId))
        // Remove from all kukBukti selections
        setKukBukti(prev => {
          const newKukBukti = { ...prev }
          Object.keys(newKukBukti).forEach(kukId => {
            newKukBukti[kukId] = newKukBukti[kukId].filter(id => id !== fileId)
          })
          return newKukBukti
        })
        showSuccess('File berhasil dihapus')
      } else if (response.status === 404) {
        // File not found on server - remove from local state anyway
        setUploadedFilesInfo(prev => prev.filter(f => f.id !== fileId))
        setKukBukti(prev => {
          const newKukBukti = { ...prev }
          Object.keys(newKukBukti).forEach(kukId => {
            newKukBukti[kukId] = newKukBukti[kukId].filter(id => id !== fileId)
          })
          return newKukBukti
        })
      } else {
        showError('Gagal menghapus file')
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      showError('Terjadi kesalahan saat menghapus file')
    }
  }

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault()
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        const token = localStorage.getItem("access_token")
        const finalIdIzin = _idIzin || idIzin

        if (!finalIdIzin) {
          showWarning("ID Izin tidak ditemukan")
          return
        }

        // Upload files to server
        const formData = new FormData()
        Array.from(files).forEach(file => {
          formData.append('files[]', file)
        })

        const uploadResponse = await fetch(`https://backend.devgatensi.site/api/praasesmen/${finalIdIzin}/apl02/files`, {
          method: 'POST',
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          if (uploadResult.message === "Files uploaded" && uploadResult.files) {
            // Map server response to our format (original_name -> name)
            const mappedFiles = uploadResult.files.map((f: any) => ({
              id: f.id,
              name: f.original_name || f.name,
              path: f.path
            }))
            setUploadedFilesInfo(prev => [...prev, ...mappedFiles])
            showSuccess(`${mappedFiles.length} file berhasil diupload`)
          }
        } else {
          showError('Gagal upload file')
        }
      } catch (error) {
        console.error('Error uploading files:', error)
        showError('Terjadi kesalahan saat upload file')
      }
    }
    e.target.value = ''
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e)
  }

  const initialFetchDone = useRef(false)

  const fetchData = useCallback(async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL when accessed by asesor, otherwise use from user context
        const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin

        // Fetch id_izin dari list-asesi endpoint (skip for asesor)
        let fetchedIdIzin: string | null = idIzin || null

        if (!fetchedIdIzin && !isAsesor && kegiatan?.jadwal_id) {
          const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })

          if (listAsesiResponse.ok) {
            const listResult = await listAsesiResponse.json()
            if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
              fetchedIdIzin = listResult.list_asesi[0].id_izin
              setIdIzin(fetchedIdIzin)
            }
          }
        }

        if (!fetchedIdIzin) {
          setIsLoading(false)
          return
        }

        // Fetch data-dokumen, apl02, and files in parallel
        const [dataDokumenResponse, apl02Response, filesResponse] = await Promise.all([
          fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/data-dokumen`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
          fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/apl02`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
          fetch(`https://backend.devgatensi.site/api/praasesmen/${fetchedIdIzin}/apl02/files`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
        ])

        // Parse data-dokumen response
        let jabatanKerja = ''
        let noSkema = ''
        let tuk = 'Sewaktu / Tempat Kerja / Mandiri'
        let namaAsesor = ''

        if (dataDokumenResponse.ok) {
          const dataDokumenResult: DataDokumenResponse = await dataDokumenResponse.json()
          if (dataDokumenResult.message === "Success" && dataDokumenResult.data) {
            jabatanKerja = dataDokumenResult.data.jabatan_kerja || ''
            noSkema = dataDokumenResult.data.nomor_skema || ''
            tuk = dataDokumenResult.data.tuk || 'Sewaktu / Tempat Kerja / Mandiri'
            // Combine asesor 1 and 2
            namaAsesor = dataDokumenResult.data.asesor_1
              ? dataDokumenResult.data.asesor_2
                ? `${dataDokumenResult.data.asesor_1}, ${dataDokumenResult.data.asesor_2}`
                : dataDokumenResult.data.asesor_1
              : ''
          }
        }

        // Parse apl02 response
        let units: Unit[] = []
        let metodeFromApi: 'observasi' | 'portofolio' | undefined
        let barcodesFromApi: SubunitBarcodes | undefined

        if (apl02Response.ok) {
          const apl02Result: Apl02Response = await apl02Response.json()
          if (apl02Result.message === "Success" && apl02Result.data) {
            units = apl02Result.data.units || []
            metodeFromApi = apl02Result.data.metode
            barcodesFromApi = apl02Result.data.barcodes

            // Map subunit.kompeten to kukChecklist
            const newKukChecklist: Record<string, 'K' | 'BK'> = {}
            const newSubunitBarcodes: Record<string, SubunitBarcodes> = {}
            units.forEach(unit => {
              unit.subunits.forEach(subunit => {
                if (subunit.kompeten !== undefined) {
                  // Set same status for all KUKs in this subunit
                  subunit.kuk_list.forEach(kuk => {
                    const kukId = `${unit.id}-${subunit.id}-${kuk.no_kuk}`
                    newKukChecklist[kukId] = subunit.kompeten ? 'K' : 'BK'
                  })
                }
                // Store barcodes per subunit (prefer subunit-level barcodes, fallback to API-level)
                if (subunit.barcodes) {
                  newSubunitBarcodes[subunit.id] = subunit.barcodes
                } else if (barcodesFromApi) {
                  newSubunitBarcodes[subunit.id] = barcodesFromApi
                }
              })
            })

            // Only set if there are saved answers
            if (Object.keys(newKukChecklist).length > 0) {
              setKukChecklist(newKukChecklist)
            }
            // Set barcodes
            if (Object.keys(newSubunitBarcodes).length > 0) {
              setSubunitBarcodes(newSubunitBarcodes)
            }
          }
        }

        // Parse files response
        if (filesResponse.ok) {
          const filesResult = await filesResponse.json()
          if (filesResult.message === "Success" && filesResult.data) {
            setUploadedFilesInfo(filesResult.data)
          }
        }

        // Set metode from API
        if (metodeFromApi) {
          setMetodeAsesmen(metodeFromApi)
        }

        // Set combined data
        setApl02Data({
          jabatan_kerja: jabatanKerja,
          no_skema: noSkema,
          tuk: tuk,
          nama_asesor: namaAsesor,
          nama_asesi: namaAsesi || user?.name || '',
          tanggal: new Date().toLocaleDateString('id-ID'),
          metode: metodeFromApi,
          units: units,
        })
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
  }, [kegiatan, user, isAsesor, idIzinFromUrl, namaAsesi])

  useEffect(() => {
    if (initialFetchDone.current) return
    if ((isAsesor && idIzin) || kegiatan) {
      initialFetchDone.current = true
      window.scrollTo(0, 0)
      fetchData()
    }
  }, [kegiatan, isAsesor, idIzin, fetchData])

  // Check if all asesor signatures exist across all subunits
  const allAsesorSigned = (() => {
    if (isAsesor || asesorList.length === 0) return true
    const subunits = Object.values(subunitBarcodes)
    if (subunits.length === 0) return false
    return subunits.every(sb => {
      if (!sb.asesor1?.url) return false
      if (asesorList.length >= 2 && !sb.asesor2?.url) return false
      return true
    })
  })()

  const missingAsesorLabels = (() => {
    if (isAsesor || asesorList.length === 0 || allAsesorSigned) return []
    const missing: string[] = []
    const subunits = Object.values(subunitBarcodes)
    const anyMissingAsesor1 = subunits.some(sb => !sb.asesor1?.url)
    const anyMissingAsesor2 = asesorList.length >= 2 && subunits.some(sb => !sb.asesor2?.url)
    if (anyMissingAsesor1) missing.push("Asesor 1")
    if (anyMissingAsesor2) missing.push("Asesor 2")
    return missing
  })()

  // Polling for asesor signatures
  useEffect(() => {
    if (isAsesor || allAsesorSigned) return
    const interval = setInterval(async () => {
      if (document.visibilityState !== "visible") return
      await fetchData()
    }, ASESOR_SIGNATURE_POLLING_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isAsesor, allAsesorSigned, fetchData])

  const handleSubmit = async () => {
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    // Guard: asesi cannot submit until all asesor have signed
    if (!isAsesor && !allAsesorSigned) {
      showWarning(`Menunggu tanda tangan: ${missingAsesorLabels.join(', ')}`)
      return
    }

    // Jika asesor, generate QR lalu navigate
    if (isAsesor) {
      const finalIdIzin = idIzinFromUrl || _idIzin
      if (!finalIdIzin) {
        showWarning("ID Izin tidak ditemukan")
        return
      }

      // Cek apakah QR asesor sudah ada sebelum generate QR
      const asesorIndex = asesorList.findIndex(a => String(a.id) === String(user?.id))
      const isAsesor1 = asesorIndex === 0 || asesorIndex === -1

      // Ambil salah satu subunit untuk cek barcode
      const firstSubunitId = apl02Data?.units?.[0]?.subunits?.[0]?.id
      const existingBarcode = firstSubunitId ? subunitBarcodes[firstSubunitId] : null
      const hasExistingAsesorQR = isAsesor1 ? existingBarcode?.asesor1?.url : existingBarcode?.asesor2?.url

      // Generate QR untuk asesor hanya jika belum ada
      if (jadwalId && !hasExistingAsesorQR) {
        setIsSaving(true)
        try {
          const token = localStorage.getItem("access_token")

          

          const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${finalIdIzin}/apl02`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_jadwal: jadwalId
            })
          })

          

          if (qrResponse.ok) {
            const qrResult = await qrResponse.json()
            

            if (qrResult.message === "Success" && qrResult.data?.url_image) {
              // Tentukan asesor1 atau asesor2 berdasarkan index di asesorList
              
              const asesorIndex = asesorList.findIndex(a => String(a.id) === String(user?.id))
              

              // Kalau ga ketemu di list, default ke asesor1
              const isAsesor1 = asesorIndex === 0 || asesorIndex === -1
              const isAsesor2 = asesorIndex === 1

              // Ambil semua subunit IDs dari apl02Data
              const subunitIds: string[] = []
              apl02Data?.units.forEach(unit => {
                unit.subunits.forEach(subunit => {
                  subunitIds.push(subunit.id)
                })
              })

              

              // Update atau buat barcode entries untuk semua subunit
              setSubunitBarcodes(prev => {
                const updated = { ...prev }
                subunitIds.forEach(subunitId => {
                  const existing = updated[subunitId]
                  updated[subunitId] = {
                    asesi: existing?.asesi || { url: null, tanggal: null, nama: null },
                    asesor1: isAsesor1
                      ? { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || null }
                      : existing?.asesor1 || null,
                    asesor2: isAsesor2
                      ? { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name || null }
                      : existing?.asesor2 || null
                  }
                })
                
                return updated
              })

              showSuccess('Dokumen berhasil ditandatangani!')
              // Delay sedikit biar user bisa lihat QR sebelum navigate
              setTimeout(() => {
                navigate(`/asesi/praasesmen/${finalIdIzin}/mapa01`)
              }, 1500)
              return
            } else {
              
            }
          } else {
            
          }
        } catch (qrError) {
          console.error('Error generating QR:', qrError)
        } finally {
          setIsSaving(false)
        }
      } else {
        
      }

      navigate(`/asesi/praasesmen/${finalIdIzin}/mapa01`)
      return
    }

    // Asesi - save data dulu
    const finalIdIzin = _idIzin || idIzin
    if (!finalIdIzin) {
      showWarning("ID Izin tidak ditemukan")
      return
    }

    // Convert kukChecklist to answers array (per subunit)
    // First, collect all KUK data grouped by subunit
    const subunitDataMap = new Map<number, { statuses: ('K' | 'BK')[]; allFileIds: Set<number> }>()

    Object.entries(kukChecklist).forEach(([kukId, status]) => {
      // kukId format: "unitId-subunitId-kukNo"
      const parts = kukId.split('-')
      const subunitId = parseInt(parts[1])

      if (!subunitDataMap.has(subunitId)) {
        subunitDataMap.set(subunitId, { statuses: [], allFileIds: new Set() })
      }

      const data = subunitDataMap.get(subunitId)!
      data.statuses.push(status)

      // Add user-selected file IDs (filter out excluded API files)
      const fileIds = kukBukti[kukId] || []
      fileIds.forEach(id => {
        if (!excludedApiFileIds.has(id)) {
          data.allFileIds.add(id)
        }
      })
    })

    // Also include API files from subunits that are NOT excluded
    apl02Data?.units.forEach(unit => {
      unit.subunits.forEach(subunit => {
        const subunitId = parseInt(subunit.id)
        if (subunitDataMap.has(subunitId)) {
          const data = subunitDataMap.get(subunitId)!
          subunit.files.forEach(file => {
            if (!excludedApiFileIds.has(file.id)) {
              data.allFileIds.add(file.id)
            }
          })
        }
      })
    })

    // Convert to answers array format
    // kompeten = true if ALL KUKs in subunit are 'K'
    const answers = Array.from(subunitDataMap.entries()).map(([subunitId, data]) => ({
      subunit_id: subunitId,
      kompeten: data.statuses.every(s => s === 'K'),
      file_ids: Array.from(data.allFileIds)
    }))

    // Check if all subunits have been answered
    if (apl02Data?.units) {
      let totalSubunits = 0
      apl02Data.units.forEach(unit => {
        totalSubunits += unit.subunits.length
      })

      if (answers.length === 0) {
        showWarning("Silakan isi penilaian K/BK untuk semua Kriteria Unjuk Kerja")
        return
      }
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${finalIdIzin}/apl02`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metode: metodeAsesmen,
          is_dilanjutkan: true,
          answers
        }),
      })

      if (response.ok) {
        // Generate QR jika belum ada dan jadwalId tersedia
        if (jadwalId) {
          // Cek apakah ada subunit yang belum punya barcode asesi
          const hasMissingBarcode = apl02Data?.units.some(unit =>
            unit.subunits.some(subunit => !subunit.barcodes?.asesi?.url)
          )

          if (hasMissingBarcode) {
            try {
              const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${finalIdIzin}/apl02`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  id_jadwal: jadwalId
                })
              })

              if (qrResponse.ok) {
                const qrResult = await qrResponse.json()
                if (qrResult.message === "Success" && qrResult.data?.url_image) {
                  // Update barcodes state - untuk display
                  // Karena barcode sama untuk semua subunit, update semua
                  const newBarcodes: Record<string, SubunitBarcodes> = {}
                  apl02Data?.units.forEach(unit => {
                    unit.subunits.forEach(subunit => {
                      newBarcodes[subunit.id] = {
                        asesi: {
                          url: qrResult.data.url_image,
                          tanggal: new Date().toISOString(),
                          nama: user?.name || null
                        },
                        asesor1: subunit.barcodes?.asesor1 || null,
                        asesor2: subunit.barcodes?.asesor2 || null
                      }
                    })
                  })
                  setSubunitBarcodes(newBarcodes)
                }
              }
            } catch (qrError) {
              console.error('Error generating QR:', qrError)
              // Continue even if QR generation fails
            }
          }
        }

        showSuccess('APL 02 berhasil disimpan!')
        setTimeout(() => {
          navigate(`/asesi/praasesmen/${finalIdIzin}/mapa01`)
        }, 500)
      } else {
        showError('Gagal menyimpan data APL 02')
      }
    } catch (error) {
      console.error('Error saving APL02:', error)
      showError(error instanceof Error ? error.message : "Gagal menyimpan data APL 02")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data APL 02..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span>FR APL 02</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={3} idIzin={_idIzin || idIzin}>
            <div style={{ marginBottom: '20px', marginLeft: '16px' }}>
              <h1 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '10px', textTransform: 'uppercase' }}>
                APL-02 ASESMEN MANDIRI<br />{apl02Data?.jabatan_kerja || '-'}
              </h1>
            </div>

        {/* Upload File Section */}
        {!isAsesor && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', marginBottom: '20px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}> 
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upload Bukti Dokumen</span>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Upload dokumen pendukung untuk digunakan di kolom bukti</p>
            </div>
            {uploadedFilesInfo.length > 0 && (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
                {uploadedFilesInfo.length} File
              </div>
            )}
          </div>

          {/* Drop Zone - asesor only */}
          {isAsesor && (
          <div
            onClick={() => document.getElementById('file-upload-input')?.click()}
            style={{
              border: '2px dashed #0066cc',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0052a3'
              e.currentTarget.style.background = 'linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#0066cc'
              e.currentTarget.style.background = 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📁</div>
            <p style={{ fontSize: '14px', color: '#333', margin: 0, fontWeight: '500' }}>
              <span style={{ color: '#0066cc', textDecoration: 'underline' }}>Klik untuk upload</span>
            </p>
            <p style={{ fontSize: '11px', color: '#888', margin: '6px 0 0 0' }}>PDF, JPG, PNG, DOC, DOCX (Maks. 5MB per file)</p>
          </div>
          )}

          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {/* Uploaded Files List */}
          {uploadedFilesInfo.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                File yang Diupload ({uploadedFilesInfo.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {uploadedFilesInfo.map((file) => (
                  <ServerFileCapsule
                    key={file.id}
                    file={file}
                    onDelete={deleteFile}
                    disabled={isAsesor || isSaving}
                    isAsesor={isAsesor}
                    onView={(file) => {
                      console.log('onView callback triggered - isAsesor:', isAsesor, 'file:', file)
                      setSelectedPreviewFile(file)
                      setShowPreview(true)
                      console.log('State updated - showPreview:', true, 'selectedPreviewFile:', file)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        )}
        {/* Notice */}
        <div style={{ background: '#fff9e6', border: '1px solid #e6b800', marginBottom: '20px', padding: '12px' }}>
          <p style={{ fontSize: '12px', color: '#000', margin: 0 }}>
            <strong>CATATAN:</strong> K = Kompeten, BK = Belum Kompeten. Isi kolom bukti dengan dokumen pendukung yang Anda miliki.
          </p>
        </div>

        {/* Header Table */}
        {apl02Data && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '25%', fontWeight: 'bold', verticalAlign: 'top', textTransform: 'uppercase' }}>
                  Skema Sertifikasi<br />
                  <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</span>
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '12%', fontWeight: 'bold', textTransform: 'uppercase' }}>Judul</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.jabatan_kerja}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nomor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.no_skema}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>TUK</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.tuk || '-'}</td>
              </tr>
              {asesorList.length > 1 ? (
                asesorList.map((asesor, idx) => (
                  <tr key={asesor.id}>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesor {idx + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                    <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{asesor.nama || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesor</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.nama_asesor || asesorList[0]?.nama || '-'}</td>
                </tr>
              )}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesi</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || apl02Data.nama_asesi || user?.name || '-'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.tanggal || '-'}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Panduan */}
        <div style={{ background: '#c00000', color: '#fff', padding: '6px 8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Panduan Asesmen Mandiri
        </div>
        <div style={{ background: '#fff', border: '1px solid #000', marginBottom: '20px', fontSize: '11px' }}>
          <div style={{ padding: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Instruksi:</div>
            <ul style={{ margin: '4px 0 4px 20px', padding: 0 }}>
              <li>Baca setiap pertanyaan di kolom sebelah kiri</li>
              <li>Beri tanda centang (√) pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan</li>
              <li>Isi kolom di sebelah kanan dengan mendaftar bukti yang Anda miliki</li>
            </ul>
          </div>
        </div>

        {/* Daftar Unit Kompetensi */}
        {apl02Data?.units.map((unit, unitIndex) => (
          <table key={unit.id} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '11px' }}>
            <tbody>
              {/* Unit Title */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '4px', width: '22%', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Kode & Judul<br />Kompetensi {unitIndex + 1} :
                </td>
                <td colSpan={5} style={{ border: '1px solid #000', padding: '4px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{unit.kode}</div>
                  <div>{unit.judul_kompetensi}</div>
                </td>
              </tr>

              {/* Header Row - DAPATKAH SAYA ? */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>DAPATKAH SAYA ?</td>
                <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>K</td>
                <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>BK</td>
                <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>Bukti</td>
              </tr>

              {/* Subunits & KUK */}
              {unit.subunits.map((subunit) => (
                <React.Fragment key={subunit.id}>
                  {/* Elemen Header */}
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '4px' }}>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Elemen {subunit.no_elemen} :</span><br />
                      {subunit.judul_elemen}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                    <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  </tr>

                  {/* Kriteria Unjuk Kerja Header */}
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Kriteria Unjuk Kerja:
                    </td>
                  </tr>

                  {/* KUK Rows */}
                  {subunit.kuk_list.map((kuk) => {
                    const kukId = `${unit.id}-${subunit.id}-${kuk.no_kuk}`
                    const isCheckedK = kukChecklist[kukId] === 'K'
                    const isCheckedBK = kukChecklist[kukId] === 'BK'

                    return (
                      <tr key={kuk.no_kuk}>
                        <td style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>
                          {kuk.no_kuk} {kuk.judul_kuk}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', verticalAlign: 'top' }}>
                          <CustomRadio
                            name={kukId}
                            value="K"
                            checked={isCheckedK}
                            onChange={() => !isAsesor && !isSaving && handleCheckboxChange(kukId, 'K', unit.id, subunit.id)}
                            disabled={true}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', verticalAlign: 'top' }}>
                          <CustomRadio
                            name={kukId}
                            value="BK"
                            checked={isCheckedBK}
                            onChange={() => !isAsesor && !isSaving && handleCheckboxChange(kukId, 'BK', unit.id, subunit.id)}
                            disabled={true}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top' }}>
                          {(() => {
                            const selectedFileIds = kukBukti[kukId] || []

                            // Get API files (from subunit.files) and user-uploaded files
                            const apiFiles = subunit.files || []
                            const userUploadedFiles = selectedFileIds
                              .map(id => uploadedFilesInfo.find(f => f.id === id))
                              .filter((f): f is { id: number; name: string; path: string } => f !== undefined)

                            return (
                              <>
                                {/* API Files as Static Capsules (can be excluded) - clickable for asesor to view */}
                                {apiFiles.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                    {apiFiles.map((file) => {
                                      const isExcluded = excludedApiFileIds.has(file.id)
                                      return (
                                        <AnimatedCapsule
                                          key={file.id}
                                          fileName={file.name}
                                          file={file}
                                          isExcluded={isExcluded}
                                          isAsesor={isAsesor}
                                          onView={(file) => {
                                            console.log('API file onView triggered:', file.name)
                                            setSelectedPreviewFile(file)
                                            setShowPreview(true)
                                          }}
                                          onRemove={() => {
                                            if (!isAsesor) {
                                              setExcludedApiFileIds(prev => {
                                                const newSet = new Set(prev)
                                                if (newSet.has(file.id)) {
                                                  newSet.delete(file.id)
                                                } else {
                                                  newSet.add(file.id)
                                                }
                                                return newSet
                                              })
                                            }
                                          }}
                                        />
                                      )
                                    })}
                                  </div>
                                )}

                                {/* User-selected Files as Animated Capsules (can be removed by asesi only) */}
                                {userUploadedFiles.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                    {userUploadedFiles.map((file) => (
                                      <AnimatedCapsule
                                        key={file.id}
                                        fileName={file.name}
                                        file={file}
                                        isAsesor={isAsesor}
                                        onView={(file) => {
                                          console.log('User file onView triggered:', file.name)
                                          setSelectedPreviewFile(file)
                                          setShowPreview(true)
                                        }}
                                        onRemove={() => {
                                          if (!isAsesor) removeBuktiFile(kukId, file.id)
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* Bukti Dropdown - enabled for asesi, disabled for asesor */}
                                <BuktiDropdown
                                  kukId={kukId}
                                  uploadedFiles={uploadedFilesInfo}
                                  selectedFileIds={selectedFileIds}
                                  onSelectFile={(kukId, fileId) => handleBuktiChange(kukId, fileId, unit.id, subunit.id)}
                                  disabled={isAsesor || isSaving}
                                />
                              </>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ))}

        {/* Rekomendasi Untuk Asesi */}
        <div style={{ padding: '8px 12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>REKOMENDASI UNTUK ASESI</span>
        </div>

        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            {/* Rekomendasi & Asesi Row 1 */}
            <tr>
              <td rowSpan={3 + (asesorList.length > 0 ? asesorList.length * 4 : 3)} style={{ width: '30%', border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
                <span style={{ fontWeight: 'bold' }}>Rekomendasi Untuk Asesi: Asesmen dapat / tidak dapat dilanjutkan melalui pendekatan</span><br /><br />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isAsesor ? 'pointer' : 'not-allowed' }}>
                  <CustomCheckbox
                    checked={metodeAsesmen === 'observasi'}
                    onChange={() => isAsesor && setMetodeAsesmen('observasi')}
                    disabled={!isAsesor}
                  />
                  <span>Observasi</span>
                </label>
                {parseInt(jenjang || '0') >= 4 && (
                  <>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isAsesor ? 'pointer' : 'not-allowed' }}>
                      <CustomCheckbox
                        checked={metodeAsesmen === 'portofolio'}
                        onChange={() => isAsesor && setMetodeAsesmen('portofolio')}
                        disabled={!isAsesor}
                      />
                      <span>Portofolio</span>
                    </label>
                  </>
                )}
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesi :</td>
            </tr>
            {/* Asesi Row 2 */}
            <tr>
              <td style={{ width: '20%', border: '1px solid #000', padding: '8px' }}>Nama</td>
              <td style={{ width: '25%', border: '1px solid #000', padding: '8px' }}>{namaAsesi?.toUpperCase() || apl02Data?.nama_asesi?.toUpperCase() || user?.name?.toUpperCase() || ''}</td>
            </tr>
            {/* Asesi Row 3 - Signature */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
              <td style={{ height: '120px', border: '1px solid #000', padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
                {(() => {
                  // Get first available asesi barcode
                  const firstAsesiBarcode = Object.values(subunitBarcodes).find(b => b.asesi?.url)?.asesi
                  if (firstAsesiBarcode?.url) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <img
                          src={firstAsesiBarcode.url}
                          alt="Tanda Tangan Asesi"
                          style={{ height: '70px', width: '70px', objectFit: 'contain' }}
                        />
                        {firstAsesiBarcode.tanggal && (
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                            {new Date(firstAsesiBarcode.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return null
                })()}
              </td>
            </tr>

            {/* Dynamic Asesor Rows */}
            {asesorList.length > 0 ? (
              asesorList.map((asesor, idx) => {
                // Get barcode for this asesor (idx 0 = asesor1, idx 1 = asesor2)
                const firstSubunitId = Object.keys(subunitBarcodes)[0]
                const asesorBarcode = firstSubunitId
                  ? (idx === 0 ? subunitBarcodes[firstSubunitId]?.asesor1 : subunitBarcodes[firstSubunitId]?.asesor2)
                  : null

                return (
                  <React.Fragment key={asesor.id}>
                    {idx === 0 && (
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
                      </tr>
                    )}
                    {idx > 0 && (
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesor :</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>Nama Asesor {asesorList.length > 1 ? idx + 1 : ''} :</td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.nama?.toUpperCase() || ''}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.noreg || ''}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                      <td style={{ height: '120px', border: '1px solid #000', padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
                        {asesorBarcode?.url ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <img
                              src={asesorBarcode.url}
                              alt={`Tanda Tangan ${asesor.nama}`}
                              style={{ height: '70px', width: '70px', objectFit: 'contain' }}
                            />
                            {asesorBarcode.tanggal && (
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                                {new Date(asesorBarcode.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })
            ) : (
              // Fallback static Asesor
              <>
                <tr>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>Nama Asesor :</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{apl02Data?.nama_asesor?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                  <td style={{ height: '120px', border: '1px solid #000', padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {(() => {
                      const firstSubunitId = Object.keys(subunitBarcodes)[0]
                      const asesor1Barcode = firstSubunitId ? subunitBarcodes[firstSubunitId]?.asesor1 : null
                      if (asesor1Barcode?.url) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <img
                              src={asesor1Barcode.url}
                              alt="Tanda Tangan Asesor"
                              style={{ height: '70px', width: '70px', objectFit: 'contain' }}
                            />
                            {asesor1Barcode.tanggal && (
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                                {new Date(asesor1Barcode.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Agreement Checklist */}
        <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <CustomCheckbox
              checked={agreedChecklist}
              onChange={() => setAgreedChecklist(!agreedChecklist)}
            />
            <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
              <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen APL 02 (Asesmen Mandiri) ini dengan sebenar-benarnya.
            </span>
          </label>
        </div>

        <AsesorSignatureGuard
          missingAsesorLabels={missingAsesorLabels}
          allAsesorSigned={allAsesorSigned}
          isAsesor={isAsesor}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton variant="secondary" onClick={() => navigate(-1)} disabled={isSaving}>
            Kembali
          </ActionButton>
          <ActionButton variant="primary" disabled={isSaving || !agreedChecklist || (!isAsesor && !allAsesorSigned)} onClick={handleSubmit}>
            {isSaving ? "Menyimpan..." : "Simpan & Selesaikan"}
          </ActionButton>
        </div>
      </AsesiLayout>

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Pra-Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />

      {/* Document Preview Modal for Asesor */}
      <DocumentPreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false)
          setSelectedPreviewFile(null)
        }}
        file={selectedPreviewFile}
      />
    </div>
  )
}
