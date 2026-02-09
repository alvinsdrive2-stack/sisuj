import { useNavigate } from "react-router-dom"

interface Step {
  number: number
  label: string
  href?: string
}

interface ModularStepIndicatorProps {
  currentStep: number
  steps: Step[]
  id?: string
}

export default function ModularStepIndicator({ currentStep, steps, id }: ModularStepIndicatorProps) {
  const navigate = useNavigate()

  // Get the class name for the step circle based on status
  const getStepCircleClassName = (status: string) => {
    if (status === 'active') {
      return 'animate-blue-pulse'
    }
    return ''
  }

  const getHref = (href: string | undefined) => {
    if (!href) return undefined
    if (id && href.startsWith('/asesi/asesmen/')) {
      // Insert id after /asesi/asesmen/
      const parts = href.split('/')
      if (parts[3] === 'asesmen') {
        parts.splice(4, 0, id)
        return parts.join('/')
      }
    }
    return href
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
      width: '200px',
      flexShrink: 0
    }}>
      <br/>
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '16px', textTransform: 'uppercase' }}>
        Progress
      </div>
      <div style={{ position: 'relative' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '18px',
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
                  width: '36px',
                  height: '36px',
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
                  cursor: status !== 'pending' && step.href ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (status !== 'pending' && step.href) {
                    const href = getHref(step.href)
                    if (href) navigate(href)
                  }
                }}
              >
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
