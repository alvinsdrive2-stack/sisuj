import { CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

interface SuccessAnimationProps {
  message?: string
  onComplete?: () => void
  duration?: number
}

export function SuccessAnimation({
  message = "Berhasil disimpan!",
  onComplete,
  duration = 1500,
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onComplete?.(), 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-3 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-scale-in"
            style={{ animationDelay: '0.1s' }} />
        </div>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{message}</p>
      </div>
    </div>
  )
}
