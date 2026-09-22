import urllib.request
import urllib.parse
import json

HEADERS = {"User-Agent": "IndiaTempleAtlas/3.0 (dev@templeora.org)"}
api_url = "https://en.wikipedia.org/w/api.php"

# Test fetching monuments of national importance
params = {
    "action": "query",
    "format": "json",
    "list": "categorymembers",
    "cmtitle": "Category:Monuments of National Importance in Karnataka",
    "cmlimit": "50"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        members = data.get('query', {}).get('categorymembers', [])
        print(f"Total ASI members in Karnataka category: {len(members)}")
        temple_members = [m for m in members if any(k in m['title'].lower() for k in ['temple', 'gudi', 'shrine', 'basadi'])]
        print(f"Temple monuments: {len(temple_members)}")
        for tm in temple_members[:10]:
            print(f"  - {tm['title']}")
except Exception as e:
    print("Error:", e)
