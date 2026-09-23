# 🇮🇳 DEVYATRA / TEMPLEORA — V2 BACKUP, RESTORATION & DISASTER RECOVERY PLAN

**System Target**: Neon Serverless PostgreSQL Database  
**Baseline Dataset**: 2,084 Verified Mandir Records, 714 LGD Districts, 36 States/UTs, 0 Centroids  
**Target RPO (Recovery Point Objective)**: < 15 minutes  
**Target RTO (Recovery Time Objective)**: < 5 minutes  
**Compliance Standard**: Zero Data Loss Guarantee & Immutable Audit Trail  

---

## 1. Multi-Tier Backup Architecture

Devyatra employs a defense-in-depth backup topology combining continuous Write-Ahead Log (WAL) archiving, point-in-time branch creation, and external off-site cold storage.

```
                    ┌───────────────────────────────────────────────┐
                    │          Neon Primary Production Branch       │
                    │      (2,084 Verified Shrines / 714 Districts) │
                    └───────────────────────┬───────────────────────┘
                                            │
                     ┌──────────────────────┴───────────────────────┐
                     ▼                                              ▼
       ┌───────────────────────────┐                  ┌───────────────────────────┐
       │   Tier 1: Hot WAL Stream  │                  │   Tier 2: Nightly Exports │
       │ - Continuous Write-Ahead  │                  │ - Compressed JSON & SQL   │
       │   Log Streaming           │                  │ - Stored in scripts/data/ │
       │ - Neon Instant PITR       │                  │ - Checksum verified       │
       │ - Restore Time: < 3 mins  │                  │ - Restore Time: < 5 mins  │
       └─────────────┬─────────────┘                  └─────────────┬─────────────┘
                     │                                              │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  Tier 3: Offsite Cold S3  │
                              │ - AWS S3 Glacier (Mumbai) │
                              │ - AES-256 Encrypted       │
                              │ - WORM (Write Once Read)  │
                              │ - 90-Day Retention Policy │
                              └───────────────────────────┘
```

---

## 2. Backup Tiers & Retention Schedules

### 2.1 Tier 1: Continuous Point-In-Time Recovery (PITR)
- **Engine**: Managed Neon Serverless PostgreSQL continuous log streaming.
- **Granularity**: Any second within the last 7 days (extended to 30 days during festival seasons).
- **Capability**: Allows restoring the database to the exact millisecond before an unintended schema migration, accidental truncation, or corrupt data patch.

### 2.2 Tier 2: Deterministic Snapshot Registry (`scripts/db_snapshot.ts`)
- **Format**: Structured JSON snapshot containing all 2,084 temples, full relational metadata, geo-coordinates, and source citations.
- **Frequency**: Triggered automatically prior to and immediately following every data ingestion or schema migration batch.
- **Integrity Guarantee**: Each snapshot generates a SHA-256 cryptographic checksum matching catalog size, verified count, and district coverage.

### 2.3 Tier 3: Offsite Encrypted Cold Storage
- **Format**: `pg_dump` compressed binary archive (`.dump.gz`).
- **Location**: AWS S3 Bucket in Mumbai (`ap-south-1`) with cross-region replication to Singapore (`ap-southeast-1`).
- **Encryption**: Server-Side Encryption with Customer-Provided Keys (SSE-KMS / AES-256).

---

## 3. Instant Disaster Recovery (RTO < 5 Mins)

Thanks to Neon's copy-on-write architecture, restoring a database does not require lengthy multi-gigabyte disk writes.

### Rapid Restoration Procedure:
```bash
# Step 1: Create a point-in-time restoration branch from CLI or Neon API
neonctl branches create \
  --project-id <project-id> \
  --parent-id main \
  --name recovery-branch-$(date +%s) \
  --timestamp "2026-09-23T10:00:00Z"

# Step 2: Validate data integrity on the restored branch
DATABASE_URL="postgres://...@recovery-branch/devyatra" npx tsx scripts/verify_pipeline.ts

# Step 3: Promote restored branch to main in Neon or update Vercel DATABASE_URL
vercel env add DATABASE_URL "postgres://...@recovery-branch/devyatra" production --force
vercel redeploy
```

---

## 4. Integrity Verification & Quality Gate Checklist

Before any restored database is declared healthy for production traffic, it must satisfy the 5 Devyatra Invariant Gates:

| Gate | Acceptance Criteria | Verification Command |
|:---|:---|:---|
| **1. Total Temple Count** | Must equal or exceed baseline (≥ 2,084) | `npx tsx scripts/verify_pipeline.ts` |
| **2. National District Depth** | Exactly 714 administrative districts | `npx tsx scripts/verify_phase20.ts` |
| **3. Zero Centroids** | Exactly 0 centroid coordinates | `npx tsx scripts/verify_phase6.ts` |
| **4. Pan-India Breadth** | Exactly 36 / 36 States & UTs | `npx tsx scripts/verify_phase8.ts` |
| **5. Statutory Trust URLs** | 100% of major shrines link to verified URLs | `npx tsx scripts/verify_phase15.ts` |

---

## 5. Annual Disaster Recovery Simulation Drills

1. **Schedule**: Drills are conducted biannually in January (pre-Mahashivratri) and July (pre-Navratri).
2. **Simulation**: The engineering team triggers a simulated corrupt write on a staging branch and measures:
   - Time to detect corruption (< 2 minutes via automated assertion scripts).
   - Time to restore via PITR branch (< 4 minutes).
   - Verification suite run time (< 45 seconds).
   - Total MTTR (Mean Time to Recovery): **< 7 minutes**.
