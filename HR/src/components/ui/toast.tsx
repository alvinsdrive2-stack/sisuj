let toastCallback: ((message: string, type: 'success' | 'error' | 'warning' | 'info') => void) | null = null

export function setToastCallback(callback: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void) {
  toastCallback = callback
}

export function toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  if (toastCallback) {
    toastCallback(message, type)
  }
}

export function Toaster() {
  return null
}
