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
    "Kajian naratif profil umat Paroki Hati Kudus Tuhan Yesus Pugeran berdasarkan data sensus: " +
    "mengenal umat yang dipercayakan kepada reksa pastoral paroki serta memetakan arah perhatian pelayanan Gereja.",
};

export const pembuka = {
  eyebrow: "Paroki Hati Kudus Tuhan Yesus · Pugeran, Yogyakarta",
  judul: "Siapa umat yang dipercayakan kepada reksa pastoral paroki ini?",
  lead:
    `Buku sensus Paroki Pugeran mencatat ${n(meta.umat_total)} jiwa umat beriman yang berhimpun dalam ` +
    `${n(meta.keluarga_total)} keluarga. Data demografi yang berharga ini selama ini terdistribusi dalam berbagai berkas ` +
    "dan lembar kerja administratif yang belum dipadukan menjadi gambaran utuh. Dokumen naratif ini hadir untuk " +
    "merangkai data tersebut menjadi sebuah kisah pastoral yang jernih—mulai dari peta dasar persebaran umat, " +
    "struktur generasi, dinamika sakramental, hingga perhatian khusus bagi sesama warga yang paling membutuhkan kehadiran dan sapaan kasih Gereja.",
  angkaLabel: ["jiwa terdaftar", "keluarga", "lingkungan", "wilayah"],
  catatan:
    `Seluruh data dalam sajian ini merupakan potret satu kurun waktu (snapshot) dari sensus paroki, bukan pemantauan perubahan antartahun. ` +
    `Perhitungan usia umat mengacu pada tanggal patokan sensus, yakni ${SNAPSHOT}. ` +
    (meta.snapshot_terkonfirmasi
      ? "Tanggal patokan ini telah terkonfirmasi resmi oleh sekretariat paroki."
      : "Karena tanggal pasti penarikan berkas asli tidak tercantum dalam dokumen sumber, tanggal ini dipergunakan sebagai patokan acuan kerja seraya menanti verifikasi lanjutan dari sekretariat paroki. Penjelasan rinci mengenai tata kelola data disajikan pada bagian penutup."),
  bacaMenit: "Waktu baca: 15–20 menit",
};

// ── Babak ────────────────────────────────────────────────────────────────────
export const babak = [
  {
    id: "babak-1",
    label: "Babak I",
    judul: "Profil Demografi Umat",
    lead: "Mengenal jumlah jiwa, susunan keluarga, dan persebaran tempat tinggal warga di seluruh wilayah Paroki Pugeran.",
  },
  {
    id: "babak-2",
    label: "Babak II",
    judul: "Kehidupan Sakramental dan Karya Warga",
    lead: "Mencermati dinamika hidup menggereja, penerimaan sakramen inisiasi, serta latar pendidikan, profesi, dan ketahanan ekonomi keluarga.",
  },
  {
    id: "babak-3",
    label: "Babak III",
    judul: "Fokus Reksa Pastoral dan Sapaan Kasih",
    lead: "Memetakan warga yang paling rentan agar tiada satu pun domba yang terlewat dari perhatian dan sapaan kasih Gereja.",
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
      `berapa banyak jiwa yang digembalakan, bagaimana persebarannya, dan seperti apa susunan keluarga di ${n(meta.lingkungan_total)} lingkungan.`,
  },
  {
    no: 2,
    id: "pilar-2",
    judul: "Struktur Generasi dan Masa Depan Paroki",
    bidang: ["Pewartaan", "Paguyuban"],
    lead:
      "Piramida usia memperlihatkan perimbangan antara kelompok usia produktif dan warga yang ditanggung, " +
      "kelangsungan regenerasi anak-anak, serta keberadaan kaum muda sebagai tumpuan masa depan persekutuan umat.",
  },
  {
    no: 3,
    id: "pilar-3",
    judul: "Dinamika Hidup Menggereja dan Sakramen",
    bidang: ["Liturgi & Peribadatan", "Pewartaan"],
    lead:
      "Melihat kelengkapan penerimaan sakramen inisiasi, status perkawinan umat, keikutsertaan dalam persekutuan lingkungan, " +
      "hingga keterlibatan warga dalam aneka tugas pelayanan di paroki.",
  },
  {
    no: 4,
    id: "pilar-4",
    judul: "Pendidikan, Karya, dan Perekonomian Umat",
    bidang: ["Pelayanan Kemasyarakatan", "Pewartaan (Pendidikan)"],
    lead:
      "Mengamati jenjang pendidikan formal umat, ragam profesi dan mata pencaharian, serta " +
      "kondisi kesejahteraan ekonomi keluarga menurut pencatatan sensus.",
  },
  {
    no: 5,
    id: "pilar-5",
    judul: "Prioritas Kasih bagi Warga yang Rentan",
    bidang: ["Pelayanan Kemasyarakatan", "Penelitian & Pengembangan"],
    lead:
      "Menemukan saudara-saudari kita yang paling memerlukan perhatian khusus: para lansia yang hidup seorang diri, " +
      "umat dengan kebutuhan kesehatan khusus, warga yang berdomisili jauh, serta mereka yang belum aktif dalam persekutuan.",
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
      `Paroki Pugeran mencatat ${b(n(meta.umat_total) + " jiwa")} yang bernaung dalam ${b(n(meta.keluarga_total) + " keluarga")}. ` +
      `Rata-rata setiap keluarga beranggotakan ${d(angka("1.1", "rata_rata_per_keluarga"), 2)} jiwa dengan nilai tengah (median) ` +
      `${d(angka("1.1", "median_per_keluarga"), 0)} jiwa, sedangkan keluarga dengan anggota terbanyak mencapai ` +
      `${n(angka("1.1", "terbesar"))} jiwa.`,
    caption: "Gambaran umum umat Paroki Pugeran: jumlah jiwa, jumlah keluarga, dan rata-rata anggota per keluarga.",
    label: "Profil dasar umat Paroki Pugeran",
  },
  "1.2": {
    pertanyaan: "Bagaimana sebaran jumlah umat di setiap wilayah?",
    tafsir:
      `Wilayah ${b(objek<{ label: string }>("1.2", "tertinggi").label)} merupakan wilayah dengan umat terbanyak, yakni mencapai ` +
      `${b(n(objek<{ n: number }>("1.2", "tertinggi").n) + " jiwa")}. Sebaliknya, Wilayah ` +
      `${objek<{ label: string }>("1.2", "terendah").label} beranggotakan ` +
      `${n(objek<{ n: number }>("1.2", "terendah").n)} jiwa. Terdapat perbedaan hingga ` +
      `${d(objek<{ n: number }>("1.2", "tertinggi").n / objek<{ n: number }>("1.2", "terendah").n, 1)} kali lipat ` +
      "antara wilayah berpopulasi terbesar dan wilayah terkecil.",
    caption:
      `Proporsi jumlah umat di ${n(meta.wilayah_total)} wilayah, terbagi ke dalam ` +
      `${n(meta.kelompok.length)} kelompok kewilayahan. Sebanyak ${n(meta.baris_paroki_lain)} baris data dengan kode di luar paroki ` +
      "tidak diikutsertakan dalam grafik ini dan dicatat secara terbuka pada bagian penutup.",
    label: "Sebaran jumlah umat menurut wilayah",
  },
  "1.3": {
    pertanyaan: "Seberapa besar variasi jumlah umat dan rentang beban pelayanan antarlingkungan?",
    tafsir:
      `Nilai tengah (median) jumlah umat di tingkat lingkungan adalah ${b(d(angka("1.3", "median"), 1) + " jiwa")}. ` +
      `Lingkungan terbesar adalah ${b(objek<{ label: string }>("1.3", "terbesar").label)} dengan ` +
      `${n(objek<{ n: number }>("1.3", "terbesar").n)} jiwa, sementara lingkungan terkecil yakni ` +
      `${objek<{ label: string }>("1.3", "terkecil").label} beranggotakan ` +
      `${n(objek<{ n: number }>("1.3", "terkecil").n)} jiwa. Rentang perbedaan ini mencapai ` +
      `${b(d(angka("1.3", "rentang"), 1) + " kali lipat")}—sebuah ketimpangan nyata dalam rentang penggembalaan dan dinamika antarlingkungan.`,
    caption:
      `Sebaran ${n(angka("1.3", "jumlah_lingkungan"))} lingkungan berdasarkan wilayah dan kelompok wilayah. ` +
      "Garis mendatar menunjukkan rentang dari lingkungan terkecil hingga terbesar di wilayah tersebut; garis tegak menandai nilai tengah (median) paroki.",
    label: "Persebaran jumlah umat di 88 lingkungan",
  },
  "1.4": {
    pertanyaan: "Bagaimana pola ukuran dan jumlah anggota keluarga umat?",
    tafsir:
      `Sebanyak ${b(n(angka("1.4", "satu_orang")) + " keluarga")} (${p(angka("1.4", "satu_orang_pct"))} dari total ` +
      `${n(meta.keluarga_total)} keluarga) merupakan keluarga yang hanya beranggotakan satu orang (hidup sendiri)—jumlah yang hampir setara ` +
      `dengan keluarga beranggotakan dua orang. Adapun keluarga dengan susunan anggota terbanyak tercatat beranggotakan ${n(angka("1.4", "terbesar"))} jiwa.`,
    caption: `Sebaran keluarga berdasarkan jumlah anggota keluarga. Basis data: ${n(meta.keluarga_total)} keluarga.`,
    label: "Sebaran jumlah anggota per keluarga",
  },
  "1.5": {
    pertanyaan: "Berapa proporsi keluarga yang dikepalai oleh perempuan?",
    tafsir:
      `Sebanyak ${b(n(angka("1.5", "perempuan")) + " keluarga")} dikepalai oleh perempuan, yaitu ` +
      `${p(angka("1.5", "perempuan_pct"))} dari ${n(angka("1.5", "penyebut"))} kepala keluarga yang memiliki catatan jenis kelamin. ` +
      `Di samping itu, terdapat ${n(angka("1.5", "tidak_tercatat"))} kepala keluarga yang belum tercatat jenis kelaminnya dalam berkas sensus.`,
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
      "Keragaman suku warga paroki. Suku-suku dengan jumlah warga relatif sedikit dirangkum dalam satu kelompok; rincian selengkapnya tersedia pada unduhan data agregat.",
    label: "Keragaman latar belakang suku umat",
  },

  // ═══ Pilar 2 ═══════════════════════════════════════════════════════════════
  "2.1": {
    pertanyaan: "Bagaimana susunan kelompok usia dan piramida demografi umat?",
    tafsir:
      "Piramida usia umat Paroki Pugeran tidak berbentuk segitiga melebar di dasar: proporsinya menyempit pada kelompok anak-anak serta menggembung di kelompok usia produktif dan lanjut usia. " +
      `Usia tengah (median) umat berada pada ${b(d(angka("2.1", "median_umur"), 1) + " tahun")}, dihitung dari ` +
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
      `Setiap 100 umat usia produktif (15–64 tahun) rata-rata menanggung ${b(d(angka("2.2", "rasio_ketergantungan"), 1) + " jiwa")} ` +
      `usia nonproduktif—terdiri atas ${d(angka("2.2", "rasio_anak"), 1)} anak-anak dan ` +
      `${d(angka("2.2", "rasio_lansia"), 1)} warga lanjut usia. Beban tanggungan ini lebih banyak berasal dari kelompok lansia ketimbang anak-anak.`,
    caption:
      `Komposisi tiga kelompok umur utama dan rasio ketergantungan. Basis perhitungan: ${n(meta.umur_valid)} jiwa dengan tanggal lahir valid; ` +
      `persentase dihitung terhadap total ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Komposisi kelompok umur dan rasio ketergantungan",
  },
  "2.3": {
    pertanyaan: "Bagaimana perbandingan jumlah umat pada kelompok balita, anak-anak, dan remaja awal?",
    tafsir:
      `Kelompok balita (0–4 tahun) tercatat hanya berjumlah ${b(n(nilai("2.3", "0–4 tahun")) + " jiwa")}, ` +
      `atau kurang dari sepertiga jumlah anak usia 10–14 tahun yang mencapai ${n(nilai("2.3", "10–14 tahun"))} jiwa. ` +
      "Pada ketiga kelompok usia anak ini, jumlahnya tampak semakin mengecil pada kelompok yang semakin muda.",
    caption:
      `Perbandingan tiga kelompok usia anak. Basis data: ${n(angka("2.3", "penyebut"))} jiwa berusia di bawah 15 tahun.`,
    label: "Tiga kelompok usia anak: 0–4 tahun, 5–9 tahun, dan 10–14 tahun",
  },
  "2.4": {
    pertanyaan: "Berapa banyak kaum muda berusia 15–29 tahun di paroki?",
    tafsir:
      `Tercatat ${b(n(nilai("2.4", "15–29 tahun")) + " jiwa")} kaum muda dalam rentang usia 15–29 tahun, atau mencakup ` +
      `${p(angka("2.4", "penyebut") > 0 ? (100 * nilai("2.4", "15–29 tahun")) / meta.umat_total : 0)} ` +
      "dari seluruh populasi paroki. Dengan kata lain, satu dari setiap lima umat terdaftar merupakan generasi muda.",
    caption: `Kelompok usia muda dalam rincian rentang lima tahunan. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jumlah umat berusia 15 sampai 29 tahun",
  },
  "2.5": {
    pertanyaan: "Bagaimana profil dan keberadaan umat lanjut usia (lansia)?",
    tafsir:
      `Sebanyak ${b(n(angka("2.5", "lansia_65")) + " jiwa")} berusia 65 tahun ke atas ` +
      `(${p(angka("2.5", "lansia_65_pct"))}), dan ${n(angka("2.5", "lansia_80"))} jiwa di antaranya telah ` +
      `melampaui usia 80 tahun. Pada kelompok usia sangat sepuh (90–94 tahun), jumlah perempuan tercatat jauh lebih banyak, yaitu ` +
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
      "relatif merata pada kelompok usia muda, namun proporsi perempuan semakin dominan pada kelompok lanjut usia. " +
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
      `${b(n(nilai("3.1", "Sudah menerima Krisma")))} jiwa telah diteguhkan dalam Sakramen Penguatan (Krisma). ` +
      `Sebanyak ${n(angka("3.1", "krisma_belum"))} umat tercatat belum menerima Krisma, dan ` +
      `${n(angka("3.1", "tidak_tercatat"))} umat belum terdokumentasi catatan kelengkapan sakramennya.`,
    caption:
      `Tiga tahapan sakramen inisiasi: Baptis, Komuni Pertama, dan Krisma. Masing-masing dihitung atas seluruh ${n(meta.umat_total)} jiwa terdaftar; ` +
      "data sensus tidak menghubungkan antar-catatan sakramen, sehingga mereka yang belum menerima Krisma tidak otomatis tercatat sebagai penerima Komuni Pertama.",
    label: "Tahapan penerimaan sakramen inisiasi: Baptis, Komuni Pertama, dan Krisma",
  },
  "3.2": {
    pertanyaan: "Kapan dan melalui jalan apa umat menerima Sakramen Baptis?",
    tafsir:
      `Sebanyak ${b(n(angka("3.2", "sebagai_anak")) + " umat")} (${p(angka("3.2", "sebagai_anak_pct"))}) dibaptis ` +
      "sejak masa kanak-kanak (baptis bayi/anak). Selebihnya menerima baptisan melalui beragam perjalanan iman—dibaptis saat remaja atau dewasa, berasal dari agama lain, " +
      "diterima dari gereja Kristen lain, masih berstatus katekumen, atau belum terlengkapi catatannya.",
    caption: `Waktu dan jalur penerimaan Sakramen Baptis. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Waktu dan jalur pembaptisan umat",
  },
  "3.3": {
    pertanyaan: "Berapa banyak umat yang menerima sakramen inisiasi di Paroki Pugeran?",
    tafsir:
      `Sebanyak ${b(n(nilai("3.3", "Dibaptis di Pugeran")))} umat ` +
      `(${p((100 * nilai("3.3", "Dibaptis di Pugeran")) / meta.umat_total)}) dibaptis di Paroki Pugeran, dan ` +
      `${b(n(nilai("3.3", "Menerima Krisma di Pugeran")))} umat ` +
      `(${p((100 * nilai("3.3", "Menerima Krisma di Pugeran")) / meta.umat_total)}) menerima Sakramen Krisma di paroki ini. ` +
      "Dengan demikian, lebih dari separuh warga paroki menerima sakramen inisiasinya di luar Pugeran atau belum terdokumentasi tempat penerimaannya.",
    caption:
      `Umat dengan catatan tempat baptis dan tempat krisma yang menyebut Paroki Pugeran. ` +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jumlah umat yang dibaptis dan dikrisma di Paroki Pugeran",
  },
  "3.4": {
    pertanyaan: "Bagaimana sebaran status perkawinan umat menurut hukum Gereja?",
    tafsir:
      `Sebanyak ${b(n(angka("3.4", "sah_katolik")) + " jiwa")} tercatat hidup dalam perkawinan sah secara Katolik, sedangkan ` +
      `${n(angka("3.4", "belum_menikah"))} jiwa berstatus belum menikah. Kategori status perkawinan lainnya ` +
      "mencakup proporsi yang relatif kecil dan seluruhnya disajikan apa adanya secara terbuka sebagai bahan pendampingan pastoral keluarga.",
    caption:
      `Sebaran status perkawinan menurut pencatatan sensus paroki. Sajian ini memetakan kondisi administratif pastoral tanpa menghakimi pribadi umat. ` +
      `Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Sebaran status perkawinan umat",
  },
  "3.5": {
    pertanyaan: "Bagaimana tingkat keaktifan umat dalam kehidupan menggereja?",
    tafsir:
      `Sebanyak ${b(n(angka("3.5", "aktif_gereja_lingkungan")) + " umat")} ` +
      `(${p(angka("3.5", "aktif_gereja_lingkungan_pct"))}) tercatat aktif bersekutu di gereja paroki sekaligus di ` +
      `lingkungannya. Di sisi lain, terdapat ${b(n(angka("3.5", "tidak_aktif")) + " umat")} ` +
      `(${p(angka("3.5", "tidak_aktif_pct"))}) yang terdata belum aktif dalam kegiatan persekutuan umat.`,
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
      `${b(d(angka("3.6", "umat_per_pelayan"), 1) + " jiwa")}. Sebagian besar dari mereka adalah pengurus ` +
      "lingkungan, sedangkan pengurus tim kerja paroki dan anggota Dewan Paroki mencakup proporsi yang lebih terpusat.",
    caption:
      `Ragam tugas pelayanan pastoral yang tercatat. Basis data: ${n(angka("3.6", "total_pelayan"))} umat dengan ` +
      "catatan tugas pelayanan.",
    label: "Ragam tugas pelayanan umat",
  },
  "3.7": {
    pertanyaan: "Berapa banyak keluarga paroki yang hidup dalam keberagaman lintas iman?",
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
      `telah menyelesaikan pendidikan tinggi, mulai dari jenjang diploma hingga doktoral. Di sisi lain, ` +
      `tercatat ${n(nilai("4.1", "Buta aksara"))} warga yang belum melek aksara.`,
    caption:
      `Jenjang pendidikan formal tertinggi yang diselesaikan umat. Basis data: ${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Jenjang pendidikan tertinggi umat",
  },
  "4.2": {
    pertanyaan: "Berapa banyak umat yang menempuh pendidikan di sekolah Katolik?",
    tafsir:
      "Pertanyaan ini belum dapat dijawab secara menyeluruh dari data sensus saat ini. Keterangan jenis sekolah baru tercatat pada " +
      `${b(n(angka("4.2", "penyebut")) + " jiwa")}, sedangkan ` +
      `${b(n(angka("4.2", "tanpa_penanda")) + " jiwa")} (${p(angka("4.2", "tanpa_penanda_pct"))}) belum ` +
      "memiliki keterangan. Dari data terbatas yang tersedia, sebagian besar memang tercatat bersekolah di yayasan Katolik; " +
      "namun keterbatasan data ini belum memadai untuk ditarik kesimpulan umum bagi keseluruhan paroki.",
    caption:
      `Seluruh ${n(meta.umat_total)} jiwa terdaftar digambarkan sebagai 100 kotak; hanya ${n(angka("4.2", "penyebut"))} jiwa ` +
      "yang memiliki catatan jenis sekolah, dan persentase sekolah Katolik dihitung dari kelompok yang tercatat ini.",
    label: "Kategori jenis sekolah pada data yang tercatat",
  },
  "4.3": {
    pertanyaan: "Di bidang studi apa saja keilmuan umat terhimpun?",
    tafsir:
      `Catatan bidang studi saat ini terisi pada ${b(n(angka("4.3", "terisi")) + " jiwa")} ` +
      `(${p(angka("4.3", "terisi_pct"))}). Dari data yang terhimpun, rumpun keilmuan Ekonomi dan Pendidikan merupakan dua ` +
      "bidang terbesar, disusul oleh Akuntansi, Manajemen, dan Teknik.",
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
      `disusul oleh ibu rumah tangga dan kaum purnatugas (pensiunan). Terdapat ${b(n(angka("4.4", "tidak_tercatat")) + " jiwa")} ` +
      `(${p(angka("4.4", "tidak_tercatat_pct"))}) yang belum terdokumentasi profesinya, dan kelompok ini tetap ` +
      "disertakan dalam grafik demi kejujuran data sensus.",
    caption:
      `Distribusi profesi dan mata pencaharian warga paroki. Kategori utama disajikan utuh; profesi dengan jumlah sedikit digabungkan. Basis data: ` +
      `${n(meta.umat_total)} jiwa terdaftar.`,
    label: "Profesi dan mata pencaharian umat",
  },
  "4.5": {
    pertanyaan: "Bagaimana gambaran kondisi kesejahteraan ekonomi keluarga umat?",
    tafsir:
      `Berdasarkan catatan tim pendata lingkungan, sebanyak ${b(n(angka("4.5", "perlu_bantuan")) + " keluarga")} (${p(angka("4.5", "perlu_bantuan_pct"))} dari ` +
      `${n(angka("4.5", "penyebut"))} keluarga yang terdata) dinilai memerlukan bantuan. Di sisi lain, sekitar satu ` +
      "dari setiap lima keluarga tergolong berkecukupan dan berpotensi menjadi penopang bagi sesama warga yang membutuhkan.",
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
      "sosial yang paling dekat dengan kehidupan warga sehari-hari.",
    caption:
      `Ragam peran publik kemasyarakatan yang diemban umat. Basis data: ${n(angka("4.6", "total"))} umat dengan catatan peran publik.`,
    label: "Ragam peran publik yang diemban umat",
  },

  // ═══ Pilar 5 ═══════════════════════════════════════════════════════════════
  "5.1": {
    pertanyaan: "Berapa banyak umat yang memiliki riwayat kebutuhan kesehatan khusus?",
    tafsir:
      `Sebanyak ${b(n(angka("5.1", "total")) + " jiwa")} (${p(angka("5.1", "total_pct"))}) memiliki catatan ` +
      "kebutuhan kesehatan khusus—seperti sakit menahun/kronis, disabilitas fisik, kebutuhan tumbuh kembang khusus, " +
      `dan kondisi lainnya. Sementara itu, ${n(angka("5.1", "tidak_tercatat"))} jiwa belum memiliki catatan kondisi kesehatan.`,
    caption:
      `Catatan kebutuhan kesehatan khusus di luar kondisi sehat umum. Basis data: ${n(angka("5.1", "total"))} jiwa; ` +
      `${n(angka("5.1", "normal"))} jiwa tercatat dalam kondisi sehat umum tanpa catatan khusus.`,
    label: "Ragam catatan kebutuhan kesehatan khusus umat",
  },
  "5.2": {
    pertanyaan: "Lingkungan mana yang paling membutuhkan prioritas kunjungan dan pendampingan pastoral?",
    tafsir:
      "Indeks prioritas kunjungan pastoral memadukan tiga indikator demografi: proporsi warga lanjut usia, " +
      "proporsi keluarga yang memerlukan bantuan ekonomi, serta proporsi keluarga beranggotakan satu orang (hidup sendiri). " +
      `Lingkungan ${b(teratas52.label)} menempati urutan teratas, dengan ` +
      `${p(teratas52.p_lansia)} warganya berusia 65 tahun ke atas. Indeks ini disusun sebagai panduan pemetaan pastoral ` +
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
      "usia 75 tahun. Dalam catatan sensus, mereka hidup sendiri tanpa anggota keluarga lain di kediamannya.",
    caption:
      `Keluarga beranggotakan satu orang dirinci berdasarkan kelompok umur penghuni. Basis data: ` +
      `${n(nilai("5.3", "Rumah tangga satu orang"))} rumah tangga tunggal.`,
    label: "Warga lansia yang tinggal seorang diri",
  },
  "5.4": {
    pertanyaan: "Ke mana saja persebaran tempat tinggal warga paroki yang berdomisili di luar wilayah?",
    tafsir:
      `Sebanyak ${b(n(angka("5.4", "total")) + " jiwa")} (${p(angka("5.4", "total_pct"))}) tercatat masih terdaftar dalam buku paroki ` +
      "namun kini bertempat tinggal di luar batas wilayah teritorial paroki, dengan wilayah Jabodetabek (khususnya Jakarta) sebagai tujuan perantauan terbanyak. Di dalam wilayah paroki sendiri, " +
      `tercatat ${n(angka("5.4", "indekos"))} jiwa warga yang berstatus tinggal indekos.`,
    caption:
      `Persebaran domisili umat yang tercatat tinggal di luar batas wilayah paroki. Basis data: ${n(angka("5.4", "total"))} ` +
      `jiwa; ${n(angka("5.4", "tidak_tercatat"))} jiwa belum memiliki catatan domisili.`,
    label: "Persebaran domisili umat di luar wilayah paroki",
  },
  "5.5": {
    pertanyaan: "Bagaimana keberadaan umat yang jarang aktif atau beribadat di paroki lain?",
    tafsir:
      `Tercatat ${b(n(angka("5.5", "tidak_aktif")) + " umat")} (${p(angka("5.5", "tidak_aktif_pct"))}) yang terdata ` +
      `belum aktif dalam kehidupan menggereja. Di samping itu, terdata ${b(n(nilai("5.5", "Aktif di lingkungan, beribadat di paroki lain")) + " umat")} ` +
      "yang tetap aktif dalam persekutuan rukun lingkungan namun merayakan Ekaristi di gereja paroki lain—dua situasi pastoral yang memerlukan pemahaman dan pendekatan berbeda.",
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
      "seperlima umat paroki belum memiliki catatan golongan darah sama sekali dalam buku sensus.",
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
    judul: "Pendampingan pastoral terpadu bagi lansia yang hidup seorang diri",
    isi:
      `Sebanyak ${n(nilai("5.3", "Di antaranya berusia 65 tahun ke atas"))} warga lanjut usia hidup seorang diri di kediamannya, ` +
      `dan ${n(nilai("5.3", "Di antaranya berusia 75 tahun ke atas"))} jiwa di antaranya telah melewati usia 75 tahun. ` +
      "Dokumen ini sengaja tidak memuat identitas perorangan demi privasi. Daftar keluarga satu orang dapat dihimpun oleh sekretariat paroki dari basis data sensus, " +
      "dikelompokkan per lingkungan, lalu diteruskan kepada para pengurus lingkungan untuk menyusun jadwal kunjungan pastoral berkala dan pelayanan Komuni lansia/orang sakit.",
    rujuk: ["5.3", "2.5"],
  },
  {
    judul: "Memprioritaskan sapaan pastoral pada lingkungan dengan indeks kerentanan tertinggi",
    isi:
      `Tabel indeks prioritas telah memetakan tingkat kerentanan di seluruh ${n(meta.lingkungan_total)} lingkungan paroki. Sepuluh lingkungan ` +
      "pada urutan teratas dapat dijadikan prioritas putaran awal gerakan sapaan bidang Pelayanan Kemasyarakatan dan Diakonia paroki, dengan penyesuaian lapangan bersama para ketua lingkungan setempat.",
    rujuk: ["5.2"],
  },
  {
    judul: "Menjembatani kesenjangan antara penerima Komuni Pertama dan Sakramen Krisma",
    isi:
      `Sebanyak ${n(angka("3.1", "krisma_belum"))} umat tercatat belum menerima Sakramen Krisma, selisih yang mencolok ` +
      `dibandingkan ${n(angka("3.1", "komuni_belum"))} umat yang belum menyambut Komuni Pertama. Diperlukan penelusuran terpadu antara bidang Pewartaan dan tim katekese: ` +
      "memilah anak-anak yang memang belum cukup usia dengan warga yang sudah melewati usia krisma namun belum menerimanya, agar dapat dirancang program katekese lanjutan pasca-Komuni Pertama yang memadai.",
    rujuk: ["3.1"],
  },
  {
    judul: "Kaderisasi dan regenerasi estafet pelayanan di tingkat lingkungan",
    isi:
      `Saat ini rata-rata satu pelayan mendampingi ${d(angka("3.6", "umat_per_pelayan"), 1)} jiwa, dengan ketimpangan beban antarlingkungan ` +
      `yang mencapai ${d(angka("1.3", "rentang"), 1)} kali lipat. Kelompok kaum muda usia 15–29 tahun yang berjumlah ` +
      `${n(nilai("2.4", "15–29 tahun"))} jiwa merupakan tumpuan potensial yang perlu diajak terlibat aktif dalam estafet regenerasi kepengurusan lingkungan.`,
    rujuk: ["3.6", "1.3", "2.4"],
  },
  {
    judul: "Pendampingan pastoral bagi keluarga lintas agama dan para katekumen",
    isi:
      `Terdapat ${n(angka("3.7", "keluarga_lintas_iman"))} keluarga yang memiliki anggota non-Katolik, ` +
      `serta ${n(angka("3.7", "katekumen"))} jiwa yang sedang mempersiapkan diri menyambut Sakramen Baptis. Kenyataan ini ` +
      "memerlukan sinergi pendampingan yang hangat, inklusif, dan bijaksana antara tim katekese pewartaan dan paguyuban keluarga paroki.",
    rujuk: ["3.7", "3.4"],
  },
  {
    judul: "Pemutakhiran berkala atas data pokok sensus yang belum lengkap",
    isi:
      `Data golongan darah belum tercatat pada ${n(angka("5.6", "tidak_tercatat"))} jiwa dan data profesi/pekerjaan pada ` +
      `${n(angka("4.4", "tidak_tercatat"))} jiwa. Kedua data pokok ini dianjurkan menjadi prioritas pembaruan data secara bertahap di tingkat lingkungan, ` +
      "mengingat manfaatnya yang nyata dan langsung bagi aksi kemanusiaan darurat serta pemberdayaan sosial-ekonomi umat.",
    rujuk: ["5.6", "4.4", "4.2"],
  },
];

// ── 6.3 Batasan penafsiran ───────────────────────────────────────────────────
export const batasTafsir = [
  {
    judul: "Potret satu kurun waktu (cross-sectional), bukan pemantauan tren antartahun.",
    isi:
      `Seluruh data bersumber dari satu potret pangkalan data per ${SNAPSHOT}. Dokumen ini tidak membandingkan perubahan ` +
      "data antartahun; oleh sebab itu, narasi data tidak menggunakan istilah 'meningkat' atau 'menurun'.",
  },
  {
    judul: "Perhitungan usia merujuk pada tanggal patokan sensus, bukan hari ini.",
    isi:
      `Kapan pun dokumen ini ditelaah, angka usia yang tersaji tetap mencerminkan kondisi per ${SNAPSHOT}. ` +
      "Tanggal patokan tersebut senantiasa dicantumkan pada setiap visualisasi berbasis usia.",
  },
  {
    judul: "Kategori “Tidak tercatat” menunjukkan catatan administrasi, bukan ketiadaan fakta.",
    isi:
      "Warga yang belum memiliki catatan golongan darah tentu tetap memiliki golongan darah. Grafik pada laporan ini memotret " +
      "kelengkapan pencatatan administrasi paroki pada saat sensus, bukan menyimpulkan ketiadaan keadaan nyata warga.",
  },
  {
    judul: "Status keaktifan merupakan catatan pengamatan petugas, bukan vonis atas iman pribadi.",
    isi:
      `Catatan keaktifan dihimpun oleh tim pendata lingkungan pada masa sensus. Angka ` +
      `${p(angka("3.5", "tidak_aktif_pct"))} warga yang terdata belum aktif hendaknya dipahami sebagai indikasi pastoral ` +
      "yang perlu disapa dan didekati dengan kasih di lapangan, bukan sebagai label pembedaan.",
  },
  {
    judul: "Kategori ekonomi keluarga merupakan pengelompokan kualitatif pengamatan lapangan.",
    isi: "Pengelompokan status ekonomi merupakan penilaian pastoral sederhana dari tim sensus lingkungan, bukan hasil survei pendapatan kuantitatif yang dibandingkan dengan standar garis kemiskinan formal.",
  },
  {
    judul: "Indeks prioritas kunjungan adalah pemetaan pastoral komparatif, bukan ukuran kemiskinan.",
    isi:
      "Metode perhitungan dan pembobotannya dipaparkan secara terbuka. Nilai terendah hanya menunjukkan indikator kerentanan paling minim " +
      `di antara ${n(meta.lingkungan_total)} lingkungan di paroki, dan bukan berarti lingkungan tersebut tidak memerlukan pelayanan pastoral sama sekali.`,
  },
  {
    judul: "Warga yang merantau tetap tercatat dalam buku sensus administrasi paroki.",
    isi:
      `Angka ${n(meta.umat_total)} jiwa merujuk pada seluruh umat yang terdaftar secara administratif dalam buku sensus paroki, ` +
      "dan bukan merupakan angka kehadiran fisik dalam perayaan Ekaristi mingguan.",
  },
];

// ── 6.3 Kamus istilah ────────────────────────────────────────────────────────
export const kamus = [
  ["Aktif di gereja dan lingkungan", "Umat tercatat hadir dan terlibat aktif dalam kegiatan peribadatan paroki sekaligus persekutuan rukun di lingkungannya."],
  ["Aktif di lingkungan, beribadat di paroki lain", "Umat tetap berpartisipasi dalam paguyuban lingkungan tempat tinggal, namun merayakan Ekaristi di gereja paroki lain."],
  ["Tercatat tidak aktif", "Catatan tim sensus yang menunjukkan umat belum aktif terlibat dalam peribadatan paroki maupun kegiatan paguyuban lingkungan saat pendataan."],
  ["Perkawinan sah secara Katolik", "Perkawinan sakramental yang sah dan diteguhkan menurut tata perayaan hukum kanonik Gereja Katolik."],
  ["Perkawinan sah dengan pasangan beda agama", "Perkawinan sah menurut Gereja Katolik yang telah memperoleh dispensasi kanonik karena pasangan belum dibaptis."],
  ["Perkawinan sah dengan pasangan beda gereja", "Perkawinan sah menurut Gereja Katolik yang memperoleh izin kanonik bersama pasangan yang dibaptis di gereja Kristen lain."],
  ["Kawin belum sah menurut Gereja", "Perkawinan yang telah berlangsung secara sipil atau adat namun belum diteguhkan (diberkati) menurut tata kanonik Gereja Katolik."],
  ["Katekumen", "Warga calon baptis yang sedang menjalani masa bimbingan pengajaran iman (katekumenat) untuk mempersiapkan diri menyambut sakramen inisiasi."],
  ["Lingkungan", "Satuan paguyuban umat basis teritorial terkecil dalam reksa pastoral keuskupan dan paroki. Paroki Pugeran menaungi " + n(meta.lingkungan_total) + " lingkungan."],
  ["Wilayah", "Struktur koordinasi pastoral yang menghimpun sejumlah lingkungan yang berdekatan. Paroki Pugeran terbagi ke dalam " + n(meta.wilayah_total) + " wilayah."],
  ["Tidak tercatat", "Keterangan pada kolom data yang kosong pada berkas sumber sensus. Kategori ini menunjukkan data belum terdokumentasi dalam sistem administrasi paroki."],
  ["Disamarkan", `Prinsip perlindungan privasi: sel tabulasi data agregat lingkungan yang memuat 1 sampai ${meta.ambang_penyamaran - 1} jiwa diberi keterangan "disamarkan" guna mencegah identifikasi pribadi secara langsung.`],
];

// ── Penutup: teks pengantar ──────────────────────────────────────────────────
export const penutupTeks = {
  agendaJudul: "Enam Rekomendasi Arah Kebijakan Reksa Pastoral",
  agendaLead:
    "Setelah menelaah pemetaan menyeluruh atas apa yang terekam dalam data sensus, bagian ini " +
    "merumuskan enam langkah strategis bagi reksa pastoral paroki, disertai rujukan langsung ke nomor adegan terkait agar senantiasa berpijak pada data yang sahih.",
  celahJudul: "Catatan Kelengkapan dan Keterbatasan Data Sensus",
  celahLead:
    "Data yang belum lengkap bukanlah kekurangan yang harus ditutupi, melainkan petunjuk berharga bagi pembenahan administrasi paroki ke depan. Sembilan kolom data berikut " +
    "memiliki tingkat kekosongan tertinggi, yang sekaligus menegaskan batasan penafsiran yang sahih atas profil umat saat ini.",
  anomaliJudul: "Keterbukaan atas Temuan Anomali Data",
  anomaliLead:
    "Baris data yang terindikasi ganda, kejanggalan penanggalan, serta selisih antardokumen sumber tidak disembunyikan. " +
    "Seluruhnya dilaporkan secara transparan sebagai bahan audit dan verifikasi berkala oleh sekretariat paroki.",
  usulanJudul: "Enam Langkah Penyempurnaan untuk Pembaruan Sensus Berikutnya",
  metodeJudul: "Metodologi dan Tata Kelola Perlindungan Data",
  metodeLead:
    "Setiap angka dan visualisasi dalam kajian ini memiliki ketertelusuran penuh hingga ke berkas dan kolom sumber pangkalan data paroki. Bagian ini " +
    "memaparkan tanggal acuan, prinsip tata kelola kerahasiaan pribadi, batas interpretasi data, serta glosarium istilah yang digunakan.",
  batasJudul: "Batasan Penafsiran Data",
  kamusJudul: "Glosarium Istilah Pastoral dan Teknis",
  unduhJudul: "Unduhan Berkas Data Agregat Paroki",
  unduhLead:
    "Seluruh berkas di bawah ini menyajikan tabulasi data agregat paroki yang telah melalui prosedur penyamaran data pribadi. Berkas-berkas ini " +
    "dapat dimanfaatkan untuk perencanaan karya pastoral tanpa memuat satu pun data perorangan warga.",
};

export const prinsipData = [
  {
    judul: "Data identitas pribadi tidak pernah keluar dari proses pembersihan",
    isi:
      "Nama lengkap, tempat dan tanggal lahir, alamat tinggal, nomor kontak pribadi, nomor induk kependudukan, serta nomor kartu keluarga " +
      "disaring dan ditiadakan pada tahap awal pembersihan data. Laporan ini murni menyajikan angka agregat, dan sistem otomatis " +
      "akan menolak proses kompilasi jika ditemukan data identitas pribadi yang lolos.",
  },
  {
    judul: "Penyamaran data pada kelompok berskala kecil",
    isi:
      `Setiap sel tabulasi lingkungan yang hanya memuat 1 sampai ${meta.ambang_penyamaran - 1} jiwa ditampilkan dengan ` +
      `keterangan "disamarkan", bukan angka nol. Ambang batas ${meta.ambang_penyamaran} jiwa ini diterapkan mengingat pada lingkungan kecil ` +
      `yang hanya dihuni ${n(lingkunganTerkecil.n)} jiwa, informasi mengenai segelintir orang dapat dengan mudah mengarah pada pengenalan pribadi tertentu.`,
  },
  {
    judul: "Atribut sensitif tidak ditabulasi silang hingga tingkat perorangan",
    isi:
      "Catatan kondisi kesehatan khusus, perekonomian keluarga, dan status perkawinan hanya disajikan sebagai sebaran tingkat paroki atau " +
      "agregat lingkungan tanpa tabulasi silang yang mempersempit identitas. Indeks prioritas kunjungan diformulasikan menjadi satu nilai skor tunggal per lingkungan guna menjaga kerahasiaan perorangan.",
  },
  {
    judul: "Data kosong bukan angka nol dan ditampilkan secara jujur",
    isi:
      "Kolom data yang kosong diklasifikasikan sebagai kategori “Tidak tercatat” dan senantiasa ditampilkan dengan pola arsir khusus pada grafik. " +
      "Tidak ada persentase yang dihitung secara tersembunyi di atas penyebut yang diperkecil tanpa penjelasan terbuka.",
  },
  {
    judul: "Anomali data dipaparkan secara transparan demi perbaikan bersama",
    isi:
      `Temuan kejanggalan tahun perkawinan, ${n(penutup.anomali[0]?.jumlah ?? 0)} baris data yang terindikasi ganda, serta ` +
      `selisih ${n(meta.selisih_keluarga)} keluarga antardokumen sumber dipaparkan secara jujur sebagai catatan audit demi penyempurnaan sistem informasi paroki.`,
  },
];
