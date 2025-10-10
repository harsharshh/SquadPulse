import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { deleteWhisper, updateWhisper } from "@/lib/whisper-service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ whisperId: string }> },
) {
  const session = await getAuthSession();
  const providerAccountId = session?.user?.id;

  if (!providerAccountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { whisperId } = await context.params;
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content : undefined;
    const category = typeof body?.category === "string" ? body.category : undefined;

    const whisper = await updateWhisper({
      providerAccountId,
      whisperId,
      content,
      category,
    });

    return NextResponse.json({ whisper });
  } catch (error) {
    console.error("Failed to update whisper", error);
    const message = error instanceof Error ? error.message : "Failed to update whisper";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
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
    const removed = await deleteWhisper(whisperId, providerAccountId);

    if (!removed) {
      return NextResponse.json({ error: "Whisper not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete whisper", error);
    const message = error instanceof Error ? error.message : "Failed to delete whisper";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
