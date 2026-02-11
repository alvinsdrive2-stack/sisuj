import { ReactNode } from "react"
import ModularStepIndicator from "./ModularStepIndicator"
import { LoopingVideoBackground } from "@/components/ui/LoopingVideoBackground"
import loopVideo from "@/assets/Sequence 01.mp4"

interface ModularAsesiLayoutProps {
  children: ReactNode
  currentStep: number
  steps: { number: number; label: string; href?: string }[]
  id?: string
}

export default function ModularAsesiLayout({ children, currentStep, steps, id }: ModularAsesiLayoutProps) {
  return (
    <>
      <LoopingVideoBackground videoSrc={loopVideo} />
      <div style={{ display: 'flex', gap: '30px', padding: '20px', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        {/* Sidebar - Vertical Steps (Sticky) */}
        <div style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
          <ModularStepIndicator currentStep={currentStep} steps={steps} id={id} />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 , backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {children}
        </div>
      </div>
    </>
  )
}
