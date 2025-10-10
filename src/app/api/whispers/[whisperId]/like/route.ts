import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { toggleWhisperLike } from "@/lib/whisper-service";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ whisperId: string }> },
) {
  const session = await getAuthSession();
  const providerAccountId = session?.user?.id;

  if (!providerAccountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { whisperId } = await context.params;
    const result = await toggleWhisperLike(whisperId, providerAccountId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to toggle whisper like", error);
    const message = error instanceof Error ? error.message : "Failed to toggle whisper like";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
