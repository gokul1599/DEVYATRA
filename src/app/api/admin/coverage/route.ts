import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { getNationalCoverageMatrix } from "@/lib/coverage/matrix";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matrix = await getNationalCoverageMatrix();
  if (!matrix) {
    return NextResponse.json({ error: "Coverage data unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    data: matrix,
  });
}
