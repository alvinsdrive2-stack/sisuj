# API Dokumen Versi KAN (IA04B, IA05, IA06, AK02)

Dokumen versi **KAN** (MUK KAN) untuk jadwal yang memakai **kelompok soal A/B/C**.
Endpoint GET (ambil data form) & POST (simpan jawaban) memakai endpoint **yang sama
dengan versi BNSP**, dibedakan dengan query param ``.

Base URL: `https://certification-api.lspgatensi.id/api`

Semua endpoint di bawah **wajib autentikasi**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

> **Catatan generate otomatis**: sejak commit `d558741`, saat asesor menandatangani
> (ttd) dokumen versi BNSP (`POST /api/qr/{id}/ia04b|ia05|ia06|ak02`) dan jadwal
> id izin tersebut memakai kelompok soal A/B/C, PDF versi KAN **otomatis ikut
> digenerate** dan URL-nya tersimpan di kolom `url_kan_ia_04b` / `url_kan_ia_05` /
> `url_kan_ia_06` / `url_kan_ak_02` pada tabel `bukti_asesmens`.

---

## 1. KAN IA04B — Lembar Periksa Kegiatan Terstruktur (DIT)

### GET data form

```
GET /api/asesmen/{id_izin}/ia04b
```

**Response 200:**
```json
{
  "message": "OK",
  "data": {
    "barcodes": {
      "asesi": { "url": "https://moon.lspgatensi.id/...", "tanggal": "...", "nama": "..." },
      "asesor1": { "url": "https://moon.lspgatensi.id/...", "tanggal": "...", "nama": "..." },
      "asesor2": { "url": "https://moon.lspgatensi.id/...", "tanggal": "...", "nama": "..." }
    },
    "dokumen": { "id": 10006, "nama_dokumen": "..." },
    "soal_list": [
      {
        "id": 12345,
        "no": 1,
        "soal": "teks soal",
        "soal1": null,
        "soal2": null,
        "tipe": 8,
        "is_komentar": 0,
        "id_unitkompetensi": 123,
        "id_kuk": 456,
        "jawaban": null,
        "skor": null,
        "pencapaian": null,
        "unit_kode": "F.41PLG00.002.2",
        "kuk_kode": "2.2"
      }
    ],
    "rekomendasi": {
      "id": 999,
      "soal": "Rekomendasi Asesor:",
      "is_komentar": 1,
      "rekomendasi": false
    },
    "total_skor": 0
  }
}
```

Keterangan:
- `soal_list` = daftar soal DIT (tipe 8), sudah termasuk `jawaban` & `skor` tersimpan
  (nullable jika belum diisi).
- `rekomendasi` = item rekomendasi (tipe 3), `rekomendasi: true/false`.
- `pencapaian` = nilai skor (0-3) alias dari kolom `skor`.

### POST simpan jawaban

```
POST /api/asesmen/{id_izin}/ia04b
```

**Request body:**
```json
{
  "dokumen_id": 10006,
  "answers": [
    { "soal_id": 12345, "jawaban": "teks jawaban", "skor": 2 }
  ],
  "rekomendasi": false
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `dokumen_id` | integer | ✅ | id dokumen dari response GET |
| `answers` | array | ✅ | daftar jawaban per soal |
| `answers[].soal_id` | integer | ✅ | id soal (dari `soal_list[].id`) |
| `answers[].jawaban` | string/null | ❌ | isi jawaban (DIT) |
| `answers[].skor` | integer 0-3 | ❌ | skor per soal |
| `rekomendasi` | boolean | ❌ | rekomendasi KOMPETEN (true) / tidak (false) |

**Response 200:**
```json
{ "message": "KAN IA04B answers saved" }
```

---

## 2. KAN IA05 — Pertanyaan Tertulis Pilihan Ganda

### GET data form

```
GET /api/asesmen/{id_izin}/ia05
```

**Response 200:**
```json
{
  "message": "OK",
  "data": {
    "barcodes": { "asesi": null, "asesor1": null, "asesor2": null },
    "dokumen": { "id": 8565, "nama_dokumen": "..." },
    "soal_list": [
      {
        "id": 555,
        "no": 1,
        "soal": "Pertanyaan ...",
        "jawab_a": "opsi A",
        "jawab_b": "opsi B",
        "jawab_c": "opsi C",
        "jawab_d": "opsi D",
        "kunci_jawaban": "A",
        "id_unitkompetensi": 123,
        "id_kuk": 456,
        "jawaban_asesi": null,
        "skor": null,
        "unit_kode": "F.41PLG00.002.2",
        "kuk_kode": "2.2"
      }
    ],
    "umpan_balik": null,
    "jumlah_benar": 0,
    "jumlah_salah": 0
  }
}
```

Keterangan:
- `soal_list[].kunci_jawaban` = kunci jawaban benar (jangan dikirim ke frontend
  asesi jika ini ujian — sesuaikan kebijakan).
- `jawaban_asesi` = jawaban yang sudah dipilih asesi (`A`/`B`/`C`/`D`).
- `jumlah_benar`/`jumlah_salah` dihitung dari skor tersimpan (1 = benar, 0 = salah).

### POST simpan jawaban

```
POST /api/asesmen/{id_izin}/ia05
```

**Request body:**
```json
{
  "dokumen_id": 8565,
  "answers": [
    { "soal_id": 555, "jawaban": "A", "skor": 1 }
  ],
  "umpan_balik": "catatan asesor (opsional)"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `dokumen_id` | integer | ✅ | id dokumen dari response GET |
| `answers` | array | ✅ | daftar jawaban |
| `answers[].soal_id` | integer | ✅ | id soal |
| `answers[].jawaban` | string `A`/`B`/`C`/`D` | ❌ | pilihan jawaban |
| `answers[].skor` | integer 0-1 | ❌ | 1 = benar, 0 = salah |
| `umpan_balik` | string | ❌ | catatan/umpan balik asesor |

**Response 200:**
```json
{ "message": "KAN IA05 answers saved" }
```

---

## 3. KAN IA06 — Pertanyaan Tertulis Esai

### GET data form

```
GET /api/asesmen/{id_izin}/ia06
```

**Response 200:**
```json
{
  "message": "OK",
  "data": {
    "barcodes": { "asesi": null, "asesor1": null, "asesor2": null },
    "dokumen": { "id": 14407, "nama_dokumen": "..." },
    "soal_list": [
      {
        "id": 777,
        "no": 1,
        "soal": "Uraikan ...",
        "id_unitkompetensi": 123,
        "id_kuk": 456,
        "jawaban": null,
        "skor": null,
        "unit_kode": "F.41PLG00.002.2",
        "kuk_kode": "2.2",
        "kuk_nama": "Masukan tentang pelaksanaan ..."
      }
    ],
    "umpan_balik": null,
    "unit_elemen_kuk": null,
    "total_skor": 0
  }
}
```

Keterangan:
- `soal_list` = soal esai (tipe 8), `jawaban` & `skor` tersimpan per soal.
- `umpan_balik` = catatan asesor.
- `unit_elemen_kuk` = ringkasan unit/elemen/KUK yang perlu tindak lanjut.
- `total_skor` = total skor dari semua soal.

### POST simpan jawaban

```
POST /api/asesmen/{id_izin}/ia06
```

**Request body:**
```json
{
  "dokumen_id": 14407,
  "answers": [
    { "soal_id": 777, "jawaban": "teks jawaban esai", "skor": 2 }
  ],
  "umpan_balik": "catatan asesor (opsional)",
  "unit_elemen_kuk": "unit/elemen/kuk (opsional)"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `dokumen_id` | integer | ✅ | id dokumen dari response GET |
| `answers` | array | ✅ | daftar jawaban |
| `answers[].soal_id` | integer | ✅ | id soal |
| `answers[].jawaban` | string | ❌ | isi jawaban esai |
| `answers[].skor` | integer 0-3 | ❌ | skor per soal |
| `umpan_balik` | string | ❌ | catatan asesor |
| `unit_elemen_kuk` | string | ❌ | ringkasan unit/elemen/KUK |

**Response 200:**
```json
{ "message": "KAN IA06 answers saved" }
```

---

## 4. KAN AK02 — Fragmen Antara Asesor

### GET data form

```
GET /api/asesmen/{id_izin}/ak02
```

**Response 200:**
```json
{
  "message": "OK",
  "data": {
    "barcodes": { "asesi": null, "asesor1": null, "asesor2": null },
    "dokumen": { "id": 8494, "nama_dokumen": "..." },
    "unit_kompetensi": [
      {
        "id": 123,
        "kode": "F.41PLG00.002.2",
        "nama": "Melakukan Komunikasi di Tempat Kerja",
        "evidence": {
          "observasi": false,
          "portofolio": false,
          "pertanyaan_wawancara": false,
          "pertanyaan_lisan": false,
          "pertanyaan_tertulis": false,
          "proyek_kerja": false,
          "lainnya": false
        }
      }
    ],
    "total_skor_dit": null,
    "total_skor_pilihan_ganda": null,
    "total_skor_esai": null,
    "nilai_skor_dit": null,
    "nilai_skor_pilihan_ganda": null,
    "nilai_skor_esai": null,
    "skor_nilai_akhir": null,
    "isLulus": false,
    "isTidakLulus": false,
    "tindak_lanjut": null,
    "komentar": null,
    "threshold_passing": 65
}
```

Keterangan:
- `unit_kompetensi` = daftar unit + evidence check (metode asesmen yang dipilih).
- `threshold_passing` = batas lulus (65 utk jenjang ≤ 6, 70 utk > 6).
- `isLulus`/`isTidakLulus` = status kelulusan (dari `is_kompeten`).

### POST simpan jawaban

```
POST /api/asesmen/{id_izin}/ak02
```

**Request body:**
```json
{
  "answers": [
    {
      "id_unit_kompetensi": 123,
      "observasi": true,
      "portofolio": false,
      "pertanyaan_wawancara": false,
      "pertanyaan_lisan": false,
      "pertanyaan_tertulis": false,
      "proyek_kerja": false,
      "lainnya": false
    }
  ],
  "total_skor_dit": 80,
  "total_skor_pg": 85,
  "total_skor_esai": 75,
  "is_kompeten": true,
  "tindak_lanjut": "opsional",
  "komentar": "opsional"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `answers` | array | ✅ | daftar evidence per unit |
| `answers[].id_unit_kompetensi` | integer | ✅ | id unit |
| `answers[].observasi` | boolean | ❌ | metode observasi langsung |
| `answers[].portofolio` | boolean | ❌ | metode portofolio |
| `answers[].pertanyaan_wawancara` | boolean | ❌ | metode wawancara |
| `answers[].pertanyaan_lisan` | boolean | ❌ | metode pertanyaan lisan |
| `answers[].pertanyaan_tertulis` | boolean | ❌ | metode pertanyaan tertulis |
| `answers[].proyek_kerja` | boolean | ❌ | metode proyek kerja |
| `answers[].lainnya` | boolean | ❌ | metode lainnya |
| `total_skor_dit` | numeric | ❌ | total skor DIT |
| `total_skor_pg` | numeric | ❌ | total skor pilihan ganda |
| `total_skor_esai` | numeric | ❌ | total skor esai |
| `is_kompeten` | boolean | ✅ | KOMPETEN (true) / belum (false) |
| `tindak_lanjut` | string | ❌ | rekomendasi tindak lanjut |
| `komentar` | string | ❌ | komentar asesor |

**Response 200:**
```json
{ "message": "KAN AK02 answers saved" }
```

---

## 5. Generate PDF KAN (TTD)

PDF versi KAN digenerate lewat endpoint TTD versi BNSP — **otomatis** jika jadwal
memakai kelompok soal A/B/C:

```
POST /api/qr/{id_izin}/ia04b   → otomatis generate KAN-IA04B
POST /api/qr/{id_izin}/ia05    → otomatis generate KAN-IA05
POST /api/qr/{id_izin}/ia06    → otomatis generate KAN-IA06
POST /api/qr/{id_izin}/ak02    → otomatis generate KAN-AK02
```

Body: `{ "id_jadwal": 123 }`

URL PDF KAN tersimpan di:
- `bukti_asesmens.url_kan_ia_04b` → `https://moon.lspgatensi.id/files/new_gatensi/dok_asesmen/kan_ia04b/KAN-IA04B-{id_izin}.pdf`
- `bukti_asesmens.url_kan_ia_05` → `.../kan_ia05/KAN-IA05-{id_izin}.pdf`
- `bukti_asesmens.url_kan_ia_06` → `.../kan_ia06/KAN-IA06-{id_izin}.pdf`
- `bukti_asesmens.url_kan_ak_02` → `.../kan_ak02/KAN-AK02-{id_izin}.pdf`

> TTD manual versi KAN (opsional, jika ingin paksa generate):
> `POST /api/qr/{id_izin}/ia04b` (dan setara utk lainnya) → langsung
> memanggil `ttdKan*` di KanAsesmenController.

---

## Catatan Implementasi (referensi kode)

| Dokumen | Builder data | Submit | Get | TTD |
|---|---|---|---|---|
| KAN IA04B | `KanAsesmenController::buildKanIa04bData` | `submitKanIa04b` | `getKanIa04b` | `ttdKanIa04b` |
| KAN IA05 | `buildKanIa05Data` | `submitKanIa05` | `getKanIa05` | `ttdKanIa05` |
| KAN IA06 | `buildKanIa06Data` | `submitKanIa06` | `getKanIa06` | `ttdKanIa06` |
| KAN AK02 | `buildKanAk02Data` | `submitKanAk02` | `getKanAk02` | `ttdKanAk02` |

- Tabel jawaban: `kan_ia4b_answers`, `kan_ia5_answers`, `kan_ia6_answers`, `kan_ak2_feedbacks`.
- Tabel feedback: `kan_ia5_feedbacks`, `kan_ia6_feedbacks`, `kan_ak2_feedbacks`.
- Soal: `kan_soals` (relasi `unit` → `unit_kompetensis`, `kuk` → `kuks`).
- Generate otomatis saat ttd: `AsesmenController::resolveKelompokAbo($idIzin)` cek
  `jadwal_kelompok_soal.kelompok ∈ {A,B,C}` → panggil
  `KanAsesmenController::generateKanDocument($idIzin, 'KanIa04b'|'KanIa05'|'KanIa06'|'KanAk02')`.
