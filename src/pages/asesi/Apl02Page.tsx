import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { File, Trash2, Check, FileImage, FileType } from 'lucide-react'
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { CustomRadio } from "@/components/ui/Radio"

// ============== ANIMATED COMPONENTS ==============

// Animated Capsule/Chip with smooth entry and exit
interface AnimatedCapsuleProps {
  fileName: string
  onRemove: () => void
  isExcluded?: boolean // For API files that are excluded
  style?: React.CSSProperties
}

function AnimatedCapsule({ fileName, onRemove, isExcluded, style }: AnimatedCapsuleProps) {
  const [isExiting, setIsExiting] = useState(false)
  const capsuleRef = useRef<HTMLSpanElement>(null)

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove()
    }, 200)
  }

  return (
    <span
      ref={capsuleRef}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        height: '38px',
        background: isExcluded ? '#fee' : '#f5f5f5',
        border: isExcluded ? '1px solid #fca5a5' : '1px solid #ddd',
        borderRadius: '6px',
        padding: '0 12px',
        fontSize: '12px',
        fontWeight: '500',
        color: isExcluded ? '#991b1b' : '#333',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transform: isExiting ? 'scale(0.9) translateX(-10px)' : 'scale(1) translateX(0)',
        opacity: isExiting ? 0 : (isExcluded ? 0.6 : 1),
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isExiting) {
          e.currentTarget.style.background = isExcluded ? '#fecaca' : '#eee'
          e.currentTarget.style.borderColor = isExcluded ? '#f87171' : '#ccc'
        }
      }}
      onMouseLeave={(e) => {
        if (!isExiting) {
          e.currentTarget.style.background = isExcluded ? '#fee' : '#f5f5f5'
          e.currentTarget.style.borderColor = isExcluded ? '#fca5a5' : '#ddd'
        }
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <File size={14} style={{ color: isExcluded ? '#dc2626' : '#666' }} />
        <span style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {fileName}
        </span>
      </span>
      <button
        onClick={handleRemove}
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
    </span>
  )
}

// Server File Capsule with delete button for uploaded files
interface ServerFileCapsuleProps {
  file: { id: number; name: string; path: string }
  onDelete: (fileId: number) => void
  disabled?: boolean
}

function ServerFileCapsule({ file, onDelete, disabled }: ServerFileCapsuleProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleDelete = () => {
    if (disabled) return
    if (confirm(`Hapus file "${file.name}" dari server?`)) {
      setIsExiting(true)
      setTimeout(() => {
        onDelete(file.id)
      }, 200)
    }
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        height: '38px',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '0 12px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#333',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transform: isExiting ? 'scale(0.9) translateX(-10px)' : 'scale(1) translateX(0)',
        opacity: isExiting ? 0 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isExiting) {
          e.currentTarget.style.background = '#eee'
          e.currentTarget.style.borderColor = '#ccc'
        }
      }}
      onMouseLeave={(e) => {
        if (!isExiting) {
          e.currentTarget.style.background = '#f5f5f5'
          e.currentTarget.style.borderColor = '#ddd'
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
      {!disabled && (
        <button
          onClick={handleDelete}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#999',
            cursor: disabled ? 'not-allowed' : 'pointer',
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
            if (!isExiting && !disabled) {
              e.currentTarget.style.background = '#dc2626'
              e.currentTarget.style.color = '#fff'
            }
          }}
          onMouseLeave={(e) => {
            if (!isExiting) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#999'
            }
          }}
          title="Hapus file dari server"
        >
          <Trash2 size={12} />
        </button>
      )}
    </span>
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

interface KUK {
  no_kuk: string
  judul_kuk: string
}

interface File {
  id: number
  name: string
  path: string
}

interface Subunit {
  id: string
  no_elemen: string
  judul_elemen: string
  kompeten?: boolean
  kuk_list: KUK[]
  files: File[]
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
    units: Unit[]
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
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  // Use idIzin from URL when accessed by asesor, otherwise use from user context
  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { asesorList, namaAsesi } = useDataDokumenPraAsesmen(idIzin)
  const { showSuccess, showError, showWarning } = useToast()

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

  const handleCheckboxChange = (kukId: string, value: 'K' | 'BK') => {
    setKukChecklist(prev => {
      const current = prev[kukId]
      if (current === value) {
        // Uncheck if clicking the same value
        const { [kukId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [kukId]: value }
    })
  }

  const handleBuktiChange = (kukId: string, fileId: number) => {
    setKukBukti(prev => {
      const currentFiles = prev[kukId] || []
      if (currentFiles.includes(fileId)) {
        // Remove file if already selected
        return {
          ...prev,
          [kukId]: currentFiles.filter(f => f !== fileId)
        }
      } else {
        // Add file to selection
        return {
          ...prev,
          [kukId]: [...currentFiles, fileId]
        }
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

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
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

        if (apl02Response.ok) {
          const apl02Result: Apl02Response = await apl02Response.json()
          if (apl02Result.message === "Success" && apl02Result.data) {
            units = apl02Result.data.units || []
            metodeFromApi = apl02Result.data.metode

            // Map subunit.kompeten to kukChecklist
            const newKukChecklist: Record<string, 'K' | 'BK'> = {}
            units.forEach(unit => {
              unit.subunits.forEach(subunit => {
                if (subunit.kompeten !== undefined) {
                  // Set same status for all KUKs in this subunit
                  subunit.kuk_list.forEach(kuk => {
                    const kukId = `${unit.id}-${subunit.id}-${kuk.no_kuk}`
                    newKukChecklist[kukId] = subunit.kompeten ? 'K' : 'BK'
                  })
                }
              })
            })

            // Only set if there are saved answers
            if (Object.keys(newKukChecklist).length > 0) {
              setKukChecklist(newKukChecklist)
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
    }

    if (isAsesor && idIzin) {
      fetchData()
    } else if (kegiatan) {
      fetchData()
    }
  }, [kegiatan, user, isAsesor, idIzinFromUrl])

  const handleSubmit = async () => {
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    // Jika asesor, langsung navigate tanpa save
    if (isAsesor) {
      const finalIdIzin = idIzinFromUrl || _idIzin
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

      <AsesiLayout currentStep={3}>
            <div style={{ marginBottom: '20px', marginLeft: '16px' }}>
              <h1 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '10px', textTransform: 'uppercase' }}>
                APL-02 ASESMEN MANDIRI<br />{apl02Data?.jabatan_kerja || '-'}
              </h1>
            </div>

        {/* Upload File Section */}
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

          {/* Drop Zone */}
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

          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            style={{ display: 'none' }}
            onChange={async (e) => {
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
            }}
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
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
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
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', textTransform: 'uppercase' }}>{apl02Data.nama_asesor || '-'}</td>
              </tr>
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
                            onChange={() => !isAsesor && !isSaving && handleCheckboxChange(kukId, 'K')}
                            disabled={isAsesor || isSaving}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '4px', width: '4%', textAlign: 'center', verticalAlign: 'top' }}>
                          <CustomRadio
                            name={kukId}
                            value="BK"
                            checked={isCheckedBK}
                            onChange={() => !isAsesor && !isSaving && handleCheckboxChange(kukId, 'BK')}
                            disabled={isAsesor || isSaving}
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
                                {/* API Files as Static Capsules (can be excluded) */}
                                {apiFiles.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                    {apiFiles.map((file) => {
                                      const isExcluded = excludedApiFileIds.has(file.id)
                                      return (
                                        <AnimatedCapsule
                                          key={file.id}
                                          fileName={file.name}
                                          isExcluded={isExcluded}
                                          onRemove={() => {
                                            setExcludedApiFileIds(prev => {
                                              const newSet = new Set(prev)
                                              if (newSet.has(file.id)) {
                                                newSet.delete(file.id)
                                              } else {
                                                newSet.add(file.id)
                                              }
                                              return newSet
                                            })
                                          }}
                                        />
                                      )
                                    })}
                                  </div>
                                )}

                                {/* User-selected Files as Animated Capsules (can be removed) */}
                                {userUploadedFiles.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                    {userUploadedFiles.map((file) => (
                                      <AnimatedCapsule
                                        key={file.id}
                                        fileName={file.name}
                                        onRemove={() => removeBuktiFile(kukId, file.id)}
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* Bukti Dropdown - no delay, uses own state */}
                                <BuktiDropdown
                                  kukId={kukId}
                                  uploadedFiles={uploadedFilesInfo}
                                  selectedFileIds={selectedFileIds}
                                  onSelectFile={handleBuktiChange}
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
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'not-allowed' }}>
                  <CustomCheckbox
                    checked={metodeAsesmen === 'observasi'}
                    onChange={() => {}}
                    disabled
                  />
                  <span>Observasi</span>
                </label>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'not-allowed' }}>
                  <CustomCheckbox
                    checked={metodeAsesmen === 'portofolio'}
                    onChange={() => {}}
                    disabled
                  />
                  <span>Portofolio</span>
                </label>
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
              <td style={{ height: '150px', border: '1px solid #000', padding: '8px' }}></td>
            </tr>

            {/* Dynamic Asesor Rows */}
            {asesorList.length > 0 ? (
              asesorList.map((asesor, idx) => (
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
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Nama :</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.nama?.toUpperCase() || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                    <td style={{ height: '90px', border: '1px solid #000', padding: '8px' }}></td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              // Fallback static Asesor
              <>
                <tr>
                  <td></td>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>Nama :</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{apl02Data?.nama_asesor?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                  <td style={{ height: '90px', border: '1px solid #000', padding: '8px' }}></td>
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

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(-1)}
            disabled={isSaving}
            style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '12px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1, textTransform: 'uppercase', fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !agreedChecklist}
            style={{ padding: '8px 16px', background: agreedChecklist ? '#0066cc' : '#999', color: '#fff', fontSize: '12px', cursor: isSaving || !agreedChecklist ? 'not-allowed' : 'pointer', border: 'none', opacity: isSaving || !agreedChecklist ? 0.5 : 1, textTransform: 'uppercase', fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {isSaving ? "Menyimpan..." : "Simpan & Selesaikan"}
          </button>
        </div>
      </AsesiLayout>
    </div>
  )
}
