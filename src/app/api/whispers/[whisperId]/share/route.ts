import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { incrementWhisperShare } from "@/lib/whisper-service";

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
    const result = await incrementWhisperShare(whisperId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to increment whisper share", error);
    const message = error instanceof Error ? error.message : "Failed to share whisper";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
