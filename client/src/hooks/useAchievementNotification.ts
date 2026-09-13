import { useEffect } from 'react';
import { toast } from 'sonner';

export interface AchievementNotification {
  badgeId: number;
  badgeName: string;
  badgeIcon: string;
  points: number;
}

export function useAchievementNotification(achievement: AchievementNotification | null) {
  useEffect(() => {
    if (achievement) {
      notifyAchievement(achievement);
    }
  }, [achievement]);
}

/**
 * Fires one toast per newly unlocked badge. Call with the `newBadges`
 * array returned by the server — an empty array (or null) shows nothing,
 * so notifications appear only when a badge is actually earned.
 */
export function useAchievementNotifications(
  achievements: AchievementNotification[] | null | undefined
) {
  useEffect(() => {
    if (achievements) {
      for (const achievement of achievements) {
        notifyAchievement(achievement);
      }
    }
  }, [achievements]);
}

function notifyAchievement(achievement: AchievementNotification) {
  toast.success(
    `🎉 تم فتح شارة جديدة: ${achievement.badgeName}! +${achievement.points} نقطة`,
    {
      duration: 5000,
      style: {
        background: 'rgba(255, 0, 127, 0.2)',
        border: '2px solid #ff007f',
        color: '#00ffff',
        borderRadius: '8px',
      },
    }
  );
}
