import { ReactNode } from "react"
import ModularStepIndicator from "./ModularStepIndicator"

interface ModularAsesiLayoutProps {
  children: ReactNode
  currentStep: number
  steps: { number: number; label: string; href?: string }[]
  id?: string
}

export default function ModularAsesiLayout({ children, currentStep, steps, id }: ModularAsesiLayoutProps) {
  return (
    <div style={{ display: 'flex', gap: '30px', padding: '20px', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start' }}>
      {/* Sidebar - Vertical Steps (Sticky) */}
      <div style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
        <ModularStepIndicator currentStep={currentStep} steps={steps} id={id} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
