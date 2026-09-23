# 🇮🇳 DEVYATRA / TEMPLEORA — MEDIA RIGHTS & COPYRIGHT POLICY

**Document Version**: 1.0.0-PROD  
**Domain**: Visual & Audio Asset Governance, Licensing & Attribution  
**System Component**: `src/lib/trust/provenance.ts`  

---

## 1. Ethical & Legal Foundation

Devyatra respects the intellectual property rights of photographers, cultural researchers, and religious institutions. **We strictly reject the assumption that images found on search engines or social media are free to republish.**

Every visual asset (temple photograph, architectural floor plan, epigraph scan, or audio chant) must possess a verified rights ledger record (`TempleMediaRecord`).

---

## 2. Media Classification Matrix

| Classification | License Framework | Commercial Display | Attribution Mandatory |
|:---|:---|:---:|:---:|
| **OFFICIAL** | Direct permission from Temple Trust / Board | Permitted (under institutional MOU) | Yes (e.g. "Courtesy: Shri Saibaba Sansthan Trust") |
| **GOVERNMENT** | Open Government Data (OGD) / Creative Commons | Non-commercial & Informational | Yes (e.g. "Source: Archaeological Survey of India") |
| **LICENSED** | Editorial license from stock platforms | Permitted per license agreement | Per contract |
| **PUBLIC_DOMAIN** | CC0 or copyright expired (Works > 60 yrs post-mortem) | Permitted | Recommended for scholarly provenance |
| **USER_SUBMITTED** | Contributed by pilgrim under Devyatra CC BY-SA 4.0 | Permitted | Yes (Yatri Contributor Name) |
| **UNKNOWN_RIGHTS** | Unverified provenance / web crawl | **PROHIBITED FROM PUBLIC SERVING** | Blocked |

---

## 3. Mandatory Media Rights Fields

```typescript
export interface TempleMediaRecord {
  id: string;
  templeId: string;
  url: string;
  mediaType: "IMAGE" | "AUDIO_CHANT" | "FLOOR_PLAN" | "EPIGRAPH";
  source: string;
  creator?: string;
  license: string;
  copyright: string;
  attribution: string;
  commercialUse: boolean;
  usageAllowed: boolean;
  classification: MediaClassification;
  retrievedAt: string;
}
```

Any media categorized as `UNKNOWN_RIGHTS` is automatically quarantined and excluded from production image rendering pipelines.
