# Rekaman UI/UX — Improvement Opportunities

> Audit visual & teknis berdasarkan eksplorasi codebase.
> Tanggal: 2026-07-09

---

## Ringkasan

App punya fondasi design solid (navy brand, card-based, Tailwind + shadcn). Tapi banyak **AI-slop residue** — inline styles campur aduk, aksesibilitas minim, duplikasi layout, state handling inconsistent. Ini bikin maintenance makin mahal seiring scale.

---

## 1. INLINE STYLE POLUTION — Priority: High

**Temuan:** ~3992 inline `style={}` usage di 90 file.

**Masalah:**
- `AsesiLayout.tsx` — 12 inline styles
- `ModularAsesiLayout.tsx` — 12 inline styles (duplicate of AsesiLayout)
- `MukLayout.tsx` — 12 inline styles (triplicate)
- `AsesmenBreadcrumb.tsx` — full inline, no Tailwind
- `Apl02FilePanel.tsx` — 20 inline styles
- Banyak komponen lain campur Tailwind + inline

**Contoh pattern duplikat di 3 layout:**
```tsx
style={{ flex: 1, minWidth: 0, maxWidth: filePanelCollapsed ? '1200px' : '900px',
  backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'max-width 0.25s ease' }}
```

**Rekomendasi:**
- Ekstrak ke Tailwind utility classes atau CSS module
- Buat `AsesiContentArea.tsx` component sekali, pake di semua layout
- Migrasi inline styles ke Tailwind gradual — mulai dari komponen yang paling banyak duplikat
- Target: < 500 inline styles (90% reduction)

---

## 2. AKSESIBILITAS NYARIS NOL — Priority: High

**Temuan:** Hanya **2 `aria-label`** di seluruh folder `src/components/`.

**Masalah:**
- Button ikon (ThemeToggle, video toggle, logout, menu hamburger) — no aria-label (kecuali ThemeToggle)
- No keyboard navigation support
- No focus indicators on custom components (checkbox, radio, modal)
- `user-select: none` global — prevents text selection, bad for readability
- No semantic HTML landmarks (`<nav>`, `<main>`, `<aside>`)
- No skip-to-content link
- Color contrast belum diverifikasi

**Rekomendasi:**
- Audit color contrast ratio (WCAG AA minimum)
- Tambah `aria-label` di semua icon buttons
- Ganti `user-select: none` global jadi selective (pake di komponen yang emang butuh aja)
- Tambah keyboard event handlers di custom interactive components
- Implement skip-to-content link
- Test dengan screen reader di 3 flow utama (login → dashboard → asesmen)

---

## 3. EMPTY STATE & LOADING STATE INCONSISTENT — Priority: High

**Temuan:** 30+ file punya pattern "Tidak ada..." beda-beda.

**Current inline patterns (inconsistent):**
```tsx
// Pattern A
<div className="text-center py-8 text-slate-500">Tidak ada kegiatan</div>

// Pattern B
<div className="p-8 text-center text-gray-500">Belum ada data</div>

// Pattern C (inline style)
<div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Empty</div>
```

**Rekomendasi:**
- Buat `<EmptyState icon message action />` component terpusat
- Buat `<SkeletonPage />`, `<SkeletonForm />`, `<SkeletonTable />` — reusable
- Standardisasi loading untuk: page load, section load, action submit
- Tambah refetch/retry button di error states

---

## 4. DUPLIKASI LAYOUT ASESI — Priority: Medium

**Temuan:** 3 layout files punya struktur identik.

| File | Lines | Inline Styles |
|------|-------|---------------|
| AsesiLayout.tsx | ~50 | 12 |
| ModularAsesiLayout.tsx | ~55 | 12 |
| MukLayout.tsx | ~50 | 12 |

**Perbedaan minimal:** judul sidebar, step indicator component yang dipake.

**Rekomendasi:**
- Refactor jadi 1 base layout dengan props:
```tsx
<AsesiBaseLayout
  stepIndicator={<ModularStepIndicator ... />}
  filePanel={metode !== 'KAN' && <Apl02FilePanel ... />}
  sidebarTitle="Asesmen - MUK Observasi"
>
```

---

## 5. NOTIFIKASI SYSTEM — Priority: Medium

**Temuan:** Bell icon di mobile menu navbar — purely decorative.

```tsx
<Button variant="outline" size="sm" className="flex-1 relative">
  <Bell className="w-4 h-4 mr-2" />
  Notifikasi
  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
</Button>
```

No state, no click handler, no notification count.

**Rekomendasi:**
- Integrasi dengan Ably channel untuk realtime notifikasi
- Badge count (red circle with number)
- Notification dropdown panel (recent 5-10 items)
- Click → navigate ke halaman relevan
- Alternative: polling endpoint kalo Ably ga feasible untuk notif

---

## 6. PERFORMANCE — RENDER OPTIMIZATION — Priority: Medium

**Temuan:** Hanya 36 `useCallback/useMemo` import di seluruh 36 page files.

**Masalah:**
- Banyak component function recreate tiap render
- Inline styles cause unnecessary re-renders (new object every render)
- No virtualization for long lists (asesi lists, kegiatan lists)
- Heavy pages (Apl02Page, Ia0XPages) render full form setiap state change

**Spot check — Apl02Page.tsx:** ~2271 lines, inline handlers, no memo.

**Rekomendasi:**
- Wrap heavy components in `React.memo`
- Gunakan `useCallback` untuk event handlers di list items
- Virtualisasi long lists (react-window atau virtualizer)
- Lazy load form sections (tab-based rendering, unmount inactive)
- Profile dengan React DevTools — cari komponen yang render terlalu sering

---

## 7. FORM CONSISTENCY — Priority: Medium

**Temuan:** Dua sistem checkbox/radio berjalan paralel.

**Custom (CSS-only):**
- `Checkbox.tsx` — custom checkbox dengan keyframe animasi
- `Radio.tsx` — custom radio dengan pulse animation

**shadcn/ui (available tapi jarang dipake di form pages):**
- Tersedia di library tapi ga konsisten pakenya

**Masalah:**
- Inconsistent visual antara satu form dengan form lain
- Custom components punya accessibility issues (no keyboard, no focus)
- Extra maintenance burden

**Rekomendasi:**
- Pilih satu sistem (prefer shadcn/ui karena udah accessible)
- Migrasi gradual dari custom ke shadcn
- Kalo retain custom, tambah keyboard support dan aria attributes

---

## 8. RESPONSIVE GAP — Priority: Medium

**Temuan:**
- Layout asesi pake inline `maxWidth: 900px` yang ga responsif
- AsesmenBreadcrumb pake inline styles tanpa hamburger di mobile
- Step indicator di asesi flow — mobile floating button bagus, tapi kontennya modal (perlu improvement)
- Sidebar di DashboardLayout mobile — hamburger button `top-20 left-4` overlap dengan navbar
- Grid kadang pake `gap-6` kadang `gap-4`

**Rekomendasi:**
- Uji 3 role flow di viewport 375px (mobile), 768px (tablet), 1440px (desktop)
- Standardisasi grid gap: `gap-6` untuk layout, `gap-4` untuk card inner
- Fix sidebar hamburger position overlap
- Asesi layout: ganti maxWidth fixed dengan responsive container

---

## 9. BREADCRUMB INKONSISTENSI — Priority: Low

**Temuan:** `AsesmenBreadcrumb.tsx` pake inline styles + html entities `/` sebagai separator.

```tsx
<div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
  <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Dashboard</span>
  <span>/</span>
  <span>Asesmen</span>
  <span>/</span>
  <span>{currentPage}</span>
</div>
```

**Rekomendasi:**
- Migrasi ke Tailwind classes
- Ganti `/` dengan icon `ChevronRight` dari Lucide (konsisten dengan nav)
- Reusable Breadcrumb component dengan props `items: {label, href?}[]`

---

## 10. ABLY — NO VISIBLE STATUS — Priority: Low

**Temuan:** Ably realtime connection ada (`useRealtimeSync.ts`) tapi:
- No connection status indicator di UI
- No error handling display when connection drops
- No reconnection feedback

**Rekomendasi:**
- Tambah small status dot di navbar: green (connected), yellow (connecting), red (disconnected)
- Optional: toast notification when connection lost/recovered
- Subscribe ke `connectionState` dari Ably SDK

---

## 11. DARK MODE GAPS — Priority: Low

**Temuan:**
- Inline styles pake `backgroundColor: '#fff'` — break di dark mode
- Beberapa komponen pake `text-slate-800` langsung (works) vs ada yang pake `text-gray-800` (belum tentu)
- BackgroundPattern pake `from-slate-50 via-blue-50 to-slate-100` — di dark mode jadinya aneh

**Rekomendasi:**
- Audit semua inline style yang pake hardcoded colors
- Test semua halaman di dark mode
- Pastikan `dark:` variants applied di semua surfaces

---

## 12. MICRO-INTERACTIONS — Priority: Low

**Yang udah baik:**
- Page transitions dengan fade-in (DashboardLayout)
- Staggered animation delays
- Skeleton shimmer
- Hover effects on cards

**Yang bisa ditambah:**
- Success animation setelah submit form (ceklis animasi)
- Smooth scroll to error field saat validasi gagal
- Button loading state dengan spinner (ActionButton udah ada, tapi belum dipake merata)
- Number increment animation di stat cards
- Pull-to-refresh di mobile untuk list pages

---

## 13. ERROR HANDLING VISUAL — Priority: Medium

**Temuan:**
- ErrorBoundary component ada tapi fallback generic
- Banyak page punya `console.error` tanpa user-facing feedback
- Form validation errors inconsistent (ada yg pake state, ada yg langsung toast)
- Network error handling minimal — kebanyakan `.catch(() => {})` atau `console.error`

**Rekomendasi:**
- Buat `<ErrorState onRetry />` component untuk API failures
- Standardisasi form error display (inline error per field + summary)
- Network error → toast + retry button
- Pastikan error messages user-friendly (bukan "Error: 500" tapi "Gagal memuat data. Coba lagi.")

---

## Quick Wins (Bisa dikerjain 1-2 hari)

1. **EmptyState component** — 30+ tempat langsung kebantu
2. **Breadcrumb refactor** — konsisten, accessible, reusable
3. **Aria-label di icon buttons** — low effort, high impact
4. **Button loading states** — ActionButton udah ada, tinggal dipake
5. **Sidebar hamburger position** — fix overlap di mobile

## Big Wins (Perlu perencanaan)

1. **Inline style → Tailwind migration** — effort besar tapi long-term gain terbesar
2. **Layout duplikasi refactor** — 3 layout jadi 1, hapus ~200 lines
3. **Notifikasi system** — fitur baru yang impactful
4. **Performance pass** — memo + virtualisasi + lazy loading
5. **Aksesibilitas audit** — WCAG compliance

---

## Prioritas Rekomendasi

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 🔴 High | Inline style cleanup | Large | Very High |
| 🔴 High | Aksesibilitas | Medium | Very High |
| 🔴 High | Empty/Loading states | Medium | High |
| 🟡 Medium | Layout duplikasi | Small | Medium |
| 🟡 Medium | Notifikasi system | Medium | High |
| 🟡 Medium | Performance | Large | Medium |
| 🟡 Medium | Form consistency | Medium | Medium |
| 🟡 Medium | Error handling | Medium | High |
| 🟢 Low | Ably status | Small | Low |
| 🟢 Low | Dark mode audit | Medium | Medium |
| 🟢 Low | Micro-interactions | Medium | Low |

---

## File Paling Butuh Refactor

| File | Lines | Inline Styles | Issues |
|------|-------|---------------|--------|
| `Apl02Page.tsx` | ~2271 | 179 | Terbesar, heavy form, no memo |
| `Apl01Page.tsx` | ~1500+ | 193 | Sama pattern, form raksasa |
| `AsesiLayout.tsx` | ~50 | 12 | Duplicate layout |
| `ModularAsesiLayout.tsx` | ~55 | 12 | Duplicate layout |
| `MukLayout.tsx` | ~50 | 12 | Duplicate layout |
| `AsesmenBreadcrumb.tsx` | ~29 | 4 | Full inline, no Tailwind |
| `Apl02FilePanel.tsx` | ~200+ | 20 | Mixed inline + Tailwind |
| `Ia01Page.tsx` ~ `Ia10Page.tsx` | ~500-800 each | 50-100 each | Form pages, repeated patterns |
