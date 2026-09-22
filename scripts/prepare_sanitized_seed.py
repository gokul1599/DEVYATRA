import sqlite3
import json
import unicodedata
import os
import re

DB_PATH = "data/india_temple_master.db"
OUTPUT_PATH = "data/sanitized_master_seed.json"

def detect_script(text):
    if not text or text.strip() == "":
        return "Latn", "en-translit", False
    for ch in text:
        if ch.isalpha():
            try:
                name = unicodedata.name(ch).split()[0]
                if name == "TELUGU": return "Telu", "te", True
                if name == "TAMIL": return "Taml", "ta", True
                if name == "KANNADA": return "Knda", "kn", True
                if name == "MALAYALAM": return "Mlym", "ml", True
                if name == "DEVANAGARI": return "Deva", "hi", True
                if name == "BENGALI": return "Beng", "bn", True
                if name == "ORIYA": return "Orya", "or", True
                if name == "GUJARATI": return "Gujr", "gu", True
                if name == "GURMUKHI": return "Guru", "pa", True
                if name == "MEETEI": return "Mtei", "mni", True
            except:
                pass
    return "Latn", "en-translit", False

def slugify(text):
    if not text: return "unknown"
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("Reading SQLite database...")

# States
c.execute("SELECT * FROM states")
states = [dict(r) for r in c.fetchall()]

# Districts
c.execute("SELECT * FROM districts")
districts = [dict(r) for r in c.fetchall()]

# Admin Units
c.execute("SELECT * FROM administrative_units")
admin_units = [dict(r) for r in c.fetchall()]

# Master Temples with P0 Fixes
c.execute("SELECT * FROM master_temples")
raw_temples = [dict(r) for r in c.fetchall()]

sanitized_temples = []
translations = []

# Bare name mapping
bare_name_fixes = {
    "IN-MH-NAG-000548": "Ghogra Shiva Temple (ASI N-MH-N77)",
    "IN-RJ-BAR-000513": "Baran Ancient Temple (ASI N-RJ-92)",
    "IN-RJ-KOT-000516": "Dara Mukandara Temple (ASI N-RJ-96)",
    "IN-WB-NAD-000525": "Palpara Chala Temple (ASI N-WB-132)"
}

for t in raw_temples:
    tid = t["Temple_ID"]
    name = t["Temple_Name"].strip()
    if tid in bare_name_fixes:
        name = bare_name_fixes[tid]
    
    # Fix 1: Centroid Coordinates
    lat = float(t["Latitude"]) if t["Latitude"] else 0.0
    lng = float(t["Longitude"]) if t["Longitude"] else 0.0
    is_centroid = (round(lat, 4) == 20.5937 and round(lng, 4) == 78.9629)
    
    # Fix 2: Synthetic Place IDs
    raw_pid = t.get("Google_Place_ID")
    if raw_pid and (raw_pid.startswith("ChIJ_") or raw_pid.startswith("ChIJb8Wn171-ODs")):
        pid = None
        pid_status = "PENDING_LOOKUP"
    elif raw_pid and raw_pid.strip() != "":
        pid = raw_pid.strip()
        pid_status = "VERIFIED"
    else:
        pid = None
        pid_status = "PENDING_LOOKUP"
        
    # Fix 3: Data Confidence
    raw_conf = str(t.get("Data_Confidence", "50")).strip()
    if raw_conf == "HIGH":
        conf = 90
    else:
        try:
            conf = int(raw_conf)
        except:
            conf = 50
            
    # Fix 4: Verification status
    v_status = t.get("Verification_Status", "UNVERIFIED")
    if is_centroid:
        v_status = "NEEDS_VERIFICATION"
        
    # Translations
    local_name = t.get("Temple_Name_Local", "")
    script_code, lang_code, is_native = detect_script(local_name)
    if local_name and local_name.strip():
        translations.append({
            "templeId": tid,
            "languageCode": lang_code,
            "scriptCode": script_code,
            "translatedName": local_name.strip(),
            "transliteratedName": name if is_native else None,
            "isCanonicalNative": is_native,
            "source": t.get("Primary_Source", "Gazetteer"),
            "verificationStatus": "VERIFIED" if is_native else "NEEDS_VERIFICATION"
        })

    sanitized_temples.append({
        "id": tid,
        "identifier": f"TEMPLE-IND-{t.get('State_Code', 'XX')}-{slugify(t.get('District', 'DST'))[:3].upper()}-{tid[-6:]}",
        "slug": f"{slugify(name)}-{slugify(t.get('State', 'IN'))}-{tid[-6:].lower()}",
        "name": name,
        "nameLocal": local_name if is_native else None,
        "alternativeNames": [t["Alternate_Name"].strip()] if t.get("Alternate_Name") and t["Alternate_Name"].strip() else [],
        "description": t.get("Temple_Description") or t.get("Why_Famous") or "Historical heritage shrine.",
        "mainDeity": t.get("Main_Deity"),
        "deities": [d.strip() for d in t.get("Secondary_Deities", "").split(";") if d.strip()],
        "templeType": t.get("Temple_Type"),
        "tradition": [t.get("Religious_Tradition")] if t.get("Religious_Tradition") else [],
        "architecture": t.get("Architectural_Style"),
        "historicalPeriod": t.get("Historical_Era") or t.get("Construction_Period"),
        "establishedYear": t.get("Construction_Period"),
        "latitude": lat,
        "longitude": lng,
        "address": t.get("Address"),
        "stateCode": t.get("State_Code"),
        "districtName": t.get("District"),
        "adminUnitName": t.get("Mandal_Taluk_Tehsil"),
        "localityName": t.get("Village_City_Town"),
        "officialWebsite": None if t.get("Official_Website") == "Not Available" else t.get("Official_Website"),
        "officialPhone": None if t.get("Official_Phone") == "Not Available" else t.get("Official_Phone"),
        "officialEmail": None if t.get("Official_Email") == "Not Available" else t.get("Official_Email"),
        "googleMapsUrl": t.get("Map_URL"),
        "verificationStatus": v_status,
        "dataConfidence": conf,
        "googlePlaceId": pid,
        "googlePlaceVerificationStatus": pid_status,
        "isCentroidFallback": is_centroid,
        "asiMonumentId": t.get("Official_Record_ID") if (t.get("Official_Record_ID") or "").startswith("N-") else None,
        "source": t.get("Primary_Source"),
        "sourceType": t.get("Source_Type"),
        "sourceUrl": t.get("Source_URL"),
        "lastVerifiedAt": t.get("Last_Verified_Date"),
        
        # Timing raw for child table
        "openingTime": t.get("Opening_Time"),
        "closingTime": t.get("Closing_Time"),
        
        # Booking raw for child table
        "onlineBookingUrl": None if t.get("Online_Booking_URL") == "Not Available" else t.get("Online_Booking_URL"),
        "ticketRequired": t.get("Ticket_Required"),
        "ticketPrice": t.get("Ticket_Price"),
        
        # Festival raw for child table
        "majorFestivals": t.get("Major_Festivals")
    })

# Sources
c.execute("SELECT * FROM temple_sources")
sources = [dict(r) for r in c.fetchall()]

# Festivals
c.execute("SELECT * FROM festivals")
festivals = [dict(r) for r in c.fetchall()]

# Booking
c.execute("SELECT * FROM booking")
bookings = [dict(r) for r in c.fetchall()]

# Nearby Places
c.execute("SELECT * FROM nearby_places")
nearby = [dict(r) for r in c.fetchall()]

# Audit Results
c.execute("SELECT * FROM audit_results")
audit_results = [dict(r) for r in c.fetchall()]

output_data = {
    "states": states,
    "districts": districts,
    "admin_units": admin_units,
    "temples": sanitized_temples,
    "translations": translations,
    "sources": sources,
    "festivals": festivals,
    "bookings": bookings,
    "nearby": nearby,
    "audit_results": audit_results
}

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2)

print(f"Sanitized seed dataset written to {OUTPUT_PATH}")
print(f"  Temples: {len(sanitized_temples)}")
print(f"  Translations: {len(translations)}")
print(f"  Sources: {len(sources)}")
print(f"  Nearby Places: {len(nearby)}")
print(f"  Audit Results: {len(audit_results)}")
