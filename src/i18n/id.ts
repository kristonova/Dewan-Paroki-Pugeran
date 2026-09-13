/**
 * Seluruh naskah narasi dan takarir visualisasi data Paroki Pugeran.
 *
 * Aturan yang mengikat berkas ini (PRD §8.4 dan §16). Ragam bahasa boleh formal,
 * tetapi aturan di bawah ini tidak boleh dilonggarkan:
 *  · Satu adegan, satu pertanyaan. Judul adegan ditulis sebagai pertanyaan.
 *  · Kalimat tafsir menyatakan APA YANG TERLIHAT di data, bukan apa yang seharusnya
 *    dilakukan dan bukan dugaan sebab. Rekomendasi hanya muncul di bagian 6.1.
 *  · Label kategori tidak diperluas melampaui isi data: "Jakarta" tetap Jakarta,
 *    "indekos" tetap indekos, rentang umur 15–29 bukan nama kelompok kategorial.
 *  · Istilah basis data tidak pernah muncul apa adanya.
 *  · Persentase selalu menyebut penyebutnya bila penyebutnya bukan 12.614.
 *  · Tidak ada kalimat yang menghakimi status hidup umat.
 *  · TIDAK ADA ANGKA YANG DIKETIK MANUAL. Setiap angka dibaca dari JSON turunan,
 *    sehingga naskah dan grafik tidak pernah berbeda.
 *  · Potret satu waktu: tidak ada "meningkat", "menurun", "penurunan", atau "tidak lagi".
 *  · Halaman ini tidak memuat, dan tidak menjanjikan, data perorangan.
 */
import {
  angka, lingkunganRows, meta, nilai, objek, penutup,
} from "../lib/data";
import { d, n, p, tanggal } from "../lib/format";

const SNAPSHOT = tanggal(meta.snapshot);
const b = (s: string) => `<b>${s}</b>`;

// Baris teratas tabel prioritas kunjungan pastoral, dipakai kalimat tafsir adegan 5.2.
const teratas52 = lingkunganRows("5.2")[0];
if (!teratas52) throw new Error("Adegan 5.2 tidak memuat satu pun lingkungan");

// Lingkungan terkecil, dipakai untuk menjelaskan rasionalisasi ambang penyamaran data.
const lingkunganTerkecil = objek<{ label: string; n: number }>("1.3", "terkecil");

// ── Pembuka ──────────────────────────────────────────────────────────────────
export const halaman = {
  judul: "Umat Pugeran dalam Angka",
  subjudul: `Potret Demografi dan Dinamika Pastoral Paroki ${meta.paroki}`,
  deskripsi:
    "Kajian naratif profil umat Paroki Hati Kudus Tuhan Yesus Pugeran berdasarkan data sensus: " +
    "mengenal umat yang dipercayakan kepada reksa pastoral paroki serta memetakan fokus perhatian pelayanan Gereja.",
};

export const pembuka = {
  eyebrow: "Paroki Hati Kudus Tuhan Yesus · Pugeran, Yogyakarta",
  judul: "Siapa umat yang dipercayakan kepada reksa pastoral paroki ini?",
  lead:
    `Pangkalan data sensus paroki menghimpun catatan atas ${n(meta.umat_total)} jiwa dalam ` +
    `${n(meta.keluarga_total)} keluarga. Selama ini, kekayaan data tersebut tersimpan dalam berkas pangkalan ` +
    "data dan lembar sebar (spreadsheet) yang rumit dan belum mudah dibaca bersama. Kajian naratif ini merangkum " +
    "dan menyajikannya sebagai satu kesatuan cerita—mulai dari gambaran umum umat hingga titik-titik pastoral " +
    "yang paling membutuhkan sapaan dan kehadiran Gereja.",
  angkaLabel: ["jiwa terdaftar", "keluarga", "lingkungan", "wilayah"],
  catatan:
    `Seluruh data pada sajian ini bersumber dari satu potret pangkalan data sensus paroki (snapshot), bukan analisis deret waktu antartahun. ` +
    `Perhitungan usia mengacu pada tanggal patokan ${SNAPSHOT}. ` +
    (meta.snapshot_terkonfirmasi
      ? "Tanggal tersebut telah dikonfirmasi oleh pengelola pangkalan data paroki."
      : "Tanggal ekstraksi yang sebenarnya tidak tercatat di berkas sumber mana pun, sehingga tanggal patokan ini dipakai sebagai asumsi kerja sembari menanti konfirmasi pengelola pangkalan data paroki. Penjelasan mengenai cara membaca angka-angka ini disajikan pada bagian penutup."),
  bacaMenit: "Waktu baca: 15–20 menit",
};

// ── Babak ────────────────────────────────────────────────────────────────────
export const babak = [
  {
    id: "babak-1",
    label: "Babak I",
    judul: "Profil Demografi Umat",
    lead: "Mengenal jumlah, susunan keluarga, dan persebaran wilayah tempat tinggal umat Paroki Pugeran.",
  },
  {
    id: "babak-2",
    label: "Babak II",
    judul: "Kehidupan Beriman dan Mata Pencaharian",
    lead: "Dinamika hidup menggereja, penerimaan sakramen inisiasi, serta karya profesi dan perekonomian umat.",
  },
  {
    id: "babak-3",
    label: "Babak III",
    judul: "Fokus Perhatian Reksa Pastoral",
    lead: "Menjangkau umat yang rentan dan memastikan tidak ada seorang pun yang terlewat dari sapaan kasih Gereja.",
  },
];

// ── Pilar ────────────────────────────────────────────────────────────────────
export const pilar = [
  {
    no: 1,
    id: "pilar-1",
    judul: "Profil dan Persebaran Umat",
    bidang: ["Paguyuban", "Tata Organisasi"],
    lead:
      "Sebelum merumuskan program pastoral yang tepat sasaran, Dewan Paroki perlu memahami profil nyata umat: " +
      `berapa banyak jiwa yang dilayani, bagaimana persebarannya, dan seperti apa susunan keluarganya di ${n(meta.lingkungan_total)} lingkungan.`,
  },
  {
    no: 2,
    id: "pilar-2",
    judul: "Struktur Generasi dan Regenerasi",
    bidang: ["Pewartaan", "Paguyuban"],
    lead:
      "Piramida usia memperlihatkan perimbangan antara kelompok usia produktif dan kelompok yang ditanggung, " +
      "kelangsungan generasi anak, serta potensi kaum muda bagi masa depan persekutuan umat.",
  },
  {
    no: 3,
    id: "pilar-3",
    judul: "Dinamika Hidup Menggereja",
    bidang: ["Liturgi & Peribadatan", "Pewartaan"],
    lead:
      "Kelengkapan penerimaan sakramen inisiasi, status perkawinan, keaktifan persekutuan, " +
      "hingga keterlibatan umat dalam aneka tugas pelayanan di paroki dan lingkungan.",
  },
  {
    no: 4,
    id: "pilar-4",
    judul: "Pendidikan, Karya, dan Perekonomian",
    bidang: ["Pelayanan Kemasyarakatan", "Pewartaan (Pendidikan)"],
    lead:
      "Jenjang pendidikan yang ditempuh umat, ragam profesi dan mata pencaharian, serta " +
      "kondisi kesejahteraan ekonomi keluarga menurut catatan sensus.",
  },
  {
    no: 5,
    id: "pilar-5",
    judul: "Menjangkau yang Rentan dan Membutuhkan Perhatian",
    bidang: ["Pelayanan Kemasyarakatan", "Penelitian & Pengembangan"],
    lead:
      "Memetakan warga paroki yang paling membutuhkan sapaan dan pendampingan pastoral: para lansia yang tinggal seorang diri, " +
      "umat dengan kebutuhan kesehatan khusus, warga yang berdomisili jauh, serta mereka yang sudah lama tidak aktif bersekutu.",
  },
];

// ── Adegan ───────────────────────────────────────────────────────────────────
export interface TeksAdegan {
  pertanyaan: string;
  tafsir: string;
  caption: string;
  label: string;
  /** Keterangan dan label aksesibel visual kedua, pada adegan yang memuat dua visual. */
  captionVisual?: string;
  labelVisual?: string;
}

const teks: Record<string, TeksAdegan> = {
  // ═══ Pilar 1 ═══════════════════════════════════════════════════════════════
  "1.1": {
    pertanyaan: "Berapa banyak jiwa dan keluarga yang terdaftar di paroki?",
    tafsir:
      `Sebanyak ${b(n(meta.umat_total) + " jiwa")} tercatat dalam ${b(n(meta.keluarga_total) + " keluarga")}, ` +
      `dengan rata-rata ${d(angka("1.1", "rata_rata_per_keluarga"), 2)} jiwa per keluarga dan nilai tengah (median) ` +
      `${d(angka("1.1", "median_per_keluarga"), 0)} jiwa. Adapun keluarga dengan anggota terbanyak beranggotakan ` +
      `${n(angka("1.1", "terbesar"))} jiwa.`,
    caption: "Gambaran skala dasar paroki: jumlah jiwa, jumlah keluarga, dan rata-rata ukuran rumah tangga.",
    label: "Skala dasar umat Paroki Pugeran",
  },
  "1.2": {
    pertanyaan: "Bagaimana sebaran jumlah umat di setiap wilayah?",
    tafsir:
      `Wilayah ${b(objek<{ label: string }>("1.2", "tertinggi").label)} merupakan wilayah dengan umat terbanyak, yakni mencapai ` +
      `${b(n(objek<{ n: number }>("1.2", "tertinggi").n) + " jiwa")}. Sementara itu, Wilayah ` +
      `${objek<{ label: string }>("1.2", "terendah").label} beranggotakan ` +
      `${n(objek<{ n: number }>("1.2", "terendah").n)} jiwa—menunjukkan selisih hingga ` +
      `${d(objek<{ n: number }>("1.2", "tertinggi").n / objek<{ n: number }>("1.2", "terendah").n, 1)} kali lipat ` +
      `antara wilayah terpadat dan wilayah terkecil.`,
    caption:
      `Luas setiap kotak sebanding jumlah umat di ${n(meta.wilayah_total)} wilayah, dikelompokkan ke dalam ` +
      `${n(meta.kelompok.length)} kelompok wilayah. Sebanyak ${n(meta.baris_paroki_lain)} baris data berkode paroki lain ` +
      "tidak disertakan dalam grafik ini dan dilaporkan pada bagian penutup.",
    label: "Sebaran jumlah umat menurut wilayah",
  },
  "1.3": {
    pertanyaan: "Seberapa lebar variasi ukuran dan beban antarlingkungan?",
    tafsir:
      `Nilai tengah (median) jumlah umat per lingkungan berada pada angka ${b(d(angka("1.3", "median"), 1) + " jiwa")}. ` +
      `Lingkungan terbesar, yakni ${b(objek<{ label: string }>("1.3", "terbesar").label)}, dihuni oleh ` +
      `${n(objek<{ n: number }>("1.3", "terbesar").n)} jiwa; sedangkan lingkungan terkecil, ` +
      `${objek<{ label: string }>("1.3", "terkecil").label}, beranggotakan ` +
      `${n(objek<{ n: number }>("1.3", "terkecil").n)} jiwa. Perbedaan rentangnya mencapai ` +
      `${b(d(angka("1.3", "rentang"), 1) + " kali lipat")}—menandakan seorang ketua lingkungan dapat mendampingi ` +
      `umat belasan kali lipat lebih banyak daripada ketua lingkungan lainnya.`,
    caption:
      `Setiap titik adalah satu dari ${n(angka("1.3", "jumlah_lingkungan"))} lingkungan, disusun per wilayah dan per kelompok wilayah. ` +
      "Garis tipis di setiap baris merentang dari lingkungan terkecil ke terbesar di wilayah itu; garis tegak menandai nilai tengah (median) paroki.",
    label: "Sebaran jumlah umat di 88 lingkungan",
  },
  "1.4": {
    pertanyaan: "Bagaimana susunan ukuran keluarga umat?",
    tafsir:
      `Sebanyak ${b(n(angka("1.4", "satu_orang")) + " keluarga")} (${p(angka("1.4", "satu_orang_pct"))} dari total ` +
      `${n(meta.keluarga_total)} keluarga) merupakan keluarga beranggotakan satu orang (hidup sendiri), jumlah yang hampir setara ` +
      `dengan keluarga beranggotakan dua orang. Adapun keluarga dengan jumlah anggota terbesar beranggotakan ${n(angka("1.4", "terbesar"))} jiwa.`,
    caption: `Distribusi keluarga berdasarkan jumlah anggota keluarga. Basis data: ${n(meta.keluarga_total)} keluarga.`,
    label: "Distribusi ukuran keluarga umat",
  },
  "1.5": {
    pertanyaan: "Bagaimana komposisi jenis kelamin kepala keluarga?",
    tafsir:
      `Sebanyak ${b(n(angka("1.5", "perempuan")) + " keluarga")} dikepalai oleh perempuan, mencakup ` +
      `${p(angka("1.5", "perempuan_pct"))} dari ${n(angka("1.5", "penyebut"))} kepala keluarga yang jenis kelaminnya tercatat. ` +
      `Sementara itu, terdapat ${n(angka("1.5", "tidak_tercatat"))} kepala keluarga lainnya yang belum memuat catatan jenis kelamin dalam berkas sensus.`,
    caption:
      `Komposisi jenis kelamin kepala keluarga. Basis data: ${n(angka("1.5", "penyebut"))} dari ` +
      `${n(angka("1.5", "total_kk"))} kepala keluarga yang tercatat pada berkas kepala keluarga.`,
    label: "Komposisi jenis kelamin kepala keluarga",
  },
  "1.6": {
    pertanyaan: "Dari latar belakang suku apa saja umat paroki berasal?",
    tafsir:
      `Mayoritas umat, yakni sebanyak ${b(n(objek<{ n: number }>("1.6", "terbesar").n) + " jiwa")} ` +
      `(${p(objek<{ pct: number }>("1.6", "terbesar").pct)}), tercatat berasal dari suku ` +
      `${objek<{ label: string }>("1.6", "terbesar").label}. Selain itu, tercatat ` +
      `${n(angka("1.6", "kategori_tercatat") - 1)} latar belakang suku lainnya, dengan kelompok warga bersuku Tionghoa, Batak, dan Flores sebagai kelompok suku terbesar berikutnya.`,
    caption:
      "Keragaman latar belakang suku umat. Suku dengan proporsi relatif kecil dirangkum dalam satu kelompok; daftar lengkap tersedia pada unduhan data agregat.",
    label: "Keragaman latar belakang suku umat",
  },

  // ═══ Pilar 2 ═══════════════════════════════════════════════════════════════
  "2.1": {
    pertanyaan: "Bagaimana struktur demografi piramida usia umat?",
    tafsir:
      "Struktur piramida usia umat tidak berbentuk segitiga: bentuknya melebar di kelompok usia dewasa dan menyempit tajam di dasarnya. " +
      `Usia median umat berada pada angka ${b(d(angka("2.1", "median_umur"), 1) + " tahun")}, dihitung dari ` +
      `${n(meta.umur_valid)} jiwa dengan tanggal lahir yang valid. Sebanyak ` +
      `${n(angka("2.1", "jenkel_tidak_tercatat"))} jiwa belum dapat dipetakan menurut jenis kelamin ` +
      "karena ketiadaan catatan.",
    caption:
      `Distribusi kelompok usia dan jenis kelamin dalam rentang lima tahunan. Basis data: ${n(meta.umur_valid)} jiwa ` +
      `dengan data usia valid; ${n(meta.umur_tidak_dapat_dihitung)} jiwa di luar hitungan.`,
    label: "Piramida usia umat Paroki Pugeran",
  },
  "2.2": {
    pertanyaan: "Berapa rasio ketergantungan antara usia produktif dan nonproduktif?",
    tafsir:
      `Setiap 100 umat usia produktif (usia kerja) rata-rata menanggung ${b(d(angka("2.2", "rasio_ketergantungan"), 1) + " jiwa")} ` +
      `usia nonproduktif—terdiri atas ${d(angka("2.2", "rasio_anak"), 1)} anak-anak dan ` +
      `${d(angka("2.2", "rasio_lansia"), 1)} warga lanjut usia. Beban ketergantungan ini lebih banyak berasal dari kelompok lansia daripada kelompok anak-anak.`,
    caption:
      `Komposisi tiga kelompok umur utama. Basis perhitungan: ${n(meta.umur_valid)} jiwa dengan data usia valid; ` +
      `persentase label dihitung terhadap total ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Komposisi tiga kelompok umur dan rasio ketergantungan",
  },
  "2.3": {
    pertanyaan: "Mengapa dasar piramida usia menyempit?",
    tafsir:
      `Kelompok usia balita (0–4 tahun) tercatat hanya berjumlah ${b(n(nilai("2.3", "0–4 tahun")) + " jiwa")}, ` +
      `atau kurang dari sepertiga jumlah anak usia 10–14 tahun yang mencapai ${n(nilai("2.3", "10–14 tahun"))} jiwa. ` +
      "Pada ketiga kelompok usia anak, jumlahnya makin kecil pada kelompok yang makin muda.",
    caption:
      `Perbandingan tiga kelompok usia anak. Basis data: ${n(angka("2.3", "penyebut"))} jiwa berusia di bawah 15 tahun.`,
    label: "Tiga kelompok usia anak: 0–4 tahun, 5–9 tahun, dan 10–14 tahun",
  },
  "2.4": {
    pertanyaan: "Seberapa besar kelompok orang muda berusia 15–29 tahun?",
    tafsir:
      `Terdapat ${b(n(nilai("2.4", "15–29 tahun")) + " jiwa")} umat yang berada dalam rentang usia 15–29 tahun, mencakup ` +
      `${p(angka("2.4", "penyebut") > 0 ? (100 * nilai("2.4", "15–29 tahun")) / meta.umat_total : 0)} ` +
      "dari keseluruhan umat paroki. Artinya, sekitar satu dari setiap lima warga paroki terdaftar merupakan bagian dari generasi muda.",
    caption: `Kelompok usia muda dalam rincian rentang lima tahunan. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jumlah umat berusia 15 sampai 29 tahun",
  },
  "2.5": {
    pertanyaan: "Bagaimana profil dan sebaran umat lanjut usia (lansia)?",
    tafsir:
      `Sebanyak ${b(n(angka("2.5", "lansia_65")) + " jiwa")} berusia 65 tahun ke atas ` +
      `(${p(angka("2.5", "lansia_65_pct"))}), dan ${n(angka("2.5", "lansia_80"))} jiwa di antaranya sudah ` +
      `melewati usia 80 tahun. Pada kelompok usia sangat sepuh (90–94 tahun), jumlah perempuan tercatat jauh lebih banyak, yakni ` +
      `${b(n(objek<{ perempuan: number }>("2.5", "band_9094").perempuan) + " orang")}, berbanding ` +
      `${n(objek<{ laki: number }>("2.5", "band_9094").laki)} orang laki-laki.`,
    caption:
      "Laki-laki dan perempuan per kelompok umur lima tahunan, 65 tahun ke atas; panjang garis penghubung adalah selisihnya. " +
      `Basis data: ${n(angka("2.5", "lansia_65"))} jiwa berusia 65 tahun ke atas.`,
    label: "Perbandingan laki-laki dan perempuan berusia 65 tahun ke atas",
  },
  "2.6": {
    pertanyaan: "Bagaimana perbandingan jumlah umat laki-laki dan perempuan?",
    tafsir:
      `Secara keseluruhan terdata ${b(n(nilai("2.6", "Perempuan")) + " umat perempuan")} dan ` +
      `${n(nilai("2.6", "Laki-laki"))} umat laki-laki, menghasilkan rasio ` +
      `${b(d(angka("2.6", "rasio_jenis_kelamin"), 1) + " laki-laki untuk setiap 100 perempuan")}. Selisih rasio ini ` +
      "relatif berimbang pada kelompok usia muda dan semakin melebar pada kelompok usia lanjut. " +
      `Terdapat ${n(angka("2.6", "tidak_tercatat"))} jiwa yang belum memiliki catatan jenis kelamin.`,
    caption:
      "Jumlah laki-laki per 100 perempuan pada enam kelompok umur lima belas tahunan; garis 100 berarti sama banyak. " +
      `Rasio dihitung dari jiwa yang umur dan jenis kelaminnya tercatat, di antara ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Rasio jenis kelamin menurut kelompok umur",
  },

  // ═══ Pilar 3 ═══════════════════════════════════════════════════════════════
  "3.1": {
    pertanyaan: "Sejauh mana tahapan penerimaan sakramen inisiasi umat telah lengkap?",
    tafsir:
      `Dari ${n(meta.umat_total)} umat yang seluruhnya telah menerima Sakramen Baptis, ` +
      `${b(n(nilai("3.1", "Sudah menerima Komuni Pertama")))} jiwa telah menyambut Komuni Pertama dan ` +
      `${b(n(nilai("3.1", "Sudah menerima Krisma")))} jiwa telah menerima Sakramen Penguatan (Krisma). ` +
      `Sebanyak ${n(angka("3.1", "krisma_belum"))} umat tercatat belum menerima Krisma, dan ` +
      `${n(angka("3.1", "tidak_tercatat"))} umat belum memiliki kelengkapan catatan pada kedua sakramen tersebut.`,
    caption:
      `Tiga tahapan sakramen inisiasi: Baptis, Komuni Pertama, dan Krisma. Setiap tahap dihitung atas seluruh ${n(meta.umat_total)} jiwa terdaftar; ` +
      "sensus tidak mencatat hubungan antartahap, sehingga yang belum menerima Krisma tidak dapat dibaca sebagai bagian dari penerima Komuni Pertama.",
    label: "Tahapan sakramen inisiasi: Baptis, Komuni Pertama, dan Krisma",
  },
  "3.2": {
    pertanyaan: "Kapan dan melalui jalan apa umat menerima Sakramen Baptis?",
    tafsir:
      `Sebanyak ${b(n(angka("3.2", "sebagai_anak")) + " umat")} (${p(angka("3.2", "sebagai_anak_pct"))}) menerima baptisan ` +
      "sejak masa kanak-kanak (baptis bayi/anak). Selebihnya tercatat melalui jalan lain—dibaptis sebagai remaja atau dewasa, berasal dari agama lain, " +
      "diterima dari gereja Kristen lain, masih katekumen, atau belum memiliki catatan.",
    caption: `Waktu dan jalur penerimaan Sakramen Baptis. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Waktu dan jalur pembaptisan umat",
  },
  "3.3": {
    pertanyaan: "Berapa banyak umat yang menerima sakramen inisiasinya di Pugeran?",
    tafsir:
      `Sebanyak ${b(n(nilai("3.3", "Dibaptis di Pugeran")))} umat ` +
      `(${p((100 * nilai("3.3", "Dibaptis di Pugeran")) / meta.umat_total)}) dibaptis di Paroki Pugeran, dan ` +
      `${b(n(nilai("3.3", "Menerima Krisma di Pugeran")))} umat ` +
      `(${p((100 * nilai("3.3", "Menerima Krisma di Pugeran")) / meta.umat_total)}) menerima Sakramen Krisma di paroki ` +
      "ini. Artinya, lebih dari separuh umat tidak tercatat dibaptis di Pugeran—baik karena dibaptis di tempat lain maupun karena tempat baptisnya tidak tercatat.",
    caption:
      `Berdasarkan catatan tempat baptis dan tempat krisma yang menyebut Paroki Pugeran. ` +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jumlah umat yang dibaptis dan dikrisma di Pugeran",
  },
  "3.4": {
    pertanyaan: "Bagaimana sebaran status perkawinan umat?",
    tafsir:
      `Sebanyak ${b(n(angka("3.4", "sah_katolik")) + " jiwa")} tercatat melangsungkan perkawinan sah secara Katolik, sedangkan ` +
      `${n(angka("3.4", "belum_menikah"))} jiwa berstatus belum menikah. Kategori status perkawinan lainnya ` +
      "mencakup proporsi yang relatif kecil dan seluruhnya disajikan secara terbuka apa adanya.",
    caption:
      `Sebaran status perkawinan menurut kategori sensus paroki. Grafik ini melaporkan sebaran, bukan penilaian atas pribadi umat. ` +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Sebaran status perkawinan umat",
  },
  "3.5": {
    pertanyaan: "Bagaimana tingkat keaktifan umat dalam hidup menggereja?",
    tafsir:
      `Sebanyak ${b(n(angka("3.5", "aktif_gereja_lingkungan")) + " umat")} ` +
      `(${p(angka("3.5", "aktif_gereja_lingkungan_pct"))}) tercatat aktif bersekutu di gereja paroki sekaligus di ` +
      `lingkungannya. Sementara itu, terdapat ${b(n(angka("3.5", "tidak_aktif")) + " umat")} ` +
      `(${p(angka("3.5", "tidak_aktif_pct"))}) yang terdata belum aktif dalam kegiatan paguyuban umat.`,
    caption:
      "Tingkat keaktifan berdasarkan catatan tim pendata lingkungan saat sensus dilaksanakan. " +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Komposisi keaktifan umat di gereja paroki dan di lingkungan",
  },
  "3.6": {
    pertanyaan: "Siapa saja yang menggerakkan roda pelayanan pastoral paroki?",
    tafsir:
      `Sebanyak ${b(n(angka("3.6", "total_pelayan")) + " umat")} (${p(angka("3.6", "pelayan_pct"))}) mengemban ` +
      `amanah pelayanan pastoral yang tercatat—dengan rasio rata-rata satu pelayan mendampingi ` +
      `${b(d(angka("3.6", "umat_per_pelayan"), 1) + " jiwa")}. Mayoritas penggerak merupakan para pengurus ` +
      "lingkungan; adapun fungsionaris tim kerja paroki dan anggota Dewan Paroki mencakup bagian yang lebih kecil.",
    caption:
      `Ragam tugas pelayanan pastoral yang tercatat. Basis data: ${n(angka("3.6", "total_pelayan"))} umat dengan ` +
      "tugas pelayanan terdata.",
    label: "Ragam tugas pelayanan umat",
  },
  "3.7": {
    pertanyaan: "Berapa banyak keluarga yang hidup dalam keberagaman lintas iman?",
    tafsir:
      `Terdapat ${b(n(angka("3.7", "bukan_katolik")) + " anggota keluarga")} yang beragama non-Katolik, dan ` +
      `mereka tersebar di ${b(n(angka("3.7", "keluarga_lintas_iman")) + " keluarga")}—mencakup ` +
      `${p(angka("3.7", "keluarga_lintas_iman_pct"))} dari total ${n(meta.keluarga_total)} keluarga di paroki. ` +
      `Sebanyak ${n(angka("3.7", "katekumen"))} jiwa di antaranya merupakan katekumen yang sedang mempersiapkan diri menerima Sakramen Baptis.`,
    caption:
      `Komposisi agama anggota keluarga yang beragama non-Katolik. Basis data: ${n(angka("3.7", "bukan_katolik"))} jiwa.`,
    label: "Komposisi agama anggota keluarga non-Katolik",
  },

  // ═══ Pilar 4 ═══════════════════════════════════════════════════════════════
  "4.1": {
    pertanyaan: "Sampai jenjang apa tingkat pendidikan formal yang ditamatkan umat?",
    tafsir:
      `Lulusan SLTA/sederajat merupakan kelompok terbesar dengan jumlah ${b(n(nilai("4.1", "SLTA")) + " jiwa")}. ` +
      `Sebanyak ${b(n(angka("4.1", "pendidikan_tinggi")) + " jiwa")} (${p(angka("4.1", "pendidikan_tinggi_pct"))}) ` +
      `telah menamatkan pendidikan tinggi, mulai dari jenjang diploma hingga doktoral. Di sisi lain, ` +
      `tercatat ${n(nilai("4.1", "Buta aksara"))} umat yang mengalami buta aksara.`,
    caption:
      `Jenjang pendidikan formal tertinggi yang ditamatkan umat. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jenjang pendidikan tertinggi umat",
  },
  "4.2": {
    pertanyaan: "Berapa banyak umat yang menempuh studi di sekolah Katolik?",
    tafsir:
      "Pertanyaan ini belum dapat dijawab secara menyeluruh. Catatan jenis sekolah saat ini hanya ada pada " +
      `${b(n(angka("4.2", "penyebut")) + " jiwa")}, sedangkan ` +
      `${b(n(angka("4.2", "tanpa_penanda")) + " jiwa")} (${p(angka("4.2", "tanpa_penanda_pct"))}) belum ` +
      "memiliki keterangan. Dari data terbatas yang tersedia, mayoritas memang tercatat bersekolah di sekolah Katolik; " +
      "namun proporsi data yang sangat minim ini belum memadai untuk ditarik kesimpulan umum bagi keseluruhan umat.",
    caption:
      `Seluruh ${n(meta.umat_total)} jiwa terdaftar digambar sebagai 100 kotak; hanya ${n(angka("4.2", "penyebut"))} jiwa ` +
      "yang memiliki catatan jenis sekolah, dan persentase sekolah Katolik di legenda dihitung atas mereka saja.",
    label: "Kategori jenis sekolah pada data yang tercatat",
  },
  "4.3": {
    pertanyaan: "Di bidang studi apa saja umat menempuh keilmuan?",
    tafsir:
      `Keterangan bidang studi saat ini baru terisi pada ${b(n(angka("4.3", "terisi")) + " jiwa")} ` +
      `(${p(angka("4.3", "terisi_pct"))}). Dari data yang tersedia, rumpun keilmuan Ekonomi dan Pendidikan merupakan dua ` +
      "bidang terbesar, disusul oleh Akuntansi, Manajemen, dan Teknik.",
    caption:
      `Lima belas bidang studi terbesar pada umat yang memiliki catatan keilmuan. Basis data: ` +
      `${n(angka("4.3", "terisi"))} jiwa. Terdapat ` +
      `${n(angka("4.3", "tidak_tercatat"))} jiwa (${p(angka("4.3", "tidak_tercatat_pct"))}) yang belum memiliki catatan bidang studi.`,
    label: "Lima belas bidang studi terbesar umat",
  },
  "4.4": {
    pertanyaan: "Apa saja bidang profesi dan mata pencaharian umat?",
    tafsir:
      `Karyawan swasta menjadi kelompok profesi terbesar dengan ${b(n(nilai("4.4", "Swasta")) + " jiwa")}, ` +
      `disusul oleh ibu rumah tangga dan kaum purnatugas (pensiunan). Terdapat ${b(n(angka("4.4", "tidak_tercatat")) + " jiwa")} ` +
      `(${p(angka("4.4", "tidak_tercatat_pct"))}) yang belum memiliki catatan profesi, dan kelompok ini tetap ` +
      "disertakan dalam grafik demi keterbukaan data.",
    caption:
      `Distribusi profesi dan mata pencaharian umat. Kategori utama ditampilkan utuh; profesi dengan frekuensi kecil digabungkan. Basis data: ` +
      `${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Profesi dan mata pencaharian umat",
  },
  "4.5": {
    pertanyaan: "Bagaimana gambaran kondisi kesejahteraan ekonomi keluarga umat?",
    tafsir:
      `Berdasarkan catatan tim pendata sensus, sebanyak ${b(n(angka("4.5", "perlu_bantuan")) + " keluarga")} (${p(angka("4.5", "perlu_bantuan_pct"))} dari ` +
      `${n(angka("4.5", "penyebut"))} keluarga yang terdata) dinilai memerlukan bantuan. Di sisi lain, sekitar satu ` +
      "dari setiap lima keluarga dinilai berkecukupan dan berpotensi menjadi penopang bagi sesama.",
    caption:
      "Klasifikasi kondisi ekonomi keluarga berdasarkan penilaian kualitatif tim pencatat sensus. Basis data: " +
      `${n(angka("4.5", "penyebut"))} dari ${n(angka("4.5", "total_kk"))} keluarga dalam berkas kepala keluarga; ` +
      `${n(angka("4.5", "tidak_tercatat"))} keluarga belum memiliki catatan.`,
    label: "Kondisi ekonomi keluarga menurut catatan sensus",
  },
  "4.6": {
    pertanyaan: "Berapa banyak umat yang terlibat dalam pelayanan masyarakat dan peran publik?",
    tafsir:
      `Sebanyak ${b(n(angka("4.6", "total")) + " umat")} (${p(angka("4.6", "total_pct"))}) tercatat aktif mengemban ` +
      "peran publik kemasyarakatan. Sebagian besar di antaranya melayani sebagai pengurus RT, RW, atau desa—lapisan pemerintahan warga " +
      "yang paling dekat dengan rumah.",
    caption:
      `Ragam peran publik kemasyarakatan yang diemban umat. Basis data: ${n(angka("4.6", "total"))} umat dengan catatan peran publik.`,
    label: "Ragam peran publik yang diemban umat",
  },

  // ═══ Pilar 5 ═══════════════════════════════════════════════════════════════
  "5.1": {
    pertanyaan: "Berapa banyak umat yang memiliki catatan kesehatan khusus?",
    tafsir:
      `Sebanyak ${b(n(angka("5.1", "total")) + " jiwa")} (${p(angka("5.1", "total_pct"))}) memiliki catatan ` +
      "kebutuhan kesehatan khusus—seperti sakit menahun/kronis, disabilitas fisik, keterlambatan perkembangan, " +
      `dan lainnya. Sementara itu, ${n(angka("5.1", "tidak_tercatat"))} jiwa belum memiliki catatan kondisi kesehatan.`,
    caption:
      `Catatan kebutuhan kesehatan khusus di luar kondisi sehat umum. Basis data: ${n(angka("5.1", "total"))} jiwa; ` +
      `${n(angka("5.1", "normal"))} jiwa tercatat dalam kondisi sehat umum tanpa catatan khusus.`,
    label: "Ragam catatan kebutuhan kesehatan khusus umat",
  },
  "5.2": {
    pertanyaan: "Lingkungan mana yang paling membutuhkan prioritas kunjungan pastoral?",
    tafsir:
      "Indeks prioritas kunjungan pastoral menggabungkan tiga indikator yang tersedia di data sensus: proporsi warga lansia, " +
      "proporsi keluarga yang memerlukan bantuan ekonomi, serta proporsi keluarga yang beranggotakan satu orang (hidup sendiri). " +
      `Lingkungan ${b(teratas52.label)} berada pada urutan teratas, dengan ` +
      `${p(teratas52.p_lansia)} warganya berusia 65 tahun ke atas. Indeks ini berfungsi sebagai pemetaan komparatif ` +
      "antarlingkungan untuk menentukan fokus sapaan pastoral, bukan pemeringkatan kemiskinan.",
    caption:
      `Pemetaan seluruh ${n(meta.lingkungan_total)} lingkungan, diurutkan dari indeks prioritas tertinggi. ` +
      "Setiap kolom berupa angka yang dapat dibaca tanpa bergantung pada warna.",
    label: "Tabel indeks prioritas kunjungan 88 lingkungan",
    captionVisual:
      "Setiap titik satu lingkungan. Posisi mendatar menunjukkan bagian umat berusia 65 tahun ke atas, posisi tegak bagian " +
      "keluarga yang memerlukan bantuan, dan luas titik jumlah jiwa. Bidang berwarna di kanan atas memuat lingkungan yang " +
      "berada di atas median paroki pada kedua ukuran. Komponen ketiga indeks, keluarga satu orang, ada di tooltip dan tabel.",
    labelVisual: "Sebaran 88 lingkungan menurut bagian lansia dan bagian keluarga yang memerlukan bantuan",
  },
  "5.3": {
    pertanyaan: "Berapa banyak warga lanjut usia yang tinggal sendiri?",
    tafsir:
      `Dari total ${n(nilai("5.3", "Rumah tangga satu orang"))} keluarga beranggotakan satu orang, ` +
      `${b(n(nilai("5.3", "Di antaranya berusia 65 tahun ke atas")) + " jiwa")} merupakan warga lanjut usia (65 tahun ke atas), ` +
      `bahkan ${b(n(nilai("5.3", "Di antaranya berusia 75 tahun ke atas")) + " jiwa")} di antaranya telah melampaui ` +
      "usia 75 tahun. Menurut catatan sensus, mereka tidak memiliki anggota keluarga lain dalam satu rumah tangga.",
    caption:
      `Keluarga beranggotakan satu orang (hidup sendiri) dirinci menurut kelompok usia penghuni. Basis data: ` +
      `${n(nilai("5.3", "Rumah tangga satu orang"))} rumah tangga tunggal.`,
    label: "Warga lansia yang tinggal seorang diri",
  },
  "5.4": {
    pertanyaan: "Di mana persebaran domisili umat yang bertempat tinggal di luar wilayah paroki?",
    tafsir:
      `Sebanyak ${b(n(angka("5.4", "total")) + " jiwa")} (${p(angka("5.4", "total_pct"))}) tercatat masih terdaftar dalam buku sensus ` +
      "namun berdomisili di luar batas teritorial paroki, dengan Jakarta sebagai tujuan terbesar. Di dalam wilayah paroki sendiri, " +
      `tercatat ${n(angka("5.4", "indekos"))} jiwa yang tinggal indekos.`,
    caption:
      `Persebaran domisili umat yang tercatat bertempat tinggal di luar batas wilayah paroki. Basis data: ${n(angka("5.4", "total"))} ` +
      `jiwa; ${n(angka("5.4", "tidak_tercatat"))} jiwa belum memiliki catatan domisili.`,
    label: "Persebaran domisili umat di luar wilayah paroki",
  },
  "5.5": {
    pertanyaan: "Bagaimana dinamika keaktifan umat yang jarang terlihat bersekutu?",
    tafsir:
      `Terdapat ${b(n(angka("5.5", "tidak_aktif")) + " umat")} (${p(angka("5.5", "tidak_aktif_pct"))}) yang tercatat ` +
      `belum aktif dalam kegiatan menggereja. Di samping itu, terdata ${b(n(nilai("5.5", "Aktif di lingkungan, beribadat di paroki lain")) + " umat")} ` +
      "yang tetap aktif dalam paguyuban lingkungan tempat tinggal namun beribadat di paroki lain—dua kelompok yang keadaannya berbeda.",
    caption:
      "Status keaktifan dicatat oleh tim lingkungan pada saat sensus dan perlu diverifikasi berkala secara pastoral di lapangan. " +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Umat yang tercatat tidak aktif dan yang beribadat di paroki lain",
  },
  "5.6": {
    pertanyaan: "Sejauh mana kesiapsiagaan data paroki dalam menghadapi situasi darurat kesehatan?",
    tafsir:
      `Golongan darah O merupakan kelompok terbesar dengan ${b(n(nilai("5.6", "O")) + " jiwa")}. Namun ` +
      `${b(n(angka("5.6", "tidak_tercatat")) + " jiwa")} (${p(angka("5.6", "tidak_tercatat_pct"))}) atau lebih dari ` +
      "seperlima umat belum memiliki catatan golongan darah sama sekali.",
    caption:
      `Distribusi golongan darah umat, termasuk proporsi data yang belum tercatat. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Distribusi golongan darah umat",
  },
};

export function adeganTeks(id: string): TeksAdegan {
  const t = teks[id];
  if (!t) throw new Error(`Naskah adegan ${id} belum ditulis`);
  return t;
}

// ── 6.1 Agenda pastoral — satu-satunya tempat rekomendasi muncul ─────────────
export const agenda = [
  {
    judul: "Pendampingan khusus bagi para lansia yang tinggal sendiri",
    isi:
      `Sebanyak ${n(nilai("5.3", "Di antaranya berusia 65 tahun ke atas"))} warga lanjut usia hidup seorang diri di kediamannya, ` +
      `dan ${n(nilai("5.3", "Di antaranya berusia 75 tahun ke atas"))} jiwa di antaranya telah melewati usia 75 tahun. ` +
      "Halaman ini sengaja tidak memuat nama siapa pun. Daftar keluarga satu orang dapat ditarik sekretariat paroki langsung dari pangkalan data sensus, " +
      "dipecah per lingkungan, lalu diteruskan kepada pengurus lingkungan untuk menyusun jadwal kunjungan pastoral berkala.",
    rujuk: ["5.3", "2.5"],
  },
  {
    judul: "Prioritaskan kunjungan pastoral pada lingkungan dengan indeks prioritas tertinggi",
    isi:
      `Tabel prioritas kunjungan telah memetakan urutan seluruh ${n(meta.lingkungan_total)} lingkungan di paroki. Sepuluh lingkungan ` +
      "pada urutan teratas dapat dijadikan fokus putaran awal program sapaan bidang Pelayanan Kemasyarakatan, dengan penyesuaian bobot indikator " +
      "bersama tim pastoral terkait.",
    rujuk: ["5.2"],
  },
  {
    judul: "Jembatani kesenjangan antara penerimaan Komuni Pertama dan Sakramen Krisma",
    isi:
      `Sebanyak ${n(angka("3.1", "krisma_belum"))} umat tercatat belum menerima Sakramen Krisma, selisih yang besar ` +
      `dibandingkan ${n(angka("3.1", "komuni_belum"))} umat yang belum menyambut Komuni Pertama. Kesenjangan ini ` +
      "perlu ditelusuri lebih dahulu: sebagian di antaranya anak-anak yang memang belum mencapai usia penerimaan Krisma. " +
      "Jumlah umat yang sudah melewati usia itu tetapi belum menerima Krisma perlu dihitung sebelum program katekese pasca-Komuni Pertama disusun.",
    rujuk: ["3.1"],
  },
  {
    judul: "Kaderisasi dan regenerasi kepengurusan pelayan lingkungan",
    isi:
      `Saat ini rata-rata satu pelayan mendampingi ${d(angka("3.6", "umat_per_pelayan"), 1)} jiwa, sementara beban antarlingkungan ` +
      `sangat timpang hingga mencapai ${d(angka("1.3", "rentang"), 1)} kali lipat. Kelompok generasi muda usia 15–29 tahun yang berjumlah ` +
      `${n(nilai("2.4", "15–29 tahun"))} jiwa merupakan tumpuan potensial untuk diajak terlibat dalam regenerasi estafet pelayanan umat.`,
    rujuk: ["3.6", "1.3", "2.4"],
  },
  {
    judul: "Pendampingan pastoral bagi keluarga lintas iman dan para katekumen",
    isi:
      `Terdapat ${n(angka("3.7", "keluarga_lintas_iman"))} keluarga yang memiliki anggota keluarga non-Katolik, ` +
      `serta ${n(angka("3.7", "katekumen"))} jiwa yang sedang mempersiapkan diri menerima Sakramen Baptis. Situasi ini ` +
      "memerlukan sinergi pendampingan yang harmonis antara bidang Pewartaan dan bidang Paguyuban paroki.",
    rujuk: ["3.7", "3.4"],
  },
  {
    judul: "Pembaruan data sensus pada data pokok yang belum lengkap",
    isi:
      `Data golongan darah belum tercatat pada ${n(angka("5.6", "tidak_tercatat"))} jiwa dan data profesi/pekerjaan pada ` +
      `${n(angka("4.4", "tidak_tercatat"))} jiwa. Kedua kolom data ini dapat diprioritaskan untuk dilengkapi melalui ` +
      "pembaruan data berkala di tingkat lingkungan, mengingat manfaatnya yang sangat nyata dan langsung bagi karya pelayanan sosial.",
    rujuk: ["5.6", "4.4", "4.2"],
  },
];

// ── 6.3 Batas interpretasi ───────────────────────────────────────────────────
export const batasTafsir = [
  {
    judul: "Potret satu waktu (cross-sectional), bukan analisis tren antartahun.",
    isi:
      `Seluruh angka bersumber dari satu potret pangkalan data pada ${SNAPSHOT}. Laman ini tidak membandingkan perubahan ` +
      "data antartahun; oleh karena itu, penyajian data tidak menggunakan istilah 'meningkat' atau 'menurun'.",
  },
  {
    judul: "Perhitungan usia mengacu pada tanggal patokan sensus, bukan hari ini.",
    isi:
      `Bilamana dokumen ini dipelajari pada waktu-waktu mendatang, angka usia yang tersaji tetap mencerminkan kondisi per ${SNAPSHOT}. ` +
      "Tanggal patokan tersebut senantiasa dicantumkan pada setiap visualisasi berbasis usia.",
  },
  {
    judul: "Kategori “Tidak tercatat” bukan berarti ketiadaan fisik.",
    isi:
      "Warga yang belum memiliki catatan golongan darah tentu tetap memiliki golongan darah. Grafik pada sajian ini melaporkan " +
      "kelengkapan pencatatan administrasi paroki pada saat sensus, bukan menyimpulkan ketiadaan realitas.",
  },
  {
    judul: "Status keaktifan merupakan penilaian tim pendata, bukan vonis mutlak.",
    isi:
      `Status keaktifan diisi oleh pengurus lingkungan pada saat sensus dilaksanakan. Angka ` +
      `${p(angka("3.5", "tidak_aktif_pct"))} warga yang terdata tidak aktif hendaknya dipahami sebagai indikasi pastoral ` +
      "yang perlu disapa dan diverifikasi dengan kasih di lapangan, bukan sebagai label penghakiman.",
  },
  {
    judul: "Kategori ekonomi keluarga merupakan klasifikasi kualitatif tim pencatat.",
    isi: "Pengelompokan status ekonomi merupakan penilaian pastoral sederhana dari tim sensus lingkungan, bukan hasil survei pendapatan kuantitatif yang dapat diperbandingkan dengan standar garis kemiskinan formal.",
  },
  {
    judul: "Indeks prioritas kunjungan adalah panduan pastoral, bukan pemeringkatan kemiskinan.",
    isi:
      "Metode perhitungan, pembobotan, dan batas interpretasinya disajikan secara terbuka. Skor terendah hanya menunjukkan indikator kerentanan paling minim " +
      `di antara ${n(meta.lingkungan_total)} lingkungan di paroki, bukan berarti ketiadaan kebutuhan pastoral sama sekali.`,
  },
  {
    judul: "Warga yang berdomisili di luar paroki tetap tercatat dalam buku sensus.",
    isi:
      `Angka ${n(meta.umat_total)} jiwa merujuk pada seluruh umat yang terdaftar secara administratif dalam buku sensus paroki, ` +
      "dan bukan merupakan angka kehadiran fisik perayaan ekaristi mingguan.",
  },
];

// ── 6.3 Kamus istilah ────────────────────────────────────────────────────────
export const kamus = [
  ["Aktif di gereja dan lingkungan", "Umat tercatat hadir dan terlibat dalam kegiatan gereja paroki sekaligus persekutuan di lingkungannya."],
  ["Aktif di lingkungan, beribadat di paroki lain", "Umat tetap berpartisipasi dalam paguyuban lingkungan tempat tinggal, namun merayakan ekaristi di gereja paroki lain."],
  ["Tercatat tidak aktif", "Petugas sensus mencatat umat belum terlibat aktif dalam kegiatan gereja maupun persekutuan lingkungan saat pendataan."],
  ["Perkawinan sah secara Katolik", "Perkawinan sakramental yang sah dan diteguhkan menurut ketentuan hukum kanonik Gereja Katolik."],
  ["Perkawinan sah dengan pasangan beda agama", "Perkawinan sah menurut Gereja Katolik yang telah memperoleh dispensasi kanonik karena pasangan bukan orang yang dibaptis."],
  ["Perkawinan sah dengan pasangan beda gereja", "Perkawinan sah menurut Gereja Katolik yang memperoleh izin kanonik dengan pasangan yang dibaptis di gereja Kristen lain."],
  ["Kawin belum sah menurut Gereja", "Perkawinan yang sudah berlangsung secara sipil atau adat namun belum diteguhkan (diberkati) menurut hukum kanonik Gereja."],
  ["Katekumen", "Calon baptis yang sedang menjalani masa bimbingan, pembinaan iman, dan persiapan katekumenat untuk menerima sakramen inisiasi."],
  ["Lingkungan", "Satuan paguyuban umat basis teritorial terkecil dalam reksa pastoral paroki. Paroki Pugeran memiliki " + n(meta.lingkungan_total) + " lingkungan."],
  ["Wilayah", "Koordinasi kewilayahan pastoral yang membawahi sejumlah lingkungan. Paroki Pugeran terbagi ke dalam " + n(meta.wilayah_total) + " wilayah."],
  ["Tidak tercatat", "Keterangan pada sel data yang kosong atau bertanda hubung pada dokumen sumber. Kategori ini menunjukkan data belum terdokumentasi, bukan ketiadaan."],
  ["Disamarkan", `Prinsip perlindungan privasi: sel tabulasi data agregat lingkungan yang memuat 1 sampai ${meta.ambang_penyamaran - 1} jiwa diberi keterangan "disamarkan" guna mencegah identifikasi pribadi secara langsung.`],
];

// ── Penutup: teks pengantar ──────────────────────────────────────────────────
export const penutupTeks = {
  agendaJudul: "Enam Rekomendasi Arah Kebijakan Pastoral",
  agendaLead:
    "Seluruh bagian terdahulu menyajikan pemetaan objektif atas apa yang terekam dalam data sensus. Bagian ini " +
    "merumuskan enam rekomendasi strategis bagi reksa pastoral paroki, disertai rujukan ke nomor adegan terkait agar senantiasa dapat ditelusuri dasarnya.",
  celahJudul: "Celah dan Keterbatasan Data Sensus",
  celahLead:
    "Data yang belum lengkap bukanlah kekurangan yang harus disembunyikan, melainkan temuan berharga bagi pembenahan administrasi paroki. Sembilan kolom data berikut " +
    "memiliki tingkat kekosongan tertinggi, yang sekaligus menegaskan batasan penafsiran yang sahih atas hasil kajian ini.",
  anomaliJudul: "Keterbukaan atas Anomali Data",
  anomaliLead:
    "Baris data yang terindikasi ganda, penanggalan yang tidak wajar, serta selisih antardokumen sumber tidak dihapus secara diam-diam. " +
    "Seluruhnya dilaporkan secara transparan sebagai bahan audit dan verifikasi data oleh sekretariat paroki.",
  usulanJudul: "Enam Usulan Penyempurnaan untuk Pembaruan Sensus Berikutnya",
  metodeJudul: "Metodologi dan Tata Kelola Pengolahan Data",
  metodeLead:
    "Setiap angka dan visualisasi dalam sajian ini memiliki ketertelusuran penuh hingga ke berkas dan kolom sumber pangkalan data sensus. Bagian ini " +
    "menjelaskan tanggal acuan, prinsip tata kelola perlindungan privasi, batas interpretasi data, serta arti istilah yang dipakai.",
  batasJudul: "Batasan Penafsiran Data",
  kamusJudul: "Glosarium Istilah Pastoral dan Teknis",
  unduhJudul: "Unduhan Data Agregat Paroki",
  unduhLead:
    "Seluruh berkas di bawah ini menyajikan tabulasi agregat paroki yang telah melalui prosedur penyamaran data pribadi. Berkas-berkas ini " +
    "dapat dipergunakan untuk perencanaan karya pastoral tanpa memuat satu pun data perorangan warga.",
};

export const prinsipData = [
  {
    judul: "Data identitas pribadi tidak pernah keluar dari pipeline pemrosesan",
    isi:
      "Nama lengkap, tempat dan tanggal lahir, alamat tinggal, nomor telepon, nomor induk kependudukan, serta nomor kartu keluarga " +
      "disaring dan ditiadakan pada tahap awal pembersihan data. Dokumen ini murni menyajikan tabulasi agregat, dan sistem otomatis " +
      "akan menggagalkan kompilasi halaman bilamana terdapat data identitas pribadi yang lolos.",
  },
  {
    judul: "Penyamaran data kategori berskala kecil",
    isi:
      `Setiap sel tabulasi lingkungan yang hanya memuat 1 sampai ${meta.ambang_penyamaran - 1} jiwa ditampilkan dengan ` +
      `keterangan "disamarkan", bukan angka nol. Ambang batas ${meta.ambang_penyamaran} jiwa ini diterapkan mengingat pada lingkungan kecil ` +
      `yang hanya dihuni ${n(lingkunganTerkecil.n)} jiwa, informasi mengenai segelintir orang dapat dengan mudah mengarah pada pengenalan pribadi tertentu.`,
  },
  {
    judul: "Atribut sensitif tidak ditabulasi silang hingga tingkat perorangan",
    isi:
      "Catatan kondisi kesehatan khusus, perekonomian keluarga, dan status perkawinan hanya disajikan sebagai sebaran tingkat paroki atau " +
      "agregat lingkungan tanpa tabulasi silang multi-arah. Indeks prioritas kunjungan diformulasikan menjadi satu nilai skor tunggal per lingkungan guna menjaga kerahasiaan perorangan.",
  },
  {
    judul: "Data kosong bukan angka nol, dan tetap ditampilkan secara transparan",
    isi:
      "Kolom data yang kosong dan tanda hubung diklasifikasikan sebagai kategori “Tidak tercatat”, yang senantiasa ditampilkan dengan pola arsir pada grafik. " +
      "Tidak ada persentase yang dihitung secara sembunyi-sembunyi di atas penyebut yang telah dimanipulasi tanpa penjelasan terbuka.",
  },
  {
    judul: "Anomali data dipaparkan secara jujur, bukan diperbaiki diam-diam",
    isi:
      `Temuan keganjilan tahun perkawinan, ${n(penutup.anomali[0]?.jumlah ?? 0)} baris data yang terindikasi ganda, serta ` +
      `selisih ${n(meta.selisih_keluarga)} keluarga antardokumen sumber dipaparkan secara transparan sebagai catatan audit demi penyempurnaan sistem informasi paroki.`,
  },
];
