import { useState, useEffect } from 'react';
import { db } from '@/lib/instantdb';

export function useTutorial(userId: string | undefined) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user has seen tutorial
  const { data } = db.useQuery(
    userId
      ? {
          users: {
            $: {
              where: {
                id: userId,
              },
            },
          },
        }
      : {}
  );

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const user = data?.users?.[0];
    if (user !== undefined) {
      setShowTutorial(!user.hasSeenTutorial);
      setLoading(false);
    }
  }, [data, userId]);

  const dismissTutorial = async () => {
    if (!userId) return;

    await db.transact([
      db.tx.users[userId].update({
        hasSeenTutorial: true,
      }),
    ]);
    setShowTutorial(false);
  };

  const resetTutorial = async () => {
    if (!userId) return;

    await db.transact([
      db.tx.users[userId].update({
        hasSeenTutorial: false,
      }),
    ]);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    dismissTutorial,
    resetTutorial,
    loading,
  };
}