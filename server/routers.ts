import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generateAIRecommendations } from "./recommendations";
import { calculatePoints, updateUserPoints, checkAndAwardBadges, getUserAchievements, getLeaderboard } from "./gamification";
import { getDb } from "./db";
import { badges, carbonRecords } from "../drizzle/schema";
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
  }),
});

export type AppRouter = typeof appRouter;
