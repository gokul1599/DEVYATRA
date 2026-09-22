import urllib.request
import urllib.parse
import json

HEADERS = {"User-Agent": "IndiaTempleAtlas/3.0 (dev@templeora.org)"}
api_url = "https://en.wikipedia.org/w/api.php"

asi_circles = [
    ("Bangalore", "Karnataka", "KA", "Taluk", "List of Monuments of National Importance in Bangalore circle"),
    ("Dharwad", "Karnataka", "KA", "Taluk", "List of Monuments of National Importance in Dharwad circle"),
    ("Chennai", "Tamil Nadu", "TN", "Taluk", "List of Monuments of National Importance in Chennai circle"),
    ("Thrissur", "Kerala", "KL", "Taluk", "List of Monuments of National Importance in Thrissur circle"),
    ("Hyderabad", "Telangana", "TS", "Mandal", "List of Monuments of National Importance in Telangana"),
    ("Amaravati", "Andhra Pradesh", "AP", "Mandal", "List of Monuments of National Importance in Andhra Pradesh"),
    ("Mumbai", "Maharashtra", "MH", "Taluka", "List of Monuments of National Importance in Mumbai circle"),
    ("Aurangabad", "Maharashtra", "MH", "Taluka", "List of Monuments of National Importance in Aurangabad circle"),
    ("Nagpur", "Maharashtra", "MH", "Taluka", "List of Monuments of National Importance in Nagpur circle"),
    ("Vadodara", "Gujarat", "GJ", "Taluka", "List of Monuments of National Importance in Gujarat"),
    ("Bhopal", "Madhya Pradesh", "MP", "Tehsil", "List of Monuments of National Importance in Bhopal circle"),
    ("Jabalpur", "Madhya Pradesh", "MP", "Tehsil", "List of Monuments of National Importance in Jabalpur circle"),
    ("Jaipur", "Rajasthan", "RJ", "Tehsil", "List of Monuments of National Importance in Jaipur circle"),
    ("Jodhpur", "Rajasthan", "RJ", "Tehsil", "List of Monuments of National Importance in Jodhpur circle"),
    ("Agra", "Uttar Pradesh", "UP", "Tehsil", "List of Monuments of National Importance in Agra circle"),
    ("Lucknow", "Uttar Pradesh", "UP", "Tehsil", "List of Monuments of National Importance in Lucknow circle"),
    ("Sarnath", "Uttar Pradesh", "UP", "Tehsil", "List of Monuments of National Importance in Sarnath circle"),
    ("Dehradun", "Uttarakhand", "UK", "Tehsil", "List of Monuments of National Importance in Uttarakhand"),
    ("Shimla", "Himachal Pradesh", "HP", "Tehsil", "List of Monuments of National Importance in Himachal Pradesh"),
    ("Srinagar", "Jammu and Kashmir", "JK", "Tehsil", "List of Monuments of National Importance in Jammu and Kashmir"),
    ("Delhi", "Delhi", "DL", "Tehsil", "List of Monuments of National Importance in Delhi"),
    ("Bhubaneswar", "Odisha", "OD", "Tehsil", "List of Monuments of National Importance in Odisha"),
    ("Kolkata", "West Bengal", "WB", "Sub-Division", "List of Monuments of National Importance in West Bengal"),
    ("Patna", "Bihar", "BR", "Sub-Division", "List of Monuments of National Importance in Bihar"),
    ("Ranchi", "Jharkhand", "JH", "Sub-Division", "List of Monuments of National Importance in Jharkhand"),
    ("Guwahati", "Assam", "AS", "Sub-Division", "List of Monuments of National Importance in Assam"),
    ("Raipur", "Chhattisgarh", "CG", "Tehsil", "List of Monuments of National Importance in Chhattisgarh"),
    ("Chandigarh", "Punjab", "PB", "Tehsil", "List of Monuments of National Importance in Punjab, India"),
    ("Haryana", "Haryana", "HR", "Tehsil", "List of Monuments of National Importance in Haryana"),
    ("Goa", "Goa", "GA", "Taluka", "List of Monuments of National Importance in Goa")
]

params = {
    "action": "query",
    "format": "json",
    "titles": "|".join([c[4] for c in asi_circles[:15]]),
    "prop": "info"
}
url = f"{api_url}?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers=HEADERS)

with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    pages = data.get('query', {}).get('pages', {})
    print("ASI circle pages status:")
    for pid, p in pages.items():
        print(f"  - [{pid}] {p.get('title')}")
