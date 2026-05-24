import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"

const TIMER_DURATION_MS = 60 * 60 * 1000 // 1 hour

interface UseIa05TimerOptions {
  idIzin: string | undefined
  onExpired?: () => void
}

interface UseIa05TimerReturn {
  remainingSeconds: number
  isExpired: boolean
  isPaused: boolean
}

export function useIa05Timer({ idIzin, onExpired }: UseIa05TimerOptions): UseIa05TimerReturn {
  const { user } = useAuth()
  const isAsesi = user?.role?.name?.toLowerCase() === 'asesi'
  const [remainingMs, setRemainingMs] = useState(TIMER_DURATION_MS)
  const [isExpired, setIsExpired] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  const sessionKey = `ia05_timer_${idIzin}`

  const getNextStep = useCallback((): string | null => {
    if (!idIzin) return null
    return `/asesi/asesmen/${idIzin}/ak02`
  }, [idIzin])

  useEffect(() => {
    if (!isAsesi || !idIzin) return

    const storedStart = sessionStorage.getItem(sessionKey)

    if (storedStart) {
      const elapsed = Date.now() - parseInt(storedStart, 10)
      const remaining = TIMER_DURATION_MS - elapsed
      if (remaining <= 0) {
        setIsExpired(true)
        sessionStorage.removeItem(sessionKey)
        onExpired?.()
        const next = getNextStep()
        if (next) navigate(next)
        return
      }
      setRemainingMs(remaining)
    } else {
      sessionStorage.setItem(sessionKey, Date.now().toString())
      setRemainingMs(TIMER_DURATION_MS)
    }

    timerRef.current = setInterval(() => {
      setRemainingMs(prev => {
        const next = prev - 1000
        if (next <= 0) {
          setIsExpired(true)
          sessionStorage.removeItem(sessionKey)
          onExpired?.()
          const nextPath = getNextStep()
          if (nextPath) navigate(nextPath)
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isAsesi, idIzin])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setIsPaused(true)
      } else {
        setIsPaused(false)
        timerRef.current = setInterval(() => {
          setRemainingMs(prev => {
            const next = prev - 1000
            if (next <= 0) {
              setIsExpired(true)
              sessionStorage.removeItem(sessionKey)
              onExpired?.()
              const nextPath = getNextStep()
              if (nextPath) navigate(nextPath)
              return 0
            }
            return next
          })
        }, 1000)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [idIzin, getNextStep])

  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  return { remainingSeconds, isExpired, isPaused }
}
