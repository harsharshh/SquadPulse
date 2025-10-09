import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getOrCreateTeam } from "@/lib/checkin-service";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name : "";

    if (!name.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const organization = session.user.email?.split("@")[1] ?? null;
    const team = await getOrCreateTeam({
      providerAccountId: userId,
      name,
      organization,
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Failed to create team", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
