import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import {
  createWhisper,
  getWhisperWallData,
  type WhisperCategory,
} from "@/lib/whisper-service";
import {
  listOrganizations,
  listTeams,
  DEFAULT_ORGANIZATION_ID,
} from "@/lib/checkin-service";
import { ensureUserRecord, getUserSelection, updateUserSelection } from "@/lib/user-service";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  const providerAccountId = session?.user?.id;

  if (!providerAccountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const organizationIdParam = searchParams.get("organizationId");
    const teamId = searchParams.get("teamId");
    const categoriesParam = searchParams.get("categories");
    const categories = categoriesParam
      ? categoriesParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean) as WhisperCategory[]
      : undefined;

    await ensureUserRecord({
      providerAccountId,
      email: session?.user?.email,
      name: session?.user?.name,
      image: session?.user?.image,
      role: session?.user?.role,
    });

    const organizations = await listOrganizations();
    const selection = await getUserSelection(providerAccountId);

    const availableOrgIds = organizations.map((org) => org.id);
    const resolvedOrganizationId = organizationIdParam && availableOrgIds.includes(organizationIdParam)
      ? organizationIdParam
      : selection.organizationId && availableOrgIds.includes(selection.organizationId)
        ? selection.organizationId
        : organizations[0]?.id ?? DEFAULT_ORGANIZATION_ID;

    const teams = await listTeams(resolvedOrganizationId);
    const availableTeamIds = teams.map((team) => team.id);
    const resolvedTeamId = teamId && availableTeamIds.includes(teamId)
      ? teamId
      : selection.teamId && availableTeamIds.includes(selection.teamId)
        ? selection.teamId
        : teams[0]?.id ?? null;

    const needsSelection = !selection.organizationId || !selection.teamId;

    const data = await getWhisperWallData({
      providerAccountId,
      organizationId: resolvedOrganizationId,
      teamId: resolvedTeamId,
      categories,
    });

    return NextResponse.json({
      ...data,
      needsSelection,
      organizations,
      organizationId: resolvedOrganizationId,
      selectedOrganizationId: selection.organizationId,
      teams,
      teamId: resolvedTeamId,
    });
  } catch (error) {
    console.error("Failed to load whispers", error);
    return NextResponse.json({ error: "Failed to load whispers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const providerAccountId = session?.user?.id;

  if (!providerAccountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content : "";
    const category = typeof body?.category === "string" ? body.category : "general";
    const teamId = typeof body?.teamId === "string" ? body.teamId : null;
    const organizationId = typeof body?.organizationId === "string" ? body.organizationId : null;
    const resolvedOrganizationId = organizationId ?? DEFAULT_ORGANIZATION_ID;

    const whisper = await createWhisper({
      providerAccountId,
      content,
      category,
      organizationId: resolvedOrganizationId,
      teamId,
    });

    await updateUserSelection(providerAccountId, resolvedOrganizationId, teamId);

    return NextResponse.json({ whisper }, { status: 201 });
  } catch (error) {
    console.error("Failed to create whisper", error);
    const message = error instanceof Error ? error.message : "Failed to create whisper";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
