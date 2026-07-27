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

  // Warna primer untuk table header, bg aksen
  primaryColor: import.meta.env.VITE_LSP_PRIMARY_COLOR || '#c40000',
}
