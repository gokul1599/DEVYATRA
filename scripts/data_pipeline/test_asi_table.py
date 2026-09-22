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
        # Search for monument templates
        monuments = re.findall(r'\{\{Monument row(.*?)\}\}', wikitext, re.DOTALL)
        print(f"Total ASI monuments found: {len(monuments)}")
        temple_count = 0
        for m in monuments[:15]:
            name_m = re.search(r'\|\s*name\s*=\s*(.*?)\n', m)
            loc_m = re.search(r'\|\s*location\s*=\s*(.*?)\n', m)
            dist_m = re.search(r'\|\s*district\s*=\s*(.*?)\n', m)
            lat_m = re.search(r'\|\s*lat\s*=\s*(.*?)\n', m)
            lon_m = re.search(r'\|\s*lon\s*=\s*(.*?)\n', m)
            asi_id_m = re.search(r'\|\s*id\s*=\s*(.*?)\n', m)
            name = name_m.group(1).strip() if name_m else "Unknown"
            if any(k in name.lower() for k in ['temple', 'gudi', 'shrine', 'basadi', 'devasthanam', 'varadaraja', 'narasimha', 'someshwara', 'rameshwara', 'keshava']):
                temple_count += 1
                print(f"  * ASI ID: {asi_id_m.group(1).strip() if asi_id_m else 'N/A'} | {name} | Loc: {loc_m.group(1).strip() if loc_m else ''} | Dist: {dist_m.group(1).strip() if dist_m else ''} | Coords: {lat_m.group(1).strip() if lat_m else ''}, {lon_m.group(1).strip() if lon_m else ''}")
        print(f"Total sample temple monuments: {temple_count}")
except Exception as e:
    print("Error:", e)
