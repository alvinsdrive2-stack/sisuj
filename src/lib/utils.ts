import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const JENIS_KELAS_LABEL: Record<string, string> = {
  '1': 'Luring',
  '2': 'Daring',
  '3': 'Hybrid',
  '4': 'Onsite',
}

export function jenisKelasLabel(id: string | undefined | null): string {
  return JENIS_KELAS_LABEL[id ?? ''] ?? id ?? '-'
}
