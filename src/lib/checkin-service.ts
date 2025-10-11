import { randomUUID } from "crypto";

import { getDbClient } from "@/lib/db";
import {
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_ORGANIZATION_NAME,
  DEFAULT_TEAM_ID,
  DEFAULT_TEAM_NAME,
} from "@/lib/organization-constants";

export {
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_ORGANIZATION_NAME,
  DEFAULT_TEAM_ID,
  DEFAULT_TEAM_NAME,
} from "@/lib/organization-constants";

type SqlClient = ReturnType<typeof getDbClient>;

type OrganizationRow = {
  id: string;
  name: string;
  created_at: string;
};

type TeamRow = {
  id: string;
  organization_id: string;
  name: string;
  provider_account_id: string | null;
  created_at: string;
};

type CheckinRow = {
  id: string;
  provider_account_id: string;
  team_id: string | null;
  mood: number;
  note: string | null;
  created_at: string;
};

type UserHistoryRow = CheckinRow & { team_name: string | null };

type CommentRow = {
  id: string;
  checkin_id: string;
  author_provider_account_id: string;
  content: string;
  created_at: string;
  anonymous_username: string | null;
};

export type Organization = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  organizationId: string;
};

export type CheckinHistoryItem = {
  id: string;
  mood: number;
  note: string | null;
  createdAt: string;
  teamName: string | null;
};

export type TeamStats = {
  averageMood: number;
  totalCheckins: number;
  lastCheckinAt: string | null;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  anonymousUsername: string | null;
};

type CreateCheckinParams = {
  providerAccountId: string;
  mood: number;
  note?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  organizationId?: string | null;
};

type CreateCommentParams = {
  checkinId: string;
  authorProviderAccountId: string;
  content: string;
};

const createQuery = (sql: SqlClient) => <T>(strings: TemplateStringsArray, ...values: unknown[]) =>
  sql(strings, ...values) as unknown as Promise<T>;

let schemaInitialized = false;

async function ensureSchema(sql: SqlClient) {
  if (schemaInitialized) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      name TEXT,
      provider_account_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE teams
    ADD COLUMN IF NOT EXISTS organization_id TEXT,
    ADD COLUMN IF NOT EXISTS provider_account_id TEXT,
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    ALTER TABLE teams
    ALTER COLUMN provider_account_id DROP NOT NULL
  `;

  await sql`
    UPDATE teams
    SET organization_id = ${DEFAULT_ORGANIZATION_ID}
    WHERE organization_id IS NULL
  `;

  await sql`
    ALTER TABLE teams
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN organization_id SET NOT NULL
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_org_lower_name
      ON teams (organization_id, LOWER(name))
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      provider_account_id TEXT NOT NULL,
      team_id TEXT,
      mood SMALLINT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_checkins_provider_account_id
      ON checkins (provider_account_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_checkins_team_id_created_at
      ON checkins (team_id, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checkin_comments (
      id TEXT PRIMARY KEY,
      checkin_id TEXT NOT NULL,
      author_provider_account_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_comments_checkin_id
      ON checkin_comments (checkin_id, created_at DESC)
  `;

  await sql`
    INSERT INTO organizations (id, name)
    VALUES (${DEFAULT_ORGANIZATION_ID}, ${DEFAULT_ORGANIZATION_NAME})
    ON CONFLICT (name) DO NOTHING
  `;

  await sql`
    INSERT INTO teams (id, organization_id, name)
    VALUES (${DEFAULT_TEAM_ID}, ${DEFAULT_ORGANIZATION_ID}, ${DEFAULT_TEAM_NAME})
    ON CONFLICT (id) DO NOTHING
  `;

  schemaInitialized = true;
}

export async function listOrganizations(): Promise<Organization[]> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const rows = await query<OrganizationRow[]>`
    SELECT id, name, created_at
    FROM organizations
    ORDER BY LOWER(name) ASC
  `;

  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function listTeams(organizationId?: string): Promise<Team[]> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const targetOrganizationId = organizationId ?? DEFAULT_ORGANIZATION_ID;

  const existing = await query<TeamRow[]>`
    SELECT id, organization_id, name, provider_account_id, created_at
    FROM teams
    WHERE organization_id = ${targetOrganizationId}
    ORDER BY LOWER(name) ASC
  `;

  return existing.map((row) => ({ id: row.id, name: row.name, organizationId: row.organization_id }));
}

export async function createTeam(organizationId: string, name: string, providerAccountId?: string | null): Promise<Team> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Team name cannot be empty");
  }

  const existing = await query<TeamRow[]>`
    SELECT id, organization_id, name, provider_account_id, created_at
    FROM teams
    WHERE organization_id = ${organizationId}
      AND LOWER(name) = ${trimmedName.toLowerCase()}
    LIMIT 1
  `;

  if (existing.length) {
    const row = existing[0];
    return { id: row.id, name: row.name, organizationId: row.organization_id };
  }

  const teamId = randomUUID();
  const [created] = await query<TeamRow[]>`
    INSERT INTO teams (id, organization_id, name, provider_account_id)
    VALUES (${teamId}, ${organizationId}, ${trimmedName}, ${providerAccountId ?? null})
    RETURNING id, organization_id, name, provider_account_id, created_at
  `;

  return { id: created.id, name: created.name, organizationId: created.organization_id };
}

export async function createCheckin(params: CreateCheckinParams): Promise<CheckinHistoryItem> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  if (!Number.isInteger(params.mood) || params.mood < 1 || params.mood > 5) {
    throw new Error("Mood value must be an integer between 1 and 5");
  }

  const organizationId = params.organizationId ?? DEFAULT_ORGANIZATION_ID;
  let teamId = params.teamId ?? null;
  let teamName: string | null = null;

  if (params.teamName && params.teamName.trim()) {
    const trimmedName = params.teamName.trim();

    const existingTeam = await query<TeamRow[]>`
      SELECT id, organization_id, name, provider_account_id, created_at
      FROM teams
      WHERE organization_id = ${organizationId}
        AND LOWER(name) = ${trimmedName.toLowerCase()}
      LIMIT 1
    `;

    if (existingTeam.length) {
      teamId = existingTeam[0].id;
      teamName = existingTeam[0].name;
    } else {
      const newTeamId = randomUUID();
      const [createdTeam] = await query<TeamRow[]>`
        INSERT INTO teams (id, organization_id, name, provider_account_id)
        VALUES (${newTeamId}, ${organizationId}, ${trimmedName}, ${params.providerAccountId ?? null})
        RETURNING id, organization_id, name, provider_account_id, created_at
      `;
      teamId = createdTeam.id;
      teamName = createdTeam.name;
    }
  } else if (teamId) {
    const rows = await query<TeamRow[]>`
      SELECT id, organization_id, name, provider_account_id, created_at
      FROM teams
      WHERE id = ${teamId}
      LIMIT 1
    `;

    if (!rows.length) {
      throw new Error("Team not found");
    }

    teamName = rows[0].name;
  }

  const checkinId = randomUUID();
  const note = params.note?.trim() ?? null;

  const [created] = await query<UserHistoryRow[]>`
    INSERT INTO checkins (id, provider_account_id, team_id, mood, note)
    VALUES (
      ${checkinId},
      ${params.providerAccountId},
      ${teamId},
      ${params.mood},
      ${note}
    )
    RETURNING id, provider_account_id, team_id, mood, note, created_at,
      (SELECT name FROM teams WHERE id = checkins.team_id) AS team_name
  `;

  return {
    id: created.id,
    mood: created.mood,
    note: created.note,
    createdAt: created.created_at,
    teamName: created.team_name ?? teamName,
  } satisfies CheckinHistoryItem;
}

export async function listUserCheckins(providerAccountId: string, limit = 20) {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const rows = await query<UserHistoryRow[]>`
    SELECT
      c.id,
      c.provider_account_id,
      c.team_id,
      c.mood,
      c.note,
      c.created_at,
      t.name AS team_name
    FROM checkins c
    LEFT JOIN teams t ON t.id = c.team_id
    WHERE c.provider_account_id = ${providerAccountId}
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    mood: row.mood,
    note: row.note,
    createdAt: row.created_at,
    teamName: row.team_name,
  } satisfies CheckinHistoryItem));
}

export async function getUserTeamStats(providerAccountId: string): Promise<TeamStats> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const [row] = await query<
    Array<{ avg_mood: string | null; total_checkins: string; last_checkin_at: string | null }>
  >`
    SELECT
      AVG(mood)::numeric(10, 2) AS avg_mood,
      COUNT(*)::text AS total_checkins,
      MAX(created_at) AS last_checkin_at
    FROM checkins
    WHERE provider_account_id = ${providerAccountId}
  `;

  const averageMood = row?.avg_mood ? Number(row.avg_mood) : 0;
  const totalCheckins = row?.total_checkins ? Number(row.total_checkins) : 0;
  const lastCheckinAt = row?.last_checkin_at ?? null;

  return { averageMood, totalCheckins, lastCheckinAt } satisfies TeamStats;
}

export async function listTeamFeed(
  teamId: string,
  providerAccountId: string,
  limit = 10,
) {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const rows = await query<
    Array<{ id: string; mood: number; note: string | null; created_at: string; anonymous_username: string | null }>
  >`
    SELECT
      c.id,
      c.mood,
      c.note,
      c.created_at,
      u.anonymous_username
    FROM checkins c
    LEFT JOIN users u ON u.provider_account_id = c.provider_account_id
    WHERE c.team_id = ${teamId}
      AND c.provider_account_id = ${providerAccountId}
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    mood: row.mood,
    note: row.note,
    createdAt: row.created_at,
    anonymousUsername: row.anonymous_username,
  }));
}

export async function createComment(params: CreateCommentParams): Promise<Comment> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const trimmed = params.content.trim();
  if (!trimmed) {
    throw new Error("Comment content cannot be empty");
  }

  const commentId = randomUUID();

  const [created] = await query<CommentRow[]>`
    INSERT INTO checkin_comments (id, checkin_id, author_provider_account_id, content)
    VALUES (
      ${commentId},
      ${params.checkinId},
      ${params.authorProviderAccountId},
      ${trimmed}
    )
    RETURNING id, checkin_id, author_provider_account_id, content, created_at,
      (SELECT anonymous_username FROM users WHERE provider_account_id = checkin_comments.author_provider_account_id) AS anonymous_username
  `;

  return {
    id: created.id,
    content: created.content,
    createdAt: created.created_at,
    anonymousUsername: created.anonymous_username,
  } satisfies Comment;
}

export async function listComments(checkinId: string): Promise<Comment[]> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const rows = await query<CommentRow[]>`
    SELECT
      id,
      checkin_id,
      author_provider_account_id,
      content,
      created_at,
      (SELECT anonymous_username FROM users WHERE provider_account_id = checkin_comments.author_provider_account_id) AS anonymous_username
    FROM checkin_comments
    WHERE checkin_id = ${checkinId}
    ORDER BY created_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    anonymousUsername: row.anonymous_username,
  } satisfies Comment));
}
