import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  createCheckin,
  getUserTeamStats,
  listTeamFeed,
  listTeams,
  listUserCheckins,
} from "@/lib/checkin-service";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return {
    userId,
    organization: session.user.email?.split("@")[1] ?? null,
  } as const;
}

export async function GET(request: NextRequest) {
  const sessionInfo = await getSessionUserId();
  if (!sessionInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    const [teams, history, stats] = await Promise.all([
      listTeams(sessionInfo.userId),
      listUserCheckins(sessionInfo.userId, 50),
      getUserTeamStats(sessionInfo.userId),
    ]);

    const teamFeed = teamId ? await listTeamFeed(teamId, 20) : [];

    return NextResponse.json({
      teams,
      history,
      stats,
      teamFeed,
    });
  } catch (error) {
    console.error("Failed to fetch check-in data", error);
    return NextResponse.json({ error: "Failed to load check-in data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionInfo = await getSessionUserId();
  if (!sessionInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mood, note, teamId, teamName } = body ?? {};

    if (typeof mood !== "number") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const checkin = await createCheckin({
      providerAccountId: sessionInfo.userId,
      mood,
      note: typeof note === "string" ? note : null,
      teamId: typeof teamId === "string" ? teamId : null,
      teamName: typeof teamName === "string" ? teamName : null,
      organization: sessionInfo.organization,
    });

    const stats = await getUserTeamStats(sessionInfo.userId);
    const teams = await listTeams(sessionInfo.userId);

    return NextResponse.json({ checkin, stats, teams }, { status: 201 });
  } catch (error) {
    console.error("Failed to create check-in", error);
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 });
  }
}
