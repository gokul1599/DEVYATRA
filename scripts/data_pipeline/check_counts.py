import urllib.request
import urllib.parse
import json

HEADERS = {"User-Agent": "IndiaTempleAtlas/1.0 (dev@templeora.org)"}
api_url = "https://en.wikipedia.org/w/api.php"

categories = [
    "Category:Hindu temples in Andhra Pradesh",
    "Category:Hindu temples in Telangana",
    "Category:Hindu temples in Tamil Nadu",
    "Category:Hindu temples in Karnataka",
    "Category:Hindu temples in Kerala",
    "Category:Hindu temples in Maharashtra",
    "Category:Hindu temples in Gujarat",
    "Category:Hindu temples in Goa",
    "Category:Hindu temples in Odisha",
    "Category:Hindu temples in West Bengal",
    "Category:Hindu temples in Bihar",
    "Category:Hindu temples in Jharkhand",
    "Category:Hindu temples in Uttar Pradesh",
    "Category:Hindu temples in Uttarakhand",
    "Category:Hindu temples in Himachal Pradesh",
    "Category:Hindu temples in Punjab, India",
    "Category:Hindu temples in Haryana",
    "Category:Hindu temples in Delhi",
    "Category:Hindu temples in Jammu and Kashmir",
    "Category:Hindu temples in Rajasthan",
    "Category:Hindu temples in Madhya Pradesh",
    "Category:Hindu temples in Chhattisgarh",
    "Category:Hindu temples in Assam",
    "Category:Hindu temples in Tripura"
]

params = {
    "action": "query",
    "format": "json",
    "titles": "|".join(categories[:10]),
    "prop": "categoryinfo"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    pages = data.get('query', {}).get('pages', {})
    for pid, p in pages.items():
        title = p.get('title')
        cinfo = p.get('categoryinfo', {})
        print(f"{title}: {cinfo.get('pages', 0)} pages, {cinfo.get('subcats', 0)} subcats")
