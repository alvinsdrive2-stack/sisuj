import { ReactNode } from "react"
import AsesiStepIndicator from "./AsesiStepIndicator"

interface AsesiLayoutProps {
  children: ReactNode
  currentStep: number
}

export default function AsesiLayout({ children, currentStep }: AsesiLayoutProps) {
  return (
    <div style={{ display: 'flex', gap: '30px', padding: '20px', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start' }}>
      {/* Sidebar - Vertical Steps (Sticky) */}
      <div style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
        <AsesiStepIndicator currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
