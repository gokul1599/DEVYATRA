import sqlite3
import json
import os

DB_PATH = "data/india_temple_master.db"
AUDIT_DIR = "data/audit"

os.makedirs(AUDIT_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

# 1. P0 Centroid Fallbacks
c.execute("""
    SELECT Temple_ID, Temple_Name, State, District, Mandal_Taluk_Tehsil, Village_City_Town, Latitude, Longitude, Source_URL, Official_Record_ID
    FROM master_temples
    WHERE (ROUND(CAST(Latitude AS REAL), 4) = 20.5937 AND ROUND(CAST(Longitude AS REAL), 4) = 78.9629)
       OR (Latitude = '20.5937' AND Longitude = '78.9629')
""")
centroid_records = [dict(row) for row in c.fetchall()]
with open(os.path.join(AUDIT_DIR, "p0_centroid_fallbacks.json"), "w", encoding="utf-8") as f:
    json.dump({"issue": "National Centroid Fallback (20.5937, 78.9629)", "count": len(centroid_records), "records": centroid_records}, f, indent=2)
print(f"Centroid fallbacks: {len(centroid_records)}")

# 2. P0 Synthetic Google Place IDs
c.execute("""
    SELECT Temple_ID, Temple_Name, State, District, Google_Place_ID
    FROM master_temples
    WHERE Google_Place_ID LIKE 'ChIJ_%'
       OR Google_Place_ID LIKE 'ChIJb8Wn171-ODs%'
""")
synthetic_place_ids = [dict(row) for row in c.fetchall()]
with open(os.path.join(AUDIT_DIR, "p0_synthetic_place_ids.json"), "w", encoding="utf-8") as f:
    json.dump({"issue": "Synthetic Google Place IDs", "count": len(synthetic_place_ids), "records": synthetic_place_ids}, f, indent=2)
print(f"Synthetic Place IDs: {len(synthetic_place_ids)}")

# 3. P0 Boilerplate Festivals
c.execute("""
    SELECT Temple_ID, Temple_Name, State, District, Major_Festivals
    FROM master_temples
    WHERE Major_Festivals LIKE '%Annual Brahmotsavam%'
       OR Major_Festivals LIKE '%World Heritage Day%'
""")
boilerplate_festivals = [dict(row) for row in c.fetchall()]
with open(os.path.join(AUDIT_DIR, "p0_boilerplate_festivals.json"), "w", encoding="utf-8") as f:
    json.dump({"issue": "Boilerplate Festival Templates", "count": len(boilerplate_festivals), "records": boilerplate_festivals}, f, indent=2)
print(f"Boilerplate festivals: {len(boilerplate_festivals)}")

# 4. P0 Bare Monument Names
c.execute("""
    SELECT Temple_ID, Temple_Name, State, District, Village_City_Town, Official_Record_ID, Primary_Source
    FROM master_temples
    WHERE LOWER(TRIM(Temple_Name)) = 'temple'
""")
bare_names = [dict(row) for row in c.fetchall()]
with open(os.path.join(AUDIT_DIR, "p0_bare_monument_names.json"), "w", encoding="utf-8") as f:
    json.dump({"issue": "Bare Monument Name 'Temple'", "count": len(bare_names), "records": bare_names}, f, indent=2)
print(f"Bare monument names: {len(bare_names)}")

# 5. State & District Coverage Gap
c.execute("""
    SELECT State, Official_Record_Count, Records_Retrieved, Missing_Records, Coverage, Source
    FROM state_coverage_audit
    ORDER BY Records_Retrieved DESC
""")
state_audit = [dict(row) for row in c.fetchall()]
with open(os.path.join(AUDIT_DIR, "state_district_coverage_gap.json"), "w", encoding="utf-8") as f:
    json.dump({"issue": "State Endowment Gap Audit", "count": len(state_audit), "records": state_audit}, f, indent=2)
print(f"State coverage audit records: {len(state_audit)}")

# 6. Overall Summary Audit
c.execute("SELECT COUNT(*) FROM master_temples")
total_temples = c.fetchone()[0]

c.execute("SELECT COUNT(DISTINCT State) FROM master_temples")
total_states = c.fetchone()[0]

c.execute("SELECT COUNT(DISTINCT District) FROM master_temples")
total_districts = c.fetchone()[0]

c.execute("SELECT COUNT(DISTINCT Mandal_Taluk_Tehsil) FROM master_temples")
total_admin_units = c.fetchone()[0]

c.execute("SELECT Verification_Status, COUNT(*) FROM master_temples GROUP BY Verification_Status")
verification_breakdown = dict(c.fetchall())

c.execute("SELECT Data_Confidence, COUNT(*) FROM master_temples GROUP BY Data_Confidence")
confidence_breakdown = dict(c.fetchall())

c.execute("SELECT COUNT(*) FROM master_temples WHERE Official_Website IS NOT NULL AND Official_Website != '' AND Official_Website != 'Not Available'")
genuine_websites = c.fetchone()[0]

c.execute("SELECT COUNT(*) FROM master_temples WHERE Online_Booking_URL IS NOT NULL AND Online_Booking_URL != '' AND Online_Booking_URL != 'Not Available'")
active_booking = c.fetchone()[0]

c.execute("SELECT COUNT(*) FROM master_temples WHERE Opening_Time IS NOT NULL AND Opening_Time != '' AND Opening_Time != 'NOT_VERIFIED'")
verified_timings = c.fetchone()[0]

summary = {
    "total_temples": total_temples,
    "total_states": total_states,
    "total_districts": total_districts,
    "total_admin_units": total_admin_units,
    "verification_breakdown": verification_breakdown,
    "confidence_breakdown": confidence_breakdown,
    "genuine_official_websites": genuine_websites,
    "active_online_booking_portals": active_booking,
    "verified_timing_schedules": verified_timings,
    "p0_issues": {
        "centroid_fallbacks": len(centroid_records),
        "synthetic_place_ids": len(synthetic_place_ids),
        "boilerplate_festivals": len(boilerplate_festivals),
        "bare_monument_names": len(bare_names)
    }
}

with open(os.path.join(AUDIT_DIR, "audit_summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

print("\nAudit Summary successfully generated in data/audit/!")
print(json.dumps(summary, indent=2))
