function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else {
    r = parseInt(clean.substring(0, 2), 16)
    g = parseInt(clean.substring(2, 4), 16)
    b = parseInt(clean.substring(4, 6), 16)
  }
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export const BRANDING = {
  name: import.meta.env.VITE_LSP_NAME || 'LSP Gatensi Karya Konstruksi',
  short: import.meta.env.VITE_LSP_SHORT || 'LSP Gatensi',
  full: import.meta.env.VITE_LSP_FULL || 'Lembaga Sertifikasi Profesi Gatensi Karya Konstruksi',
  copyright: import.meta.env.VITE_LSP_COPYRIGHT || 'LSP Gatensi',
  logoAlt: import.meta.env.VITE_LSP_LOGO_ALT || 'LSP Gatensi Logo',
  venue: import.meta.env.VITE_LSP_VENUE || 'TUK LSP Gatensi - Gedung A Lt. 3',
  year: import.meta.env.VITE_LSP_YEAR || '2025',

  // Nama yang dipake di form asesmen (Mapa01) — harus cocok sama data dari backend
  asesmenKonsteks: import.meta.env.VITE_LSP_ASESMEN_KONTEKS || 'LSP Gatensi Karya Konstruksi',
  asesmenManajer: import.meta.env.VITE_LSP_ASESMEN_MANAJER || 'Manajer sertifikasi LSP Gatensi Karya Konstruksi',

  // Warna primer — hex buat JS inline style, hsl buat CSS variable
  primaryColor: import.meta.env.VITE_LSP_PRIMARY_COLOR || '#c40000',
  get primaryHsl() { return hexToHsl(this.primaryColor) },
}
