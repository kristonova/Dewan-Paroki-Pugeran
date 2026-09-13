# Dewan Paroki Pugeran — Umat Pugeran dalam Angka

Repositori kerja data umat Paroki **Hati Kudus Tuhan Yesus (HKTY) Pugeran**, Kevikepan DIY,
Keuskupan Agung Semarang.

Isinya dua lapis:

1. **Produk utama** — *Umat Pugeran dalam Angka*: satu halaman web naratif (*data story*) yang
   mengubah basis data sensus **12.614 jiwa dalam 4.403 keluarga** menjadi cerita yang dapat dibaca
   Romo Kepala Paroki dari awal sampai akhir dalam 15–20 menit. Dibangun mengikuti
   [`docs/PRD-web-data-story-umat-pugeran.md`](docs/PRD-web-data-story-umat-pugeran.md).
2. **Ruang kerja analisis lama** — skrip R, konversi `.dbf`, dan grafik PNG hasil RStudio yang
   menjadi cikal bakal produk di atas. Tetap disimpan sebagai arsip.

---

## 1. Jalankan

```bash
npm install          # sekali di awal
npm run verify       # pipeline data → validasi → validasi palet → build → periksa hasil build
npm run dev          # server pengembangan di http://localhost:4321
```

| Perintah | Fungsi |
| --- | --- |
| `npm run data` | `00_load.py` → `01_clean.py` → `02_aggregate.py` |
| `npm run validate:data` | `03_validate.py` — privasi, sel kecil, angka jangkar, kelengkapan, kelompok wilayah, mutu |
| `npm run validate:palette` | Uji palet seri data dan palet kategori terhadap gerbang kontras dan buta warna |
| `npm run build` | `astro check` → build statis → bangun service worker |
| `npm run check:build` | Periksa hasil build: domain luar, ukuran, kelengkapan adegan, grafik interaktif, PII |
| `npm run verify` | Seluruh rantai di atas, berurutan |

Python diambil otomatis dari `.venv/` bila ada (`scripts/run_pipeline.mjs`). Kebutuhan:
`pandas`, `pyarrow`, `dbfread`. Node 22.12+.

**Membagikan hasilnya.** Salin seluruh isi `dist/` ke folder paroki, server internal, atau USB.
Halaman terbuka langsung dari berkas, tanpa jaringan dan tanpa server.

---

## 2. Struktur

```text
Dewan Paroki Pugeran/
├── data/raw/                     # .dbf sumber — tidak pernah diubah
├── pipeline/
│   ├── 00_load.py                # baca lima .dbf, satukan hierarki
│   ├── 01_clean.py               # buang PII, normalkan label, turunkan umur
│   ├── 02_aggregate.py           # tabulasi seluruh adegan + penyamaran sel kecil
│   ├── 03_validate.py            # gerbang keras: privasi, sel kecil, jangkar, mutu
│   ├── mappings/                 # kamus normalisasi dan kelompok wilayah (JSON, dapat diaudit)
│   ├── utils.py                  # SNAPSHOT, ambang penyamaran, daftar hitam PII
│   └── work/                     # ruang kerja lokal, diabaikan Git
├── src/
│   ├── components/               # Adegan, Pilar, TabelAlt, Legenda, SvgDefs,
│   │                             # InteraksiGrafik (tooltip, keyboard, filter), FilterKelompok
│   ├── components/charts/        # 21 komponen: 18 bentuk grafik, kartu statistik,
│   │                             # kartu celah data, tabel prioritas
│   ├── data/derived/             # JSON agregat, dibaca saat build
│   ├── i18n/id.ts                # SELURUH naskah narasi
│   ├── lib/                      # data.ts, format.ts, chart.ts, viz.ts
│   ├── pages/index.astro         # satu-satunya rute
│   └── styles/                   # tokens.css, global.css, print.css
├── public/
│   ├── data/                     # 17 unduhan agregat tersanitasi (.csv)
│   ├── fonts/                    # Gotham Narrow, Montserrat, IBM Plex Mono (woff2)
│   └── brand/                    # lambang dan motif SADASA
├── scripts/
│   ├── run_pipeline.mjs          # pemilih penerjemah Python
│   ├── validate_palette.mjs      # gerbang palet (OKLCH, CIEDE2000, simulasi CVD)
│   ├── vendor_assets.py          # subset huruf + perkecil aset dari design system
│   ├── build_sw.mjs              # service worker berversi
│   └── check_build.mjs           # pemeriksaan hasil build
├── docs/
│   ├── PRD-web-data-story-umat-pugeran.md
│   └── catatan-teknis.md         # penyimpangan dari PRD & design system, pertanyaan terbuka
└── output/, scripts/*.R          # arsip ruang kerja RStudio
```

---

## 3. Aturan yang mengikat, bukan sekadar niat

`03_validate.py` dan `scripts/check_build.mjs` **menggagalkan build** bila salah satu dilanggar.

1. **Data individu tidak pernah keluar dari pipeline.** Nama, tempat dan tanggal lahir, alamat,
   telepon, NIK, dan nomor keluarga dibuang di `01_clean.py`. Validator memeriksa nama kunci *dan*
   bentuk nilai (angka 12 digit ke atas, tanggal penuh) di seluruh keluaran.
2. **Sel 1–4 jiwa disamarkan**, ditulis `null` dengan penanda `disamarkan` — bukan `0`.
3. **Kosong bukan nol.** `-`, `bt`, dan sel hampa menjadi kategori "Tidak tercatat" yang ikut
   digambar, selalu dengan arsir sehingga tidak bergantung pada warna.
4. **Anomali diceritakan, bukan dihapus.** 580 baris dugaan duplikat, selisih 75 keluarga
   antarsumber, dan tanggal nikah tahun 965/2997 semuanya tampil di adegan 6.2.
5. **Setiap angka dapat dilacak** ke berkas dan kolom sumbernya, tercetak di bawah setiap grafik.
6. **Setiap angka di naskah dibaca dari JSON turunan**, tidak pernah diketik manual — naskah dan
   grafik tidak bisa berbeda.
7. **Tooltip memperkaya, tidak pernah menggerbang.** Setiap grafik interaktif dapat difokus dan
   dijelajah dengan keyboard, dan setiap nilai di tooltip juga ada di tabel angka alternatif.

---

## 4. Sistem desain dan grafik

Halaman ini memakai **SADASA Academy Design System** (PT Sadasa Akademi Indonesia):
merah `#C40000` sebagai aksen (bukan bidang), emas `#F1B91A` sebagai warna kelegaan, netral hangat,
Gotham Narrow untuk teks, IBM Plex Mono untuk angka dan kode, motif ¾-ring sebagai satu-satunya
hiasan, dan mode gelap berupa **tinta merah**, bukan hitam.

Grafik dipilih menurut tugas datanya — treemap, sebaran titik per wilayah, meter cincin, rincian
zoom, waffle, hemisiklus, dumbbell, garis rasio, scatter gelembung, dan batang hanya untuk data
berjenjang serta daftar panjang. Semuanya digambar saat build tanpa pustaka charting; satu skrip
kecil menambahkan tooltip, sorot grup, navigasi keyboard, dan filter.

Dua palet diuji terhadap gerbang kontras 3:1 dan pemisahan buta warna: **palet seri data** (emas
memimpin, merah menyorot) dan **palet kategori tanpa merah** untuk lima kelompok wilayah (Gereja
Induk, GBM, Sempu, Padokan, Bangunharjo). Jalankan `npm run validate:palette` untuk melihat
angkanya. Bentuk grafik per adegan, lapisan interaksi, dan penyimpangan yang disengaja dari design
system dan dari PRD dicatat di [`docs/catatan-teknis.md`](docs/catatan-teknis.md).

---

## 5. Yang masih terbuka

1. **Tanggal ekstraksi basis data belum terkonfirmasi.** Seluruh umur dihitung terhadap
   **1 Februari 2019** sebagai asumsi kerja. Bila tanggal sebenarnya diketahui, ubah `SNAPSHOT`
   di `pipeline/utils.py` — satu tempat — lalu jalankan `npm run data`.
2. Kerangka lima pilar perlu konfirmasi Romo Kepala Paroki.
3. Ambang penyamaran sel kecil ditetapkan 5; perlu persetujuan bila dewan menghendaki angka lain.
4. Bobot skor prioritas kunjungan (adegan 5.2) masih sama rata; perlu ditinjau bidang Pelayanan
   Kemasyarakatan.

Daftar lengkap, termasuk pertanyaan data untuk pengelola basis data, ada di
[`docs/catatan-teknis.md`](docs/catatan-teknis.md) §4.

---

## 6. Arsip ruang kerja RStudio

`Dewan Paroki Pugeran.Rproj`, `scripts/date of birth.R`, dan `output/charts/` adalah pekerjaan
sebelumnya yang melahirkan produk ini. Berkas `.csv` dan `.xlsx` di `data/processed/` adalah hasil
konversi manual dan **bukan** masukan pipeline — pipeline membaca `.dbf` langsung, agar hanya ada
satu sumber untuk satu fakta. Satu pengecualian yang disengaja: pemecahan berkas per kelompok di
sana menjadi sumber kamus `pipeline/mappings/kelompok_wilayah.json`.
