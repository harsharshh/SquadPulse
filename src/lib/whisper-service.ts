import { randomUUID } from "crypto";

import { getDbClient } from "@/lib/db";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/organization-constants";

type SqlClient = ReturnType<typeof getDbClient>;

const VALID_CATEGORIES = ["general", "praise", "concern", "idea", "fun"] as const;

export type WhisperCategory = (typeof VALID_CATEGORIES)[number];

type WhisperRow = {
  id: string;
  provider_account_id: string;
  team_id: string | null;
  organization_id: string;
  category: WhisperCategory;
  content: string;
  shares: number;
  created_at: string;
  updated_at: string;
  anonymous_username: string | null;
  likes_count: number;
  liked_by_me: boolean;
};

type WhisperCommentRow = {
  id: string;
  whisper_id: string;
  provider_account_id: string;
  content: string;
  created_at: string;
  anonymous_username: string | null;
};

type ParticipantRow = {
  provider_account_id: string;
  anonymous_username: string | null;
  last_activity: string;
};

export type WhisperComment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

export type WhisperPost = {
  id: string;
  text: string;
  timestamp: string;
  updatedAt: string;
  category: WhisperCategory;
  likes: number;
  shares: number;
  comments: WhisperComment[];
  likedByMe: boolean;
  mine: boolean;
  author: string;
  organizationId: string;
};

export type WhisperStats = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  categoryCounts: Record<WhisperCategory, number>;
};

export type WhisperParticipant = {
  id: string;
  name: string;
};

export type WhisperWallData = {
  organizationId: string;
  whispers: WhisperPost[];
  stats: WhisperStats;
  participants: WhisperParticipant[];
};

const schemaState = {
  initialized: false,
};

const createQuery = (sql: SqlClient) => <T>(strings: TemplateStringsArray, ...values: unknown[]) =>
  sql(strings, ...values) as unknown as Promise<T>;

function normalizeCategory(category: string | null | undefined): WhisperCategory {
  if (!category) return "general";
  const lower = category.toLowerCase();
  return (VALID_CATEGORIES.find((item) => item === lower) ?? "general") as WhisperCategory;
}

async function ensureSchema() {
  if (schemaState.initialized) {
    return;
  }

  const sql = getDbClient();

  await sql`
    CREATE TABLE IF NOT EXISTS whisper_posts (
      id TEXT PRIMARY KEY,
      provider_account_id TEXT NOT NULL,
      team_id TEXT,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      shares INTEGER NOT NULL DEFAULT 0,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE whisper_posts
    ADD COLUMN IF NOT EXISTS team_id TEXT,
    ADD COLUMN IF NOT EXISTS shares INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    UPDATE whisper_posts
    SET organization_id = ${DEFAULT_ORGANIZATION_ID}
    WHERE organization_id IS NULL
  `;

  await sql`
    ALTER TABLE whisper_posts
    ALTER COLUMN organization_id SET NOT NULL
  `;

  await sql`
    ALTER TABLE whisper_posts
    ALTER COLUMN category SET DATA TYPE TEXT,
    ALTER COLUMN content SET NOT NULL,
    ALTER COLUMN provider_account_id SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_whisper_posts_team_created_at
      ON whisper_posts (team_id, created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_whisper_posts_org_created_at
      ON whisper_posts (organization_id, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whisper_likes (
      whisper_id TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (whisper_id, provider_account_id)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_whisper_likes_whisper_id
      ON whisper_likes (whisper_id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whisper_comments (
      id TEXT PRIMARY KEY,
      whisper_id TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_whisper_comments_whisper_id
      ON whisper_comments (whisper_id, created_at ASC)
  `;

  schemaState.initialized = true;
}

type WallQueryParams = {
  providerAccountId: string;
  organizationId?: string | null;
  teamId?: string | null;
  categories?: WhisperCategory[];
  limit?: number;
};

export async function getWhisperWallData(params: WallQueryParams): Promise<WhisperWallData> {
  await ensureSchema();

  const sql = getDbClient();
  const query = createQuery(sql);
  const limit = params.limit ?? 50;
  const organizationId = params.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const teamId = params.teamId ?? null;
  const categories = params.categories?.length ? params.categories.map(normalizeCategory) : [];
  const categoryFilter = categories.length ? sql`AND w.category = ANY(${categories}::text[])` : sql``;

  const posts = await query<WhisperRow[]>`
    SELECT
      w.id,
      w.provider_account_id,
      w.team_id,
      w.organization_id,
      w.category::text AS category,
      w.content,
      w.shares,
      w.created_at,
      w.updated_at,
      u.anonymous_username,
      COALESCE(COUNT(DISTINCT wl.provider_account_id), 0)::int AS likes_count,
      COALESCE(COUNT(wl.provider_account_id) FILTER (WHERE wl.provider_account_id = ${params.providerAccountId}), 0) > 0 AS liked_by_me
    FROM whisper_posts w
    LEFT JOIN whisper_likes wl ON wl.whisper_id = w.id
    LEFT JOIN users u ON u.provider_account_id = w.provider_account_id
    WHERE (${organizationId}::text IS NULL OR w.organization_id = ${organizationId})
      ${teamId ? sql`AND w.team_id = ${teamId}` : sql``}
      ${categoryFilter}
    GROUP BY w.id, u.anonymous_username
    ORDER BY w.created_at DESC
    LIMIT ${limit}
  `;

  const postIds = posts.map((row) => row.id);

  const comments = postIds.length
    ? await query<WhisperCommentRow[]>`
        SELECT
          c.id,
          c.whisper_id,
          c.provider_account_id,
          c.content,
          c.created_at,
          u.anonymous_username
        FROM whisper_comments c
        LEFT JOIN users u ON u.provider_account_id = c.provider_account_id
        WHERE c.whisper_id = ANY(${postIds}::text[])
        ORDER BY c.created_at ASC
      `
    : [];

  const commentsByPost = new Map<string, WhisperComment[]>();
  for (const comment of comments) {
    const list = commentsByPost.get(comment.whisper_id) ?? [];
    list.push({
      id: comment.id,
      author: comment.anonymous_username ?? "Anonymous",
      text: comment.content,
      timestamp: comment.created_at,
    });
    commentsByPost.set(comment.whisper_id, list);
  }

  const whispers: WhisperPost[] = posts.map((row) => ({
    id: row.id,
    text: row.content,
    timestamp: row.created_at,
    updatedAt: row.updated_at,
    category: normalizeCategory(row.category),
    likes: row.likes_count,
    shares: row.shares,
    comments: commentsByPost.get(row.id) ?? [],
    likedByMe: row.liked_by_me,
    mine: row.provider_account_id === params.providerAccountId,
    author: row.anonymous_username ?? "Anonymous",
    organizationId: row.organization_id,
  }));

  const statsRow = await query<
    Array<{
      total_posts: string;
      total_likes: string;
      total_comments: string;
      total_shares: string;
    }>
  >`
    SELECT
      (SELECT COUNT(*) FROM whisper_posts WHERE (${organizationId}::text IS NULL OR organization_id = ${organizationId}))::text AS total_posts,
      (SELECT COUNT(*)
        FROM whisper_likes wl
        JOIN whisper_posts w2 ON w2.id = wl.whisper_id
        WHERE (${organizationId}::text IS NULL OR w2.organization_id = ${organizationId})
      )::text AS total_likes,
      (SELECT COUNT(*)
        FROM whisper_comments wc
        JOIN whisper_posts w3 ON w3.id = wc.whisper_id
        WHERE (${organizationId}::text IS NULL OR w3.organization_id = ${organizationId})
      )::text AS total_comments,
      (SELECT COALESCE(SUM(shares), 0)
        FROM whisper_posts
        WHERE (${organizationId}::text IS NULL OR organization_id = ${organizationId})
      )::text AS total_shares
  `;

  const categoryCountsRows = await query<Array<{ category: string | null; count: string }>>`
    SELECT
      w.category::text AS category,
      COUNT(*)::text AS count
    FROM whisper_posts w
    WHERE (${organizationId}::text IS NULL OR w.organization_id = ${organizationId})
    GROUP BY w.category
  `;

  const categoryCounts: Record<WhisperCategory, number> = {
    general: 0,
    praise: 0,
    concern: 0,
    idea: 0,
    fun: 0,
  };

  for (const row of categoryCountsRows) {
    const key = normalizeCategory(row.category);
    categoryCounts[key] = Number(row.count);
  }

  const stats: WhisperStats = {
    totalPosts: Number(statsRow[0]?.total_posts ?? 0),
    totalLikes: Number(statsRow[0]?.total_likes ?? 0),
    totalComments: Number(statsRow[0]?.total_comments ?? 0),
    totalShares: Number(statsRow[0]?.total_shares ?? 0),
    categoryCounts,
  };

  const participantsRows = await query<ParticipantRow[]>`
    WITH activity AS (
      SELECT provider_account_id, created_at FROM whisper_posts WHERE (${organizationId}::text IS NULL OR organization_id = ${organizationId})
      UNION ALL
      SELECT wc.provider_account_id, wc.created_at
      FROM whisper_comments wc
      JOIN whisper_posts wp ON wp.id = wc.whisper_id
      WHERE (${organizationId}::text IS NULL OR wp.organization_id = ${organizationId})
    ),
    ranked AS (
      SELECT
        provider_account_id,
        MAX(created_at) AS last_activity
      FROM activity
      GROUP BY provider_account_id
      ORDER BY MAX(created_at) DESC
      LIMIT 32
    )
    SELECT
      r.provider_account_id,
      r.last_activity,
      u.anonymous_username
    FROM ranked r
    LEFT JOIN users u ON u.provider_account_id = r.provider_account_id
    ORDER BY r.last_activity DESC
  `;

  const participants: WhisperParticipant[] = participantsRows.map((row) => ({
    id: row.provider_account_id,
    name: row.anonymous_username ?? "Anonymous",
  }));

  return { organizationId, whispers, stats, participants };
}

type CreateWhisperParams = {
  providerAccountId: string;
  content: string;
  category: string;
  organizationId?: string | null;
  teamId?: string | null;
};

export async function createWhisper(params: CreateWhisperParams) {
  await ensureSchema();
  const sql = getDbClient();
  const query = createQuery(sql);

  const trimmed = params.content.trim();
  if (!trimmed) {
    throw new Error("Whisper content cannot be empty");
  }

  const category = normalizeCategory(params.category);
  const organizationId = params.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const id = randomUUID();

  const [row] = await query<WhisperRow[]>`
    INSERT INTO whisper_posts (id, provider_account_id, team_id, category, content, organization_id)
    VALUES (${id}, ${params.providerAccountId}, ${params.teamId ?? null}, ${category}, ${trimmed}, ${organizationId})
    RETURNING
      id,
      provider_account_id,
      team_id,
      organization_id,
      category::text AS category,
      content,
      shares,
      created_at,
      updated_at,
      0::int AS likes_count,
      FALSE AS liked_by_me,
      (SELECT anonymous_username FROM users WHERE provider_account_id = whisper_posts.provider_account_id) AS anonymous_username
  `;

  return {
    id: row.id,
    text: row.content,
    timestamp: row.created_at,
    updatedAt: row.updated_at,
    category,
    likes: 0,
    shares: row.shares,
    comments: [],
    likedByMe: false,
    mine: true,
    author: row.anonymous_username ?? "Anonymous",
    organizationId: row.organization_id,
  } satisfies WhisperPost;
}

type UpdateWhisperParams = {
  providerAccountId: string;
  whisperId: string;
  content?: string;
  category?: string;
  organizationId?: string | null;
};

export async function updateWhisper(params: UpdateWhisperParams) {
  await ensureSchema();
  const sql = getDbClient();
  const query = createQuery(sql);

  const category = params.category ? normalizeCategory(params.category) : null;
  const content = params.content?.trim();

  const [row] = await query<WhisperRow[]>`
    UPDATE whisper_posts
    SET
      content = COALESCE(${content ?? null}, content),
      category = COALESCE(${category}, category),
      organization_id = COALESCE(${params.organizationId ?? null}, organization_id),
      updated_at = NOW()
    WHERE id = ${params.whisperId} AND provider_account_id = ${params.providerAccountId}
    RETURNING
      id,
      provider_account_id,
      team_id,
      organization_id,
      category::text AS category,
      content,
      shares,
      created_at,
      updated_at,
      (SELECT COUNT(*) FROM whisper_likes WHERE whisper_id = whisper_posts.id)::int AS likes_count,
      EXISTS(
        SELECT 1 FROM whisper_likes WHERE whisper_id = whisper_posts.id AND provider_account_id = ${params.providerAccountId}
      ) AS liked_by_me,
      (SELECT anonymous_username FROM users WHERE provider_account_id = whisper_posts.provider_account_id) AS anonymous_username
  `;

  if (!row) {
    throw new Error("Whisper not found or you do not have permission to update it");
  }

  return {
    id: row.id,
    text: row.content,
    timestamp: row.created_at,
    updatedAt: row.updated_at,
    category: normalizeCategory(row.category),
    likes: row.likes_count,
    shares: row.shares,
    comments: [],
    likedByMe: row.liked_by_me,
    mine: true,
    author: row.anonymous_username ?? "Anonymous",
    organizationId: row.organization_id,
  } satisfies WhisperPost;
}

export async function deleteWhisper(whisperId: string, providerAccountId: string) {
  await ensureSchema();
  const sql = getDbClient();
  const query = createQuery(sql);

  await query`
    DELETE FROM whisper_comments
    WHERE whisper_id = ${whisperId}
      AND EXISTS (
        SELECT 1
        FROM whisper_posts
        WHERE id = ${whisperId} AND provider_account_id = ${providerAccountId}
      )
  `;

  await query`
    DELETE FROM whisper_likes
    WHERE whisper_id = ${whisperId}
      AND EXISTS (
        SELECT 1
        FROM whisper_posts
        WHERE id = ${whisperId} AND provider_account_id = ${providerAccountId}
      )
  `;

  const deletedRows = await query<Array<{ id: string }>>`
    DELETE FROM whisper_posts
    WHERE id = ${whisperId} AND provider_account_id = ${providerAccountId}
    RETURNING id
  `;

  return deletedRows.length > 0;
}

export async function toggleWhisperLike(whisperId: string, providerAccountId: string) {
  await ensureSchema();
  const sql = getDbClient();
  const query = createQuery(sql);

  const existing = await query<unknown[]>`
    SELECT 1
    FROM whisper_likes
    WHERE whisper_id = ${whisperId} AND provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  if (existing.length) {
    await query`
      DELETE FROM whisper_likes
      WHERE whisper_id = ${whisperId} AND provider_account_id = ${providerAccountId}
    `;
  } else {
    await query`
      INSERT INTO whisper_likes (whisper_id, provider_account_id)
      VALUES (${whisperId}, ${providerAccountId})
      ON CONFLICT DO NOTHING
    `;
  }

  const [row] = await query<Array<{ likes: string }>>`
    SELECT COUNT(*)::text AS likes
    FROM whisper_likes
    WHERE whisper_id = ${whisperId}
  `;

  return {
    liked: !existing.length,
    likes: Number(row?.likes ?? 0),
  };
}

type AddCommentParams = {
  whisperId: string;
  providerAccountId: string;
  content: string;
};

export async function addWhisperComment(params: AddCommentParams) {
  await ensureSchema();
  const sql = getDbClient();
  const query = createQuery(sql);

  const trimmed = params.content.trim();
  if (!trimmed) {
    throw new Error("Comment cannot be empty");
  }

  const id = randomUUID();

  const [row] = await query<WhisperCommentRow[]>`
    INSERT INTO whisper_comments (id, whisper_id, provider_account_id, content)
    VALUES (${id}, ${params.whisperId}, ${params.providerAccountId}, ${trimmed})
    RETURNING
      id,
      whisper_id,
      provider_account_id,
      content,
      created_at,
      (SELECT anonymous_username FROM users WHERE provider_account_id = whisper_comments.provider_account_id) AS anonymous_username
  `;

  return {
    id: row.id,
    author: row.anonymous_username ?? "Anonymous",
    text: row.content,
    timestamp: row.created_at,
  } satisfies WhisperComment;
}

export async function incrementWhisperShare(whisperId: string) {
  await ensureSchema();
  const sql = getDbClient();
  const query = createQuery(sql);

  const [row] = await query<Array<{ shares: number }>>`
    UPDATE whisper_posts
    SET shares = shares + 1, updated_at = NOW()
    WHERE id = ${whisperId}
    RETURNING shares
  `;

  return {
    shares: row?.shares ?? 0,
  };
}
