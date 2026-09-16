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
  /** Eksplisit: asesor 2 ada/tidak (dari data jadwal). null/undefined → fallback ke asesorList.length >= 2; /ttd-status tetap jadi sumber kebenaran. */
  hasAsesor2?: boolean | null
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
    hasAsesor2: hasAsesor2Input,
  } = input
  const config = getSigningConfig(pageKey)
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  // AK.01 (Persetujuan) selalu multi signer. AK.07 dulu ikut (d6dbee17) tapi itu
  // mengunci uji LURING: form-nya butuh 3 ttd padahal luring cukup satu pihak
  // (kasus I-2026091021315621755 / jadwal 606302 kelas 1 — user menunggu
  // "Asesor 1, Asesor 2, Asesi" selamanya). Luring kembali single-signer;
  // perlindungan asesor-2 utk AK.07 tetap jalan di kelas Daring ('2').
  const alwaysMultiSigner = pageKey === 'ak01'
  const slotsMultiSigner = pageKey === 'ak01' || pageKey === 'ak07'
  const singleSigner = !alwaysMultiSigner && jenisKelas !== undefined && jenisKelas !== '' && jenisKelas !== '2'
  const order: SigningOrder = singleSigner ? (isAsesor ? 'asesor_only' : 'asesi_only') : config.order

  const nextPageName = nextPageNameOverride ?? config.nextPageName
  const lanjutText = nextPageName ? `Lanjut ke ${nextPageName}` : 'Lanjut'

  // ── Status ttd dari server: sumber kebenaran ada/tidaknya asesor 2 + guard
  // urutan TTD per user (docs). Sekali per mount; gagal → diam (fallback ke
  // input.hasAsesor2 / panjang asesorList).
  const [statusHasAsesor2, setStatusHasAsesor2] = useState<boolean | null>(null)
  const [ttdDocs, setTtdDocs] = useState<Record<string, Partial<Record<BarcodeRole | 'admin', 0 | 1>>> | null>(null)
  // Dokumen yang TIDAK diisi untuk izin ini (mis. AK04 = FR.AK.04 BANDING ASESMEN
  // tanpa banding) → tidak masuk rantai wajib TTD. Dihitung server lewat
  // ttd-status.not_required supaya FE & BE (assertTtdOrder) memakai aturan sama.
  const [ttdNotRequired, setTtdNotRequired] = useState<string[]>([])
  useEffect(() => {
    if (!idIzin || isUuidFlow) return
    let alive = true
    ;(async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/ttd-status/${idIzin}`)
        if (!res.ok || !alive) return
        const json = await res.json()
        const has2 = json?.data?.has_asesor_2
        if (alive && typeof has2 === 'boolean') setStatusHasAsesor2(has2)
        if (alive && json?.data?.docs) setTtdDocs(json.data.docs)
        if (alive && Array.isArray(json?.data?.not_required)) setTtdNotRequired(json.data.not_required)
      } catch { /* fallback ke input */ }
    })()
    return () => { alive = false }
  }, [idIzin, isUuidFlow])

  // ── Sanity check isi slot asesor ──
  // asesorList bisa berisi 2 baris placeholder (asesor 2 tidak dijadwalkan, tapi
  // barisnya tetap dirender). /api/data-dokumen mengisi baris tsb dari relasi
  // id_asesor_2; slot kosong → nama/noreg null. Tanpa cek ini, halaman luring
  // (jenis_kelas 1) dengan 1 asesor ikut menuntut "Asesor 2" + bikin gate
  // allAsesorSigned mati selamanya (kasus I-2026091021315621755 / 606302).
  const hasAsesorData = (a: any) => !!(a && (a.nama || a.noreg))
  const hasAsesor1Data = useMemo(() => hasAsesorData(asesorList[0]), [asesorList])
  const hasAsesor2Data = useMemo(() => hasAsesorData(asesorList[1]), [asesorList])

  // Asesor 2 wajib? Prioritas: status server > input eksplisit > panjang asesorList.
  const asesor2Required = useMemo(() => {
    if (tahap === 0 || singleSigner || isUuidFlow) return false
    // Halaman yg wajib TTD semua pihak (AK.01/AK.07): kalau di halaman ini memang
    // ADA 2 asesor sungguhan, dua-duanya wajib ttd. Jangan gantung ke /ttd-status
    // doang — dia bisa balikin false (akun asesor 2 role-nya bukan 5, noreg kosong,
    // atau jadwal belum kebentuk saat request) → gate asesi cuma nunggu asesor 1 &
    // asesor 2 ke-skip. Halaman lain tetap pakai prioritas lama.
    // "Sungguhan" = baris ke-2 punya nama/noreg (see hasAsesorData) — list 2 baris
    // dengan slot 2 kosong = 1 asesor, asesor 2 TIDAK wajib.
    if (alwaysMultiSigner) {
      if (asesorList.length < 2) return false
      // Data baris (nama/noreg) = sumber utama; server/status eksplisit tetap
      // boleh menaikkan jadi wajib (union), tapi baris kosong tidak memaksa.
      return hasAsesor2Data || statusHasAsesor2 === true || hasAsesor2Input === true
    }
    const explicit = statusHasAsesor2 ?? hasAsesor2Input
    return explicit ?? asesorList.length >= 2
  }, [tahap, singleSigner, isUuidFlow, alwaysMultiSigner, asesorList, hasAsesor2Data, statusHasAsesor2, hasAsesor2Input])

  // ── Ably realtime ──
  const channelName = idIzin ? `signing.${idIzin}.${pageKey}` : ''

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

  /**
   * Role asesor yang login: 'asesor1' | 'asesor2' | null (tidak terdeteksi).
   *
   * Fix bug TTD: dulu `isAsesor1 = asesorList.length <= 1 || myIdx === 0`, jadi saat
   * asesorList cuma 1 (atau user tidak match → myIdx=-1), SEMUA asesor dianggap asesor1
   * → asesor2 yang ttd QR-nya ditulis ke slot asesor1 → tampilan asesor1 "terisi" dgn QR
   * asesor2 & button langsung "Lanjut" padahal DB asesor1 kosong.
   *
   * Sekarang: TIDAK menebak. Jika tidak match sama sekali → null → tombol TTD
   * disabled & generateQR ditolak (tidak menulis ke slot mana pun).
   */
  const myAsesorRole = useMemo<'asesor1' | 'asesor2' | null>(() => {
    if (!isAsesor) return null
    const idx = findAsesorIdx()
    if (idx === 0) return 'asesor1'
    if (idx === 1) return 'asesor2'
    return null
  }, [isAsesor, findAsesorIdx])

  const asesorHasSigned = useMemo(() => {
    if (tahap === 0) return true
    if (!isAsesor) return true
    if (myAsesorRole === null) return false
    return myAsesorRole === 'asesor1' ? !!barcodes?.asesor1?.url : !!barcodes?.asesor2?.url
  }, [tahap, isAsesor, myAsesorRole, barcodes])

  // ── GUARD URUTAN TTD PER USER ──
  // User X hanya boleh sign/lanjut di dokumen N bila barcode MILIKNYA SENDIRI
  // sudah ada di seluruh dokumen sebelumnya (chain pra-asesmen). Status user
  // dengan role lain TIDAK di sini — itu gate per-dokumen (allAsesorSigned).
  // Sumber: /ttd-status docs (server-side) + mirror barcodes lokal utk dokumen
  // yang baru di-sign di sesi ini. FE-only convenience; BE assertTtdOrder ikut
  // memvalidasi (bypass URL tetap ditolak server).
  //
  // OPTIONAL_CHAIN_DOCS: dokumen yang TIDAK pernah jadi syarat urutan di FE:
  // - K3 = "Tata Tertib dan K3" (PDF statis, tidak "diisi") — keputusan user
  //   16 Sep 2026, kasus I-2026091510190336922.
  // AK04 justru kondisional (wajib hanya bila ada isi banding) → ditentukan
  // server lewat ttd-status.not_required, bukan hardcode di sini.
  const OPTIONAL_CHAIN_DOCS = ['K3']
  const SIGNING_CHAIN: Record<'asesi' | 'asesor', Array<{ key: string; doc: string }>> = {
    asesi: [
      { key: 'apl01', doc: 'APL01' }, { key: 'apl02', doc: 'APL02' },
      { key: 'mapa01', doc: 'MAPA01' }, { key: 'mapa02', doc: 'MAPA02' },
      { key: 'ak07', doc: 'AK07' }, { key: 'ak04', doc: 'AK04' },
      { key: 'k3', doc: 'K3' }, { key: 'ak01', doc: 'AK01' },
    ],
    asesor: [
      { key: 'apl02', doc: 'APL02' }, { key: 'mapa01', doc: 'MAPA01' },
      { key: 'mapa02', doc: 'MAPA02' }, { key: 'ak07', doc: 'AK07' },
      { key: 'ak04', doc: 'AK04' }, { key: 'k3', doc: 'K3' },
      { key: 'ak01', doc: 'AK01' },
    ],
  }
  const mySlot: BarcodeRole | null = isAsesor ? (myAsesorRole ?? null) : 'asesi'
  const missingPrevDocs = useMemo(() => {
    if (tahap === 0 || isUuidFlow || !mySlot) return []
    // Fail-open: status server belum diterima (fetch gagal/loading) → jangan
    // blokir UI; BE assertTtdOrder tetap menolak QR tanpa barcode sebelumnya.
    if (!ttdDocs) return []
    const chain = isAsesor ? SIGNING_CHAIN.asesor : SIGNING_CHAIN.asesi
    const idx = chain.findIndex(c => c.key === pageKey)
    if (idx <= 0) return []
    const missing: string[] = []
    for (const c of chain.slice(0, idx)) {
      // Dokumen yang tidak diisi (mis. AK04 tanpa banding) tidak wajib TTD.
      if (ttdNotRequired.includes(c.doc) || OPTIONAL_CHAIN_DOCS.includes(c.doc)) continue
      const serverSigned = (ttdDocs[c.doc]?.[mySlot] ?? 0) === 1
      // Mirror lokal: dokumen yg baru di-sign di halaman ini (ttdDocs di-fetch
      // saat mount, bisa stale) — aman dari race setelah realtime update.
      const localSigned = c.key === pageKey
        ? (mySlot === 'asesi' ? !!barcodes?.asesi?.url : !!barcodes?.[mySlot]?.url)
        : false
      if (!serverSigned && !localSigned) missing.push(c.doc)
    }
    return missing
  }, [tahap, isUuidFlow, isAsesor, mySlot, pageKey, ttdDocs, ttdNotRequired, barcodes])

  const allAsesorSigned = useMemo(() => {
    if (tahap === 0) return true
    if (singleSigner) return true
    if (isUuidFlow) return true
    if (asesorList.length === 0) return false
    // Halaman multi-slot (AK.01/AK.07): cukup pihak yang SUNGGUH dijadwalkan.
    // Slot asesor 2 kosong (nama/noreg null) tidak menuntut TTD.
    if (slotsMultiSigner) {
      if (hasAsesor1Data && !barcodes?.asesor1?.url) return false
      if ((hasAsesor2Data || asesor2Required) && !barcodes?.asesor2?.url) return false
      if (!hasAsesor1Data && !hasAsesor2Data && !barcodes?.asesor1?.url) return false
      return true
    }
    if (!barcodes?.asesor1?.url) return false
    if (asesor2Required && !barcodes?.asesor2?.url) return false
    return true
  }, [tahap, singleSigner, isUuidFlow, asesorList, barcodes, asesor2Required, slotsMultiSigner, hasAsesor1Data, hasAsesor2Data])

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
    if (asesor2Required && !barcodes?.asesor2?.url) labels.push('Asesor 2')
    if (!asesiHasSigned) labels.push('Asesi')
    return labels
  }, [tahap, isUuidFlow, singleSigner, barcodes, asesiHasSigned, asesor2Required])

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

  // ── QR generation ──
  const generateQR = useCallback(async (): Promise<boolean> => {
    if (!idIzin || !jadwalId || tahap === 0) return false
    // Guard urutan: jangan biarkan QR dokumen N dibuat kalau user ini belum
    // ada barcode di dokumen sebelumnya (BE juga menolak — ini utk UX).
    if (missingPrevDocs.length > 0) return false

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
        // Fix bug: jangan menebak role. Jika myAsesorRole null (user tidak match
        // asesorList) → tolak TTD, jangan menulis ke slot asesor1/2 secara salah.
        if (myAsesorRole === null) return false
        role = myAsesorRole === 'asesor2' ? 'asesor2' : 'asesor1'
        setBarcodes(prev => ({
          ...prev,
          asesor1: role === 'asesor1' ? barcode : prev?.asesor1 || null,
          asesor2: role === 'asesor2' ? barcode : prev?.asesor2 || null,
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
  }, [idIzin, jadwalId, tahap, config.qrEndpoint, isAsesor, myAsesorRole, userName, setBarcodes, publishUpdate, missingPrevDocs])

  // ── Button state ──
  const { buttonText, buttonDisabled } = useMemo(() => {
    if (tahap === 0) return { buttonText: lanjutText, buttonDisabled: isSaving }

    // Guard urutan TTD per user: barcode user ini di dokumen sebelumnya belum
    // lengkap → TTD/lanjut di halaman ini diblok (pesan: selesaikan dulu di
    // dokumen mana). Ini murni status user ini — tidak peduli user lain.
    if (missingPrevDocs.length > 0) {
      return {
        buttonText: `Selesaikan TTD Anda di ${missingPrevDocs.join(', ')}`,
        buttonDisabled: true,
      }
    }

    // Fix bug: role asesor tidak terdeteksi → blokir TTD, jangan biarkan lanjut
    if (isAsesor && myAsesorRole === null) {
      return {
        buttonText: 'Role asesor tidak terdeteksi',
        buttonDisabled: true,
      }
    }

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
      if (asesorHasSigned) {
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
  }, [order, tahap, isAsesor, isSaving, asesiHasSigned, asesorHasSigned, allAsesorSigned, agreedChecklist, missingLabels, lanjutText, testingMode, myAsesorRole])

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
