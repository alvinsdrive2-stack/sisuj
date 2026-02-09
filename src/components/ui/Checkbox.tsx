import React from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  id?: string
  className?: string
  style?: React.CSSProperties
}

export function CustomCheckbox({
  checked,
  onChange,
  disabled = false,
  id,
  className = '',
  style,
}: CheckboxProps) {
  const uniqueId = id || `checkbox-${Math.random().toString(36).substring(7)}`

  return (
    <div className={`checkbox-wrapper ${className}`} style={style}>
      <input
        type="checkbox"
        id={uniqueId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label
        htmlFor={uniqueId}
        className="check-box"
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
      </label>
    </div>
  )
}
