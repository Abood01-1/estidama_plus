import { and, desc, eq, sql } from "drizzle-orm";
import {
  dailyChallenges,
  ecoTransactions,
  userChallengeProgress,
  type Badge,
  type DailyChallenge,
} from "../drizzle/schema";
import { getDb } from "./db";

export async function getEcoBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const rows = await db
      .select({ balance: sql<number | null>`COALESCE(SUM(${ecoTransactions.amount}), 0)` })
      .from(ecoTransactions)
      .where(eq(ecoTransactions.userId, userId));
    return Number(rows[0]?.balance ?? 0);
  } catch (error) {
    console.error("Error getting eco balance:", error);
    return 0;
  }
}

export async function awardEcoCoins(
  userId: number,
  amount: number,
  source: string,
  description?: string | null
): Promise<void> {
  if (!Number.isFinite(amount) || Math.trunc(amount) === 0) return;
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(ecoTransactions).values({
      userId,
      amount: Math.trunc(amount),
      source: source.slice(0, 64),
      description: description ?? null,
    });
  } catch (error) {
    console.error("Error awarding eco coins:", error);
  }
}

export async function getRecentEcoTransactions(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(ecoTransactions)
      .where(eq(ecoTransactions.userId, userId))
      .orderBy(desc(ecoTransactions.id))
      .limit(Math.min(Math.max(limit, 1), 50));
  } catch (error) {
    console.error("Error getting eco transactions:", error);
    return [];
  }
}


export const CHALLENGE_RULES: Record<string, { target: number; reward: number; icon: string; difficulty: string }> = {
  transport: { target: 100, reward: 150, icon: "🚗", difficulty: "سهل" },
  electricity: { target: 100, reward: 200, icon: "💡", difficulty: "متوسط" },
  water: { target: 100, reward: 120, icon: "💧", difficulty: "متوسط" },
  food: { target: 100, reward: 100, icon: "🥗", difficulty: "سهل" },
  waste: { target: 100, reward: 180, icon: "♻️", difficulty: "صعب" },
  carbon: { target: 100, reward: 150, icon: "🌱", difficulty: "متوسط" },
  education: { target: 100, reward: 80, icon: "📚", difficulty: "سهل" },
  default: { target: 100, reward: 100, icon: "🎯", difficulty: "متوسط" },
};

export function challengeRuleFor(challenge: Pick<DailyChallenge, "category" | "reward" | "targetReduction">) {
  const fallback = CHALLENGE_RULES[challenge.category ?? ""] ?? CHALLENGE_RULES.default;
  return {
    reward: (challenge.reward ?? 0) > 0 ? (challenge.reward as number) : fallback.reward,
    target: (challenge.targetReduction ?? 0) > 0 ? (challenge.targetReduction as number) : fallback.target,
    icon: fallback.icon,
    difficulty: fallback.difficulty,
  };
}

export async function getTodayChallenges(): Promise<DailyChallenge[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const rows = await db.select().from(dailyChallenges).orderBy(dailyChallenges.id);
    return rows.filter((c) => {
      if (c.startDate && c.startDate > now) return false;
      if (c.endDate && c.endDate < startOfToday) return false;
      return true;
    });
  } catch (error) {
    console.error("Error getting today challenges:", error);
    return [];
  }
}

export async function getUserChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(userChallengeProgress)
      .where(eq(userChallengeProgress.userId, userId))
      .orderBy(desc(userChallengeProgress.id));
  } catch (error) {
    console.error("Error getting challenge progress:", error);
    return [];
  }
}

export async function startChallengeProgress(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db
    .select()
    .from(userChallengeProgress)
    .where(and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.challengeId, challengeId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(userChallengeProgress).values({ userId, challengeId, progress: 0 });
  const created = await db
    .select()
    .from(userChallengeProgress)
    .where(and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.challengeId, challengeId)))
    .limit(1);
  return created[0];
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export async function getChallengeStreak(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const rows = await db
      .select({ completedAt: userChallengeProgress.completedAt })
      .from(userChallengeProgress)
      .where(and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.completed, 1)));
    const days = new Set<string>();
    for (const r of rows) {
      if (r.completedAt) days.add(dayKey(new Date(r.completedAt)));
    }
    if (days.size === 0) return 0;
    const sorted = Array.from(days).sort();
    let streak = 1;
    let cursor = parseDayKey(sorted[sorted.length - 1]);
    for (let i = sorted.length - 2; i >= 0; i--) {
      const prev = parseDayKey(sorted[i]);
      const diffDays = Math.round((cursor.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) { streak += 1; cursor = prev; }
      else if (diffDays === 0) { continue; }
      else { break; }
    }
    return streak;
  } catch (error) {
    console.error("Error computing streak:", error);
    return 0;
  }
}

export type CompleteChallengeResult = {
  completed: boolean;
  alreadyCompleted: boolean;
  coinsEarned: number;
  balance: number;
  streak: number;
  newBadges: Badge[];
};

export async function completeChallenge(
  userId: number,
  challengeId: number,
  checkAndAwardBadges: (userId: number) => Promise<Badge[]>
): Promise<CompleteChallengeResult> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const challenges = await db
    .select()
    .from(dailyChallenges)
    .where(eq(dailyChallenges.id, challengeId))
    .limit(1);
  const challenge = challenges[0];
  if (!challenge) throw new Error("Challenge not found");
  const rule = challengeRuleFor(challenge);
  const rows = await db
    .select()
    .from(userChallengeProgress)
    .where(and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.challengeId, challengeId)))
    .limit(1);
  let progress = rows[0];
  if (!progress) progress = await startChallengeProgress(userId, challengeId);
  const currentProgress = progress.progress ?? 0;
  const isCompleted = (progress.completed ?? 0) === 1;
  if (isCompleted) {
    if ((progress.rewardClaimed ?? 0) === 0) {
      await awardEcoCoins(userId, rule.reward, "challenge", `مكافأة تحدي: ${challenge.title}`);
      await db.update(userChallengeProgress).set({ rewardClaimed: 1 }).where(eq(userChallengeProgress.id, progress.id));
    }
    const [balance, streak, newBadges] = await Promise.all([
      getEcoBalance(userId), getChallengeStreak(userId), checkAndAwardBadges(userId),
    ]);
    return { completed: true, alreadyCompleted: true, coinsEarned: 0, balance, streak, newBadges };
  }
  if (currentProgress < rule.target) {
    const [balance, streak] = await Promise.all([getEcoBalance(userId), getChallengeStreak(userId)]);
    return { completed: false, alreadyCompleted: false, coinsEarned: 0, balance, streak, newBadges: [] };
  }
  const now = new Date();
  await db
    .update(userChallengeProgress)
    .set({ completed: 1, completedAt: now, rewardClaimed: 1 })
    .where(eq(userChallengeProgress.id, progress.id));
  await awardEcoCoins(userId, rule.reward, "challenge", `مكافأة تحدي: ${challenge.title}`);
  const [balance, streak, newBadges] = await Promise.all([
    getEcoBalance(userId), getChallengeStreak(userId), checkAndAwardBadges(userId),
  ]);
  return { completed: true, alreadyCompleted: false, coinsEarned: rule.reward, balance, streak, newBadges };
}

