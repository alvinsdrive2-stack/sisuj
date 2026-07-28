import { DirekturDokumenStatus } from "@/hooks/useKegiatan"
import { DokumenStatusItem } from "@/components/direktur"

export function buildDokumenStatus(ds: DirekturDokumenStatus | undefined): DokumenStatusItem[] {
  if (!ds) return []
  const items: DokumenStatusItem[] = []
  const approval = ds.approval_status

  const pushDoc = (key: string, label: string, url: string | null, approved: boolean) => {
    if (!url) {
      items.push({ key, label, state: 'not-generated' })
    } else {
      items.push({ key, label, state: approved ? 'approved' : 'pending' })
    }
  }

  pushDoc('sk_pelaksanaan_uji', 'SK Pel. Uji', ds.sk_pelaksanaan_uji, approval.sk_pelaksanaan_uji)
  pushDoc('spt_asesor', 'SPT Asesor', ds.spt_asesor, approval.spt_asesor)
  pushDoc('spt_komtek', 'SPT Komtek', ds.spt_komtek, approval.spt_komtek)

  const ba = approval.ba_komtek
  const baAllApproved = ba && ba.komtek1 && ba.komtek2 && ba.komtek3
  if (!ds.ba_komtek) {
    items.push({ key: 'ba_komtek', label: 'BA Komtek', state: 'not-generated' })
  } else {
    items.push({ key: 'ba_komtek', label: 'BA Komtek', state: baAllApproved ? 'approved' : 'pending' })
  }

  const penetapanStatus = approval.sk_penetapan?.asesi_status ?? {}
  const asesiValues = Object.values(penetapanStatus)
  const total = asesiValues.length
  const approvedCount = asesiValues.filter(Boolean).length
  const label = `SK Penetapan ${approvedCount}/${total}`
  items.push({
    key: 'sk_penetapan',
    label,
    state: approvedCount === total && total > 0 ? 'approved' : 'pending',
  })

  return items
}
