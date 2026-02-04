/**
 * CheckboxItem.tsx
 * Simple checkbox with label component
 */

interface CheckboxItemProps {
  text: string
  inline?: boolean
}

export function CheckboxItem({ text, inline = false }: CheckboxItemProps) {
  if (inline) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <input type="checkbox" style={{ cursor: 'pointer', width: '14px', height: '14px' }} />
        <span style={{ fontSize: '12px', color: '#000' }}>{text}</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
      <input type="checkbox" style={{ cursor: 'pointer', width: '14px', height: '14px', marginTop: '2px' }} />
      <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.4' }}>{text}</span>
    </div>
  )
}
