/**
 * Seluruh naskah narasi dan takarir visualisasi data Paroki Pugeran.
 *
 * Disusun dengan Bahasa Indonesia yang alami, mengalir, dan bernuansa pastoral Katolik,
 * layak disimak oleh Pastor Kepala Paroki, Bapa Uskup, dan fungsionaris Dewan Paroki.
 *
 * Prinsip penulisan:
 *  · Satu adegan, satu pertanyaan yang jelas dan deskriptif.
 *  · Kalimat tafsir menyatakan APA YANG TERBACA dari data secara objektif dan jujur.
 *    Rekomendasi arah kebijakan pastoral dirumuskan di Bagian 6.1.
 *  · Label kategori sesuai data sensus tanpa asumsi yang melompat.
 *  · Istilah basis data mentah tidak ditampilkan apa adanya.
 *  · Persentase senantiasa menyebutkan penyebutnya jika penyebutnya bukan total 12.614 jiwa.
 *  · Tidak ada penilaian yang menghakimi status hidup umat; memandang umat dengan kasih pastoral.
 *  · TIDAK ADA ANGKA MANUAL. Setiap angka dibaca dari JSON turunan agar naskah dan grafik selaras.
 *  · Potret satu kurun waktu (cross-sectional snapshot): tidak memakai kata tren ("meningkat", "menurun", "penurunan", "tidak lagi").
 *  · Laman ini tidak memuat dan tidak menampilkan data identitas perorangan (menjaga privasi).
 */
import {
  angka, lingkunganRows, meta, nilai, objek, penutup,
} from "../lib/data";
import { d, n, p, tanggal } from "../lib/format";

const SNAPSHOT = tanggal(meta.snapshot);
const b = (s: string) => `<b>${s}</b>`;

// Baris teratas tabel prioritas kunjungan pastoral, dipakai pada kalimat tafsir adegan 5.2.
const teratas52 = lingkunganRows("5.2")[0];
if (!teratas52) throw new Error("Adegan 5.2 tidak memuat satu pun lingkungan");

// Lingkungan terkecil, dipakai untuk menjelaskan batas penyamaran data privasi.
const lingkunganTerkecil = objek<{ label: string; n: number }>("1.3", "terkecil");

// ── Pembuka ──────────────────────────────────────────────────────────────────
export const halaman = {
  judul: "Umat Pugeran dalam Angka",
  subjudul: `Potret Demografi dan Dinamika Reksa Pastoral Paroki ${meta.paroki}`,
  deskripsi:
    "Kajian profil umat Paroki Hati Kudus Tuhan Yesus Pugeran berdasarkan data sensus: " +
    "mengenal umat yang dipercayakan kepada reksa pastoral paroki serta memetakan arah pelayanan kasih Gereja.",
};

export const pembuka = {
  eyebrow: "Paroki Hati Kudus Tuhan Yesus · Pugeran, Yogyakarta",
  judul: "Potret Demografi dan Dinamika Hidup Umat Paroki Hati Kudus Tuhan Yesus Pugeran Yogyakarta",
  lead:
    `Buku sensus Paroki Pugeran mencatat ${n(meta.umat_total)} jiwa umat beriman yang terhimpun dalam ` +
    `${n(meta.keluarga_total)} keluarga. Data demografi yang sangat berharga ini selama ini tersimpan terpisah dalam berbagai berkas administrasi ` +
    "sehingga belum terbaca sebagai satu gambaran yang utuh. Sajian naratif ini merangkum data tersebut menjadi telaah pastoral yang jernih—mulai dari " +
    "pemetaan dasar persebaran umat, struktur antargenerasi, dinamika hidup sakramental, hingga perhatian khusus bagi keluarga dan pribadi yang paling membutuhkan sapaan kasih Gereja.",
  angkaLabel: ["jiwa terdaftar", "keluarga", "lingkungan", "wilayah"],
  catatan:
    `Seluruh data dalam penyajian ini merupakan potret sensus paroki pada satu kurun waktu (snapshot per 1 Februari 2019), bukan rekaman perubahan dari tahun ke tahun. ` +
    `Perhitungan usia umat mengacu pada tanggal patokan sensus, yakni ${SNAPSHOT}. ` +
    (meta.snapshot_terkonfirmasi
      ? "Tanggal patokan ini telah terkonfirmasi secara resmi oleh sekretariat paroki."
      : "Karena tanggal penarikan berkas basis data belum tercantum dalam dokumen sumber, tanggal ini digunakan sebagai patokan kerja sementara sembari menunggu verifikasi dari sekretariat paroki. Keterangan lengkap mengenai tata kelola dan pengolahan data disajikan pada bagian penutup."),
  bacaMenit: "Waktu baca: 15–20 menit",
};

// ── Babak ────────────────────────────────────────────────────────────────────
export const babak = [
  {
    id: "babak-1",
    label: "Babak I",
    judul: "Profil Demografi Umat",
    lead: "Mengenal jumlah jiwa, susunan keluarga, dan persebaran tempat tinggal umat di seluruh wilayah Paroki Pugeran.",
  },
  {
    id: "babak-2",
    label: "Babak II",
    judul: "Kehidupan Sakramen dan Karya Umat",
    lead: "Mencermati dinamika hidup menggereja, penerimaan sakramen inisiasi, serta jenjang pendidikan, profesi, dan keadaan ekonomi keluarga.",
  },
  {
    id: "babak-3",
    label: "Babak III",
    judul: "Arah Reksa Pastoral dan Prioritas Kasih",
    lead: "Memetakan umat dan keluarga yang paling membutuhkan perhatian khusus agar pelayanan kasih Gereja hadir secara nyata dan tepat sasaran.",
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
      "Sebagai pijakan karya pastoral yang kontekstual dan tepat sasaran, Dewan Paroki perlu mengenal wajah nyata umat: " +
      `berapa banyak jiwa yang digembalakan, bagaimana persebarannya, dan bagaimana susunan keluarga di ${n(meta.lingkungan_total)} lingkungan.`,
  },
  {
    no: 2,
    id: "pilar-2",
    judul: "Struktur Generasi dan Masa Depan Paroki",
    bidang: ["Pewartaan", "Paguyuban"],
    lead:
      "Piramida usia memperlihatkan perimbangan antara kelompok usia produktif dan kelompok tanggungan (anak-anak serta lansia), " +
      "keberlanjutan pendampingan iman anak, serta kehadiran kaum muda sebagai tumpuan masa depan persekutuan umat.",
  },
  {
    no: 3,
    id: "pilar-3",
    judul: "Dinamika Hidup Menggereja dan Sakramen",
    bidang: ["Liturgi & Peribadatan", "Pewartaan"],
    lead:
      "Mencermati kelengkapan penerimaan sakramen inisiasi, status perkawinan umat, keikutsertaan dalam kegiatan lingkungan, " +
      "hingga keterlibatan warga paroki dalam berbagai tugas pelayanan di gereja.",
  },
  {
    no: 4,
    id: "pilar-4",
    judul: "Pendidikan, Karya, dan Perekonomian Umat",
    bidang: ["Pelayanan Kemasyarakatan", "Pewartaan (Pendidikan)"],
    lead:
      "Memetakan jenjang pendidikan formal umat, ragam profesi dan mata pencaharian, serta " +
      "gambaran kondisi ekonomi keluarga menurut pencatatan sensus.",
  },
  {
    no: 5,
    id: "pilar-5",
    judul: "Prioritas Kasih bagi Umat yang Rentan",
    bidang: ["Pelayanan Kemasyarakatan", "Penelitian & Pengembangan"],
    lead:
      "Mengenali saudara-saudari yang paling membutuhkan perhatian pastoral khusus: para lansia yang tinggal seorang diri, " +
      "umat dengan kebutuhan kesehatan khusus, warga yang berdomisili di luar paroki, serta mereka yang belum aktif dalam kehidupan menggereja.",
  },
];

// ── Adegan ───────────────────────────────────────────────────────────────────
export interface TeksAdegan {
  pertanyaan: string;
  tafsir: string;
  caption: string;
  label: string;
  captionVisual?: string;
  labelVisual?: string;
}

const teks: Record<string, TeksAdegan> = {
  // ═══ Pilar 1 ═══════════════════════════════════════════════════════════════
  "1.1": {
    pertanyaan: "Berapa banyak jiwa dan keluarga yang terdaftar di paroki?",
    tafsir:
      `Paroki Pugeran mencatat ${b(n(meta.umat_total) + " jiwa")} yang terhimpun dalam ${b(n(meta.keluarga_total) + " keluarga")}. ` +
      `Rata-rata setiap keluarga beranggotakan ${d(angka("1.1", "rata_rata_per_keluarga"), 2)} jiwa dengan nilai tengah (median) ` +
      `${d(angka("1.1", "median_per_keluarga"), 0)} jiwa, sedangkan keluarga dengan anggota terbanyak mencapai ` +
      `${n(angka("1.1", "terbesar"))} jiwa.`,
    caption: "Gambaran umum demografi Paroki Pugeran: jumlah jiwa, jumlah keluarga, dan rata-rata anggota per keluarga.",
    label: "Profil dasar demografi Paroki Pugeran",
  },
  "1.2": {
    pertanyaan: "Bagaimana sebaran jumlah umat di setiap wilayah?",
    tafsir:
      `Wilayah ${b(objek<{ label: string }>("1.2", "tertinggi").label)} merupakan wilayah dengan jumlah umat terbanyak, yakni mencapai ` +
      `${b(n(objek<{ n: number }>("1.2", "tertinggi").n) + " jiwa")}. Sebaliknya, Wilayah ` +
      `${objek<{ label: string }>("1.2", "terendah").label} mencatat ` +
      `${n(objek<{ n: number }>("1.2", "terendah").n)} jiwa. Perbedaan antara wilayah dengan umat terbanyak dan paling sedikit mencapai ` +
      `${d(objek<{ n: number }>("1.2", "tertinggi").n / objek<{ n: number }>("1.2", "terendah").n, 1)} kali lipat.`,
    caption:
      `Proporsi jumlah umat di ${n(meta.wilayah_total)} wilayah, diurutkan dari jumlah terbesar ke terkecil dengan penanda warna ` +
      `${n(meta.kelompok.length)} kelompok kewilayahan. Sebanyak ${n(meta.baris_paroki_lain)} baris data berkode di luar paroki ` +
      "tidak disertakan dalam grafik ini dan dicatat secara terbuka pada bagian penutup.",
    label: "Sebaran jumlah umat menurut wilayah",
  },
  "1.3": {
    pertanyaan: "Seberapa besar variasi jumlah umat dan rentang beban pelayanan antarlingkungan?",
    tafsir:
      `Nilai tengah (median) jumlah umat di tingkat lingkungan adalah ${b(d(angka("1.3", "median"), 1) + " jiwa")}. ` +
      `Lingkungan dengan umat terbanyak adalah ${b(objek<{ label: string }>("1.3", "terbesar").label)} (${n(objek<{ n: number }>("1.3", "terbesar").n)} jiwa), ` +
      `sementara lingkungan dengan umat paling sedikit adalah ${objek<{ label: string }>("1.3", "terkecil").label} (${n(objek<{ n: number }>("1.3", "terkecil").n)} jiwa). ` +
      `Rentang perbedaan ini mencapai ${b(d(angka("1.3", "rentang"), 1) + " kali lipat")}—menunjukkan keragaman yang sangat besar dalam dinamika dan beban pelayanan pastoral antarlingkungan.`,
    caption:
      `Sebaran ${n(angka("1.3", "jumlah_lingkungan"))} lingkungan berdasarkan wilayah dan kelompok wilayah. ` +
      "Garis mendatar menunjukkan rentang dari lingkungan beranggota paling sedikit hingga terbanyak di wilayah tersebut; garis tegak menandai median paroki.",
    label: "Persebaran jumlah umat di 88 lingkungan",
  },
  "1.4": {
    pertanyaan: "Bagaimana pola ukuran dan jumlah anggota keluarga umat?",
    tafsir:
      `Sebanyak ${b(n(angka("1.4", "satu_orang")) + " keluarga")} (${p(angka("1.4", "satu_orang_pct"))} dari total ` +
      `${n(meta.keluarga_total)} keluarga) merupakan keluarga yang hanya beranggotakan satu orang (tinggal sendiri)—jumlah yang hampir setara ` +
      `dengan keluarga beranggotakan dua orang. Adapun keluarga dengan susunan anggota terbanyak tercatat beranggotakan ${n(angka("1.4", "terbesar"))} jiwa.`,
    caption: `Sebaran keluarga berdasarkan jumlah anggota keluarga. Basis data: ${n(meta.keluarga_total)} keluarga.`,
    label: "Sebaran jumlah anggota per keluarga",
  },
  "1.5": {
    pertanyaan: "Berapa proporsi keluarga yang dikepalai oleh perempuan?",
    tafsir:
      `Sebanyak ${b(n(angka("1.5", "perempuan")) + " keluarga")} dikepalai oleh perempuan, atau ` +
      `${p(angka("1.5", "perempuan_pct"))} dari ${n(angka("1.5", "penyebut"))} kepala keluarga yang memiliki catatan jenis kelamin. ` +
      `Selain itu, terdapat ${n(angka("1.5", "tidak_tercatat"))} kepala keluarga yang belum tercatat jenis kelaminnya dalam berkas sensus.`,
    caption:
      `Komposisi kepala keluarga menurut jenis kelamin. Basis data: ${n(angka("1.5", "penyebut"))} dari ` +
      `${n(angka("1.5", "total_kk"))} kepala keluarga yang terdaftar.`,
    label: "Komposisi jenis kelamin kepala keluarga",
  },
  "1.6": {
    pertanyaan: "Bagaimana keragaman latar belakang suku umat paroki?",
    tafsir:
      `Sebagian besar umat paroki, yakni ${b(n(objek<{ n: number }>("1.6", "terbesar").n) + " jiwa")} ` +
      `(${p(objek<{ pct: number }>("1.6", "terbesar").pct)}), tercatat berasal dari suku ` +
      `${objek<{ label: string }>("1.6", "terbesar").label}. Selain itu, terdapat ` +
      `${n(angka("1.6", "kategori_tercatat") - 1)} latar belakang suku lainnya yang memperkaya persekutuan paroki, dengan komunitas Tionghoa, Batak, dan Flores sebagai kelompok suku terbesar berikutnya.`,
    caption:
      "Keragaman suku umat paroki. Suku-suku dengan jumlah warga relatif sedikit dirangkum dalam kelompok suku lainnya; rincian lengkap tersedia pada unduhan data agregat.",
    label: "Keragaman latar belakang suku umat",
  },

  // ═══ Pilar 2 ═══════════════════════════════════════════════════════════════
  "2.1": {
    pertanyaan: "Bagaimana susunan kelompok usia dan piramida demografi umat?",
    tafsir:
      "Piramida usia umat Paroki Pugeran tidak berbentuk segitiga dengan dasar melebar, melainkan menyempit pada kelompok anak-anak serta lebih tebal pada kelompok usia produktif dan lanjut usia. " +
      `Nilai tengah (median) usia umat berada pada ${b(d(angka("2.1", "median_umur"), 1) + " tahun")}, dihitung dari ` +
      `${n(meta.umur_valid)} jiwa yang memiliki data tanggal lahir valid. Terdapat ` +
      `${n(angka("2.1", "jenkel_tidak_tercatat"))} jiwa yang belum tercatat jenis kelaminnya.`,
    caption:
      `Distribusi kelompok umur dan jenis kelamin dalam rentang lima tahunan. Basis data: ${n(meta.umur_valid)} jiwa ` +
      `dengan data usia valid; ${n(meta.umur_tidak_dapat_dihitung)} jiwa belum dapat dihitung usianya.`,
    label: "Piramida usia umat Paroki Pugeran",
  },
  "2.2": {
    pertanyaan: "Seberapa besar rasio beban tanggungan pada kelompok usia produktif?",
    tafsir:
      `Setiap 100 umat usia produktif (15–64 tahun) menanggung rata-rata ${b(d(angka("2.2", "rasio_ketergantungan"), 1) + " jiwa")} ` +
      `usia nonproduktif—terdiri atas ${d(angka("2.2", "rasio_anak"), 1)} anak-anak dan ` +
      `${d(angka("2.2", "rasio_lansia"), 1)} warga lanjut usia. Beban tanggungan pada usia produktif paroki lebih banyak berasal dari kelompok lansia daripada kelompok anak-anak.`,
    caption:
      `Komposisi tiga kelompok umur utama dan rasio ketergantungan. Basis perhitungan: ${n(meta.umur_valid)} jiwa dengan tanggal lahir valid; ` +
      `persentase dihitung terhadap total ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Komposisi kelompok umur dan rasio ketergantungan",
  },
  "2.3": {
    pertanyaan: "Bagaimana perbandingan jumlah umat pada kelompok balita, anak-anak, dan remaja awal?",
    tafsir:
      `Kelompok balita (0–4 tahun) tercatat berjumlah ${b(n(nilai("2.3", "0–4 tahun")) + " jiwa")}, ` +
      `atau kurang dari sepertiga jumlah anak usia 10–14 tahun yang mencapai ${n(nilai("2.3", "10–14 tahun"))} jiwa. ` +
      "Di antara ketiga kelompok usia anak tersebut, proporsinya tampak semakin sedikit pada rentang usia yang lebih muda.",
    caption:
      `Perbandingan tiga kelompok usia anak. Basis data: ${n(angka("2.3", "penyebut"))} jiwa berusia di bawah 15 tahun.`,
    label: "Tiga kelompok usia anak: 0–4 tahun, 5–9 tahun, dan 10–14 tahun",
  },
  "2.4": {
    pertanyaan: "Berapa banyak kaum muda berusia 15–29 tahun di paroki?",
    tafsir:
      `Tercatat ${b(n(nilai("2.4", "15–29 tahun")) + " jiwa")} kaum muda dalam rentang usia 15–29 tahun, atau mencakup ` +
      `${p(angka("2.4", "penyebut") > 0 ? (100 * nilai("2.4", "15–29 tahun")) / meta.umat_total : 0)} ` +
      "dari seluruh populasi paroki. Dengan kata lain, satu dari setiap lima umat terdaftar berada dalam kelompok usia muda.",
    caption: `Kelompok usia muda dalam rincian rentang lima tahunan. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jumlah umat berusia 15 sampai 29 tahun",
  },
  "2.5": {
    pertanyaan: "Bagaimana profil dan keberadaan umat lanjut usia (lansia)?",
    tafsir:
      `Sebanyak ${b(n(angka("2.5", "lansia_65")) + " jiwa")} berusia 65 tahun ke atas ` +
      `(${p(angka("2.5", "lansia_65_pct"))}), dan ${n(angka("2.5", "lansia_80"))} jiwa di antaranya telah ` +
      `melampaui usia 80 tahun. Pada kelompok usia sangat lanjut (90–94 tahun), jumlah perempuan tercatat jauh lebih banyak, yaitu ` +
      `${b(n(objek<{ perempuan: number }>("2.5", "band_9094").perempuan) + " orang")}, berbanding ` +
      `${n(objek<{ laki: number }>("2.5", "band_9094").laki)} orang laki-laki.`,
    caption:
      "Perbandingan laki-laki dan perempuan lanjut usia per kelompok lima tahunan (65 tahun ke atas). " +
      `Basis data: ${n(angka("2.5", "lansia_65"))} jiwa berusia 65 tahun ke atas.`,
    label: "Profil warga berusia 65 tahun ke atas",
  },
  "2.6": {
    pertanyaan: "Bagaimana perimbangan jumlah umat laki-laki dan perempuan di tiap jenjang usia?",
    tafsir:
      `Secara keseluruhan terdata ${b(n(nilai("2.6", "Perempuan")) + " umat perempuan")} dan ` +
      `${n(nilai("2.6", "Laki-laki"))} umat laki-laki, menghasilkan rasio ` +
      `${b(d(angka("2.6", "rasio_jenis_kelamin"), 1) + " laki-laki per 100 perempuan")}. Perimbangan ini ` +
      "relatif seimbang pada kelompok usia muda, namun proporsi perempuan semakin dominan seiring bertambahnya usia, terutama pada kelompok lansia. " +
      `Terdapat ${n(angka("2.6", "tidak_tercatat"))} jiwa yang belum memiliki catatan jenis kelamin.`,
    caption:
      "Rasio jumlah laki-laki per 100 perempuan pada enam kelompok usia lima belas tahunan; garis 100 menandai jumlah seimbang. " +
      `Dihitung dari warga dengan data usia dan jenis kelamin lengkap, di antara total ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Rasio jenis kelamin menurut kelompok umur",
  },

  // ═══ Pilar 3 ═══════════════════════════════════════════════════════════════
  "3.1": {
    pertanyaan: "Bagaimana kelengkapan penerimaan sakramen inisiasi umat?",
    tafsir:
      `Dari ${n(meta.umat_total)} umat yang seluruhnya telah menerima Sakramen Baptis, tercatat ` +
      `${b(n(nilai("3.1", "Sudah menerima Komuni Pertama")))} jiwa telah menyambut Komuni Pertama dan ` +
      `${b(n(nilai("3.1", "Sudah menerima Krisma")))} jiwa telah menerima Sakramen Penguatan (Krisma). ` +
      `Sebanyak ${n(angka("3.1", "krisma_belum"))} umat tercatat belum menerima Krisma, dan ` +
      `${n(angka("3.1", "tidak_tercatat"))} umat belum memiliki kelengkapan catatan sakramen.`,
    caption:
      `Tiga tahapan sakramen inisiasi: Baptis, Komuni Pertama, dan Krisma. Masing-masing dihitung atas seluruh ${n(meta.umat_total)} jiwa terdaftar; ` +
      "data sensus mencatat status tiap sakramen secara terpisah, sehingga mereka yang belum menerima Krisma tidak otomatis tercatat sebagai penerima Komuni Pertama.",
    label: "Tahapan penerimaan sakramen inisiasi: Baptis, Komuni Pertama, dan Krisma",
  },
  "3.2": {
    pertanyaan: "Bagaimana latar belakang penerimaan Sakramen Baptis umat?",
    tafsir:
      `Sebanyak ${b(n(angka("3.2", "sebagai_anak")) + " umat")} (${p(angka("3.2", "sebagai_anak_pct"))}) menerima ` +
      "Baptis Bayi / Anak sejak masa kanak-kanak. Selebihnya menerima Sakramen Baptis saat usia remaja atau dewasa, diterima dari gereja Kristen lain, " +
      "berasal dari agama lain, masih berstatus katekumen, atau belum memiliki catatan lengkap.",
    caption: `Waktu dan latar belakang penerimaan Sakramen Baptis. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Latar belakang penerimaan Sakramen Baptis umat",
  },
  "3.3": {
    pertanyaan: "Berapa banyak umat yang menerima sakramen inisiasi di Paroki Pugeran?",
    tafsir:
      `Sebanyak ${b(n(nilai("3.3", "Dibaptis di Pugeran")))} umat ` +
      `(${p((100 * nilai("3.3", "Dibaptis di Pugeran")) / meta.umat_total)}) dibaptis di Paroki Pugeran, dan ` +
      `${b(n(nilai("3.3", "Menerima Krisma di Pugeran")))} umat ` +
      `(${p((100 * nilai("3.3", "Menerima Krisma di Pugeran")) / meta.umat_total)}) menerima Sakramen Krisma di paroki ini. ` +
      "Dengan demikian, lebih dari separuh umat menerima sakramen inisiasi di paroki lain atau belum memiliki kelengkapan catatan tempat penerimaannya.",
    caption:
      `Umat dengan catatan tempat baptis dan tempat krisma yang menyebut Paroki Pugeran. ` +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jumlah umat yang dibaptis dan dikrisma di Paroki Pugeran",
  },
  "3.4": {
    pertanyaan: "Bagaimana sebaran status perkawinan umat menurut hukum Gereja?",
    tafsir:
      `Sebanyak ${b(n(angka("3.4", "sah_katolik")) + " jiwa")} tercatat hidup dalam perkawinan sah secara Katolik, sedangkan ` +
      `${n(angka("3.4", "belum_menikah"))} jiwa berstatus belum menikah. Status perkawinan lainnya ` +
      "(seperti perkawinan sah beda agama dengan dispensasi, perkawinan beda gereja dengan izin, maupun yang belum diberkati secara kanonik) " +
      "mencakup bagian yang lebih kecil, namun menjadi sasaran penting bagi pendampingan reksa pastoral keluarga.",
    caption:
      `Sebaran status perkawinan menurut pencatatan sensus paroki. Sajian ini memetakan kondisi administratif pastoral tanpa menghakimi pribadi umat. ` +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Sebaran status perkawinan umat",
  },
  "3.5": {
    pertanyaan: "Bagaimana tingkat keaktifan umat dalam kehidupan menggereja?",
    tafsir:
      `Sebanyak ${b(n(angka("3.5", "aktif_gereja_lingkungan")) + " umat")} ` +
      `(${p(angka("3.5", "aktif_gereja_lingkungan_pct"))}) tercatat aktif dalam peribadatan di gereja paroki sekaligus di ` +
      `lingkungannya. Di sisi lain, terdapat ${b(n(angka("3.5", "tidak_aktif")) + " umat")} ` +
      `(${p(angka("3.5", "tidak_aktif_pct"))}) yang terdata belum aktif dalam kegiatan menggereja maupun paguyuban lingkungan.`,
    caption:
      "Tingkat keaktifan berdasarkan pencatatan tim pendata lingkungan pada saat sensus. " +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Tingkat keaktifan umat di gereja paroki dan di lingkungan",
  },
  "3.6": {
    pertanyaan: "Berapa banyak umat yang mengemban tugas pelayanan pastoral di paroki?",
    tafsir:
      `Sebanyak ${b(n(angka("3.6", "total_pelayan")) + " umat")} (${p(angka("3.6", "pelayan_pct"))}) tercatat mengemban ` +
      `tugas pelayanan pastoral—dengan rasio rata-rata satu pelayan mendampingi ` +
      `${b(d(angka("3.6", "umat_per_pelayan"), 1) + " jiwa")}. Sebagian besar dari mereka melayani sebagai pengurus ` +
      "lingkungan (88,8%), sementara fungsionaris tim kerja paroki dan Dewan Paroki mencakup proporsi selebihnya.",
    caption:
      `Ragam tugas pelayanan pastoral yang tercatat. Basis data: ${n(angka("3.6", "total_pelayan"))} umat dengan ` +
      "catatan tugas pelayanan.",
    label: "Ragam tugas pelayanan umat",
  },
  "3.7": {
    pertanyaan: "Berapa banyak keluarga paroki yang hidup dalam keberagaman agama?",
    tafsir:
      `Terdapat ${b(n(angka("3.7", "bukan_katolik")) + " anggota keluarga")} yang beragama non-Katolik, yang tersebar di ` +
      `${b(n(angka("3.7", "keluarga_lintas_iman")) + " keluarga")}—mencakup ` +
      `${p(angka("3.7", "keluarga_lintas_iman_pct"))} dari total ${n(meta.keluarga_total)} keluarga di paroki. ` +
      `Sebanyak ${n(angka("3.7", "katekumen"))} jiwa di antaranya merupakan katekumen yang sedang mempersiapkan diri menyambut Sakramen Baptis.`,
    caption:
      `Komposisi agama anggota keluarga yang beragama non-Katolik. Basis data: ${n(angka("3.7", "bukan_katolik"))} jiwa.`,
    label: "Komposisi agama anggota keluarga non-Katolik",
  },

  // ═══ Pilar 4 ═══════════════════════════════════════════════════════════════
  "4.1": {
    pertanyaan: "Bagaimana profil jenjang pendidikan formal yang ditamatkan umat?",
    tafsir:
      `Lulusan SLTA/sederajat merupakan kelompok terbesar dengan jumlah ${b(n(nilai("4.1", "SLTA")) + " jiwa")}. ` +
      `Sebanyak ${b(n(angka("4.1", "pendidikan_tinggi")) + " jiwa")} (${p(angka("4.1", "pendidikan_tinggi_pct"))}) ` +
      `telah menyelesaikan pendidikan tinggi, mulai dari jenjang diploma hingga sarjana dan pascasarjana. Di sisi lain, ` +
      `tercatat ${n(nilai("4.1", "Buta aksara"))} jiwa yang belum melek aksara.`,
    caption:
      `Jenjang pendidikan formal tertinggi yang diselesaikan umat. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jenjang pendidikan tertinggi umat",
  },
  "4.2": {
    pertanyaan: "Berapa banyak umat yang menempuh pendidikan di sekolah Katolik?",
    tafsir:
      "Data sensus saat ini belum memadai untuk menjawab pertanyaan ini secara menyeluruh. Catatan mengenai jenis sekolah baru terisi pada " +
      `${b(n(angka("4.2", "penyebut")) + " jiwa")}, sedangkan ` +
      `${b(n(angka("4.2", "tanpa_penanda")) + " jiwa")} (${p(angka("4.2", "tanpa_penanda_pct"))}) belum ` +
      "memiliki keterangan. Dari data terbatas yang tersedia, mayoritas memang tercatat bersekolah di sekolah Katolik, " +
      "namun angka ini belum dapat digeneralisasi untuk menggambarkan keseluruhan paroki.",
    caption:
      `Seluruh ${n(meta.umat_total)} jiwa terdaftar digambarkan sebagai 100 kotak; hanya ${n(angka("4.2", "penyebut"))} jiwa ` +
      "yang memiliki catatan jenis sekolah, dan persentase sekolah Katolik dihitung dari kelompok yang tercatat ini.",
    label: "Kategori jenis sekolah pada data yang tercatat",
  },
  "4.3": {
    pertanyaan: "Apa saja rumpun bidang studi dan keilmuan yang ditekuni umat?",
    tafsir:
      `Catatan bidang studi saat ini baru terisi pada ${b(n(angka("4.3", "terisi")) + " jiwa")} ` +
      `(${p(angka("4.3", "terisi_pct"))}). Dari data yang terhimpun, bidang Ekonomi dan Pendidikan merupakan dua ` +
      "rumpun terbesar, disusul oleh Akuntansi, Manajemen, dan Teknik.",
    caption:
      `Lima belas bidang studi terbesar pada umat yang memiliki catatan keilmuan. Basis data: ` +
      `${n(angka("4.3", "terisi"))} jiwa. Sebanyak ` +
      `${n(angka("4.3", "tidak_tercatat"))} jiwa (${p(angka("4.3", "tidak_tercatat_pct"))}) belum memiliki catatan bidang studi.`,
    label: "Lima belas bidang studi terbesar umat",
  },
  "4.4": {
    pertanyaan: "Apa saja ragam profesi dan mata pencaharian umat paroki?",
    tafsir:
      `Karyawan swasta menjadi kelompok profesi terbesar dengan ${b(n(nilai("4.4", "Swasta")) + " jiwa")}, ` +
      `disusul oleh ibu rumah tangga dan pensiunan/purnatugas. Terdapat ${b(n(angka("4.4", "tidak_tercatat")) + " jiwa")} ` +
      `(${p(angka("4.4", "tidak_tercatat_pct"))}) yang belum terdokumentasi profesinya, dan kelompok ini tetap ` +
      "disertakan dalam grafik demi penyajian data yang jujur dan utuh.",
    caption:
      `Distribusi profesi dan mata pencaharian warga paroki. Kategori utama disajikan utuh; profesi dengan jumlah sedikit digabungkan. Basis data: ` +
      `${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Profesi dan mata pencaharian umat",
  },
  "4.5": {
    pertanyaan: "Bagaimana gambaran kondisi ekonomi keluarga umat?",
    tafsir:
      `Berdasarkan pencatatan tim pendata lingkungan, sebanyak ${b(n(angka("4.5", "perlu_bantuan")) + " keluarga")} (${p(angka("4.5", "perlu_bantuan_pct"))} dari ` +
      `${n(angka("4.5", "penyebut"))} keluarga yang terdata) dinilai memerlukan bantuan. Di sisi lain, sekitar satu ` +
      "dari setiap lima keluarga tergolong berkecukupan dan berpotensi menjadi penopang solidaritas bagi sesama yang membutuhkan uluran tangan.",
    caption:
      "Klasifikasi kondisi ekonomi keluarga berdasarkan penilaian kualitatif tim pendata sensus di lingkungan. Basis data: " +
      `${n(angka("4.5", "penyebut"))} dari ${n(angka("4.5", "total_kk"))} keluarga dalam berkas kepala keluarga; ` +
      `${n(angka("4.5", "tidak_tercatat"))} keluarga belum memiliki catatan.`,
    label: "Kondisi ekonomi keluarga menurut catatan sensus",
  },
  "4.6": {
    pertanyaan: "Berapa banyak umat yang mengemban peran publik di tengah masyarakat?",
    tafsir:
      `Sebanyak ${b(n(angka("4.6", "total")) + " umat")} (${p(angka("4.6", "total_pct"))}) tercatat aktif mengemban ` +
      "peran kemasyarakatan di ruang publik. Sebagian besar di antaranya melayani sebagai pengurus RT, RW, atau kalurahan/desa—struktur " +
      "sosial kemasyarakatan yang paling dekat dengan denyut kehidupan warga sehari-hari.",
    caption:
      `Ragam peran publik kemasyarakatan yang diemban umat. Basis data: ${n(angka("4.6", "total"))} umat dengan catatan peran publik.`,
    label: "Ragam peran publik yang diemban umat",
  },

  // ═══ Pilar 5 ═══════════════════════════════════════════════════════════════
  "5.1": {
    pertanyaan: "Berapa banyak umat yang memiliki catatan kebutuhan kesehatan khusus?",
    tafsir:
      `Sebanyak ${b(n(angka("5.1", "total")) + " jiwa")} (${p(angka("5.1", "total_pct"))}) memiliki catatan ` +
      "kebutuhan kesehatan khusus—seperti sakit menahun, disabilitas fisik, keterlambatan tumbuh kembang anak, " +
      `dan kondisi lainnya. Sementara itu, ${n(angka("5.1", "tidak_tercatat"))} jiwa belum memiliki catatan kondisi kesehatan.`,
    caption:
      `Catatan kebutuhan kesehatan khusus di luar kondisi sehat umum. Basis data: ${n(angka("5.1", "total"))} jiwa; ` +
      `${n(angka("5.1", "normal"))} jiwa tercatat dalam kondisi sehat umum tanpa catatan khusus.`,
    label: "Ragam catatan kebutuhan kesehatan khusus umat",
  },
  "5.2": {
    pertanyaan: "Lingkungan mana yang paling membutuhkan prioritas kunjungan dan sapaan pastoral?",
    tafsir:
      "Indeks prioritas kunjungan pastoral memadukan tiga indikator: proporsi warga lanjut usia, " +
      "proporsi keluarga yang memerlukan bantuan ekonomi, serta proporsi keluarga beranggotakan satu orang (tinggal sendiri). " +
      `Lingkungan ${b(teratas52.label)} menempati urutan teratas, dengan ` +
      `${p(teratas52.p_lansia)} warganya berusia 65 tahun ke atas. Indeks ini dirancang sebagai panduan pemetaan pastoral ` +
      "untuk memusatkan perhatian reksa kasih, bukan sebagai pemeringkatan kemiskinan.",
    caption:
      `Pemetaan seluruh ${n(meta.lingkungan_total)} lingkungan, diurutkan dari indeks prioritas tertinggi. ` +
      "Setiap kolom berupa angka yang dapat dibaca jelas tanpa bergantung pada warna.",
    label: "Tabel indeks prioritas kunjungan di 88 lingkungan",
    captionVisual:
      "Setiap titik melambangkan satu lingkungan. Sumbu mendatar menunjukkan persentase umat berusia 65 tahun ke atas, sumbu tegak menunjukkan persentase " +
      "keluarga yang memerlukan bantuan, dan luas lingkaran mencerminkan jumlah jiwa. Area berwarna di kanan atas memuat lingkungan yang " +
      "berada di atas median paroki pada kedua indikator tersebut. Komponen keluarga tunggal dapat dicermati pada tooltip dan tabel.",
    labelVisual: "Sebaran 88 lingkungan menurut proporsi lansia dan keluarga yang memerlukan bantuan",
  },
  "5.3": {
    pertanyaan: "Berapa banyak warga lanjut usia yang tinggal seorang diri?",
    tafsir:
      `Dari total ${n(nilai("5.3", "Rumah tangga satu orang"))} keluarga yang hanya beranggotakan satu orang, sebanyak ` +
      `${b(n(nilai("5.3", "Di antaranya berusia 65 tahun ke atas")) + " jiwa")} merupakan warga lanjut usia (65 tahun ke atas), ` +
      `bahkan ${b(n(nilai("5.3", "Di antaranya berusia 75 tahun ke atas")) + " jiwa")} di antaranya telah melampaui ` +
      "usia 75 tahun. Berdasarkan catatan sensus, mereka tinggal seorang diri di kediamannya tanpa anggota keluarga lain.",
    caption:
      `Keluarga beranggotakan satu orang dirinci berdasarkan kelompok umur penghuni. Basis data: ` +
      `${n(nilai("5.3", "Rumah tangga satu orang"))} rumah tangga tunggal.`,
    label: "Warga lansia yang tinggal seorang diri",
  },
  "5.4": {
    pertanyaan: "Ke mana saja persebaran tempat tinggal umat paroki yang berdomisili di luar wilayah?",
    tafsir:
      `Sebanyak ${b(n(angka("5.4", "total")) + " jiwa")} (${p(angka("5.4", "total_pct"))}) tercatat masih terdaftar dalam buku paroki ` +
      "namun kini bertempat tinggal di luar batas wilayah paroki, terutama di kawasan Jabodetabek (khususnya Jakarta). Di dalam wilayah paroki sendiri, " +
      `tercatat ${n(angka("5.4", "indekos"))} jiwa warga yang berstatus tinggal indekos.`,
    caption:
      `Persebaran domisili umat yang tercatat tinggal di luar batas wilayah paroki. Basis data: ${n(angka("5.4", "total"))} ` +
      `jiwa; ${n(angka("5.4", "tidak_tercatat"))} jiwa belum memiliki catatan domisili.`,
    label: "Persebaran domisili umat di luar wilayah paroki",
  },
  "5.5": {
    pertanyaan: "Bagaimana situasi umat yang belum aktif atau beribadat di paroki lain?",
    tafsir:
      `Tercatat ${b(n(angka("5.5", "tidak_aktif")) + " umat")} (${p(angka("5.5", "tidak_aktif_pct"))}) yang terdata ` +
      `belum aktif dalam kehidupan menggereja. Di samping itu, terdata ${b(n(nilai("5.5", "Aktif di lingkungan, beribadat di paroki lain")) + " umat")} ` +
      "yang tetap aktif dalam kegiatan lingkungan namun merayakan Ekaristi di gereja paroki lain—dua situasi pastoral yang memerlukan pemahaman dan pendekatan berbeda.",
    caption:
      "Status keaktifan dicatat oleh tim pendata lingkungan saat sensus dan hendaknya diverifikasi secara berkala melalui sapaan pastoral di lapangan. " +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Umat yang tercatat tidak aktif dan yang beribadat di paroki lain",
  },
  "5.6": {
    pertanyaan: "Sejauh mana kesiapsiagaan data golongan darah umat untuk situasi darurat kemanusiaan?",
    tafsir:
      `Golongan darah O merupakan kelompok terbesar dengan ${b(n(nilai("5.6", "O")) + " jiwa")}. Namun demikian, sebanyak ` +
      `${b(n(angka("5.6", "tidak_tercatat")) + " jiwa")} (${p(angka("5.6", "tidak_tercatat_pct"))}) atau lebih dari ` +
      "seperlima umat paroki belum memiliki catatan golongan darah dalam buku sensus.",
    caption:
      `Distribusi golongan darah umat, termasuk proporsi data yang belum terlengkapi. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Distribusi golongan darah umat",
  },
};

export function adeganTeks(id: string): TeksAdegan {
  const t = teks[id];
  if (!t) throw new Error(`Naskah adegan ${id} belum ditulis`);
  return t;
}

// ── 6.1 Agenda pastoral — satu-satunya tempat rekomendasi dirumuskan ─────────
export const agenda = [
  {
    judul: "Pendampingan pastoral terpadu bagi lansia yang tinggal seorang diri",
    isi:
      `Sebanyak ${n(nilai("5.3", "Di antaranya berusia 65 tahun ke atas"))} warga lanjut usia tinggal seorang diri di kediamannya, ` +
      `dan ${n(nilai("5.3", "Di antaranya berusia 75 tahun ke atas"))} jiwa di antaranya telah melewati usia 75 tahun. ` +
      "Demi melindungi privasi warga, dokumen ini tidak memuat identitas perorangan. Sekretariat paroki dapat menarik daftar keluarga satu orang ini dari basis data internal " +
      "dan meneruskannya kepada pengurus lingkungan masing-masing untuk menyusun jadwal kunjungan pastoral rutin, sapaan kasih, serta pelayanan komuni bagi orang sakit dan lansia.",
    rujuk: ["5.3", "2.5"],
  },
  {
    judul: "Memprioritaskan sapaan pastoral pada lingkungan dengan indeks kerentanan tertinggi",
    isi:
      `Pemetaan indeks prioritas merangkum tingkat kerentanan di seluruh ${n(meta.lingkungan_total)} lingkungan paroki. Sepuluh lingkungan ` +
      "pada urutan teratas dapat dijadikan prioritas awal bagi Tim Pelayanan Kemasyarakatan dan Dewan Paroki untuk turun menyapa, berkoordinasi langsung dengan ketua lingkungan setempat.",
    rujuk: ["5.2"],
  },
  {
    judul: "Menjembatani kesenjangan antara penerima Komuni Pertama dan Sakramen Krisma",
    isi:
      `Sebanyak ${n(angka("3.1", "krisma_belum"))} umat tercatat belum menerima Sakramen Krisma, selisih yang mencolok ` +
      `dibandingkan ${n(angka("3.1", "komuni_belum"))} umat yang belum menyambut Komuni Pertama. Tim Pewartaan dan tim katekese paroki perlu memilah secara cermat ` +
      "antara anak-anak yang memang belum cukup usia krisma dengan umat yang sudah dewasa namun belum menerima krisma, agar dapat diselenggarakan program katekese lanjutan pasca-Komuni Pertama maupun krisma dewasa secara terarah.",
    rujuk: ["3.1"],
  },
  {
    judul: "Kaderisasi dan regenerasi kepengurusan pelayanan di tingkat lingkungan",
    isi:
      `Saat ini rata-rata satu pelayan mendampingi ${d(angka("3.6", "umat_per_pelayan"), 1)} jiwa, dengan rentang beban antarlingkungan ` +
      `yang berbeda hingga ${d(angka("1.3", "rentang"), 1)} kali lipat. Keberadaan kaum muda usia 15–29 tahun yang berjumlah ` +
      `${n(nilai("2.4", "15–29 tahun"))} jiwa merupakan tumpuan potensial yang perlu dirangkul dan diajak terlibat aktif dalam estafet kepengurusan lingkungan.`,
    rujuk: ["3.6", "1.3", "2.4"],
  },
  {
    judul: "Pendampingan pastoral bagi keluarga beda agama dan para katekumen",
    isi:
      `Terdapat ${n(angka("3.7", "keluarga_lintas_iman"))} keluarga yang memiliki anggota non-Katolik, ` +
      `serta ${n(angka("3.7", "katekumen"))} jiwa yang sedang berproses menyambut Sakramen Baptis. Kenyataan ini ` +
      "memerlukan sinergi pendampingan yang hangat, bijaksana, dan dialogis antara tim katekese paroki dan paguyuban pendampingan keluarga.",
    rujuk: ["3.7", "3.4"],
  },
  {
    judul: "Pemutakhiran berkala atas data pokok sensus yang belum lengkap",
    isi:
      `Data golongan darah belum tercatat pada ${n(angka("5.6", "tidak_tercatat"))} jiwa dan data profesi pada ` +
      `${n(angka("4.4", "tidak_tercatat"))} jiwa. Kedua data pokok ini perlu dijadikan prioritas pembaruan data secara bertahap di tingkat lingkungan, ` +
      "mengingat manfaatnya yang nyata bagi aksi kemanusiaan darurat serta pemberdayaan sosial-ekonomi umat.",
    rujuk: ["5.6", "4.4", "4.2"],
  },
];

// ── 6.3 Batasan penafsiran ───────────────────────────────────────────────────
export const batasTafsir = [
  {
    judul: "Potret pada satu kurun waktu, bukan pemantauan tren antartahun.",
    isi:
      `Seluruh data bersumber dari satu potret pangkalan data per ${SNAPSHOT}. Kajian ini tidak membandingkan perubahan ` +
      "data dari tahun ke tahun; oleh karena itu, ulasan data tidak menggunakan istilah 'meningkat' atau 'menurun'.",
  },
  {
    judul: "Perhitungan usia mengacu pada tanggal patokan sensus.",
    isi:
      `Kapan pun dokumen ini ditelaah, angka usia yang tersaji tetap mencerminkan kondisi per ${SNAPSHOT}. ` +
      "Tanggal patokan tersebut senantiasa dicantumkan pada setiap visualisasi berbasis usia.",
  },
  {
    judul: "Kategori “Tidak tercatat” menunjukkan catatan administrasi, bukan ketiadaan fakta.",
    isi:
      "Umat yang belum memiliki catatan golongan darah tentu tetap memiliki golongan darah. Kategori ini semata-mata memotret " +
      "kelengkapan pencatatan administrasi paroki saat sensus, bukan menyimpulkan ketiadaan keadaan nyata warga.",
  },
  {
    judul: "Status keaktifan merupakan catatan pengamatan pengurus, bukan vonis atas iman pribadi.",
    isi:
      `Catatan keaktifan dihimpun oleh tim pendata lingkungan pada masa sensus. Angka ` +
      `${p(angka("3.5", "tidak_aktif_pct"))} umat yang terdata belum aktif hendaknya dipahami sebagai petunjuk pastoral ` +
      "untuk disapa dengan kasih dan keterbukaan di lapangan, bukan sebagai label pembeda.",
  },
  {
    judul: "Kategori ekonomi keluarga merupakan pengelompokan kualitatif hasil pengamatan lingkungan.",
    isi: "Pengelompokan status ekonomi merupakan penilaian pastoral sederhana dari tim sensus lingkungan, bukan hasil survei pendapatan kuantitatif dengan standar garis kemiskinan formal.",
  },
  {
    judul: "Indeks prioritas sapaan adalah pemetaan pastoral komparatif, bukan ukuran kemiskinan.",
    isi:
      "Metode perhitungan dan pembobotannya dipaparkan secara terbuka. Nilai terendah hanya menunjukkan indikator kerentanan paling minim " +
      `di antara ${n(meta.lingkungan_total)} lingkungan di paroki, dan bukan berarti lingkungan tersebut tidak memerlukan sapaan pastoral sama sekali.`,
  },
  {
    judul: "Umat yang merantau tetap tercatat dalam buku sensus paroki.",
    isi:
      `Angka ${n(meta.umat_total)} jiwa merujuk pada seluruh umat yang terdaftar secara administratif dalam buku sensus paroki, ` +
      "termasuk mereka yang tinggal di luar kota, sehingga bukan merupakan angka kehadiran fisik dalam perayaan Ekaristi mingguan.",
  },
];

// ── 6.3 Kamus istilah ────────────────────────────────────────────────────────
export const kamus = [
  ["Aktif di gereja dan lingkungan", "Umat tercatat hadir dan terlibat aktif dalam kegiatan peribadatan di paroki sekaligus paguyuban di lingkungannya."],
  ["Aktif di lingkungan, beribadat di paroki lain", "Umat tetap berpartisipasi dalam paguyuban lingkungan tempat tinggal, namun merayakan Ekaristi di gereja paroki lain."],
  ["Tercatat tidak aktif", "Catatan tim sensus yang menunjukkan umat belum aktif terlibat dalam peribadatan paroki maupun kegiatan lingkungan saat pendataan."],
  ["Perkawinan sah secara Katolik", "Perkawinan sakramental yang sah dan diteguhkan menurut tata perayaan hukum kanonik Gereja Katolik."],
  ["Perkawinan sah dengan pasangan beda agama", "Perkawinan sah menurut Gereja Katolik yang telah memperoleh dispensasi kanonik karena pasangan belum dibaptis."],
  ["Perkawinan sah dengan pasangan beda gereja", "Perkawinan sah menurut Gereja Katolik yang memperoleh izin kanonik bersama pasangan yang dibaptis di gereja Kristen lain."],
  ["Kawin belum sah menurut Gereja", "Perkawinan yang telah berlangsung secara sipil atau adat namun belum diteguhkan (diberkati) menurut tata kanonik Gereja Katolik."],
  ["Katekumen", "Calon baptis yang sedang menjalani masa pengajaran iman (katekumenat) untuk mempersiapkan diri menerima sakramen inisiasi."],
  ["Lingkungan", "Satuan paguyuban umat basis teritorial terkecil dalam reksa pastoral keuskupan dan paroki. Paroki Pugeran menaungi " + n(meta.lingkungan_total) + " lingkungan."],
  ["Wilayah", "Struktur koordinasi pastoral yang menghimpun sejumlah lingkungan yang berdekatan. Paroki Pugeran terbagi ke dalam " + n(meta.wilayah_total) + " wilayah."],
  ["Tidak tercatat", "Keterangan untuk kolom data yang belum terisi pada berkas sumber sensus. Kategori ini menunjukkan data belum terdokumentasi dalam sistem administrasi paroki."],
  ["Disamarkan", `Prinsip perlindungan privasi: sel tabulasi data agregat lingkungan yang memuat 1 sampai ${meta.ambang_penyamaran - 1} jiwa diberi keterangan "disamarkan" guna mencegah identifikasi pribadi secara langsung.`],
];

// ── Penutup: teks pengantar ──────────────────────────────────────────────────
export const penutupTeks = {
  agendaJudul: "Enam Rekomendasi Arah Kebijakan Reksa Pastoral",
  agendaLead:
    "Setelah mencermati potret menyeluruh yang terekam dalam data sensus, bagian ini " +
    "merumuskan enam langkah strategis bagi reksa pastoral paroki, disertai rujukan langsung ke nomor adegan terkait sebagai pijakan faktualnya.",
  celahJudul: "Catatan Kelengkapan dan Keterbatasan Data Sensus",
  celahLead:
    "Kolom data yang belum lengkap bukanlah kekurangan yang harus disembunyikan, melainkan masukan berharga bagi pembenahan administrasi paroki ke depan. Sembilan kolom berikut " +
    "memiliki tingkat kekosongan tertinggi, yang sekaligus menegaskan batasan penafsiran atas profil umat saat ini.",
  anomaliJudul: "Catatan Temuan Anomali Data",
  anomaliLead:
    "Indikasi data ganda, kejanggalan penanggalan, serta selisih antardokumen sumber dilaporkan secara terbuka " +
    "sebagai bahan audit dan verifikasi lanjutan oleh sekretariat paroki.",
  usulanJudul: "Enam Langkah Penyempurnaan untuk Pembaruan Sensus Berikutnya",
  metodeJudul: "Metodologi dan Tata Kelola Perlindungan Data",
  metodeLead:
    "Setiap angka dan visualisasi dalam kajian ini dapat ditelusuri langsung ke berkas dan kolom sumber basis data paroki. Bagian ini " +
    "memaparkan tanggal acuan, prinsip perlindungan kerahasiaan pribadi, batasan penafsiran data, serta glosarium istilah yang digunakan.",
  batasJudul: "Batasan Penafsiran Data",
  kamusJudul: "Glosarium Istilah Pastoral dan Teknis",
  unduhJudul: "Unduhan Berkas Data Agregat Paroki",
  unduhLead:
    "Seluruh berkas di bawah ini menyajikan tabulasi data agregat paroki yang telah melalui prosedur penyamaran data pribadi. Berkas-berkas ini " +
    "dapat dimanfaatkan untuk perencanaan karya pastoral tanpa memuat satu pun data perorangan.",
};

export const prinsipData = [
  {
    judul: "Data identitas pribadi disaring sejak awal pengolahan",
    isi:
      "Nama lengkap, tempat dan tanggal lahir, alamat tinggal, nomor kontak pribadi, nomor induk kependudukan, serta nomor kartu keluarga " +
      "disaring dan ditiadakan pada tahap awal pembersihan data. Laman ini murni menyajikan angka agregat, dan sistem otomatis " +
      "akan menolak proses kompilasi jika ditemukan data identitas pribadi yang lolos.",
  },
  {
    judul: "Penyamaran data pada kelompok berpopulasi kecil",
    isi:
      `Setiap sel tabulasi lingkungan yang hanya memuat 1 sampai ${meta.ambang_penyamaran - 1} jiwa ditampilkan dengan ` +
      `keterangan "disamarkan", bukan angka nol. Ambang batas ${meta.ambang_penyamaran} jiwa ini diterapkan mengingat pada lingkungan kecil ` +
      `yang dihuni ${n(lingkunganTerkecil.n)} jiwa, informasi mengenai segelintir orang dapat dengan mudah mengarah pada pengenalan pribadi tertentu.`,
  },
  {
    judul: "Data sensitif tidak ditabulasi silang hingga tingkat perorangan",
    isi:
      "Catatan kondisi kesehatan khusus, perekonomian keluarga, dan status perkawinan hanya disajikan sebagai sebaran tingkat paroki atau " +
      "agregat lingkungan tanpa tabulasi silang yang mempersempit identitas. Indeks prioritas kunjungan diformulasikan menjadi satu nilai skor tunggal per lingkungan guna menjaga kerahasiaan perorangan.",
  },
  {
    judul: "Data kosong disajikan secara jujur dan tidak dianggap nol",
    isi:
      "Kolom data yang kosong diklasifikasikan sebagai kategori “Tidak tercatat” dan senantiasa ditampilkan dengan pola arsir khusus pada grafik. " +
      "Tidak ada persentase yang dihitung secara tersembunyi di atas penyebut yang diperkecil tanpa penjelasan terbuka.",
  },
  {
    judul: "Anomali data dipaparkan secara terbuka untuk evaluasi",
    isi:
      `Temuan kejanggalan tahun perkawinan, ${n(penutup.anomali[0]?.jumlah ?? 0)} baris data yang terindikasi ganda, serta ` +
      `selisih ${n(meta.selisih_keluarga)} keluarga antardokumen sumber dipaparkan secara jujur sebagai catatan audit demi penyempurnaan sistem informasi paroki.`,
  },
];
