/**
 * Editor Revisi MUK — FR.APL.02 (Asesmen Mandiri).
 * Tampilan = form FR.APL.02 halaman asesi (Apl02Page): tabel identitas,
 * panduan, tabel unit dgn kolom K/BK + bukti (read-only), tabel rekomendasi
 * dgn metode asesmen + barcode ttd existing (read-only).
 * Hati-hati: POST wajib tiap answer punya ≥1 file → file existing dari GET
 * (`subunit.files`) dikirim ulang sebagai file_ids; admin merevisi `kompeten`
 * & `metode`. is_dilanjutkan: true punya efek lanjut → konfirmasi sebelum simpan.
 */
import { Fragment, useEffect, useMemo, useState } from 'react'
import { File } from 'lucide-react'
import { BRANDING } from '@/config/branding'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { DocTitle, fmtTanggalId, type TtdBarcode } from './bnsp'

interface BarcodeInfo {
  url: string | null
  tanggal: string | null
  nama: string | null
}
interface SubunitBarcodes {
  asesi: BarcodeInfo
  asesor1: BarcodeInfo | null
  asesor2: BarcodeInfo | null
}
interface ServerFile {
  id: number
  name: string
  path: string
}
interface Subunit {
  id: string
  no_elemen: string
  judul_elemen: string
  kompeten?: boolean
  kuk_list: { no_kuk: string; judul_kuk: string }[]
  files: ServerFile[]
  barcodes?: SubunitBarcodes
}
interface Unit {
  id: string
  kode: string
  judul_kompetensi: string
  subunits: Subunit[]
}
interface Apl02Response {
  message: string
  data?: {
    metode?: 'observasi' | 'portofolio'
    is_dilanjutkan?: boolean
    units: Unit[]
    barcodes?: SubunitBarcodes
  }
}

type Metode = 'observasi' | 'portofolio'

const cell = { border: '1px solid #000', padding: '4px' } as const

/** Chip nama file bukti — read-only (sama gaya kapsul file asesi, tanpa aksi). */
function FileChip({ name }: { name: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        height: '38px',
        background: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '0 12px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#0369a1',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        userSelect: 'none',
      }}
    >
      <File size={14} style={{ color: '#0284c7' }} />
      <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
    </span>
  )
}

/** Sel tanda tangan/tanggal read-only: barcode existing atau '-'. */
function TtdBox({ barcode }: { barcode?: TtdBarcode | BarcodeInfo | null }) {
  return (
    <td style={{ ...cell, height: '120px', padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
      {barcode?.url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src={barcode.url} alt="Tanda Tangan" style={{ height: '70px', width: '70px', objectFit: 'contain' }} />
          {barcode.tanggal && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>{fmtTanggalId(barcode.tanggal)}</div>
          )}
        </div>
      ) : (
        '-'
      )}
    </td>
  )
}

export function Apl02Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Apl02Response>(praUrl(idIzin, 'apl02'))

  const [units, setUnits] = useState<Unit[]>([])
  const [kompetenMap, setKompetenMap] = useState<Record<string, boolean>>({})
  const [metode, setMetode] = useState<Metode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [subunitBarcodes, setSubunitBarcodes] = useState<Record<string, SubunitBarcodes>>({})

  useEffect(() => {
    const inner = data?.data
    if (!inner?.units) return
    setUnits(inner.units)
    setMetode(inner.metode ?? null)
    const init: Record<string, boolean> = {}
    const bcs: Record<string, SubunitBarcodes> = {}
    inner.units.forEach((unit) => {
      unit.subunits.forEach((subunit) => {
        // Default 'K' bila belum pernah disimpan (mirip Apl02Page asesi)
        init[subunit.id] = subunit.kompeten !== false
        if (subunit.barcodes) bcs[subunit.id] = subunit.barcodes
        else if (inner.barcodes) bcs[subunit.id] = inner.barcodes
      })
    })
    setKompetenMap(init)
    setSubunitBarcodes(bcs)
  }, [data])

  const totalSubunit = useMemo(
    () => units.reduce((n, u) => n + u.subunits.length, 0),
    [units]
  )
  const subunitTanpaFile = useMemo(
    () =>
      units.flatMap((u) => u.subunits).filter((s) => !s.files || s.files.length === 0)
        .length,
    [units]
  )

  const doSave = async () => {
    setConfirmOpen(false)
    setIsSaving(true)
    try {
      const answers = units.flatMap((unit) =>
        unit.subunits.map((subunit) => ({
          subunit_id: subunit.id,
          kompeten: kompetenMap[subunit.id] ?? true,
          // file existing wajib dikirim ulang (validasi backend: ≥1 file per answer)
          file_ids: (subunit.files ?? []).map((f) => f.id),
          file_urls: [] as { url: string; name: string }[],
        }))
      )
      await saveDoc(praUrl(idIzin, 'apl02'), {
        metode: metode ?? '',
        is_dilanjutkan: true,
        answers,
      })
      toast.showSuccess('FR.APL.02 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.APL.02')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClick = () => {
    if (units.length === 0) {
      toast.showWarning('Tidak ada data elemen untuk disimpan')
      return
    }
    if (subunitTanpaFile > 0) {
      toast.showWarning(
        `${subunitTanpaFile} elemen belum punya file bukti — APL.02 tidak bisa disimpan sebelum asesi mengunggah filenya.`
      )
      return
    }
    setConfirmOpen(true)
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (units.length === 0) return <DocError message="Data FR.APL.02 tidak ditemukan." onRetry={reload} />

  const jenjang = parseInt(dokumenHeader?.jenjang || '0', 10)
  const header = dokumenHeader
  const namaAsesor = (header?.asesorList ?? [])
    .map((a) => a.nama)
    .filter(Boolean)
    .join(', ')
  const firstSubunitId = Object.keys(subunitBarcodes)[0]
  const asesiBarcode = Object.values(subunitBarcodes).find((b) => b.asesi?.url)?.asesi

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>APL-02 ASESMEN MANDIRI {header?.jabatanKerja || '-'}</DocTitle>

      {/* Tabel identitas dokumen */}
      <table style={{ width: '100%', tableLayout: 'fixed', contain: 'content' as const, borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '12px' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ ...cell, padding: '6px 8px', width: '25%', fontWeight: 'bold', verticalAlign: 'top', textTransform: 'uppercase' }}>
              Skema Sertifikasi<br />
              <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(<del>KKNI</del>/Okupasi/<del>Klaster</del>)</span>
            </td>
            <td style={{ ...cell, padding: '6px 8px', width: '12%', fontWeight: 'bold', textTransform: 'uppercase' }}>Judul</td>
            <td style={{ ...cell, padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
            <td style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nomor</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>TUK</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesor</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{namaAsesor || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nama Asesi</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{header?.namaAsesi || '-'}</td>
          </tr>
          <tr>
            <td style={{ ...cell, padding: '6px 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tanggal</td>
            <td style={{ ...cell, padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td colSpan={2} style={{ ...cell, padding: '6px 8px', textTransform: 'uppercase' }}>{fmtTanggalId(header?.tanggalUji) || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* Panduan */}
      <div style={{ background: BRANDING.primaryColor, color: '#fff', padding: '6px 8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>
        Panduan Asesmen Mandiri
      </div>
      <div style={{ background: '#fff', border: '1px solid #000', marginBottom: '20px', fontSize: '11px' }}>
        <div style={{ padding: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Instruksi:</div>
          <ul style={{ margin: '4px 0 4px 20px', padding: 0 }}>
            <li>Baca setiap pertanyaan di kolom sebelah kiri</li>
            <li>Beri tanda centang (v) pada kotak jika Anda yakin dapat melakukan tugas yang dijelaskan</li>
            <li>Isi kolom di sebelah kanan dengan mendaftar bukti yang Anda miliki</li>
          </ul>
        </div>
      </div>

      {/* Daftar unit kompetensi — kolom bukti read-only (chip nama file) */}
      {units.map((unit, unitIndex) => (
        <table key={unit.id} style={{ width: '100%', tableLayout: 'fixed', contain: 'content' as const, borderCollapse: 'collapse', marginBottom: '20px', background: '#fff', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ ...cell, width: '45%', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Kode &amp; Judul<br />Kompetensi {unitIndex + 1} :
              </td>
              <td style={{ ...cell, width: '5%' }}></td>
              <td style={{ ...cell, width: '5%' }}></td>
              <td style={{ ...cell, width: '45%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{unit.kode}</div>
                <div>{unit.judul_kompetensi}</div>
              </td>
            </tr>

            <tr>
              <td style={{ ...cell, width: '45%', fontWeight: 'bold', textTransform: 'uppercase' }}>DAPATKAH SAYA ?</td>
              <td style={{ ...cell, width: '5%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>K</td>
              <td style={{ ...cell, width: '5%', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>BK</td>
              <td style={{ ...cell, width: '45%', fontWeight: 'bold', textTransform: 'uppercase' }}>Bukti</td>
            </tr>

            {unit.subunits.map((subunit) => {
              const kukCount = subunit.kuk_list.length
              return (
                <Fragment key={subunit.id}>
                  {/* Elemen Header */}
                  <tr>
                    <td style={cell}>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Elemen {subunit.no_elemen} :</span><br />
                      {subunit.judul_elemen}
                    </td>
                    <td style={cell}></td>
                    <td style={cell}></td>
                    <td style={cell}></td>
                  </tr>

                  {/* KUK rows + rowSpan K/BK/Bukti */}
                  {subunit.kuk_list.map((kuk, idx) => (
                    <tr key={kuk.no_kuk}>
                      <td style={{ ...cell, width: '45%', verticalAlign: 'top' }}>
                        {kuk.no_kuk} {kuk.judul_kuk}
                      </td>
                      {idx === 0 && (
                        <>
                          <td rowSpan={kukCount} style={{ ...cell, width: '5%', textAlign: 'center', verticalAlign: 'middle' }}>
                            <CustomCheckbox
                              checked={kompetenMap[subunit.id] === true}
                              onChange={() => setKompetenMap((prev) => ({ ...prev, [subunit.id]: true }))}
                            />
                          </td>
                          <td rowSpan={kukCount} style={{ ...cell, width: '5%', textAlign: 'center', verticalAlign: 'middle' }}>
                            <CustomCheckbox
                              checked={kompetenMap[subunit.id] === false}
                              onChange={() =>
                                setKompetenMap((prev) => ({ ...prev, [subunit.id]: prev[subunit.id] === false ? true : false }))
                              }
                            />
                          </td>
                          <td rowSpan={kukCount} style={{ ...cell, padding: '6px 8px', width: '45%', verticalAlign: 'top' }}>
                            {(subunit.files ?? []).length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(subunit.files ?? []).map((file) => (
                                  <FileChip key={file.id} name={file.name} />
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#999' }}>Belum ada file bukti</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      ))}

      {/* Rekomendasi Untuk Asesi */}
      <div style={{ padding: '8px 12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>REKOMENDASI UNTUK ASESI</span>
      </div>

      <table style={{ width: '100%', maxWidth: '100%', tableLayout: 'fixed', contain: 'content' as const, background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td rowSpan={3 + ((header?.asesorList?.length ?? 0) > 0 ? header!.asesorList.length * 4 : 3)} style={{ width: '30%', border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
              <span style={{ fontWeight: 'bold' }}>
                Rekomendasi Untuk Asesi: Asesmen{' '}
                <span>dapat</span> /{' '}
                <span style={{ textDecoration: 'none' }}>tidak dapat</span> dilanjutkan melalui pendekatan
              </span><br /><br />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                <CustomCheckbox
                  checked={metode === 'observasi'}
                  onChange={() => setMetode('observasi')}
                  disabled={isSaving}
                />
                <span>Observasi</span>
              </label>
              {jenjang >= 4 && (
                <>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                    <CustomCheckbox
                      checked={metode === 'portofolio'}
                      onChange={() => setMetode('portofolio')}
                      disabled={isSaving}
                    />
                    <span>Portofolio</span>
                  </label>
                </>
              )}
            </td>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesi :</td>
          </tr>
          <tr>
            <td style={{ width: '20%', border: '1px solid #000', padding: '8px' }}>Nama</td>
            <td style={{ width: '25%', border: '1px solid #000', padding: '8px' }}>{header?.namaAsesi?.toUpperCase() || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
            <TtdBox barcode={asesiBarcode} />
          </tr>

          {(header?.asesorList?.length ?? 0) > 0 ? (
            header!.asesorList.map((asesor, idx) => {
              const asesorBarcode = firstSubunitId
                ? (idx === 0 ? subunitBarcodes[firstSubunitId]?.asesor1 : subunitBarcodes[firstSubunitId]?.asesor2)
                : null
              return (
                <Fragment key={asesor.id}>
                  {idx === 0 && (
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
                    </tr>
                  )}
                  {idx > 0 && (
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Asesor :</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Nama Asesor {header!.asesorList.length > 1 ? idx + 1 : ''} :</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.nama?.toUpperCase() || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{asesor.noreg || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                    <TtdBox barcode={asesorBarcode} />
                  </tr>
                </Fragment>
              )
            })
          ) : (
            <>
              <tr>
                <td></td>
                <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Ditinjau Oleh Asesor :</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px' }}>Nama Asesor :</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{namaAsesor}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px' }}>No. Reg:</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>Tanda tangan/<br />Tanggal</td>
                <TtdBox barcode={firstSubunitId ? subunitBarcodes[firstSubunitId]?.asesor1 : null} />
              </tr>
            </>
          )}
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSaveClick}
        note={`${totalSubunit} elemen — file bukti existing dikirim ulang tanpa diubah.`}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Simpan Revisi APL 02?"
        message="Penyimpanan menandai asesmen mandiri ini dilanjutkan (is_dilanjutkan). Lanjutkan simpan?"
        confirmText="Ya, Simpan"
        onConfirm={doSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
