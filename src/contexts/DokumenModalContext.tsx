import { createContext, useContext, useState, ReactNode } from "react"

const STORAGE_KEY = "dokumen_modal_state"

interface PersistedModalState {
  asesiId: string
  asesiNama: string
  jadwalId: string
  readOnly: boolean
  docType?: string
}

interface DokumenModalContextType {
  isOpen: boolean
  asesiId: string
  asesiNama: string
  jadwalId: string
  openModal: (asesiId: string, asesiNama: string, readOnly?: boolean, jadwalId?: string) => void
  closeModal: () => void
  onPenilaianSuccess: (() => void) | null
  setOnPenilaianSuccess: (callback: (() => void) | null) => void
  readOnly: boolean
  initialDocType: string | null
  persistSelectedDoc: (docType: string | null) => void
}

const DokumenModalContext = createContext<DokumenModalContextType | undefined>(undefined)

function readPersistedState(): PersistedModalState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.asesiId !== "string" || !parsed.asesiId) return null
    return parsed
  } catch {
    return null
  }
}

export function DokumenModalProvider({ children }: { children: ReactNode }) {
  const [persisted] = useState<PersistedModalState | null>(() => readPersistedState())
  const [isOpen, setIsOpen] = useState(() => persisted !== null)
  const [asesiId, setAsesiId] = useState(() => persisted?.asesiId ?? "")
  const [asesiNama, setAsesiNama] = useState(() => persisted?.asesiNama ?? "")
  const [jadwalId, setJadwalId] = useState(() => persisted?.jadwalId ?? "")
  const [onPenilaianSuccess, setOnPenilaianSuccess] = useState<(() => void) | null>(null)
  const [readOnly, setReadOnly] = useState(() => persisted?.readOnly ?? false)
  const [initialDocType] = useState<string | null>(() => persisted?.docType ?? null)

  const writePersistedState = (state: Partial<PersistedModalState>) => {
    try {
      const current = readPersistedState()
      if (!current) return
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }))
    } catch {
      // storage penuh/ditolak — modal tetap jalan, cuma nggak persist
    }
  }

  const openModal = (id: string, nama: string, readOnlyMode = false, jadwalIdParam = "") => {
    setAsesiId(id)
    setAsesiNama(nama)
    setReadOnly(readOnlyMode)
    setJadwalId(jadwalIdParam)
    setIsOpen(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        asesiId: id,
        asesiNama: nama,
        jadwalId: jadwalIdParam,
        readOnly: readOnlyMode,
      } satisfies PersistedModalState))
    } catch {
      // abaikan — persistensi bonus, modal tetap kebuka
    }
  }

  const persistSelectedDoc = (docType: string | null) => {
    if (docType) writePersistedState({ docType })
  }

  const closeModal = () => {
    setIsOpen(false)
    setAsesiId("")
    setAsesiNama("")
    setReadOnly(false)
    setJadwalId("")
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // abaikan
    }
  }

  return (
    <DokumenModalContext.Provider value={{ isOpen, asesiId, asesiNama, jadwalId, openModal, closeModal, onPenilaianSuccess, setOnPenilaianSuccess, readOnly, initialDocType, persistSelectedDoc }}>
      {children}
    </DokumenModalContext.Provider>
  )
}

export function useDokumenModal() {
  const context = useContext(DokumenModalContext)
  if (!context) {
    throw new Error("useDokumenModal must be used within DokumenModalProvider")
  }
  return context
}
