import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { comments, InsertUser, likes, posts, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getAllPosts(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category && category !== "all") {
    return db.select().from(posts)
      .where(and(eq(posts.published, true), eq(posts.category, category as "wildlife" | "landscape" | "street" | "other")))
      .orderBy(desc(posts.createdAt));
  }
  return db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
}

export async function getAllPostsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}

export async function createPost(data: {
  type: "photo" | "video";
  title: string;
  caption?: string;
  category: "wildlife" | "landscape" | "street" | "other";
  imageUrl?: string;
  imageKey?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  videoUrl?: string;
  videoKey?: string;
  location?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(posts).values({ ...data, published: true });
  return result;
}

export async function updatePost(id: number, data: Partial<{
  title: string;
  caption: string;
  category: "wildlife" | "landscape" | "street" | "other";
  imageUrl: string;
  imageKey: string;
  youtubeUrl: string;
  youtubeId: string;
  videoUrl: string;
  videoKey: string;
  location: string;
  published: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(posts).set(data).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(likes).where(eq(likes.postId, id));
  await db.delete(comments).where(eq(comments.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export async function getLikeCounts(postIds: number[]) {
  const db = await getDb();
  if (!db || postIds.length === 0) return {} as Record<number, number>;
  const result = await db.select({ postId: likes.postId, count: sql<number>`count(*)` })
    .from(likes)
    .where(sql`${likes.postId} IN (${sql.join(postIds.map(id => sql`${id}`), sql`, `)})`)
    .groupBy(likes.postId);
  const map: Record<number, number> = {};
  for (const row of result) map[row.postId] = Number(row.count);
  return map;
}

export async function hasUserLiked(postId: number, userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) return false;
  const conditions: any[] = [eq(likes.postId, postId)];
  if (userId) conditions.push(eq(likes.userId, userId));
  else if (sessionId) conditions.push(eq(likes.sessionId, sessionId));
  else return false;
  const result = await db.select().from(likes).where(and(...conditions)).limit(1);
  return result.length > 0;
}

export async function toggleLike(postId: number, userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const already = await hasUserLiked(postId, userId, sessionId);
  if (already) {
    const conditions: any[] = [eq(likes.postId, postId)];
    if (userId) conditions.push(eq(likes.userId, userId));
    else if (sessionId) conditions.push(eq(likes.sessionId, sessionId));
    await db.delete(likes).where(and(...conditions));
    return false;
  } else {
    await db.insert(likes).values({ postId, userId: userId ?? null, sessionId: sessionId ?? null });
    return true;
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
}

export async function addComment(postId: number, content: string, userId?: number, guestName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(comments).values({ postId, content, userId: userId ?? null, guestName: guestName ?? null });
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(comments).where(eq(comments.id, id));
}
