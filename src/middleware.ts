import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting in-memory map: IP -> { count: number, resetAt: number }
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120; // 120 requests per minute per IP

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only apply rate limiting to /api/ routes
  if (path.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const now = Date.now();
    const record = ipRateMap.get(ip);

    if (!record || now > record.resetAt) {
      ipRateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS) {
        return new NextResponse(
          JSON.stringify({
            error: "Too Many Requests",
            message: "Rate limit exceeded. Please wait a minute before retrying sacred requests.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          }
        );
      }
    }
  }

  const response = NextResponse.next();

  // Enforce CORS security for API routes
  if (path.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest).*)",
  ],
};
