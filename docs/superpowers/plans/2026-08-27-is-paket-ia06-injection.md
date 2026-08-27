# is_paket IA.06 Injection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When `datadokumenasesmen.is_paket` is true, insert an IA.06 step (existing `Ia06Page`) between IA.05 and AK.02 across sidebar flow, next-page navigation, redirect checker, and komtek document views.

**Architecture:** Expose `isPaket` from `useDataDokumenAsesmen`, add an `injectIa06()` helper in `src/lib/asesmen-steps.ts` applied by `getAsesmenSteps()`/`getMukSteps()` behind a new optional `isPaket` param, then mechanically update ~22 call sites. Mirror injection in `useTahapStepCheck` step list.

**Tech Stack:** React 19 + TypeScript + Vite. No test runner — verification via `npx tsc --noEmit` and manual browser checks.

**Spec:** `docs/superpowers/specs/2026-08-27-is-paket-ia06-injection-design.md`

**Known deviations from spec (accepted, cosmetic):**

1. `FrAk01Page` is NOT updated. It sources jenjang/metode from `useDataDokumenPraAsesmen` (different API endpoint, no confirmed `is_paket` field), and AK.01 precedes IA.05 in every flow.
2. `MukLayout`, `MukPage`, and the MUK pages (`Mapa01Page`, `Mapa02Page`, `FrAk04Page`, `FrAk07Page`, `K3AsesmenPage`) are NOT updated — same reason: they read from `useDataDokumenPraAsesmen`. Consequently `getMukSteps()` gains no new param (YAGNI — tahap-0 IA.06 injection happens through `getAsesmenSteps`'s inline tahap-0 branch, which the IA pages use). Consequence of both deviations: when `is_paket` is true, step-number badges after IA.05 shown on AK.01/MUK-layout sidebars are off by one. Labels and navigation are unaffected — actual IA pages at tahap 0 show the injected step correctly.

---

### Task 1: Expose `isPaket` from `useDataDokumenAsesmen`

**Files:**
- Modify: `src/hooks/useDataDokumenAsesmen.ts`

- [ ] **Step 1: Add `is_paket` to response interface**

In `DataDokumenAsesmenData` (line ~12), after `metode?: string`:

```ts
  is_paket?: boolean
```

- [ ] **Step 2: Add `isPaket` to result interface**

In `UseDataDokumenAsesmenResult` (line ~44), after `metode: string`:

```ts
  isPaket: boolean
```

- [ ] **Step 3: Add to internal state**

In the `useState` generic (line ~76) add `isPaket: boolean` to the type, and in the initial value object (line ~100) add:

```ts
    isPaket: false,
```

- [ ] **Step 4: Map the field in `setData`**

In the `setData({...})` call (line ~171), add after `metode`:

```ts
              isPaket: !!result.data.is_paket,
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useDataDokumenAsesmen.ts
git commit -m "feat: expose isPaket dari is_paket di useDataDokumenAsesmen"
```

---

### Task 2: `injectIa06` helper + flow functions in `asesmen-steps.ts`

**Files:**
- Modify: `src/lib/asesmen-steps.ts`

- [ ] **Step 1: Add helper above `getMukSteps` (before line 175)**

```ts
// Insert IA.06 after IA.05 when the skema uses a soal paket (is_paket).
export function injectIa06(steps: StepConfig[], isPaket?: boolean): StepConfig[] {
  if (!isPaket) return steps
  const idx = steps.findIndex(s => s.href.includes('ia05'))
  if (idx === -1) return steps
  const inserted = [...steps]
  inserted.splice(idx + 1, 0, { number: 0, label: 'IA.06', href: '/asesi/asesmen/ia06' })
  return inserted.map((s, i) => ({ ...s, number: i + 1 }))
}
```

- [ ] **Step 2: `getAsesmenSteps` gains `isPaket`**

Change signature (line ~214):

```ts
export function getAsesmenSteps(
  jenjangId: string,
  isAsesor: boolean,
  asesorRole: 'asesor_1' | 'asesor_2' | 'asesor_other' | 'none' | undefined,
  _asesorCount: number,
  metode?: string,
  tahap?: number,
  isPaket?: boolean
): StepConfig[] {
```

In the body after the KAN early-return: wrap the non-portofolio assignments. Replace lines ~242-248:

```ts
  } else if (!isAsesor) {
    steps = injectIa06([...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESI : ASESMEN_STEPS_ASESI)], isPaket)
  } else if (asesorRole === 'asesor_1') {
    steps = injectIa06([...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_1 : ASESMEN_STEPS_ASESOR_1)], isPaket)
  } else {
    steps = injectIa06([...(isLowJenjang ? ASESMEN_STEPS_LOW_JENJAH_ASESOR_2 : ASESMEN_STEPS_ASESOR_2)], isPaket)
  }
```

(Portofolio branch above stays untouched.)

- [ ] **Step 3: tahap-0 branch in `getAsesmenSteps`**

Replace lines ~255-257 (the tahap 0 returns) with:

```ts
    if (isPortofolio && !isLowJenjang) return [...MUK_STEPS_TAHAP_0_PORTOFOLIO]
    if (isLowJenjang) return injectIa06([...MUK_STEPS_TAHAP_0_LOW_JENJANG], isPaket)
    return injectIa06([...MUK_STEPS_TAHAP_0_OBSERVASI], isPaket)
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (new param is optional, existing call sites still compile)

- [ ] **Step 5: Commit**

```bash
git add src/lib/asesmen-steps.ts
git commit -m "feat: injectIa06 helper + param isPaket di getAsesmenSteps"
```

---

### Task 3: Wire `isPaket` — AK/finish/misc pages

Every page below has the same three-line pattern: add `isPaket` to the `useDataDokumenAsesmen` destructure, pass it as 7th arg to `getAsesmenSteps`, add it to the `useMemo` deps. Exact edits per file:

**Files (Modify):**
- `src/pages/asesi/asesmen/Ak02Page.tsx` (destructure line 76, steps line 82)
- `src/pages/asesi/asesmen/Ak03Page.tsx` (62, 66)
- `src/pages/asesi/asesmen/Ak05Page.tsx` (53, 68)
- `src/pages/asesi/asesmen/Ak06Page.tsx` (84, 91)
- `src/pages/asesi/asesmen/AsesmenSelesaiPage.tsx` (29, 36)
- `src/pages/asesi/asesmen/SurveiPage.tsx` (58, 62)
- `src/pages/asesi/asesmen/UploadTugasPage.tsx` (69, 88)

- [ ] **Step 1: Ak02Page.tsx**

Line 76 old:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId, jenisKelas } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 82 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 2: Ak03Page.tsx**

Line 62 old:
```ts
  const { jenjang, asesorList, jadwalId, metode, jenisKelas } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { jenjang, asesorList, jadwalId, metode, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 66 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 3: Ak05Page.tsx**

Line 53 old:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesor, jadwalId, jenisKelas } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesor, jadwalId, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 68 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, resolvedAsesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, resolvedAsesorRole, asesorList.length, metode, tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, resolvedAsesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, resolvedAsesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 4: Ak06Page.tsx**

Line 84 old:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, idAsesor2: _idAsesor2, jadwalId, jenisKelas, namaAsesi } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, idAsesor2: _idAsesor2, jadwalId, jenisKelas, namaAsesi, isPaket } = useDataDokumenAsesmen(id)
```
Line 91 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 5: AsesmenSelesaiPage.tsx**

Line 29 old:
```ts
  const { jenjang, asesorList, jadwalId, metode } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { jenjang, asesorList, jadwalId, metode, isPaket } = useDataDokumenAsesmen(id)
```
Line 36 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, _kegiatan?.tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, _kegiatan?.tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, _kegiatan?.tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, _kegiatan?.tahap, isPaket])
```

- [ ] **Step 6: SurveiPage.tsx**

Line 58 old:
```ts
  const { jenjang, asesorList, namaAsesi, jabatanKerja, tuk, tanggalUji, metode } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { jenjang, asesorList, namaAsesi, jabatanKerja, tuk, tanggalUji, metode, isPaket } = useDataDokumenAsesmen(id)
```
Line 62 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 7: UploadTugasPage.tsx**

Line 69 old:
```ts
  const { asesorList, jenjang, jadwalId, metode, jenisKelas } = useDataDokumenAsesmen(id)
```
new:
```ts
  const { asesorList, jenjang, jadwalId, metode, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 88 old:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])
```
new:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 8: Typecheck + commit**

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/pages/asesi/asesmen/Ak02Page.tsx src/pages/asesi/asesmen/Ak03Page.tsx src/pages/asesi/asesmen/Ak05Page.tsx src/pages/asesi/asesmen/Ak06Page.tsx src/pages/asesi/asesmen/AsesmenSelesaiPage.tsx src/pages/asesi/asesmen/SurveiPage.tsx src/pages/asesi/asesmen/UploadTugasPage.tsx
git commit -m "feat: pass isPaket ke getAsesmenSteps di halaman AK/selesai/survei/tugas"
```

---

### Task 4: Wire `isPaket` — IA pages

Same pattern as Task 3.

**Files (Modify):**
- `src/pages/asesi/asesmen/Ia01Page.tsx` (93, 99)
- `src/pages/asesi/asesmen/Ia02Page.tsx` (144, 150)
- `src/pages/asesi/asesmen/Ia03Page.tsx` (88, 95)
- `src/pages/asesi/asesmen/Ia04aPage.tsx` (90, 116)
- `src/pages/asesi/asesmen/Ia04bPage.tsx` (71, 181)
- `src/pages/asesi/asesmen/Ia04bKANPage.tsx` (30, 33)
- `src/pages/asesi/asesmen/Ia05Page.tsx` (83, 94)
- `src/pages/asesi/asesmen/Ia05KANPage.tsx` (41, 47)

- [ ] **Step 1: Ia01Page.tsx**

Line 93 — append `isPaket` to destructure:
```ts
  const { jenjang, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId, metode, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 99:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 2: Ia02Page.tsx**

Line 144:
```ts
  const { jenjang, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId, metode, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 150:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 3: Ia03Page.tsx**

Line 88 — append `isPaket`:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, namaPenyusun, namaValidator, tanggalPenyusun, tanggalValidator, barcodePenyusun, barcodeValidator, noregPenyusun, noregValidator, jadwalId, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 95:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 4: Ia04aPage.tsx**

Line 90 — append `isPaket`:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, namaAsesor: _namaAsesor, tuk, asesorList, namaAsesi, namaPenyusun, namaValidator, barcodePenyusun, barcodeValidator, noregPenyusun, noregValidator, tanggalPenyusun, tanggalValidator, jadwalId, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 116:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 5: Ia04bPage.tsx**

Line 71 — append `isPaket`:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, namaAsesor: _namaAsesor, tuk, asesorList, namaAsesi, jadwalId, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 181:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 6: Ia04bKANPage.tsx**

Line 30 — append `isPaket`:
```ts
  const { jenjang, metode, asesorList, jabatanKerja, nomorSkema, tuk, namaAsesi, jadwalId, isPaket } = useDataDokumenAsesmen(id)
```
Line 33:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 7: Ia05Page.tsx**

Line 83 — append `isPaket`:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, idAsesor1: _idAsesor1, namaPenyusun, namaValidator, tanggalPenyusun, tanggalValidator, barcodePenyusun, barcodeValidator, noregPenyusun, noregValidator, jenisKelas, isLoading: isDataLoading, jadwalId, isPaket } = useDataDokumenAsesmen(id)
```
Line 94:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 8: Ia05KANPage.tsx**

Line 41 — append `isPaket`:
```ts
  const { jenjang, metode, asesorList, jabatanKerja, nomorSkema, tuk, namaAsesi, jadwalId, isPaket } = useDataDokumenAsesmen(id)
```
Line 47:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 9: Typecheck + commit**

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/pages/asesi/asesmen/Ia01Page.tsx src/pages/asesi/asesmen/Ia02Page.tsx src/pages/asesi/asesmen/Ia03Page.tsx src/pages/asesi/asesmen/Ia04aPage.tsx src/pages/asesi/asesmen/Ia04bPage.tsx src/pages/asesi/asesmen/Ia04bKANPage.tsx src/pages/asesi/asesmen/Ia05Page.tsx src/pages/asesi/asesmen/Ia05KANPage.tsx
git commit -m "feat: pass isPaket ke getAsesmenSteps di halaman IA"
```

---

### Task 5: Wire `isPaket` — Ia06/IA08-10/Ujian

**Files (Modify):**
- `src/pages/asesi/asesmen/Ia06Page.tsx` (185, 191)
- `src/pages/asesi/asesmen/Ia08Page.tsx` (64, 69)
- `src/pages/asesi/asesmen/Ia09Page.tsx` (70-78 destructure block, 82)
- `src/pages/asesi/asesmen/Ia10Page.tsx` (76-86 destructure block, 90)
- `src/pages/asesi/asesmen/UjianPage.tsx` (122, 129)

- [ ] **Step 1: Ia06Page.tsx**

Line 185 — append `isPaket`:
```ts
  const { jenjang, metode, asesorList, jabatanKerja, nomorSkema, tuk, namaAsesi, jadwalId, isPaket } = useDataDokumenAsesmen(id)
```
Line 191:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 2: Ia08Page.tsx**

Line 64 — append `isPaket`:
```ts
  const { jenjang, metode, jabatanKerja, nomorSkema, tuk, asesorList, namaAsesi, tanggalUji, jadwalId, jenisKelas, isPaket } = useDataDokumenAsesmen(id)
```
Line 69:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, undefined, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 3: Ia09Page.tsx**

Destructure block ends line 78. Change the closing to include `isPaket` (add after `jenisKelas,`):
```ts
    jenisKelas,
    isPaket,
  } = useDataDokumenAsesmen(id)
```
Line 82:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, undefined, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 4: Ia10Page.tsx**

Destructure block ends line 86. Change the closing to include `isPaket`:
```ts
    jenisKelas,
    isPaket,
  } = useDataDokumenAsesmen(id)
```
Line 90:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, undefined, asesorList.length, metode, tahap, isPaket), [jenjang, isAsesor, asesorList.length, metode, tahap, isPaket])
```

- [ ] **Step 5: UjianPage.tsx**

Line 122 — append `isPaket`:
```ts
  const { jabatanKerja, asesorList, jenjang, metode, jadwalId, isPaket } = useDataDokumenAsesmen(id)
```
Line 129:
```ts
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, undefined, asesorList.length, metode, _kegiatan?.tahap, isPaket), [jenjang, isAsesor, asesorList.length, metode, _kegiatan?.tahap, isPaket])
```

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/pages/asesi/asesmen/Ia06Page.tsx src/pages/asesi/asesmen/Ia08Page.tsx src/pages/asesi/asesmen/Ia09Page.tsx src/pages/asesi/asesmen/Ia10Page.tsx src/pages/asesi/asesmen/UjianPage.tsx
git commit -m "feat: pass isPaket ke getAsesmenSteps di ia06/ia08-10/ujian"
```

---

### Task 6: Hooks — `useAsesmenStepQrStatus` + `useTahapStepCheck`

**Files (Modify):**
- `src/hooks/useAsesmenStepQrStatus.ts`
- `src/hooks/useTahapStepCheck.ts`

- [ ] **Step 1: useAsesmenStepQrStatus.ts**

Line 13 old:
```ts
  const { jenjang, metode } = useDataDokumenAsesmen(idIzin)
```
new:
```ts
  const { jenjang, metode, isPaket } = useDataDokumenAsesmen(idIzin)
```
Line 29 old:
```ts
    const steps = getAsesmenSteps(jenjang, false, 'asesor_1', 0, metode, _kegiatan?.tahap)
```
new:
```ts
    const steps = getAsesmenSteps(jenjang, false, 'asesor_1', 0, metode, _kegiatan?.tahap, isPaket)
```
Line 82 deps old:
```ts
  }, [idIzin, isAsesi, enabled, jenjang, metode, navigate, _kegiatan?.tahap])
```
new:
```ts
  }, [idIzin, isAsesi, enabled, jenjang, metode, isPaket, navigate, _kegiatan?.tahap])
```

- [ ] **Step 2: useTahapStepCheck.ts — `getTahapSteps` signature**

Line 46 old:
```ts
function getTahapSteps(tahap: number, jenjang?: string, metode?: string): StepDef[] {
```
new:
```ts
function getTahapSteps(tahap: number, jenjang?: string, metode?: string, isPaket?: boolean): StepDef[] {
```

- [ ] **Step 3: insert ia06 in default list**

In the default (full jenjang) return (lines ~89-97), insert after the `ia05` entry:
```ts
    { stepKey: 'ia06', label: 'IA.06', href: '/asesmen/:id/ia06' },
```
Full block:
```ts
  // Default: full jenjang
  const steps = [
    { stepKey: 'ak01', label: 'AK.01', href: '/asesmen/:id/ak01' },
    { stepKey: 'ia04a', label: 'IA.04.A', href: '/asesmen/:id/ia04a' },
    { stepKey: 'upload-tugas', label: 'Upload Tugas', href: '/asesmen/:id/upload-tugas' },
    { stepKey: 'ia04b', label: 'IA.04.B', href: '/asesmen/:id/ia04b' },
    { stepKey: 'ia05', label: 'IA.05', href: '/asesmen/:id/ia05' },
    { stepKey: 'ia06', label: 'IA.06', href: '/asesmen/:id/ia06' },
    { stepKey: 'ak02', label: 'AK.02', href: '/asesmen/:id/ak02' },
    { stepKey: 'ak03', label: 'AK.03', href: '/asesmen/:id/ak03' },
  ]
  return isPaket ? steps : steps.filter(s => s.stepKey !== 'ia06')
```

- [ ] **Step 4: insert ia06 in low-jenjang list**

In the `isLowJenjang` return (lines ~76-86), same insertion after `ia05`:
```ts
    { stepKey: 'ia06', label: 'IA.06', href: '/asesmen/:id/ia06' },
```
and same conditional:
```ts
  const steps = [
    { stepKey: 'ak01', label: 'AK.01', href: '/asesmen/:id/ak01' },
    { stepKey: 'ia01', label: 'IA.01', href: '/asesmen/:id/ia01' },
    { stepKey: 'ia02', label: 'IA.02', href: '/asesmen/:id/ia02' },
    { stepKey: 'ia03', label: 'IA.03', href: '/asesmen/:id/ia03' },
    { stepKey: 'upload-tugas', label: 'Upload Tugas', href: '/asesmen/:id/upload-tugas' },
    { stepKey: 'ia05', label: 'IA.05', href: '/asesmen/:id/ia05' },
    { stepKey: 'ia06', label: 'IA.06', href: '/asesmen/:id/ia06' },
    { stepKey: 'ak02', label: 'AK.02', href: '/asesmen/:id/ak02' },
    { stepKey: 'ak03', label: 'AK.03', href: '/asesmen/:id/ak03' },
  ]
  return isPaket ? steps : steps.filter(s => s.stepKey !== 'ia06')
```

(Portofolio branch untouched.)

- [ ] **Step 5: wire option through hook**

`UseTahapStepCheckOptions` — add after `metode?: string`:
```ts
  /** inject IA.06 after IA.05 when skema uses soal paket */
  isPaket?: boolean
```
In `useTahapStepCheck` destructure (line ~101) add `isPaket`.
Line 127 old:
```ts
    const steps = getTahapSteps(tahap, jenjang, metode)
```
new:
```ts
    const steps = getTahapSteps(tahap, jenjang, metode, isPaket)
```
Line 165 deps old:
```ts
  }, [tahap, idIzin, replaceId, jenjang, metode])
```
new:
```ts
  }, [tahap, idIzin, replaceId, jenjang, metode, isPaket])
```

- [ ] **Step 6: wire the single consumer — `src/pages/asesi/AsesmenPage.tsx`**

`useTahapStepCheck` has exactly one consumer. Line 13 old:
```ts
  const { jenjang, metode } = useDataDokumenAsesmen(idIzin)
```
new:
```ts
  const { jenjang, metode, isPaket } = useDataDokumenAsesmen(idIzin)
```
Lines 16-22 old:
```ts
  const { redirectStep: _redirectStep, isLoading: stepLoading } = useTahapStepCheck({
    tahap: 2,
    idIzin,
    replaceId: idIzin,
    jenjang,
    metode,
  })
```
new:
```ts
  const { redirectStep: _redirectStep, isLoading: stepLoading } = useTahapStepCheck({
    tahap: 2,
    idIzin,
    replaceId: idIzin,
    jenjang,
    metode,
    isPaket,
  })
```

- [ ] **Step 7: Typecheck + commit**

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/hooks/useAsesmenStepQrStatus.ts src/hooks/useTahapStepCheck.ts src/pages/asesi/AsesmenPage.tsx
git commit -m "feat: redirect checker ikut inject ia06 kalau isPaket"
```

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/hooks/useAsesmenStepQrStatus.ts src/hooks/useTahapStepCheck.ts
git commit -m "feat: redirect checker ikut inject ia06 kalau isPaket"
```

---

### Task 7: Fix hardcoded AK.02 jump in `Ia05Page`

**Files (Modify):**
- `src/pages/asesi/asesmen/Ia05Page.tsx:363`

- [ ] **Step 1: Replace hardcoded navigate**

Old (line 362-363):
```ts
        // Navigate to AK02
        setTimeout(() => navigate(`/asesi/asesmen/${id}/ak02`), 500)
```
New:
```ts
        // Navigate to next step (IA.06 when is_paket, else AK.02)
        const ia05Idx = asesmenSteps.findIndex(s => s.href.includes('ia05'))
        const next = asesmenSteps[ia05Idx + 1]
        setTimeout(() => navigate(next ? next.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`) : `/asesi/asesmen/${id}/ak02`), 500)
```
Then add `asesmenSteps` to the enclosing `useCallback`/`useEffect` dependency array (find the deps array containing `ia05Data` around line 295 and append `asesmenSteps` if absent).

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/pages/asesi/asesmen/Ia05Page.tsx
git commit -m "fix: navigasi asesor abis IA.05 pake step berikutnya, bukan hardcode ak02"
```

---

### Task 8: Komtek views

**Files (Modify):**
- `src/pages/komtek/DaftarAsesiAll.tsx`
- `src/pages/komtek/DetailDokumenAsesiPage.tsx`

Both views render only docs whose URL is non-null (`filter((d) => d.url !== null)` in DaftarAsesiAll line 330), so adding the `ia06` key is sufficient — it appears only when the `/dokumen/asesi/:idIzin` payload carries an `ia06` URL.

- [ ] **Step 1: DaftarAsesiAll.tsx — label**

In `DOC_LABELS` (line 46, after `ia05: "FR-IA-05",`) add:
```ts
  ia06: "FR-IA-06",
```

- [ ] **Step 2: DaftarAsesiAll.tsx — group**

In `DOC_GROUPS` "Asesmen" (line 73), insert `"ia06"` after `"ia05"`:
```ts
  { title: "Asesmen", keys: ["ia01", "ia02", "ia03", "ia04a", "ia04b", "ia05", "ia06", "ia08", "ia09", "ia10", "ak02", "ak03", "ak05", "ak06", "tugas", "foto_kegiatan", "pernyataan"] },
```

- [ ] **Step 3: DetailDokumenAsesiPage.tsx — docKeyMap**

In `docKeyMap` (line 141, after `'ia05': 'ia05',`) add:
```ts
      'ia06': 'ia06',
```

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` — expected: no errors

```bash
git add src/pages/komtek/DaftarAsesiAll.tsx src/pages/komtek/DetailDokumenAsesiPage.tsx
git commit -m "feat: komtek tampilin dokumen IA.06 kalau ada di payload"
```

---

### Task 9: Full verification

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: `tsc` passes, Vite build succeeds

- [ ] **Step 2: Manual browser verification (dev server + backend with a paket skema)**

Matrix from spec:

1. `is_paket = true`, jenjang ≥ 4, asesi: sidebar shows IA.06 between IA.05 and AK.02; saving IA.05 navigates to `/asesmen/:id/ia06`; IA.06 save navigates to AK.02
2. `is_paket = false`: flow identical to pre-change (regression)
3. Low jenjang + `is_paket = true`: IA.06 after IA.05
4. Tahap 0 MUK + `is_paket = true`: IA.06 after last IA step
5. Asesor 1/2: injected step visible, numbering correct
6. Portofolio + KAN: unchanged regardless of `is_paket`
7. Komtek DaftarAsesiAll + DetailDokumenAsesiPage: FR-IA-06 chip shown only for paket asesi
8. Redirect checker: with IA.06 unfilled and later steps filled, visiting a later step redirects to ia06

- [ ] **Step 3: Final commit (if any fixups)**

```bash
git add -A
git commit -m "feat: inject IA.06 setelah IA.05 kalau is_paket — flow, redirect, komtek"
```
