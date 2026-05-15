import { useMemo } from 'react';

export function useStreak(workouts = []) {
  return useMemo(() => {
    if (!workouts.length) return { currentStreak: 0, longestStreak: 0 };

    const dates = [...new Set(workouts.map(w => w.date))].sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    // Current streak
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        if (dates[0] !== today && dates[0] !== yesterday) break;
        currentStreak = 1;
        prevDate = dates[0];
      } else {
        const diff = (new Date(prevDate) - new Date(dates[i])) / 86400000;
        if (diff === 1) { currentStreak++; prevDate = dates[i]; }
        else break;
      }
    }

    // Longest streak
    prevDate = null;
    tempStreak = 0;
    for (const date of [...dates].reverse()) {
      if (!prevDate) { tempStreak = 1; prevDate = date; }
      else {
        const diff = (new Date(date) - new Date(prevDate)) / 86400000;
        if (diff === 1) { tempStreak++; }
        else { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1; }
        prevDate = date;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }, [workouts]);
}
