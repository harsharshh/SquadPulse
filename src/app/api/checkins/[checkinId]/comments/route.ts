import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { createComment, listComments } from "@/lib/checkin-service";

async function getSessionUserId() {
  const session = await getAuthSession();
  return session?.user?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ checkinId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { checkinId } = await context.params;

  try {
    const comments = await listComments(checkinId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Failed to fetch comments", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ checkinId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { checkinId } = await context.params;

  try {
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content : "";

    const comment = await createComment({
      checkinId,
      authorProviderAccountId: userId,
      content,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
