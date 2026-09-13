"""Tahap 1 — buang PII, normalkan label lewat kamus, turunkan umur.

Aturan yang mengikat tahap ini (PRD §6):
  1. Data individu tidak pernah keluar dari pipeline. Nama, tempat dan tanggal
     lahir, alamat, telepon, NIK, dan catatan baptis bernomor dibuang DI SINI.
  4. Kosong bukan nol: '-', 'bt' dan sel hampa menjadi 'Tidak tercatat'.
  5. Anomali ditandai, tidak diperbaiki diam-diam.

Keluaran: pipeline/work/clean.parquet, clean_kk.parquet, clean_notes.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import (  # noqa: E402
    PII_COLUMNS, SNAPSHOT, TIDAK_TERCATAT, WORK, age_at_snapshot, load_mapping,
    judul_tempat, log, missing_tokens, norm_text, normalise,
)

# Kolom label KET1-KET15 -> nama kamus dan nama kolom bersih.
LABEL_COLUMNS = [
    ("KET1", "jenis_kelamin", "jenis_kelamin"),
    ("KET2", "hubungan_kk", "hubungan_kk"),
    ("KET3", "suku", "suku"),
    ("KET4", "pendidikan", "pendidikan"),
    ("KET5", "bidang_studi", "bidang_studi"),
    ("KET6", "pekerjaan", "pekerjaan"),
    ("KET7", "golongan_darah", "golongan_darah"),
    ("KET8", "status_kesehatan", "status_kesehatan"),
    ("KET9", "waktu_baptis", "waktu_baptis"),
    ("KET10", "status_perkawinan", "status_perkawinan"),
    ("KET11", "agama", "agama"),
    ("KET12", "jabatan_sosial", "jabatan_sosial"),
    ("KET14", "status_gereja", "status_gereja"),
    ("KET15", "keterlibatan", "keterlibatan"),
]

RAW_LABEL_COLS = {f"KET{i}" for i in range(1, 18)}
RAW_CODE_COLS_UMAT = {
    "JENKEL", "HUBKK", "SUKU", "PENDIDIKAN", "BIDSTUDI", "PEKERJAAN",
    "GOLDARAH", "STSSEHAT", "WKTBAPTIS", "STSKRISMA", "STSKWN", "AGAMA",
    "JBTSOS", "TMPTINGGAL", "LMTINGGAL", "STSGEREJA", "TERLIBATAN",
    "KOMUNI", "CAT2", "CAT3", "KPL", "NMUSKUP", "NMPAROKI",
}
RAW_CODE_COLS_KK = {
    "JENKEL", "AGAMA", "SUKU", "EKONOMI", "STSKWN", "JENKK", "DARI", "KE",
    "TGI", "JMI", "NMUSKUP", "NMPAROKI",
}


def derive_sekolah(raw_pendidikan: pd.Series) -> pd.Series:
    """Tarik penanda 'sekolah Katolik' yang menempel sebagai akhiran pada KET4."""
    conf = load_mapping("sekolah_katolik")
    akhiran = sorted(conf["akhiran"].items(), key=lambda kv: -len(kv[0].strip()))

    def one(v):
        s = norm_text(v).upper()
        for suf, label in akhiran:
            suf = suf.strip().upper()
            if s.endswith(suf) and len(s) > len(suf):
                return label
        return conf["tanpa_penanda"]

    return raw_pendidikan.map(one)


def derive_tempat(raw: pd.Series):
    """Dua sumbu dari KET13: di dalam/di luar paroki, dan nama tempatnya."""
    conf = load_mapping("tempat_tinggal")
    dalam = {k.casefold(): v for k, v in conf["di_dalam_paroki"].items()}
    label = {k.casefold(): v for k, v in conf["label"].items()}
    miss = missing_tokens()
    sep = conf["_label_pemisah_paroki"]

    def kategori(v):
        s = norm_text(v)
        if s.casefold() in miss:
            return TIDAK_TERCATAT
        if s.casefold() in dalam:
            return dalam[s.casefold()]
        return "Tinggal di luar wilayah paroki"

    def tempat(v):
        s = norm_text(v)
        if s.casefold() in miss:
            return TIDAK_TERCATAT
        if s.casefold() in dalam:
            return dalam[s.casefold()]
        if sep in s:
            return "Paroki lain"
        return label.get(s.casefold(), s)

    return raw.map(kategori), raw.map(tempat)


def main() -> int:
    notes: dict = {}
    umat = pd.read_parquet(WORK / "raw_umat.parquet")
    kk = pd.read_parquet(WORK / "raw_umatkk.parquet")

    # -- Anomali ditandai SEBELUM kolomnya dibuang (PRD §6 aturan 5, §12.2) ----
    lahir = pd.to_datetime(umat["TGLLAHIR"], errors="coerce")
    notes["tgl_lahir_kosong"] = int(lahir.isna().sum())
    tak_masuk_akal = lahir.notna() & (lahir.dt.year > SNAPSHOT.year)
    notes["tgl_lahir_tak_masuk_akal"] = int(tak_masuk_akal.sum())

    kunci_dup = (umat["NAMA"].map(norm_text).str.upper() + "|" +
                 lahir.dt.strftime("%Y-%m-%d").fillna("?"))
    layak = umat["NAMA"].map(norm_text).ne("") & lahir.notna()
    dup_mask = layak & kunci_dup.duplicated(keep=False)
    notes["dugaan_duplikat_baris"] = int(dup_mask.sum())
    notes["dugaan_duplikat_kelompok"] = int(kunci_dup[dup_mask].nunique())

    nikah = pd.to_datetime(kk["TGLNIKAH"], errors="coerce")
    notes["tgl_nikah_kosong"] = int(nikah.isna().sum())
    nikah_aneh = nikah.notna() & ((nikah.dt.year < 1900) | (nikah.dt.year > SNAPSHOT.year))
    notes["tgl_nikah_tak_masuk_akal"] = int(nikah_aneh.sum())
    notes["tahun_nikah_tak_masuk_akal"] = sorted({int(y) for y in nikah[nikah_aneh].dt.year})

    # -- Turunan dari kolom PII, sebelum kolomnya dibuang ---------------------
    umat["umur"] = age_at_snapshot(umat["TGLLAHIR"])
    umat.loc[tak_masuk_akal, "umur"] = None
    notes["umur_valid"] = int(umat["umur"].notna().sum())
    notes["umur_tidak_dapat_dihitung"] = int(umat["umur"].isna().sum())

    # Tempat baptis/krisma diturunkan menjadi penanda biner "di Pugeran / bukan".
    for src, out in (("TMPBAPTIS", "baptis_di_pugeran"), ("TMPKRISMA", "krisma_di_pugeran")):
        umat[out] = umat[src].map(norm_text).str.upper().str.contains("PUGERAN", na=False)

    # Tanggal baptis/krisma diturunkan menjadi ada/tidak ada catatan.
    for src, out in (("TGLBAPTIS", "ada_catatan_tgl_baptis"),
                     ("TGLKRISMA", "ada_catatan_tgl_krisma")):
        umat[out] = pd.to_datetime(umat[src], errors="coerce").notna()
    notes["tgl_baptis_kosong"] = int((~umat["ada_catatan_tgl_baptis"]).sum())
    notes["tgl_krisma_kosong"] = int((~umat["ada_catatan_tgl_krisma"]).sum())

    umat["dugaan_duplikat"] = dup_mask

    # Nama tempat ditulis dalam kapital judul agar terbaca sebagai nama.
    for col in ("nama_wilayah", "nama_lingkungan"):
        umat[col] = umat[col].map(judul_tempat)

    # -- Sakramen inisiasi: kode numerik, bukan kolom KET ---------------------
    komuni = pd.to_numeric(umat["KOMUNI"], errors="coerce")
    krisma = pd.to_numeric(umat["STSKRISMA"], errors="coerce")
    umat["komuni_pertama"] = komuni.map({1: "Sudah", 2: "Belum"}).fillna(TIDAK_TERCATAT)
    umat["krisma"] = krisma.map({2: "Sudah", 1: "Belum"}).fillna(TIDAK_TERCATAT)

    # -- Normalisasi label ----------------------------------------------------
    umat["sekolah_katolik"] = derive_sekolah(umat["KET4"])
    umat["tempat_tinggal_kategori"], umat["tempat_tinggal"] = derive_tempat(umat["KET13"])
    kamus_tak_lengkap: dict = {}
    for src, kamus, out in LABEL_COLUMNS:
        mapping = {k: v for k, v in load_mapping(kamus).items() if not k.startswith("_")}
        umat[out] = normalise(umat[src], mapping)
        known = set(mapping.values()) | {TIDAK_TERCATAT}
        unknown = sorted(set(umat[out]) - known)
        if unknown:
            kamus_tak_lengkap[kamus] = unknown
    notes["kamus_tak_lengkap"] = kamus_tak_lengkap

    # -- umatkk ---------------------------------------------------------------
    def m(name):
        return {k: v for k, v in load_mapping(name).items() if not k.startswith("_")}

    kk["ekonomi"] = normalise(kk["KETEKO"], m("ekonomi"))
    kk["jenis_rumah_tangga"] = normalise(kk["KETJENKK"], m("jenis_rumah_tangga"))
    kk["jenis_kelamin_kk"] = normalise(kk["KETJENKEL"], m("jenis_kelamin"))
    kk["status_perkawinan_kk"] = normalise(kk["KETSTSKWN"], m("status_perkawinan"))
    kk["_lingkungan"] = kk["LINGKUNGAN"].map(norm_text)
    kk["_wilayah"] = kk["WILAYAH"].map(norm_text)
    kk["nama_lingkungan"] = kk["NMLINGKUNG"].map(judul_tempat)
    kk["nama_wilayah"] = kk["NMWILAYAH"].map(judul_tempat)

    # -- Kunci rumah tangga: kunci internal, dibuang setelah agregasi di 02.
    umat["_np"] = umat["NP"].map(norm_text)
    kk["_np"] = kk["NP"].map(norm_text)

    # -- Buang PII ------------------------------------------------------------
    buang_umat = [c for c in PII_COLUMNS if c in umat.columns]
    buang_kk = [c for c in PII_COLUMNS if c in kk.columns]
    umat = umat.drop(columns=buang_umat)
    kk = kk.drop(columns=buang_kk)

    # Nilai mentah berkode tidak dibawa ke tahap berikutnya: setelah dinormalkan,
    # nilai mentahnya tidak punya kegunaan lagi dan hanya menambah risiko.
    umat = umat.drop(columns=[c for c in umat.columns
                              if c in RAW_LABEL_COLS or c in RAW_CODE_COLS_UMAT])
    kk = kk.drop(columns=[c for c in kk.columns
                          if c.startswith("KET") or c in RAW_CODE_COLS_KK])

    notes["kolom_pii_dibuang_umat"] = buang_umat
    notes["kolom_pii_dibuang_umatkk"] = buang_kk
    notes["kolom_clean_umat"] = sorted(umat.columns)
    notes["kolom_clean_umatkk"] = sorted(kk.columns)

    umat.to_parquet(WORK / "clean.parquet", index=False)
    kk.to_parquet(WORK / "clean_kk.parquet", index=False)
    with (WORK / "clean_notes.json").open("w", encoding="utf-8") as fh:
        json.dump(notes, fh, ensure_ascii=False, indent=2)

    log("01_clean", "buang %d kolom PII dari umat, %d dari umatkk"
        % (len(buang_umat), len(buang_kk)))
    log("01_clean", "umur valid %d, tidak dapat dihitung %d"
        % (notes["umur_valid"], notes["umur_tidak_dapat_dihitung"]))
    if kamus_tak_lengkap:
        log("01_clean", "PERINGATAN kamus belum lengkap: %s" % kamus_tak_lengkap)
    log("01_clean", "selesai: clean %s, clean_kk %s" % (umat.shape, kk.shape))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
