import urllib.request
import urllib.parse
import json
import time

HEADERS = {"User-Agent": "IndiaTempleAtlas/1.0 (https://templeora.org; dev@templeora.org)"}

def fetch_category_pages(cat_title, max_depth=2, current_depth=1, seen_titles=None):
    if seen_titles is None:
        seen_titles = set()
    
    pages = []
    subcats = []
    
    api_url = "https://en.wikipedia.org/w/api.php"
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
            
        url = f"{api_url}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode('utf-8'))
                members = data.get('query', {}).get('categorymembers', [])
                for m in members:
                    t = m.get('title', '')
                    ns = m.get('ns', 0)
                    if ns == 0 and t not in seen_titles:
                        seen_titles.add(t)
                        pages.append((m.get('pageid'), t))
                    elif ns == 14 and current_depth < max_depth:
                        # Exclude non-temple subcategories
                        if not any(x in t.lower() for x in ['people', 'festivals', 'films', 'stubs', 'lists', 'trusts']):
                            subcats.append(t)
                            
                cmcontinue = data.get('continue', {}).get('cmcontinue')
                if not cmcontinue:
                    break
        except Exception as e:
            print(f"Error fetching {cat_title}: {e}")
            break
        time.sleep(0.1)
        
    for sc in subcats:
        pages.extend(fetch_category_pages(sc, max_depth, current_depth + 1, seen_titles))
        
    return pages

print("Fetching temple pages for Category:Hindu temples in Andhra Pradesh...")
ap_pages = fetch_category_pages("Category:Hindu temples in Andhra Pradesh", max_depth=2)
print(f"Total unique temple articles found for AP: {len(ap_pages)}")
for pid, title in ap_pages[:10]:
    print(f"  - {pid}: {title}")
