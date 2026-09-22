import urllib.request
import urllib.parse
import json

HEADERS = {"User-Agent": "IndiaTempleAtlas/1.0 (dev@templeora.org)"}
api_url = "https://en.wikipedia.org/w/api.php"
params = {
    "action": "query",
    "format": "json",
    "titles": "Bhavanarayana Temple, Sarpavaram|Kalyana Venkateswara Temple, Narayanavanam",
    "prop": "coordinates|extracts|categories",
    "exintro": "1",
    "explaintext": "1",
    "cllimit": "50"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    pages = data.get('query', {}).get('pages', {})
    for pid, p in pages.items():
        print("="*50)
        print(f"Title: {p.get('title')}")
        coords = p.get('coordinates', [{}])[0]
        print(f"Coords: {coords.get('lat')}, {coords.get('lon')}")
        print(f"Extract: {p.get('extract')[:150]}...")
        cats = [c.get('title') for c in p.get('categories', [])]
        print(f"Categories: {cats[:5]}")
