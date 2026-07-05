import { ReactNode, useState } from "react"

export interface PreviewStep {
  type: string
  label: string
}

export const PREVIEW_STEPS: PreviewStep[] = [
  { type: 'apl01', label: 'APL 01' },
  { type: 'apl02', label: 'APL 02' },
  { type: 'mapa01', label: 'MAPA 01' },
  { type: 'mapa02', label: 'MAPA 02' },
  { type: 'ia01', label: 'IA 01' },
  { type: 'ia02', label: 'IA 02' },
  { type: 'ia03', label: 'IA 03' },
  { type: 'ia04a', label: 'IA 04.A' },
  { type: 'ia04b', label: 'IA 04.B' },
  { type: 'ia05', label: 'IA 05' },
  { type: 'ia08', label: 'IA 08' },
  { type: 'ia09', label: 'IA 09' },
  { type: 'ak02', label: 'AK 02' },
  { type: 'ak03', label: 'AK 03' },
]

interface PreviewFlowLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  currentDocType: string
  jabatanKerja?: string
  onPrev: (() => void) | null
  onNext: (() => void) | null
  onBackToIndex: () => void
}

export default function PreviewFlowLayout({
  children,
  currentStep,
  totalSteps,
  currentDocType,
  jabatanKerja,
  onPrev,
  onNext,
  onBackToIndex,
}: PreviewFlowLayoutProps) {
  const [showSteps, setShowSteps] = useState(false)

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { background: '#4caf50', borderColor: '#4caf50' }
      case 'active':
        return { background: '#0066cc', borderColor: '#0066cc' }
      default:
        return { background: '#f5f5f5', borderColor: '#ddd' }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      {/* Breadcrumb bar */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666', alignItems: 'center' }}>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={onBackToIndex}
            >
              Dashboard
            </span>
            <span>/</span>
            <span>Preview Soal</span>
            <span>/</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {PREVIEW_STEPS[currentStep]?.label || currentDocType.toUpperCase()}
            </span>
            {jabatanKerja && (
              <>
                <span style={{ color: '#999' }}>|</span>
                <span style={{ color: '#666', fontSize: '12px' }}>{jabatanKerja}</span>
              </>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div style={{ display: 'flex', gap: '30px', padding: '20px', maxWidth: '1720px', margin: '0 auto', alignItems: 'flex-start' }}>
        {/* Step Indicator Sidebar - desktop */}
        <div className="hidden lg:block" style={{ position: 'sticky', top: '80px', width: '200px', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '16px', textTransform: 'uppercase' }}>
            Preview Flow
          </div>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: '18px', top: '12px', bottom: '12px', width: '3px', background: '#ddd' }} />

            {PREVIEW_STEPS.map((step, idx) => {
              const status = getStepStatus(idx)
              const style = getStepStyle(status)
              return (
                <div
                  key={step.type}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: idx < PREVIEW_STEPS.length - 1 ? '20px' : '0',
                    position: 'relative',
                    opacity: status === 'pending' ? 0.5 : 1,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: style.background,
                      color: '#fff',
                      border: '3px solid',
                      borderColor: style.borderColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      zIndex: 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <span style={{
                    marginLeft: '14px',
                    fontSize: '13px',
                    color: status === 'pending' ? '#999' : '#333',
                    fontWeight: status === 'pending' ? 'normal' : '600',
                    paddingTop: '7px',
                  }}>
                    {step.label}
                  </span>
                  {status !== 'pending' && idx < PREVIEW_STEPS.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '18px',
                      top: '36px',
                      width: '3px',
                      height: 'calc(100% - 36px)',
                      background: status === 'completed' ? '#4caf50' : '#0066cc',
                      zIndex: 0,
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full" style={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {children}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
            {onPrev && (
              <button
                onClick={onPrev}
                style={{
                  padding: '8px 24px',
                  fontSize: '13px',
                  border: '1px solid #999',
                  background: '#fff',
                  color: '#333',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                &larr; Sebelumnya
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                style={{
                  padding: '8px 24px',
                  fontSize: '13px',
                  border: 'none',
                  background: '#0066cc',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                Selanjutnya &rarr;
              </button>
            )}
            {!onNext && (
              <button
                onClick={onBackToIndex}
                style={{
                  padding: '8px 24px',
                  fontSize: '13px',
                  border: 'none',
                  background: '#4caf50',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                Selesai
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating step button - mobile */}
      <button
        className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: '#0d2137', color: '#fff', border: 'none' }}
        onClick={() => setShowSteps(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      {/* Steps modal - mobile */}
      {showSteps && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSteps(false)}>
          <div className="w-full rounded-t-2xl" style={{ background: '#fff', maxHeight: '70vh', overflowY: 'auto', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: '#ddd' }} />
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '16px', textTransform: 'uppercase' }}>
              Preview Flow
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '18px', top: '12px', bottom: '12px', width: '3px', background: '#ddd' }} />
              {PREVIEW_STEPS.map((step, idx) => {
                const status = getStepStatus(idx)
                const style = getStepStyle(status)
                return (
                  <div key={step.type} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: idx < PREVIEW_STEPS.length - 1 ? '20px' : '0', position: 'relative', opacity: status === 'pending' ? 0.5 : 1 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: style.background, color: '#fff', border: '3px solid', borderColor: style.borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0, zIndex: 1 }}>
                      {status === 'completed' ? '✓' : idx + 1}
                    </div>
                    <span style={{ marginLeft: '14px', fontSize: '13px', color: status === 'pending' ? '#999' : '#333', fontWeight: status === 'pending' ? 'normal' : '600', paddingTop: '7px' }}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
