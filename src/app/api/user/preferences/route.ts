import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import {
  DEFAULT_ORGANIZATION_ID,
  listOrganizations,
  listTeams,
} from "@/lib/checkin-service";
import {
  ensureUserRecord,
  getUserSelection,
  updateUserSelection,
} from "@/lib/user-service";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUserRecord({
      providerAccountId: userId,
      email: session?.user?.email,
      name: session?.user?.name,
      image: session?.user?.image,
      role: session?.user?.role,
    });

    const { searchParams } = new URL(request.url);
    const requestedOrganizationId = searchParams.get("organizationId");

    const selection = await getUserSelection(userId);
    const organizations = await listOrganizations();

    const needsSelection = !selection.organizationId || !selection.teamId;

    const availableOrgIds = organizations.map((org) => org.id);
    const organizationContextId = requestedOrganizationId && availableOrgIds.includes(requestedOrganizationId)
      ? requestedOrganizationId
      : selection.organizationId && availableOrgIds.includes(selection.organizationId)
        ? selection.organizationId
        : organizations[0]?.id ?? DEFAULT_ORGANIZATION_ID;

    const teams = await listTeams(organizationContextId);
    const availableTeamIds = teams.map((team) => team.id);
    const selectedTeamId = selection.teamId && availableTeamIds.includes(selection.teamId)
      ? selection.teamId
      : null;

    return NextResponse.json({
      organizations,
      organizationId: organizationContextId,
      selectedOrganizationId: selection.organizationId,
      teams,
      selectedTeamId,
      needsSelection,
    });
  } catch (error) {
    console.error("Failed to load user preferences", error);
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const organizationId = typeof body?.organizationId === "string" && body.organizationId
      ? body.organizationId
      : DEFAULT_ORGANIZATION_ID;
    const teamId = typeof body?.teamId === "string" && body.teamId ? body.teamId : null;

    const organizations = await listOrganizations();
    if (!organizations.some((org) => org.id === organizationId)) {
      return NextResponse.json({ error: "Invalid organization" }, { status: 400 });
    }

    if (teamId) {
      const teams = await listTeams(organizationId);
      if (!teams.some((team) => team.id === teamId)) {
        return NextResponse.json({ error: "Team does not belong to the selected organization" }, { status: 400 });
      }
    }

    await updateUserSelection(userId, organizationId, teamId);

    return NextResponse.json({ organizationId, teamId }, { status: 200 });
  } catch (error) {
    console.error("Failed to update user preferences", error);
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
