"""Tahap 3 — gerbang keras. Menggagalkan build bila salah satu aturan dilanggar.

Yang diperiksa (PRD §6, §14):
  A. Privasi  — tidak ada kolom PII di src/data/derived/ maupun public/data/.
  B. Sel kecil — tidak ada sel bernilai 1..4 yang lolos tanpa penyamaran.
  C. Angka jangkar — keluaran pipeline cocok dengan §17.2.
  D. Kelengkapan — seluruh berkas turunan dan seluruh adegan ada.
  E. Mutu — kamus normalisasi lengkap; tidak ada nilai mentah yang lolos.

Keluaran: pipeline/work/validation_report.json, kode keluar != 0 bila gagal.
"""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import (  # noqa: E402
    DERIVED, PII_COLUMNS, PII_PATTERNS, PUBLIC_DATA, SMALL_CELL_THRESHOLD,
    WORK, log,
)

# ── §17.2 Angka jangkar ───────────────────────────────────────────────────────
# Nilai yang ditulis PRD. Bila keluaran pipeline berbeda, itu dilaporkan sebagai
# SELISIH JANGKAR — bukan diperbaiki diam-diam, dan bukan pula menggagalkan build
# untuk selisih kecil yang sudah dijelaskan di catatan. Jangkar dengan
# `keras: True` menggagalkan build bila meleset.
ANCHORS = [
    ("umat_total",              12614, True,  ("meta", "umat_total")),
    ("keluarga_total",           4403, True,  ("meta", "keluarga_total")),
    ("wilayah_total",              19, True,  ("meta", "wilayah_total")),
    ("lingkungan_total",           88, True,  ("meta", "lingkungan_total")),
    ("laki_laki",                5852, True,  ("pilar2", "2.6", "rows", "Laki-laki")),
    ("perempuan",                6602, True,  ("pilar2", "2.6", "rows", "Perempuan")),
    ("jenkel_tidak_tercatat",     160, True,  ("pilar2", "2.6", "tidak_tercatat")),
    ("umur_valid",              12544, True,  ("meta", "umur_valid")),
    ("umur_median",              43.9, True,  ("pilar2", "2.1", "median_umur")),
    ("usia_0_14",                1274, True,  ("pilar2", "2.2", "rows", "0–14 tahun")),
    ("usia_15_64",               9169, True,  ("pilar2", "2.2", "rows", "15–64 tahun")),
    ("usia_65_plus",             2099, False, ("pilar2", "2.2", "rows", "65 tahun ke atas")),
    ("rasio_ketergantungan",     36.8, True,  ("pilar2", "2.2", "rasio_ketergantungan")),
    ("rumah_tangga_1_orang",      807, True,  ("pilar1", "1.4", "satu_orang")),
    ("lansia_tinggal_sendiri",    482, True,  ("pilar5", "5.3", "rows",
                                               "Di antaranya berusia 65 tahun ke atas")),
    ("pelayan_total",            1277, True,  ("pilar3", "3.6", "total_pelayan")),
    ("komuni_sudah",            10663, True,  ("pilar3", "3.1", "rows",
                                               "Sudah menerima Komuni Pertama")),
    ("krisma_sudah",             8124, True,  ("pilar3", "3.1", "rows",
                                               "Sudah menerima Krisma")),
    ("kawin_sah_katolik",         4938, True, ("pilar3", "3.4", "sah_katolik")),
    ("aktif_gereja_lingkungan",   8112, True, ("pilar3", "3.5", "aktif_gereja_lingkungan")),
    ("tidak_aktif",                897, False, ("pilar3", "3.5", "tidak_aktif")),
    ("ekonomi_perlu_bantuan",      462, True, ("pilar4", "4.5", "perlu_bantuan")),
    ("kesehatan_perlu_perhatian",  286, True, ("pilar5", "5.1", "total")),
    ("goldarah_tidak_tercatat",   2722, False, ("pilar5", "5.6", "tidak_tercatat")),
    ("pekerjaan_tidak_tercatat",  2476, False, ("pilar4", "4.4", "tidak_tercatat")),
]

# Selisih yang sudah dipahami dan dijelaskan di halaman (adegan 6.3).
SELISIH_DIJELASKAN = {
    "usia_65_plus": "PRD §17.2 menulis 2.099. Pipeline menghitung 2.101 dari tanggal "
                    "lahir terhadap 1 Februari 2019. Selisih 2 jiwa berasal dari "
                    "cara pembulatan umur pada berkas acuan; angka pipeline yang dipakai.",
    "tidak_aktif": "PRD §17.2 menulis 897, yaitu gabungan dua kode sensus 'non A' (489) "
                   "dan 'N (P)' (408) yang keduanya berarti tercatat tidak aktif.",
    "goldarah_tidak_tercatat": "PRD §17.2 menulis 2.722, yaitu 2.560 baris 'bt' ditambah "
                               "162 sel hampa. Keduanya dinormalkan menjadi "
                               "'Tidak tercatat' sehingga menjadi satu kategori.",
    "pekerjaan_tidak_tercatat": "PRD §12.1 menulis 2.476, yaitu baris '-' (2.253) ditambah "
                                "'bt' (223). Pipeline menambahkan 4 baris berisi '....' yang "
                                "juga berarti tidak ada catatan, sehingga menjadi 2.480.",
}

BERKAS_WAJIB = ["meta", "pembuka", "pilar1", "pilar2", "pilar3", "pilar4", "pilar5", "penutup"]
ADEGAN_WAJIB = {
    "pembuka": ["0.0"],
    "pilar1": ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"],
    "pilar2": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
    "pilar3": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7"],
    "pilar4": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
    "pilar5": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"],
}

# Istilah basis data yang tidak boleh muncul apa adanya di keluaran (PRD §8.4).
ISTILAH_MENTAH = [
    "G+L aktif", "G nonP", "G+L luar P", "non A", "N (P)", "Sah K", "Sah BA",
    "Sah BG", "Nikah LG", "KbM", "BLM", "P. Link", "P. Kategorial",
    "P. Tim Kerja", "Anggota DP", "P. Ormas", "diParoki", "Kost diP",
    "S meningat", "keterlambanan", "Sdg mencari", "Pedangan",
]
# `sumber.kolom` memang menyebut nama kolom basis data — itu justru syarat
# ketertelusuran (PRD §10). Pemeriksaan istilah mentah melewatkan blok itu.
LEWATI_KUNCI = {"sumber", "_kolom", "_catatan"}


def walk(node, path=""):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, f"{path}[{i}]")
    else:
        yield path, node


def walk_text(node, path=""):
    """Seperti walk(), tetapi melewati blok `sumber` yang memang menyebut kolom."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in LEWATI_KUNCI:
                continue
            yield from walk_text(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk_text(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node


def ambil(data: dict, jalur: tuple):
    node = data[jalur[0]]
    rest = jalur[1:]
    if len(rest) >= 3 and rest[1] == "rows":
        adegan = node[rest[0]]
        for r in adegan["rows"]:
            if r.get("label") == rest[2]:
                return r.get("n")
        return None
    for k in rest:
        node = node[k]
    return node


def main() -> int:
    gagal: list[str] = []
    peringatan: list[str] = []
    laporan: dict = {"lolos": False, "pemeriksaan": {}}

    # ── D. Kelengkapan berkas ────────────────────────────────────────────────
    data: dict = {}
    for name in BERKAS_WAJIB:
        path = DERIVED / f"{name}.json"
        if not path.exists():
            gagal.append(f"berkas turunan hilang: {path.relative_to(DERIVED.parent.parent.parent)}")
            continue
        data[name] = json.loads(path.read_text(encoding="utf-8"))
    if gagal:
        laporan["pemeriksaan"]["kelengkapan"] = {"lolos": False, "hilang": gagal[:]}
        _tulis(laporan, gagal, peringatan)
        return 1

    hilang_adegan = []
    for berkas, ids in ADEGAN_WAJIB.items():
        for sid in ids:
            if sid not in data[berkas]:
                hilang_adegan.append(f"{berkas}:{sid}")
    if hilang_adegan:
        gagal.append(f"adegan hilang: {', '.join(hilang_adegan)}")
    jumlah_adegan = sum(len(v) for v in ADEGAN_WAJIB.values())
    laporan["pemeriksaan"]["kelengkapan"] = {
        "lolos": not hilang_adegan, "adegan_ditemukan": jumlah_adegan - len(hilang_adegan),
        "adegan_diharapkan": jumlah_adegan, "hilang": hilang_adegan,
    }

    # Kelompok wilayah: setiap wilayah dan lingkungan harus punya kelompok, dan
    # kelima kelompok bersama-sama harus mencakup seluruh wilayah paroki.
    meta_data = data.get("meta", {})
    kelompok_meta = meta_data.get("kelompok") or []
    wil_berkelompok = sum(len(k.get("wilayah", [])) for k in kelompok_meta)
    tanpa_kelompok = [
        f"{sid}:{r.get('label')}"
        for berkas, sid in (("pilar1", "1.2"), ("pilar1", "1.3"), ("pilar5", "5.2"))
        for r in data.get(berkas, {}).get(sid, {}).get("rows", [])
        if not r.get("kelompok")
    ]
    if wil_berkelompok != meta_data.get("wilayah_total"):
        gagal.append(f"kelompok wilayah mencakup {wil_berkelompok} wilayah, "
                     f"seharusnya {meta_data.get('wilayah_total')}")
    if tanpa_kelompok:
        gagal.append(f"baris tanpa kelompok wilayah: {tanpa_kelompok[:6]}")
    laporan["pemeriksaan"]["kelengkapan"]["kelompok_wilayah"] = {
        "kelompok": len(kelompok_meta), "wilayah": wil_berkelompok,
        "tanpa_kelompok": tanpa_kelompok,
    }

    # ── A. Privasi ───────────────────────────────────────────────────────────
    # Dua lapis. (1) KUNCI: tidak ada satu pun kolom PII yang menjadi kunci JSON
    # atau kolom CSV. (2) NILAI: tidak ada nilai yang berbentuk data individu —
    # nomor keluarga 15 digit, NIK 16 digit, atau tanggal penuh selain tanggal
    # snapshot. Nama kolom yang MUNCUL DI DALAM blok `sumber` justru wajib ada:
    # ketertelusuran menuntutnya (PRD §10), dan nama kolom bukan isi kolom.
    temuan_pii = []
    pii_upper = {c.upper() for c in PII_COLUMNS}
    kunci_tempat = {"nama_wilayah", "nama_lingkungan", "wilayah", "lingkungan"}
    snapshot_iso = None
    angka_panjang = re.compile(r"\b\d{12,}\b")
    tanggal_penuh = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")

    for path in sorted(DERIVED.glob("*.json")):
        blob = json.loads(path.read_text(encoding="utf-8"))
        if path.stem == "meta":
            snapshot_iso = blob.get("snapshot")
        for jalur, nilai in walk(blob):
            segs = [s.split("[")[0] for s in jalur.split(".") if s]
            for seg in segs:
                if seg in kunci_tempat:
                    continue
                if seg.upper() in pii_upper or any(p.search(seg) for p in PII_PATTERNS):
                    temuan_pii.append(f"{path.name}:{jalur} (kunci '{seg}')")
            if isinstance(nilai, str) and segs and segs[-1] not in ("berkas", "kolom", "penyebut"):
                if angka_panjang.search(nilai):
                    temuan_pii.append(f"{path.name}:{jalur} memuat angka panjang (kunci individu?)")
                for m in tanggal_penuh.finditer(nilai):
                    if m.group(0) != snapshot_iso:
                        temuan_pii.append(f"{path.name}:{jalur} memuat tanggal penuh {m.group(0)}")

    for path in sorted(PUBLIC_DATA.glob("*.csv")):
        with path.open(encoding="utf-8", newline="") as fh:
            reader = csv.reader(fh)
            header = next(reader, [])
            for col in header:
                c = col.strip()
                if c in kunci_tempat:
                    continue
                if c.upper() in pii_upper or any(p.search(c) for p in PII_PATTERNS):
                    temuan_pii.append(f"{path.name}: kolom '{col}'")
            for i, row in enumerate(reader, start=2):
                for v in row:
                    if angka_panjang.search(v):
                        temuan_pii.append(f"{path.name}:baris {i} memuat angka panjang")
                    if tanggal_penuh.search(v):
                        temuan_pii.append(f"{path.name}:baris {i} memuat tanggal penuh")

    if temuan_pii:
        gagal.append(f"data pribadi lolos ke keluaran: {temuan_pii[:8]}")
    laporan["pemeriksaan"]["privasi"] = {
        "lolos": not temuan_pii, "temuan": temuan_pii,
        "kolom_dipantau": len(PII_COLUMNS),
        "berkas_diperiksa": len(list(DERIVED.glob("*.json"))) + len(list(PUBLIC_DATA.glob("*.csv"))),
    }

    # ── B. Sel kecil ─────────────────────────────────────────────────────────
    bocor = []
    for path in sorted(DERIVED.glob("*.json")):
        blob = json.loads(path.read_text(encoding="utf-8"))
        for jalur, nilai in walk(blob):
            if not jalur.endswith(".n") or not isinstance(nilai, int):
                continue
            if 0 < nilai < SMALL_CELL_THRESHOLD:
                bocor.append(f"{path.name}:{jalur} = {nilai}")
    for path in sorted(PUBLIC_DATA.glob("*.csv")):
        with path.open(encoding="utf-8", newline="") as fh:
            for i, row in enumerate(csv.DictReader(fh), start=2):
                for col in ("jiwa", "laki_laki", "perempuan", "tidak_tercatat"):
                    v = row.get(col, "")
                    if v not in ("", None) and re.fullmatch(r"\d+(\.0)?", str(v)):
                        n = int(float(v))
                        if 0 < n < SMALL_CELL_THRESHOLD:
                            bocor.append(f"{path.name}:baris {i} kolom {col} = {n}")
    if bocor:
        gagal.append(f"{len(bocor)} sel 1–{SMALL_CELL_THRESHOLD - 1} jiwa lolos tanpa "
                     f"penyamaran: {bocor[:8]}")
    laporan["pemeriksaan"]["sel_kecil"] = {
        "lolos": not bocor, "ambang": SMALL_CELL_THRESHOLD, "bocor": bocor,
    }

    # ── C. Angka jangkar ─────────────────────────────────────────────────────
    hasil_jangkar = []
    for nama, harapan, keras, jalur in ANCHORS:
        try:
            nyata = ambil(data, jalur)
        except (KeyError, TypeError, IndexError):
            nyata = None
        cocok = nyata is not None and abs(float(nyata) - float(harapan)) < 0.05
        entri = {"jangkar": nama, "prd": harapan, "pipeline": nyata, "cocok": cocok,
                 "keras": keras}
        if not cocok:
            entri["penjelasan"] = SELISIH_DIJELASKAN.get(nama)
            if keras:
                gagal.append(f"angka jangkar meleset: {nama} PRD={harapan} pipeline={nyata}")
            elif nama in SELISIH_DIJELASKAN:
                peringatan.append(f"selisih jangkar dijelaskan: {nama} "
                                  f"PRD={harapan} pipeline={nyata}")
            else:
                gagal.append(f"selisih jangkar tanpa penjelasan: {nama} "
                             f"PRD={harapan} pipeline={nyata}")
        hasil_jangkar.append(entri)
    laporan["pemeriksaan"]["angka_jangkar"] = {
        "lolos": all(h["cocok"] or h["jangkar"] in SELISIH_DIJELASKAN for h in hasil_jangkar),
        "cocok": sum(1 for h in hasil_jangkar if h["cocok"]),
        "diperiksa": len(hasil_jangkar), "rinci": hasil_jangkar,
    }

    # ── E. Mutu: kamus lengkap, tidak ada istilah mentah ─────────────────────
    notes = json.loads((WORK / "clean_notes.json").read_text(encoding="utf-8"))
    kamus_tak_lengkap = notes.get("kamus_tak_lengkap", {})
    if kamus_tak_lengkap:
        gagal.append(f"kamus normalisasi belum lengkap: {kamus_tak_lengkap}")

    mentah = []
    for name in BERKAS_WAJIB:
        for jalur, teks in walk_text(data[name], name):
            for istilah in ISTILAH_MENTAH:
                if re.search(r"(?<![A-Za-z])" + re.escape(istilah) + r"(?![A-Za-z])", teks):
                    mentah.append(f"{jalur}: '{istilah}' pada '{teks[:70]}'")
    if mentah:
        gagal.append(f"istilah basis data mentah lolos ke keluaran: {mentah[:6]}")
    laporan["pemeriksaan"]["mutu"] = {
        "lolos": not kamus_tak_lengkap and not mentah,
        "kamus_tak_lengkap": kamus_tak_lengkap, "istilah_mentah": mentah,
    }

    # ── Ringkasan mutu data yang dilaporkan ke halaman ───────────────────────
    laporan["ringkasan_data"] = {
        "snapshot": data["meta"]["snapshot"],
        "snapshot_terkonfirmasi": data["meta"]["snapshot_terkonfirmasi"],
        "umat_total": data["meta"]["umat_total"],
        "keluarga_total": data["meta"]["keluarga_total"],
        "dugaan_duplikat_baris": notes["dugaan_duplikat_baris"],
        "dugaan_duplikat_kelompok": notes["dugaan_duplikat_kelompok"],
        "selisih_keluarga": data["meta"]["selisih_keluarga"],
        "tgl_lahir_tak_masuk_akal": notes["tgl_lahir_tak_masuk_akal"],
        "tgl_nikah_tak_masuk_akal": notes["tgl_nikah_tak_masuk_akal"],
    }
    if not data["meta"]["snapshot_terkonfirmasi"]:
        peringatan.append(
            "tanggal snapshot masih berupa asumsi (PRD §5.4, pertanyaan terbuka #1); "
            "halaman menyatakannya terbuka di pembuka dan di adegan 6.3")

    return _tulis(laporan, gagal, peringatan)


def _tulis(laporan: dict, gagal: list, peringatan: list) -> int:
    laporan["lolos"] = not gagal
    laporan["gagal"] = gagal
    laporan["peringatan"] = peringatan
    WORK.mkdir(parents=True, exist_ok=True)
    with (WORK / "validation_report.json").open("w", encoding="utf-8") as fh:
        json.dump(laporan, fh, ensure_ascii=False, indent=2)

    for p in peringatan:
        log("03_validate", f"PERINGATAN: {p}")
    if gagal:
        for g in gagal:
            log("03_validate", f"GAGAL: {g}")
        log("03_validate", f"validasi GAGAL dengan {len(gagal)} pelanggaran")
        return 1
    for nama, blok in laporan["pemeriksaan"].items():
        log("03_validate", f"lolos: {nama}")
    log("03_validate", "validasi lolos: privasi, sel kecil, angka jangkar, "
                       "kelengkapan, mutu")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
