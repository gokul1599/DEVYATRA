import { Temple } from "./types";

export interface LangMeta {
  code: string;
  native: string;
  name: string;
  flag: string;
}

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇬🇧", hi: "🇮🇳", te: "🟠", ta: "🐅", kn: "🪷", ml: "🌴", mr: "🌊", bn: "🐚", gu: "🦁", or: "🏯", pa: "🦅", as: "☄️",
};

export const SUPPORTED_LANGUAGES: LangMeta[] = [
  { code: "en", native: "English", name: "English", flag: "🇬🇧" },
  { code: "hi", native: "हिन्दी", name: "Hindi", flag: "🇮🇳" },
  { code: "te", native: "తెలుగు", name: "Telugu", flag: "🇮🇳" },
  { code: "ta", native: "தமிழ்", name: "Tamil", flag: "🇮🇳" },
  { code: "kn", native: "ಕನ್ನಡ", name: "Kannada", flag: "🇮🇳" },
  { code: "ml", native: "മലയാളം", name: "Malayalam", flag: "🇮🇳" },
  { code: "mr", native: "मराठी", name: "Marathi", flag: "🇮🇳" },
  { code: "bn", native: "বাংলা", name: "Bengali", flag: "🇮🇳" },
  { code: "gu", native: "ગુજરાતી", name: "Gujarati", flag: "🇮🇳" },
  { code: "or", native: "ଓଡ଼ିଆ", name: "Odia", flag: "🇮🇳" },
  { code: "pa", native: "ਪੰਜਾਬੀ", name: "Punjabi", flag: "🇮🇳" },
  { code: "as", native: "অসমীয়া", name: "Assamese", flag: "🇮🇳" },
];

const EN_LABELS = {
  brand: "Devyatra",
  tagline: "Discover. Experience. Remember.",
  nav_home: "Home",
  nav_explore: "Explore India",
  nav_temples: "Temples",
  nav_map: "Map",
  nav_ai: "AI Journey",
  nav_saved: "My Journey",
  nav_festivals: "Festivals",
  nav_search: "Search",
  nav_admin: "Admin",
  hero_head: "Discover India's Temples",
  hero_sub: "Explore sacred places, uncover their stories, plan your journey, and discover everything around you — powered by AI.",
  hero_cta1: "Explore Temples",
  hero_cta2: "Plan My Visit",
  hero_cta3: "Explore Near Me",
  search_placeholder: "Search temples, cities, districts, deities or places…",
  search_btn: "Search",
  section_search: "Find your temple",
  section_near: "Explore Near Me",
  section_near_sub: "Temples, food, stays and essentials around you.",
  section_india: "Explore India",
  section_india_sub: "Journey from state to district to temple.",
  section_categories: "Popular categories",
  section_famous: "Famous & historic temples",
  section_plan: "Plan My Visit",
  section_plan_sub: "Let AI build your pilgrimage day, around your temple and your time.",
  section_festivals: "Temple festivals",
  section_nearby_exp: "Nearby experiences",
  section_assistant: "Your AI companion",
  section_assistant_sub: "Ask anything about a temple — before you go.",
  section_trust: "Verified information. Smarter journeys.",
  section_trust_sub: "Every timing, price and claim carries its source and verification status.",
  cta_book: "Book on official website",
  cta_offline: "Offline counter",
  cta_free: "Free entry",
  status_open: "Open now",
  status_closed: "Closed now",
  status_special_day: "Special schedule today",
  last_verified: "Last verified",
  not_verified: "Timing could not be verified. Check the official temple source before visiting.",
  booking_unavailable: "Booking information isn't currently verified.",
  booking_unavailable_sub: "Check the official temple source before visiting.",
  no_temples_yet: "No temples found here yet.",
  no_temples_sub: "We're continuously expanding the directory.",
  ai_thinking_1: "Understanding your journey…",
  ai_thinking_2: "Checking temple schedule…",
  ai_thinking_3: "Exploring nearby places…",
  ai_thinking_4: "Building your itinerary…",
  ai_done: "Your journey is ready.",
  ai_not_verified: "I couldn't verify that information.",
  ai_header: "Ask AI about this temple",
  ai_plan_day: "Your personalized day",
  ai_plan_cta: "Generate my plan",
  ai_routes_cta: "Create pilgrimage route",
  follow: "Follow temple",
  following: "Following",
  save: "Save",
  saved: "Saved",
  km_away: "away",
  pry: "priest",
  verified: "Verified",
  unverified: "Unverified",
  member_since: "Member",
  footer_about: "About",
  footer_sources: "Sources",
  footer_contact: "Contact",
  footer_privacy: "Privacy",
  footer_terms: "Terms",
  footer_report: "Report incorrect information",
  footer_rights: "Verified temple information, intelligently explored.",
  report_missing: "Report missing temple",
  admin_dash: "Admin dashboard",
  admin_temples: "Temples",
  admin_reports: "Community reports",
  new_temple: "Devyatra",
  discover_live: "Live discovery",
  discover_verified: "Verified on Devyatra",
  discover_cache: "From cache",
  discover_degraded: "Live discovery unavailable",
  discover_note: "Showing temples discovered via live place data and verified temple information. Live discovery does not claim to list every temple.",
  discover_stale: "Showing cached results; live discovery is temporarily unavailable.",
  discover_certain_likely: "Likely a temple",
  discover_certain_religious: "Religious site",
  discover_certain_uncertain: "Could not confirm if this is a temple",
  discovered_open: "Open (per live data)",
  discovered_closed: "Closed (per live data)",
  discover_open_unknown: "Live status unavailable",
  map_title: "Temple Map",
  map_subtitle: "Discover temples across India with live place data, then jump into verified profiles.",
  map_search: "Search a place",
  map_search_this_area: "Search this area",
  map_powered_by_google: "Powered by Google",
  map_open_in_maps: "Open in Google Maps",
  map_reset: "Reset to India view",
  map_err_title: "Live place discovery is temporarily unavailable.",
  map_err_sub: "Showing cached and verified results. Try again in a moment.",
  map_empty: "No temples found in this area yet. Try searching a nearby area or a place name.",
  discover_query_btn: "Discover temples",
  search_deity_filters: "Deity hints",
  ai_remaining: "remaining",
};

export type LabelKey = keyof typeof EN_LABELS;

const HI: Partial<Record<LabelKey, string>> = {
  brand: "Devyatra",
  tagline: "खोजें। अनुभव करें। याद रखें।",
  nav_home: "होम",
  nav_explore: "भारत खोजें",
  nav_temples: "मंदिर",
  nav_map: "आस-पास",
  nav_ai: "AI यात्रा",
  nav_saved: "मेरी यात्रा",
  nav_festivals: "त्योहार",
  nav_search: "खोज",
  hero_head: "भारत के मंदिर खोजें",
  hero_sub: "पवित्र स्थल देखें, उनकी कहानियाँ जानें, अपनी यात्रा की योजना बनाएँ — AI की मदद से।",
  hero_cta1: "मंदिर खोजें",
  hero_cta2: "यात्रा की योजना बनाएँ",
  hero_cta3: "मेरे आस-पास खोजें",
  search_placeholder: "मंदिर, शहर, ज़िले, देवता या स्थान खोजें…",
  section_near: "मेरे आस-पास खोजें",
  section_india: "भारत खोजें",
  section_categories: "लोकप्रिय श्रेणियाँ",
  section_famous: "प्रसिद्ध व ऐतिहासिक मंदिर",
  section_plan: "यात्रा की योजना बनाएँ",
  section_festivals: "मंदिर त्योहार",
  section_assistant: "आपका AI साथी",
  status_open: "अभी खुला है",
  status_closed: "अभी बंद है",
  no_temples_yet: "यहाँ अभी कोई मंदिर नहीं मिला।",
  follow: "फ़ॉलो करें",
  save: "सहेजें",
  verified: "सत्यापित",
  discover_note: "लाइव स्थान डेटा और सत्यापित मंदिर जानकारी के आधार पर दिखाए जा रहे मंदिर। यहाँ हर मंदिर की सूची नहीं है।",
  discover_live: "लाइव खोज",
  map_title: "मंदिर मानचित्र",
  map_search_this_area: "इस क्षेत्र को खोजें",
  map_powered_by_google: "Google द्वारा समर्थित",
  discovered_open: "खुला (लाइव डेटा)",
  discovered_closed: "बंद (लाइव डेटा)",
  map_err_title: "लाइव स्थान खोज अभी उपलब्ध नहीं है।",
};

const TE: Partial<Record<LabelKey, string>> = {
  brand: "Devyatra",
  tagline: "కనుగొనండి. అనుభవించండి. గుర్తుంచుకోండి.",
  nav_home: "హోమ్",
  nav_explore: "భారతదేశం",
  nav_temples: "దేవాలయాలు",
  nav_map: "సమీపంలో",
  nav_ai: "AI ప్రయాణం",
  nav_saved: "నా ప్రయాణం",
  nav_festivals: "ఉత్సవాలు",
  hero_head: "భారతదేశ దేవాలయాలను కనుగొనండి",
  hero_sub: "పవిత్ర స్థలాలను చూడండి, కథలు తెలుసుకోండి, ప్రయాణం ప్లాన్ చేసుకోండి — AI తో.",
  hero_cta1: "దేవాలయాలు చూడండి",
  hero_cta2: "యాత్ర ప్లాన్ చేయండి",
  hero_cta3: "నా దగ్గర్లో",
  search_placeholder: "దేవాలయాలు, నగరాలు, జిల్లాలు, దేవతలు లేదా ప్రదేశాలను వెతకండి…",
  section_near: "నా దగ్గర్లో",
  section_india: "భారతదేశాన్ని అన్వేషించండి",
  section_categories: "ప్రముఖ వర్గాలు",
  section_famous: "ప్రసిద్ధ దేవాలయాలు",
  section_plan: "యాత్ర ప్లాన్ చేయండి",
  section_festivals: "ఆలయ ఉత్సవాలు",
  status_open: "ఇప్పుడు తెరిచి ఉంది",
  status_closed: "ఇప్పుడు మూసి ఉంది",
  no_temples_yet: "ఇక్కడ ఇంకా దేవాలయాలు లేవు.",
  follow: "ఫాలో చేయండి",
  save: "సేవ్ చేయండి",
  verified: "ధృవీకరించబడింది",
};

const TA: Partial<Record<LabelKey, string>> = {
  brand: "Devyatra",
  tagline: "கண்டறி. அனுபவி. நினைவுகூர்.",
  nav_home: "முகப்பு",
  nav_explore: "இந்தியாவை ஆராய்",
  nav_temples: "கோயில்கள்",
  nav_map: "அருகில்",
  nav_ai: "AI பயணம்",
  nav_saved: "என் பயணம்",
  nav_festivals: "திருவிழாக்கள்",
  hero_head: "இந்தியாவின் கோயில்களைக் கண்டறியுங்கள்",
  hero_sub: "புனித இடங்களை ஆராய்ந்து, கதைகளை அறிந்து, உங்கள் பயணத்தைத் திட்டமிடுங்கள் — AI உதவியுடன்.",
  hero_cta1: "கோயில்களை ஆராய்",
  hero_cta2: "பயணம் திட்டமிடு",
  hero_cta3: "என் அருகில்",
  search_placeholder: "கோயில்கள், நகரங்கள், மாவட்டங்கள், தெய்வங்கள் அல்லது இடங்களைத் தேடுங்கள்…",
  section_near: "அருகில் உள்ளவை",
  section_india: "இந்தியாவை ஆராயுங்கள்",
  section_categories: "பிரபலமான பிரிவுகள்",
  section_famous: "புகழ்பெற்ற கோயில்கள்",
  section_plan: "பயணத்தைத் திட்டமிடு",
  section_festivals: "கோயில் திருவிழாக்கள்",
  status_open: "இப்போது திறந்துள்ளது",
  status_closed: "இப்போது மூடப்பட்டுள்ளது",
  no_temples_yet: "இங்கு இன்னும் கோயில்கள் இல்லை.",
  follow: "பின்தொடர்",
  save: "சேமி",
  verified: "சரிபார்க்கப்பட்டது",
};

/** Additional packs can be added here per language (keys fall back to English). */
const KN: Partial<Record<LabelKey, string>> = {
  hero_head: "ಭಾರತದ ದೇವಾಲಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
  hero_cta1: "ದೇವಾಲಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
  nav_temples: "ದೇವಾಲಯಗಳು",
  section_famous: "ಪ್ರಸಿದ್ಧ ದೇವಾಲಯಗಳು",
  status_open: "ಈಗ ತೆರೆದಿದೆ",
};

const ML: Partial<Record<LabelKey, string>> = {
  hero_head: "ഇന്ത്യയിലെ ക്ഷേത്രങ്ങൾ കണ്ടെത്തൂ",
  hero_cta1: "ക്ഷേത്രങ്ങൾ പര്യവേക്ഷണം ചെയ്യൂ",
  nav_temples: "ക്ഷേത്രങ്ങൾ",
  status_open: "ഇപ്പോൾ തുറന്നിരിക്കുന്നു",
};

const MR: Partial<Record<LabelKey, string>> = {
  hero_head: "भारतातील मंदिरे शोधा",
  hero_cta1: "मंदिरे शोधा",
  nav_temples: "मंदिरे",
  status_open: "आत्ता खुले आहे",
};

const BN: Partial<Record<LabelKey, string>> = {
  hero_head: "ভারতের মন্দির আবিষ্কার করুন",
  hero_cta1: "মন্দির দেখুন",
  nav_temples: "মন্দির",
  status_open: "এখন খোলা",
};

const GU: Partial<Record<LabelKey, string>> = {
  hero_head: "ભારતના મંદિરો શોધો",
  hero_cta1: "મંદિરો જુઓ",
  nav_temples: "મંદિરો",
  status_open: "હવે ખુલ્લું",
};

const OR: Partial<Record<LabelKey, string>> = {
  hero_head: "ଭାରତର ମନ୍ଦିର ଆବିଷ୍କାର କରନ୍ତୁ",
  hero_cta1: "ମନ୍ଦିର ଦେଖନ୍ତୁ",
  nav_temples: "ମନ୍ଦିର",
  status_open: "ଏବେ ଖୋଲା",
};

const PA: Partial<Record<LabelKey, string>> = {
  hero_head: "ਭਾਰਤ ਦੇ ਮੰਦਰ ਖੋਜੋ",
  hero_cta1: "ਮੰਦਰ ਦੇਖੋ",
  nav_temples: "ਮੰਦਰ",
  status_open: "ਹੁਣ ਖੁੱਲ੍ਹਾ",
};

const AS: Partial<Record<LabelKey, string>> = {
  hero_head: "ভাৰতৰ মন্দিৰ আৱিষ্কাৰ কৰক",
  hero_cta1: "মন্দিৰ চাওক",
  nav_temples: "মন্দিৰ",
  status_open: "এতিয়া খোলা",
};

export const LABEL_PACKS: Record<string, Partial<Record<LabelKey, string>>> = {
  en: EN_LABELS,
  hi: HI,
  te: TE,
  ta: TA,
  kn: KN,
  ml: ML,
  mr: MR,
  bn: BN,
  gu: GU,
  or: OR,
  pa: PA,
  as: AS,
};

export const translate = (lang: string, key: LabelKey): string =>
  LABEL_PACKS[lang]?.[key] ?? EN_LABELS[key];

export const LANG_COOKIE = "tem_lang";

export const detectLang = (headers: { get(name: string): string | null }): string => {
  const c = headers.get("cookie");
  if (c) {
    const m = c.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
    if (m && SUPPORTED_LANGUAGES.some((l) => l.code === m[1])) return m[1];
  }
  return "en";
};

/** AI response language — the engine speaks the selected language pack. */
export const aiVoice = (lang: string) =>
  ({
    intro: translate(lang, "ai_thinking_1"),
    schedule: translate(lang, "ai_thinking_2"),
    nearby: translate(lang, "ai_thinking_3"),
    building: translate(lang, "ai_thinking_4"),
    done: translate(lang, "ai_done"),
    unverified: translate(lang, "ai_not_verified"),
  }) as const;

export const templeLocalName = (t: Temple) => t.nameLocal ?? t.name;