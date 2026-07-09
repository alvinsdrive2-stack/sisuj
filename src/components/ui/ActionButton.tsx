import React from "react"
import { SimpleSpinner } from "./loading-spinner"

interface ActionButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
  style?: React.CSSProperties
}

export function ActionButton({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary'
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
        inline-flex items-center justify-center gap-2
        ${isPrimary
          ? 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80'
          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={style}
    >
      {loading && <SimpleSpinner size="sm" className={isPrimary ? 'text-white' : 'text-primary'} />}
      {children}
    </button>
  )
}
