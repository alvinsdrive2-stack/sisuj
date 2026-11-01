import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '@/config/api'
import { toast } from '@/components/ui/toast'
import { extractApiError, extractErrorMessage } from '@/lib/error-utils'
import AsesiLayout from '@/components/AsesiLayout'

export default function SuratPerjanjianPage() {
  const { idIzin = '' } = useParams<{ idIzin: string }>()
  const navigate = useNavigate()
  const [pdfUrl, setPdfUrl] = useState('')
  const [signedByDirektur, setSignedByDirektur] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let objectUrl = ''
    const load = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/surat-perjanjian`, { headers: { Accept: 'application/pdf', Authorization: `Bearer ${token}` } })
        if (!response.ok) throw new Error(await extractApiError(response, 'Gagal memuat surat perjanjian'))
        setSignedByDirektur(response.headers.get('X-Direktur-Signed') === '1')
        objectUrl = URL.createObjectURL(await response.blob())
        setPdfUrl(objectUrl)
      } catch (error) { toast(extractErrorMessage(error, 'Gagal memuat surat perjanjian'), 'error') }
      finally { setLoading(false) }
    }
    if (idIzin) load()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [idIzin])

  const approve = async () => {
    if (!accepted || !signedByDirektur) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/surat-perjanjian/setuju`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ setuju: true }) })
      if (!response.ok) throw new Error(await extractApiError(response, 'Gagal menyetujui surat'))
      navigate(`/praasesmen/${idIzin}/apl01`, { replace: true })
    } catch (error) { toast(extractErrorMessage(error, 'Gagal menyetujui surat'), 'error') }
    finally { setSubmitting(false) }
  }

  return <AsesiLayout currentStep={1} idIzin={idIzin}>
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="text-xl font-bold">Persetujuan Surat Perjanjian Sertifikasi</h1>
      {!signedByDirektur && !loading && <p role="alert" className="rounded bg-amber-50 p-3 text-amber-900">Menunggu tanda tangan direktur. Anda dapat meninjau draft, tetapi belum dapat menyetujui.</p>}
      {loading ? <p>Memuat draft surat…</p> : pdfUrl ? <iframe title="Preview Surat Perjanjian Sertifikasi" src={pdfUrl} className="h-[70vh] w-full rounded border" /> : <p role="alert">Preview surat tidak tersedia.</p>}
      <label className="flex items-start gap-2"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} disabled={!signedByDirektur || loading} /><span>Saya telah membaca dan menyetujui Surat Perjanjian Sertifikasi.</span></label>
      <button type="button" onClick={approve} disabled={!accepted || !signedByDirektur || loading || submitting} className="rounded bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Memproses…' : 'Setujui dan lanjut ke APL 01'}</button>
    </main>
  </AsesiLayout>
}
