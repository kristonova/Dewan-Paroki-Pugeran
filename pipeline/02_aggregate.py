"""Tahap 2 — bangun seluruh tabulasi yang dipakai adegan, samarkan sel kecil.

Setiap adegan di PRD §8.3 memperoleh satu entri JSON berisi: penyebut, baris
kategori, sumber (berkas + kolom + penyebut), dan catatan turunan yang dipakai
kalimat tafsir. Angka di dalam naskah diambil dari berkas ini, tidak pernah
diketik manual (PRD §8.4).

Keluaran: src/data/derived/*.json dan public/data/*.csv
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import (  # noqa: E402
    PAROKI_NAMA, SMALL_CELL_THRESHOLD, SNAPSHOT, SNAPSHOT_CONFIRMED,
    SNAPSHOT_LABEL, SNAPSHOT_NOTE, TIDAK_TERCATAT, WORK, age_band, cat_rows,
    fold_tail, judul_tempat, load_mapping, log, pct, write_csv, write_json,
)

CFG = load_mapping("_config")
FOLD = CFG["fold"]
IDX = CFG["indeks_kerentanan"]
KELOMPOK = load_mapping("kelompok_wilayah")["kelompok"]
KODE_KE_KELOMPOK = {kode: k["label"] for k in KELOMPOK for kode in k["wilayah"]}

URUT_PENDIDIKAN = [
    "Belum bersekolah", "Buta aksara",
    "Usia 7–12 tahun, tidak bersekolah", "Usia 13–15 tahun, tidak bersekolah",
    "SD", "SLTP", "SLTA", "Diploma (D1–D3)", "Sarjana (S1/D4)",
    "Magister (S2)", "Doktor (S3)", TIDAK_TERCATAT,
]
PENDIDIKAN_TINGGI = {"Diploma (D1–D3)", "Sarjana (S1/D4)", "Magister (S2)", "Doktor (S3)"}

URUT_PERKAWINAN = [
    "Belum menikah", "Perkawinan sah secara Katolik",
    "Perkawinan sah dengan pasangan beda agama",
    "Perkawinan sah dengan pasangan beda gereja", "Menikah lagi",
    "Kawin belum sah menurut Gereja", "Hidup bersama tanpa perkawinan",
    "Perkawinan dengan akibat sipil", "Janda atau duda", "Ditinggalkan pasangan",
    "Imam, bruder, atau suster yang berkarya di Pugeran",
    "Imam, bruder, atau suster yang berasal dari Pugeran", TIDAK_TERCATAT,
]
URUT_GEREJA = [
    "Aktif di gereja paroki dan di lingkungan",
    "Aktif di gereja, tidak aktif di lingkungan",
    "Aktif di lingkungan, beribadat di paroki lain",
    "Aktif di gereja dan lingkungan paroki lain",
    "Tercatat tidak aktif", TIDAK_TERCATAT,
]
URUT_EKONOMI = ["Berkecukupan dan bisa membantu", "Biasa atau cukup",
                "Memerlukan bantuan", TIDAK_TERCATAT]
URUT_GOLDARAH = ["O", "B", "A", "AB", TIDAK_TERCATAT]
PELAYANAN = [
    "Pengurus lingkungan", "Pengurus kelompok kategorial",
    "Pengurus tim kerja paroki", "Anggota Dewan Paroki",
    "Pengurus organisasi masyarakat Katolik",
]


def src(berkas: str, kolom: str, penyebut: str) -> dict:
    return {"berkas": berkas, "kolom": kolom, "penyebut": penyebut}


def counts(series: pd.Series, order: list | None = None) -> pd.Series:
    vc = series.value_counts()
    if order:
        vc = vc.reindex([o for o in order if o in vc.index]).fillna(0).astype(int)
        sisa = vc.index.tolist()
        lain = [i for i in series.value_counts().index if i not in sisa]
        if lain:
            vc = pd.concat([vc, series.value_counts().reindex(lain)])
    return vc


def scene(sid: str, *, penyebut: int, rows: list, sumber: dict, **extra) -> dict:
    out = {"id": sid, "penyebut": penyebut, "rows": rows, "sumber": sumber}
    out.update(extra)
    return out


def main() -> int:
    u = pd.read_parquet(WORK / "clean.parquet")
    kk = pd.read_parquet(WORK / "clean_kk.parquet")
    notes = json.loads((WORK / "clean_notes.json").read_text(encoding="utf-8"))
    raw_counts = json.loads((WORK / "raw_counts.json").read_text(encoding="utf-8"))

    N = int(u.shape[0])
    hh_size = u.groupby("_np").size()
    N_KELUARGA = int(hh_size.shape[0])
    N_KK = int(kk.shape[0])
    age = u["umur"].astype("Float64")
    a = age.dropna().astype(float)

    # ══ meta ══════════════════════════════════════════════════════════════════
    meta = {
        "paroki": PAROKI_NAMA,
        "snapshot": SNAPSHOT.isoformat(),
        "snapshot_label": SNAPSHOT_LABEL,
        "snapshot_terkonfirmasi": SNAPSHOT_CONFIRMED,
        "snapshot_catatan": SNAPSHOT_NOTE,
        "ambang_penyamaran": SMALL_CELL_THRESHOLD,
        "umat_total": N,
        "keluarga_total": N_KELUARGA,
        "keluarga_umatkk": N_KK,
        "selisih_keluarga": N_KELUARGA - N_KK,
        "lingkungan_total": int(raw_counts["lingkungan_terpakai"]),
        "wilayah_total": int(raw_counts["wilayah_terpakai"]),
        "lingkungan_master": int(raw_counts["lingkungan_master"]),
        "lingkungan_tanpa_jiwa": [judul_tempat(x) for x in raw_counts["lingkungan_tanpa_jiwa"]],
        "baris_paroki_lain": int(raw_counts["umat_luar_paroki"]),
        "umur_valid": int(notes["umur_valid"]),
        "umur_tidak_dapat_dihitung": int(notes["umur_tidak_dapat_dihitung"]),
    }

    # ══ PEMBUKA 0.0 ═══════════════════════════════════════════════════════════
    pembuka = {
        "0.0": scene(
            "0.0", penyebut=N,
            rows=[
                {"label": "jiwa", "n": N, "pct": None, "disamarkan": False},
                {"label": "keluarga", "n": N_KELUARGA, "pct": None, "disamarkan": False},
                {"label": "lingkungan", "n": meta["lingkungan_total"], "pct": None, "disamarkan": False},
                {"label": "wilayah", "n": meta["wilayah_total"], "pct": None, "disamarkan": False},
            ],
            sumber=src("umat.dbf, lingkung.dbf, stasi.dbf",
                       "NP, LINGKUNGAN, WILAYAH",
                       "seluruh baris terdaftar"))
    }

    # ══ PILAR 1 ═══════════════════════════════════════════════════════════════
    p1 = {}

    p1["1.1"] = scene("1.1", penyebut=N, rows=[
        {"label": "jiwa terdaftar", "n": N, "pct": None, "disamarkan": False},
        {"label": "keluarga", "n": N_KELUARGA, "pct": None, "disamarkan": False},
    ], sumber=src("umat.dbf", "NP", "12.614 jiwa terdaftar"),
        rata_rata_per_keluarga=round(float(hh_size.mean()), 2),
        median_per_keluarga=float(hh_size.median()),
        terbesar=int(hh_size.max()))

    # -- Kelompok wilayah: kode WILAYAH → kelompok (pipeline/mappings/kelompok_wilayah.json).
    pasangan_wil = u.loc[u["_dalam_paroki"], ["_wilayah", "nama_wilayah"]].drop_duplicates()
    tanpa_kelompok = sorted(set(pasangan_wil["_wilayah"]) - set(KODE_KE_KELOMPOK))
    if tanpa_kelompok:
        raise SystemExit(f"[02_aggregate] kode wilayah tanpa kelompok: {tanpa_kelompok}")
    kelompok_wil = dict(zip(pasangan_wil["nama_wilayah"],
                            pasangan_wil["_wilayah"].map(KODE_KE_KELOMPOK)))

    wil = u[u["_dalam_paroki"]].groupby("nama_wilayah").size().sort_values(ascending=False)
    p1["1.2"] = scene("1.2", penyebut=int(wil.sum()),
                      rows=[{**r, "kelompok": kelompok_wil[r["label"]]}
                            for r in cat_rows(wil, int(wil.sum()))],
                      sumber=src("umat.dbf + stasi.dbf", "WILAYAH × KET",
                                 "12.608 jiwa berkode wilayah Pugeran"),
                      tertinggi={"label": wil.index[0], "n": int(wil.iloc[0])},
                      terendah={"label": wil.index[-1], "n": int(wil.iloc[-1])})

    lingk = (u[u["_dalam_paroki"]].groupby(["nama_wilayah", "nama_lingkungan"])
             .size().reset_index(name="n").sort_values("n", ascending=False))
    med_l = float(lingk["n"].median())
    p1["1.3"] = scene("1.3", penyebut=int(lingk["n"].sum()),
                      rows=[{"label": r.nama_lingkungan, "wilayah": r.nama_wilayah,
                             "kelompok": kelompok_wil[r.nama_wilayah],
                             "n": int(r.n), "pct": pct(int(r.n), int(lingk["n"].sum())),
                             "disamarkan": False} for r in lingk.itertuples()],
                      sumber=src("umat.dbf + lingkung.dbf", "LINGKUNGAN × KET",
                                 "12.608 jiwa berkode lingkungan Pugeran"),
                      median=med_l,
                      terbesar={"label": lingk.iloc[0]["nama_lingkungan"], "n": int(lingk.iloc[0]["n"])},
                      terkecil={"label": lingk.iloc[-1]["nama_lingkungan"], "n": int(lingk.iloc[-1]["n"])},
                      rentang=round(float(lingk["n"].max() / lingk["n"].min()), 1),
                      jumlah_lingkungan=int(lingk.shape[0]))

    # -- Lima kelompok wilayah untuk warna dan filter grafik. Urutan = slot warna.
    meta["kelompok"] = [{
        "label": k["label"],
        "slot": i + 1,
        "wilayah": [nama for nama in wil.index if kelompok_wil[nama] == k["label"]],
        "jiwa": int(sum(int(wil[nama]) for nama in wil.index if kelompok_wil[nama] == k["label"])),
        "lingkungan": int((lingk["nama_wilayah"].map(kelompok_wil) == k["label"]).sum()),
    } for i, k in enumerate(KELOMPOK)]

    ukuran = hh_size.value_counts().sort_index()
    ukuran.index = [str(i) for i in ukuran.index]
    p1["1.4"] = scene("1.4", penyebut=N_KELUARGA,
                      rows=cat_rows(ukuran, N_KELUARGA),
                      sumber=src("umat.dbf", "NP (jumlah baris per nomor keluarga)",
                                 "4.403 keluarga"),
                      satu_orang=int(hh_size.eq(1).sum()),
                      satu_orang_pct=pct(int(hh_size.eq(1).sum()), N_KELUARGA),
                      terbesar=int(hh_size.max()))

    kkjk = kk["jenis_kelamin_kk"].value_counts()
    kkjk_tercatat = int(kkjk.drop(TIDAK_TERCATAT, errors="ignore").sum())
    p1["1.5"] = scene("1.5", penyebut=kkjk_tercatat,
                      rows=cat_rows(kkjk.drop(TIDAK_TERCATAT, errors="ignore"), kkjk_tercatat),
                      sumber=src("umatkk.dbf", "KETJENKEL",
                                 "4.234 kepala keluarga yang jenis kelaminnya tercatat"),
                      perempuan=int(kkjk.get("Perempuan", 0)),
                      perempuan_pct=pct(int(kkjk.get("Perempuan", 0)), kkjk_tercatat),
                      tidak_tercatat=int(kkjk.get(TIDAK_TERCATAT, 0)),
                      total_kk=N_KK)

    suku_vc = u["suku"].value_counts()
    suku_fold, suku_info = fold_tail(suku_vc, keep=FOLD["suku"]["keep"],
                                     other_label=FOLD["suku"]["label_lain"])
    p1["1.6"] = scene("1.6", penyebut=N, rows=cat_rows(suku_fold, N),
                      sumber=src("umat.dbf", "KET3", "12.614 jiwa terdaftar"),
                      pelipatan=suku_info,
                      kategori_tercatat=int(suku_vc.drop(TIDAK_TERCATAT, errors="ignore").shape[0]),
                      terbesar={"label": suku_vc.index[0], "n": int(suku_vc.iloc[0]),
                                "pct": pct(int(suku_vc.iloc[0]), N)})

    # ══ PILAR 2 ═══════════════════════════════════════════════════════════════
    p2 = {}
    bands = age.map(lambda v: age_band(v) if pd.notna(v) else TIDAK_TERCATAT)
    band_order = [f"{i}–{i+4}" for i in range(0, 95, 5)] + ["95+"]
    pyr = pd.crosstab(bands, u["jenis_kelamin"]).reindex(band_order).fillna(0).astype(int)
    for c in ("Laki-laki", "Perempuan", TIDAK_TERCATAT):
        if c not in pyr.columns:
            pyr[c] = 0

    def cell(n):
        n = int(n)
        return {"n": None, "disamarkan": True} if 0 < n < SMALL_CELL_THRESHOLD else {"n": n, "disamarkan": False}

    p2["2.1"] = scene("2.1", penyebut=int(notes["umur_valid"]),
                      rows=[{"label": b,
                             "laki": cell(pyr.loc[b, "Laki-laki"]),
                             "perempuan": cell(pyr.loc[b, "Perempuan"]),
                             "tidak_tercatat": cell(pyr.loc[b, TIDAK_TERCATAT])}
                            for b in band_order],
                      sumber=src("umat.dbf", "TGLLAHIR → umur pada " + SNAPSHOT_LABEL + ", KET1",
                                 "12.544 jiwa yang umurnya dapat dihitung"),
                      median_umur=round(float(a.median()), 1),
                      umur_tidak_dapat_dihitung=int(notes["umur_tidak_dapat_dihitung"]),
                      jenkel_tidak_tercatat=int((u["jenis_kelamin"] == TIDAK_TERCATAT).sum()))

    g014, g1564, g65 = int((a < 15).sum()), int(((a >= 15) & (a < 65)).sum()), int((a >= 65).sum())
    p2["2.2"] = scene("2.2", penyebut=int(notes["umur_valid"]), rows=[
        {"label": "0–14 tahun", "n": g014, "pct": pct(g014, N), "disamarkan": False},
        {"label": "15–64 tahun", "n": g1564, "pct": pct(g1564, N), "disamarkan": False},
        {"label": "65 tahun ke atas", "n": g65, "pct": pct(g65, N), "disamarkan": False},
    ], sumber=src("umat.dbf", "TGLLAHIR → umur pada " + SNAPSHOT_LABEL,
                  "12.544 jiwa yang umurnya dapat dihitung; persentase atas 12.614"),
        rasio_ketergantungan=round(100 * (g014 + g65) / g1564, 1),
        rasio_anak=round(100 * g014 / g1564, 1),
        rasio_lansia=round(100 * g65 / g1564, 1))

    koh = pd.Series({"0–4 tahun": int((a < 5).sum()),
                     "5–9 tahun": int(((a >= 5) & (a < 10)).sum()),
                     "10–14 tahun": int(((a >= 10) & (a < 15)).sum())})
    p2["2.3"] = scene("2.3", penyebut=g014, rows=cat_rows(koh, g014),
                      sumber=src("umat.dbf", "TGLLAHIR → umur pada " + SNAPSHOT_LABEL,
                                 "1.274 jiwa berusia di bawah 15 tahun"),
                      rasio_balita_terhadap_atasnya=round(float(koh.iloc[0] / koh.iloc[1]), 2),
                      rasio_balita_terhadap_1014=round(float(koh.iloc[0] / koh.iloc[2]), 2))

    muda = int(((a >= 15) & (a < 30)).sum())
    p2["2.4"] = scene("2.4", penyebut=N, rows=[
        {"label": "15–29 tahun", "n": muda, "pct": pct(muda, N), "disamarkan": False},
    ], sumber=src("umat.dbf", "TGLLAHIR → umur pada " + SNAPSHOT_LABEL,
                  "12.614 jiwa terdaftar"),
        umur_15_19=int(((a >= 15) & (a < 20)).sum()),
        umur_20_24=int(((a >= 20) & (a < 25)).sum()),
        umur_25_29=int(((a >= 25) & (a < 30)).sum()))

    lansia_bands = [b for b in band_order if b != "95+" and int(b.split("–")[0]) >= 65] + ["95+"]
    l9094 = pyr.loc["90–94"]
    p2["2.5"] = scene("2.5", penyebut=g65,
                      rows=[{"label": b,
                             "laki": cell(pyr.loc[b, "Laki-laki"]),
                             "perempuan": cell(pyr.loc[b, "Perempuan"]),
                             "tidak_tercatat": cell(pyr.loc[b, TIDAK_TERCATAT])}
                            for b in lansia_bands],
                      sumber=src("umat.dbf", "TGLLAHIR → umur pada " + SNAPSHOT_LABEL + ", KET1",
                                 "2.101 jiwa berusia 65 tahun ke atas"),
                      lansia_65=g65, lansia_65_pct=pct(g65, N),
                      lansia_80=int((a >= 80).sum()), lansia_75=int((a >= 75).sum()),
                      band_9094={"laki": int(l9094["Laki-laki"]),
                                 "perempuan": int(l9094["Perempuan"])})

    jk = u["jenis_kelamin"].value_counts()
    lk, pr = int(jk.get("Laki-laki", 0)), int(jk.get("Perempuan", 0))
    jk_tt = int(jk.get(TIDAK_TERCATAT, 0))
    rasio_umur = []
    for lo in (0, 15, 30, 45, 60, 75):
        hi = lo + 15 if lo < 75 else 200
        sel = u[(age >= lo) & (age < hi)]
        l, p = int((sel["jenis_kelamin"] == "Laki-laki").sum()), int((sel["jenis_kelamin"] == "Perempuan").sum())
        rasio_umur.append({"label": f"{lo}–{hi-1} tahun" if hi < 200 else "75 tahun ke atas",
                           "laki": l, "perempuan": p,
                           "rasio": round(100 * l / p, 1) if p else None})
    p2["2.6"] = scene("2.6", penyebut=N, rows=[
        {"label": "Laki-laki", "n": lk, "pct": pct(lk, N), "disamarkan": False},
        {"label": "Perempuan", "n": pr, "pct": pct(pr, N), "disamarkan": False},
        {"label": TIDAK_TERCATAT, "n": jk_tt, "pct": pct(jk_tt, N), "disamarkan": False},
    ], sumber=src("umat.dbf", "KET1", "12.614 jiwa terdaftar"),
        rasio_jenis_kelamin=round(100 * lk / pr, 1),
        tidak_tercatat=jk_tt, per_kelompok_umur=rasio_umur)

    # ══ PILAR 3 ═══════════════════════════════════════════════════════════════
    p3 = {}
    kom = u["komuni_pertama"].value_counts()
    kri = u["krisma"].value_counts()
    p3["3.1"] = scene("3.1", penyebut=N, rows=[
        {"label": "Dibaptis", "n": N, "pct": 100.0, "disamarkan": False},
        {"label": "Sudah menerima Komuni Pertama", "n": int(kom.get("Sudah", 0)),
         "pct": pct(int(kom.get("Sudah", 0)), N), "disamarkan": False},
        {"label": "Sudah menerima Krisma", "n": int(kri.get("Sudah", 0)),
         "pct": pct(int(kri.get("Sudah", 0)), N), "disamarkan": False},
    ], sumber=src("umat.dbf", "KOMUNI, STSKRISMA", "12.614 jiwa terdaftar"),
        komuni_belum=int(kom.get("Belum", 0)), krisma_belum=int(kri.get("Belum", 0)),
        tidak_tercatat=int(kom.get(TIDAK_TERCATAT, 0)))

    wb = u["waktu_baptis"].value_counts()
    p3["3.2"] = scene("3.2", penyebut=N, rows=cat_rows(wb, N),
                      sumber=src("umat.dbf", "KET9", "12.614 jiwa terdaftar"),
                      sebagai_anak=int(wb.get("Dibaptis sebagai anak", 0)),
                      sebagai_anak_pct=pct(int(wb.get("Dibaptis sebagai anak", 0)), N))

    bp, kp = int(u["baptis_di_pugeran"].sum()), int(u["krisma_di_pugeran"].sum())
    p3["3.3"] = scene("3.3", penyebut=N, rows=[
        {"label": "Dibaptis di Pugeran", "n": bp, "pct": pct(bp, N), "disamarkan": False},
        {"label": "Menerima Krisma di Pugeran", "n": kp, "pct": pct(kp, N), "disamarkan": False},
    ], sumber=src("umat.dbf", "TMPBAPTIS, TMPKRISMA → penanda 'di Pugeran'",
                  "12.614 jiwa terdaftar"))

    kw = counts(u["status_perkawinan"], URUT_PERKAWINAN)
    p3["3.4"] = scene("3.4", penyebut=N, rows=cat_rows(kw, N),
                      sumber=src("umat.dbf", "KET10", "12.614 jiwa terdaftar"),
                      sah_katolik=int(kw.get("Perkawinan sah secara Katolik", 0)),
                      belum_menikah=int(kw.get("Belum menikah", 0)))

    gj = counts(u["status_gereja"], URUT_GEREJA)
    aktif_gl = int(gj.get("Aktif di gereja paroki dan di lingkungan", 0))
    tidak_aktif = int(gj.get("Tercatat tidak aktif", 0))
    p3["3.5"] = scene("3.5", penyebut=N, rows=cat_rows(gj, N),
                      sumber=src("umat.dbf", "KET14", "12.614 jiwa terdaftar"),
                      aktif_gereja_lingkungan=aktif_gl,
                      aktif_gereja_lingkungan_pct=pct(aktif_gl, N),
                      tidak_aktif=tidak_aktif, tidak_aktif_pct=pct(tidak_aktif, N))

    kt = u["keterlibatan"].value_counts()
    pelayan = pd.Series({k: int(kt.get(k, 0)) for k in PELAYANAN})
    total_pelayan = int(pelayan.sum())
    p3["3.6"] = scene("3.6", penyebut=total_pelayan, rows=cat_rows(pelayan, total_pelayan),
                      sumber=src("umat.dbf", "KET15", "1.277 jiwa dengan tugas pelayanan tercatat"),
                      total_pelayan=total_pelayan, pelayan_pct=pct(total_pelayan, N),
                      umat_per_pelayan=round(N / total_pelayan, 1))

    ag = u["agama"].value_counts()
    bukan_katolik_mask = ~u["agama"].isin(["Katolik", TIDAK_TERCATAT])
    bukan_katolik = int(bukan_katolik_mask.sum())
    keluarga_lintas = int(u.loc[bukan_katolik_mask, "_np"].nunique())
    p3["3.7"] = scene("3.7", penyebut=bukan_katolik,
                      rows=cat_rows(ag.drop(["Katolik", TIDAK_TERCATAT], errors="ignore"), bukan_katolik),
                      sumber=src("umat.dbf", "KET11", "654 anggota rumah tangga yang tidak Katolik"),
                      bukan_katolik=bukan_katolik,
                      keluarga_lintas_iman=keluarga_lintas,
                      keluarga_lintas_iman_pct=pct(keluarga_lintas, N_KELUARGA),
                      katekumen=int(ag.get("Katekumen", 0)),
                      katolik=int(ag.get("Katolik", 0)))

    # ══ PILAR 4 ═══════════════════════════════════════════════════════════════
    p4 = {}
    pd_vc = counts(u["pendidikan"], URUT_PENDIDIKAN)
    tinggi = int(sum(int(pd_vc.get(k, 0)) for k in PENDIDIKAN_TINGGI))
    p4["4.1"] = scene("4.1", penyebut=N, rows=cat_rows(pd_vc, N),
                      sumber=src("umat.dbf", "KET4", "12.614 jiwa terdaftar"),
                      pendidikan_tinggi=tinggi, pendidikan_tinggi_pct=pct(tinggi, N),
                      terbesar={"label": "SLTA", "n": int(pd_vc.get("SLTA", 0))})

    sk = u["sekolah_katolik"].value_counts()
    tanpa = int(sk.get("Jenis sekolah tidak tercatat", 0))
    tercatat = N - tanpa
    p4["4.2"] = scene("4.2", penyebut=tercatat,
                      rows=cat_rows(sk.drop("Jenis sekolah tidak tercatat", errors="ignore"), tercatat),
                      sumber=src("umat.dbf", "KET4 → akhiran ' - K' / ' - NK'",
                                 "1.780 jiwa yang penandanya tercatat"),
                      tanpa_penanda=tanpa, tanpa_penanda_pct=pct(tanpa, N),
                      celah_data=True)

    bs_vc = u["bidang_studi"].value_counts()
    bs_tt = int(bs_vc.get(TIDAK_TERCATAT, 0))
    bs_terisi = N - bs_tt
    bs_fold, bs_info = fold_tail(bs_vc.drop(TIDAK_TERCATAT, errors="ignore"),
                                 keep=FOLD["bidang_studi"]["keep"],
                                 other_label=FOLD["bidang_studi"]["label_lain"], pin=())
    p4["4.3"] = scene("4.3", penyebut=bs_terisi, rows=cat_rows(bs_fold, bs_terisi),
                      sumber=src("umat.dbf", "KET5", "3.187 jiwa yang bidang studinya tercatat"),
                      terisi=bs_terisi, terisi_pct=pct(bs_terisi, N),
                      tidak_tercatat=bs_tt, tidak_tercatat_pct=pct(bs_tt, N),
                      pelipatan=bs_info)

    pk_vc = u["pekerjaan"].value_counts()
    pk_fold, pk_info = fold_tail(pk_vc, keep=FOLD["pekerjaan"]["keep"],
                                 other_label=FOLD["pekerjaan"]["label_lain"])
    p4["4.4"] = scene("4.4", penyebut=N, rows=cat_rows(pk_fold, N),
                      sumber=src("umat.dbf", "KET6", "12.614 jiwa terdaftar"),
                      tidak_tercatat=int(pk_vc.get(TIDAK_TERCATAT, 0)),
                      tidak_tercatat_pct=pct(int(pk_vc.get(TIDAK_TERCATAT, 0)), N),
                      pelipatan=pk_info)

    ek = counts(kk["ekonomi"], URUT_EKONOMI)
    ek_tercatat = int(ek.drop(TIDAK_TERCATAT, errors="ignore").sum())
    p4["4.5"] = scene("4.5", penyebut=ek_tercatat,
                      rows=cat_rows(ek.drop(TIDAK_TERCATAT, errors="ignore"), ek_tercatat),
                      sumber=src("umatkk.dbf", "KETEKO",
                                 "4.324 keluarga yang kondisi ekonominya tercatat"),
                      perlu_bantuan=int(ek.get("Memerlukan bantuan", 0)),
                      perlu_bantuan_pct=pct(int(ek.get("Memerlukan bantuan", 0)), ek_tercatat),
                      tidak_tercatat=int(ek.get(TIDAK_TERCATAT, 0)),
                      total_kk=N_KK)

    js = u["jabatan_sosial"].value_counts()
    publik = js.drop(["Warga, tanpa jabatan publik", TIDAK_TERCATAT], errors="ignore")
    total_publik = int(publik.sum())
    p4["4.6"] = scene("4.6", penyebut=total_publik, rows=cat_rows(publik, total_publik),
                      sumber=src("umat.dbf", "KET12", "563 jiwa dengan peran publik tercatat"),
                      total=total_publik, total_pct=pct(total_publik, N))

    # ══ PILAR 5 ═══════════════════════════════════════════════════════════════
    p5 = {}
    kes = u["status_kesehatan"].value_counts()
    perhatian = kes.drop(["Tidak ada catatan khusus", TIDAK_TERCATAT], errors="ignore")
    total_perhatian = int(perhatian.sum())
    p5["5.1"] = scene("5.1", penyebut=total_perhatian, rows=cat_rows(perhatian, total_perhatian),
                      sumber=src("umat.dbf", "KET8",
                                 "286 jiwa di luar kategori 'tidak ada catatan khusus'"),
                      total=total_perhatian, total_pct=pct(total_perhatian, N),
                      normal=int(kes.get("Tidak ada catatan khusus", 0)),
                      tidak_tercatat=int(kes.get(TIDAK_TERCATAT, 0)))

    # -- Indeks kerentanan lingkungan (PRD adegan 5.2) -------------------------
    ud = u[u["_dalam_paroki"]]
    base = ud.groupby(["nama_wilayah", "nama_lingkungan"]).agg(
        jiwa=("_np", "size"),
        lansia=("umur", lambda s: int((s.astype("Float64") >= 65).sum())),
    ).reset_index()
    hh_l = ud.groupby(["nama_lingkungan", "_np"]).size().reset_index(name="anggota")
    solo = hh_l[hh_l["anggota"] == 1].groupby("nama_lingkungan").size()
    keluarga_l = hh_l.groupby("nama_lingkungan").size()
    bantu = (kk[kk["ekonomi"] == "Memerlukan bantuan"]
             .groupby("nama_lingkungan").size())
    kk_l = kk.groupby("nama_lingkungan").size()

    base["keluarga"] = base["nama_lingkungan"].map(keluarga_l).fillna(0).astype(int)
    base["rt_satu_orang"] = base["nama_lingkungan"].map(solo).fillna(0).astype(int)
    base["kk_tercatat"] = base["nama_lingkungan"].map(kk_l).fillna(0).astype(int)
    base["perlu_bantuan"] = base["nama_lingkungan"].map(bantu).fillna(0).astype(int)

    base["p_lansia"] = base["lansia"] / base["jiwa"]
    base["p_bantuan"] = np.where(base["kk_tercatat"] > 0,
                                 base["perlu_bantuan"] / base["kk_tercatat"].replace(0, np.nan), 0.0)
    base["p_solo"] = base["rt_satu_orang"] / base["keluarga"].replace(0, np.nan)
    base[["p_bantuan", "p_solo"]] = base[["p_bantuan", "p_solo"]].fillna(0.0)

    def minmax(s: pd.Series) -> pd.Series:
        lo, hi = float(s.min()), float(s.max())
        return (s - lo) / (hi - lo) if hi > lo else s * 0.0

    w = IDX["bobot"]
    base["skor"] = (w["lansia"] * minmax(base["p_lansia"])
                    + w["perlu_bantuan"] * minmax(base["p_bantuan"])
                    + w["rumah_tangga_satu_orang"] * minmax(base["p_solo"])) * 100
    base = base.sort_values("skor", ascending=False).reset_index(drop=True)

    p5["5.2"] = scene("5.2", penyebut=int(base.shape[0]),
                      rows=[{
                          "label": r.nama_lingkungan, "wilayah": r.nama_wilayah,
                          "kelompok": kelompok_wil[r.nama_wilayah],
                          "jiwa": int(r.jiwa), "keluarga": int(r.keluarga),
                          "lansia": int(r.lansia), "p_lansia": round(float(r.p_lansia) * 100, 1),
                          "perlu_bantuan": int(r.perlu_bantuan),
                          "p_bantuan": round(float(r.p_bantuan) * 100, 1),
                          "rt_satu_orang": int(r.rt_satu_orang),
                          "p_solo": round(float(r.p_solo) * 100, 1),
                          "skor": round(float(r.skor), 1),
                          "peringkat": i + 1,
                      } for i, r in enumerate(base.itertuples())],
                      sumber=src("umat.dbf + umatkk.dbf",
                                 "LINGKUNGAN × (umur, NP, KETEKO)",
                                 "88 lingkungan di wilayah paroki"),
                      rumus={
                          "keterangan": "Indeks Prioritas = 100 × (w₁·z(proporsi lansia 65+) + w₂·z(proporsi keluarga memerlukan bantuan) + w₃·z(proporsi keluarga satu orang)), dengan z merupakan normalisasi min–maks terhadap 88 lingkungan di paroki.",
                          "bobot": w,
                          "batas": "Indeks ini disusun sebagai panduan pemetaan prioritas pastoral dan bukan merupakan tolok ukur kemiskinan. Indeks ini membandingkan proporsi relatif antarlingkungan, sehingga nilai terendah hanya mencerminkan indikator kerentanan paling minim di antara 88 lingkungan—bukan berarti tidak memerlukan pendampingan sama sekali.",
                      })

    solo_np = set(hh_size[hh_size == 1].index)
    solo_rows = u[u["_np"].isin(solo_np)]
    solo_age = solo_rows["umur"].astype("Float64").dropna().astype(float)
    p5["5.3"] = scene("5.3", penyebut=int(hh_size.eq(1).sum()), rows=[
        {"label": "Rumah tangga satu orang", "n": int(hh_size.eq(1).sum()),
         "pct": pct(int(hh_size.eq(1).sum()), N_KELUARGA), "disamarkan": False},
        {"label": "Di antaranya berusia 65 tahun ke atas", "n": int((solo_age >= 65).sum()),
         "pct": pct(int((solo_age >= 65).sum()), int(hh_size.eq(1).sum())), "disamarkan": False},
        {"label": "Di antaranya berusia 75 tahun ke atas", "n": int((solo_age >= 75).sum()),
         "pct": pct(int((solo_age >= 75).sum()), int(hh_size.eq(1).sum())), "disamarkan": False},
    ], sumber=src("umat.dbf", "NP + TGLLAHIR → umur pada " + SNAPSHOT_LABEL,
                  "807 rumah tangga beranggota satu orang"))

    luar_mask = u["tempat_tinggal_kategori"] == "Tinggal di luar wilayah paroki"
    luar_vc = u.loc[luar_mask, "tempat_tinggal"].value_counts()
    luar_fold, luar_info = fold_tail(luar_vc, keep=FOLD["tempat_luar"]["keep"],
                                     other_label=FOLD["tempat_luar"]["label_lain"], pin=())
    kos = int((u["tempat_tinggal_kategori"] == "Indekos di wilayah paroki").sum())
    p5["5.4"] = scene("5.4", penyebut=int(luar_mask.sum()),
                      rows=cat_rows(luar_fold, int(luar_mask.sum())),
                      sumber=src("umat.dbf", "KET13",
                                 "373 jiwa yang tercatat tinggal di luar wilayah paroki"),
                      total=int(luar_mask.sum()), total_pct=pct(int(luar_mask.sum()), N),
                      indekos=kos,
                      tidak_tercatat=int((u["tempat_tinggal_kategori"] == TIDAK_TERCATAT).sum()),
                      pelipatan=luar_info)

    p5["5.5"] = scene("5.5", penyebut=N, rows=[
        {"label": "Tercatat tidak aktif", "n": tidak_aktif,
         "pct": pct(tidak_aktif, N), "disamarkan": False},
        {"label": "Aktif di lingkungan, beribadat di paroki lain",
         "n": int(gj.get("Aktif di lingkungan, beribadat di paroki lain", 0)),
         "pct": pct(int(gj.get("Aktif di lingkungan, beribadat di paroki lain", 0)), N),
         "disamarkan": False},
        {"label": "Aktif di gereja dan lingkungan paroki lain",
         "n": int(gj.get("Aktif di gereja dan lingkungan paroki lain", 0)),
         "pct": pct(int(gj.get("Aktif di gereja dan lingkungan paroki lain", 0)), N),
         "disamarkan": False},
        {"label": TIDAK_TERCATAT, "n": int(gj.get(TIDAK_TERCATAT, 0)),
         "pct": pct(int(gj.get(TIDAK_TERCATAT, 0)), N), "disamarkan": False},
    ], sumber=src("umat.dbf", "KET14", "12.614 jiwa terdaftar"),
        tidak_aktif=tidak_aktif, tidak_aktif_pct=pct(tidak_aktif, N))

    gd = counts(u["golongan_darah"], URUT_GOLDARAH)
    gd_tt = int(gd.get(TIDAK_TERCATAT, 0))
    p5["5.6"] = scene("5.6", penyebut=N, rows=cat_rows(gd, N),
                      sumber=src("umat.dbf", "KET7", "12.614 jiwa terdaftar"),
                      tidak_tercatat=gd_tt, tidak_tercatat_pct=pct(gd_tt, N),
                      tercatat=N - gd_tt, celah_data=True)

    # ══ PENUTUP ═══════════════════════════════════════════════════════════════
    celah = [
        {"kolom": "Bidang studi", "sumber": "umat.dbf KET5", "kosong": bs_tt,
         "dari": N, "pct": pct(bs_tt, N), "adegan": "4.3",
         "akibat": "Penyajian pada Adegan 4.3 hanya mencakup umat yang memiliki catatan bidang studi, dengan penjelasan terbuka mengenai proporsi data yang belum terisi."},
        {"kolom": "Penanda sekolah Katolik", "sumber": "umat.dbf KET4", "kosong": tanpa,
         "dari": N, "pct": pct(tanpa, N), "adegan": "4.2",
         "akibat": "Adegan 4.2 tidak menarik kesimpulan menyeluruh bagi paroki, melainkan menegaskan perlunya pendataan sekolah Katolik secara lebih lengkap pada masa mendatang."},
        {"kolom": "Golongan darah", "sumber": "umat.dbf KET7", "kosong": gd_tt,
         "dari": N, "pct": pct(gd_tt, N), "adegan": "5.6",
         "akibat": "Adegan 5.6 menyajikan kelompok 'Tidak tercatat' secara tersendiri demi kejujuran penyajian dan kesiapsiagaan donor darurat."},
        {"kolom": "Pekerjaan", "sumber": "umat.dbf KET6",
         "kosong": int(pk_vc.get(TIDAK_TERCATAT, 0)), "dari": N,
         "pct": pct(int(pk_vc.get(TIDAK_TERCATAT, 0)), N), "adegan": "4.4",
         "akibat": "Kelompok 'Tidak tercatat' tetap dicantumkan pada grafik untuk memperlihatkan proporsi umat yang belum terdokumentasi profesinya."},
        {"kolom": "Tanggal krisma", "sumber": "umat.dbf TGLKRISMA",
         "kosong": int(notes["tgl_krisma_kosong"]), "dari": N,
         "pct": pct(int(notes["tgl_krisma_kosong"]), N), "adegan": None,
         "akibat": "Tidak disajikan grafik tahun penerimaan Krisma karena sebagian besar umat belum memiliki catatan penanggalan krisma."},
        {"kolom": "Tanggal baptis", "sumber": "umat.dbf TGLBAPTIS",
         "kosong": int(notes["tgl_baptis_kosong"]), "dari": N,
         "pct": pct(int(notes["tgl_baptis_kosong"]), N), "adegan": None,
         "akibat": "Tidak disajikan analisis kurun waktu baptis demi menjaga kesahihan data statistik."},
        {"kolom": "Jenis kelamin", "sumber": "umat.dbf KET1", "kosong": jk_tt,
         "dari": N, "pct": pct(jk_tt, N), "adegan": "2.1",
         "akibat": "Piramida usia mencantumkan secara terbuka jumlah jiwa yang belum memiliki catatan jenis kelamin."},
        {"kolom": "Tanggal lahir", "sumber": "umat.dbf TGLLAHIR",
         "kosong": int(notes["tgl_lahir_kosong"]), "dari": N,
         "pct": pct(int(notes["tgl_lahir_kosong"]), N), "adegan": "2.1",
         "akibat": "Umat yang belum memiliki catatan tanggal lahir dipisahkan dari analisis perhitungan usia."},
        {"kolom": "Tanggal nikah", "sumber": "umatkk.dbf TGLNIKAH",
         "kosong": int(notes["tgl_nikah_kosong"]), "dari": N_KK,
         "pct": pct(int(notes["tgl_nikah_kosong"]), N_KK), "adegan": None,
         "akibat": "Tidak disajikan analisis tahun perkawinan demi menjaga keandalan informasi."},
    ]
    anomali = [
        {"temuan": "Baris data dengan kesamaan nama dan tanggal lahir",
         "jumlah": int(notes["dugaan_duplikat_baris"]),
         "kelompok": int(notes["dugaan_duplikat_kelompok"]),
         "perlakuan": "Ditandai dalam laporan validasi dan tidak dihapus otomatis demi kehati-hatian (misalnya kemungkinan kembar atau nama serupa). Dilaporkan sebagai bahan verifikasi bagi sekretariat paroki."},
        {"temuan": "Perbedaan pencatatan jumlah keluarga antarsumber",
         "jumlah": N_KELUARGA - N_KK, "kelompok": None,
         "perlakuan": f"Berkas umat.dbf mencatat {N_KELUARGA} keluarga, sedangkan berkas umatkk.dbf mencatat {N_KK} keluarga. Analisis profil paroki secara konsisten mengacu pada data umat.dbf ({N_KELUARGA} keluarga), dan setiap grafik yang merujuk berkas kepala keluarga mencantumkan penyebutnya secara jelas."},
        {"temuan": "Catatan tanggal lahir tidak wajar",
         "jumlah": int(notes["tgl_lahir_tak_masuk_akal"]), "kelompok": None,
         "perlakuan": "Dikeluarkan dari perhitungan usia dan dicatat dalam laporan audit data."},
        {"temuan": "Catatan tahun perkawinan tidak wajar",
         "jumlah": int(notes["tgl_nikah_tak_masuk_akal"]), "kelompok": None,
         "perlakuan": "Dikeluarkan dari analisis dan dicatat sebagai anomali penanggalan. Tahun yang tertera: "
                      + ", ".join(str(y) for y in notes["tahun_nikah_tak_masuk_akal"]) + "."},
        {"temuan": "Kepala keluarga tanpa catatan jenis kelamin",
         "jumlah": int(kkjk.get(TIDAK_TERCATAT, 0)), "kelompok": None,
         "perlakuan": f"Perhitungan proporsi pada Adegan 1.5 menggunakan penyebut {kkjk_tercatat} kepala keluarga yang memiliki catatan jenis kelamin lengkap, dengan keterangan terbuka pada grafik."},
        {"temuan": "Baris data dengan kode di luar Paroki Pugeran",
         "jumlah": int(raw_counts["umat_luar_paroki"]), "kelompok": None,
         "perlakuan": "Tetap dihitung dalam total 12.614 jiwa terdaftar, namun dikeluarkan dari tabulasi wilayah dan lingkungan Pugeran; keterangan penyebut dinyatakan secara terbuka pada grafik wilayah."},
    ]
    penutup = {
        "celah_data": celah,
        "anomali": anomali,
        "usulan_pembaruan": [
            {"usul": "Melengkapi pencatatan data golongan darah umat melalui pendataan di tingkat lingkungan", "besaran": gd_tt, "satuan": "jiwa", "adegan": "5.6"},
            {"usul": "Melengkapi pendataan profesi dan karya umat pada pembaruan sensus berikutnya", "besaran": int(pk_vc.get(TIDAK_TERCATAT, 0)), "satuan": "jiwa", "adegan": "4.4"},
            {"usul": "Verifikasi langsung oleh sekretariat paroki atas data yang terindikasi ganda", "besaran": int(notes["dugaan_duplikat_kelompok"]), "satuan": "kelompok data", "adegan": None},
            {"usul": "Penyelarasan dan sinkronisasi data keluarga antardokumen sensus", "besaran": N_KELUARGA - N_KK, "satuan": "keluarga", "adegan": None},
            {"usul": "Mendata jenis sekolah (sekolah Katolik) guna mendukung perencanaan reksa pastoral bidang pendidikan", "besaran": tanpa, "satuan": "jiwa", "adegan": "4.2"},
            {"usul": "Mencantumkan tanggal resmi penarikan data pada pembaruan sensus berikutnya", "besaran": None, "satuan": None, "adegan": None},
        ],
    }

    # ══ Tulis JSON turunan ════════════════════════════════════════════════════
    write_json("meta", meta)
    write_json("pembuka", pembuka)
    write_json("pilar1", p1)
    write_json("pilar2", p2)
    write_json("pilar3", p3)
    write_json("pilar4", p4)
    write_json("pilar5", p5)
    write_json("penutup", penutup)

    # ══ Unduhan agregat tersanitasi (public/data) ═════════════════════════════
    lingk_csv = base[[
        "nama_wilayah", "nama_lingkungan", "jiwa", "keluarga", "lansia",
        "rt_satu_orang", "kk_tercatat", "perlu_bantuan", "skor"]].copy()
    lingk_csv.insert(1, "kelompok", lingk_csv["nama_wilayah"].map(kelompok_wil))
    lingk_csv["skor"] = lingk_csv["skor"].round(1)
    write_csv("lingkungan", lingk_csv.rename(
        columns={"nama_wilayah": "wilayah", "nama_lingkungan": "lingkungan",
                 "skor": "indeks_kerentanan"}))
    write_csv("wilayah", wil.rename_axis("wilayah").reset_index(name="jiwa")
              .assign(kelompok=lambda df: df["wilayah"].map(kelompok_wil)))

    def tab(name: str, s: pd.Series, denom: int):
        df = s.rename_axis("kategori").reset_index(name="jiwa")
        df["persen"] = (100 * df["jiwa"] / denom).round(1)
        df["disamarkan"] = df["jiwa"].between(1, SMALL_CELL_THRESHOLD - 1)
        df.loc[df["disamarkan"], ["jiwa", "persen"]] = None
        write_csv(name, df)

    tab("suku", suku_vc, N)
    tab("pendidikan", pd_vc, N)
    tab("pekerjaan", pk_vc, N)
    tab("bidang_studi", bs_vc, N)
    tab("status_perkawinan", kw, N)
    tab("status_gereja", gj, N)
    tab("status_kesehatan", kes, N)
    tab("golongan_darah", gd, N)
    tab("waktu_baptis", wb, N)
    tab("agama", ag, N)
    tab("keterlibatan", kt, N)
    tab("tempat_tinggal", u["tempat_tinggal"].value_counts(), N)
    tab("ekonomi_keluarga", ek, N_KK)

    pyr_out = pyr.reindex(band_order).reset_index()
    pyr_out.columns = ["kelompok_umur", "laki_laki", "perempuan", "tidak_tercatat"][:len(pyr_out.columns)]
    for c in pyr_out.columns[1:]:
        pyr_out.loc[pyr_out[c].between(1, SMALL_CELL_THRESHOLD - 1), c] = None
    write_csv("piramida_usia", pyr_out)
    write_csv("ukuran_rumah_tangga",
              ukuran.rename_axis("jumlah_anggota").reset_index(name="keluarga"))

    log("02_aggregate", "tulis 8 berkas JSON turunan dan 17 berkas CSV agregat")
    log("02_aggregate", "selesai: %d jiwa, %d keluarga, %d lingkungan, %d wilayah"
        % (N, N_KELUARGA, meta["lingkungan_total"], meta["wilayah_total"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
