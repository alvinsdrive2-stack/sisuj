/**
 * Editor Revisi MUK — FR.APL.01 (Pendaftaran Sertifikasi).
 * Tampilan = form FR.APL.01 halaman asesi (Apl01Page): tabel A. Data Pribadi
 * (read-only), B. Data Pekerjaan (editable), skema + tujuan + unit kompetensi.
 * Hanya data pekerjaan yang disimpan — payload sama dgn Apl01Page.
 */
import { useEffect, useState } from 'react'
import { BRANDING } from '@/config/branding'
import { CustomCheckbox } from '@/components/ui/Checkbox'
import { useToast } from '@/contexts/ToastContext'
import { praUrl } from '@/lib/revisi-muk-api'
import { DocError, DocLoading, SaveBar, saveDoc, useDocFetch, type MukEditorProps } from './shared'

interface DataPribadi {
  nama?: string
  nik?: string
  tempat_lahir?: string
  tanggal_lahir?: string
  jenis_kelamin?: string
  kebangsaan?: string
  alamat?: string
  telepon_rumah?: string | null
  telepon_hp?: string
  email?: string
  kualifikasi?: string
}
interface DataPekerjaan {
  perusahaan: string
  jabatan: string
  alamat_kantor: string | null
  kode_pos: number | string | null
  telepon_kantor: string | null
  fax: string | null
  email_kantor: string | null
}
interface SkemaOption {
  id: number | string
  label: string
  checked?: boolean
}
interface Apl01Response {
  message: string
  data?: {
    data_pribadi?: DataPribadi
    data_pekerjaan?: DataPekerjaan
    data_sertifikasi?: { judul?: string; nomor?: string; options?: SkemaOption[] }
    data_unit_kompetensi?: { kode: string; nama: string }[]
    skkni?: string
  }
}

const labelTd = { width: '200px', background: '#fff', border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' } as const
const inputTd = { border: '1px solid #000', padding: '4px 8px', verticalAlign: 'middle' } as const
const inputStyle = { width: '100%', padding: '4px 6px', border: '1px solid #000', fontSize: '13px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase' } as const
const disabledStyle = { ...inputStyle, cursor: 'not-allowed', background: '#f5f5f5' } as const
const sectionTitle = { padding: '8px 12px', marginBottom: '10px' } as const
const aplTable = { width: '100%', maxWidth: '100%', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' } as const

export function Apl01Editor({ idIzin, onSaved }: MukEditorProps) {
  const toast = useToast()
  const { data, isLoading, error, reload } = useDocFetch<Apl01Response>(praUrl(idIzin, 'apl01'))

  const [form, setForm] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const pekerjaan = data?.data?.data_pekerjaan
    if (!pekerjaan) return
    const init: Record<string, string> = {}
    ;(Object.keys(pekerjaan) as (keyof DataPekerjaan)[]).forEach((key) => {
      init[key] = String((pekerjaan[key] as string | number | null) ?? '')
    })
    setForm(init)
  }, [data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDoc(praUrl(idIzin, 'apl01'), {
        perusahaan: form.perusahaan ?? '',
        jabatan: form.jabatan ?? '',
        alamat_kantor: form.alamat_kantor ?? '',
        kode_pos: form.kode_pos || null,
        telepon_kantor: form.telepon_kantor ?? '',
        fax: form.fax ?? '',
        email_kantor: form.email_kantor ?? '',
      })
      toast.showSuccess('FR.APL.01 berhasil disimpan')
      onSaved()
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Gagal menyimpan FR.APL.01')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DocLoading />
  if (error) return <DocError message={error} onRetry={reload} />
  if (!data?.data?.data_pekerjaan) return <DocError message="Data FR.APL.01 tidak ditemukan." onRetry={reload} />

  const pribadi = data.data.data_pribadi ?? {}
  const sert = data.data.data_sertifikasi
  const units = data.data.data_unit_kompetensi ?? []
  const set = (key: keyof DataPekerjaan, v: string) => setForm((prev) => ({ ...prev, [key]: v }))

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>FR.APL.01 PENDAFTARAN SERTIFIKASI KOMPETENSI</h1>
      </div>

      {/* A. DATA PRIBADI */}
      <div style={sectionTitle}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>A. DATA PRIBADI</span>
      </div>
      <table style={aplTable}>
        <tbody>
          <tr>
            <td style={labelTd}>Nama</td>
            <td style={inputTd}><input type="text" value={pribadi.nama ?? ''} disabled style={{ ...disabledStyle, textTransform: 'uppercase' }} /></td>
          </tr>
          <tr>
            <td style={labelTd}>No. NIK</td>
            <td style={inputTd}><input type="text" value={pribadi.nik ?? ''} disabled style={disabledStyle} /></td>
          </tr>
          <tr>
            <td style={labelTd}>Tempat/tgl. Lahir</td>
            <td style={inputTd}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={pribadi.tempat_lahir ?? ''} disabled placeholder="Tempat Lahir" style={{ ...disabledStyle, flex: 1 }} />
                <input type="date" value={pribadi.tanggal_lahir ?? ''} disabled style={{ ...disabledStyle, flex: 1 }} />
              </div>
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Jenis kelamin</td>
            <td style={inputTd}>
              <select value={pribadi.jenis_kelamin ?? ''} disabled style={{ ...disabledStyle, minWidth: '150px' }}>
                <option value="">Pilih</option>
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Kebangsaan</td>
            <td style={inputTd}><input type="text" value={pribadi.kebangsaan ?? ''} disabled style={disabledStyle} /></td>
          </tr>
          <tr>
            <td style={labelTd}>Alamat</td>
            <td style={inputTd}><textarea value={pribadi.alamat ?? ''} disabled rows={3} style={{ ...disabledStyle, resize: 'vertical' }} /></td>
          </tr>
          <tr>
            <td style={labelTd}>No. Telp/E-mail</td>
            <td style={inputTd}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '80px', padding: '2px', textTransform: 'uppercase' }}>Rumah</td>
                    <td style={{ padding: '2px' }}><input type="text" value={pribadi.telepon_rumah ?? ''} disabled style={disabledStyle} /></td>
                    <td style={{ width: '30px', padding: '2px', textTransform: 'uppercase' }}>HP</td>
                    <td style={{ padding: '2px' }}><input type="text" value={pribadi.telepon_hp ?? ''} disabled style={disabledStyle} /></td>
                  </tr>
                  <tr>
                    <td style={{ width: '80px', padding: '2px', textTransform: 'uppercase' }}>Email</td>
                    <td colSpan={3} style={{ padding: '2px' }}><input type="email" value={pribadi.email ?? ''} disabled style={disabledStyle} /></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Kualifikasi/Pendidikan</td>
            <td style={inputTd}><input type="text" value={pribadi.kualifikasi ?? ''} disabled style={disabledStyle} /></td>
          </tr>
        </tbody>
      </table>

      {/* B. DATA PEKERJAAN — bagian yang direvisi */}
      <div style={sectionTitle}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>B. DATA PEKERJAAN</span>
      </div>
      <table style={aplTable}>
        <tbody>
          <tr>
            <td style={labelTd}>Nama Perusahaan</td>
            <td style={inputTd}>
              <input type="text" value={form.perusahaan ?? ''} onChange={(e) => set('perusahaan', e.target.value)} disabled={isSaving} style={{ ...inputStyle, cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Jabatan</td>
            <td style={inputTd}>
              <input type="text" value={form.jabatan ?? ''} onChange={(e) => set('jabatan', e.target.value)} disabled={isSaving} style={{ ...inputStyle, cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Alamat Perusahaan</td>
            <td style={inputTd}>
              <textarea value={form.alamat_kantor ?? ''} onChange={(e) => set('alamat_kantor', e.target.value)} disabled={isSaving} rows={3} style={{ ...inputStyle, resize: 'vertical', cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
            </td>
          </tr>
          <tr>
            <td style={labelTd}>No. Telp/Fax/Email</td>
            <td style={inputTd}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50px', padding: '2px', textTransform: 'uppercase' }}>Telp</td>
                    <td style={{ padding: '2px' }}>
                      <input type="text" value={form.telepon_kantor ?? ''} onChange={(e) => set('telepon_kantor', e.target.value)} disabled={isSaving} style={{ ...inputStyle, cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
                    </td>
                    <td style={{ width: '40px', padding: '6px 8px', textTransform: 'uppercase' }}>Fax</td>
                    <td style={{ padding: '2px' }}>
                      <input type="text" value={form.fax ?? ''} onChange={(e) => set('fax', e.target.value)} disabled={isSaving} style={{ ...inputStyle, cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: '50px', padding: '2px', textTransform: 'uppercase' }}>Email</td>
                    <td style={{ padding: '2px' }}>
                      <input type="email" value={form.email_kantor ?? ''} onChange={(e) => set('email_kantor', e.target.value)} disabled={isSaving} style={{ ...inputStyle, cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
                    </td>
                    <td style={{ width: '200px', background: '#fff', padding: '6px 8px', verticalAlign: 'middle', textTransform: 'uppercase' }}>Kode Pos</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <input type="number" value={form.kode_pos ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, kode_pos: e.target.value }))} disabled={isSaving} style={{ ...inputStyle, cursor: isSaving ? 'not-allowed' : 'text', background: isSaving ? '#f5f5f5' : '#fff' }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Skema Sertifikasi + Tujuan Asesmen */}
      <div style={{ padding: '4px', marginBottom: '5px' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>Bagian 2 : Data Sertifikasi</span>
      </div>
      <table style={{ ...aplTable, fontSize: '14px' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Skema Sertifikasi Okupasi Nasional
            </td>
            <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>Judul</td>
            <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle' }}>: {sert?.judul || '-'}</td>
          </tr>
          <tr>
            <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>Nomor</td>
            <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle' }}>: {sert?.nomor || '-'}</td>
          </tr>
          {sert?.options && sert.options.length > 0
            ? sert.options.map((option, index) => (
                <tr key={option.id}>
                  {index === 0 && (
                    <td rowSpan={sert.options!.length} style={{ width: '25%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Tujuan Asesmen
                    </td>
                  )}
                  <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CustomCheckbox checked={!!option.checked} onChange={() => {}} disabled />
                    </div>
                  </td>
                  <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>{option.label}</td>
                </tr>
              ))
            : (
                ['Sertifikasi', 'Sertifikasi Ulang', 'Pengakuan Kompetensi Terkini (PKT)', 'Rekognisi pembelajaran lampau', 'Lainnya:'].map((label, i) => (
                  <tr key={label}>
                    {i === 0 && (
                      <td rowSpan={5} style={{ width: '25%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Tujuan Asesmen
                      </td>
                    )}
                    <td style={{ width: '10%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CustomCheckbox checked={false} onChange={() => {}} disabled />
                      </div>
                    </td>
                    <td style={{ width: '65%', border: '1px solid #000', padding: '8px 10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>{label}</td>
                  </tr>
                ))
              )}
        </tbody>
      </table>

      {/* Daftar Unit Kompetensi */}
      <div style={sectionTitle}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>DAFTAR UNIT KOMPETENSI</span>
      </div>
      <table style={aplTable}>
        <thead>
          <tr style={{ background: BRANDING.primaryColor, color: '#fff' }}>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50px', textTransform: 'uppercase' }}>No</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '150px', textTransform: 'uppercase' }}>Kode Unit</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', textTransform: 'uppercase' }}>Judul Unit</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '180px', textTransform: 'uppercase' }}>Jenis Standar (SKKNI / Standar Internasional / Standar Khusus)</th>
          </tr>
        </thead>
        <tbody>
          {units.length > 0 ? (
            units.map((unit, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{unit.kode}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{unit.nama}</td>
                {index === 0 && (
                  <td rowSpan={units.length} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {data?.data?.skkni || '-'}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ border: '1px solid #000', padding: '12px', textAlign: 'center', color: '#999' }}>Belum ada data unit kompetensi</td>
            </tr>
          )}
        </tbody>
      </table>

      <SaveBar isSaving={isSaving} onSave={handleSave} note="Hanya bagian B. Data Pekerjaan yang dapat direvisi." />
    </div>
  )
}
