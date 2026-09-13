import { eq, and, desc } from "drizzle-orm";
import {
  userPoints,
  userBadges,
  badges,
  carbonRecords,
  userChallengeProgress,
  type Badge,
} from "../drizzle/schema";
import { getDb } from "./db";

/** Single source of truth for level: derived from lifetime totalPoints. */
export function calculateLevel(totalPoints: number): number {
  return Math.floor(Math.max(0, totalPoints) / 500) + 1;
}

// Points calculation
export async function calculatePoints(
  userId: number,
  carbonData: {
    transport: number;
    electricity: number;
    water: number;
    food: number;
    waste: number;
  }
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    // Get previous record
    const previousRecords = await db
      .select()
      .from(carbonRecords)
      .where(eq(carbonRecords.userId, userId))
      .orderBy((t) => t.recordedAt)
      .limit(1);

    const previousTotal = previousRecords[0]?.total || 0;
    const currentTotal = Object.values(carbonData).reduce((a, b) => a + b, 0);

    // Calculate reduction
    const reduction = previousTotal - currentTotal;
    let points = 0;

    if (reduction > 0) {
      // Reward for reduction
      points = Math.floor(reduction * 10); // 10 points per kg CO2 reduced
    } else if (reduction === 0) {
      // Maintenance bonus
      points = 25;
    } else {
      // Penalty for increase
      points = Math.max(0, 10 + Math.floor(reduction * 5));
    }

    return Math.max(0, points);
  } catch (error) {
    console.error("Error calculating points:", error);
    return 0;
  }
}

// Update user points
export async function updateUserPoints(userId: number, pointsEarned: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const existingPoints = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId));

    if (existingPoints.length > 0) {
      const current = existingPoints[0];
      const newTotal = current.totalPoints + pointsEarned;
      const newLevel = calculateLevel(newTotal);

      await db
        .update(userPoints)
        .set({
          points: pointsEarned,
          totalPoints: newTotal,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(userPoints.userId, userId));
    } else {
      await db.insert(userPoints).values({
        userId,
        points: pointsEarned,
        totalPoints: pointsEarned,
        level: calculateLevel(pointsEarned),
      });
    }
  } catch (error) {
    console.error("Error updating user points:", error);
  }
}

// Check and award badges — server-side only.
// The `badges` table is the single source of truth: every badge type
// (points / reduction / streak / special) is read from the DB, never hardcoded.
// Returns the full badge rows that were newly awarded (for notifications).
export async function checkAndAwardBadges(userId: number): Promise<Badge[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const userPointsData = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId));

    if (userPointsData.length === 0) return [];

    const currentPoints = userPointsData[0].totalPoints;
    const currentLevel = userPointsData[0].level;

    // All badge definitions come from the DB.
    const allBadges = await db.select().from(badges);
    if (allBadges.length === 0) return [];

    // Already-earned badge ids — prevents duplicate user_badges records
    // without one query per badge.
    const earnedRows = await db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    const earnedIds = new Set(earnedRows.map((r) => r.badgeId));

    // Reduction % = (earliest total - latest total) / earliest total * 100,
    // using actual carbon_records ordered by insertion (id). Null when fewer
    // than 2 records exist.
    let reductionPct: number | null = null;
    try {
      const records = await db
        .select()
        .from(carbonRecords)
        .where(eq(carbonRecords.userId, userId))
        .orderBy((t) => t.id);
      if (records.length >= 2) {
        const earliest = records[0].total ?? 0;
        const latest = records[records.length - 1].total ?? 0;
        if (earliest > 0) {
          reductionPct = ((earliest - latest) / earliest) * 100;
        }
      }
    } catch {
      reductionPct = null;
    }

    // Completed challenge count + TRUE streak from actual completion days.
    // Streak = consecutive calendar days with >= 1 completed challenge.
    let completedChallenges = 0;
    let trueStreak = 0;
    try {
      const progress = await db
        .select()
        .from(userChallengeProgress)
        .where(eq(userChallengeProgress.userId, userId));
      completedChallenges = progress.filter((p) => (p.completed ?? 0) > 0).length;
      const days = new Set<string>();
      for (const p of progress) {
        if ((p.completed ?? 0) > 0 && p.completedAt) {
          const d = new Date(p.completedAt);
          days.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        }
      }
      if (days.size > 0) {
        const sorted = Array.from(days).sort();
        const parse = (k: string) => {
          const [y, m, d] = k.split("-").map(Number);
          return new Date(y, (m ?? 1) - 1, d ?? 1);
        };
        let streak = 1;
        let cursor = parse(sorted[sorted.length - 1]);
        for (let i = sorted.length - 2; i >= 0; i--) {
          const prev = parse(sorted[i]);
          const diff = Math.round((cursor.getTime() - prev.getTime()) / 86400000);
          if (diff === 1) { streak += 1; cursor = prev; }
          else if (diff !== 0) { break; }
        }
        trueStreak = streak;
      }
    } catch {
      completedChallenges = 0;
      trueStreak = 0;
    }

    const newlyAwarded: Badge[] = [];

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      let shouldAward = false;
      const requirement = badge.requirement ?? 0;

      if (badge.type === "points" && currentPoints >= requirement) {
        shouldAward = true;
      } else if (badge.type === "special" && currentLevel >= requirement) {
        shouldAward = true;
      } else if (
        badge.type === "reduction" &&
        reductionPct !== null &&
        reductionPct >= requirement
      ) {
        shouldAward = true;
      } else if (badge.type === "streak" && trueStreak >= requirement) {
        shouldAward = true;
      } else if (badge.type === "special" && completedChallenges >= requirement) {
        // Legacy special badges that counted raw completions keep working,
        // but streak badges now use the TRUE consecutive-day streak.
        shouldAward = true;
      }

      if (shouldAward) {
        // Re-check inside the loop so concurrent calls can't double-award.
        const alreadyEarned = await db
          .select()
          .from(userBadges)
          .where(
            and(
              eq(userBadges.userId, userId),
              eq(userBadges.badgeId, badge.id)
            )
          );

        if (alreadyEarned.length === 0) {
          await db.insert(userBadges).values({
            userId,
            badgeId: badge.id,
          });
          earnedIds.add(badge.id);
          newlyAwarded.push(badge);
        }
      }
    }

    return newlyAwarded;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
}

// Get user achievements
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return { points: null, badges: [] };

  try {
    const userPointsData = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId));

    const userBadgesData = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    return {
      points: userPointsData[0] || null,
      badges: userBadgesData,
    };
  } catch (error) {
    console.error("Error getting user achievements:", error);
    return { points: null, badges: [] };
  }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const leaderboard = await db
      .select()
      .from(userPoints)
      .orderBy(desc(userPoints.totalPoints))
      .limit(limit);

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
}
