import { randomUUID } from "crypto";

import { getDbClient } from "@/lib/db";

type SqlClient = ReturnType<typeof getDbClient>;

type UserRecordRow = {
  anonymous_id: string;
  anonymous_username: string | null;
  blocked: boolean;
  organization_id: string | null;
  team_id: string | null;
};

export type UserRecord = {
  anonymousId: string;
  anonymousUsername: string;
  blocked: boolean;
  organizationId: string | null;
  teamId: string | null;
};

export type UserSelection = {
  organizationId: string | null;
  teamId: string | null;
};

type EnsureUserParams = {
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
};

const MAX_USERNAME_ATTEMPTS = 10;

const ADJECTIVES = [
  "brave",
  "calm",
  "curious",
  "eager",
  "gentle",
  "lively",
  "mighty",
  "quick",
  "quiet",
  "witty",
];

const NOUNS = [
  "aurora",
  "ember",
  "harbor",
  "lantern",
  "meadow",
  "mesa",
  "otter",
  "sparrow",
  "willow",
  "zephyr",
];

const createQuery = (sql: SqlClient) => <T>(strings: TemplateStringsArray, ...values: unknown[]) =>
  sql(strings, ...values) as unknown as Promise<T>;

let schemaInitialized = false;

export async function ensureUserRecord(params: EnsureUserParams): Promise<UserRecord> {
  const sql = getDbClient();
  const query = createQuery(sql);

  await ensureSchema(sql);

  const existingUser = await query<UserRecordRow[]>`
    SELECT anonymous_id, anonymous_username, blocked, organization_id, team_id
    FROM users
    WHERE provider_account_id = ${params.providerAccountId}
    LIMIT 1
  `;

  if (existingUser.length) {
    const ensuredRow = await ensureAnonymousUsername(sql, params.providerAccountId);
    const [updatedUser] = await query<UserRecordRow[]>`
      UPDATE users
      SET email = ${params.email ?? null},
          name = ${params.name ?? null},
          image = ${params.image ?? null},
          organization_id = COALESCE(${params.organizationId ?? null}, organization_id),
          team_id = COALESCE(${params.teamId ?? null}, team_id),
          updated_at = NOW()
      WHERE provider_account_id = ${params.providerAccountId}
      RETURNING anonymous_id, anonymous_username, blocked, organization_id, team_id
    `;

    return mapUserRecord(updatedUser ?? ensuredRow);
  }

  return createUserRecord(sql, params);
}

export async function getUserRecord(providerAccountId: string): Promise<UserRecord | null> {
  const sql = getDbClient();
  const query = createQuery(sql);

  await ensureSchema(sql);

  const rows = await query<UserRecordRow[]>`
    SELECT anonymous_id, anonymous_username, blocked, organization_id, team_id
    FROM users
    WHERE provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  if (!rows.length) {
    return null;
  }

  const ensuredRow = await ensureAnonymousUsername(sql, providerAccountId, rows[0]);

  return mapUserRecord(ensuredRow ?? rows[0]);
}

export async function getUserSelection(providerAccountId: string): Promise<UserSelection> {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  const [row] = await query<Array<{ organization_id: string | null; team_id: string | null }>>`
    SELECT organization_id, team_id
    FROM users
    WHERE provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  return {
    organizationId: row?.organization_id ?? null,
    teamId: row?.team_id ?? null,
  };
}

export async function updateUserSelection(
  providerAccountId: string,
  organizationId: string | null,
  teamId: string | null,
) {
  const sql = getDbClient();
  const query = createQuery(sql);
  await ensureSchema(sql);

  await query`
    UPDATE users
    SET organization_id = ${organizationId},
        team_id = ${teamId},
        updated_at = NOW()
    WHERE provider_account_id = ${providerAccountId}
  `;
}

async function ensureSchema(sql: SqlClient) {
  if (schemaInitialized) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      provider_account_id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      image TEXT,
      anonymous_id TEXT NOT NULL,
      blocked BOOLEAN NOT NULL DEFAULT FALSE,
      anonymous_username TEXT NOT NULL UNIQUE,
      organization_id TEXT,
      team_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS anonymous_username TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS organization_id TEXT,
    ADD COLUMN IF NOT EXISTS team_id TEXT
  `;

  await backfillMissingUsernames(sql);
  await resolveDuplicateUsernames(sql);

  schemaInitialized = true;
}

async function createUserRecord(
  sql: SqlClient,
  params: EnsureUserParams,
): Promise<UserRecord> {
  const query = createQuery(sql);
  const anonymousId = randomUUID();
  const organizationId = params.organizationId ?? null;
  const teamId = params.teamId ?? null;

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
    const anonymousUsername = generateAnonymousUsername();

    try {
      const [createdUser] = await query<UserRecordRow[]>`
        INSERT INTO users (
          provider_account_id,
          email,
          name,
          image,
          anonymous_id,
          blocked,
          anonymous_username,
          organization_id,
          team_id
        )
        VALUES (
          ${params.providerAccountId},
          ${params.email ?? null},
          ${params.name ?? null},
          ${params.image ?? null},
          ${anonymousId},
          FALSE,
          ${anonymousUsername},
          ${organizationId},
          ${teamId}
        )
        RETURNING anonymous_id, anonymous_username, blocked, organization_id, team_id
      `;

      return mapUserRecord(createdUser);
    } catch (error) {
      if (isUniqueViolation(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to generate a unique anonymous username for the user");
}

async function ensureAnonymousUsername(
  sql: SqlClient,
  providerAccountId: string,
  existingRow?: UserRecordRow,
) {
  const query = createQuery(sql);
  const currentRow = existingRow ?? (await fetchUserRow(sql, providerAccountId));

  if (currentRow?.anonymous_username) {
    return currentRow;
  }

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
    const anonymousUsername = generateAnonymousUsername();

    try {
      const [updatedRow] = await query<UserRecordRow[]>`
        UPDATE users
        SET anonymous_username = ${anonymousUsername},
            updated_at = NOW()
        WHERE provider_account_id = ${providerAccountId}
          AND (anonymous_username IS NULL OR anonymous_username = '')
        RETURNING anonymous_id, anonymous_username, blocked, organization_id, team_id
      `;

      if (updatedRow) {
        return updatedRow;
      }
    } catch (error) {
      if (isUniqueViolation(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to assign an anonymous username to the user");
}

async function fetchUserRow(
  sql: SqlClient,
  providerAccountId: string,
) {
  const query = createQuery(sql);
  const [row] = await query<UserRecordRow[]>`
    SELECT anonymous_id, anonymous_username, blocked, organization_id, team_id
    FROM users
    WHERE provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  return row;
}

async function backfillMissingUsernames(sql: SqlClient) {
  const query = createQuery(sql);
  const rows = await query<{ provider_account_id: string }[]>`
    SELECT provider_account_id
    FROM users
    WHERE anonymous_username IS NULL OR anonymous_username = ''
  `;

  for (const row of rows) {
    await ensureAnonymousUsername(sql, row.provider_account_id);
  }
}

async function resolveDuplicateUsernames(sql: SqlClient) {
  const query = createQuery(sql);
  const duplicates = await query<
    Array<{ anonymous_username: string | null; provider_account_id: string }>
  >`
    SELECT anonymous_username, provider_account_id
    FROM (
      SELECT
        anonymous_username,
        provider_account_id,
        ROW_NUMBER() OVER (PARTITION BY anonymous_username ORDER BY provider_account_id) AS row_number
      FROM users
      WHERE anonymous_username IS NOT NULL AND anonymous_username <> ''
    ) AS ranked
    WHERE row_number > 1
  `;

  for (const duplicate of duplicates) {
    await query`
      UPDATE users
      SET anonymous_username = NULL
      WHERE provider_account_id = ${duplicate.provider_account_id}
    `;
    await ensureAnonymousUsername(sql, duplicate.provider_account_id);
  }
}

function generateAnonymousUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 9000) + 1000;

  return `${adjective}-${noun}-${suffix}`;
}

function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (error as { code?: string }).code === "23505";
}

function mapUserRecord(row?: UserRecordRow) {
  if (!row || !row.anonymous_username) {
    throw new Error("Anonymous user record is missing required fields");
  }

  return {
    anonymousId: row.anonymous_id,
    anonymousUsername: row.anonymous_username,
    blocked: row.blocked,
    organizationId: row.organization_id,
    teamId: row.team_id,
  } satisfies UserRecord;
}
