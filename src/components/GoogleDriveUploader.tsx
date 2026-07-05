import { useState, useRef, useCallback } from "react"
import favicon from "@/assets/favicon.png"

interface DriveUploaderProps {
  googleClientId: string | undefined
  folderName: string
  parentFolderId: string | undefined
  namaAsesi: string
  onUploadSuccess: (webViewLinks: string[]) => void
  onClose: () => void
}

type UploadState = "idle" | "uploading" | "success" | "error"

interface UploadFileInfo {
  name: string
  size: number
  type: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function getUploadStatusText(progress: number, phase: string, fileIndex: number, totalFiles: number): string {
  if (phase === "auth") return "Mengotentikasi ke Google..."
  if (phase === "upload") return `Mengupload file ${fileIndex} dari ${totalFiles}... ${progress}%`
  if (progress < 100) return `Mengupload... ${progress}%`
  if (phase === "saving") return "Menyimpan tautan..."
  if (phase === "success") return "Upload berhasil!"
  if (phase === "error") return "Upload gagal"
  return "Memproses..."
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    animation: 'driveModalIn 0.25s ease-out',
  } as React.CSSProperties,
  dropzone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '40px 24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafafa',
  } as React.CSSProperties,
  dropzoneActive: {
    borderColor: '#4285F4',
    backgroundColor: '#f0f7ff',
  } as React.CSSProperties,
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '16px',
  },
  progressBarFill: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #4285F4, #34A853)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  }),
  driveIcon: {
    width: '48px',
    height: '48px',
    marginBottom: '16px',
  },
}

export default function GoogleDriveUploader({
  googleClientId,
  folderName,
  parentFolderId,
  namaAsesi,
  onUploadSuccess,
  onClose,
}: DriveUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [selectedFiles, setSelectedFiles] = useState<UploadFileInfo[]>([])
  const [selectedFileBlobs, setSelectedFileBlobs] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedResults, setUploadedResults] = useState<{ name: string; link: string }[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const driveClient = useDriveClient()

  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      return `File "${file.name}" terlalu besar (${formatFileSize(file.size)}). Maksimal 5GB per file.`
    }
    if (!file.type.startsWith("video/")) {
      return `File "${file.name}" bukan video. Hanya file video yang didukung.`
    }
    return null
  }, [])

  const addFiles = useCallback((newFiles: FileList) => {
    const files = Array.from(newFiles)
    const valid: File[] = []
    const info: UploadFileInfo[] = []
    const errors: string[] = []

    for (const file of files) {
      const err = validateFile(file)
      if (err) {
        errors.push(err)
      } else {
        valid.push(file)
        info.push({ name: file.name, size: file.size, type: file.type })
      }
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join('\n'))
      setUploadState("error")
    }

    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...info])
      setSelectedFileBlobs(prev => [...prev, ...valid])
      setErrorMsg("")
      setUploadState("idle")
    }
  }, [validateFile])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setSelectedFileBlobs(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
  }, [addFiles])

  const startUpload = useCallback(async () => {
    if (selectedFileBlobs.length === 0 || !googleClientId) return

    setUploadState("uploading")
    setProgress(0)
    setPhase("auth")
    setErrorMsg("")
    setCurrentFileIndex(0)

    const results: { name: string; link: string }[] = []

    try {
      // Init drive & find/create folder sekali untuk semua file
      await driveClient.init(googleClientId)
      const folderId = await driveClient.findOrCreateFolder(folderName, parentFolderId)

      for (let i = 0; i < selectedFileBlobs.length; i++) {
        setCurrentFileIndex(i + 1)
        setPhase("auth")

        const result = await driveClient.uploadFile(
          selectedFileBlobs[i],
          folderId,
          (pct) => {
            setProgress(pct)
            if (pct > 0) setPhase("upload")
          }
        )

        results.push({ name: selectedFileBlobs[i].name, link: result.webViewLink })
      }

      setProgress(100)
      setPhase("saving")
      setUploadedResults(results)

      onUploadSuccess(results.map(r => r.link))

      setPhase("success")
      setUploadState("success")
    } catch (err: any) {
      console.error("Drive upload error:", err)
      const msg =
        err.message?.includes("user_cancelled")
          ? "Upload dibatalkan."
          : err.message || "Gagal upload ke Google Drive."
      setErrorMsg(msg)
      setPhase("error")
      setUploadState("error")
    }
  }, [selectedFileBlobs, googleClientId, folderName, parentFolderId, onUploadSuccess, driveClient])

  const resetUpload = useCallback(() => {
    setUploadState("idle")
    setSelectedFiles([])
    setSelectedFileBlobs([])
    setProgress(0)
    setPhase("")
    setErrorMsg("")
    setUploadedResults([])
    setCurrentFileIndex(0)
  }, [])

  const handleTryAgain = useCallback(() => {
    resetUpload()
  }, [resetUpload])

  return (
    <div style={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget && uploadState !== "uploading") onClose()
    }}>
      <style>{`
        @keyframes driveModalIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes drivePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes driveCheckIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes driveShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>

      <div style={styles.modal}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              Upload Video AJJ
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
              Unggah video asesmen <strong style={{ color: '#111827' }}>{namaAsesi}</strong> ke Google Drive
            </p>
          </div>
          {uploadState !== "uploading" && (
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px', borderRadius: '6px', color: '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* === IDLE STATE === */}
        {uploadState === "idle" && (
          <>
            {/* Dropzone */}
            <div
              style={{ ...styles.dropzone, ...(isDragOver ? styles.dropzoneActive : {}) }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <img src={favicon} alt="SISUJ" style={{ width: '48px', height: '48px', marginBottom: '16px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 4px' }}>
                {selectedFiles.length > 0 ? 'Klik untuk tambah file' : 'Klik untuk pilih video'}
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                atau seret file ke sini
              </p>
              <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '12px' }}>
                MP4, AVI, MKV, MOV, WEBM — Maks 5GB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,.mp4,.avi,.mkv,.mov,.webm"
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>
                  {selectedFiles.length} file dipilih:
                </p>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      border: '1px solid #e5e7eb', borderRadius: '10px',
                      padding: '10px 12px',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: '#f0f7ff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </p>
                        <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#6b7280' }}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '4px', borderRadius: '6px', color: '#9ca3af',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startUpload}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    width: '100%', padding: '14px', marginTop: '16px',
                    background: '#4285F4', color: '#fff', fontSize: '15px', fontWeight: '600',
                    border: 'none', borderRadius: '10px', cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(66,133,244,0.3)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#3367D6'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(66,133,244,0.4)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#4285F4'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(66,133,244,0.3)' }}
                >
                  <img src={favicon} alt="" style={{ width: '18px', height: '18px' }} />
                  Upload {selectedFiles.length} file ke Google Drive
                </button>
              </div>
            )}
          </>
        )}

        {/* === UPLOADING STATE === */}
        {uploadState === "uploading" && (
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px 20px',
            textAlign: 'center',
          }}>
            {/* Animated Drive icon */}
            <div style={{ animation: 'drivePulse 1.5s ease-in-out infinite', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <img src={favicon} alt="" style={{ width: '40px', height: '40px' }} />
            </div>

            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
              {currentFileIndex > 0 && selectedFiles.length > 0
                ? selectedFiles[currentFileIndex - 1]?.name || ''
                : selectedFiles[0]?.name || ''}
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>
              {getUploadStatusText(progress, phase, currentFileIndex, selectedFiles.length)}
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: '#4285F4' }}>
              {progress}%
            </p>

            {/* Progress bar */}
            <div style={styles.progressBarBg}>
              <div style={styles.progressBarFill(progress)} />
            </div>

            {/* Shimmer effect on progress */}
            <div style={{
              width: `${progress}%`,
              height: '8px',
              marginTop: '-8px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200px 100%',
              animation: progress < 100 ? 'driveShimmer 1.5s ease-in-out infinite' : 'none',
              position: 'relative',
            }} />

            <p style={{ marginTop: '12px', fontSize: '11px', color: '#9ca3af' }}>
              Jangan tutup halaman ini
            </p>
          </div>
        )}

        {/* === SUCCESS STATE === */}
        {uploadState === "success" && (
          <div style={{
            textAlign: 'center',
            padding: '16px 0',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#ecfdf5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
              animation: 'driveCheckIn 0.4s ease-out',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>
              Upload Berhasil!
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>
              {uploadedResults.length} file berhasil diupload ke Google Drive
            </p>

            {/* Uploaded files list */}
            {uploadedResults.length > 0 && (
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedResults.map((r, idx) => (
                    <a
                      key={idx}
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', background: '#f0f7ff',
                        border: '1px solid #93c5fd', borderRadius: '8px',
                        fontSize: '13px', color: '#1d4ed8', textDecoration: 'none',
                        wordBreak: 'break-all',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                display: 'block', width: '100%', padding: '12px',
                background: '#111827', color: '#fff', fontSize: '14px', fontWeight: '600',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
            >
              Selesai
            </button>
          </div>
        )}

        {/* === ERROR STATE === */}
        {uploadState === "error" && (
          <div style={{
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '24px 20px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#fee2e2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 12px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#991b1b' }}>
              Upload Gagal
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#b91c1c', whiteSpace: 'pre-line' }}>
              {errorMsg}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px',
                  background: '#fff', color: '#374151', fontSize: '14px', fontWeight: '600',
                  border: '1px solid #d1d5db', borderRadius: '10px', cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleTryAgain}
                style={{
                  flex: 1, padding: '12px',
                  background: '#4285F4', color: '#fff', fontSize: '14px', fontWeight: '600',
                  border: 'none', borderRadius: '10px', cursor: 'pointer',
                }}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to lazy-import google-drive helpers and avoid circular deps.
 */
function useDriveClient() {
  const init = useCallback(async (clientId: string) => {
    const mod = await import("@/lib/google-drive")
    await mod.initDriveClient(clientId)
  }, [])

  const findOrCreateFolder = useCallback(async (name: string, parentId?: string) => {
    const mod = await import("@/lib/google-drive")
    return mod.findOrCreateFolder(name, parentId)
  }, [])

  const uploadFile = useCallback(async (
    file: File,
    folderId: string,
    onProgress?: (pct: number) => void
  ) => {
    const mod = await import("@/lib/google-drive")
    return mod.uploadFileToDrive(file, folderId, onProgress)
  }, [])

  return { init, findOrCreateFolder, uploadFile }
}
