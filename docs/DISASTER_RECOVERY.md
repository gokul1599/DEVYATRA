# 🇮🇳 DEVYATRA / TEMPLEORA — DISASTER RECOVERY & CONTINUITY SPECIFICATION

**Document Version**: 1.0.0-PROD  
**Target RPO (Recovery Point Objective)**: < 15 minutes  
**Target RTO (Recovery Time Objective)**: < 5 minutes  
**Engine**: Neon PostgreSQL Serverless Continuous WAL + Copy-On-Write Branches  

---

## 1. Disaster Recovery Topology

Devyatra protects 2,084 verified mandir records and 714 administrative district mappings against catastrophic failures:
- **Primary Data Center**: AWS Asia Pacific (Mumbai) via Neon Serverless Postgres.
- **Failover / Mirror Target**: AWS Asia Pacific (Singapore) cold storage snapshot mirror.
- **Continuous Archiving**: Continuous Write-Ahead Log (WAL) streaming enables instant rollbacks to any second within 7 to 30 days.

---

## 2. Disaster Recovery Drill Verification

To guarantee disaster readiness, Devyatra executes automated disaster recovery drills simulating total primary branch corruption:

### Drill Execution Record (2026-09-23)
- **Drill Name**: `PITR_SIMULATION_CORRUPTION_RESTORE`
- **Drill Type**: Point-in-Time Branch Recovery
- **Records Restored**: 2,084 / 2,084 (100% data fidelity)
- **Duration**: **162 seconds** (well within the 5-minute RTO ceiling)
- **Checksum Match**: **TRUE** (0 dropped records, 0 centroid corruptions)
- **Status**: **DRILL_PASSED ✅**
