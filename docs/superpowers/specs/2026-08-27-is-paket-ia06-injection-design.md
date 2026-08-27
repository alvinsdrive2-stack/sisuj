# Design: Conditional IA.06 Step Injection Based on `is_paket`

**Date:** 2026-08-27
**Status:** Approved (design phase)

## Problem

Asesmen flow currently goes `IA.05 → AK.02`. When the assessment document data
(`datadokumenasesmen`) has `is_paket = true`, an additional step `IA.06`
(FR.IA.06C — Lembar Jawaban Pertanyaan Tertulis Esai, existing page
`Ia06Page.tsx`) must appear **after IA.05** and **before AK.02**. This must be
consistent across:

- Left sidebar step indicator (node list)
- Next-page navigation after saving a step
- First-unfilled-step redirect checker
- Komtek document listing views

## Scope Decisions

| Area | Decision |
|---|---|
| Flows injected | Asesi full + low jenjang, Asesor 1/2 full + low jenjang, Tahap 0 MUK (observasi + low jenjang) — all flows containing IA.05, **metode observasi only** |
| Portofolio flow | Skipped — has no IA.05; low-jenjang + portofolio combos also excluded (`injectIa06Flag = isPaket && !isPortofolio`) |
| KAN flow | Skipped — already has its own IA.06 |
| Komtek views | Included — `DaftarAsesiAll`, `DetailDokumenAsesiPage` show IA.06 when `is_paket` |
| Direktur views | Not affected — only shows SK/SPT/BA documents |
| Backend | Assumed ready: `is_paket` boolean in `/asesmen/:id/data-dokumen` and in komtek document payloads, plus `ia06` file key |

## Approach

Add an `isPaket` flag end-to-end: expose it from `useDataDokumenAsesmen`, pass
it as a new parameter to `getAsesmenSteps()` / `getMukSteps()`, and inject the
IA.06 step via a shared helper. Update the ~21 call sites mechanically (one
line each). Mirror the injection in the redirect checker's step list.

Rejected alternatives:

- **New `useAsesmenSteps()` hook** centralizing data + steps — cleaner call
  sites but a deeper structural refactor of 21 files; disproportionate risk
  for one feature.
- **Inject only in `ModularAsesiLayout`** — infeasible: per-page navigation
  logic reads the raw steps array, so sidebar and redirect would diverge.

## Detailed Design

### 1. Data layer

`src/hooks/useDataDokumenAsesmen.ts`:

- Add `is_paket: boolean` to `DataDokumenAsesmenData` and the internal state
  shape (default `false`).
- Return `isPaket: boolean` from the hook result.
- `AsesmenDataContext` (context provider path) passes the field through so
  both context and standalone hook consumers see it.

### 2. Flow injection

`src/lib/asesmen-steps.ts`:

- New helper:

  ```ts
  function injectIa06(steps: StepConfig[]): StepConfig[] {
    const idx = steps.findIndex(s => s.href.includes('ia05'))
    if (idx === -1) return steps
    const inserted = [...steps]
    inserted.splice(idx + 1, 0, { number: 0, label: 'IA.06', href: '/asesi/asesmen/ia06' })
    return inserted.map((s, i) => ({ ...s, number: i + 1 }))
  }
  ```

- `getAsesmenSteps(jenjangId, isAsesor, asesorRole, _asesorCount, metode, tahap, isPaket?)`:
  - KAN branch: unchanged (bypasses everything).
  - Portofolio branch: unchanged (no IA.05).
  - Asesi/Asesor full + low jenjang: apply `injectIa06` when `isPaket` is
    truthy, before the `tahap === 2` AK.01 filter/renumber (order irrelevant —
    both renumber, but injection happens on the source array first).
  - `tahap === 0` branch: return injected `MUK_STEPS_TAHAP_0_OBSERVASI` /
    `MUK_STEPS_TAHAP_0_LOW_JENJANG` when `isPaket` (portofolio tahap 0
    unchanged).
- `getMukSteps(tahap, jenjang, metode)`: unchanged — YAGNI. Tahap-0 IA.06
  injection happens through `getAsesmenSteps`'s inline tahap-0 branch, which
  is what the IA pages use. `MukLayout`/`MukPage` and their consumers
  (`Mapa01Page`, `Mapa02Page`, `FrAk04Page`, `FrAk07Page`, `K3AsesmenPage`)
  read from `useDataDokumenPraAsesmen` — different endpoint with no
  confirmed `is_paket` field, so they are not wired. Cosmetic consequence:
  their sidebar step numbers after IA.05 are off by one when `is_paket` is
  true. Same applies to `FrAk01Page`.

### 3. Call sites

Every page/hook computing steps passes `isPaket` from
`useDataDokumenAsesmen`:

- `Ak02Page`, `Ak03Page`, `Ak05Page`, `Ak06Page`, `AsesmenSelesaiPage`,
  `Ia01Page`, `Ia02Page`, `Ia03Page`, `Ia04aPage`, `Ia04bPage`,
  `Ia04bKANPage`, `Ia05Page`, `Ia05KANPage`, `Ia06Page`, `Ia08Page`,
  `Ia09Page`, `Ia10Page`, `SurveiPage`, `UploadTugasPage`, `UjianPage`,
  `FrAk01Page`
- `src/hooks/useAsesmenStepQrStatus.ts` — already calls
  `useDataDokumenAsesmen(idIzin)`; destructure `isPaket` from it and pass to
  `getAsesmenSteps`
- NOT updated (see deviation note above): `FrAk01Page`, `MukLayout`,
  `MukPage`, `Mapa01Page`, `Mapa02Page`, `FrAk04Page`, `FrAk07Page`,
  `K3AsesmenPage`

Each is a one-line signature/argument update plus adding `isPaket` to the
`useMemo` dependency array.

### 4. Redirect checker

`src/hooks/useTahapStepCheck.ts`:

- `getTahapSteps(tahap, jenjang, metode, isPaket?)`: insert
  `{ stepKey: 'ia06', label: 'IA.06', href: '/asesmen/:id/ia06' }` after
  `ia05` in the default (full jenjang) and low-jenjang lists when `isPaket`.
  Portofolio list unchanged.
- `useTahapStepCheck` options gain `isPaket?: boolean`; wired into
  `getTahapSteps` call and `runCheck` deps. The parallel step-check loop then
  probes `/asesmen/:id/ia06` automatically, so the first-unfilled-step
  redirect stays accurate.

### 5. Navigation

- `Ia05Page` next-step navigation is already steps-driven
  (`asesmenSteps[currentStepIndex + 1]`) → picks up IA.06 automatically.
- **Fix:** `Ia05Page.tsx:363` (asesor feedback path) hardcodes
  `navigate(/asesmen/${id}/ak02)`. Replace with the same next-step lookup
  from `asesmenSteps` used elsewhere in the file.

### 6. Ia06Page reuse

- Existing `Ia06Page.tsx` is reused unchanged in content. Route
  `asesmen/:id/ia06` already exists and is not KAN-gated. Its save handler
  already navigates to `asesmenSteps[idx + 1]`, which resolves to AK.02 when
  injected.

### 7. Komtek views

- `src/pages/komtek/DaftarAsesiAll.tsx`: add `ia06` key to the "Asesmen"
  section after `ia05` (label `FR-IA-06`); render conditionally when the
  kegiatan/asesi payload reports `is_paket`.
- `src/pages/komtek/DetailDokumenAsesiPage.tsx`: add `'ia06': 'ia06'` to
  `docKeyMap`; the file URL resolves from the payload's `ia06` key.

## Error Handling

- `is_paket` missing from API response → treated as `false` (IA.06 not
  shown). No new error states.
- `ia06` file missing in komtek payload → existing null-URL handling renders
  "not available", same as other doc types.

## Testing

Manual verification matrix (no unit test infra for flow lib currently):

1. `is_paket = true`, jenjang ≥ 4, asesi: sidebar shows IA.06 between IA.05
   and AK.02; saving IA.05 navigates to `/asesmen/:id/ia06`; direct URL to
   later step with IA.06 unfilled redirects back to ia06.
2. Same with `is_paket = false`: flow identical to today (regression check).
3. Low jenjang + `is_paket = true`: IA.06 appears after IA.05 (after IA.03 →
   upload-tugas → IA.05 sequence).
4. Tahap 0 MUK + `is_paket = true`: IA.06 appended after final IA step.
5. Asesor 1/2 views: injected step visible, numbering correct.
6. Portofolio + KAN: unchanged regardless of `is_paket`.
7. Komtek DaftarAsesiAll + DetailDokumenAsesiPage: IA.06 row shown only when
   `is_paket`.
8. `tsc`/build passes.
