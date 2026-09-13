import glob
import os
import time
from pathlib import Path
import pandas as pd
from dbfread import DBF


def convert_dbf_to_csv(raw_dir: Path):
    print(f"=== Mengonversi file .dbf di {raw_dir} ke .csv ===")
    dbf_files = sorted(list(raw_dir.glob("*.dbf")))
    if not dbf_files:
        print("Tidak ada file .dbf ditemukan.")
        return

    for file_path in dbf_files:
        output_csv = file_path.with_suffix(".csv")
        print(f"Memproses: {file_path.name} -> {output_csv.name} ...", end=" ", flush=True)
        t0 = time.time()
        
        try:
            table = DBF(file_path, encoding="utf-8", ignore_missing_memofile=True)
            df = pd.DataFrame(iter(table))
        except UnicodeDecodeError:
            table = DBF(file_path, encoding="cp1252", ignore_missing_memofile=True)
            df = pd.DataFrame(iter(table))
            
        df.to_csv(output_csv, index=False, encoding="utf-8-sig")
        elapsed = time.time() - t0
        print(f"Selesai! ({len(df):,} baris, {len(df.columns)} kolom, {elapsed:.2f} detik)")


def convert_xlsx_to_csv(processed_dir: Path):
    print(f"\n=== Mengonversi file .xlsx di {processed_dir} ke .csv ===")
    xlsx_files = sorted(list(processed_dir.glob("*.xlsx")))
    if not xlsx_files:
        print("Tidak ada file .xlsx ditemukan.")
        return

    for file_path in xlsx_files:
        output_csv = file_path.with_suffix(".csv")
        print(f"Memproses: {file_path.name} -> {output_csv.name} ...", end=" ", flush=True)
        t0 = time.time()
        
        df = pd.read_excel(file_path)
        df.to_csv(output_csv, index=False, encoding="utf-8-sig")
        elapsed = time.time() - t0
        print(f"Selesai! ({len(df):,} baris, {len(df.columns)} kolom, {elapsed:.2f} detik)")


def main():
    base_dir = Path(__file__).resolve().parent.parent
    raw_dir = base_dir / "data" / "raw"
    processed_dir = base_dir / "data" / "processed"

    convert_dbf_to_csv(raw_dir)
    convert_xlsx_to_csv(processed_dir)
    print("\nSemua konversi berhasil selesai!")


if __name__ == "__main__":
    main()

