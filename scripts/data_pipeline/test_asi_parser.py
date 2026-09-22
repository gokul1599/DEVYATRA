import urllib.request
import urllib.parse
import json
import re

HEADERS = {"User-Agent": "IndiaTempleAtlas/3.0 (dev@templeora.org)"}
api_url = "https://en.wikipedia.org/w/api.php"

params = {
    "action": "parse",
    "format": "json",
    "page": "List of Monuments of National Importance in Bangalore circle",
    "prop": "wikitext"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        wikitext = data.get('parse', {}).get('wikitext', {}).get('*', '')
        # Match ASI Monument row
        pattern = r'\{\{ASI Monument row\s*(.*?)\n\}\}'
        rows = re.findall(pattern, wikitext, re.DOTALL | re.IGNORECASE)
        print(f"Total ASI Monument rows found in Bangalore circle: {len(rows)}")
        temple_count = 0
        for r in rows:
            desc_m = re.search(r'\|\s*description\s*=\s*(.*?)(?=\n\s*\||\Z)', r, re.DOTALL)
            num_m = re.search(r'\|\s*number\s*=\s*(.*?)(?=\n\s*\||\Z)', r, re.DOTALL)
            dist_m = re.search(r'\|\s*district\s*=\s*(.*?)(?=\n\s*\||\Z)', r, re.DOTALL)
            loc_m = re.search(r'\|\s*location\s*=\s*(.*?)(?=\n\s*\||\Z)', r, re.DOTALL)
            lat_m = re.search(r'\|\s*lat\s*=\s*(.*?)(?=\n\s*\||\Z)', r, re.DOTALL)
            lon_m = re.search(r'\|\s*lon\s*=\s*(.*?)(?=\n\s*\||\Z)', r, re.DOTALL)

            desc = desc_m.group(1).strip() if desc_m else ""
            desc_clean = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', desc)
            num = num_m.group(1).strip() if num_m else ""
            dist = dist_m.group(1).strip() if dist_m else ""
            dist_clean = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', dist)
            loc = loc_m.group(1).strip() if loc_m else ""
            loc_clean = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', loc)
            lat = lat_m.group(1).strip() if lat_m else ""
            lon = lon_m.group(1).strip() if lon_m else ""

            if any(k in desc_clean.lower() for k in ['temple', 'gudi', 'shrine', 'basadi', 'devasthanam', 'varadaraja', 'narasimha', 'someshwara', 'rameshwara', 'keshava', 'shiva', 'vishnu', 'isvara']):
                temple_count += 1
                if temple_count <= 10:
                    print(f"  - [{num}] {desc_clean} | Dist: {dist_clean} | Loc: {loc_clean} | Coords: {lat}, {lon}")
        print(f"Total temple monuments in Bangalore circle: {temple_count}")
except Exception as e:
    print("Error:", e)
