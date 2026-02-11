import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { ActionButton } from "@/components/ui/ActionButton"

interface UploadedFile {
  id: number
  nama_file: string
  path_file: string
  created_at: string
}

interface UploadResponse {
  message: string
  data: UploadedFile
}

export default function UploadTugasPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)
  const { asesorList } = useDataDokumenAsesmen(id)
  const { showSuccess, showError } = useToast()

  // Check if user is an asesor (view-only mode)
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const isReadOnly = isAsesor

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [_isLoading, setIsLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  // Get dynamic steps
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  // Fetch existing uploaded files
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      if (!id) return

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/upload-tugas`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: { message: string; data: UploadedFile[] } = await response.json()
          if (result.message === "Success") {
            setUploadedFiles(result.data || [])
          }
        }
      } catch (error) {
        console.error("Error fetching uploaded files:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUploadedFiles()
  }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ]
      const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.jpg', '.jpeg', '.png']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        showError('Format file tidak didukung. Gunakan PDF, PPT, PPTX, JPG, atau PNG.')
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        showError('Ukuran file terlalu besar. Maksimal 10MB.')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !id) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem("access_token")
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/upload-tugas`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result: UploadResponse = await response.json()
        setUploadedFiles([...uploadedFiles, result.data])
        setSelectedFile(null)
        showSuccess('File berhasil diupload!')
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const error = await response.json()
        showError(error.message || 'Gagal mengupload file')
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      showError('Terjadi kesalahan saat mengupload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: number) => {
    if (!id) return

    if (!confirm('Hapus file ini?')) return

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/upload-tugas/${fileId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId))
        if (previewFile?.id === fileId) {
          setPreviewFile(null)
        }
        showSuccess('File berhasil dihapus!')
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      alert('Gagal menghapus file')
    }
  }

  const getEmbedUrl = (filePath: string) => {
    // Using Google Docs Viewer for preview
    const baseUrl = 'https://docs.google.com/viewer?url='
    const encodedUrl = encodeURIComponent(filePath)
    return `${baseUrl}${encodedUrl}&embedded=true`
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'ppt':
      case 'pptx':
        return '📊'
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️'
      default:
        return '📁'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => user?.role?.name === 'asesor' ? navigate("/asesor/dashboard") : navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>{isReadOnly ? 'Review Tugas' : 'Upload Tugas'}</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('upload-tugas'))?.number || 2} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
            {isReadOnly ? 'REVIEW TUGAS TERSTRUKTUR' : 'UPLOAD TUGAS TERSTRUKTUR'}
          </h2>
          <p style={{ fontSize: '13px', color: '#666' }}>
            {isReadOnly ? 'Berikut adalah tugas terstruktur yang telah diupload oleh Asesi' : 'Silakan upload tugas terstruktur Anda sesuai instruksi'}
          </p>
        </div>

        {/* Upload area - hide for asesor (view-only) */}
        {!isReadOnly && (
        <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#f0f0f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 21 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Upload File Tugas</p>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Format: PDF, PPT, PPTX, JPG, PNG (Max 10MB)</p>
          </div>

          {selectedFile ? (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#0066cc', marginBottom: '8px' }}>File terpilih: {selectedFile.name}</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  style={{
                    padding: '8px 16px',
                    background: isUploading ? '#999' : '#10b981',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  {isUploading ? 'Mengupload...' : 'Upload'}
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  style={{
                    padding: '8px 16px',
                    background: '#fff',
                    color: '#000',
                    fontSize: '14px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    border: '1px solid #999',
                    borderRadius: '4px'
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <label
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#0066cc',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Pilih File
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '12px' }}>File yang Diupload</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#f9f9f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '24px' }}>{getFileIcon(file.nama_file)}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', margin: 0 }}>{file.nama_file}</p>
                      <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
                        {new Date(file.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setPreviewFile(file)}
                      style={{
                        padding: '6px 12px',
                        background: '#0066cc',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      Lihat
                    </button>
                    {!isReadOnly && (
                    <button
                      onClick={() => handleDelete(file.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#dc2626',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      Hapus
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setPreviewFile(null)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '1000px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{previewFile.nama_file}</h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
                >
                  ×
                </button>
              </div>
              <div style={{ flex: 1, padding: '16px', overflow: 'auto', background: '#f5f5f5' }}>
                {previewFile.nama_file.toLowerCase().endsWith('.png') || previewFile.nama_file.toLowerCase().endsWith('.jpg') || previewFile.nama_file.toLowerCase().endsWith('.jpeg') ? (
                  <img src={previewFile.path_file} alt={previewFile.nama_file} style={{ maxWidth: '100%', height: 'auto' }} />
                ) : previewFile.nama_file.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewFile.path_file} style={{ width: '100%', height: '70vh', border: 'none' }} />
                ) : (
                  <iframe
                    src={getEmbedUrl(previewFile.path_file)}
                    style={{ width: '100%', height: '70vh', border: 'none' }}
                    title={previewFile.nama_file}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreedChecklist}
                onChange={(e) => setAgreedChecklist(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan bahwa file yang saya upload adalah hasil karya sendiri dan tidak melanggar hak cipta pihak lain. Saya bersedia bertanggung jawab atas keaslian dokumen yang saya sertakan.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={() => navigate(`/asesi/asesmen/${id}/ia04a`)}>
              Kembali
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={!agreedChecklist}
              onClick={() => {
                if (!agreedChecklist) return
                navigate(`/asesi/asesmen/${id}/ia04b`)
              }}
            >
              Lanjut
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
