import urllib.request
import urllib.parse
import json

HEADERS = {'User-Agent': 'IndiaTempleAtlas/3.0 (dev@templeora.org)'}
titles = [
    'List of Monuments of National Importance in Karnataka',
    'List of Monuments of National Importance in Madhya Pradesh',
    'List of Monuments of National Importance in Rajasthan',
    'List of Monuments of National Importance in Uttar Pradesh',
    'List of Monuments of National Importance in Odisha',
    'List of Monuments of National Importance in West Bengal',
    'List of Monuments of National Importance in Bihar',
    'List of Monuments of National Importance in Uttarakhand',
    'List of Monuments of National Importance in Himachal Pradesh'
]
params = {'action': 'query', 'format': 'json', 'titles': '|'.join(titles)}
url = f'https://en.wikipedia.org/w/api.php?{urllib.parse.urlencode(params)}'
req = urllib.request.Request(url, headers=HEADERS)
data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
for pid, p in data['query']['pages'].items():
    print(f"  - [{pid}] {p.get('title')}")
