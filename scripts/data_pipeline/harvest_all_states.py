import urllib.request
import urllib.parse
import json
import re
import time
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {"User-Agent": "IndiaTempleAtlas/2.0 (https://templeora.org; dev@templeora.org)"}
WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

STATE_CONFIGS = [
    # South India
    {"name": "Andhra Pradesh", "code": "AP", "admin_type": "Mandal", "lang": "te", "category": "Category:Hindu temples in Andhra Pradesh"},
    {"name": "Telangana", "code": "TS", "admin_type": "Mandal", "lang": "te", "category": "Category:Hindu temples in Telangana"},
    {"name": "Tamil Nadu", "code": "TN", "admin_type": "Taluk", "lang": "ta", "category": "Category:Hindu temples in Tamil Nadu"},
    {"name": "Karnataka", "code": "KA", "admin_type": "Taluk", "lang": "kn", "category": "Category:Hindu temples in Karnataka"},
    {"name": "Kerala", "code": "KL", "admin_type": "Taluk", "lang": "ml", "category": "Category:Hindu temples in Kerala"},
    {"name": "Puducherry", "code": "PY", "admin_type": "Taluk", "lang": "ta", "category": "Category:Hindu temples in Puducherry"},
    
    # West & Central India
    {"name": "Maharashtra", "code": "MH", "admin_type": "Taluka", "lang": "mr", "category": "Category:Hindu temples in Maharashtra"},
    {"name": "Gujarat", "code": "GJ", "admin_type": "Taluka", "lang": "gu", "category": "Category:Hindu temples in Gujarat"},
    {"name": "Goa", "code": "GA", "admin_type": "Taluka", "lang": "kok", "category": "Category:Hindu temples in Goa"},
    {"name": "Madhya Pradesh", "code": "MP", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Madhya Pradesh"},
    {"name": "Chhattisgarh", "code": "CG", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Chhattisgarh"},
    {"name": "Rajasthan", "code": "RJ", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Rajasthan"},
    {"name": "Dadra and Nagar Haveli and Daman and Diu", "code": "DH", "admin_type": "Taluka", "lang": "gu", "category": "Category:Hindu temples in Dadra and Nagar Haveli and Daman and Diu"},

    # North India
    {"name": "Uttar Pradesh", "code": "UP", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Uttar Pradesh"},
    {"name": "Uttarakhand", "code": "UK", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Uttarakhand"},
    {"name": "Himachal Pradesh", "code": "HP", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Himachal Pradesh"},
    {"name": "Punjab", "code": "PB", "admin_type": "Tehsil", "lang": "pa", "category": "Category:Hindu temples in Punjab, India"},
    {"name": "Haryana", "code": "HR", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Haryana"},
    {"name": "Delhi", "code": "DL", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Delhi"},
    {"name": "Jammu and Kashmir", "code": "JK", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Jammu and Kashmir"},
    {"name": "Ladakh", "code": "LA", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Ladakh"},
    {"name": "Chandigarh", "code": "CH", "admin_type": "Tehsil", "lang": "hi", "category": "Category:Hindu temples in Chandigarh"},

    # East, Northeast & Islands
    {"name": "Odisha", "code": "OD", "admin_type": "Tehsil", "lang": "or", "category": "Category:Hindu temples in Odisha"},
    {"name": "West Bengal", "code": "WB", "admin_type": "Sub-Division", "lang": "bn", "category": "Category:Hindu temples in West Bengal"},
    {"name": "Bihar", "code": "BR", "admin_type": "Sub-Division", "lang": "hi", "category": "Category:Hindu temples in Bihar"},
    {"name": "Jharkhand", "code": "JH", "admin_type": "Sub-Division", "lang": "hi", "category": "Category:Hindu temples in Jharkhand"},
    {"name": "Assam", "code": "AS", "admin_type": "Sub-Division", "lang": "as", "category": "Category:Hindu temples in Assam"},
    {"name": "Tripura", "code": "TR", "admin_type": "Sub-Division", "lang": "bn", "category": "Category:Hindu temples in Tripura"},
    {"name": "Sikkim", "code": "SK", "admin_type": "Sub-Division", "lang": "ne", "category": "Category:Hindu temples in Sikkim"},
    {"name": "Arunachal Pradesh", "code": "AR", "admin_type": "Circle", "lang": "en", "category": "Category:Hindu temples in Arunachal Pradesh"},
    {"name": "Manipur", "code": "MN", "admin_type": "Sub-Division", "lang": "mni", "category": "Category:Hindu temples in Manipur"},
    {"name": "Meghalaya", "code": "ML", "admin_type": "Sub-Division", "lang": "en", "category": "Category:Hindu temples in Meghalaya"},
    {"name": "Mizoram", "code": "MZ", "admin_type": "Sub-Division", "lang": "en", "category": "Category:Hindu temples in Mizoram"},
    {"name": "Nagaland", "code": "NL", "admin_type": "Sub-Division", "lang": "en", "category": "Category:Hindu temples in Nagaland"},
    {"name": "Andaman and Nicobar Islands", "code": "AN", "admin_type": "Tehsil", "lang": "en", "category": "Category:Hindu temples in the Andaman and Nicobar Islands"},
    {"name": "Lakshadweep", "code": "LD", "admin_type": "Sub-Division", "lang": "ml", "category": "Category:Places of worship in Lakshadweep"}
]

def fetch_category_pages(cat_title, max_depth=2, current_depth=1, seen_titles=None):
    if seen_titles is None:
        seen_titles = set()
    pages = []
    subcats = []
    cmcontinue = None

    while True:
        params = {
            "action": "query",
            "format": "json",
            "list": "categorymembers",
            "cmtitle": cat_title,
            "cmlimit": "50"
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue
        url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode('utf-8'))
                members = data.get('query', {}).get('categorymembers', [])
                for m in members:
                    t = m.get('title', '')
                    ns = m.get('ns', 0)
                    if ns == 0 and t not in seen_titles:
                        if not any(x in t.lower() for x in ['list of', 'timeline', 'architecture of', 'history of', 'mythology of']):
                            seen_titles.add(t)
                            pages.append((m.get('pageid'), t))
                    elif ns == 14 and current_depth < max_depth:
                        t_lower = t.lower()
                        if any(k in t_lower for k in ['temple', 'shrine', 'peetha', 'kshetram', 'tirtha', 'kovil', 'gudi', 'devasthanam']):
                            if not any(x in t_lower for x in ['people', 'festivals', 'films', 'stubs', 'lists', 'trusts', 'organisations', 'by city']):
                                subcats.append(t)
                cmcontinue = data.get('continue', {}).get('cmcontinue')
                if not cmcontinue:
                    break
        except Exception as e:
            break
        time.sleep(0.04)

    for sc in subcats:
        pages.extend(fetch_category_pages(sc, max_depth, current_depth + 1, seen_titles))

    return pages

def fetch_details_batch(titles):
    params = {
        "action": "query",
        "format": "json",
        "titles": "|".join(titles),
        "prop": "coordinates|extracts|pageprops|categories",
        "exintro": "1",
        "explaintext": "1",
        "cllimit": "50"
    }
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode('utf-8'))
            return data.get('query', {}).get('pages', {})
    except Exception as e:
        print(f"Error fetching batch: {e}")
        return {}

def fetch_wikidata_batch(qids, lang):
    if not qids:
        return {}
    params = {
        "action": "wbgetentities",
        "format": "json",
        "ids": "|".join(qids),
        "props": "claims|labels",
        "languages": f"en|{lang}|hi|te|ta|kn|ml|mr|gu|bn|or"
    }
    url = f"{WIKIDATA_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode('utf-8'))
            return data.get('entities', {})
    except Exception as e:
        return {}

def extract_district(categories, text, default_state):
    # Try finding district from category e.g. "Category:Hindu temples in Thanjavur district"
    for cat in categories:
        m = re.search(r'in ([A-Z][a-z\s]+) district', cat, re.IGNORECASE)
        if m:
            d = m.group(1).strip()
            if not any(x in d.lower() for x in ['the', 'this', 'hindu', 'temple', 'ancient']):
                return d
    # Try finding in extract text
    m2 = re.search(r'in (?:the )?([A-Z][a-zA-Z\s]+) district', text)
    if m2:
        d = m2.group(1).strip()
        if len(d) < 25 and not any(x in d.lower() for x in ['the', 'state', 'india', 'capital']):
            return d
    return default_state + " Central"

def detect_deity(text, title):
    combined = (title + " " + text).lower()
    if any(k in combined for k in ['shiva', 'shivan', 'mahadev', 'lingam', 'nataraja', 'dakshinamurthy', 'somnath', 'mallikarjuna', 'mahakal', 'omkareshwar', 'kedarnath', 'bhimashankar', 'kashi vishwanath', 'trimbakeshwar', 'vaidyanath', 'nageshwar', 'rameshwar', 'grishneshwar']):
        return "Lord Shiva", "Shaivism", "Swayambhu Lingam"
    elif any(k in combined for k in ['venkateswara', 'balaji', 'vishnu', 'perumal', 'ranganatha', 'narayana', 'padmanabhaswamy', 'jagannath', 'srinivasa', 'govinda']):
        return "Lord Vishnu (Venkateswara / Perumal / Narayana)", "Vaishnavism", "Standing / Reclining Chaturbhuja Murti"
    elif any(k in combined for k in ['krishna', 'radha', 'govind', 'banke bihari', 'dwarkadhish', 'shrinathji', 'guruvayurappan', 'parthasarathy']):
        return "Lord Krishna", "Vaishnavism", "Chaturbhuja / Tribhanga Murti"
    elif any(k in combined for k in ['rama', 'ramachandra', 'kothandaramar', 'raghunath', 'sita rama']):
        return "Lord Rama", "Vaishnavism", "Dhanurdhara Rama with Sita & Lakshmana"
    elif any(k in combined for k in ['durga', 'devi', 'kali', 'parvati', 'lakshmi', 'saraswati', 'amman', 'bhavani', 'kamakhya', 'chamundeshwari', 'mahalakshmi', 'vaishno devi', 'mariamman', 'meenakshi', 'kamakshi']):
        return "Goddess Shakti / Devi (Amman / Durga)", "Shaktism", "Vigraha with Weaponry & Abhaya Mudra"
    elif any(k in combined for k in ['ganesha', 'vinayaka', 'ganapati', 'pillayar', 'vighnaharta']):
        return "Lord Ganesha", "Smarta / Ganapatya", "Vakratunda Chatur-hasta Murti"
    elif any(k in combined for k in ['murugan', 'kartikeya', 'subrahmanya', 'skanda', 'shanmukha', 'velan']):
        return "Lord Murugan (Subrahmanya / Kartikeya)", "Kaumaram", "Standing Velayudha Murti"
    elif any(k in combined for k in ['hanuman', 'anjaneya', 'maruti', 'bajrangbali']):
        return "Lord Hanuman", "Vaishnavism", "Veera Anjaneya"
    elif any(k in combined for k in ['surya', 'sun god', 'aditya', 'martand']):
        return "Lord Surya (Sun God)", "Surya / Saurya", "Seven-Horse Chariot Form"
    return "Lord Shiva / Maha Vishnu", "Sanatana Dharma", "Sacred Murti / Lingam"

def detect_style(text, state):
    t = text.lower()
    if 'dravidian' in t or state in ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry']:
        return "Dravidian"
    elif 'nagara' in t or state in ['Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Bihar', 'Uttarakhand']:
        return "Nagara"
    elif 'vesara' in t:
        return "Vesara"
    elif 'kalinga' in t or state in ['Odisha']:
        return "Kalinga"
    elif 'hemadpanthi' in t or (state == 'Maharashtra' and 'stone' in t):
        return "Hemadpanthi"
    elif 'kathkuni' in t or state in ['Himachal Pradesh', 'Uttarakhand']:
        return "Kathkuni / Himalayan Hill Style"
    return "Classical Indian Temple Architecture"

def detect_dynasty_era(text):
    t = text.lower()
    dynasties = [
        ('chola', 'Chola Dynasty', '9th to 12th Century CE'),
        ('pallava', 'Pallava Dynasty', '6th to 8th Century CE'),
        ('vijayanagara', 'Vijayanagara Empire', '14th to 16th Century CE'),
        ('pandya', 'Pandya Dynasty', '7th to 14th Century CE'),
        ('hoysala', 'Hoysala Empire', '11th to 14th Century CE'),
        ('chalukya', 'Chalukya Dynasty', '6th to 12th Century CE'),
        ('kakatiya', 'Kakatiya Dynasty', '12th to 14th Century CE'),
        ('rashtrakuta', 'Rashtrakuta Dynasty', '8th to 10th Century CE'),
        ('chandela', 'Chandela Dynasty', '10th to 12th Century CE'),
        ('gupta', 'Gupta Empire', '4th to 6th Century CE'),
        ('maratha', 'Maratha Empire', '17th to 18th Century CE'),
        ('paramara', 'Paramara Dynasty', '10th to 13th Century CE'),
        ('solanki', 'Solanki (Chaulukya) Dynasty', '10th to 13th Century CE'),
        ('ganga', 'Eastern Ganga Dynasty', '11th to 15th Century CE'),
        ('ahilyabai', 'Holkar Dynasty (Ahilyabai Holkar)', '18th Century CE')
    ]
    for key, dyn, era in dynasties:
        if key in t:
            return dyn, era
    return "Documented Antiquity / Medieval Era", "8th - 16th Century CE"

def main():
    print("="*60)
    print("🇮🇳 STARTING NATIONWIDE MULTI-STATE TEMPLE HARVEST")
    print("="*60)

    harvested_temples = []
    state_metrics = []

    for cfg in STATE_CONFIGS:
        s_name = cfg["name"]
        s_code = cfg["code"]
        s_admin = cfg["admin_type"]
        s_lang = cfg["lang"]
        s_cat = cfg["category"]

        print(f"\nProcessing {s_name} ({s_code})...")
        # Step 1: Discover articles
        pages = fetch_category_pages(s_cat, max_depth=2)
        print(f"  - Discovered {len(pages)} articles from {s_cat}")

        state_temples = []
        # Step 2: Batch fetch details (50 at a time)
        page_titles = [p[1] for p in pages]
        batch_size = 50

        for i in range(0, len(page_titles), batch_size):
            batch = page_titles[i:i+batch_size]
            details = fetch_details_batch(batch)
            qids_to_fetch = []
            page_data_list = []

            for pid, p in details.items():
                title = p.get('title', '')
                extract = p.get('extract', '')
                coords = p.get('coordinates', [{}])[0]
                lat, lon = coords.get('lat'), coords.get('lon')
                qid = p.get('pageprops', {}).get('wikibase_item')
                categories = [c.get('title', '') for c in p.get('categories', [])]

                item = {
                    "title": title,
                    "extract": extract,
                    "lat": lat,
                    "lon": lon,
                    "qid": qid,
                    "categories": categories,
                    "state": s_name,
                    "state_code": s_code,
                    "admin_type": s_admin,
                    "lang": s_lang
                }
                if qid and (lat is None or lon is None):
                    qids_to_fetch.append(qid)
                page_data_list.append(item)

            # Step 3: Fetch missing coordinates/labels from Wikidata
            wikidata_entities = fetch_wikidata_batch(qids_to_fetch, s_lang)
            for item in page_data_list:
                qid = item["qid"]
                local_name = ""
                if qid and qid in wikidata_entities:
                    ent = wikidata_entities[qid]
                    # Native label
                    labels = ent.get('labels', {})
                    if s_lang in labels:
                        local_name = labels[s_lang].get('value', '')
                    elif 'hi' in labels:
                        local_name = labels['hi'].get('value', '')

                    # Coords
                    if item["lat"] is None or item["lon"] is None:
                        p625 = ent.get('claims', {}).get('P625', [])
                        if p625:
                            val = p625[0].get('mainsnak', {}).get('datavalue', {}).get('value', {})
                            item["lat"] = val.get('latitude')
                            item["lon"] = val.get('longitude')

                item["local_name"] = local_name
                state_temples.append(item)

            time.sleep(0.05)

        print(f"  - Successfully processed details for {len(state_temples)} temples in {s_name}.")
        harvested_temples.extend(state_temples)
        state_metrics.append({
            "state": s_name,
            "discovered": len(pages),
            "processed": len(state_temples)
        })

    # Save raw harvested data
    out_file = r"C:\Users\gokul\OneDrive\Documents\india_temple_master\scripts\raw_harvested_temples.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(harvested_temples, f, ensure_ascii=False, indent=2)

    print("\n" + "="*60)
    print("TOTAL HARVEST SUMMARY")
    print("="*60)
    print(f"Total raw temple records harvested across all 36 States/UTs: {len(harvested_temples)}")
    print(f"Saved raw harvest to: {out_file}")

if __name__ == "__main__":
    main()
