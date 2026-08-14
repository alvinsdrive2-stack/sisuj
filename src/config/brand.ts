export const brand = import.meta.env.VITE_LSP_BRAND || 'gatensi'

const logos = import.meta.glob('@/assets/logo-*.png', { eager: true })
const favs = import.meta.glob('@/assets/favicon-*.png', { eager: true })

const logoKey = `/src/assets/logo-${brand}.png`
const favKey = `/src/assets/favicon-${brand}.png`

export const logo: string = (logos[logoKey] as { default: string } | undefined)?.default ?? ''
export const favicon: string = (favs[favKey] as { default: string } | undefined)?.default ?? ''
