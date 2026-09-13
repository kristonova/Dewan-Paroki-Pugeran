/**
 * check_build.mjs — pemeriksaan hasil build, gerbang terakhir `npm run verify`.
 *
 * Yang diperiksa (PRD §14):
 *  · Tidak ada satu pun permintaan ke domain luar (huruf, skrip, gaya, gambar).
 *  · Halaman penuh di bawah 2 MB.
 *  · Seluruh 27 adegan bernomor dan 3 bagian penutup ada di HTML.
 *  · Setiap grafik punya label aksesibel dan tabel angka alternatif.
 *  · Tidak ada istilah basis data mentah yang muncul di naskah.
 *  · Tidak ada data individu di seluruh keluaran.
 *  · Berkas unduhan agregat benar-benar ada.
 *  · Service worker dan huruf tersedia.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const gagal = [];
const catatan = [];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const berkas = await walk(DIST);
const html = await readFile(join(DIST, "index.html"), "utf8");

// ── 1. Tidak ada permintaan ke domain luar ───────────────────────────────────
const luar = [...html.matchAll(/(?:src|href|url\()\s*=?\s*["'(]?(https?:\/\/[^"')\s>]+)/gi)]
  .map((m) => m[1])
  .filter((u) => !u.startsWith("http://www.w3.org/"));
if (luar.length) gagal.push(`permintaan ke domain luar: ${[...new Set(luar)].join(", ")}`);
else catatan.push("tidak ada permintaan ke domain luar");

// ── 2. Ukuran halaman penuh ──────────────────────────────────────────────────
const perluDimuat = berkas.filter((f) => !/\.(csv|map)$/.test(f) && !f.endsWith("sw.js"));
let bytes = 0;
for (const f of perluDimuat) bytes += (await stat(f)).size;
const mb = bytes / (1024 * 1024);
if (mb > 2) gagal.push(`halaman penuh ${mb.toFixed(2)} MB, di atas batas 2 MB`);
else catatan.push(`halaman penuh ${mb.toFixed(2)} MB (batas 2 MB)`);
catatan.push(`index.html ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);

// ── 3. Kelengkapan adegan ────────────────────────────────────────────────────
const adeganWajib = [
  "1.1", "1.2", "1.3", "1.4", "1.5", "1.6",
  "2.1", "2.2", "2.3", "2.4", "2.5", "2.6",
  "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7",
  "4.1", "4.2", "4.3", "4.4", "4.5", "4.6",
  "5.1", "5.2", "5.3", "5.4", "5.5", "5.6",
];
const penutupWajib = ["6-1", "6-2", "6-3"];
const hilang = adeganWajib
  .map((id) => `adegan-${id.replace(".", "-")}`)
  .concat(penutupWajib.map((id) => `adegan-${id}`))
  .filter((slug) => !html.includes(`id="${slug}"`));
if (hilang.length) gagal.push(`adegan hilang dari halaman: ${hilang.join(", ")}`);
else catatan.push(`${adeganWajib.length} adegan bernomor + ${penutupWajib.length} bagian penutup ada`);

if (!html.includes('id="pembuka"')) gagal.push("adegan pembuka 0.0 hilang");

// ── 4. Setiap grafik punya label aksesibel dan tabel angka alternatif ────────
const svgGrafik = [...html.matchAll(/<svg[^>]*role="img"[^>]*>/g)];
const tanpaLabel = svgGrafik.filter((m) => !/aria-label="[^"]+"/.test(m[0]));
if (tanpaLabel.length) gagal.push(`${tanpaLabel.length} grafik SVG tanpa aria-label`);

// Grafik interaktif: kontainer [data-viz] wajib dapat difokus dan berlabel, dan
// setiap tanda bertooltip wajib punya nilai. Tooltip tidak boleh menjadi satu-
// satunya jalan membaca angka — tabel angka alternatif tetap diperiksa di bawah.
const vizGrafik = [...html.matchAll(/<[a-z]+\b[^>]*\sdata-viz(?:=""|[\s>])[^>]*>/g)].map((m) => m[0]);
const vizCacat = vizGrafik.filter((t) => !/tabindex="0"/.test(t) || !/aria-label="[^"]+"/.test(t));
const tandaTanpaNilai = [...html.matchAll(/<[a-z]+\b[^>]*\sdata-t="[^"]*"[^>]*>/g)]
  .filter((m) => !/\sdata-v="[^"]+"/.test(m[0])).length;
if (vizGrafik.length < 25) {
  gagal.push(`hanya ${vizGrafik.length} grafik interaktif; setiap adegan bergrafik harus punya satu`);
} else if (vizCacat.length) {
  gagal.push(`${vizCacat.length} grafik interaktif tanpa tabindex atau aria-label`);
} else if (tandaTanpaNilai) {
  gagal.push(`${tandaTanpaNilai} tanda bertooltip tanpa nilai`);
} else {
  catatan.push(`${vizGrafik.length} grafik interaktif, semuanya dapat difokus dan berlabel aksesibel`);
}

const jumlahTabelAlt = (html.match(/class="tabel-alt"/g) || []).length;
if (jumlahTabelAlt < 25) {
  gagal.push(`hanya ${jumlahTabelAlt} tabel angka alternatif; setiap grafik harus punya satu`);
} else {
  catatan.push(`${jumlahTabelAlt} tabel angka alternatif`);
}

const jumlahFigcaption = (html.match(/<figcaption/g) || []).length;
if (jumlahFigcaption < 20) gagal.push(`hanya ${jumlahFigcaption} figcaption`);
else catatan.push(`${jumlahFigcaption} figcaption`);

// Setiap adegan menyebut sumbernya.
const jumlahSumber = (html.match(/class="sumber"/g) || []).length;
if (jumlahSumber < adeganWajib.length) {
  gagal.push(`hanya ${jumlahSumber} baris sumber untuk ${adeganWajib.length} adegan`);
} else {
  catatan.push(`${jumlahSumber} baris sumber`);
}

// ── 5. Tidak ada istilah basis data mentah di naskah ────────────────────────
const teksSaja = html
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/class="sumber"[\s\S]{0,400}?<\/p>/g, " ")
  .replace(/<[^>]+>/g, " ");
const istilah = ["G+L aktif", "G nonP", "non A", "Sah BA", "Sah BG", "Nikah LG",
                 "KbM", "P. Link", "P. Kategorial", "Anggota DP", "diParoki",
                 "Kost diP", "S meningat", "keterlambanan"];
const bocorIstilah = istilah.filter((t) => teksSaja.includes(t));
if (bocorIstilah.length) gagal.push(`istilah basis data mentah di naskah: ${bocorIstilah.join(", ")}`);
else catatan.push("tidak ada istilah basis data mentah di naskah");

// ── 5b. Tidak ada markup yang tampil sebagai teks ───────────────────────────
// Naskah yang memakai b() tetapi dirender tanpa set:html akan tampil sebagai
// "<b>12.614 jiwa</b>" mentah di halaman. Tidak ada gerbang lain yang menangkapnya.
const markupBocor = html.match(/&lt;\/?(?:b|strong|em|i|br|span|code)\b[^&]{0,40}&gt;/g);
if (markupBocor) gagal.push(`markup tampil sebagai teks: ${[...new Set(markupBocor)].slice(0, 4).join(", ")}`);
else catatan.push("tidak ada markup yang tampil sebagai teks");

// ── 6. Tidak ada data individu di seluruh keluaran ──────────────────────────
const angkaPanjang = /\b\d{12,}\b/;
const tanggalPenuh = /\b(19|20)\d{2}-\d{2}-\d{2}\b/;
const bocorPII = [];
for (const f of berkas.filter((x) => /\.(html|json|csv|js)$/.test(x))) {
  const isi = await readFile(f, "utf8");
  const rel = relative(DIST, f).split(sep).join("/");
  if (angkaPanjang.test(isi)) bocorPII.push(`${rel}: angka 12 digit atau lebih`);
  if (tanggalPenuh.test(isi)) bocorPII.push(`${rel}: tanggal penuh`);
  if (/\bNIK\b/.test(isi)) bocorPII.push(`${rel}: menyebut NIK`);
}
if (bocorPII.length) gagal.push(`dugaan data individu di keluaran: ${bocorPII.slice(0, 5).join("; ")}`);
else catatan.push("tidak ada dugaan data individu di keluaran");

// ── 7. Unduhan agregat, huruf, dan service worker tersedia ──────────────────
const csv = berkas.filter((f) => f.endsWith(".csv"));
if (csv.length < 15) gagal.push(`hanya ${csv.length} berkas unduhan agregat`);
else catatan.push(`${csv.length} berkas unduhan agregat`);

const tautanCsv = [...html.matchAll(/href="\.\/data\/([^"]+\.csv)"/g)].map((m) => m[1]);
const csvHilang = [...new Set(tautanCsv)].filter(
  (name) => !csv.some((f) => f.endsWith(`${sep}${name}`)),
);
if (csvHilang.length) gagal.push(`tautan unduhan menunjuk berkas yang tidak ada: ${csvHilang.join(", ")}`);

const fonts = berkas.filter((f) => f.endsWith(".woff2"));
if (fonts.length < 5) gagal.push(`hanya ${fonts.length} berkas huruf di dist/fonts`);
else catatan.push(`${fonts.length} berkas huruf di-host sendiri`);

if (!berkas.some((f) => f.endsWith("sw.js"))) gagal.push("service worker tidak dibangun");
else catatan.push("service worker dibangun");

// ── 8. Isi tetap terbaca dengan JavaScript dimatikan ───────────────────────
// Efek kemunculan adegan menyembunyikan isi lewat opacity. Aturan itu HARUS
// berada di balik kelas .js yang hanya dipasang oleh skrip; kalau tidak,
// mematikan JavaScript membuat seluruh cerita tidak terlihat.
const gayaTerpasang = (html.match(/<style[\s\S]*?<\/style>/g) ?? []).join(" ");
const revealTanpaPagar = /(?<!\.js )\.adegan\[data-reveal\]\s*\{[^}]*opacity\s*:\s*0/.test(gayaTerpasang);
if (revealTanpaPagar) {
  gagal.push("aturan opacity:0 pada adegan tidak dipagari kelas .js; isi hilang bila JavaScript dimatikan");
} else if (gayaTerpasang.includes(".js .adegan[data-reveal]")) {
  catatan.push("efek kemunculan adegan dipagari kelas .js; isi terbaca tanpa JavaScript");
} else {
  gagal.push("gaya kemunculan adegan tidak ditemukan di HTML");
}

// ── 9. Jalur aset relatif, supaya dist/ dapat dibuka dari USB (file:) ──────
const akarRelatif = [...html.matchAll(/(?:src|href)="(\/[^"/][^"]*)"/g)].map((m) => m[1]);
if (akarRelatif.length) {
  gagal.push(`jalur aset berawalan garis miring (putus bila dibuka lewat file:): ${[...new Set(akarRelatif)].slice(0, 6).join(", ")}`);
} else {
  catatan.push("seluruh jalur aset relatif; dist/ dapat disalin ke USB dan dibuka langsung");
}

// ── 10. Struktur judul berurutan dan bahasa halaman ────────────────────────
if (!/<html[^>]*lang="id"/.test(html)) gagal.push('atribut lang="id" hilang');
const h1 = (html.match(/<h1[\s>]/g) || []).length;
if (h1 !== 1) gagal.push(`halaman memuat ${h1} elemen h1, seharusnya tepat satu`);
else catatan.push("struktur judul dimulai dari satu h1");

// ── Laporan ─────────────────────────────────────────────────────────────────
for (const c of catatan) console.log(`[check] lolos: ${c}`);
if (gagal.length) {
  for (const g of gagal) console.error(`[check] GAGAL: ${g}`);
  console.error(`[check] pemeriksaan hasil build GAGAL dengan ${gagal.length} pelanggaran`);
  process.exit(1);
}
console.log("[check] pemeriksaan hasil build lolos");
