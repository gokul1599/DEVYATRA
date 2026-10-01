# TEMPLE DUPLICATE RECONCILIATION AUDIT

**Audit Date:** 2026-10-01  
**Scope:** Elimination of redundant seed duplicates, multi-district duplicates, and synthetic central district duplicates.

---

## 1. Eliminated Non-Temple POIs (46 Records)
The following non-temple records (forts, mosques, tombs, gardens, wildlife sanctuaries) were cleaned out of `prisma.temple`:
- `t-res-red-fort-old-delhi`, `t-res-red-fort-central-delhi` (Red Fort)
- `t-res-jama-masjid-old-delhi`, `t-res-jama-masjid-central-delhi` (Jama Masjid)
- `t-res-humayun-s-tomb-nizamuddin`, `t-res-humayun-s-tomb-south-east-delhi` (Humayun's Tomb)
- `t-res-pinjore-gardens-pinjore`, `t-res-pinjore-gardens-panchkula` (Pinjore Gardens)
- `t-res-shalimar-bagh-srinagar`, `t-res-nishat-bagh-srinagar`, `t-res-mughal-gardens-srinagar` (Mughal Gardens)
- `t-res-qutb-minar-mehrauli`, `t-res-qutb-minar-south-delhi` (Qutb Minar)
- `t-res-taj-mahal-agra`, `t-res-agra-fort-agra` (Taj Mahal / Agra Fort)
- `t-res-fatehpur-sikri-fatehpur-sikri`, `t-res-fatehpur-sikri-agra` (Fatehpur Sikri)
- `t-res-silent-valley-national-park-silent-valley`, `t-res-silent-valley-national-park-palakkad` (Silent Valley)
- `t-res-kaziranga-national-park-kaziranga`, `t-res-kaziranga-national-park-golaghat` (Kaziranga)
- ...and 26 additional non-temple monuments moved to `prisma.place`.

## 2. Eliminated Database Duplicate Records (27 Records)
The following duplicates were permanently deleted from `prisma.temple` in favor of the single canonical statutory record:
1. **Kedarnath:** Deleted Tehri duplicate `IN-UK-TEH-000002` in favor of Rudraprayag `IN-UK-RDP-000001`.
2. **Brahma Temple Pushkar:** Deleted Ganganagar duplicate `IN-RJ-GAN-000005` in favor of Ajmer `IN-RJ-AJM-000001`.
3. **Bhojeshwar Temple:** Deleted synthetic Central duplicate `IN-MP-CEN-000002` in favor of Raisen `IN-MP-RAI-000006`.
4. **Kukke Subramanya:** Deleted synthetic Central duplicate `IN-KA-KAR-000130` in favor of Dakshina Kannada `IN-KA-DAK-000003`.
5. **Sringeri Sharadamba:** Deleted synthetic Central duplicate `IN-KA-KAR-000142` in favor of Chikkamagaluru `IN-KA-CHI-000003`.
6. **Mayapur Chandrodaya Mandir:** Deleted synthetic Central duplicate `IN-WB-WES-000165` in favor of Nadia `IN-WB-NAD-000012`.
7. **Salasar Balaji:** Deleted synthetic Central duplicate `IN-RJ-RAJ-000170` in favor of Churu `IN-RJ-CHU-000005`.
8. **Chintpurni Devi:** Deleted Kangra duplicate `IN-HP-KAN-000010` in favor of Una statutory record `IN-HP-UNA-000001`.
9. **Kalka Mandir:** Deleted South East Delhi duplicate in favor of statutory South Delhi `cmubbq18900wiosffx3b7074r`.
10. **Alandi Dnyaneshwar:** Deleted duplicate seed record in favor of statutory Pune record `cmubbo09x00scosff9196bux0`.
...and 17 additional redundant duplicate records reconciled.

---
*Zero duplicates remain in the national database.*
