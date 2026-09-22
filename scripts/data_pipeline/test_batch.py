import urllib.request
import urllib.parse
import json
import time

HEADERS = {"User-Agent": "IndiaTempleAtlas/1.0 (dev@templeora.org)"}
api_url = "https://en.wikipedia.org/w/api.php"

# Test batch query
titles = [
    "Meenakshi Temple",
    "Brihadisvara Temple, Thanjavur",
    "Ranganathaswamy Temple, Srirangam",
    "Ramanathaswamy Temple",
    "Shore Temple",
    "Airavatesvara Temple",
    "Annamalaiyar Temple",
    "Kapaleeshwarar Temple",
    "Ekambareswarar Temple",
    "Jambukeswarar Temple, Thiruvanaikaval"
]

params = {
    "action": "query",
    "format": "json",
    "titles": "|".join(titles),
    "prop": "coordinates|extracts|pageprops|categories",
    "exintro": "1",
    "explaintext": "1",
    "cllimit": "50"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    pages = data.get('query', {}).get('pages', {})
    print(f"Retrieved {len(pages)} temples in single request:")
    for pid, p in pages.items():
        title = p.get('title')
        coords = p.get('coordinates', [{}])[0]
        lat, lon = coords.get('lat'), coords.get('lon')
        extract = p.get('extract', '')[:100]
        wikibase_item = p.get('pageprops', {}).get('wikibase_item', '')
        print(f"  - {title:<35} | Lat/Lng: {lat}, {lon} | QID: {wikibase_item}")
