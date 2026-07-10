import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User Points and Achievements
export const userPoints = mysqlTable("user_points", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  points: int("points").default(0).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  level: int("level").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

// Badges and Achievements
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  color: varchar("color", { length: 7 }).default("#ff007f"),
  requirement: int("requirement").notNull(),
  type: mysqlEnum("type", ["points", "reduction", "streak", "special"]).default("points"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

// User Badges (earned achievements)
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

// Carbon Footprint Records
export const carbonRecords = mysqlTable("carbon_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  transport: int("transport").default(0),
  electricity: int("electricity").default(0),
  water: int("water").default(0),
  food: int("food").default(0),
  waste: int("waste").default(0),
  total: int("total").default(0),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type CarbonRecord = typeof carbonRecords.$inferSelect;
export type InsertCarbonRecord = typeof carbonRecords.$inferInsert;

// Daily Challenges
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["transport", "electricity", "water", "food", "waste"]),
  targetReduction: int("targetReduction").notNull(),
  reward: int("reward").default(100).notNull(),
  startDate: timestamp("startDate").defaultNow(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;

// User Challenge Progress
export const userChallengeProgress = mysqlTable("user_challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  completed: int("completed").default(0),
  startedAt: timestamp("startedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type InsertUserChallengeProgress = typeof userChallengeProgress.$inferInsert;
