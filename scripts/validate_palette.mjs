/**
 * validate_palette.mjs — gerbang keras untuk palet seri data (PRD §9.3, §14).
 *
 * Palet ini diturunkan dari SADASA Academy Design System (emas memimpin, merah
 * menyorot, arang membawa sisanya) lalu diuji terhadap ambang yang dituntut PRD:
 *
 *   1. Rentang kecerahan OKLCH  — tidak ada dua slot yang kecerahannya kembar.
 *   2. Ambang kroma             — setiap slot cukup berwarna untuk dibedakan.
 *   3. Pemisahan buta warna     — DeltaE CIEDE2000 di bawah simulasi deutan,
 *                                 protan, dan tritan.
 *   4. Ambang penglihatan normal.
 *   5. Kontras terhadap permukaan — setiap tanda >= 3:1 (WCAG non-teks).
 *
 * Bendera:
 *   --pairs adjacent  (baku) hanya memeriksa pasangan bersebelahan
 *   --pairs all       memeriksa seluruh pasangan (untuk sebar/gelembung)
 *   --json            keluarkan laporan JSON
 */

// ── Ambang ───────────────────────────────────────────────────────────────────
const GATES = {
  lightnessSpread: 0.05, // selisih L OKLCH minimal antar slot bersebelahan
  chromaMin: 0.04,
  deltaECvdMin: 8.0,
  deltaENormalMin: 15.0,
  contrastMin: 3.0,
};

// ── Palet seri data ──────────────────────────────────────────────────────────
// Urutan tetap, tidak pernah diputar ulang. Slot 1 emas dan slot 2 merah adalah
// urutan chart SADASA; nilainya digelapkan pada mode terang supaya lolos gerbang
// kontras 3:1 terhadap kertas — emas #F1B91A hanya aman di atas bidang gelap.
export const SERIES = {
  light: [
    { slot: 1, nama: "Emas tua", hex: "#B37E0D" },
    { slot: 2, nama: "Merah SADASA", hex: "#C40000" },
    { slot: 3, nama: "Biru arsip", hex: "#064B9B" },
    { slot: 4, nama: "Hijau lumut", hex: "#3E8A5C" },
    { slot: 5, nama: "Sepia tua", hex: "#4F2E0E" },
  ],
  ink: [
    { slot: 1, nama: "Emas SADASA", hex: "#F8C339" },
    { slot: 2, nama: "Merah artwork", hex: "#E45348" },
    { slot: 3, nama: "Biru arsip terang", hex: "#8CBBF4" },
    { slot: 4, nama: "Hijau lumut terang", hex: "#37BB8C" },
    { slot: 5, nama: "Pasir", hex: "#88704E" },
  ],
};

// Palet kategori tanpa merah (--kat-1 … --kat-5): lima kelompok wilayah dan grafik
// kategori generasi kedua. Diuji pada pasangan bersebelahan karena setiap bentuk
// yang memakainya menjaga urutan slot: kolom treemap berurutan, blok baris sebaran
// lingkungan, dan sektor waffle serta hemisiklus.
export const KATEGORI = {
  light: [
    { slot: 1, nama: "Emas tua", hex: "#B37E0D" },
    { slot: 2, nama: "Biru arsip", hex: "#064B9B" },
    { slot: 3, nama: "Hijau lumut", hex: "#3E8A5C" },
    { slot: 4, nama: "Ungu", hex: "#7B4FA0" },
    { slot: 5, nama: "Sepia tua", hex: "#4F2E0E" },
  ],
  ink: [
    { slot: 1, nama: "Emas SADASA", hex: "#F8C339" },
    { slot: 2, nama: "Biru arsip terang", hex: "#8CBBF4" },
    { slot: 3, nama: "Hijau lumut terang", hex: "#37BB8C" },
    { slot: 4, nama: "Ungu terang", hex: "#9478D2" },
    { slot: 5, nama: "Pasir", hex: "#8E7658" },
  ],
};

// Ramp sekuensial untuk tabel panas lingkungan (adegan 5.2): satu warna, terang
// ke gelap, diuji sebagai ramp ordinal.
export const RAMP = {
  light: ["#E4D8BE", "#CFB877", "#B8973B", "#96761C", "#6B540F"],
  ink: ["#4A3A0C", "#6B540F", "#96761C", "#C6A44A", "#E9CE86"],
};

// Pasangan divergen dan warna status.
export const DIVERGENT = {
  light: { rendah: "#1F5C8C", netral: "#EDE8E0", tinggi: "#C40000" },
  ink: { rendah: "#6FA8D4", netral: "#33302C", tinggi: "#E8615C" },
};

export const SURFACE = {
  light: { page: "#FDFBF7", card: "#FFFFFF" },
  ink: { page: "#2A1512", card: "#3A1E19" },
};

// ── sRGB / OKLab / Lab ───────────────────────────────────────────────────────
export const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab([r, g, b]) {
  const [R, G, B] = [r, g, b].map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklch(hex) {
  const [L, a, b] = toOklab(hexToRgb(hex));
  return { L, C: Math.hypot(a, b), h: (Math.atan2(b, a) * 180) / Math.PI };
}

function toXyz([r, g, b]) {
  const [R, G, B] = [r, g, b].map(srgbToLinear);
  return [
    0.4124564 * R + 0.3575761 * G + 0.1804375 * B,
    0.2126729 * R + 0.7151522 * G + 0.072175 * B,
    0.0193339 * R + 0.119192 * G + 0.9503041 * B,
  ];
}

export function toLab(rgb) {
  const [X, Y, Z] = toXyz(rgb);
  const ref = [0.95047, 1.0, 1.08883];
  const f = [X, Y, Z].map((v, i) => {
    const t = v / ref[i];
    return t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27) * t / 116 + 16 / 116;
  });
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}

// ── CIEDE2000 ────────────────────────────────────────────────────────────────
export function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  const hp = (b, ap) => {
    if (b === 0 && ap === 0) return 0;
    const d = (Math.atan2(b, ap) * 180) / Math.PI;
    return d >= 0 ? d : d + 360;
  };
  const hp1 = hp(b1, ap1);
  const hp2 = hp(b2, ap2);
  const dLp = L2 - L1;
  const dCp = Cp2 - Cp1;
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) {
    dhp = hp2 - hp1;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * rad) / 2);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (Cp1 + Cp2) / 2;
  let hbp = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(hp1 - hp2) > 180) hbp += hp1 + hp2 < 360 ? 360 : -360;
    hbp /= 2;
  }
  const T =
    1 -
    0.17 * Math.cos((hbp - 30) * rad) +
    0.24 * Math.cos(2 * hbp * rad) +
    0.32 * Math.cos((3 * hbp + 6) * rad) -
    0.2 * Math.cos((4 * hbp - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh),
  );
}

// ── Simulasi buta warna (Machado, Oliveira & Fernandes 2009, keparahan 1,0) ──
const CVD = {
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

export function simulate(hex, kind) {
  const m = CVD[kind];
  const lin = hexToRgb(hex).map(srgbToLinear);
  const out = m.map((row) => row.reduce((s, v, i) => s + v * lin[i], 0));
  return out.map((v) => Math.min(1, Math.max(0, linearToSrgb(v))));
}

// ── Kontras WCAG ─────────────────────────────────────────────────────────────
const luminance = (rgb) => {
  const [R, G, B] = rgb.map(srgbToLinear);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};
export const contrast = (a, b) => {
  const [x, y] = [luminance(hexToRgb(a)), luminance(hexToRgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// ── Pemeriksaan ──────────────────────────────────────────────────────────────
function pairs(list, mode) {
  const out = [];
  if (mode === "all") {
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) out.push([list[i], list[j]]);
  } else {
    for (let i = 0; i + 1 < list.length; i++) out.push([list[i], list[i + 1]]);
  }
  return out;
}

function checkMode(mode, theme, pairMode) {
  const list = SERIES[theme];
  const surface = SURFACE[theme].page;
  const res = { tema: theme, pemeriksaan: [] };
  const add = (nama, lolos, detail) => res.pemeriksaan.push({ nama, lolos, detail });

  // 1. Rentang kecerahan
  const Ls = list.map((s) => ({ ...s, L: oklch(s.hex).L }));
  const sorted = [...Ls].sort((a, b) => a.L - b.L);
  let worstL = Infinity;
  let worstLPair = "";
  for (let i = 0; i + 1 < sorted.length; i++) {
    const d = sorted[i + 1].L - sorted[i].L;
    if (d < worstL) {
      worstL = d;
      worstLPair = `${sorted[i].nama} / ${sorted[i + 1].nama}`;
    }
  }
  add("Rentang kecerahan OKLCH", worstL >= GATES.lightnessSpread,
      `terburuk ΔL ${worstL.toFixed(3)} (${worstLPair}), ambang ${GATES.lightnessSpread}`);

  // 2. Kroma
  const chromas = list.map((s) => ({ nama: s.nama, C: oklch(s.hex).C }));
  const minC = chromas.reduce((m, c) => (c.C < m.C ? c : m));
  add("Ambang kroma", minC.C >= GATES.chromaMin,
      `terendah C ${minC.C.toFixed(3)} (${minC.nama}), ambang ${GATES.chromaMin}`);

  // 3. Pemisahan buta warna
  const ps = pairs(list, pairMode);
  for (const kind of ["deutan", "protan", "tritan"]) {
    let worst = Infinity;
    let who = "";
    for (const [a, b] of ps) {
      const d = deltaE2000(toLab(simulate(a.hex, kind)), toLab(simulate(b.hex, kind)));
      if (d < worst) {
        worst = d;
        who = `${a.nama} / ${b.nama}`;
      }
    }
    add(`Pemisahan buta warna (${kind})`, worst >= GATES.deltaECvdMin,
        `terburuk ΔE ${worst.toFixed(1)} (${who}), ambang ${GATES.deltaECvdMin}`);
  }

  // 4. Penglihatan normal
  let worstN = Infinity;
  let whoN = "";
  for (const [a, b] of ps) {
    const d = deltaE2000(toLab(hexToRgb(a.hex)), toLab(hexToRgb(b.hex)));
    if (d < worstN) {
      worstN = d;
      whoN = `${a.nama} / ${b.nama}`;
    }
  }
  add("Ambang penglihatan normal", worstN >= GATES.deltaENormalMin,
      `terburuk ΔE ${worstN.toFixed(1)} (${whoN}), ambang ${GATES.deltaENormalMin}`);

  // 5. Kontras terhadap permukaan
  const cs = list.map((s) => ({ nama: s.nama, r: contrast(s.hex, surface) }));
  const minCon = cs.reduce((m, c) => (c.r < m.r ? c : m));
  add("Kontras terhadap permukaan", minCon.r >= GATES.contrastMin,
      `terendah ${minCon.r.toFixed(2)}:1 (${minCon.nama} pada ${surface}), ambang ${GATES.contrastMin}:1`);

  // 6. Ramp sekuensial: monoton dan setiap langkah terbedakan
  const ramp = RAMP[theme];
  const rl = ramp.map((h) => oklch(h).L);
  const monoton = rl.every((v, i) => i === 0 || (theme === "light" ? v < rl[i - 1] : v > rl[i - 1]));
  let worstR = Infinity;
  for (let i = 0; i + 1 < ramp.length; i++) {
    worstR = Math.min(worstR, deltaE2000(toLab(hexToRgb(ramp[i])), toLab(hexToRgb(ramp[i + 1]))));
  }
  add("Ramp sekuensial monoton", monoton, `L: ${rl.map((v) => v.toFixed(2)).join(" → ")}`);
  add("Langkah ramp terbedakan", worstR >= 6, `terkecil ΔE ${worstR.toFixed(1)}, ambang 6`);

  // 7. Batas jumlah seri untuk bentuk yang menampilkan semua pasangan sekaligus
  // (sebar, gelembung). Bukan kegagalan — sebuah batas yang harus dicatat, karena
  // kategori di luar batas SELALU dilipat menjadi "Lainnya" (PRD §9.3).
  let batas = 1;
  for (let k = 2; k <= list.length; k++) {
    let worst = Infinity;
    for (let i = 0; i < k; i++)
      for (let j = i + 1; j < k; j++)
        for (const kind of ["deutan", "protan", "tritan"])
          worst = Math.min(
            worst,
            deltaE2000(toLab(simulate(list[i].hex, kind)), toLab(simulate(list[j].hex, kind))),
          );
    if (worst >= GATES.deltaECvdMin) batas = k;
    else break;
  }
  add("Batas seri (semua pasangan)", batas >= 4,
      `aman sampai ${batas} slot pertama; kategori berikutnya dilipat menjadi "Lainnya"`);

  // 8. Divergen
  const dv = DIVERGENT[theme];
  const dDiv = deltaE2000(toLab(hexToRgb(dv.rendah)), toLab(hexToRgb(dv.tinggi)));
  let worstDiv = dDiv;
  for (const kind of ["deutan", "protan", "tritan"]) {
    worstDiv = Math.min(
      worstDiv,
      deltaE2000(toLab(simulate(dv.rendah, kind)), toLab(simulate(dv.tinggi, kind))),
    );
  }
  add("Pasangan divergen", worstDiv >= GATES.deltaECvdMin,
      `terburuk ΔE ${worstDiv.toFixed(1)} termasuk simulasi buta warna, ambang ${GATES.deltaECvdMin}`);

  // 9. Palet kategori tanpa merah: kecerahan, pemisahan bersebelahan, kontras.
  const kat = KATEGORI[theme];
  const katL = kat.map((s) => oklch(s.hex).L).sort((a, b) => a - b);
  const katSpread = Math.min(...katL.slice(1).map((v, i) => v - katL[i]));
  let katCvd = Infinity;
  let katNormal = Infinity;
  for (let i = 0; i + 1 < kat.length; i++) {
    const [a, b] = [kat[i].hex, kat[i + 1].hex];
    katNormal = Math.min(katNormal, deltaE2000(toLab(hexToRgb(a)), toLab(hexToRgb(b))));
    for (const kind of ["deutan", "protan", "tritan"]) {
      katCvd = Math.min(katCvd, deltaE2000(toLab(simulate(a, kind)), toLab(simulate(b, kind))));
    }
  }
  const katKontras = Math.min(...kat.map((s) => contrast(s.hex, surface)));
  add("Palet kategori: kecerahan", katSpread >= GATES.lightnessSpread,
      `terburuk ΔL ${katSpread.toFixed(3)}, ambang ${GATES.lightnessSpread}`);
  add("Palet kategori: buta warna", katCvd >= GATES.deltaECvdMin,
      `terburuk ΔE ${katCvd.toFixed(1)} bersebelahan, ambang ${GATES.deltaECvdMin}`);
  add("Palet kategori: penglihatan normal", katNormal >= GATES.deltaENormalMin,
      `terburuk ΔE ${katNormal.toFixed(1)} bersebelahan, ambang ${GATES.deltaENormalMin}`);
  add("Palet kategori: kontras", katKontras >= GATES.contrastMin,
      `terendah ${katKontras.toFixed(2)}:1 pada ${surface}, ambang ${GATES.contrastMin}:1`);

  res.lolos = res.pemeriksaan.every((p) => p.lolos);
  return res;
}

// ── Jalankan ─────────────────────────────────────────────────────────────────
if (!process.env.PALETTE_IMPORT) run();
function run() {
const argv = process.argv.slice(2);
const pairMode = argv.includes("--pairs") ? argv[argv.indexOf("--pairs") + 1] : "adjacent";
const asJson = argv.includes("--json");

const report = {
  mode_pasangan: pairMode,
  ambang: GATES,
  hasil: [checkMode("terang", "light", pairMode), checkMode("gelap", "ink", pairMode)],
};
report.lolos = report.hasil.every((h) => h.lolos);

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const label = { light: "TERANG", ink: "GELAP" };
  console.log(`[palette] mode pasangan: ${pairMode}\n`);
  for (const h of report.hasil) {
    console.log(`  ── ${label[h.tema]} ${h.lolos ? "" : "  << ADA YANG GAGAL"}`);
    for (const p of h.pemeriksaan) {
      console.log(`     ${p.lolos ? "lolos" : "GAGAL"}  ${p.nama.padEnd(34)} ${p.detail}`);
    }
    console.log("");
  }
  console.log(report.lolos ? "[palette] seluruh gerbang lolos" : "[palette] GAGAL");
}

process.exit(report.lolos ? 0 : 1);
}
