# Catatan teknis — Umat Pugeran dalam Angka

Ditujukan kepada siapa pun yang melanjutkan pekerjaan ini: tim data paroki, pengembang berikutnya,
dan pemilik merek SADASA Academy. Isinya tiga hal: di mana implementasi menyimpang dari
`PRD-web-data-story-umat-pugeran.md`, di mana ia menyimpang dari design system, dan apa yang masih
menunggu jawaban orang.

Tanggal: 13 September 2026.

---

## 1. Penyimpangan dari PRD

### 1.1 Sistem desain diganti seluruhnya

**PRD §9** menetapkan identitas visual yang diturunkan dari Gereja HKTY Pugeran: bordo `#8A1C2B`,
emas `#C9A227`, Source Serif 4 untuk suara naratif, lima slot seri data biru-nila sampai merah bata,
dan aturan keras "bordo dan emas adalah identitas, bukan seri data".

**Yang dibangun** memakai **SADASA Academy Design System** atas permintaan pemilik proyek. Seluruh
lapisan kroma, tipografi, ruang, bentuk, dan gerak berasal dari sana. Konsekuensinya:

| Butir PRD | Yang berlaku sekarang |
| --- | --- |
| Bordo `#8A1C2B` sebagai warna institusi | Merah SADASA `#C40000`; bidang gelap memakai `--red-950` |
| Emas `#C9A227` sebagai aksen langka | Emas SADASA `#F1B91A`, dengan peran yang sama |
| Source Serif 4 untuk naratif | Gotham Narrow (huruf identitas SADASA), Montserrat sebagai cadangan |
| Inter untuk antarmuka dan angka | Gotham Narrow untuk antarmuka, IBM Plex Mono untuk angka dan kode |
| "Bordo dan emas tidak pernah menjadi seri data" | **Dibalik.** Design system SADASA justru menetapkan emas memimpin dan merah menyorot pada chart. Aturan itu yang dipakai. |
| Mode gelap `data-theme="dark"` | `data-theme="ink"` — nama milik design system, permukaannya tinta merah, bukan hitam |
| Lima slot seri data yang sudah divalidasi | Lima slot baru, diturunkan dari urutan SADASA, **divalidasi ulang** dengan gerbang yang sama |

**Cara aturan merah tetap dijaga.** Design system membatasi merah pada ±10–15% layar. Halaman ini
panjang dan penuh grafik, jadi merah tidak dipakai sebagai warna kategori pada grafik satu seri.
Semua batang netral (`--mark-base`), dan hanya **satu batang** — yang dibicarakan kalimat tafsir —
yang disorot merah (`--mark-highlight`). Itu sekaligus menjalankan kaidah SADASA "merah menyorot
satu angka yang penting" dan kaidah visualisasi data "warna mengikuti entitas, bukan peringkat".

**Emas digelapkan pada mode terang.** `#F1B91A` hanya mencapai ±1,7:1 di atas kertas `#FDFBF7`;
sebagai tanda grafik ia wajib ≥ 3:1. Slot 1 pada mode terang karena itu `#B37E0D` (3,44:1). Pada
mode gelap, `#F8C339` dipakai dan lolos dengan lapang.

**Hasil validasi palet** (`npm run validate:palette`, pasangan bersebelahan):

| Pemeriksaan | Terang | Gelap |
| --- | --- | --- |
| Rentang kecerahan OKLCH | lolos — terburuk ΔL 0,057 | lolos — terburuk ΔL 0,062 |
| Ambang kroma | lolos — terendah C 0,066 | lolos — terendah C 0,057 |
| Pemisahan buta warna (deutan) | lolos — ΔE 12,3 | lolos — ΔE 16,8 |
| Pemisahan buta warna (protan) | lolos — ΔE 22,0 | lolos — ΔE 21,0 |
| Pemisahan buta warna (tritan) | lolos — ΔE 17,9 | lolos — ΔE 10,1 |
| Penglihatan normal | lolos — ΔE 33,1 | lolos — ΔE 34,9 |
| Kontras terhadap permukaan | lolos — terendah 3,44:1 | lolos — terendah 3,68:1 |
| Ramp sekuensial monoton + terbedakan | lolos | lolos |
| Pasangan divergen | lolos — ΔE 43,2 | lolos — ΔE 35,6 |

**Batas jumlah seri.** Untuk bentuk yang menampilkan semua pasangan sekaligus, palet aman sampai
**5 slot pada mode terang** dan **4 slot pada mode gelap**. Batas yang dipakai adalah yang lebih
ketat: empat. Produk ini tidak memuat sebar atau gelembung, sehingga batas itu belum mengikat apa
pun — tetapi ia tercatat, dan kategori di luar batas selalu dilipat menjadi "Lainnya".

### 1.2 Selisih terhadap angka jangkar §17.2

Dilaporkan terbuka oleh `03_validate.py`, tidak diperbaiki diam-diam. Build tidak digagalkan untuk
ketiganya karena selisihnya sudah dipahami; jangkar lain menggagalkan build bila meleset.

| Jangkar | PRD | Pipeline | Sebab |
| --- | --- | --- | --- |
| `usia_65_plus` | 2.099 | **2.101** | Cara pembulatan umur pada berkas acuan. Angka pipeline dihitung dari tanggal lahir terhadap 1 Februari 2019. |
| `tidak_aktif` | 897 | 897 | Cocok. Gabungan dua kode sensus `non A` (489) dan `N (P)` (408) yang keduanya berarti tidak aktif. |
| `goldarah_tidak_tercatat` | 2.722 | 2.722 | Cocok. 2.560 baris `bt` ditambah 162 sel hampa. |
| `pekerjaan_tidak_tercatat` | 2.476 | **2.480** | PRD menghitung `-` (2.253) + `bt` (223). Pipeline juga memperlakukan 4 baris berisi `....` sebagai tidak tercatat. |

Selisih lain terhadap §8.3 dan §12: **tidak ada**. Seluruh angka jangkar lainnya cocok tepat,
termasuk 12.614 · 4.403 · 88 · 19, median umur 43,9, rasio ketergantungan 36,8, 807 rumah tangga
satu orang, 482 lansia tinggal sendiri, 1.277 pelayan, dan 462 keluarga yang memerlukan bantuan.

### 1.3 Hal kecil lain

- **Adegan 3.1** — PRD menulis 460 jiwa tanpa catatan pada kedua tahap sakramen. Pipeline
  menemukan **465**: 460 baris berkode `99` ditambah 5 baris yang kolomnya kosong sama sekali.
- **Adegan 5.4** — 373 jiwa di luar wilayah paroki cocok. Lima baris yang kolomnya hampa masuk ke
  "Tidak tercatat", bukan ke "luar paroki", sehingga penyebut adegan menjadi 373 dan bukan 378.
- **Nama lingkungan dan wilayah** ditulis dalam kapital judul ("Gedongkiwo Utara"), bukan huruf
  besar semua seperti di berkas sumber. Halaman membacanya sebagai nama, bukan sebagai kode.
- **Kolom `KET16` dan `KET17`** kosong seluruhnya pada 12.614 baris; tidak dipakai.
- **Lingkungan "Dukuh Selatan"** ada di daftar resmi (`lingkung.dbf`, 89 baris) tetapi tidak memuat
  satu jiwa pun pada potret ini. Karena itu cerita memakai **88** lingkungan, dan fakta itu
  disebutkan di adegan 6.3.
- **Enam baris berkode paroki lain** (`30012014`, `30025002`) tetap masuk ke jumlah total 12.614
  tetapi dikeluarkan dari agregasi wilayah dan lingkungan Pugeran. Karena itu penyebut adegan 1.2
  dan 1.3 adalah 12.608, dan itu tertulis di grafiknya.

---

## 2. Satu cacat di design system yang harus diperbaiki di sumbernya

**`--text-body` didefinisikan dua kali dengan arti yang berbeda.**

- `tokens/colors.css` baris 65: `--text-body: var(--n-700)` — alias **warna teks**.
- `tokens/typography.css` baris 27: `--text-body: 0.9375rem` — token **ukuran huruf**.

`styles.css` mengimpor `colors.css` lebih dahulu, sehingga nilai ukuran menang. Akibatnya, setiap
`color: var(--text-body)` menghasilkan `color: 0.9375rem`, yang tidak sah dan diabaikan browser.
Ini bukan masalah teoretis: `tokens/base.css` baris 3 memakai `color: var(--text-body)` untuk
`body`, jadi **warna teks dasar seluruh design system tidak pernah benar-benar terpasang** — ia
jatuh ke warna bawaan browser. Di produk ini cacat itu sempat membuat tombol di bilah atas hampir
tak terlihat sebelum ketahuan.

**Yang dilakukan di sini:** tangga ukuran huruf diberi nama ulang `--size-*`
(`--size-body`, `--size-h1`, `--size-caption`, …), sehingga alias warna `--text-*` yang
didokumentasikan design system tetap berfungsi sebagaimana readme-nya menjanjikan.

**Yang disarankan untuk design system:** lakukan penamaan ulang yang sama di sumbernya, lalu
perbaiki `tokens/base.css` supaya memakai `font-size: var(--size-body)`. Sampai itu dikerjakan,
setiap produk baru akan mengulang cacat yang sama.

---

## 3. Keputusan implementasi yang layak diketahui

### 3.1 Ragam bentuk grafik — menyimpang dari pustaka komponen PRD §10

PRD §10 menetapkan sembilan komponen, dan hasilnya didominasi batang: 14 dari 31 adegan. Atas
permintaan pemilik proyek, bentuk grafik dirombak supaya lebih beragam, modern, dan interaktif,
tanpa melonggarkan aturan data. Setiap bentuk dipilih menurut tugas datanya, bukan demi variasi.

| Adegan | Bentuk | Mengapa bentuk ini |
| --- | --- | --- |
| 1.2 | Treemap berwarna kelompok wilayah | Bagian terhadap keseluruhan untuk 19 wilayah; kelompok terbaca sebagai kolom |
| 1.3 | Sebaran titik per wilayah | Variasi di dalam wilayah dan antarwilayah terbaca sekaligus; 88 batang tidak |
| 1.4 | Kolom lolipop | Distribusi berurutan dengan tinta ringan |
| 1.5, 2.4, 3.3 | Meter cincin | Satu rasio terhadap keseluruhan |
| 1.6, 3.6, 3.7, 4.6 | Rincian zoom | Satu mayoritas besar dengan ekor yang harus tetap terbaca |
| 2.1 | Piramida usia bergaris median | Bentuk baku demografi |
| 2.2 | Perbandingan kotak | "36,8 per 100" sebagai satuan yang dapat dirasakan |
| 2.3 | Kolom titik, 1 titik = 10 jiwa | Tiga angka yang menyangkut orang |
| 2.5 | Dumbbell | Selisih laki-laki dan perempuan per kelompok umur |
| 2.6 | Garis rasio terhadap 100 | Arah selisih menurut umur, pada satu sumbu |
| 3.1 | Lintasan tahap | Lihat catatan corong di bawah tabel |
| 3.2, 4.2, 5.6 | Waffle 100 kotak | Bagian terhadap keseluruhan, termasuk celah data yang besar |
| 3.4, 4.4 | Treemap sorotan | Banyak kategori, satu yang dibicarakan tafsir |
| 3.5 | Hemisiklus 100 kursi | Keaktifan sebagai persekutuan yang berkumpul |
| 4.5 | Batang divergen | Skala berurutan tiga tingkat dengan titik tengah netral |
| 5.1 | Kluster unit, 1 titik = 1 jiwa | Jumlah kecil yang menyangkut orang |
| 5.2 | Scatter gelembung, di atas tabel prioritas | Dua komponen indeks dan ukuran lingkungan dalam satu bidang |
| 5.3 | Kotak bersarang | "Di antaranya" terbaca sebagai bentuk |
| 4.1, 4.3, 5.4, 5.5 | Batang mendatar, tetap | Jenjang berurutan dan daftar panjang berlabel; batang tetap paling jujur |

**Corong 3.1 diganti karena menyesatkan.** Corong lama menaruh label "4.028 belum menerima Krisma"
di antara tahap Komuni dan Krisma, seolah angka itu bagian dari 10.663 penerima Komuni. Sensus
mencatat setiap tahap atas seluruh 12.614 umat dan tidak menyediakan tabulasi silang antartahap,
sehingga aliran seperti corong atau sankey tidak dapat digambar dengan jujur. Setiap tahap kini
punya lintasan sendiri pada penyebut yang sama.

Seluruh grafik tetap berupa SVG atau HTML yang dihitung saat build, tanpa pustaka charting, dan
setiap grafik tetap punya tabel angka alternatif.

### 3.2 Lapisan interaksi

`src/components/InteraksiGrafik.astro` memasang satu skrip kecil untuk seluruh halaman:

- **Tooltip** pada setiap tanda. Nilai memimpin, label mengikuti, dan kunci warna berupa garis.
  Teks dimasukkan lewat `textContent`, tidak pernah `innerHTML`.
- **Sorot grup.** Menyentuh satu lingkungan menyalakan seluruh wilayahnya; menyentuh satu kotak
  waffle atau satu kursi menyalakan seluruh kategorinya beserta baris legendanya.
- **Keyboard.** Setiap grafik dapat difokus dengan `Tab`, panah menjelajah nilai, dan `Escape`
  menutup. Nilai yang dijelajah juga dibacakan lewat wilayah `aria-live`.
- **Sentuh.** Ketuk tanda untuk membaca, ketuk di luar untuk menutup.
- **Filter kelompok wilayah** di adegan 1.2, 1.3, dan 5.2: memilih satu kelompok meredupkan yang lain.

Tooltip memperkaya, tidak pernah menggerbang: tanpa JavaScript seluruh angka tetap ada di tabel
angka alternatif. Kontrak markup (`data-t`, `data-v`, `data-s`, `data-g`, `data-k`) dibangun lewat
`src/lib/viz.ts`. `scripts/check_build.mjs` kini menggagalkan build bila grafik interaktif kurang
dari 25, bila ada grafik tanpa `tabindex` atau `aria-label`, atau bila ada tanda bertooltip tanpa
nilai.

Diuji di Chrome headless: hover pada delapan bentuk, navigasi keyboard, filter, dan mode gelap.
Pengukuran tata letak (kotak treemap di luar bidang, teks meluber, elemen melewati kartu) pada
lebar 1.280 px dan 400 px memberi 0 temuan.

### 3.3 Warna kelompok wilayah

Pemilik proyek meminta warna yang mengelompokkan wilayah, karena pengelompokan itu penting bagi
pastor paroki. Sembilan belas warna tidak dapat dibedakan mata, apalagi oleh pembaca buta warna.
Karena itu warna mengikuti **lima kelompok wilayah** yang sudah dipakai paroki: Gereja Induk
(8 wilayah), GBM (5), Sempu (3), Padokan (2), dan Bangunharjo (1). Wilayahnya sendiri dibedakan
lewat posisi, label, dan sorotan saat disentuh.

- **Kamus.** `pipeline/mappings/kelompok_wilayah.json`, berkunci kode `WILAYAH` dari `stasi.dbf`.
  Sumbernya pemecahan berkas kerja di `data/processed/`, dikonfirmasi pemilik proyek.
  `02_aggregate.py` menambahkan kolom `kelompok` pada adegan 1.2, 1.3, dan 5.2, serta pada unduhan
  `wilayah.csv` dan `lingkungan.csv`. `03_validate.py` menggagalkan build bila ada wilayah tanpa
  kelompok.
- **Palet kategori tanpa merah** (`--kat-1` … `--kat-5`), sehingga merah tetap khusus untuk
  sorotan. Palet ini lolos `npm run validate:palette` pada pasangan bersebelahan:

  | Pemeriksaan | Terang | Gelap |
  | --- | --- | --- |
  | Rentang kecerahan | ΔL 0,058 | ΔL 0,056 |
  | Buta warna | ΔE 17,9 | ΔE 10,1 |
  | Penglihatan normal | ΔE 41,1 | ΔE 35,7 |
  | Kontras terhadap permukaan | 3,44:1 | 4,02:1 |

- **Mengapa cukup pasangan bersebelahan.** Setiap bentuk yang memakai palet ini menjaga urutan
  slot: kolom treemap berurutan, blok baris sebaran lingkungan, sektor waffle dan hemisiklus.
  **Scatter 5.2 sengaja tidak diwarnai kelompok**, karena sebar menampilkan semua pasangan
  sekaligus dan lima warna tidak lolos batas itu. Di sana kelompok dipilih lewat filter.
- **Bila paroki mengubah pengelompokan**, ubah kamus JSON-nya lalu jalankan `npm run verify`.
  Mengubah urutan kelompok berarti mengubah warnanya.

### 3.4 Keputusan lain

- **Dua tata letak per grafik SVG.** Grafik SVG yang memuat teks (batang, piramida, lolipop, garis
  rasio, scatter, treemap) merender versi lebar dan versi sempit, lalu memilih salah satunya lewat
  media query. Grafik yang padat label (sebaran lingkungan, dumbbell, zoom, waffle, lintasan tahap)
  dibangun dari HTML, sehingga labelnya tetap pada ukuran huruf halaman di layar ponsel. Lembar
  gaya cetak selalu memakai versi lebar dan mengganti warna dengan pola hitam-putih.
- **Efek kemunculan adegan dipagari kelas `.js`.** Aturan `opacity: 0` hanya berlaku bila skrip
  sebaris di `<head>` sempat memasang kelas itu. Tanpa JavaScript, seluruh adegan tampil penuh
  sejak awal. `scripts/check_build.mjs` menolak build bila pagar itu hilang.
- **Seluruh koordinat SVG dibulatkan dua angka di belakang koma.** Selain memangkas ukuran HTML,
  ini menjaga agar tidak ada deretan digit panjang di keluaran — pemeriksa hasil build
  memperlakukan deretan seperti itu sebagai dugaan kunci individu.
- **Skala sumbu memakai langkah bulat** (1, 2, 2,5, 5, atau 10 kali pangkat sepuluh), dengan 3–6
  selang. Pembaca paroki membaca 0–250–500–750–1.000 jauh lebih cepat daripada 0–313–625–938.
- **Huruf disubset ke Latin dan dikemas ulang sebagai woff2.** Berkas `.otf` Gotham Narrow dari
  design system berjumlah 2,2 MB; lima berat yang benar-benar dipakai halaman ini menjadi 77 KB.
  `scripts/vendor_assets.py` mengerjakannya; jalankan ulang bila design system diperbarui.
- **Tidak ada pustaka charting.** Seluruh grafik digambar saat build; JavaScript di peramban hanya
  menambahkan lapisan interaksi (§3.2). Hasil build penuh 1,10 MB, di bawah batas 2 MB, dan tidak
  memuat satu pun permintaan ke domain luar.

---

## 4. Yang masih menunggu jawaban orang

1. **Tanggal ekstraksi basis data.** Belum tercatat di berkas sumber mana pun. Petunjuk yang ada:
   tanggal baptis terakhir 2016, dokumentasi foto Februari 2019, `Personalia 2019.docx`. Halaman
   memakai **1 Februari 2019** dan menyatakannya terbuka sebagai asumsi, di pembuka dan di adegan
   6.3. Bila tanggal sebenarnya diketahui: ubah `SNAPSHOT` di `pipeline/utils.py` lalu jalankan
   `npm run data`. Tidak ada satu pun angka umur yang ditulis manual.
2. **Kerangka lima pilar** perlu konfirmasi Romo Kepala Paroki sebelum uji baca.
3. **Ambang penyamaran sel kecil** ditetapkan 5. Perlu persetujuan dewan bila dikehendaki lain;
   ubah `SMALL_CELL_THRESHOLD` di `pipeline/utils.py`.
4. **Bobot skor prioritas kunjungan** (adegan 5.2) masih sama rata untuk tiga komponen. Perlu
   ditinjau bidang Pelayanan Kemasyarakatan; ubah di `pipeline/mappings/_config.json`.
5. **Penempatan berkas hasil build** — folder paroki, server internal, atau USB.
6. **290 kelompok dugaan duplikat** (580 baris dengan nama dan tanggal lahir identik) perlu
   ditinjau paroki. Tidak dihapus otomatis karena kembar dan kesamaan nama mungkin terjadi.
7. **Selisih 75 keluarga** antara `umat.dbf` (4.403) dan `umatkk.dbf` (4.328) perlu direkonsiliasi.
8. **Baptis 100% di adegan 3.1, tetapi ada "Belum dibaptis" di adegan 3.2.** Lintasan tahap 3.1
   menggambar seluruh 12.614 jiwa sebagai sudah dibaptis, sedangkan 3.2 memuat 161 jiwa berkategori
   "Belum dibaptis" dan 193 "Masih katekumen". Pengelola basis data perlu memastikan arti kategori
   itu. Bila memang belum dibaptis, lintasan tahap Baptis di 3.1 salah.
9. **4.028 umat "belum menerima Krisma" mencakup anak yang belum cukup umur.** Butir ketiga agenda
   6.1 karena itu tidak lagi menarik kesimpulan tentang katekese. Sebelum program disusun, hitung
   silang status Krisma menurut umur di `02_aggregate.py`. Hitungan itu bergantung pada butir 1.

Keterbacaan grafik di layar ponsel, yang sebelumnya tercatat di sini, sudah diselesaikan lewat
rombakan grafik (§3.1 dan §3.4).

---

## 5. Yang belum dikerjakan, sesuai non-tujuan PRD §3.2

Bukan dashboard, tidak ada filter bebas, tidak ada penelusuran per individu atau per keluarga,
tidak ada pencarian nama, tidak ada login, tidak ada API, tidak ada pembaruan otomatis, tidak ada
proyeksi atau model inferensial, tidak ada perbandingan antarparoki, dan tidak ada peta geospasial
(batas lingkungan belum tersedia dalam bentuk GeoJSON).

Ditunda ke versi berikutnya: perbandingan se-Kevikepan DIY dari `UMAT KEV DIY.xlsx`, peta lingkungan
bila GeoJSON tersedia, penghubungan dengan `PROGRAM KERJA RUTIN DAN INVESTASI.xlsx` dan
`PROGRAM VISIONER 2018.xlsx`, dan perbandingan antarwaktu begitu sensus berikutnya selesai.

---

## 6. Penulisan ulang naskah di luar pipeline, dan koreksinya

Sesudah build terakhir yang terverifikasi (13 September 2026, 12.27 WIB), naskah di
`src/i18n/id.ts`, `src/pages/index.astro`, `src/components/charts/HeatTable.astro`, dan teks
penutup di `pipeline/02_aggregate.py` ditulis ulang dalam ragam bahasa formal. **Ragam itu
dipertahankan.** Seluruh gerbang build tetap lolos, tetapi pencocokan kalimat demi kalimat dengan
JSON turunan dan dengan PRD §8.4 dan §16 menemukan kalimat yang tidak boleh terbit:

| Jenis | Yang tertulis | Yang benar menurut data |
| --- | --- | --- |
| Salah fakta | Tanggal ekstraksi diasumsikan "berdasarkan catatan berkas sumber" | Tanggal itu justru tidak tercatat di berkas sumber mana pun |
| Salah fakta | Unduhan `agama.csv`: "agama anggota keluarga non-Katolik" | Berkas memuat 11.958 umat Katolik |
| Kategori diperluas | "Jabodetabek (Jakarta)", "kos/kontrakan — jauh dari keluarga asalnya", "bantuan karitatif", "OMK" untuk umur 15–29, "status kanonik" | "Jakarta", "indekos", "memerlukan bantuan", "orang muda 15–29 tahun", "status perkawinan" |
| Klaim tanpa data | "hidup rukun", "sebatang kara", "tanpa pendamping serumah", "indikator kerentanan objektif" | Data hanya memuat keanggotaan keluarga; kategori ekonomi adalah penilaian kualitatif |
| Bahasa perubahan waktu | "penurunan jumlah", "tidak lagi berbentuk kerucut", "penyusutan generasi" | Potret satu waktu, tanpa arah perubahan |
| Rekomendasi di kalimat tafsir | Adegan 5.5 dan 5.6 | Rekomendasi hanya di 6.1 |
| Janji data perorangan | Agenda 6.1: daftar keluarga satu orang "telah tersedia dan dapat diteruskan" | Halaman tidak memuat nama; daftar ditarik sekretariat dari pangkalan data |
| Markup tampil mentah | `<b>12.614 jiwa</b>` tercetak apa adanya di pembuka | Pembuka dirender sebagai teks, tanpa `b()` |

Dua kalimat dari versi sebelumnya ikut dikoreksi karena cacat serupa. Pertama, adegan 3.3 ("lebih
dari separuh umat membawa riwayat sakramennya dari paroki lain"): 56,3% itu termasuk umat yang tempat
baptisnya tidak tercatat. Kedua, agenda 6.1 soal Krisma (lihat §4 butir 9).

**Pencegahan.** Kepala `src/i18n/id.ts` kembali memuat aturan yang mengikat, ditambah dua aturan
baru: label kategori tidak diperluas melampaui isi data, dan halaman tidak menjanjikan data
perorangan. `scripts/check_build.mjs` kini menggagalkan build bila markup tampil sebagai teks. Dua
jenis cacat lain — kategori yang diperluas dan klaim tanpa data — tidak dapat diperiksa mesin.
Setiap suntingan naskah perlu dicocokkan dengan `src/data/derived/*.json` sebelum dibagikan.
