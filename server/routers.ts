import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generateAIRecommendations } from "./recommendations";
import { calculatePoints, updateUserPoints, checkAndAwardBadges, getUserAchievements, getLeaderboard } from "./gamification";
import {
  challengeRuleFor,
  completeChallenge,
  getChallengeStreak,
  getEcoBalance,
  getRecentEcoTransactions,
  getTodayChallenges,
  getUserChallengeProgress,
  startChallengeProgress,
} from "./challenges";
import { getDb } from "./db";
import { badges, carbonRecords, dailyChallenges, userChallengeProgress } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  recommendations: router({
    generate: protectedProcedure
      .input(z.object({
        transport: z.number(),
        electricity: z.number(),
        water: z.number(),
        food: z.number(),
        waste: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const recommendations = await generateAIRecommendations(
          input,
          {
            name: ctx.user?.name || undefined,
            location: 'الإمارات العربية المتحدة'
          }
        );
        return { recommendations };
      }),
  }),

  gamification: router({
    // Get all badges
    getAllBadges: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        try {
          const badgesData = await db.select().from(badges);
          return badgesData;
        } catch (error) {
          console.error("Error fetching badges:", error);
          return [];
        }
      }),

    // Save a carbon footprint record for the authenticated user, then award
    // points via the existing gamification system (Phase 2B).
    // userId is always taken from ctx.user — never from client input.
    // Points are computed server-side only; the client cannot award itself points.
    saveCarbonRecord: protectedProcedure
      .input(z.object({
        transport: z.number().min(0),
        electricity: z.number().min(0),
        water: z.number().min(0),
        food: z.number().min(0),
        waste: z.number().min(0).default(0),
        total: z.number().min(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        const userId = ctx.user!.id;

        // carbon_records columns are INT — round tonnes of CO2 to whole numbers.
        const record = {
          userId,
          transport: Math.round(input.transport),
          electricity: Math.round(input.electricity),
          water: Math.round(input.water),
          food: Math.round(input.food),
          waste: Math.round(input.waste),
          total: Math.round(input.total),
        };

        // 1) Persist the carbon record first.
        const result = await db.insert(carbonRecords).values(record);
        const insertId = Number((result as unknown as { insertId?: unknown }).insertId ?? 0) || undefined;

        // 2) Trigger the existing points logic server-side.
        // calculatePoints() compares against the user's earliest record and is
        // order-independent of this insert, so saving first is safe.
        const pointsEarned = await calculatePoints(userId, {
          transport: record.transport,
          electricity: record.electricity,
          water: record.water,
          food: record.food,
          waste: record.waste,
        });
        await updateUserPoints(userId, pointsEarned);

        // 3) Automatically check + award badges server-side (all types:
        // points / reduction / streak / special). Returns full badge rows.
        const newBadges = await checkAndAwardBadges(userId);

        // 4) Return the updated balance + new badges so the client can display
        // them and fire achievement notifications.
        const achievements = await getUserAchievements(userId);

        return {
          id: insertId,
          ...record,
          pointsEarned,
          points: achievements.points,
          newBadges,
        };
      }),

    // Calculate and update points
    updatePoints: protectedProcedure
      .input(z.object({
        transport: z.number(),
        electricity: z.number(),
        water: z.number(),
        food: z.number(),
        waste: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const pointsEarned = await calculatePoints(ctx.user!.id, input);
        await updateUserPoints(ctx.user!.id, pointsEarned);
        
        // Check for new badges
        const newBadges = await checkAndAwardBadges(ctx.user!.id);
        
        // Get updated achievements
        const achievements = await getUserAchievements(ctx.user!.id);
        
        return {
          pointsEarned,
          newBadges,
          achievements,
        };
      }),

    // Get user achievements
    getAchievements: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserAchievements(ctx.user!.id);
      }),

    // Get leaderboard
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ input }) => {
        return await getLeaderboard(input?.limit || 10);
      }),

    // --- Phase 4: Eco Coins (ledger-based, server-derived balance) ---
    getEcoCoins: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user!.id;
      const [balance, streak] = await Promise.all([
        getEcoBalance(userId),
        getChallengeStreak(userId),
      ]);
      return { balance, streak };
    }),

    getEcoTransactions: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return await getRecentEcoTransactions(ctx.user!.id, input?.limit ?? 20);
      }),

    // --- Phase 4: Daily challenges (DB-backed, server-validated) ---
    getDailyChallenges: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user!.id;
      const challenges = await getTodayChallenges();
      const [progress, streak, balance] = await Promise.all([
        getUserChallengeProgress(userId),
        getChallengeStreak(userId),
        getEcoBalance(userId),
      ]);
      const progressByChallenge = new Map(progress.map((p) => [p.challengeId, p]));
      return {
        challenges: challenges.map((c) => {
          const rule = challengeRuleFor(c);
          const p = progressByChallenge.get(c.id);
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            reward: rule.reward,
            target: rule.target,
            icon: rule.icon,
            difficulty: rule.difficulty,
            progress: p?.progress ?? 0,
            completed: (p?.completed ?? 0) === 1,
            rewardClaimed: (p?.rewardClaimed ?? 0) === 1,
          };
        }),
        streak,
        balance,
      };
    }),

    getChallengeProgress: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user!.id;
      const [progress, streak] = await Promise.all([
        getUserChallengeProgress(userId),
        getChallengeStreak(userId),
      ]);
      return { progress, streak };
    }),

    startChallenge: protectedProcedure
      .input(z.object({ challengeId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const found = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, input.challengeId)).limit(1);
        if (!found[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
        return await startChallengeProgress(ctx.user!.id, input.challengeId);
      }),

    updateChallengeProgress: protectedProcedure
      .input(z.object({ challengeId: z.number().int().positive(), progress: z.number().min(0).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const found = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, input.challengeId)).limit(1);
        if (!found[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
        const rule = challengeRuleFor(found[0]);
        // Server clamps progress; completion/reward decided only in completeChallenge.
        const clamped = Math.min(Math.max(Math.trunc(input.progress), 0), Math.max(rule.target, 100));
        const existing = await db
          .select()
          .from(userChallengeProgress)
          .where(and(eq(userChallengeProgress.userId, ctx.user!.id), eq(userChallengeProgress.challengeId, input.challengeId)))
          .limit(1);
        if (existing[0]) {
          if ((existing[0].completed ?? 0) === 1) return existing[0];
          await db.update(userChallengeProgress).set({ progress: clamped }).where(eq(userChallengeProgress.id, existing[0].id));
          const updated = await db.select().from(userChallengeProgress).where(eq(userChallengeProgress.id, existing[0].id)).limit(1);
          return updated[0];
        }
        await db.insert(userChallengeProgress).values({ userId: ctx.user!.id, challengeId: input.challengeId, progress: clamped });
        const created = await db
          .select()
          .from(userChallengeProgress)
          .where(and(eq(userChallengeProgress.userId, ctx.user!.id), eq(userChallengeProgress.challengeId, input.challengeId)))
          .limit(1);
        return created[0];
      }),

    completeChallenge: protectedProcedure
      .input(z.object({ challengeId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await completeChallenge(ctx.user!.id, input.challengeId, checkAndAwardBadges);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to complete challenge";
          const code = message === "Challenge not found" ? "NOT_FOUND" : "BAD_REQUEST";
          throw new TRPCError({ code, message });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
