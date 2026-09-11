/**
 * Editor Revisi MUK — FR.AK.05 (Laporan Asesmen).
 * Tampilan = form FR.AK.05 halaman asesi (Ak05Page): header dokumen, tabel
 * rekomendasi asesi (K/BK + keterangan), catatan aspek/penolakan/saran,
 * footer ttd asesor read-only (barcode existing) + catatan asesor 1.
 * ⚠️ Efek samping: POST mengubah kolom kompeten asesi → ConfirmDialog tetap.
 * Payload persis editor sebelumnya (kompeten, keterangan, aspek, dll).
 */
import { Fragment, useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { asesmenUrl } from '@/lib/revisi-muk-api'
import {
  DocError,
  DocLoading,
  SaveBar,
  saveDoc,
  useDocFetch,
  type MukEditorProps,
} from './shared'
import { Barcodes, DocTitle, fmtTanggalId } from './bnsp'

interface Ak05Response {
  message: string
  data?: {
    kompeten?: boolean
    answers?: {
      keterangan?: string
      aspek?: string
      pencatatan_penolakan?: string
      saran?: string
      catatan?: string
    }
    barcodes?: Barcodes
  }
}

export function Ak05Editor({ idIzin, onSaved, dokumenHeader }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Ak05Response>(asesmenUrl(idIzin, 'ak05'))

  const [kompeten, setKompeten] = useState<boolean>(false)
  const [keterangan, setKeterangan] = useState('')
  const [aspek, setAspek] = useState('')
  const [pencatatanPenolakan, setPencatatanPenolakan] = useState('')
  const [saran, setSaran] = useState('')
  const [catatan, setCatatan] = useState('')
  const [barcodes, setBarcodes] = useState<Barcodes | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const inner = data?.data
    if (!inner) return
    setKompeten(inner.kompeten || false)
    setKeterangan(inner.answers?.keterangan || '')
    setAspek(inner.answers?.aspek || '')
    setPencatatanPenolakan(inner.answers?.pencatatan_penolakan || '')
    setSaran(inner.answers?.saran || '')
    setCatatan(inner.answers?.catatan || '')
    if (inner.barcodes) setBarcodes(inner.barcodes)
  }, [data])

  const doSave = async () => {
    setConfirmOpen(false)
    setIsSaving(true)
    try {
      await saveDoc(asesmenUrl(idIzin, 'ak05'), {
        kompeten,
        keterangan,
        aspek,
        pencatatan_penolakan: pencatatanPenolakan,
        saran,
        catatan,
      })
      toast.showSuccess('FR.AK.05 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.AK.05')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClick = () => setConfirmOpen(true)

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (!data?.data) return <DocError message="Data FR.AK.05 tidak ditemukan." onRetry={reload} />

  const header = dokumenHeader
  const asesorList = header?.asesorList ?? []
  const namaAsesor = asesorList.map((a) => a.nama).filter(Boolean).join(' & ')

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DocTitle>FR.AK.05 &nbsp;&nbsp; LAPORAN ASESMEN</DocTitle>

      {/* HEADER Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)</td>
            <td style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>Judul</td>
            <td style={{ width: '5%', border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.jabatanKerja || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>{header?.nomorSkema || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.tuk || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesor?.toUpperCase() || '-'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '6px' }}>{fmtTanggalId(new Date().toISOString())}</td>
          </tr>
        </tbody>
      </table>

      {/* TABEL ASESI — satu baris untuk asesi pada revisi ini */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '5%', border: '1px solid #000', padding: '6px' }} rowSpan={2}>No.</th>
            <th style={{ width: '35%', border: '1px solid #000', padding: '6px' }} rowSpan={2}>Nama Asesi</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Rekomendasi</th>
            <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }} rowSpan={2}>Keterangan**</th>
          </tr>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>K</th>
            <th style={{ width: '10%', border: '1px solid #000', padding: '6px' }}>BK</th>
          </tr>
          <tr>
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1.</td>
            <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{header?.namaAsesi?.toUpperCase() || '-'}</td>
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
              <CustomCheckbox checked={kompeten} onChange={() => !isSaving && setKompeten(true)} disabled={isSaving} />
            </td>
            <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
              <CustomCheckbox checked={!kompeten} onChange={() => !isSaving && setKompeten(false)} disabled={isSaving} />
            </td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: 'auto', minHeight: '40px', border: '1px solid #ccc', padding: '4px', fontSize: '13px', resize: 'vertical', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Keterangan..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: '11px', color: '#666', marginBottom: '15px' }}>
        ** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila mengases satu skema
      </p>

      {/* CATATAN Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Aspek Negatif dan Positif dalam Asesmen</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={aspek}
                onChange={(e) => setAspek(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: 'auto', minHeight: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'vertical', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Tuliskan aspek positif dan negatif..."
              />
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Pencatatan Penolakan Hasil Asesmen</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={pencatatanPenolakan}
                onChange={(e) => setPencatatanPenolakan(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: 'auto', minHeight: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'vertical', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Tuliskan pencatatan penolakan..."
              />
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Saran Perbaikan :<br />(Asesor/Personil Terkait)</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>
              <textarea
                value={saran}
                onChange={(e) => setSaran(e.target.value)}
                disabled={isSaving}
                style={{ width: '100%', height: 'auto', minHeight: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'vertical', cursor: isSaving ? 'not-allowed' : 'text' }}
                placeholder="Tuliskan saran perbaikan..."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER Table — TTD asesor + catatan asesor 1 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
        <tbody>
          {asesorList.map((asesor, index) => {
            const asesorBarcode = index === 0 ? barcodes?.asesor1 : barcodes?.asesor2
            const label = `Asesor ${index + 1}`
            return (
              <Fragment key={asesor.id}>
                {/* Row 1: Catatan (only for Asesor 1) OR Label (for Asesor 2) */}
                <tr>
                  {index === 0 ? (
                    <td style={{ width: '27%', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }} rowSpan={asesorList.length * 4}>
                      <b>Catatan Asesor 1 :</b>
                      <div style={{ marginTop: '8px' }}>
                        <textarea
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          disabled={isSaving}
                          style={{ width: '100%', height: 'auto', minHeight: '80px', border: '1px solid #ccc', padding: '4px', fontSize: '12px', resize: 'vertical', cursor: isSaving ? 'not-allowed' : 'text' }}
                          placeholder="Tuliskan catatan..."
                        />
                      </div>
                    </td>
                  ) : (
                    ''
                  )}
                  <td colSpan={3} style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>{label}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{asesor.nama?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{asesor.noreg || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan / Tanggal</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {asesorBarcode ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img
                          src={asesorBarcode.url}
                          alt={`Tanda Tangan ${asesor.nama}`}
                          style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                        />
                        {asesorBarcode.tanggal && (
                          <div style={{ fontSize: '11px', color: '#333' }}>
                            {fmtTanggalId(asesorBarcode.tanggal)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ minHeight: '50px' }}></div>
                    )}
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>

      <SaveBar
        isSaving={isSaving}
        onSave={handleSaveClick}
        note="Perhatian: menyimpan dokumen ini mengubah status kompeten asesi (Kompeten / Belum Kompeten)."
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Simpan Revisi AK.05?"
        message={`Status asesi akan diubah menjadi "${kompeten ? 'KOMPETEN' : 'BELUM KOMPETEN'}" sesuai pilihan ini. Lanjutkan?`}
        confirmText="Ya, Simpan"
        onConfirm={doSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
