/**
 * DEVYATRA / TEMPLEORA — V2.3 INTENT RESOLUTION ENGINE
 * 
 * Extracts structured pilgrimage intents from natural language queries
 * (e.g., "Shiva temples for 2 days near Varanasi", "temples for seniors in Tamil Nadu")
 * and provides direct 1-click Route Lab and filtering shortcuts.
 */

export interface PilgrimageIntent {
  rawQuery: string;
  hasIntent: boolean;
  deity?: string;
  circuit?: string;
  days?: 1 | 2 | 3 | 5 | 7;
  persona?: "senior" | "family" | "heritage" | "peaceful" | "budget" | "coastal";
  regionOrState?: string;
  suggestedActionLabel?: string;
  planStudioHref?: string;
  explanation?: string;
}

const DEITY_MAP: Record<string, string> = {
  shiva: "Shiva",
  mahadev: "Shiva",
  shankar: "Shiva",
  vishnu: "Vishnu",
  narayana: "Vishnu",
  krishna: "Krishna",
  ram: "Rama",
  rama: "Rama",
  devi: "Devi / Shakti",
  shakti: "Devi / Shakti",
  durga: "Devi / Shakti",
  ambaji: "Devi / Shakti",
  ganesh: "Ganesha",
  ganapati: "Ganesha",
  vinayaka: "Ganesha",
  murugan: "Murugan / Kartikeya",
  subrahmanya: "Murugan / Kartikeya",
  kartikeya: "Murugan / Kartikeya",
  hanuman: "Hanuman",
  maruti: "Hanuman",
};

const CIRCUIT_MAP: Record<string, { name: string; slug: string }> = {
  jyotirlinga: { name: "12 Jyotirlinga Darshan", slug: "jyotirlinga-western" },
  "char dham": { name: "Char Dham Yatra", slug: "char-dham-himalaya" },
  chardham: { name: "Char Dham Yatra", slug: "char-dham-himalaya" },
  "pancha bhoota": { name: "Pancha Bhoota Sthalams", slug: "pancha-bhoota-sthalams" },
  "panchabhoota": { name: "Pancha Bhoota Sthalams", slug: "pancha-bhoota-sthalams" },
  "divya desam": { name: "Divya Desam Circuit", slug: "divya-desams-tamil" },
  "shakti peeth": { name: "Shakti Peetha Yatra", slug: "shakti-peeth-circuit" },
};

const REGION_MAP: Record<string, string> = {
  tamilnadu: "Tamil Nadu",
  "tamil nadu": "Tamil Nadu",
  kerala: "Kerala",
  karnataka: "Karnataka",
  andhra: "Andhra Pradesh",
  "andhra pradesh": "Andhra Pradesh",
  telangana: "Telangana",
  maharashtra: "Maharashtra",
  gujarat: "Gujarat",
  rajasthan: "Rajasthan",
  uttarakhand: "Uttarakhand",
  "uttar pradesh": "Uttar Pradesh",
  varanasi: "Varanasi / Kashi",
  kashi: "Varanasi / Kashi",
  ayodhya: "Ayodhya",
  tirupati: "Tirupati",
  puri: "Puri",
  ujjain: "Ujjain",
  rishi: "Rishikesh / Haridwar",
  haridwar: "Haridwar",
};

export function resolvePilgrimageIntent(query: string): PilgrimageIntent {
  const q = query.toLowerCase().trim();
  if (!q) {
    return { rawQuery: query, hasIntent: false };
  }

  let deity: string | undefined;
  for (const [key, val] of Object.entries(DEITY_MAP)) {
    if (new RegExp(`\\b${key}\\b`, "i").test(q)) {
      deity = val;
      break;
    }
  }

  let circuit: string | undefined;
  let circuitSlug: string | undefined;
  for (const [key, c] of Object.entries(CIRCUIT_MAP)) {
    if (q.includes(key)) {
      circuit = c.name;
      circuitSlug = c.slug;
      break;
    }
  }

  let days: 1 | 2 | 3 | 5 | 7 | undefined;
  if (/\b(1|one)\s*(day|days)\b/i.test(q)) days = 1;
  else if (/\b(2|two)\s*(day|days)\b/i.test(q)) days = 2;
  else if (/\b(3|three)\s*(day|days)\b/i.test(q)) days = 3;
  else if (/\b(5|five)\s*(day|days)\b/i.test(q)) days = 5;
  else if (/\b(7|seven|week)\s*(day|days)?\b/i.test(q)) days = 7;

  let persona: PilgrimageIntent["persona"];
  if (/\b(senior|elder|elderly|parents|wheelchair|accessible)\b/i.test(q)) {
    persona = "senior";
  } else if (/\b(family|kids|children)\b/i.test(q)) {
    persona = "family";
  } else if (/\b(budget|free|cheap|affordable)\b/i.test(q)) {
    persona = "budget";
  } else if (/\b(peace|quiet|calm|meditat)\b/i.test(q)) {
    persona = "peaceful";
  } else if (/\b(heritage|ancient|history|chola|pallava|architecture)\b/i.test(q)) {
    persona = "heritage";
  } else if (/\b(coast|beach|sea)\b/i.test(q)) {
    persona = "coastal";
  }

  let regionOrState: string | undefined;
  for (const [key, reg] of Object.entries(REGION_MAP)) {
    if (q.includes(key)) {
      regionOrState = reg;
      break;
    }
  }

  const hasIntent = !!(deity || circuit || days || persona || regionOrState);
  if (!hasIntent) {
    return { rawQuery: query, hasIntent: false };
  }

  // Construct Route Lab planning link
  const params = new URLSearchParams();
  if (days) params.set("days", String(days));
  if (deity) params.set("deity", deity);
  if (persona) params.set("persona", persona);
  if (circuitSlug) params.set("circuit", circuitSlug);
  if (regionOrState) params.set("region", regionOrState);
  params.set("query", query);

  const planStudioHref = `/plan?${params.toString()}`;

  const parts: string[] = [];
  if (deity) parts.push(`dedicated to ${deity}`);
  if (circuit) parts.push(`along the ${circuit}`);
  if (regionOrState) parts.push(`in ${regionOrState}`);
  if (days) parts.push(`for ${days} Day${days > 1 ? "s" : ""}`);
  if (persona) parts.push(`optimized for ${persona} pilgrims`);

  const explanation = `Detected intent: Pilgrimage yatra ${parts.join(" ")}.`;
  const suggestedActionLabel = days
    ? `Launch ${days}-Day Yatra Plan`
    : `Design Pilgrimage Route with AI`;

  return {
    rawQuery: query,
    hasIntent: true,
    deity,
    circuit,
    days,
    persona,
    regionOrState,
    explanation,
    suggestedActionLabel,
    planStudioHref,
  };
}
