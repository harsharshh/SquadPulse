import { randomUUID } from "crypto";

import { getDbClient } from "@/lib/db";

type UserRecordRow = {
  anonymous_id: string;
  anonymous_username: string | null;
  blocked: boolean;
};

export type UserRecord = {
  anonymousId: string;
  anonymousUsername: string;
  blocked: boolean;
};

type EnsureUserParams = {
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
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

let schemaInitialized = false;

export async function ensureUserRecord(params: EnsureUserParams): Promise<UserRecord> {
  const sql = getDbClient();

  await ensureSchema(sql);

  const existingUser = await sql<UserRecordRow[]>`
    SELECT anonymous_id, anonymous_username, blocked
    FROM users
    WHERE provider_account_id = ${params.providerAccountId}
    LIMIT 1
  `;

  if (existingUser.length) {
    const ensuredRow = await ensureAnonymousUsername(sql, params.providerAccountId);
    const [updatedUser] = await sql<UserRecordRow[]>`
      UPDATE users
      SET email = ${params.email ?? null},
          name = ${params.name ?? null},
          image = ${params.image ?? null},
          updated_at = NOW()
      WHERE provider_account_id = ${params.providerAccountId}
      RETURNING anonymous_id, anonymous_username, blocked
    `;

    return mapUserRecord(updatedUser ?? ensuredRow);
  }

  return createUserRecord(sql, params);
}

export async function getUserRecord(providerAccountId: string): Promise<UserRecord | null> {
  const sql = getDbClient();

  await ensureSchema(sql);

  const rows = await sql<UserRecordRow[]>`
    SELECT anonymous_id, anonymous_username, blocked
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

async function ensureSchema(sql: ReturnType<typeof getDbClient>) {
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS anonymous_username TEXT UNIQUE
  `;

  await backfillMissingUsernames(sql);
  await resolveDuplicateUsernames(sql);

  schemaInitialized = true;
}

async function createUserRecord(
  sql: ReturnType<typeof getDbClient>,
  params: EnsureUserParams,
): Promise<UserRecord> {
  const anonymousId = randomUUID();

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
    const anonymousUsername = generateAnonymousUsername();

    try {
      const [createdUser] = await sql<UserRecordRow[]>`
        INSERT INTO users (
          provider_account_id,
          email,
          name,
          image,
          anonymous_id,
          blocked,
          anonymous_username
        )
        VALUES (
          ${params.providerAccountId},
          ${params.email ?? null},
          ${params.name ?? null},
          ${params.image ?? null},
          ${anonymousId},
          FALSE,
          ${anonymousUsername}
        )
        RETURNING anonymous_id, anonymous_username, blocked
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
  sql: ReturnType<typeof getDbClient>,
  providerAccountId: string,
  existingRow?: UserRecordRow,
) {
  const currentRow = existingRow ?? (await fetchUserRow(sql, providerAccountId));

  if (currentRow?.anonymous_username) {
    return currentRow;
  }

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
    const anonymousUsername = generateAnonymousUsername();

    try {
      const [updatedRow] = await sql<UserRecordRow[]>`
        UPDATE users
        SET anonymous_username = ${anonymousUsername},
            updated_at = NOW()
        WHERE provider_account_id = ${providerAccountId}
          AND (anonymous_username IS NULL OR anonymous_username = '')
        RETURNING anonymous_id, anonymous_username, blocked
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
  sql: ReturnType<typeof getDbClient>,
  providerAccountId: string,
) {
  const [row] = await sql<UserRecordRow[]>`
    SELECT anonymous_id, anonymous_username, blocked
    FROM users
    WHERE provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  return row;
}

async function backfillMissingUsernames(sql: ReturnType<typeof getDbClient>) {
  const rows = await sql<{ provider_account_id: string }[]>`
    SELECT provider_account_id
    FROM users
    WHERE anonymous_username IS NULL OR anonymous_username = ''
  `;

  for (const row of rows) {
    await ensureAnonymousUsername(sql, row.provider_account_id);
  }
}

async function resolveDuplicateUsernames(sql: ReturnType<typeof getDbClient>) {
  const duplicates = await sql<
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
    await sql`
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
  } satisfies UserRecord;
}
