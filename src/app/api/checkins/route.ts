import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import {
  createCheckin,
  getUserTeamStats,
  listOrganizations,
  listTeamFeed,
  listTeams,
  listUserCheckins,
  DEFAULT_ORGANIZATION_ID,
} from "@/lib/checkin-service";
import { getUserSelection, updateUserSelection } from "@/lib/user-service";

async function getSessionUserId() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return { userId } as const;
}

export async function GET(request: NextRequest) {
  const sessionInfo = await getSessionUserId();
  if (!sessionInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get("organizationId");
    const requestedTeamId = searchParams.get("teamId");

    const organizations = await listOrganizations();
    const selection = await getUserSelection(sessionInfo.userId);

    const availableOrgIds = organizations.map((org) => org.id);
    const resolvedOrganizationId = requestedOrgId && availableOrgIds.includes(requestedOrgId)
      ? requestedOrgId
      : selection.organizationId && availableOrgIds.includes(selection.organizationId)
        ? selection.organizationId
        : organizations[0]?.id ?? DEFAULT_ORGANIZATION_ID;

    const teams = await listTeams(resolvedOrganizationId);
    const availableTeamIds = teams.map((team) => team.id);
    const resolvedTeamId = requestedTeamId && availableTeamIds.includes(requestedTeamId)
      ? requestedTeamId
      : selection.teamId && availableTeamIds.includes(selection.teamId)
        ? selection.teamId
        : teams[0]?.id ?? null;

    const needsSelection = !selection.organizationId || !selection.teamId;

    const [history, stats] = await Promise.all([
      listUserCheckins(sessionInfo.userId, 50),
      getUserTeamStats(sessionInfo.userId),
    ]);

    const teamFeed = resolvedTeamId ? await listTeamFeed(resolvedTeamId, sessionInfo.userId, 20) : [];

    return NextResponse.json({
      needsSelection,
      organizations,
      organizationId: resolvedOrganizationId,
      selectedOrganizationId: selection.organizationId,
      teams,
      teamId: resolvedTeamId,
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
    const { mood, note, teamId, teamName, organizationId } = body ?? {};

    if (typeof mood !== "number") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const resolvedOrganizationId = typeof organizationId === "string"
      ? organizationId
      : DEFAULT_ORGANIZATION_ID;

    const checkin = await createCheckin({
      providerAccountId: sessionInfo.userId,
      mood,
      note: typeof note === "string" ? note : null,
      teamId: typeof teamId === "string" ? teamId : null,
      teamName: typeof teamName === "string" ? teamName : null,
      organizationId: resolvedOrganizationId,
    });

    await updateUserSelection(sessionInfo.userId, resolvedOrganizationId, typeof teamId === "string" ? teamId : null);

    const stats = await getUserTeamStats(sessionInfo.userId);
    const teams = await listTeams(resolvedOrganizationId);

    return NextResponse.json({ checkin, stats, teams }, { status: 201 });
  } catch (error) {
    console.error("Failed to create check-in", error);
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 });
  }
}
