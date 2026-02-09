import React from 'react'

interface ExportPdfButtonProps {
  /**
   * ID of the element to export
   */
  targetId?: string
  /**
   * Filename for the exported PDF (without .pdf extension)
   */
  filename?: string
  /**
   * Button text
   */
  label?: string
  /**
   * Custom button className
   */
  className?: string
  /**
   * Custom button style
   */
  style?: React.CSSProperties
}

export default function ExportPdfButton({
  targetId,
  label = 'Export PDF',
  className = '',
  style
}: ExportPdfButtonProps) {
  const [isPrinting, setIsPrinting] = React.useState(false)

  const handleClick = () => {
    if (!targetId) {
      console.error('No targetId provided')
      return
    }
    const element = document.getElementById(targetId)
    if (!element) {
      console.error(`Element with id "${targetId}" not found`)
      return
    }

    setIsPrinting(true)
    // Simple print using window.print
    const originalContents = document.body.innerHTML
    const printContents = element.innerHTML

    document.body.innerHTML = printContents
    window.print()

    // Restore original content after print dialog closes
    setTimeout(() => {
      document.body.innerHTML = originalContents
      setIsPrinting(false)
      window.location.reload()
    }, 100)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPrinting}
        className={className}
        style={{
          padding: '8px 16px',
          background: isPrinting ? '#999' : '#0066cc',
          color: '#fff',
          fontSize: '13px',
          cursor: isPrinting ? 'not-allowed' : 'pointer',
          border: 'none',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          ...style
        }}
      >
        {isPrinting && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="31.416"
              strokeOpacity="0.3"
            />
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="31.416"
              strokeDashoffset="10"
            />
          </svg>
        )}
        {!isPrinting && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 10V16M12 16L9 13M12 13L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 20H15C16.1046 20 17 19.1046 17 18V6C17 4.89543 16.1046 4 15 4H9C7.89543 4 7 4.89543 7 6V18C7 19.1046 7.89543 20 9 20Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isPrinting ? 'Mencetak...' : label}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
