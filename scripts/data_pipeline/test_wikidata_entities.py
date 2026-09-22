import urllib.request
import urllib.parse
import json

HEADERS = {"User-Agent": "IndiaTempleAtlas/1.0 (dev@templeora.org)"}
api_url = "https://www.wikidata.org/w/api.php"
params = {
    "action": "wbgetentities",
    "format": "json",
    "ids": "Q3437182|Q61730242|Q1424358",
    "props": "claims|labels",
    "languages": "en|ta|te|hi"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    entities = data.get('entities', {})
    for qid, ent in entities.items():
        labels = ent.get('labels', {})
        en_name = labels.get('en', {}).get('value')
        ta_name = labels.get('ta', {}).get('value')
        p625 = ent.get('claims', {}).get('P625', [])
        lat, lon = None, None
        if p625:
            val = p625[0].get('mainsnak', {}).get('datavalue', {}).get('value', {})
            lat, lon = val.get('latitude'), val.get('longitude')
        print(f"QID: {qid} | EN: {en_name} | TA: {ta_name} | Coords: {lat}, {lon}")
