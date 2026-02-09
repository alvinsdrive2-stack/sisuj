interface Step {
  number: number
  label: string
}

interface AsesiStepIndicatorProps {
  currentStep: number
}

const steps: Step[] = [
  { number: 1, label: 'Konfirmasi' },
  { number: 2, label: 'APL 01' },
  { number: 3, label: 'APL 02' },
  { number: 4, label: 'MAPA 01' },
  { number: 5, label: 'MAPA 02' },
  { number: 6, label: 'AK.07' },
  { number: 7, label: 'AK.04' },
  { number: 8, label: 'K3' },
  { number: 9, label: 'AK.01' },
  { number: 10, label: 'Selesai' },
]

export default function AsesiStepIndicator({ currentStep }: AsesiStepIndicatorProps) {
  // Get the class name for the step circle based on status
  const getStepCircleClassName = (status: string) => {
    if (status === 'active') {
      return 'animate-blue-pulse'
    }
    return ''
  }
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'active'
    return 'pending'
  }

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          background: '#4caf50',
          iconColor: '#fff',
          borderColor: '#4caf5000'
        }
      case 'active':
        return {
          background: '#0066cc',
          iconColor: '#fff',
          borderColor: '#0066cc'
        }
      default:
        return {
          background: '#f5f5f5',
          iconColor: '#aaa',
          borderColor: '#ddd'
        }
    }
  }

  return (
    <div style={{
      position: 'sticky',
      top: '80px',
      width: '180px',
      flexShrink: 0
    }}>
      <br/>
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '16px', textTransform: 'uppercase' }}>
        Proses Pra-Asesmen
      </div>
      <div style={{ position: 'relative' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '14px',
          top: '12px',
          bottom: '12px',
          width: '3px',
          background: '#ddd'
        }}></div>

        {/* Steps */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.number)
          const style = getStepStyle(status)

          return (
            <div key={step.number} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: index < steps.length - 1 ? '24px' : '0', position: 'relative' }}>
              {/* Step Circle */}
              <div
                className={getStepCircleClassName(status)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: style.background,
                  color: style.iconColor,
                  border: '3px solid',
                  borderColor: status === 'completed' ? '#4caf50' : style.borderColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: status === 'pending' ? 'normal' : 'bold',
                  flexShrink: 0,
                  zIndex: 1,
                }}>
                {status === 'completed' ? '\u2713' : step.number}
              </div>
              {/* Label */}
              <span style={{
                marginLeft: '14px',
                fontSize: '14px',
                color: '#333',
                fontWeight: status === 'pending' ? 'normal' : '600',
                paddingTop: '6px'
              }}>
                {step.label}
              </span>
              {/* Completed Line Segment */}
              {status !== 'pending' && index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '36px',
                  width: '3px',
                  height: 'calc(100% - 36px)',
                  background: '#0066cc',
                  zIndex: 0
                }}></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
