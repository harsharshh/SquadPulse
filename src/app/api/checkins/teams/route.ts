import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { createTeam, DEFAULT_ORGANIZATION_ID } from "@/lib/checkin-service";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name : "";
    const organizationId =
      typeof body?.organizationId === "string" && body.organizationId
        ? body.organizationId
        : DEFAULT_ORGANIZATION_ID;

    if (!name.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const team = await createTeam(organizationId, name, userId);

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Failed to create team", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
