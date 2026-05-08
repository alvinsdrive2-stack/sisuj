export type SigningOrder = 'asesi_only' | 'asesor_only' | 'asesi_first' | 'asesor_first'

export interface PageSigningConfig {
  order: SigningOrder
  qrEndpoint: string
}

export const PAGE_SIGNING_CONFIG: Record<string, PageSigningConfig> = {
  // Pra-asesmen
  apl01: { order: 'asesi_only', qrEndpoint: 'apl01' },
  apl02: { order: 'asesi_first', qrEndpoint: 'apl02' },
  mapa01: { order: 'asesor_first', qrEndpoint: 'mapa01' },
  mapa02: { order: 'asesor_first', qrEndpoint: 'mapa02' },
  ak07:   { order: 'asesor_first', qrEndpoint: 'ak07' },
  ak04:   { order: 'asesi_only', qrEndpoint: 'ak04' },
  ak01:   { order: 'asesor_first', qrEndpoint: 'ak01' },

  // Asesmen
  ia01:  { order: 'asesor_first', qrEndpoint: 'ia01' },
  ia02:  { order: 'asesor_first', qrEndpoint: 'ia02' },
  ia03:  { order: 'asesor_first', qrEndpoint: 'ia03' },
  ia04a: { order: 'asesor_first', qrEndpoint: 'ia04a' },
  ia04b: { order: 'asesor_first', qrEndpoint: 'ia04b' },
  ia05:  { order: 'asesi_first', qrEndpoint: 'ia05' },
  ia08:  { order: 'asesor_first', qrEndpoint: 'ia08' },
  ia09:  { order: 'asesor_first', qrEndpoint: 'ia09' },
  ia10:  { order: 'asesor_first', qrEndpoint: 'ia10' },
  ak02:  { order: 'asesor_first', qrEndpoint: 'ak02' },
  ak03:  { order: 'asesi_first', qrEndpoint: 'ak03' },
  ak05:  { order: 'asesor_only', qrEndpoint: 'ak05' },
  ak06:  { order: 'asesor_only', qrEndpoint: 'ak06' },
}

export function getSigningConfig(pageKey: string): PageSigningConfig {
  return PAGE_SIGNING_CONFIG[pageKey] ?? { order: 'asesor_first', qrEndpoint: pageKey }
}
