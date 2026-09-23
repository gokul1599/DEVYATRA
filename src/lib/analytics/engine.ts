/**
 * DEVYATRA / TEMPLEORA — PHASE 28: ANALYTICS, FEEDBACK & GROWTH ENGINE
 * 
 * Privacy-preserving event metrics, authoritative moderation pipeline, and public share loops.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 28A & 28B: PRIVACY-AWARE PRODUCT ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | "search"
  | "temple_view"
  | "map_open"
  | "state_view"
  | "district_view"
  | "save_temple"
  | "start_planner"
  | "generate_plan"
  | "save_journey"
  | "share_journey"
  | "booking_click"
  | "route_click"
  | "language_change"
  | "report_issue";

export interface AnalyticsEvent {
  id: string;
  eventName: AnalyticsEventType;
  timestamp: string; // ISO 8601
  anonymousSessionId: string; // SHA-256 rotated daily, zero IP or PII
  route: string;
  entityId?: string; // temple slug, state code, etc.
  metadataMinimal?: Record<string, string | number | boolean>;
}

const analyticsStore: AnalyticsEvent[] = [];

export function recordAnalyticsEvent(
  params: Omit<AnalyticsEvent, "id" | "timestamp">
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    ...params,
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  analyticsStore.push(event);
  if (analyticsStore.length > 5000) {
    analyticsStore.shift();
  }
  return event;
}

export function getAnalyticsDashboardSummary(): {
  totalEvents: number;
  eventCounts: Record<AnalyticsEventType, number>;
  activeSessionsCount: number;
  topEntities: { entityId: string; views: number }[];
} {
  const eventCounts = {} as Record<AnalyticsEventType, number>;
  const sessionSet = new Set<string>();
  const entityMap = new Map<string, number>();

  for (const ev of analyticsStore) {
    eventCounts[ev.eventName] = (eventCounts[ev.eventName] || 0) + 1;
    sessionSet.add(ev.anonymousSessionId);
    if (ev.entityId && (ev.eventName === "temple_view" || ev.eventName === "booking_click")) {
      entityMap.set(ev.entityId, (entityMap.get(ev.entityId) || 0) + 1);
    }
  }

  const topEntities = Array.from(entityMap.entries())
    .map(([entityId, views]) => ({ entityId, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    totalEvents: analyticsStore.length,
    eventCounts,
    activeSessionsCount: sessionSet.size,
    topEntities,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 28D & 28E: USER FEEDBACK & VERIFICATION PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

export type FeedbackReason =
  | "WRONG_TEMPLE_NAME"
  | "WRONG_LOCATION"
  | "WRONG_TIMING"
  | "WRONG_BOOKING"
  | "INCORRECT_HISTORY"
  | "INCORRECT_FESTIVAL"
  | "INCORRECT_IMAGE"
  | "DUPLICATE_TEMPLE"
  | "BROKEN_LINK"
  | "OTHER";

export type ModerationStage =
  | "REPORT_RECEIVED"
  | "MODERATION_QUEUE"
  | "SOURCE_CHECK_IN_PROGRESS"
  | "CORRECTION_PROPOSED"
  | "STATUTORY_VERIFIED"
  | "PUBLISHED_TO_PRODUCTION"
  | "REJECTED";

export interface FeedbackSubmission {
  id: string;
  templeId: string;
  templeName: string;
  isHelpfulVote?: boolean;
  reason: FeedbackReason;
  userObservation: string;
  proposedCorrection?: string;
  submittedAt: string;
  stage: ModerationStage;
  reviewedBy?: string;
  statutorySourceCitation?: string;
  verifiedAt?: string;
}

const moderationQueue: FeedbackSubmission[] = [];

export function submitUserFeedback(params: {
  templeId: string;
  templeName: string;
  isHelpfulVote?: boolean;
  reason: FeedbackReason;
  userObservation: string;
  proposedCorrection?: string;
}): FeedbackSubmission {
  const report: FeedbackSubmission = {
    ...params,
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    submittedAt: new Date().toISOString(),
    stage: "REPORT_RECEIVED",
  };
  moderationQueue.push(report);
  return report;
}

export function advanceFeedbackModeration(
  reportId: string,
  nextStage: ModerationStage,
  adminNotes: { reviewer: string; statutorySourceCitation?: string }
): { success: boolean; report?: FeedbackSubmission; error?: string } {
  const report = moderationQueue.find((r) => r.id === reportId);
  if (!report) {
    return { success: false, error: "Report not found in queue" };
  }

  // Never directly publish without statutory source check
  if (nextStage === "PUBLISHED_TO_PRODUCTION" && !adminNotes.statutorySourceCitation) {
    return {
      success: false,
      error: "Strict data policy violation: Cannot publish correction without statutory source citation.",
    };
  }

  report.stage = nextStage;
  report.reviewedBy = adminNotes.reviewer;
  if (adminNotes.statutorySourceCitation) {
    report.statutorySourceCitation = adminNotes.statutorySourceCitation;
    report.verifiedAt = new Date().toISOString();
  }

  return { success: true, report };
}

export function getModerationQueue(): FeedbackSubmission[] {
  return [...moderationQueue];
}

// ─────────────────────────────────────────────────────────────────────────────
// 28F & 28G: SHARING & GROWTH LOOPS
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicSharedJourney {
  shareId: string;
  publicTitle: string;
  totalDays: number;
  stops: { day: number; templeSlug: string; templeName: string; location: string }[];
  thematicCircuit?: string;
  shareUrl: string;
  createdAt: string;
}

const sharedJourneyStore = new Map<string, PublicSharedJourney>();

export function createPublicJourneyShare(params: {
  title: string;
  totalDays: number;
  stops: { day: number; templeSlug: string; templeName: string; location: string }[];
  thematicCircuit?: string;
}): PublicSharedJourney {
  const shareId = `yatra_${Math.random().toString(36).substring(2, 10)}`;
  const shareUrl = `https://templeora.vercel.app/journey/share/${shareId}`;

  const publicSnapshot: PublicSharedJourney = {
    shareId,
    publicTitle: params.title,
    totalDays: params.totalDays,
    stops: params.stops,
    thematicCircuit: params.thematicCircuit,
    shareUrl,
    createdAt: new Date().toISOString(),
  };

  sharedJourneyStore.set(shareId, publicSnapshot);
  return publicSnapshot;
}

export function getPublicSharedJourney(shareId: string): PublicSharedJourney | null {
  return sharedJourneyStore.get(shareId) || null;
}
