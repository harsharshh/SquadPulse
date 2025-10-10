import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { addWhisperComment } from "@/lib/whisper-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ whisperId: string }> },
) {
  const session = await getAuthSession();
  const providerAccountId = session?.user?.id;

  if (!providerAccountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content : "";
    const { whisperId } = await context.params;
    const comment = await addWhisperComment({
      whisperId,
      providerAccountId,
      content,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Failed to add whisper comment", error);
    const message = error instanceof Error ? error.message : "Failed to add comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
