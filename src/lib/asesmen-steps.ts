// Step configurations for different asesmen flows

export interface StepConfig {
  number: number
  label: string
  href: string
}

// Pra-Asesmen Steps (Konfirmasi → APL 01 → APL 02)
export const PRAASESMEN_STEPS: StepConfig[] = [
  { number: 1, label: 'Konfirmasi', href: '/asesi/praasesmen' },
  { number: 2, label: 'APL 01', href: '/asesi/praasesmen/APL01' },
  { number: 3, label: 'APL 02', href: '/asesi/praasesmen/APL02' },
]

// MUK [Observasi/Portofolio] Steps
export const MUK_STEPS: StepConfig[] = [
  { number: 1, label: 'MAPA 01', href: '/asesi/praasesmen/:idIzin/mapa01' },
  { number: 2, label: 'MAPA 02', href: '/asesi/praasesmen/:idIzin/mapa02' },
  { number: 3, label: 'AK.07', href: '/asesi/praasesmen/:idIzin/ak07' },
  { number: 4, label: 'AK.04', href: '/asesi/praasesmen/:idIzin/ak04' },
  { number: 5, label: 'Tata Tertib dan K3', href: '/asesi/praasesmen/:idIzin/k3-asesmen' },
]

// Asesmen Steps for Asesi (default)
export const ASESMEN_STEPS_ASESI: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 3, label: 'Upload Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 4, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 5, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 6, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 7, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 8, label: 'Survei', href: '/asesi/asesmen/survei' },
  { number: 9, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesi (jenjang < 4) - IA01, IA02, IA03 instead of IA04A, IA04B
export const ASESMEN_STEPS_LOW_JENJAH_ASESI: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.01', href: '/asesi/asesmen/ia01' },
  { number: 3, label: 'IA.02', href: '/asesi/asesmen/ia02' },
  { number: 4, label: 'IA.03', href: '/asesi/asesmen/ia03' },
  { number: 5, label: 'Upload Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 6, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 7, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 8, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 9, label: 'Survei', href: '/asesi/asesmen/survei' },
  { number: 10, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 1 (jenjang < 4)
export const ASESMEN_STEPS_LOW_JENJAH_ASESOR_1: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.01', href: '/asesi/asesmen/ia01' },
  { number: 3, label: 'IA.02', href: '/asesi/asesmen/ia02' },
  { number: 4, label: 'IA.03', href: '/asesi/asesmen/ia03' },
  { number: 5, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 6, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 7, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 8, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 9, label: 'AK.05', href: '/asesi/asesmen/ak05' },
  { number: 10, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 11, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 2 (jenjang < 4)
export const ASESMEN_STEPS_LOW_JENJAH_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.01', href: '/asesi/asesmen/ia01' },
  { number: 3, label: 'IA.02', href: '/asesi/asesmen/ia02' },
  { number: 4, label: 'IA.03', href: '/asesi/asesmen/ia03' },
  { number: 5, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 6, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 7, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 8, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 9, label: 'AK.05', href: '/asesi/asesmen/ak05' },
  { number: 10, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 11, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 1 (full flow)
export const ASESMEN_STEPS_ASESOR_1: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 3, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 4, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 5, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 6, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 7, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 8, label: 'AK.05', href: '/asesi/asesmen/ak05' },
  { number: 9, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 10, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 2 (full flow)
export const ASESMEN_STEPS_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 3, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 4, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 5, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 6, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 7, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 8, label: 'AK.05', href: '/asesi/asesmen/ak05' },
  { number: 9, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 10, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Portofolio Method Steps (jenjang >= 4, metode = portofolio)
export const ASESMEN_STEPS_PORTOFOLIO_ASESI: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.08', href: '/asesi/asesmen/ia08' },
  { number: 3, label: 'IA.09', href: '/asesi/asesmen/ia09' },
  { number: 4, label: 'IA.10', href: '/asesi/asesmen/ia10' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 7, label: 'Survei', href: '/asesi/asesmen/survei' },
  { number: 8, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

export const ASESMEN_STEPS_PORTOFOLIO_ASESOR_1: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.08', href: '/asesi/asesmen/ia08' },
  { number: 3, label: 'IA.09', href: '/asesi/asesmen/ia09' },
  { number: 4, label: 'IA.10', href: '/asesi/asesmen/ia10' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 7, label: 'AK.05', href: '/asesi/asesmen/ak05' },
  { number: 8, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 9, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

export const ASESMEN_STEPS_PORTOFOLIO_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'AK.01', href: '/asesi/asesmen/ak01' },
  { number: 2, label: 'IA.08', href: '/asesi/asesmen/ia08' },
  { number: 3, label: 'IA.09', href: '/asesi/asesmen/ia09' },
  { number: 4, label: 'IA.10', href: '/asesi/asesmen/ia10' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 7, label: 'AK.05', href: '/asesi/asesmen/ak05' },
  { number: 8, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 9, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Default asesmen steps (backward compatibility)
export const ASESMEN_STEPS: StepConfig[] = ASESMEN_STEPS_ASESI

// Get asesmen steps based on jenjang_id, metode, and asesor role
export function getAsesmenSteps(
  jenjangId: string,
  isAsesor: boolean,
  asesorRole: 'asesor_1' | 'asesor_2' | 'asesor_other' | 'none' | undefined,
  _asesorCount: number,
  metode?: string
): StepConfig[] {
  const isLowJenjang = jenjangId && parseInt(jenjangId) < 4
  const isPortofolio = metode?.toLowerCase() === 'portofolio'

  if (isPortofolio && !isLowJenjang) {
    if (!isAsesor) return [...ASESMEN_STEPS_PORTOFOLIO_ASESI]
    if (asesorRole === 'asesor_1') return [...ASESMEN_STEPS_PORTOFOLIO_ASESOR_1]
    return [...ASESMEN_STEPS_PORTOFOLIO_ASESOR_2]
  }

  if (!isAsesor) return [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESI : ASESMEN_STEPS_ASESI)]
  if (asesorRole === 'asesor_1') return [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_1 : ASESMEN_STEPS_ASESOR_1)]
  return [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_2 : ASESMEN_STEPS_ASESOR_2)]
}

// Helper function to get current step number from href
export function getStepNumberFromHref(steps: StepConfig[], currentHref: string): number {
  const step = steps.find(s => currentHref.includes(s.href))
  return step?.number || 1
}
