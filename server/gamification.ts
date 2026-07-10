import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { userPoints, userBadges, badges, carbonRecords } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
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

// Badge definitions
export const BADGE_DEFINITIONS = [
  {
    name: "البداية الخضراء",
    description: "حقق أول 100 نقطة",
    icon: "🌱",
    requirement: 100,
    type: "points" as const,
    color: "#00ff00",
  },
  {
    name: "محارب الاستدامة",
    description: "جمع 500 نقطة",
    icon: "⚔️",
    requirement: 500,
    type: "points" as const,
    color: "#ff007f",
  },
  {
    name: "بطل الكوكب",
    description: "جمع 1000 نقطة",
    icon: "🌍",
    requirement: 1000,
    type: "points" as const,
    color: "#00ffff",
  },
  {
    name: "مقلل الانبعاثات",
    description: "قلل بصمتك بنسبة 20%",
    icon: "📉",
    requirement: 20,
    type: "reduction" as const,
    color: "#ffff00",
  },
  {
    name: "الرياح الخضراء",
    description: "أكمل 7 تحديات متتالية",
    icon: "💨",
    requirement: 7,
    type: "streak" as const,
    color: "#00ff7f",
  },
  {
    name: "سفير الاستدامة",
    description: "وصل إلى المستوى 10",
    icon: "👑",
    requirement: 10,
    type: "special" as const,
    color: "#ff00ff",
  },
];

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
      const newLevel = Math.floor(newTotal / 500) + 1;

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
        level: 1,
      });
    }
  } catch (error) {
    console.error("Error updating user points:", error);
  }
}

// Check and award badges
export async function checkAndAwardBadges(userId: number) {
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

    const earnedBadges: string[] = [];

    // Check each badge requirement
    for (const badgeDef of BADGE_DEFINITIONS) {
      let shouldAward = false;

      if (badgeDef.type === "points" && currentPoints >= badgeDef.requirement) {
        shouldAward = true;
      } else if (badgeDef.type === "special" && currentLevel >= badgeDef.requirement) {
        shouldAward = true;
      }

      if (shouldAward) {
        // Check if already earned
        const existingBadge = await db
          .select()
          .from(badges)
          .where(
            and(
              eq(badges.name, badgeDef.name),
              eq(badges.type, badgeDef.type)
            )
          );

        if (existingBadge.length > 0) {
          const badgeId = existingBadge[0].id;
          const userBadgeExists = await db
            .select()
            .from(userBadges)
            .where(
              and(
                eq(userBadges.userId, userId),
                eq(userBadges.badgeId, badgeId)
              )
            );

          if (userBadgeExists.length === 0) {
            await db.insert(userBadges).values({
              userId,
              badgeId,
            });
            earnedBadges.push(badgeDef.name);
          }
        }
      }
    }

    return earnedBadges;
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
      .orderBy((t) => t.totalPoints)
      .limit(limit);

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
}
