import { ReactNode } from "react"
import AsesiStepIndicator from "./AsesiStepIndicator"

interface AsesiLayoutProps {
  children: ReactNode
  currentStep: number
  idIzin?: string
  tahap?: number
}

export default function AsesiLayout({ children, currentStep, idIzin, tahap }: AsesiLayoutProps) {
  return (
    <div style={{ display: 'flex', gap: '30px', padding: '20px', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start' }}>
      {/* Sidebar - Vertical Steps (Sticky) */}
      <div style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
        <AsesiStepIndicator currentStep={currentStep} idIzin={idIzin} tahap={tahap} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {children}
      </div>
    </div>
  )
}
