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
  { number: 4, label: 'Ujian', href: '/asesi/asesmen/ia05' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 7, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesi (jenjang < 4) - IA01, IA02, IA03 instead of IA04A, IA04B
export const ASESMEN_STEPS_LOW_JENJAH_ASESI: StepConfig[] = [
  { number: 1, label: 'IA.01', href: '/asesi/asesmen/ia01' },
  { number: 2, label: 'IA.02', href: '/asesi/asesmen/ia02' },
  { number: 3, label: 'IA.03', href: '/asesi/asesmen/ia03' },
  { number: 4, label: 'Upload Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 5, label: 'Ujian', href: '/asesi/asesmen/ia05' },
  { number: 6, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 7, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 8, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 1 (jenjang < 4)
export const ASESMEN_STEPS_LOW_JENJAH_ASESOR_1: StepConfig[] = [
  { number: 1, label: 'IA.01', href: '/asesi/asesmen/ia01' },
  { number: 2, label: 'IA.02', href: '/asesi/asesmen/ia02' },
  { number: 3, label: 'IA.03', href: '/asesi/asesmen/ia03' },
  { number: 4, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 5, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 6, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 7, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 8, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 9, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Asesmen Steps for Asesor 2 (jenjang < 4)
export const ASESMEN_STEPS_LOW_JENJAH_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'IA.01', href: '/asesi/asesmen/ia01' },
  { number: 2, label: 'IA.02', href: '/asesi/asesmen/ia02' },
  { number: 3, label: 'IA.03', href: '/asesi/asesmen/ia03' },
  { number: 4, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 5, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 6, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 7, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 8, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 9, label: 'Selesai', href: '/asesi/asesmen/selesai' },
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

// Asesmen Steps for Asesor 2 (full flow)
export const ASESMEN_STEPS_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'IA.04.A', href: '/asesi/asesmen/ia04a' },
  { number: 2, label: 'Review Tugas', href: '/asesi/asesmen/upload-tugas' },
  { number: 3, label: 'IA.04.B', href: '/asesi/asesmen/ia04b' },
  { number: 4, label: 'IA.05', href: '/asesi/asesmen/ia05' },
  { number: 5, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 6, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 7, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 8, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Portofolio Method Steps (jenjang >= 4, metode = portofolio)
export const ASESMEN_STEPS_PORTOFOLIO_ASESI: StepConfig[] = [
  { number: 1, label: 'IA.08', href: '/asesi/asesmen/ia08' },
  { number: 2, label: 'IA.09', href: '/asesi/asesmen/ia09' },
  { number: 3, label: 'IA.10', href: '/asesi/asesmen/ia10' },
  { number: 4, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 5, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 6, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

export const ASESMEN_STEPS_PORTOFOLIO_ASESOR_1: StepConfig[] = [
  { number: 1, label: 'IA.08', href: '/asesi/asesmen/ia08' },
  { number: 2, label: 'IA.09', href: '/asesi/asesmen/ia09' },
  { number: 3, label: 'IA.10', href: '/asesi/asesmen/ia10' },
  { number: 4, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 5, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 6, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 7, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

export const ASESMEN_STEPS_PORTOFOLIO_ASESOR_2: StepConfig[] = [
  { number: 1, label: 'IA.08', href: '/asesi/asesmen/ia08' },
  { number: 2, label: 'IA.09', href: '/asesi/asesmen/ia09' },
  { number: 3, label: 'IA.10', href: '/asesi/asesmen/ia10' },
  { number: 4, label: 'AK.02', href: '/asesi/asesmen/ak02' },
  { number: 5, label: 'AK.03', href: '/asesi/asesmen/ak03' },
  { number: 6, label: 'AK.06', href: '/asesi/asesmen/ak06' },
  { number: 7, label: 'Selesai', href: '/asesi/asesmen/selesai' },
]

// Default asesmen steps (backward compatibility)
export const ASESMEN_STEPS: StepConfig[] = ASESMEN_STEPS_ASESI

// Get asesmen steps based on jenjang_id, metode, and asesor role
export function getAsesmenSteps(
  jenjangId: string,
  isAsesor: boolean,
  asesorRole: 'asesor_1' | 'asesor_2' | 'asesor_other' | 'none' | undefined,
  _asesorCount: number,
  metode?: string,
  showAk05?: boolean
): StepConfig[] {
  const isLowJenjang = jenjangId && parseInt(jenjangId) < 4
  const isPortofolio = metode?.toLowerCase() === 'portofolio'

  let steps: StepConfig[]

  // Portofolio method (jenjang >= 4)
  if (isPortofolio && !isLowJenjang) {
    if (!isAsesor) steps = [...ASESMEN_STEPS_PORTOFOLIO_ASESI]
    else if (asesorRole === 'asesor_1') steps = [...ASESMEN_STEPS_PORTOFOLIO_ASESOR_1]
    else steps = [...ASESMEN_STEPS_PORTOFOLIO_ASESOR_2]
  } else if (!isAsesor) {
    steps = [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESI : ASESMEN_STEPS_ASESI)]
  } else if (asesorRole === 'asesor_1') {
    steps = [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_1 : ASESMEN_STEPS_ASESOR_1)]
  } else if (asesorRole === 'asesor_2') {
    steps = [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_2 : ASESMEN_STEPS_ASESOR_2)]
  } else {
    steps = [...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_2 : ASESMEN_STEPS_ASESOR_2)]
  }

  // Insert AK.05 after AK.06 if requested
  if (showAk05) {
    const ak06Idx = steps.findIndex(s => s.href.includes('ak06'))
    if (ak06Idx !== -1) {
      steps.splice(ak06Idx + 1, 0, { number: steps[ak06Idx].number + 1, label: 'AK.05', href: '/asesi/asesmen/ak05' })
      for (let i = ak06Idx + 2; i < steps.length; i++) {
        steps[i].number = steps[i - 1].number + 1
      }
    }
  }

  return steps
}

// Helper function to get current step number from href
export function getStepNumberFromHref(steps: StepConfig[], currentHref: string): number {
  const step = steps.find(s => currentHref.includes(s.href))
  return step?.number || 1
}
