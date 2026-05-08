import { useState, useMemo, useEffect } from 'react'
import { getSigningConfig, SigningOrder } from '@/lib/signing-config'

export interface BarcodeState {
  asesi?: { url: string; tanggal: string; nama: string }
  asesor1?: { url: string; tanggal: string; nama: string } | null
  asesor2?: { url: string; tanggal: string; nama: string } | null
}

export interface SigningStateInput {
  pageKey: string
  isAsesor: boolean
  tahap: number
  barcodes: BarcodeState | null
  asesorList: Array<{ id: number | string }>
  userId?: number | string
  isSaving?: boolean
}

export interface SigningState {
  asesiHasSigned: boolean
  asesorHasSigned: boolean
  allAsesorSigned: boolean
  allSigned: boolean
  missingLabels: string[]
  agreedChecklist: boolean
  setAgreedChecklist: (v: boolean) => void
  buttonText: string
  buttonDisabled: boolean
  order: SigningOrder
  qrEndpoint: string
}

export function useSigningState(input: SigningStateInput): SigningState {
  const { pageKey, isAsesor, tahap, barcodes, asesorList, userId, isSaving = false } = input
  const config = getSigningConfig(pageKey)
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  const asesiHasSigned = tahap === 0 ? true : !!barcodes?.asesi?.url

  const asesorHasSigned = useMemo(() => {
    if (tahap === 0) return true
    if (!isAsesor) return true
    const idx = asesorList.findIndex(a => String(a.id) === String(userId))
    const isAsesor1 = idx === 0 || idx === -1
    return isAsesor1 ? !!barcodes?.asesor1?.url : !!barcodes?.asesor2?.url
  }, [tahap, isAsesor, asesorList, userId, barcodes])

  const allAsesorSigned = useMemo(() => {
    if (tahap === 0) return true
    if (asesorList.length === 0) return false
    if (!barcodes?.asesor1?.url) return false
    if (asesorList.length >= 2 && !barcodes?.asesor2?.url) return false
    return true
  }, [tahap, asesorList, barcodes])

  const allSigned = useMemo(() => {
    if (config.order === 'asesi_only') return asesiHasSigned
    if (config.order === 'asesor_only') return asesorHasSigned
    return asesiHasSigned && allAsesorSigned
  }, [config.order, asesiHasSigned, asesorHasSigned, allAsesorSigned])

  const missingLabels = useMemo(() => {
    if (tahap === 0) return []
    const labels: string[] = []
    if (!barcodes?.asesor1?.url) labels.push('Asesor 1')
    if (asesorList.length >= 2 && !barcodes?.asesor2?.url) labels.push('Asesor 2')
    return labels
  }, [tahap, barcodes, asesorList])

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

  const { buttonText, buttonDisabled } = useMemo(() => {
    if (tahap === 0) return { buttonText: 'Lanjut', buttonDisabled: isSaving }

    const order = config.order

    // ── Asesi only ──
    if (order === 'asesi_only') {
      if (isAsesor) {
        return {
          buttonText: asesiHasSigned ? 'Lanjut' : 'Menunggu TTD: Asesi',
          buttonDisabled: isSaving || !asesiHasSigned,
        }
      }
      if (asesiHasSigned) return { buttonText: 'Lanjut', buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    // ── Asesor only ──
    if (order === 'asesor_only') {
      if (asesorHasSigned) return { buttonText: 'Lanjut', buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    // ── Asesor first ──
    if (order === 'asesor_first') {
      if (isAsesor) {
        if (asesorHasSigned) return { buttonText: 'Lanjut', buttonDisabled: isSaving }
        return {
          buttonText: 'Simpan & Tanda Tangan',
          buttonDisabled: isSaving || !agreedChecklist,
        }
      }
      // Asesi waits for asesor
      if (!allAsesorSigned) {
        return {
          buttonText: `Menunggu TTD: ${missingLabels.join(', ')}`,
          buttonDisabled: true,
        }
      }
      if (asesiHasSigned) return { buttonText: 'Lanjut', buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    // ── Asesi first ──
    if (order === 'asesi_first') {
      if (!isAsesor) {
        if (asesiHasSigned) {
          if (allAsesorSigned) return { buttonText: 'Lanjut', buttonDisabled: isSaving }
          return {
            buttonText: `Menunggu TTD: ${missingLabels.join(', ')}`,
            buttonDisabled: true,
          }
        }
        return {
          buttonText: 'Simpan & Tanda Tangan',
          buttonDisabled: isSaving || !agreedChecklist,
        }
      }
      // Asesor waits for asesi
      if (!asesiHasSigned) {
        return {
          buttonText: 'Menunggu TTD: Asesi',
          buttonDisabled: true,
        }
      }
      if (asesorHasSigned) return { buttonText: 'Lanjut', buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    return { buttonText: 'Lanjut', buttonDisabled: false }
  }, [config.order, tahap, isAsesor, isSaving, asesiHasSigned, asesorHasSigned, allAsesorSigned, agreedChecklist, missingLabels])

  return {
    asesiHasSigned,
    asesorHasSigned,
    allAsesorSigned,
    allSigned,
    missingLabels,
    agreedChecklist,
    setAgreedChecklist,
    buttonText,
    buttonDisabled,
    order: config.order,
    qrEndpoint: config.qrEndpoint,
  }
}
