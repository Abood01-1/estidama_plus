import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generateAIRecommendations } from "./recommendations";
import { calculatePoints, updateUserPoints, checkAndAwardBadges, getUserAchievements, getLeaderboard } from "./gamification";
import { getDb } from "./db";
import { badges } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";

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
