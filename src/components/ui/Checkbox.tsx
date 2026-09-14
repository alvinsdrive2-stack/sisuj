import React, { useRef } from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (shiftKey?: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  style?: React.CSSProperties
}

export const CustomCheckbox = React.memo(function CustomCheckbox({
  checked,
  onChange,
  disabled = false,
  id,
  className = '',
  style,
}: CheckboxProps) {
  const generatedId = useRef(`checkbox-${Math.random().toString(36).substring(7)}`)
  const uniqueId = id || generatedId.current
  const shiftRef = useRef(false)

  // Kalau caller matiin pointer-events di wrapper (pola 'checkbox display-only',
  // klik-nya di-handle parent), label wajib ikut mati. CSS `.checkbox-wrapper
  // .check-box` maksa `pointer-events: auto`, jadi tanpa ini klik di kotaknya
  // tetap kena label → label nerusin klik ke input → onClick parent jalan 2x dan
  // toggle-nya jadi netral, keliatan kayak kotaknya gak bisa dipencet.
  const labelPointerEvents = style?.pointerEvents

  return (
    <div
      className={`checkbox-wrapper ${className}`}
      style={{...style, cursor: disabled ? 'not-allowed' : 'auto'}}
      onMouseDown={(e) => { shiftRef.current = e.shiftKey }}
    >
      <input
        type="checkbox"
        id={uniqueId}
        checked={checked}
        onChange={() => onChange(shiftRef.current)}
        disabled={disabled}
      />
      <label
        htmlFor={uniqueId}
        className="check-box"
        style={{
          opacity: disabled ? 0.5 : 1,
          ...(labelPointerEvents ? { pointerEvents: labelPointerEvents } : null),
        }}
      >
      </label>
    </div>
  )
})
