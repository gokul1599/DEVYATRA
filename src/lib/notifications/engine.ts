/**
 * DEVYATRA / TEMPLEORA — PHASE 26: NOTIFICATIONS & PILGRIM ALERTS ENGINE
 * 
 * Multi-channel dispatch, explicit preferences, quiet hours compliance, and smart journey alerts.
 */

export type NotificationChannel = "IN_APP" | "WEB_PUSH" | "EMAIL";

export type NotificationEventType =
  | "festival_update"
  | "timing_change"
  | "booking_update"
  | "temporary_closure"
  | "journey_reminder"
  | "saved_temple_update";

export interface NotificationPreferences {
  userId: string;
  enabledChannels: NotificationChannel[];
  festivalAlerts: boolean;
  timingAlerts: boolean;
  bookingAlerts: boolean;
  journeyReminders: boolean;
  travelAlerts: boolean;
  marketingConsent: boolean; // Default false (zero spam)
  timezone: string; // e.g. "Asia/Kolkata"
  quietHours: {
    enabled: boolean;
    startHour: number; // 0-23, e.g. 22 (10 PM)
    endHour: number;   // 0-23, e.g. 6 (6 AM)
  };
}

export interface NotificationEvent {
  id: string;
  type: NotificationEventType;
  title: string;
  body: string;
  templeId?: string;
  journeyId?: string;
  urgency: "LOW" | "NORMAL" | "EMERGENCY";
  verifiedSource: string;
  createdAt: string;
}

export interface NotificationDelivery {
  id: string;
  eventId: string;
  userId: string;
  channel: NotificationChannel;
  status: "DELIVERED" | "SUPPRESSED_QUIET_HOURS" | "DISALLOWED_PREFERENCE" | "FAILED";
  deliveredAt: string | null;
  rationale: string;
}

// In-memory log of recent deliveries to prevent duplicates
const deliveryLog: NotificationDelivery[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// 26E, 26F & 26G: NOTIFICATION ENGINE & QUIET HOURS
// ─────────────────────────────────────────────────────────────────────────────

export function isInQuietHours(
  prefs: NotificationPreferences,
  checkDate: Date = new Date()
): boolean {
  if (!prefs.quietHours.enabled) return false;

  // Convert check date to user's specified timezone
  const hourString = checkDate.toLocaleTimeString("en-US", {
    timeZone: prefs.timezone,
    hour: "numeric",
    hour12: false,
  });
  const currentHour = parseInt(hourString, 10);

  const { startHour, endHour } = prefs.quietHours;
  if (startHour > endHour) {
    // Cross-midnight range (e.g. 22:00 to 06:00)
    return currentHour >= startHour || currentHour < endHour;
  } else {
    // Same-day range
    return currentHour >= startHour && currentHour < endHour;
  }
}

export function isEventPermittedByUser(
  prefs: NotificationPreferences,
  event: NotificationEvent
): boolean {
  switch (event.type) {
    case "festival_update":
      return prefs.festivalAlerts;
    case "timing_change":
      return prefs.timingAlerts;
    case "booking_update":
      return prefs.bookingAlerts;
    case "journey_reminder":
      return prefs.journeyReminders;
    case "temporary_closure":
      return prefs.travelAlerts;
    case "saved_temple_update":
      return prefs.timingAlerts;
    default:
      return false;
  }
}

export function dispatchNotification(params: {
  event: NotificationEvent;
  userPrefs: NotificationPreferences;
  preferredChannel?: NotificationChannel;
  dispatchTime?: Date;
}): NotificationDelivery {
  const { event, userPrefs, preferredChannel = "IN_APP", dispatchTime = new Date() } = params;

  // 1. Check user category preference
  if (!isEventPermittedByUser(userPrefs, event)) {
    const delivery: NotificationDelivery = {
      id: `nd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId: event.id,
      userId: userPrefs.userId,
      channel: preferredChannel,
      status: "DISALLOWED_PREFERENCE",
      deliveredAt: null,
      rationale: `User disabled alerts for category: ${event.type}`,
    };
    deliveryLog.push(delivery);
    return delivery;
  }

  // 2. Check channel availability
  if (!userPrefs.enabledChannels.includes(preferredChannel)) {
    const delivery: NotificationDelivery = {
      id: `nd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId: event.id,
      userId: userPrefs.userId,
      channel: preferredChannel,
      status: "DISALLOWED_PREFERENCE",
      deliveredAt: null,
      rationale: `Channel ${preferredChannel} not enabled in user preferences`,
    };
    deliveryLog.push(delivery);
    return delivery;
  }

  // 3. Check quiet hours (EMERGENCY events bypass quiet hours)
  if (event.urgency !== "EMERGENCY" && isInQuietHours(userPrefs, dispatchTime)) {
    const delivery: NotificationDelivery = {
      id: `nd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId: event.id,
      userId: userPrefs.userId,
      channel: preferredChannel,
      status: "SUPPRESSED_QUIET_HOURS",
      deliveredAt: null,
      rationale: `Suppressed during user quiet hours (${userPrefs.quietHours.startHour}:00 - ${userPrefs.quietHours.endHour}:00 ${userPrefs.timezone})`,
    };
    deliveryLog.push(delivery);
    return delivery;
  }

  // 4. Successful delivery
  const delivery: NotificationDelivery = {
    id: `nd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventId: event.id,
    userId: userPrefs.userId,
    channel: preferredChannel,
    status: "DELIVERED",
    deliveredAt: dispatchTime.toISOString(),
    rationale: `Delivered via ${preferredChannel}. Verified source: ${event.verifiedSource}`,
  };
  deliveryLog.push(delivery);
  return delivery;
}

// ─────────────────────────────────────────────────────────────────────────────
// 26H: SMART JOURNEY REMINDER BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function generateSmartJourneyReminder(params: {
  journeyTitle: string;
  templeName: string;
  visitDate: string; // YYYY-MM-DD
  verifiedBookingUrl?: string;
  timingSummary: string;
  sourceAuthority: string;
}): NotificationEvent {
  const { journeyTitle, templeName, visitDate, verifiedBookingUrl, timingSummary, sourceAuthority } = params;

  let body = `Your sacred visit to ${templeName} for "${journeyTitle}" is scheduled on ${visitDate}. Verified timings: ${timingSummary}.`;
  if (verifiedBookingUrl) {
    body += ` Official booking portal available.`;
  }

  return {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "journey_reminder",
    title: `Tomorrow: ${templeName} Darshan`,
    body,
    urgency: "NORMAL",
    verifiedSource: sourceAuthority,
    createdAt: new Date().toISOString(),
  };
}
