/**
 * DEVYATRA / TEMPLEORA — CALENDAR INTEGRATION (.ICS GENERATOR)
 * 
 * Generates standards-compliant iCalendar (.ics) files for planned yatras,
 * allowing pilgrims to synchronize their darshan itinerary with Apple Calendar,
 * Google Calendar, Outlook, and mobile devices.
 */

export interface JourneyCalendarStop {
  name: string;
  dayNumber?: number;
  time?: string;
  durationMinutes?: number;
  location?: string;
  description?: string;
}

export interface JourneyCalendarEvent {
  journeyId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  totalDays: number;
  stops: JourneyCalendarStop[];
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatDayDate(baseDateStr: string, dayOffset: number, timeStr = "08:00"): { start: string; end: string } {
  const base = new Date(baseDateStr);
  if (isNaN(base.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + dayOffset);
    return {
      start: formatDateToICS(fallback),
      end: formatDateToICS(new Date(fallback.getTime() + 2 * 60 * 60 * 1000)),
    };
  }

  const [hours, minutes] = timeStr.split(":").map((v) => parseInt(v, 10) || 0);
  const eventStart = new Date(base);
  eventStart.setDate(eventStart.getDate() + dayOffset);
  eventStart.setHours(hours, minutes, 0, 0);

  const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours default duration

  return {
    start: formatDateToICS(eventStart),
    end: formatDateToICS(eventEnd),
  };
}

/**
 * Generates an RFC 5545 compliant VCALENDAR string
 */
export function generateJourneyIcs(event: JourneyCalendarEvent): string {
  const now = formatDateToICS(new Date());

  const eventsICS = event.stops.map((stop, index) => {
    const dayOffset = Math.max(0, (stop.dayNumber || 1) - 1);
    const { start, end } = formatDayDate(event.startDate, dayOffset, stop.time || "08:00");
    const uid = `yatra-${event.journeyId}-stop-${index}-${Date.now()}@templeora.com`;

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${stop.name} — ${event.title}`,
      `DESCRIPTION:${(stop.description || `Sacred pilgrimage visit to ${stop.name}`).replace(/\n/g, "\\n")}`,
      stop.location ? `LOCATION:${stop.location.replace(/,/g, "\\,")}` : `LOCATION:${stop.name}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Devyatra//Templeora Sacred Atlas Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${event.title} (Templeora)`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    ...eventsICS,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers a browser download of the .ics calendar file
 */
export function downloadJourneyIcsFile(event: JourneyCalendarEvent): void {
  if (typeof window === "undefined") return;

  const icsContent = generateJourneyIcs(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-yatra.ics`;

  anchor.href = url;
  anchor.setAttribute("download", filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
