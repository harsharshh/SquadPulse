import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getTeamDashboardData } from "@/lib/checkin-service";
import { getUserSelection } from "@/lib/user-service";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const teamIdParam = searchParams.get("teamId");

    let teamId: string | null = teamIdParam;

    if (!teamId) {
      const selection = await getUserSelection(userId);
      teamId = selection.teamId ?? null;
    }

    if (!teamId) {
      return NextResponse.json({ needsSelection: true }, { status: 200 });
    }

    const data = await getTeamDashboardData(teamId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load team dashboard data", error);
    const message = error instanceof Error ? error.message : "Failed to load dashboard data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
