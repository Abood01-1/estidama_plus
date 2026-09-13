import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _loggedDbEnv = false;

// Safe diagnostic: logs only whether DATABASE_URL exists plus the
// hostname/database name. Never logs the URL, username, or password.
function logDbEnvOnce(): void {
  if (_loggedDbEnv) return;
  _loggedDbEnv = true;
  const raw = process.env.DATABASE_URL;
  console.log("[Database] DATABASE_URL EXISTS:", Boolean(raw));
  if (!raw) return;
  try {
    const parsed = new URL(raw);
    const dbName = parsed.pathname.replace(/^\//, "").split("/")[0] || "(unknown)";
    console.log("[Database] host:", parsed.hostname, "db:", dbName);
  } catch {
    console.log("[Database] host: (unparseable)");
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
//
// TiDB Cloud requires TLS. The stored DATABASE_URL carries the SSL intent as a
// URL query param in JSON form (ssl={"rejectUnauthorized":true}), which mysql2
// rejects as an unknown SSL profile. Strip any `ssl` query param from the URL
// and configure TLS explicitly via the mysql2 connection options instead.
// Host/user/password/database are always taken from process.env.DATABASE_URL.
export async function getDb() {
  logDbEnvOnce();
  if (!_db && process.env.DATABASE_URL) {
    try {
      const raw = process.env.DATABASE_URL;
      const parsed = new URL(raw);
      const database = parsed.pathname.replace(/^\//, "").split("/")[0];
      _db = drizzle({
        connection: {
          host: parsed.hostname,
          port: parsed.port ? Number(parsed.port) : 4000,
          user: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password),
          database: database || undefined,
          ssl: { rejectUnauthorized: true },
        },
      });
    } catch (error: unknown) {
      // Detailed init diagnostics only — never log DATABASE_URL or credentials.
      const err = error as { message?: unknown; code?: unknown; name?: unknown; stack?: unknown };
      const message = typeof err?.message === "string" ? err.message : String(error);
      const code = typeof err?.code === "string" || typeof err?.code === "number" ? err.code : undefined;
      const name = typeof err?.name === "string" ? err.name : undefined;
      const stack = typeof err?.stack === "string" ? err.stack : undefined;
      console.warn("[Database] Failed to initialize Drizzle");
      console.warn("[Database] error message:", message);
      if (code !== undefined) console.warn("[Database] error code:", code);
      if (name !== undefined) console.warn("[Database] error name:", name);
      if (stack !== undefined) console.warn("[Database] error stack:", stack);
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

// TODO: add feature queries here as your schema grows.
