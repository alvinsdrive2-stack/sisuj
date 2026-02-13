import { useEffect, useState, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile, faFileText, faChevronLeft, faChevronRight, faEye, faClose } from "@fortawesome/free-solid-svg-icons"
import { SimpleSpinner } from "@/components/ui/loading-spinner"

interface DokumenResponse {
  message: string
  data: {
    [key: string]: string | null
  }
}

interface DokumenItem {
  key: string
  label: string
  url: string | null
  docType: string
}

interface DokumenModalProps {
  isOpen: boolean
  onClose: () => void
  asesiId: string
  asesiNama: string
}

export function DokumenModal({ isOpen, onClose, asesiId, asesiNama }: DokumenModalProps) {
  const [dokumenResponse, setDokumenResponse] = useState<DokumenResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DokumenItem | null>(null)
  const documentListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDokumen = async () => {
      if (!isOpen || !asesiId) return

      setIsLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/dokumen/asesi/${asesiId}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          setDokumenResponse(result)
        }
      } catch (err) {
        console.error('Error fetching dokumen:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDokumen()
  }, [isOpen, asesiId])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoc(null)
    }
  }, [isOpen])

  // Build document list from data object
  const documentList: DokumenItem[] = dokumenResponse?.data
    ? Object.entries(dokumenResponse.data).map(([docType, url]) => ({
        key: `${asesiId}-${docType}`,
        label: docType.toUpperCase().replace('_', ' '),
        url: url || null,
        docType: docType,
      }))
    : []

  // Get only documents that have URLs
  const documentsWithUrls = documentList.filter(doc => doc.url !== null)

  // Auto-select first document when modal opens
  useEffect(() => {
    if (isOpen && !selectedDoc && documentsWithUrls.length > 0) {
      setSelectedDoc(documentsWithUrls[0])
    }
  }, [isOpen, documentsWithUrls])

  // Auto-scroll to selected document
  useEffect(() => {
    if (selectedDoc && documentListRef.current) {
      const selectedElement = documentListRef.current.querySelector(`[data-doc-key="${selectedDoc.key}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedDoc])

  const goToPrevDoc = () => {
    if (!selectedDoc) return
    const currentIndex = documentsWithUrls.findIndex(d => d.key === selectedDoc.key)
    if (currentIndex > 0) {
      setSelectedDoc(documentsWithUrls[currentIndex - 1])
    }
  }

  const goToNextDoc = () => {
    if (!selectedDoc) {
      // Select first document if none selected
      const firstDoc = documentsWithUrls[0]
      if (firstDoc) setSelectedDoc(firstDoc)
      return
    }
    const currentIndex = documentsWithUrls.findIndex(d => d.key === selectedDoc.key)
    if (currentIndex < documentsWithUrls.length - 1) {
      setSelectedDoc(documentsWithUrls[currentIndex + 1])
    }
  }


  const getFileType = (url: string) => {
    if (!url) return 'unknown'
    const extension = url.split('.').pop()?.toLowerCase() || ''
    return extension
  }

  const getPdfUrl = (url: string) => {
    const fileType = getFileType(url)
    if (fileType === 'pdf') {
      return url + '#toolbar=0&navpanes=0&scrollbar=0'
    }
    return url
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'modalSlideIn 0.3s ease-out',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          padding: '10px 12px',
          borderBottom: '1px solid #e5e7eb',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
            <FontAwesomeIcon icon={faFileText} style={{ fontSize: '20px', color: '#10b981' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Daftar Dokumen - {asesiNama}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#6b7280',
              transition: 'all 0.2s'

            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FontAwesomeIcon icon={faClose} style={{ fontSize: '18px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '24px',
          flex: 1,
          display: 'flex',
        }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', width: '100%' }}>
              <SimpleSpinner size="lg" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', width: '100%' }}>
              {/* Left - Document List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '16px', textTransform: 'uppercase', marginLeft: '60px' }}>
                  Daftar Dokumen
                </h4>
                <div
                  ref={documentListRef}
                  style={{
                    position: 'relative',
                    marginLeft: '80px',
                    overflowY: 'hidden',
                    maxHeight: 'calc(90vh - 180px)',
                    paddingRight: '10px'
                  }}>
                  {/* Vertical Line */}
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '12px',
                    bottom: '12px',
                    width: '3px',
                    background: '#ddd',
                    transform: 'translateX(10px)',
                    height: '88vh',
                  }}></div>

                  {/* Documents */}
                  {documentList.map((doc, index) => {
                    const hasDocument = !!doc.url
                    const isSelected = selectedDoc?.key === doc.key

                    return (
                      <div
                        key={doc.key}
                        data-doc-key={doc.key}
                        onClick={() => hasDocument ? setSelectedDoc(doc) : null}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          marginBottom: index < documentList.length - 1 ? '24px' : '0px',
                          position: 'relative',
                          cursor: hasDocument ? 'pointer' : 'not-allowed',
                          transform: index == 15 ? 'translateY(2px)' : 'translateY(2px)',
                        }}
                      >
                        {/* Document Circle */}
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: isSelected
                              ? '#10b981'
                              : hasDocument
                                ? '#059669'
                                : '#f5f5f5',
                            color: isSelected
                              ? '#fff'
                              : hasDocument
                                ? '#fff'
                                : '#aaa',
                            border: '3px solid',
                            borderColor: isSelected
                              ? '#10b981'
                              : hasDocument
                                ? '#059669'
                                : '#ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: hasDocument ? 'bold' : 'normal',
                            flexShrink: 0,
                            zIndex: 1,
                            transition: 'all 0.3s ease',
                            transform: isSelected ? 'scale(1.1) translateX(10px)' : 'scale(1) translateX(10px)'
                          }}>
                          {isSelected ? (
                            <FontAwesomeIcon icon={faEye} style={{ color: 'white', fontSize: '12px' }} />
                          ) : hasDocument ? (
                            index + 1
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Label */}
                        <span style={{
                          marginLeft: '14px',
                          fontSize: '14px',
                          color: isSelected
                            ? '#10b981'
                            : hasDocument
                              ? '#059669'
                              : '#333',
                          fontWeight: isSelected || hasDocument ? '600' : 'normal',
                          paddingTop: '6px',
                          flex: 1,
                          transition: 'all 0.3s ease',
                          transform: isSelected ? 'translateX(10px)' : 'translateX(10px)'
                        }}>
                          {doc.label}
                          {!hasDocument && (
                            <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal', marginLeft: '8px' }}>
                              (Belum ada)
                            </span>
                          )}
                        </span>

                        {/* Completed Line Segment */}
                        {hasDocument && index < documentList.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '18px',
                            top: '36px',
                            width: '3px',
                            height: 'calc(100% - 36px)',
                            background: '#10b981',
                            zIndex: 0
                          }}></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right - Document Preview */}
              <div>
                <div style={{ borderRadius: '12px', height: '70vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {selectedDoc ? (
                    <>
                    

                    {/* Preview Area */}
                    <div style={{
                      flex: 1,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      margin: '0 16px 16px 16px',
                      minHeight: '50vh'
                    }}>
                      {['pdf', 'ppt', 'pptx'].includes(getFileType(selectedDoc.url || '')) ? (
                        <object
                          data={getPdfUrl(selectedDoc.url || '')}
                          type={getFileType(selectedDoc.url || '') === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                        >
                          <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading preview...
                          </p>
                        </object>
                      ) : selectedDoc.url ? (
                        <img
                          src={selectedDoc.url}
                          alt={selectedDoc.label}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                          <FontAwesomeIcon icon={faFile} style={{ fontSize: '48px', marginBottom: '16px' }} />
                          <p style={{ fontSize: '14px', fontWeight: '500' }}>
                            File tidak tersedia
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Floating Navigation */}
                    
                    </>
                  ) : (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      minHeight: '55vh'
                    }}>
                      <FontAwesomeIcon icon={faFile} style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <p style={{ fontSize: '15px', fontWeight: '500' }}>
                        Pilih dokumen untuk melihat preview
                      </p>
                    </div>
                    )}
                </div>
              </div>
            </div>
            )}
        </div>{isLoading ? null : (
        <div style={{
                      position: 'absolute',
                      bottom: '30px',
                      left: '50%',
                      transform: 'translateX(-8%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#fff',
                      padding: '8px 16px',
                      borderRadius: '50px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e5e7eb',
                      zIndex: 10
                    }}>
                      <button
                        onClick={goToPrevDoc}
                        disabled={documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) <= 0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          background: documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) > 0 ? '#10b981' : '#e5e7eb',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '600',
                          borderRadius: '20px',
                          border: 'none',
                          cursor: documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) > 0 ? 'pointer' : 'not-allowed',
                          opacity: documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) > 0 ? 1 : 0.5,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) > 0) {
                            e.currentTarget.style.background = '#059669'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) > 0) {
                            e.currentTarget.style.background = '#10b981'
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '12px' }} />
                        Sebelumnya
                      </button>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', minWidth: '50px', textAlign: 'center' }}>
                        {documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) + 1} / {documentsWithUrls.length}
                      </span>
                      <button
                        onClick={goToNextDoc}
                        disabled={documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) >= documentsWithUrls.length - 1}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          background: documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) < documentsWithUrls.length - 1 ? '#10b981' : '#e5e7eb',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '600',
                          borderRadius: '20px',
                          border: 'none',
                          cursor: documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) < documentsWithUrls.length - 1 ? 'pointer' : 'not-allowed',
                          opacity: documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) < documentsWithUrls.length - 1 ? 1 : 0.5,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) < documentsWithUrls.length - 1) {
                            e.currentTarget.style.background = '#059669'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (documentsWithUrls.findIndex(d => d.key === selectedDoc?.key) < documentsWithUrls.length - 1) {
                            e.currentTarget.style.background = '#10b981'
                          }
                        }}
                      >
                        Berikutnya
                        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12px' }} />
                      </button>
                    </div>)}
      </div>
    </div>
    )
  }
