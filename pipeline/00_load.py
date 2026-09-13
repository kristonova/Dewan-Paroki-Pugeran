"""Tahap 0 — baca lima berkas .dbf dan satukan hierarki wilayah–lingkungan–keluarga.

Berkas .dbf dibaca langsung. Turunan .csv/.xlsx di data/processed/ adalah hasil
konversi manual sebelumnya dan TIDAK menjadi masukan pipeline, agar hanya ada
satu sumber untuk satu fakta (PRD §5.1).

Keluaran: pipeline/work/raw_*.parquet + raw_counts.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd
from dbfread import DBF

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import PAROKI_CODE, RAW, WORK, log, norm_text  # noqa: E402

SOURCES = {
    "umat": "umat.dbf",
    "umatkk": "umatkk.dbf",
    "lingkung": "lingkung.dbf",
    "stasi": "stasi.dbf",
    "paroki": "paroki.dbf",
}


def read_dbf(path: Path) -> pd.DataFrame:
    table = DBF(str(path), encoding="latin-1", char_decode_errors="replace", load=False)
    df = pd.DataFrame(iter(table))
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].map(lambda v: norm_text(v) if isinstance(v, str) else v)
    return df


def main() -> int:
    counts: dict[str, object] = {}
    frames: dict[str, pd.DataFrame] = {}

    for name, fname in SOURCES.items():
        path = RAW / fname
        if not path.exists():
            log("00_load", f"GAGAL: berkas sumber tidak ditemukan: {path}")
            return 1
        df = read_dbf(path)
        frames[name] = df
        counts[name] = {"baris": int(df.shape[0]), "kolom": int(df.shape[1])}
        log("00_load", f"{fname}: {df.shape[0]} baris, {df.shape[1]} kolom")

    umat, lingkung, stasi = frames["umat"], frames["lingkung"], frames["stasi"]

    # ── Hierarki. Baris yang kode parokinya bukan Pugeran dipisahkan, tidak dihapus.
    umat["_paroki"] = umat["PAROKI"].map(norm_text)
    umat["_wilayah"] = umat["WILAYAH"].map(norm_text)
    umat["_lingkungan"] = umat["LINGKUNGAN"].map(norm_text)
    luar = umat["_paroki"] != PAROKI_CODE
    counts["umat_luar_paroki"] = int(luar.sum())
    if luar.any():
        log("00_load", f"catatan: {int(luar.sum())} baris berkode paroki lain "
                       f"({sorted(set(umat.loc[luar, '_wilayah']))}) — dipertahankan dan ditandai")

    nama_wilayah = dict(zip(stasi["WILAYAH"].map(norm_text), stasi["KET"].map(norm_text)))
    nama_lingkungan = dict(zip(lingkung["LINGKUNGAN"].map(norm_text), lingkung["KET"].map(norm_text)))
    lingkungan_ke_wilayah = dict(zip(lingkung["LINGKUNGAN"].map(norm_text),
                                     lingkung["WILAYAH"].map(norm_text)))

    umat["nama_wilayah"] = umat["_wilayah"].map(nama_wilayah)
    umat["nama_lingkungan"] = umat["_lingkungan"].map(nama_lingkungan)
    umat["_dalam_paroki"] = ~luar

    tanpa_nama = umat.loc[umat["_dalam_paroki"] & umat["nama_lingkungan"].isna(), "_lingkungan"]
    counts["lingkungan_tanpa_master"] = sorted(set(tanpa_nama))
    counts["lingkungan_master"] = int(lingkung.shape[0])
    counts["wilayah_master"] = int(stasi.shape[0])
    counts["lingkungan_terpakai"] = int(
        umat.loc[umat["_dalam_paroki"], "_lingkungan"].nunique())
    counts["wilayah_terpakai"] = int(umat.loc[umat["_dalam_paroki"], "_wilayah"].nunique())
    counts["keluarga_umat"] = int(umat["NP"].map(norm_text).nunique())
    counts["keluarga_umatkk"] = int(frames["umatkk"]["NP"].map(norm_text).nunique())
    counts["selisih_keluarga"] = counts["keluarga_umat"] - counts["keluarga_umatkk"]

    # Lingkungan master yang tidak memuat satu jiwa pun — dilaporkan, tidak dibuang.
    terpakai = set(umat.loc[umat["_dalam_paroki"], "_lingkungan"])
    counts["lingkungan_tanpa_jiwa"] = sorted(
        {k: v for k, v in nama_lingkungan.items() if k not in terpakai}.values())

    frames["umat"] = umat
    frames["lingkung"] = lingkung.assign(
        _wilayah=lingkung["WILAYAH"].map(norm_text),
        nama_wilayah=lingkung["WILAYAH"].map(norm_text).map(nama_wilayah))

    for name, df in frames.items():
        out = WORK / f"raw_{name}.parquet"
        df.astype({c: "string" for c in df.columns if df[c].dtype == object}
                  ).to_parquet(out, index=False)
        log("00_load", f"tulis {out.name}")

    with (WORK / "raw_counts.json").open("w", encoding="utf-8") as fh:
        json.dump(counts, fh, ensure_ascii=False, indent=2)

    log("00_load", f"selesai: {counts['umat']['baris']} jiwa, "
                   f"{counts['keluarga_umat']} keluarga, "
                   f"{counts['lingkungan_terpakai']} lingkungan, "
                   f"{counts['wilayah_terpakai']} wilayah")
    _ = lingkungan_ke_wilayah
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
