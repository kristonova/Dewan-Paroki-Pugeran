"""Konstanta dan utilitas bersama untuk seluruh tahap pipeline.

Satu-satunya tempat tanggal rujukan, ambang penyamaran, dan daftar hitam PII
didefinisikan. Lihat PRD §5.4, §6, dan §16.
"""
from __future__ import annotations

import datetime as _dt
import json
import math
import re
import unicodedata
from pathlib import Path

import pandas as pd

# ── Akar proyek ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
WORK = ROOT / "pipeline" / "work"
MAPPINGS = ROOT / "pipeline" / "mappings"
DERIVED = ROOT / "src" / "data" / "derived"
PUBLIC_DATA = ROOT / "public" / "data"

for _d in (WORK, DERIVED, PUBLIC_DATA):
    _d.mkdir(parents=True, exist_ok=True)

# ── Tanggal rujukan — PERTANYAAN TERBUKA #1 (PRD §5.4) ─────────────────────────
# Tanggal ekstraksi basis data belum tercatat. Seluruh umur dihitung terhadap
# konstanta ini. Bila tanggal sebenarnya diketahui, ubah DI SINI SAJA lalu
# jalankan `npm run data` — tidak ada satu pun angka umur yang ditulis manual.
SNAPSHOT = _dt.date(2019, 2, 1)
SNAPSHOT_LABEL = "1 Februari 2019"
SNAPSHOT_CONFIRMED = False
SNAPSHOT_NOTE = (
    "Tanggal ekstraksi basis data belum tercatat di berkas sumber mana pun. "
    "Tanggal ini dipakai sebagai asumsi kerja dan masih menunggu konfirmasi "
    "pengelola basis data paroki."
)

# ── Penyamaran sel kecil (PRD §6 aturan 2) ─────────────────────────────────────
# Sel bernilai 1–4 jiwa ditulis null dengan penanda "disamarkan", bukan 0.
SMALL_CELL_THRESHOLD = 5

# ── Kode paroki Pugeran ────────────────────────────────────────────────────────
PAROKI_CODE = "30006"
PAROKI_NAMA = "Hati Kudus Tuhan Yesus — Pugeran"

# ── Daftar hitam PII (PRD §5.3 dan §6 aturan 1) ────────────────────────────────
# Kolom ini dibuang di 01_clean.py dan tidak boleh pernah muncul di keluaran.
# 03_validate.py menggagalkan build bila salah satunya lolos.
PII_COLUMNS = [
    "NAMA", "NAMABAP", "NMKK", "NMKKBAP", "TMPLAHIR", "TGLLAHIR",
    "ALAMAT", "KOTA", "TLP", "NIK", "LIBERBAP", "LIBERMAT", "CAT1",
    "TMPBAPTIS", "TMPKRISMA", "TMPNIKAH", "TGLBAPTIS", "TGLKRISMA",
    "TGLNIKAH", "NOURUT", "NP", "NPVALUE", "KK", "USR",
]
# Pola yang dicari di seluruh teks keluaran, bukan hanya nama kolom.
PII_PATTERNS = [
    re.compile(r"\bnama\b", re.I),
    re.compile(r"\bnik\b", re.I),
    re.compile(r"\balamat\b", re.I),
    re.compile(r"tgl_?lahir", re.I),
    re.compile(r"tmp_?lahir", re.I),
]

# ── Token yang berarti "tidak tercatat" (PRD §6 aturan 4) ─────────────────────
def load_mapping(name: str) -> dict:
    with (MAPPINGS / f"{name}.json").open(encoding="utf-8") as fh:
        return json.load(fh)


_MISSING = None


def missing_tokens() -> set[str]:
    global _MISSING
    if _MISSING is None:
        _MISSING = {t.strip().casefold() for t in load_mapping("_missing")["tokens"]}
    return _MISSING


TIDAK_TERCATAT = "Tidak tercatat"


def norm_text(value) -> str:
    """Rapikan satu nilai teks mentah dari .dbf tanpa menghakimi isinya."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    s = str(value)
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("\x00", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def normalise(series: pd.Series, mapping: dict) -> pd.Series:
    """Terapkan kamus normalisasi; nilai kosong/`-`/`bt` menjadi 'Tidak tercatat'.

    `mapping` berbentuk {"nilai mentah": "label yang dibaca umat"}. Nilai mentah
    yang tidak ada di kamus dibiarkan apa adanya dan dilaporkan oleh
    03_validate.py sebagai kamus yang belum lengkap.
    """
    miss = missing_tokens()
    lookup = {k.strip().casefold(): v for k, v in mapping.items()}

    def one(v):
        s = norm_text(v)
        if s.casefold() in miss:
            return TIDAK_TERCATAT
        return lookup.get(s.casefold(), s)

    return series.map(one)


# ── Penamaan tempat ────────────────────────────────────────────────────────────
# Nama lingkungan dan wilayah tersimpan dalam huruf besar semua di berkas sumber.
# Halaman membacanya sebagai nama, bukan sebagai kode, jadi ditulis dalam kapital
# judul. Kata sambung dibiarkan huruf kecil.
_SAMBUNG = {"di", "ke", "dan", "dari"}
_UTUH = {"HKTY", "RT", "RW", "KAS"}


def judul_tempat(nama) -> str:
    s = norm_text(nama)
    if not s:
        return s
    kata = []
    for i, w in enumerate(s.split(" ")):
        if w.upper() in _UTUH:
            kata.append(w.upper())
        elif i and w.casefold() in _SAMBUNG:
            kata.append(w.casefold())
        else:
            kata.append(w[:1].upper() + w[1:].casefold())
    return " ".join(kata)


# ── Umur ───────────────────────────────────────────────────────────────────────
DAYS_PER_YEAR = 365.2425


def age_at_snapshot(births: pd.Series) -> pd.Series:
    """Umur dalam tahun (pecahan) pada SNAPSHOT. NaN bila tanggal tidak dipakai."""
    d = pd.to_datetime(births, errors="coerce")
    snap = pd.Timestamp(SNAPSHOT)
    age = (snap - d).dt.days / DAYS_PER_YEAR
    age = age.where(age.notna() & (age >= 0) & (age <= 115))
    return age


def age_band(age: float, width: int = 5, top: int = 95) -> str:
    if pd.isna(age):
        return TIDAK_TERCATAT
    lo = int(age // width) * width
    if lo >= top:
        return f"{top}+"
    return f"{lo}\u2013{lo + width - 1}"


# ── Penyamaran dan penulisan keluaran ─────────────────────────────────────────
def mask(n) -> dict:
    """Bungkus satu hitungan sel. 1–4 jiwa disamarkan; 0 tetap 0."""
    if n is None or (isinstance(n, float) and math.isnan(n)):
        return {"n": None, "disamarkan": False, "kosong": True}
    n = int(n)
    if 0 < n < SMALL_CELL_THRESHOLD:
        return {"n": None, "disamarkan": True}
    return {"n": n, "disamarkan": False}


def pct(n, denom, digits: int = 1):
    if not denom:
        return None
    return round(100 * n / denom, digits)


def cat_rows(counts: pd.Series, denom: int, *, mask_small: bool = True) -> list[dict]:
    """Ubah value_counts menjadi baris kategori siap pakai di halaman."""
    rows = []
    for label, n in counts.items():
        n = int(n)
        if mask_small and 0 < n < SMALL_CELL_THRESHOLD:
            rows.append({"label": label, "n": None, "pct": None, "disamarkan": True})
        else:
            rows.append({"label": label, "n": n, "pct": pct(n, denom), "disamarkan": False})
    return rows


def fold_tail(counts: pd.Series, *, keep: int, other_label: str = "Lainnya",
              pin: tuple[str, ...] = (TIDAK_TERCATAT,)) -> tuple[pd.Series, dict]:
    """Lipat ekor kategori menjadi satu baris `Lainnya`.

    Kategori pada `pin` selalu dipertahankan sebagai baris sendiri sehingga
    "Tidak tercatat" tidak pernah hilang ke dalam "Lainnya" (PRD §6 aturan 4).
    """
    counts = counts.sort_values(ascending=False)
    pinned = counts[counts.index.isin(pin)]
    rest = counts[~counts.index.isin(pin)]
    head = rest.head(keep)
    tail = rest.iloc[keep:]
    out = head
    info = {"ambang": keep, "jumlah_kategori_dilipat": int(tail.shape[0]),
            "jiwa_dilipat": int(tail.sum())}
    if tail.shape[0]:
        lipat = int(tail.sum())
        if other_label in out.index:
            # Sumber kadang sudah memuat kategori yang namanya sama dengan label
            # lipatan (misalnya "Suku lainnya"). Gabungkan menjadi satu baris di
            # ujung, supaya halaman tidak memuat dua baris kembar.
            lipat += int(out[other_label])
            out = out.drop(other_label)
        out = pd.concat([out, pd.Series({other_label: lipat})])
    if pinned.shape[0]:
        out = pd.concat([out, pinned])
    return out, info


def write_json(name: str, payload) -> Path:
    path = DERIVED / f"{name}.json"
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2, sort_keys=False,
                  default=_default)
        fh.write("\n")
    return path


def _default(o):
    import numpy as np
    if isinstance(o, (_dt.date, _dt.datetime)):
        return o.isoformat()
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        v = float(o)
        return None if math.isnan(v) else v
    if isinstance(o, (np.bool_,)):
        return bool(o)
    raise TypeError(f"tidak dapat diserialkan: {type(o)}")


def write_csv(name: str, df: pd.DataFrame) -> Path:
    path = PUBLIC_DATA / f"{name}.csv"
    df.to_csv(path, index=False, encoding="utf-8")
    return path


def log(stage: str, msg: str) -> None:
    print(f"[{stage}] {msg}", flush=True)
