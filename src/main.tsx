import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BRANDING } from '@/config/branding'
import App from './App.tsx'

// Inject primary color CSS variable dari env
document.documentElement.style.setProperty('--primary', BRANDING.primaryHsl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
