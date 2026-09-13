"""Salin dan ringkas aset SADASA Academy Design System ke public/.

Halaman harus utuh tanpa jaringan (PRD §9.6, §11.4) dan berada di bawah 2 MB
(PRD §11.2). Berkas .otf dari design system terlalu berat untuk dimuat apa
adanya, jadi huruf disubset ke Latin dan dikemas ulang sebagai woff2. Aset
gambar diperkecil ke ukuran tampil.

Dijalankan sekali; hasilnya masuk repositori. Jalankan ulang bila design system
diperbarui.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter, load_font, parse_unicodes, save_font
from PIL import Image

DS = Path(r"D:\Download\Compressed\SADASA Academy Design System")
ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"
BRAND = ROOT / "public" / "brand"

# Latin dasar + tanda baca yang dipakai naskah Indonesia dan label grafik.
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2000-206F,U+2010-2015,"
    "U+2018-201F,U+2022,U+2026,U+2030,U+2032-2033,U+20AC,U+2122,U+2190-2193,"
    "U+2212,U+2215,U+00D7,U+00F7,U+2264,U+2265"
)

# Hanya berat yang benar-benar dipakai halaman ini.
GOTHAM = {
    "GothamNarrow-Light.otf": ("GothamNarrow-300", 300, "normal"),
    "GothamNarrow-Book.otf": ("GothamNarrow-400", 400, "normal"),
    "GothamNarrow-Medium.otf": ("GothamNarrow-500", 500, "normal"),
    "GothamNarrow-Bold.otf": ("GothamNarrow-700", 700, "normal"),
    "GothamNarrow-Black.otf": ("GothamNarrow-800", 800, "normal"),
}
PASSTHROUGH = [
    "Montserrat-normal-300900-latin.woff2",
    "IBMPlexMono-normal-400-latin.woff2",
    "IBMPlexMono-normal-500-latin.woff2",
]
IMAGES = {
    "logo/sadasa-logo-red-horizontal.png": ("sadasa-logo-red.png", 640),
    "logo/sadasa-logo-white-horizontal.png": ("sadasa-logo-white.png", 640),
    "logo/sadasa-mark-red.png": ("sadasa-mark-red.png", 192),
    "logo/sadasa-mark-white.png": ("sadasa-mark-white.png", 192),
    "motif/accent-ring-faint.png": ("accent-ring-faint.png", 900),
}


def subset_otf(src: Path, dst: Path) -> None:
    opts = Options()
    opts.flavor = "woff2"
    opts.desubroutinize = True
    opts.layout_features = ["kern", "liga", "calt", "tnum", "lnum", "ccmp"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.drop_tables += ["DSIG"]
    font = load_font(str(src), opts)
    sub = Subsetter(options=opts)
    sub.populate(unicodes=parse_unicodes(UNICODES))
    sub.subset(font)
    save_font(font, str(dst), opts)
    font.close()


def main() -> int:
    if not DS.exists():
        print(f"GAGAL: design system tidak ditemukan di {DS}")
        return 1
    FONTS.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)

    total = 0
    for fname, (out, _w, _s) in GOTHAM.items():
        src = DS / "assets" / "fonts" / "gotham" / fname
        dst = FONTS / f"{out}.woff2"
        subset_otf(src, dst)
        total += dst.stat().st_size
        print(f"  subset {fname} -> {dst.name} ({dst.stat().st_size // 1024} KB)")

    for fname in PASSTHROUGH:
        src = DS / "assets" / "fonts" / fname
        if src.exists():
            shutil.copy2(src, FONTS / fname)
            total += (FONTS / fname).stat().st_size
            print(f"  salin  {fname} ({src.stat().st_size // 1024} KB)")

    for rel, (out, width) in IMAGES.items():
        src = DS / "assets" / rel
        if not src.exists():
            print(f"  lewati {rel} (tidak ada)")
            continue
        img = Image.open(src).convert("RGBA")
        if img.width > width:
            img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
        dst = BRAND / out
        img.save(dst, optimize=True)
        total += dst.stat().st_size
        print(f"  gambar {rel} -> {dst.name} ({dst.stat().st_size // 1024} KB)")

    print(f"total aset: {total // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
