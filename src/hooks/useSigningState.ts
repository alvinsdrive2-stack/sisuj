import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { getSigningConfig, SigningOrder } from '@/lib/signing-config'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { apiFetch } from '@/lib/api-fetch'
import { API_BASE_URL } from '@/config/api'

export interface BarcodeState {
  asesi?: { url: string; tanggal: string; nama: string }
  asesor1?: { url: string; tanggal: string; nama: string } | null
  asesor2?: { url: string; tanggal: string; nama: string } | null
}

type BarcodeRole = 'asesi' | 'asesor1' | 'asesor2'

interface AblySigningPayload {
  role: BarcodeRole
  barcode: { url: string; tanggal: string; nama: string }
}

export interface SigningStateInput {
  pageKey: string
  isAsesor: boolean
  tahap: number
  barcodes: BarcodeState | null
  setBarcodes: React.Dispatch<React.SetStateAction<BarcodeState | null>>
  asesorList: Array<{ id: number | string; noreg?: string | null }>
  userId?: number | string
  userNoreg?: string | null
  userName?: string
  isSaving?: boolean
  idIzin?: string
  jadwalId?: string | number | null
  /** Jika true, skip nunggu asesor — langsung anggap allSigned */
  isUuidFlow?: boolean
  /** Override next page label, e.g. "IA 02". Falls back to config. */
  nextPageName?: string
  /** Fallback full refetch when Ably data insufficient */
  onRefresh?: () => void | Promise<void>
  /** Jika true, bypass QR lock untuk testing */
  testingMode?: boolean
  /** Jenis kelas kegiatan. '2' = Daring (multi-signer). Lainnya = single signer, cukup TTD user yang login lalu lanjut. */
  jenisKelas?: string
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
  singleSigner: boolean
  order: SigningOrder
  qrEndpoint: string
  generateQR: () => Promise<boolean>
  publishUpdate: (data?: any) => void
  refresh: () => void
}

export function useSigningState(input: SigningStateInput): SigningState {
  const {
    pageKey, isAsesor, tahap, barcodes, setBarcodes,
    asesorList, userId, userNoreg, userName, isSaving = false,
    idIzin, jadwalId, nextPageName: nextPageNameOverride, onRefresh,
    isUuidFlow = false, testingMode = false, jenisKelas,
  } = input
  const config = getSigningConfig(pageKey)
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  // Kelas non-2 (Luring/Hybrid/Onsite) → single signer: cukup TTD user yang sedang login, langsung bisa lanjut.
  const singleSigner = jenisKelas !== undefined && jenisKelas !== '' && jenisKelas !== '2'
  const order: SigningOrder = singleSigner ? (isAsesor ? 'asesor_only' : 'asesi_only') : config.order

  const nextPageName = nextPageNameOverride ?? config.nextPageName
  const lanjutText = nextPageName ? `Lanjut ke ${nextPageName}` : 'Lanjut'

  // ── Ably realtime ──
  const channelName = idIzin ? `signing:${idIzin}:${pageKey}` : ''

  const refresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAblyMessage = useCallback((data?: any) => {
    if (data?.role && data?.barcode) {
      const payload = data as AblySigningPayload
      setBarcodes(prev => ({
        ...prev,
        [payload.role]: payload.barcode,
      }))
    }
    // Debounce refetch — burst pesan Ably memicu satu panggilan API saja
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => {
      // Wrap in try-catch so Ably callback errors don't crash the page
      try { onRefresh?.() } catch {}
    }, 500)
  }, [setBarcodes, onRefresh])

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  const { publishUpdate } = useRealtimeSync({
    channelName,
    onUpdate: handleAblyMessage,
  })

  // ── Signature checks ──
  const asesiHasSigned = tahap === 0 ? true : !!barcodes?.asesi?.url

  // Cari index asesor di asesorList: match by id dulu, fallback by noreg.
  // Back-end resolve id_asesor_1/2 = akun LATEST per noreg; kalau asesor login
  // pake akun lama, id beda tapi noreg sama → tanpa fallback ini dia dianggap
  // asesor1 (idx === -1) sehingga asesor2 salah dikira udah ttd & skip sign.
  const findAsesorIdx = useCallback(() => {
    const byId = asesorList.findIndex(a => String(a.id) === String(userId))
    if (byId !== -1) return byId
    if (userNoreg) {
      const byNoreg = asesorList.findIndex(a => a.noreg && a.noreg === userNoreg)
      if (byNoreg !== -1) return byNoreg
    }
    return -1
  }, [asesorList, userId, userNoreg])

  const asesorHasSigned = useMemo(() => {
    if (tahap === 0) return true
    if (!isAsesor) return true
    const myIdx = findAsesorIdx()
    // 1 asesor → pasti asesor1; 2 asesor → strictly ikut urutan daftar
    const isAsesor1 = asesorList.length <= 1 || myIdx === 0
    return isAsesor1 ? !!barcodes?.asesor1?.url : !!barcodes?.asesor2?.url
  }, [tahap, isAsesor, findAsesorIdx, asesorList, barcodes])

  const allAsesorSigned = useMemo(() => {
    if (tahap === 0) return true
    if (singleSigner) return true
    if (isUuidFlow) return true
    if (asesorList.length === 0) return false
    if (!barcodes?.asesor1?.url) return false
    if (asesorList.length >= 2 && !barcodes?.asesor2?.url) return false
    return true
  }, [tahap, singleSigner, isUuidFlow, asesorList, barcodes])

  const allSigned = useMemo(() => {
    if (order === 'asesi_only') return asesiHasSigned
    if (order === 'asesor_only') return asesorHasSigned
    return asesiHasSigned && allAsesorSigned
  }, [order, asesiHasSigned, asesorHasSigned, allAsesorSigned])

  const missingLabels = useMemo(() => {
    if (tahap === 0) return []
    if (singleSigner) return []
    if (isUuidFlow) return []
    const labels: string[] = []
    if (!barcodes?.asesor1?.url) labels.push('Asesor 1')
    if (asesorList.length >= 2 && !barcodes?.asesor2?.url) labels.push('Asesor 2')
    if (!asesiHasSigned) labels.push('Asesi')
    return labels
  }, [tahap, isUuidFlow, singleSigner, barcodes, asesorList])

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

  // ── QR generation ──
  const generateQR = useCallback(async (): Promise<boolean> => {
    if (!idIzin || !jadwalId || tahap === 0) return false

    const token = localStorage.getItem('access_token')
    if (!token) return false

    try {
      const response = await apiFetch(`${API_BASE_URL}/qr/${idIzin}/${config.qrEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_jadwal: jadwalId }),
      })

      if (!response.ok) return false

      const result = await response.json()
      if (result.message !== 'Success' || !result.data?.url_image) return false

      const now = new Date().toISOString()
      const name = userName || ''
      const barcode = { url: result.data.url_image, tanggal: now, nama: name }

      let role: BarcodeRole

      if (isAsesor) {
        const myIdx = findAsesorIdx()
        const isAsesor1 = asesorList.length <= 1 || myIdx === 0
        role = isAsesor1 ? 'asesor1' : 'asesor2'
        setBarcodes(prev => ({
          ...prev,
          asesor1: isAsesor1 ? barcode : prev?.asesor1 || null,
          asesor2: !isAsesor1 ? barcode : prev?.asesor2 || null,
        }))
      } else {
        role = 'asesi'
        setBarcodes(prev => ({
          ...prev,
          asesi: barcode,
        }))
      }

      // Publish once via Ably — penerima akan refetch dari API
      publishUpdate({ role, barcode })

      return true
    } catch {
      return false
    }
  }, [idIzin, jadwalId, tahap, config.qrEndpoint, isAsesor, findAsesorIdx, userName, setBarcodes, publishUpdate])

  // ── Button state ──
  const { buttonText, buttonDisabled } = useMemo(() => {
    if (tahap === 0) return { buttonText: lanjutText, buttonDisabled: isSaving }

    if (order === 'asesi_only') {
      if (isAsesor) {
        return {
          buttonText: asesiHasSigned ? lanjutText : 'Menunggu TTD: Asesi',
          buttonDisabled: isSaving || !asesiHasSigned,
        }
      }
      if (asesiHasSigned) return { buttonText: lanjutText, buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    if (order === 'asesor_only') {
      if (asesorHasSigned) return { buttonText: lanjutText, buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }


    if (order === 'asesi_first') {
      if (!isAsesor) {
        if (asesiHasSigned) {
          if (testingMode || allAsesorSigned) return { buttonText: lanjutText, buttonDisabled: isSaving }
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
      if (!testingMode && !asesiHasSigned) {
        return {
          buttonText: 'Menunggu TTD: Asesi',
          buttonDisabled: true,
        }
      }
      if (asesorHasSigned) return { buttonText: lanjutText, buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    if (order === 'asesor_first') {
      if (isAsesor) {
        if (asesorHasSigned) {
          if (testingMode || allSigned) return { buttonText: lanjutText, buttonDisabled: isSaving }
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
      if (!testingMode && !allAsesorSigned) {
        return {
          buttonText: `Menunggu TTD: ${missingLabels.join(', ')}`,
          buttonDisabled: true,
        }
      }
      if (asesiHasSigned) return { buttonText: lanjutText, buttonDisabled: isSaving }
      return {
        buttonText: 'Simpan & Tanda Tangan',
        buttonDisabled: isSaving || !agreedChecklist,
      }
    }

    return { buttonText: lanjutText, buttonDisabled: false }
  }, [order, tahap, isAsesor, isSaving, asesiHasSigned, asesorHasSigned, allAsesorSigned, agreedChecklist, missingLabels, lanjutText, testingMode])

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
    singleSigner,
    order,
    qrEndpoint: config.qrEndpoint,
    generateQR,
    publishUpdate,
    refresh,
  }
}
