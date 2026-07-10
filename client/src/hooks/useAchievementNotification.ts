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
  }, [achievement]);
}
