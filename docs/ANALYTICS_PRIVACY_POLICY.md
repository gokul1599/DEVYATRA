# 🇮🇳 DEVYATRA / TEMPLEORA — ANALYTICS PRIVACY & DATA ETHICS POLICY

**Document Version**: 1.0.0-PROD  
**Domain**: Privacy-Preserving Product Analytics & Zero-PII Tracking  
**System Component**: `src/lib/analytics/engine.ts`  

---

## 1. Ethical Pilgrimage Analytics Manifesto

Devyatra is a cultural and spiritual public utility. We measure aggregated usage to improve discovery and routing across ancient temples **without creating intrusive user behavioral profiles or selling pilgrim data**.

### Core Privacy Guarantees
1. **Zero Personally Identifiable Information (Zero PII)**:
   - No names, email addresses, phone numbers, or physical GPS traces are written to analytics streams.
2. **Ephemeral Anonymous Sessions**:
   - Sessions are identified via cryptographically salted hashes that rotate daily. There are no persistent cross-site tracking cookies.
3. **Minimal Telemetry Payload**:
   - Only operational events are recorded (e.g. `temple_view`, `search`, `start_planner`, `booking_click`). Raw sensitive user inputs are stripped before aggregation.
4. **Third-Party Tracker Elimination**:
   - No commercial surveillance ad pixels (Facebook Pixel, Google Remarketing, TikTok tags) exist in Devyatra.

---

## 2. Event Taxonomy

```typescript
export type AnalyticsEventType =
  | "search"            // User performed a shrine/deity search
  | "temple_view"       // Viewed a verified temple detail page
  | "map_open"          // Opened interactive sacred map explorer
  | "state_view"        // Explored regional state directory
  | "district_view"     // Explored administrative district catalog
  | "save_temple"       // Added shrine to personal offline bookmarks
  | "start_planner"     // Initiated multi-step pilgrimage studio
  | "generate_plan"     // Successfully synthesized grounded itinerary
  | "save_journey"      // Saved itinerary to pilgrim companion
  | "share_journey"     // Generated public share link
  | "booking_click"     // Clicked official devasthanam booking portal
  | "route_click"       // Clicked external navigation directions
  | "language_change"   // Toggled UI to one of 12 Indic languages
  | "report_issue";     // Submitted feedback/correction report
```

---

## 3. Data Retention & Aggregation

1. Raw event logs in operational buffers are retained for a rolling 30-day window.
2. Historical metrics are retained strictly as anonymized daily counter rollups (e.g. *Daily Searches: 14,200*, *Daily Plan Starts: 3,100*).
