import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getSaved,
  setSaved,
  getSavedRichItems,
  addRichSavedItem,
  removeRichSavedItem,
} from "@/lib/saved";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ saved: [], savedItems: [], synced: false });
  }

  const saved = getSaved(user.id);
  const savedItems = getSavedRichItems(user.id);
  return NextResponse.json({ saved, savedItems, synced: true });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Sign in to sync saved items" }, { status: 401 });

  let body: {
    slug?: string;
    add?: boolean;
    item?: {
      id: string;
      kind: "temple" | "place" | "circuit";
      name: string;
      category?: string;
      location?: string;
      state?: string;
      notes?: string;
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Support rich item save
  if (body.item) {
    if (body.add !== false) {
      const items = addRichSavedItem(user.id, body.item);
      return NextResponse.json({ success: true, savedItems: items });
    } else {
      const items = removeRichSavedItem(user.id, body.item.id);
      return NextResponse.json({ success: true, savedItems: items });
    }
  }

  // Legacy temple slug handling
  if (!body.slug) {
    return NextResponse.json({ error: "Missing slug or item payload" }, { status: 400 });
  }

  const current = getSaved(user.id);
  const next = body.add
    ? current.includes(body.slug)
      ? current
      : [...current, body.slug]
    : current.filter((s) => s !== body.slug);

  const updated = setSaved(user.id, next);
  return NextResponse.json({ saved: updated, synced: true });
}