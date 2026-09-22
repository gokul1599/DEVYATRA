import sqlite3
import os

db_path = r"C:\Users\gokul\OneDrive\Documents\india_temple_master\india_temple_master.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Total records
cur.execute("SELECT COUNT(1) FROM master_temples")
total = cur.fetchone()[0]
print(f"Total Temples in master_temples: {total}")

# 2. Official_Website breakdown
cur.execute("SELECT COUNT(1) FROM master_temples WHERE Official_Website LIKE '%wikipedia.org%'")
wiki_urls = cur.fetchone()[0]

cur.execute("SELECT COUNT(1) FROM master_temples WHERE Official_Website NOT LIKE '%wikipedia.org%' AND Official_Website != 'Not Available' AND Official_Website != ''")
real_official = cur.fetchone()[0]

cur.execute("SELECT COUNT(1) FROM master_temples WHERE Official_Website = 'Not Available' OR Official_Website = '' OR Official_Website IS NULL")
no_website = cur.fetchone()[0]

print(f"\nOfficial_Website Audit:")
print(f"  - Claimed Wikipedia article as 'Official_Website': {wiki_urls} (FLAG: Overclaimed!)")
print(f"  - Genuine official domain (gov.in, temple trust):   {real_official}")
print(f"  - Not Available / Empty:                           {no_website}")

# 3. Booking Audit
cur.execute("SELECT Online_Booking_URL, COUNT(1) FROM master_temples GROUP BY Online_Booking_URL")
booking_urls = cur.fetchall()
print(f"\nOnline_Booking_URL Audit:")
for u, c in booking_urls[:5]:
    print(f"  - {u}: {c} temples")

# 4. Timings Audit
cur.execute("SELECT Morning_Timings, Evening_Timings, COUNT(1) FROM master_temples GROUP BY Morning_Timings, Evening_Timings")
timings = cur.fetchall()
print(f"\nTimings Audit:")
for m, e, c in timings[:5]:
    print(f"  - Morning: '{m}' | Evening: '{e}' -> {c} temples")

# 5. Verification Status
cur.execute("SELECT Verification_Status, COUNT(1) FROM master_temples GROUP BY Verification_Status")
ver_stats = cur.fetchall()
print(f"\nVerification Status Audit:")
for s, c in ver_stats:
    print(f"  - {s}: {c}")

conn.close()
