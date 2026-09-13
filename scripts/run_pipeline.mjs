/**
 * run_pipeline.mjs — jalankan tahap-tahap pipeline dengan penerjemah Python yang
 * benar.
 *
 * Memakai .venv proyek bila ada, supaya `npm run data` bekerja tanpa perlu
 * mengaktifkan lingkungan lebih dahulu. Keluaran dipaksa UTF-8 agar teks
 * Indonesia terbaca di konsol Windows.
 *
 *   node scripts/run_pipeline.mjs 00_load.py 01_clean.py 02_aggregate.py
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

const kandidat = [
  join(ROOT, ".venv", "Scripts", "python.exe"),
  join(ROOT, ".venv", "bin", "python"),
];
const python = kandidat.find((p) => existsSync(p)) ?? "python";

const tahap = process.argv.slice(2);
if (tahap.length === 0) {
  console.error("[pipeline] sebutkan setidaknya satu tahap, misalnya 00_load.py");
  process.exit(2);
}

for (const t of tahap) {
  const berkas = join(ROOT, "pipeline", t);
  if (!existsSync(berkas)) {
    console.error(`[pipeline] tahap tidak ditemukan: ${berkas}`);
    process.exit(1);
  }
  const hasil = spawnSync(python, [berkas], {
    stdio: "inherit",
    cwd: ROOT,
    env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
  });
  if (hasil.status !== 0) {
    console.error(`[pipeline] ${t} berhenti dengan kode ${hasil.status}`);
    process.exit(hasil.status ?? 1);
  }
}
