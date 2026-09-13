/**
 * Lapisan data — satu-satunya jalan masuk JSON turunan ke halaman.
 *
 * Seluruh angka di layar, termasuk angka yang berada di dalam kalimat naskah,
 * berasal dari berkas-berkas ini. Tidak ada angka yang diketik manual di dalam
 * komponen atau di dalam src/i18n/id.ts (PRD §8.4, §14).
 */
import metaRaw from "../data/derived/meta.json";
import pembukaRaw from "../data/derived/pembuka.json";
import pilar1Raw from "../data/derived/pilar1.json";
import pilar2Raw from "../data/derived/pilar2.json";
import pilar3Raw from "../data/derived/pilar3.json";
import pilar4Raw from "../data/derived/pilar4.json";
import pilar5Raw from "../data/derived/pilar5.json";
import penutupRaw from "../data/derived/penutup.json";

// ── Bentuk data ─────────────────────────────────────────────────────────────
export interface Sumber {
  berkas: string;
  kolom: string;
  penyebut: string;
}

export interface Row {
  label: string;
  n: number | null;
  pct: number | null;
  disamarkan: boolean;
  wilayah?: string;
  kelompok?: string;
}

/** Satu sel tabulasi. `n` null dengan `disamarkan` true berarti 1–4 jiwa. */
export interface Cell {
  n: number | null;
  disamarkan: boolean;
}

export interface PyramidRow {
  label: string;
  laki: Cell;
  perempuan: Cell;
  tidak_tercatat: Cell;
}

export interface LingkunganRow {
  label: string;
  wilayah: string;
  kelompok: string;
  jiwa: number;
  keluarga: number;
  lansia: number;
  p_lansia: number;
  perlu_bantuan: number;
  p_bantuan: number;
  rt_satu_orang: number;
  p_solo: number;
  skor: number;
  peringkat: number;
}

export interface Scene {
  id: string;
  penyebut: number;
  rows: Row[];
  sumber: Sumber;
  [key: string]: unknown;
}

/** Satu kelompok wilayah (pipeline/mappings/kelompok_wilayah.json). */
export interface KelompokInfo {
  label: string;
  /** Slot palet kategori --kat-1 … --kat-5; urutan = urutan tampil. */
  slot: number;
  /** Nama wilayah anggota, terurut dari jumlah jiwa terbesar. */
  wilayah: string[];
  jiwa: number;
  lingkungan: number;
}

export interface Meta {
  paroki: string;
  snapshot: string;
  snapshot_label: string;
  snapshot_terkonfirmasi: boolean;
  snapshot_catatan: string;
  ambang_penyamaran: number;
  umat_total: number;
  keluarga_total: number;
  keluarga_umatkk: number;
  selisih_keluarga: number;
  lingkungan_total: number;
  wilayah_total: number;
  lingkungan_master: number;
  lingkungan_tanpa_jiwa: string[];
  baris_paroki_lain: number;
  umur_valid: number;
  umur_tidak_dapat_dihitung: number;
  kelompok: KelompokInfo[];
}

export interface CelahData {
  kolom: string;
  sumber: string;
  kosong: number;
  dari: number;
  pct: number;
  adegan: string | null;
  akibat: string;
}

export interface Anomali {
  temuan: string;
  jumlah: number;
  kelompok: number | null;
  perlakuan: string;
}

export interface Usulan {
  usul: string;
  besaran: number | null;
  satuan: string | null;
  adegan: string | null;
}

export interface Penutup {
  celah_data: CelahData[];
  anomali: Anomali[];
  usulan_pembaruan: Usulan[];
}

// ── Data ────────────────────────────────────────────────────────────────────
export const meta = metaRaw as Meta;
export const penutup = penutupRaw as unknown as Penutup;

/** Lima kelompok wilayah, berurutan sesuai slot warna. */
export const kelompok: KelompokInfo[] = meta.kelompok;

const files: Record<string, Record<string, unknown>> = {
  pembuka: pembukaRaw as Record<string, unknown>,
  pilar1: pilar1Raw as unknown as Record<string, unknown>,
  pilar2: pilar2Raw as unknown as Record<string, unknown>,
  pilar3: pilar3Raw as unknown as Record<string, unknown>,
  pilar4: pilar4Raw as unknown as Record<string, unknown>,
  pilar5: pilar5Raw as unknown as Record<string, unknown>,
};

/**
 * Ambil satu adegan berdasarkan nomornya, misalnya `adegan("2.1")`.
 * Melempar bila nomornya tidak ada, supaya kesalahan ketik tertangkap saat
 * build, bukan menjadi halaman kosong.
 */
export function adegan(id: string): Scene {
  const berkas = id.startsWith("0") ? "pembuka" : `pilar${id[0]}`;
  const isi = files[berkas];
  if (!isi || !(id in isi)) {
    throw new Error(`Adegan ${id} tidak ada di ${berkas}.json`);
  }
  return isi[id] as Scene;
}

/** Ambil satu angka turunan dari adegan; melempar bila bukan angka. */
export function angka(id: string, kunci: string): number {
  const v = adegan(id)[kunci];
  if (typeof v !== "number") {
    throw new Error(`Adegan ${id}: '${kunci}' bukan angka (${JSON.stringify(v)})`);
  }
  return v;
}

/** Ambil satu baris adegan berdasarkan labelnya. */
export function baris(id: string, label: string): Row {
  const r = adegan(id).rows.find((x) => x.label === label);
  if (!r) throw new Error(`Adegan ${id}: baris '${label}' tidak ada`);
  return r;
}

/** Nilai `n` satu baris adegan. Melempar bila disamarkan atau kosong. */
export function nilai(id: string, label: string): number {
  const r = baris(id, label);
  if (r.n === null) throw new Error(`Adegan ${id}: baris '${label}' tidak bernilai`);
  return r.n;
}

export function objek<T>(id: string, kunci: string): T {
  const v = adegan(id)[kunci];
  if (v === undefined || v === null) {
    throw new Error(`Adegan ${id}: '${kunci}' tidak ada`);
  }
  return v as T;
}

export function pyramidRows(id: string): PyramidRow[] {
  return adegan(id).rows as unknown as PyramidRow[];
}

export function lingkunganRows(id: string): LingkunganRow[] {
  return adegan(id).rows as unknown as LingkunganRow[];
}
