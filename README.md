# Dewan Paroki Pugeran — Umat Pugeran dalam Angka

Repositori ini memuat pangkalan data dan visualisasi profil umat Paroki **Hati Kudus Tuhan Yesus (HKTY) Pugeran**, Kevikepan DIY, Keuskupan Agung Semarang.

Proyek ini terbagi menjadi dua bagian utama:

1. **Web Data Story (*Umat Pugeran dalam Angka*)** — Sajian narasi data visual interaktif berbasis web (*data storytelling*) yang merangkum basis data sensus **12.614 jiwa (4.403 keluarga)** menjadi ringkasan yang padat, terstruktur, dan informatif. Dirancang dalam satu halaman (*single-page application*) yang dapat dibaca tuntas oleh Romo Kepala Paroki maupun Dewan Paroki dalam 15–20 menit untuk membantu perumusan kebijakan pastoral. Spesifikasi kebutuhan produk didokumentasikan di [`docs/PRD-web-data-story-umat-pugeran.md`](docs/PRD-web-data-story-umat-pugeran.md).
2. **Arsip Analisis Awal (R & RStudio)** — Kumpulan skrip analisis awal berbahasa R, hasil konversi berkas `.dbf`, dan grafik statis terdahulu yang menjadi fondasi riset sebelum aplikasi web interaktif ini dibangun. Tetap dipertahankan sebagai arsip rujukan.

---

## 1. Panduan Menjalankan Proyek

### Prasyarat Sistem
- **Node.js** versi 22.12.0 atau yang lebih baru.
- **Python 3** (diperlukan jika ingin memproses ulang data mentah sensus; membutuhkan modul `pandas`, `pyarrow`, dan `dbfread`). Skrip otomatis mendeteksi lingkungan virtual di folder `.venv/` jika tersedia.

### Perintah Cepat

```bash
npm install          # Memasang dependensi proyek (dilakukan sekali di awal)
npm run dev          # Menjalankan server lokal pengembangan (http://localhost:4321)
npm run build        # Memvalidasi kode TypeScript, membangun situs statis ke dist/, dan membuat service worker
npm run check:build  # Memverifikasi integritas hasil build (ukuran berkas, aksesibilitas, isolasi, PII)
```

### Rangkaian Perintah Lengkap

| Perintah | Fungsi & Keterangan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan lokal via Astro. |
| `npm run data` | Menjalankan pipeline data Python: `00_load.py` → `01_clean.py` → `02_aggregate.py`. |
| `npm run validate:data` | Menjalankan `03_validate.py` untuk menguji privasi data, penyamaran jumlah kecil, konsistensi angka acuan sensus, dan mutu data. |
| `npm run validate:palette` | Menguji palet warna terhadap standar rasio kontras minimum WCAG (≥3:1) dan aksesibilitas bagi penyandang buta warna (CVD). |
| `npm run build` | Menjalankan `astro check`, mengompilasi situs statis ke `dist/`, dan membuat Service Worker untuk dukungan luring. |
| `npm run check:build` | Memeriksa berkas di `dist/`: memastikan tidak ada permintaan ke domain luar, mengecek batas ukuran berkas, kelengkapan bab narasi, interaktivitas grafik, dan ketiadaan kebocoran data pribadi (PII). |
| `npm run verify` | Menjalankan seluruh rantai di atas secara berurutan (pipeline → validasi data → validasi palet → build → audit build). |

### Akses & Penyebaran (*Deployment*)
- **Deployment Otomatis ke GitHub Pages**: Repositori ini dilengkapi alur kerja GitHub Actions (`.github/workflows/deploy.yml`) yang otomatis memvalidasi, membangun, dan mempublikasikan situs ke GitHub Pages setiap ada pembaruan di cabang `main`.
- **Dukungan Penuh Mode Luring (*Offline-First*)**: Hasil kompilasi pada folder `dist/` berupa situs statis mandiri yang dilengkapi Service Worker berversi (`scripts/build_sw.mjs`). Seluruh isi folder `dist/` dapat langsung disalin ke flashdisk (USB), folder bersama jaringan lokal, atau server internal paroki, dan dapat dibuka langsung melalui peramban web tanpa koneksi internet sama sekali.
- **Kebijakan Privasi Data**: Berkas mentah sensus di direktori `data/raw/` dikecualikan dari repositori Git (`.gitignore`) demi melindungi data pribadi umat. Alur build pada CI/CD (GitHub Pages) memanfaatkan data agregat tersanitasi yang telah siap di `src/data/derived/`.

---

## 2. Struktur Direktori

```text
Dewan Paroki Pugeran/
├── data/raw/                     # Berkas mentah sensus (.dbf) — tersimpan lokal, diabaikan Git demi privasi
├── pipeline/
│   ├── 00_load.py                # Membaca 5 berkas .dbf sumber dan memadukan relasi hierarkinya
│   ├── 01_clean.py               # Menghapus data pribadi (PII), menstandarkan label, dan menghitung usia
│   ├── 02_aggregate.py           # Menghitung tabulasi seluruh bab narasi + menyamarkan frekuensi kecil
│   ├── 03_validate.py            # Validasi ketat: privasi PII, k-anonymity, angka acuan, dan mutu data
│   ├── mappings/                 # Kamus pemetaan JSON untuk standardisasi kode dan kelompok wilayah
│   ├── utils.py                  # Konfigurasi tanggal acuan (SNAPSHOT), ambang batas penyamaran, dan filter PII
│   └── work/                     # Ruang kerja lokal sementara pengolahan data (diabaikan Git)
├── src/
│   ├── components/               # Komponen antarmuka: wadah bab (Adegan), pilar narasi, tabel data alternatif,
│   │                             # legenda, filter kelompok wilayah, dan pengendali interaksi grafik
│   ├── components/charts/        # 21 komponen: 18 variasi grafik SVG/HTML murni, kartu statistik beranimasi,
│   │                             # kartu catatan anomali data, dan tabel prioritas
│   ├── data/derived/             # Data agregat hasil olahan dalam format JSON (dibaca saat proses build)
│   ├── i18n/id.ts                # Seluruh teks narasi, judul bab, dan interpretasi data berbahasa Indonesia
│   ├── lib/                      # Modul utilitas: data.ts, format.ts, chart.ts, dan viz.ts
│   ├── pages/index.astro         # Halaman utama aplikasi web satu halaman (single-page application)
│   └── styles/                   # Berkas penataan gaya: tokens.css, global.css, dan print.css
├── public/
│   ├── data/                     # 17 berkas CSV data agregat tersanitasi (dapat diunduh pembaca)
│   ├── fonts/                    # Berkas font lokal mandiri: Gotham Narrow, Montserrat, IBM Plex Mono (woff2)
│   └── brand/                    # Lambang dan elemen visual identitas SADASA Academy
├── scripts/
│   ├── run_pipeline.mjs          # Pemilih dan eksekutor otomatis modul Python (.venv lokal)
│   ├── validate_palette.mjs      # Penguji palet warna (OKLCH, CIEDE2000, dan simulasi buta warna)
│   ├── vendor_assets.py          # Optimasi dan pembuatan subset font lokal ke format woff2
│   ├── build_sw.mjs              # Pembuat Service Worker berversi untuk fungsionalitas luring
│   └── check_build.mjs           # Skrip audit hasil build (memeriksa PII, aset, ukuran, dan aksesibilitas)
├── docs/
│   ├── PRD-web-data-story-umat-pugeran.md   # Dokumen spesifikasi kebutuhan produk (PRD)
│   └── catatan-teknis.md                    # Catatan keputusan teknis, penyesuaian PRD, dan pertanyaan terbuka
└── output/, scripts/*.R          # Arsip skrip analisis R dan visualisasi eksplorasi awal (RStudio)
```

---

## 3. Standar Ketat Pengolahan Data & Privasi

Skrip validator otomatis (`03_validate.py` dan `scripts/check_build.mjs`) akan **menghentikan dan menggagalkan proses build** apabila terjadi pelanggaran terhadap standar integritas data berikut:

1. **Perlindungan Total Data Pribadi (PII)**: Data identitas perorangan seperti nama lengkap, NIK, alamat rumah, nomor telepon, tempat dan tanggal lahir, serta nomor kartu keluarga dihapus sepenuhnya sejak tahap `01_clean.py`. Validator memindai seluruh data keluaran untuk memastikan tidak ada atribut identitas ataupun pola nilai yang menyerupai data pribadi (seperti deretan angka ≥12 digit atau format tanggal lengkap).
2. **Penyamaran Frekuensi Kecil (*k-anonymity*)**: Kategori data yang hanya mencakup 1–4 jiwa disamarkan nilainya menjadi `null` dengan label penanda `disamarkan` (bukan ditulis `0`). Langkah ini mencegah identifikasi individu secara deduktif melalui kombinasi karakteristik unik.
3. **Pemisahan Data Kosong dari Angka Nol**: Data yang tidak terisi pada formulir sensus (seperti tanda `-`, kode `bt` / belum tahu, atau sel kosong) tidak dianggap bernilai nol, melainkan dikelompokkan ke dalam kategori tersendiri, yaitu *"Tidak tercatat"*. Kategori ini tetap digambarkan pada visualisasi dengan pola arsiran khusus agar maknanya jelas tanpa bergantung pada persepsi warna.
4. **Transparansi Anomali Data**: Kejanggalan dalam pencatatan sensus tidak disembunyikan atau dihapus diam-diam, melainkan dipaparkan secara terbuka pada Bab 6.2 (misalnya temuan 580 baris data yang terindikasi memiliki nama dan tanggal lahir kembar, selisih 75 keluarga antarsumber berkas, serta kesalahan penulisan tahun perkawinan seperti tahun 965 atau 2997).
5. **Keterlacakan Sumber Data (*Traceability*)**: Setiap grafik dan angka statistik mencantumkan nama berkas dan kolom sumber data sensus di bagian bawah visualisasi.
6. **Sinkronisasi Mutlak Narasi dan Visualisasi**: Seluruh angka yang ditampilkan di dalam naskah narasi dibaca langsung dari berkas data hasil agregasi (`src/data/derived/*.json`), bukan diketik manual. Pendekatan ini menjamin narasi teks dan tampilan visual grafik selalu selaras 100%.
7. **Aksesibilitas Data Tanpa Hambatan Interaksi**: Data tidak disembunyikan hanya di balik interaksi kursor (*hover/tooltip*). Setiap grafik dilengkapi tabel data alternatif (*TabelAlt*), dapat dijelajahi menggunakan navigasi papan ketik (*keyboard*), dan mendukung pembaca layar (*screen reader*) melalui atribut `aria-live`.

---

## 4. Sistem Desain dan Visualisasi

Antarmuka visual mengadopsi panduan **SADASA Academy Design System** (PT Sadasa Akademi Indonesia) dengan penyesuaian khusus untuk visualisasi data:

- **Palet Warna & Identitas**:
  - Warna netral hangat (*warm paper*) digunakan sebagai latar belakang utama.
  - Merah khas SADASA (`#C40000`) difungsikan khusus sebagai aksen penyorot (*highlight*) untuk menegaskan angka kunci yang sedang diulas dalam narasi, dengan proporsi hemat (maksimal 10–15% bidang pandang).
  - Emas (`#F1B91A`) berfungsi sebagai aksen sekunder.
  - Untuk membedakan 19 wilayah pastoral tanpa membebani daya visual pembaca, digunakan palet kategori khusus 5 warna tanpa merah yang mewakili lima kelompok wilayah paroki (Gereja Induk, GBM, Sempu, Padokan, Bangunharjo).
- **Tipografi**: Menggunakan kombinasi font lokal yang dioptimalkan: *Gotham Narrow* untuk teks antarmuka dan narasi utama, *Montserrat* sebagai cadangan, serta *IBM Plex Mono* untuk angka, kode, dan tabel data.
- **Mode Gelap (*Ink Mode*)**: Mode gelap menggunakan latar bernuansa tinta merah pekat (`--red-950`), bukan hitam pekat polos, menciptakan suasana pembacaan yang teduh namun tetap tegas.
- **Visualisasi Mandiri & Ringan**: Seluruh grafik dibangun langsung menggunakan elemen SVG dan HTML statis saat proses build—tanpa memanfaatkan pustaka charting eksternal (seperti Chart.js atau D3). Total ukuran halaman sangat ringkas (~1,13 MB) sehingga cepat dimuat di berbagai peramban dan perangkat.
- **Interaktivitas Terpadu**: Skrip interaksi ringan di sisi klien menyediakan *tooltip* informatif, penyorotan kelompok (*group highlighting*), filter interaktif per kelompok wilayah, animasi hitung angka (*animated counter*) pada angka ringkasan utama, serta navigasi papan ketik penuh (`Tab` untuk memilih grafik, tombol panah untuk menjelajah data, dan `Escape` untuk menutup).
- **Uji Keterbacaan & Aksesibilitas**: Palet warna diuji secara matematis via `npm run validate:palette` untuk memenuhi ambang kontras minimum (rasio ≥3:1 terhadap latar belakang) dan lolos uji keterbacaan untuk berbagai jenis buta warna (deuteranopia, protanopia, dan tritanopia).

---

## 5. Catatan & Hal yang Perlu Dikonfirmasi

Beberapa asumsi data saat ini masih menunggu peninjauan atau konfirmasi lebih lanjut dari pihak Paroki HKTY Pugeran:

1. **Tanggal Ekstraksi Basis Data Sensus**: Berkas sumber tidak mencantumkan tanggal pasti penarikan data dari pangkalan data paroki. Saat ini, sistem menggunakan asumsi tanggal acuan kerja **1 Februari 2019** (berdasarkan arsip personalia dan dokumentasi foto yang ada). Jika tanggal sebenarnya telah dipastikan, nilai ini dapat diperbarui melalui konstanta `SNAPSHOT` di `pipeline/utils.py`, lalu jalankan kembali `npm run data` untuk memperbarui seluruh kalkulasi umur secara otomatis.
2. **Struktur Alur Lima Pilar Pastoral**: Pembagian alur narasi data ke dalam lima pilar pastoral (Persekutuan, Liturgi, Pewartaan, Pelayanan Kemasyarakatan, dan Paguyuban) perlu ditinjau kesesuaiannya bersama Romo Kepala Paroki.
3. **Ambang Batas Penyamaran Data Privasi**: Batas kelompok kecil saat ini dipatok untuk kategori dengan jumlah di bawah 5 jiwa. Nilai ini dapat disesuaikan melalui parameter `SMALL_CELL_THRESHOLD` di `pipeline/utils.py` apabila dewan paroki menghendaki kebijakan batasan yang berbeda.
4. **Bobot Indeks Prioritas Kunjungan Lingkungan**: Pada analisis prioritas kunjungan (Bab 5.2), ketiga indikator penentu masih diberi bobot seimbang (sama rata). Penentuan bobot ini terbuka untuk ditinjau kembali bersama pengurus bidang Pelayanan Kemasyarakatan melalui `pipeline/mappings/_config.json`.
5. **Tindak Lanjut Anomali Data Sensus**: Terdapat 290 pasang data (580 baris) dengan nama dan tanggal lahir yang identik, serta selisih 75 keluarga antara data keanggotaan individu dan berkas kartu keluarga. Temuan ini sengaja tidak dihapus secara otomatis dan diserahkan kepada tim sekretariat paroki untuk rekonsiliasi.

Rincian keputusan teknis, daftar perbedaan terhadap PRD awal, serta daftar pertanyaan data selengkapnya dapat dipelajari di [`docs/catatan-teknis.md`](docs/catatan-teknis.md).

---

## 6. Arsip Analisis Awal (R & RStudio)

Berkas proyek `Dewan Paroki Pugeran.Rproj`, skrip analisis awal di `scripts/date of birth.R`, dan visualisasi statis di `output/charts/` merupakan dokumentasi kerja eksplorasi data tahap pertama yang melatarbelakangi pengembangan aplikasi web ini.

*Catatan Keaslian Data*: Pipeline pengolahan data web saat ini membaca langsung dari berkas asli `.dbf` di `data/raw/` untuk menjamin konsistensi data dari satu sumber tunggal. Berkas `.csv` dan `.xlsx` yang tersimpan di direktori olahan lama tidak digunakan sebagai masukan pipeline web.
