import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { getAsesmenSteps } from "@/lib/asesmen-steps"


interface UnitKompetensi {
  id: number
  kode: string
  nama: string
}

interface EvidenceCheck {
  observasi: boolean
  portofolio: boolean
  pihak_ketiga: boolean
  lisan: boolean
  tertulis: boolean
  proyek: boolean
}

export default function Ak02Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)
  const { jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi } = useDataDokumenAsesmen(id)

  // Get dynamic steps
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  // Form state
  const [evidenceChecks, setEvidenceChecks] = useState<Record<number, EvidenceCheck>>({})
  const [rekomendasi, setRekomendasi] = useState<'kompeten' | 'belum_kompeten' | null>(null)
  const [tindakLanjut, setTindakLanjut] = useState('')
  const [komentar, setKomentar] = useState('')
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  // Mock unit kompetensi data - will be replaced with API data
  const unitKompetensi: UnitKompetensi[] = [
    {
      id: 1,
      kode: 'F.421120.001.01',
      nama: 'Menerapkan Peraturan Perundang-Undangan dan Sistem Manajemen Keselamatan dan Kesehatan Kerja dan Lingkungan (SMK3-L) pada Kegiatan Pemasangan Jembatan Rangka Baja'
    },
    {
      id: 2,
      kode: 'F.421120.007.01',
      nama: 'Membuat Laporan Hasil Pelaksanaan Pemasangan Jembatan Rangka Baja'
    }
  ]

  const handleEvidenceChange = (unitId: number, field: keyof EvidenceCheck) => {
    setEvidenceChecks(prev => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: !prev[unitId]?.[field]
      }
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(isAsesor ? "/asesor/dashboard" : "/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>AK.02</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ak02'))?.number || 5} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f4fbf', marginBottom: '4px', letterSpacing: '1px' }}>
            FR.AK.02 &nbsp;&nbsp; FRASEMEN ANTARA ASESOR
          </h1>
        </div>

        {/* IDENTITAS Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</td>
              <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{tuk || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList.map((asesor, idx) => (
                  <span key={asesor.id}>
                    {idx > 0 && ', '}
                    {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                  </span>
                ))}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || '-'}</td>
            </tr>
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Tanggal Asesmen</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Mulai :</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Selesai :</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '13px', marginBottom: '15px' }}>
          Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi asesi untuk setiap Unit Kompetensi.
        </p>

        {/* MATRIKS KOMPETENSI Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Unit kompetensi</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Observasi demonstrasi</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Portofolio</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Pernyataan pihak ketiga / wawancara</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan lisan</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Pertanyaan tertulis</th>
              <th style={{ border: '1px solid #000', padding: '6px' }}>Proyek kerja</th>
            </tr>

            {unitKompetensi.map((unit) => (
              <tr key={unit.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {unit.kode}<br />
                  {unit.nama}
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <input
                    type="checkbox"
                    checked={evidenceChecks[unit.id]?.observasi || false}
                    onChange={() => handleEvidenceChange(unit.id, 'observasi')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <input
                    type="checkbox"
                    checked={evidenceChecks[unit.id]?.portofolio || false}
                    onChange={() => handleEvidenceChange(unit.id, 'portofolio')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <input
                    type="checkbox"
                    checked={evidenceChecks[unit.id]?.pihak_ketiga || false}
                    onChange={() => handleEvidenceChange(unit.id, 'pihak_ketiga')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <input
                    type="checkbox"
                    checked={evidenceChecks[unit.id]?.lisan || false}
                    onChange={() => handleEvidenceChange(unit.id, 'lisan')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <input
                    type="checkbox"
                    checked={evidenceChecks[unit.id]?.tertulis || false}
                    onChange={() => handleEvidenceChange(unit.id, 'tertulis')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '20px' }}>
                  <input
                    type="checkbox"
                    checked={evidenceChecks[unit.id]?.proyek || false}
                    onChange={() => handleEvidenceChange(unit.id, 'proyek')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              </tr>
            ))}

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}><b>Rekomendasi hasil asesmen</b></td>
              <td colSpan={6} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '20px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rekomendasi === 'kompeten'}
                    onChange={() => setRekomendasi(rekomendasi === 'kompeten' ? null : 'kompeten')}
                    style={{ cursor: 'pointer' }}
                  />
                  Kompeten
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rekomendasi === 'belum_kompeten'}
                    onChange={() => setRekomendasi(rekomendasi === 'belum_kompeten' ? null : 'belum_kompeten')}
                    style={{ cursor: 'pointer' }}
                  />
                  Belum kompeten
                </label>
              </td>
            </tr>

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <b>Tindak lanjut yang dibutuhkan</b><br />
                <span style={{ fontSize: '13px' }}>(Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)</span>
              </td>
              <td colSpan={6} style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  style={{ width: '100%', height: '70px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none' }}
                  placeholder="Tuliskan tindak lanjut..."
                />
              </td>
            </tr>

            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}><b>Komentar / Observasi oleh asesor</b></td>
              <td colSpan={6} style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  style={{ width: '100%', height: '60px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none' }}
                  placeholder="Tuliskan komentar..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}><b>Asesi :</b></td>
            </tr>
            <tr>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>

            {/* Asesor rows - dynamic */}
            {asesorList.map((asesor) => (
              <React.Fragment key={asesor.id}>
                <tr>
                  <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}><b>Asesor :</b></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>{asesor.nama?.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>No. Reg</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{asesor.noreg || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan dan tanggal</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                  <td style={{ height: '60px', border: '1px solid #000', padding: '6px' }}></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* LAMPIRAN DOKUMEN */}
        <div style={{ fontSize: '13px', marginBottom: '15px' }}>
          <b>LAMPIRAN DOKUMEN:</b><br />
          1. Dokumen APL 01 peserta<br />
          2. Dokumen APL 02 peserta<br />
          3. Bukti-bukti berkualitas peserta<br />
          4. Tinjauan proses asesmen
        </div>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreedChecklist}
                onChange={(e) => setAgreedChecklist(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa hasil frageman antara asesor ini telah saya isi dengan jujur dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => navigate(`/asesi/asesmen/${id}/ia05`)}
              style={{
                padding: '8px 16px',
                border: '1px solid #999',
                background: '#fff',
                color: '#000',
                fontSize: '13px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Kembali
            </button>
            <button
              onClick={() => {
                if (!agreedChecklist) {
                  alert('Silakan centang pernyataan terlebih dahulu')
                  return
                }
                // Find current step (AK.02) and navigate to next step
                const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak02'))
                const nextStep = asesmenSteps[currentStepIndex + 1]
                if (nextStep) {
                  const nextPath = nextStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
                  navigate(nextPath)
                } else {
                  navigate(`/asesi/asesmen/${id}/selesai`)
                }
              }}
              style={{
                padding: '8px 16px',
                background: '#0066cc',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Lanjut
            </button>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
