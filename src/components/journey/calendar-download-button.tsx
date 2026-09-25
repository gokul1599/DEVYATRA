"use client";

import { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { downloadJourneyIcsFile, type JourneyCalendarEvent } from "@/lib/calendar/ics";

interface CalendarDownloadButtonProps {
  journey: {
    id: string;
    title: string;
    startDate: string;
    totalDays: number;
    templeNames: string[];
    circuitId?: string | null;
  };
  className?: string;
  variant?: "pill" | "outline" | "hero";
}

export function CalendarDownloadButton({
  journey,
  className = "",
  variant = "pill",
}: CalendarDownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const stopsPerDay = Math.max(1, Math.ceil(journey.templeNames.length / Math.max(1, journey.totalDays)));
    const stops = journey.templeNames.map((name, idx) => {
      const dayNumber = Math.min(journey.totalDays, Math.floor(idx / stopsPerDay) + 1);
      const timeSlots = ["07:30", "11:30", "16:30", "19:00"];
      const slotIndex = idx % stopsPerDay;
      const time = timeSlots[Math.min(slotIndex, timeSlots.length - 1)];

      return {
        name,
        dayNumber,
        time,
        durationMinutes: 120,
        description: `Sacred darshan and visit at ${name}. Circuit itinerary: ${journey.title}.`,
      };
    });

    const event: JourneyCalendarEvent = {
      journeyId: journey.id,
      title: journey.title,
      startDate: journey.startDate,
      totalDays: journey.totalDays,
      stops,
    };

    downloadJourneyIcsFile(event);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        className={`inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold-bright transition-all hover:bg-gold/20 hover:border-gold/60 ${className}`}
        title="Download iCalendar (.ics) file for Apple, Google, or Outlook Calendar"
      >
        {downloaded ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300">Added to Calendar!</span>
          </>
        ) : (
          <>
            <Calendar className="h-4 w-4 text-gold" />
            <span>Download .ics Calendar</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-ivory/90 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold-bright ${className}`}
      title="Download iCalendar (.ics) file"
    >
      {downloaded ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-300">.ics Saved</span>
        </>
      ) : (
        <>
          <Calendar className="h-3.5 w-3.5 text-gold" />
          <span>Calendar (.ics)</span>
        </>
      )}
    </button>
  );
}
