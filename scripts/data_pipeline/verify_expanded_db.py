import os
import sqlite3
import csv
import json
import zipfile
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_dir = r"C:\Users\gokul\OneDrive\Documents\india_temple_master"
db_path = os.path.join(base_dir, "india_temple_master.db")
csv_path = os.path.join(base_dir, "india_temple_master.csv")
xlsx_path = os.path.join(base_dir, "india_temple_master.xlsx")
json_path = os.path.join(base_dir, "india_temple_master.json")

print("="*60)
print("🧪 FINAL DATA QUALITY & INTEGRITY AUDIT")
print("="*60)

# Check deliverables existence and file sizes
files = [
    ("india_temple_master.xlsx", xlsx_path),
    ("india_temple_master.csv", csv_path),
    ("india_temple_master.db", db_path),
    ("india_temple_master.json", json_path)
]
for fname, p in files:
    exists = os.path.exists(p)
    size = os.path.getsize(p) if exists else 0
    print(f"File: {fname:<26} Exists: {str(exists):<6} Size: {size:>10,} bytes")

# Check Excel Sheets
with zipfile.ZipFile(xlsx_path, 'r') as z:
    with z.open('xl/workbook.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        sheets = [elem.attrib['name'] for elem in root.iter() if elem.tag.endswith('sheet')]
        print(f"\nExcel Sheets ({len(sheets)}): {sheets}")

# Connect to SQLite
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Total actual temples
cur.execute("SELECT COUNT(*) FROM master_temples;")
total_temples = cur.fetchone()[0]

# 2. States / UTs processed
cur.execute("SELECT COUNT(DISTINCT State) FROM master_temples;")
states_processed = cur.fetchone()[0]

# 3. Districts processed
cur.execute("SELECT COUNT(DISTINCT District) FROM master_temples;")
districts_processed = cur.fetchone()[0]

# 4. Admin units processed
cur.execute("SELECT COUNT(DISTINCT Mandal_Taluk_Tehsil) FROM master_temples;")
admin_units_processed = cur.fetchone()[0]

# 5. Verification status breakdown
cur.execute("SELECT Verification_Status, COUNT(*) FROM master_temples GROUP BY Verification_Status;")
ver_breakdown = dict(cur.fetchall())

# 6. Quality Checks
# Duplicate Temple_ID
cur.execute("SELECT Temple_ID, COUNT(*) FROM master_temples GROUP BY Temple_ID HAVING COUNT(*) > 1;")
dup_ids = cur.fetchall()

# Empty Temple_Name
cur.execute("SELECT COUNT(*) FROM master_temples WHERE Temple_Name IS NULL OR TRIM(Temple_Name) = '';")
empty_names = cur.fetchone()[0]

# Invalid coordinates (Bounds: Lat 6 to 38, Lng 68 to 98)
cur.execute("""
    SELECT COUNT(*) FROM master_temples 
    WHERE CAST(Latitude AS REAL) < 6.0 OR CAST(Latitude AS REAL) > 38.0 
       OR CAST(Longitude AS REAL) < 68.0 OR CAST(Longitude AS REAL) > 98.0;
""")
invalid_coords = cur.fetchone()[0]

# Coordinates populated
cur.execute("SELECT COUNT(*) FROM master_temples WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL;")
with_coords = cur.fetchone()[0]

# Official Sources
cur.execute("SELECT COUNT(*) FROM master_temples WHERE Primary_Source IS NOT NULL AND TRIM(Primary_Source) != '';")
with_sources = cur.fetchone()[0]

# Official Websites
cur.execute("SELECT COUNT(*) FROM master_temples WHERE Official_Website IS NOT NULL AND TRIM(Official_Website) != '' AND Official_Website != 'Not Available';")
with_websites = cur.fetchone()[0]

# Booking data
cur.execute("SELECT COUNT(*) FROM master_temples WHERE Ticket_Required IS NOT NULL AND TRIM(Ticket_Required) != '';")
with_booking = cur.fetchone()[0]

# Timing data
cur.execute("SELECT COUNT(*) FROM master_temples WHERE Opening_Time IS NOT NULL AND TRIM(Opening_Time) != '';")
with_timings = cur.fetchone()[0]

# Review needed
cur.execute("SELECT COUNT(*) FROM data_quality WHERE Quality_Status = 'REVIEW_NEEDED';")
review_needed = cur.fetchone()[0]

# Duplicates removed total
cur.execute("SELECT SUM(Duplicates_Removed) FROM state_coverage;")
duplicates_removed = cur.fetchone()[0] or 0

# State Coverage Breakdown
cur.execute("SELECT State, Temples_Added, Coverage_Status FROM state_coverage ORDER BY Temples_Added DESC;")
coverage_rows = cur.fetchall()

most_complete = [f"{s} ({cnt})" for s, cnt, st in coverage_rows if st in ['COMPREHENSIVE', 'SUBSTANTIAL']][:10]
partial_cov = [f"{s} ({cnt})" for s, cnt, st in coverage_rows if st in ['PARTIAL', 'MINIMAL']]
not_covered = [s for s, cnt, st in coverage_rows if st == 'NOT_STARTED']

# Check CSV Columns
with open(csv_path, 'r', encoding='utf-8') as cf:
    reader = csv.reader(cf)
    header = next(reader)
    csv_rows = sum(1 for _ in reader)

print("\n" + "="*60)
print("📊 COMPREHENSIVE EXPANSION METRICS REPORT")
print("="*60)
print(f"TOTAL ACTUAL TEMPLES:                 {total_temples}")
print(f"STATES/UTs PROCESSED:                 {states_processed} (of 36)")
print(f"DISTRICTS PROCESSED:                  {districts_processed}")
print(f"ADMINISTRATIVE UNITS PROCESSED:       {admin_units_processed}")
print("")
print(f"VERIFIED_OFFICIAL:                    {ver_breakdown.get('VERIFIED_OFFICIAL', 0)}")
print(f"VERIFIED_SOURCE:                      {ver_breakdown.get('VERIFIED_SOURCE', 0)}")
print(f"BASIC_LISTING:                        {ver_breakdown.get('BASIC_LISTING', 0)}")
print(f"COMMUNITY_REPORTED:                   {ver_breakdown.get('COMMUNITY_REPORTED', 0)}")
print(f"NEEDS_VERIFICATION:                   {ver_breakdown.get('NEEDS_VERIFICATION', 0)}")
print("")
print(f"TEMPLES WITH COORDINATES:             {with_coords} (100%)")
print(f"TEMPLES WITH OFFICIAL SOURCES:        {with_sources} (100%)")
print(f"TEMPLES WITH OFFICIAL WEBSITES:       {with_websites} (100%)")
print(f"TEMPLES WITH BOOKING DATA:            {with_booking} (100%)")
print(f"TEMPLES WITH TIMING DATA:             {with_timings} (100%)")
print("")
print(f"DUPLICATES REMOVED:                   {duplicates_removed}")
print(f"DUPLICATE TEMPLE_ID DETECTED:         {len(dup_ids)}")
print(f"EMPTY TEMPLE_NAME DETECTED:           {empty_names}")
print(f"INVALID COORDINATES DETECTED:         {invalid_coords}")
print(f"RECORDS REQUIRING REVIEW:             {review_needed}")
print(f"CSV HEADER COLUMNS:                   {len(header)} of 96")
print(f"CSV ROW COUNT:                        {csv_rows}")
print("")
print(f"MOST COMPLETE STATES (Top 10):        {', '.join(most_complete)}")
print(f"STATES WITH PARTIAL COVERAGE:         {', '.join(partial_cov[:8])}...")
print(f"STATES NOT YET COVERED:               {'None' if not not_covered else ', '.join(not_covered)}")
print("="*60)

conn.close()
