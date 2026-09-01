import { Fragment, useState, useEffect, useCallback, useMemo } from "react"
import AsesmenBreadcrumb from "@/components/AsesmenBreadcrumb"
import { useNavigate, useParams } from "react-router-dom"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { RoleId } from "@/lib/rbac-config"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { useSigningState, BarcodeState } from "@/hooks/useSigningState"
import { getAsesmenSteps, getStepNumberFromHref } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { useToast } from "@/contexts/ToastContext"
import { extractErrorMessage, extractApiError } from "@/lib/error-utils"
import { API_BASE_URL } from "@/config/api"
import { BRANDING } from "@/config/branding"

interface UnitKompetensi {
  id: number
  kode: string
  nama: string
  evidence: {
    observasi: boolean
    portofolio: boolean
    pertanyaan_wawancara: boolean
    pertanyaan_lisan: boolean
    pertanyaan_tertulis: boolean
    proyek_kerja: boolean
    lainnya: boolean
  }
}

const EVIDENCE_KEYS = [
  'observasi',
  'portofolio',
  'pertanyaan_wawancara',
  'pertanyaan_lisan',
  'pertanyaan_tertulis',
  'proyek_kerja',
  'lainnya',
] as const

type EvidenceKey = typeof EVIDENCE_KEYS[number]

const td = { border: '0.2px solid black', padding: '4px 6px' }
const hdDok = { backgroundColor: BRANDING.primaryColor, color: '#fff' }
const fontS = { fontFamily: '"Arial Narrow", Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif', fontSize: '12pt' }
const formatter = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

function Td({ children, style, colSpan, rowSpan }: { children?: React.ReactNode; style?: React.CSSProperties; colSpan?: number; rowSpan?: number }) {
  return <td colSpan={colSpan} rowSpan={rowSpan} style={{ ...td, ...style }}>{children}</td>
}

function IdentitasTable({ jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalMulai, tanggalSelesai }: {
  jabatanKerja?: string; nomorSkema?: string; tuk?: string; asesorList: any[]; namaAsesi: string
  tanggalMulai?: string; tanggalSelesai?: string | null
}) {
  return (
    <table style={{ border: '2px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding="5" cellSpacing="0">
      <tbody>
        <tr>
          <Td rowSpan={2} style={{ width: '30%' }}>Skema Sertifikasi (KKNI/Okupasi/Klaster)</Td>
          <Td style={{ width: '12%' }}>Judul</Td>
          <Td style={{ width: '3%', textAlign: 'center' }}>:</Td>
          <Td style={{ textTransform: 'uppercase' }}>{jabatanKerja || '-'}</Td>
        </tr>
        <tr>
          <Td>Nomor</Td>
          <Td style={{ textAlign: 'center' }}>:</Td>
          <Td style={{ textTransform: 'uppercase' }}>{nomorSkema || '-'}</Td>
        </tr>
        <tr>
          <Td>TUK</Td>
          <Td style={{ textAlign: 'center' }}>:</Td>
          <Td colSpan={2} style={{ textTransform: 'uppercase' }}>{tuk || '-'}</Td>
        </tr>
        {asesorList.map((a: any, i: number) => (
          <tr key={i}>
            <Td>Nama Asesor {asesorList.length > 1 ? i + 1 : ''}</Td>
            <Td style={{ textAlign: 'center' }}>:</Td>
            <Td colSpan={2} style={{ textTransform: 'uppercase' }}>
              {a?.nama || '-'}{a?.noreg ? ` (${a.noreg})` : ''}
            </Td>
          </tr>
        ))}
        <tr>
          <Td>Nama Asesi</Td>
          <Td style={{ textAlign: 'center' }}>:</Td>
          <Td colSpan={2} style={{ textTransform: 'uppercase' }}>{namaAsesi || '-'}</Td>
        </tr>
        <tr>
          <Td rowSpan={2}>Tanggal Asesmen</Td>
          <Td style={{ textAlign: 'right' }}>Mulai :</Td>
          <Td colSpan={2}>{tanggalMulai ? formatter.format(new Date(tanggalMulai)) : '-'}</Td>
        </tr>
        <tr>
          <Td style={{ textAlign: 'right' }}>Selesai :</Td>
          <Td colSpan={2}>{tanggalSelesai ? formatter.format(new Date(tanggalSelesai)) : '-'}</Td>
        </tr>
      </tbody>
    </table>
  )
}

export default function Ak02KANPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)
  const { jenjang, metode, asesorList, jabatanKerja, nomorSkema, tuk, namaAsesi, jadwalId, isPaket, tanggalUji, tanggalSelesai, jenisKelas } = useDataDokumenAsesmen(id)
  const { tahap } = useDataDokumenPraAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()

  const isAsesor = user?.role?.id === RoleId.ASESOR
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
  const currentStep = getStepNumberFromHref(asesmenSteps, '/asesi/asesmen/ak02')
  const isKanFlow = import.meta.env.VITE_SAAT_INI === 'KAN' || !!isPaket

  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'asesmen', role: 'auto', checkOnMount: true, idIzin: id, asesorList
  })

  const [units, setUnits] = useState<UnitKompetensi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [totalSkorDit, setTotalSkorDit] = useState<string>("")
  const [totalSkorPg, setTotalSkorPg] = useState<string>("")
  const [totalSkorEsai, setTotalSkorEsai] = useState<string>("")
  const [isKompeten, setIsKompeten] = useState<boolean | null>(null)
  const [tindakLanjut, setTindakLanjut] = useState("")
  const [komentar, setKomentar] = useState("")
  const [barcodes, setBarcodes] = useState<BarcodeState | null>(null)

  const fetchAk02Data = useCallback(async () => {
    if (!id) return
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/asesmen/${id}/ak02`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const body = await res.json()
        const d = body.data
        setUnits(d.unit_kompetensi || [])
        if (d.barcodes) setBarcodes(d.barcodes)
        if (d.total_skor_dit !== null && d.total_skor_dit !== undefined) setTotalSkorDit(String(d.total_skor_dit))
        if (d.total_skor_pilihan_ganda !== null && d.total_skor_pilihan_ganda !== undefined) setTotalSkorPg(String(d.total_skor_pilihan_ganda))
        if (d.total_skor_esai !== null && d.total_skor_esai !== undefined) setTotalSkorEsai(String(d.total_skor_esai))
        if (d.isLulus === true) setIsKompeten(true)
        else if (d.isTidakLulus === true) setIsKompeten(false)
        if (d.tindak_lanjut) setTindakLanjut(d.tindak_lanjut)
        if (d.komentar) setKomentar(d.komentar)
      }
    } catch (error) { console.error("Error fetching AK.02 KAN data:", error)
    } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { fetchAk02Data() }, [fetchAk02Data])

  const nextStepLabel = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ak02')) + 1]?.label
  const signing = useSigningState({
    pageKey: 'ak02', isAsesor, tahap,
    barcodes, setBarcodes, asesorList,
    userId: user?.id, userName: user?.name, isSaving,
    idIzin: id, jadwalId,
    nextPageName: nextStepLabel,
    onRefresh: fetchAk02Data,
    jenisKelas,
    qrVersion: 'kan',
  })

  const goNext = () => {
    const currentIdx = asesmenSteps.findIndex(s => s.href.includes("ak02"))
    const nextStep = asesmenSteps[currentIdx + 1]
    const nextPath = nextStep ? nextStep.href.replace("/asesi/asesmen/", `/asesi/asesmen/${id}/`) : `/asesi/asesmen/${id}/selesai`
    navigate(nextPath)
  }

  const numDit = parseFloat(totalSkorDit) || 0
  const numPg = parseFloat(totalSkorPg) || 0
  const numEsai = parseFloat(totalSkorEsai) || 0
  const nilaiDit = numDit / 10 * 50
  const nilaiPg = numPg / 20 * 30
  const nilaiEsai = numEsai / 10 * 20
  const skorAkhir = nilaiDit + nilaiPg + nilaiEsai

  const handleEvidenceChange = (unitId: number, key: EvidenceKey) => {
    if (!isAsesor) return
    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u
      const ev = { ...u.evidence, [key]: !u.evidence[key] }
      return { ...u, evidence: ev }
    }))
  }

  const doSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      const answers = units.map(u => ({
        id_unit_kompetensi: u.id,
        observasi: !!u.evidence.observasi,
        portofolio: !!u.evidence.portofolio,
        pertanyaan_wawancara: !!u.evidence.pertanyaan_wawancara,
        pertanyaan_lisan: !!u.evidence.pertanyaan_lisan,
        pertanyaan_tertulis: !!u.evidence.pertanyaan_tertulis,
        proyek_kerja: !!u.evidence.proyek_kerja,
        lainnya: !!u.evidence.lainnya,
      }))
      const payload: any = {
        answers,
        total_skor_dit: numDit,
        total_skor_pg: numPg,
        total_skor_esai: numEsai,
        is_kompeten: isKompeten,
        tindak_lanjut: tindakLanjut || null,
        komentar: komentar || null,
      }

      const res = await fetch(`${API_BASE_URL}/asesmen/${id}/ak02`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const msg = await extractApiError(res, 'Gagal menyimpan AK.02')
        showError(msg); setIsSaving(false); return
      }

      await signing.generateQR()
      signing.publishUpdate()
      showSuccess('AK.02 berhasil disimpan!')
    } catch (e) {
      showError(extractErrorMessage(e, 'Gagal menyimpan data'))
    } finally { setIsSaving(false) }
  }

  const handleSave = async () => {
    if (!id) return

    if (tahap === 0 || signing.allSigned) return goNext()
    if (!isAsesor && signing.asesiHasSigned) return goNext()
    if (isAsesor && signing.asesorHasSigned) return goNext()
    if (!signing.agreedChecklist) {
      showWarning('Silakan centang pernyataan terlebih dahulu.')
      return
    }
    if (!isAsesor && !signing.allAsesorSigned) {
      showWarning(`Menunggu tanda tangan: ${signing.missingLabels.join(', ')}`)
      return
    }
    if (isKompeten === null) {
      showError('Pilih rekomendasi hasil asesmen terlebih dahulu')
      return
    }

    await doSave()
  }

  if (isLoading) return <FullPageLoader text="Memuat AK.02..." />

  const inputStyle = { border: '1px solid #000', padding: '2px 6px', width: '70px', textAlign: 'center' as const, fontSize: '12pt' }
  const areaStyle = { width: '100%', border: 'none', padding: '4px', minHeight: '60px', fontSize: '11pt', resize: 'vertical' as const, outline: 'none', background: 'transparent' }

  const EVIDENCE_HEADERS: Record<EvidenceKey, string> = {
    observasi: 'Observasi demonstrasi',
    portofolio: 'Portofolio',
    pertanyaan_wawancara: 'Pernyataan Pihak Ketiga Pertanyaan Wawancara',
    pertanyaan_lisan: 'Pertanyaan lisan',
    pertanyaan_tertulis: 'Pertanyaan tertulis',
    proyek_kerja: 'Proyek kerja',
    lainnya: 'Lainnya',
  }

  return (
    <ModularAsesiLayout currentStep={currentStep} steps={asesmenSteps} id={id} metode={metode} isKan={isKanFlow}>
      <AsesmenBreadcrumb currentPage="AK.02" />

      <div style={{ ...fontS, maxWidth: '1100px', margin: '0 auto' }}>
        {/* TITLE */}
        <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD', marginBottom: '16px' }}>
          FR.AK.02 &nbsp;&nbsp; FRAGEMEN ANTARA ASESOR
        </div>

        {/* IDENTITAS */}
        <IdentitasTable
          jabatanKerja={jabatanKerja}
          nomorSkema={nomorSkema}
          tuk={tuk}
          asesorList={asesorList}
          namaAsesi={namaAsesi || user?.name || '-'}
          tanggalMulai={tanggalUji}
          tanggalSelesai={tanggalSelesai}
        />
        <p style={{ fontSize: '13px', margin: '8px 0' }}>
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
        </p>

        {/* MATRIKS KOMPETENSI */}
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding="5" cellSpacing="0">
          <thead>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', ...hdDok }}>
              <th style={{ ...td, width: '22%' }}>Unit kompetensi</th>
              {EVIDENCE_KEYS.map(k => (
                <th key={k} style={{ ...td, fontSize: '10pt' }}>{EVIDENCE_HEADERS[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: '20px' }}>Belum ada unit kompetensi.</td></tr>
            )}
            {units.map(unit => (
              <tr key={unit.id}>
                <td style={td}>
                  <b>{unit.kode}</b><br />
                  {unit.nama}
                </td>
                {EVIDENCE_KEYS.map(k => (
                  <td key={k} style={{ ...td, textAlign: 'center', verticalAlign: 'middle' }}>
                    <CustomCheckbox
                      checked={!!unit.evidence[k]}
                      onChange={() => handleEvidenceChange(unit.id, k)}
                      disabled={!isAsesor}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <br />

        {/* REKAPITULASI PENILAIAN HASIL UJI */}
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding="5" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{ padding: '10px 14px', fontSize: '13px', lineHeight: 1.4, border: 'none' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '12px' }}>
                  Rekapitulasi Penilaian Hasil Uji
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>A.</span>
                  <div>
                    <b>Panduan Penilaian:</b>
                    <ol style={{ margin: '4px 0 8px', paddingLeft: '22px' }}>
                      <li>Tuliskan Total Skor dari setiap masing masing instrumen asesmen (FR. IA 04B, FR. IA 05 dan FR. IA 06).</li>
                      <li>Rumus Skor:</li>
                    </ol>
                    <div style={{ marginLeft: '18px' }}>
                      <div>• Skor Pertanyaan DIT = (Total Skor / 10) × bobot nilai</div>
                      <div>• Skor Pertanyaan Pilihan Ganda = (Total Skor / 20) × bobot nilai</div>
                      <div>• Skor Pertanyaan Esai = (Total Skor / 10) × bobot nilai</div>
                      <div>• Total Skor Nilai = Skor FR. IA 04B + Skor FR. IA 05 + Skor FR. IA 06</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>B.</span>
                  <div>
                    <b>Syarat Total Skor Nilai Kompeten/Lulus yaitu:</b>
                    <ol style={{ margin: '4px 0 0', paddingLeft: '22px' }}>
                      <li>Total Skor Nilai &lt; 65/70 dinyatakan <b>"Tidak Lulus/ Tidak direkomendasikan Kompeten"</b></li>
                      <li>Total Skor Nilai ≧ 65/70 dapat direkomendasikan <b>"Lulus/ Direkomendasikan Kompeten"</b></li>
                    </ol>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* TABEL NILAI */}
        <table style={{ border: '1px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding="5" cellSpacing="0">
          <tbody>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', ...hdDok }}>
              <th style={{ ...td, width: '28%' }}>Form</th>
              <th style={td}>Jumlah Soal</th>
              <th style={td}>Total Skor</th>
              <th style={td}>Bobot Nilai %</th>
              <th style={td}>Nilai Skor</th>
            </tr>
            <tr>
              <td style={td}>1. FR IA 04B<br />Pertanyaan DIT</td>
              <td style={{ ...td, textAlign: 'center' }}>10</td>
              <td style={{ ...td, textAlign: 'center' }}>
                {isAsesor ? (
                  <input type="number" min={0} max={10} style={inputStyle} value={totalSkorDit} onChange={e => setTotalSkorDit(e.target.value)} />
                ) : (totalSkorDit || '-')}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>50</td>
              <td style={{ ...td, textAlign: 'center' }}>{nilaiDit.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={td}>2. FR IA 05<br />Pertanyaan Pilihan Ganda</td>
              <td style={{ ...td, textAlign: 'center' }}>20</td>
              <td style={{ ...td, textAlign: 'center' }}>
                {isAsesor ? (
                  <input type="number" min={0} max={20} style={inputStyle} value={totalSkorPg} onChange={e => setTotalSkorPg(e.target.value)} />
                ) : (totalSkorPg || '-')}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>30</td>
              <td style={{ ...td, textAlign: 'center' }}>{nilaiPg.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={td}>3. FR IA 06<br />Pertanyaan Esai</td>
              <td style={{ ...td, textAlign: 'center' }}>10</td>
              <td style={{ ...td, textAlign: 'center' }}>
                {isAsesor ? (
                  <input type="number" min={0} max={10} style={inputStyle} value={totalSkorEsai} onChange={e => setTotalSkorEsai(e.target.value)} />
                ) : (totalSkorEsai || '-')}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>20</td>
              <td style={{ ...td, textAlign: 'center' }}>{nilaiEsai.toFixed(2)}</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={4} style={{ ...td, textAlign: 'center', height: '45px' }}>Skor Nilai Akhir</td>
              <td style={{ ...td, textAlign: 'center', fontSize: '13pt' }}>{skorAkhir.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* REKOMENDASI, TINDAK LANJUT, KOMENTAR */}
        <table style={{ border: '1.4px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding="5" cellSpacing="0">
          <tbody>
            <tr>
              <Td style={{ width: '30%', fontWeight: 'bold' }}>Rekomendasi hasil<br />asesmen</Td>
              <td style={td}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isAsesor ? 'pointer' : 'default', padding: '6px 0' }}>
                  <CustomCheckbox
                    checked={isKompeten === false}
                    onChange={() => isAsesor && setIsKompeten(false)}
                    disabled={!isAsesor}
                  />
                  <span>Tidak Lulus/ Tidak direkomendasikan Kompeten (Nilai total &lt; 65/70)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isAsesor ? 'pointer' : 'default', padding: '6px 0' }}>
                  <CustomCheckbox
                    checked={isKompeten === true}
                    onChange={() => isAsesor && setIsKompeten(true)}
                    disabled={!isAsesor}
                  />
                  <span>Lulus/ Direkomendasikan Kompeten (Nilai total ≧ 65/70)</span>
                </label>
              </td>
            </tr>
            <tr>
              <Td style={{ fontWeight: 'bold' }}>
                Tindak lanjut yang<br />dibutuhkan
                <br /><br />
                <span style={{ fontWeight: 'normal' }}>
                  (Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)
                </span>
              </Td>
              <td style={{ ...td, verticalAlign: 'top' }}>
                {isAsesor ? (
                  <textarea style={areaStyle} value={tindakLanjut} onChange={e => setTindakLanjut(e.target.value)} placeholder="Tuliskan tindak lanjut..." />
                ) : (tindakLanjut || '-')}
              </td>
            </tr>
            <tr>
              <Td style={{ fontWeight: 'bold' }}>Komentar/ Observasi<br />oleh asesor</Td>
              <td style={{ ...td, verticalAlign: 'top' }}>
                {isAsesor ? (
                  <textarea style={areaStyle} value={komentar} onChange={e => setKomentar(e.target.value)} placeholder="Tuliskan komentar..." />
                ) : (komentar || '-')}
              </td>
            </tr>
          </tbody>
        </table>
        <br />

        {/* TANDA TANGAN */}
        <table style={{ border: '1.4px solid #000', borderCollapse: 'collapse', width: '100%' }} cellPadding="5" cellSpacing="0">
          <>
            <tr style={{ fontWeight: 'bold' }}>
              <Td colSpan={3}>Asesi :</Td>
            </tr>
            <tr>
              <Td style={{ width: '30%' }}>Nama</Td>
              <Td style={{ width: '3%', textAlign: 'center' }}>:</Td>
              <Td style={{ textTransform: 'uppercase' }}>{namaAsesi || user?.name || '-'}</Td>
            </tr>
            <tr>
              <Td>Tanda tangan<br />dan Tanggal</Td>
              <Td style={{ textAlign: 'center' }}>:</Td>
              <Td style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img src={barcodes.asesi.url} style={{ height: '50px', width: '50px', objectFit: 'contain' }} alt="barcode asesi" />
                    {barcodes.asesi?.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {new Date(barcodes.asesi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ) : null}
              </Td>
            </tr>
            {asesorList.map((a: any, idx: number) => {
              const key = idx === 0 ? 'asesor1' : 'asesor2' as const
              const asesorBc = barcodes?.[key]
              return (
                <Fragment key={idx}>
                  <tr style={{ fontWeight: 'bold' }}>
                    <Td colSpan={3}>Asesor {idx + 1} :</Td>
                  </tr>
                  <tr>
                    <Td>Nama</Td>
                    <Td style={{ textAlign: 'center' }}>:</Td>
                    <Td style={{ textTransform: 'uppercase' }}>{a?.nama || '-'}</Td>
                  </tr>
                  <tr>
                    <Td>No. Reg</Td>
                    <Td style={{ textAlign: 'center' }}>:</Td>
                    <Td>{a?.noreg || ''}</Td>
                  </tr>
                  <tr>
                    <Td>Tanda tangan<br />dan Tanggal</Td>
                    <Td style={{ textAlign: 'center' }}>:</Td>
                    <Td style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                      {asesorBc?.url ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <img src={asesorBc.url} style={{ height: '50px', width: '50px', objectFit: 'contain' }} alt={`QR ${a?.nama || 'asesor'}`} />
                          {asesorBc?.tanggal && (
                            <div style={{ fontSize: '11px', color: '#333' }}>
                              {new Date(asesorBc.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </Td>
                  </tr>
                </Fragment>
              )
            })}
          </>
        </table>
        <br />

        {/* LAMPIRAN DOKUMEN */}
        <div style={{ fontSize: '12px' }}>
          <b>LAMPIRAN DOKUMEN:</b><br />
          1. Dokumen APL 01 peserta<br />
          2. Dokumen APL 02 peserta<br />
          3. Bukti-bukti berkualitas peserta<br />
          4. Tinjauan proses asesmen
        </div>

        {/* Checklist + Buttons */}
        <div style={{ padding: '16px 0' }}>
          {!signing.allSigned && (
            <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <CustomCheckbox
                  checked={signing.agreedChecklist}
                  onChange={() => signing.setAgreedChecklist(!signing.agreedChecklist)}
                  disabled={signing.allSigned}
                />
                <span style={{ fontSize: '13px', color: '#333' }}>
                  Saya menyatakan dengan sebenar-benarnya bahwa saya telah memberikan jawaban yang jujur dan dapat dipertanggungjawabkan sesuai dengan pengetahuan dan pengalaman yang saya miliki.
                </span>
              </label>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <ActionButton variant="primary" disabled={signing.buttonDisabled} onClick={handleSave}>
              {signing.buttonText}
            </ActionButton>
          </div>
        </div>
      </div>

      <WebcamModal isOpen={showAwalModal} onClose={handleAwalModalClose} onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen" description="Silakan ambil foto wajah Anda untuk absen masuk" canClose={false} />
    </ModularAsesiLayout>
  )
}
