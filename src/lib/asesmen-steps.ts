// Step configurations for different asesmen flows

export interface StepConfig {
  number: number
  label: string
  href: string
}

// Pra-Asesmen Steps
export const PRAASESMEN_STEPS: StepConfig[] = [
  { number: 1, label: 'Konfirmasi', href: '/asesi/praasesmen' },
  { number: 2, label: 'APL 01', href: '/asesi/praasesmen/APL01' },
  { number: 3, label: 'APL 02', href: '/asesi/praasesmen/APL02' },
  { number: 4, label: 'MAPA 01', href: '/asesi/praasesmen/MAPA01' },
  { number: 5, label: 'MAPA 02', href: '/asesi/praasesmen/MAPA02' },
  { number: 6, label: 'AK.07', href: '/asesi/praasesmen/AK07' },
  { number: 7, label: 'AK.04', href: '/asesi/praasesmen/AK04' },
  { number: 8, label: 'K3', href: '/asesi/praasesmen/K3' },
  { number: 9, label: 'AK.01', href: '/asesi/praasesmen/AK01' },
  { number: 10, label: 'Selesai', href: '/asesi/praasesmen/selesai' },
]

// Asesmen Steps for Asesi (default)
export const ASESMEN_STEPS_ASESI: StepConfig[] = [
  { number: 1, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 2, label: 'Upload Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 3, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 4, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 5, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 1 (full flow)
export const ASESMEN_STEPS_ASESOR_1: StepConfig[] = [
  { number: 1, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 2, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 3, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 4, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 7, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 8, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 2 (without AK.03)
export const ASESMEN_STEPS_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 2, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 3, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 4, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 7, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Default asesmen steps (backward compatibility)
export const ASESMEN_STEPS: StepConfig[] = ASESMEN_STEPS_ASESI

// Get asesmen steps based on asesor role
export function getAsesmenSteps(isAsesor: boolean, asesorRole: 'asesor_1' | 'asesor_2' | 'asesor_other' | 'none', _asesorCount: number): StepConfig[] {
  if (!isAsesor) {
    return ASESMEN_STEPS_ASESI
  }

  if (asesorRole === 'asesor_1') {
    return ASESMEN_STEPS_ASESOR_1
  }

  if (asesorRole === 'asesor_2') {
    return ASESMEN_STEPS_ASESOR_2
  }

  // For asesor_other (asesor 3+), use same steps as asesor_2 for now
  return ASESMEN_STEPS_ASESOR_2
}

// Helper function to get current step number from href
export function getStepNumberFromHref(steps: StepConfig[], currentHref: string): number {
  const step = steps.find(s => currentHref.includes(s.href))
  return step?.number || 1
}
