import { useMemo } from 'react';

export function useWorkoutStats(workouts = []) {
  return useMemo(() => {
    const totalWorkouts = workouts.length;

    const totalVolume = workouts.reduce((sum, w) => {
      return sum + w.exercises.reduce((eSum, ex) => {
        return eSum + ex.sets.reduce((sSum, s) => sSum + (s.weight * s.reps), 0);
      }, 0);
    }, 0);

    const avgDuration = totalWorkouts > 0
      ? Math.round(workouts.reduce((s, w) => s + (w.duration || 0), 0) / totalWorkouts)
      : 0;

    // Muscle group distribution
    const muscleCount = {};
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        const key = ex.muscleGroup || 'Other';
        muscleCount[key] = (muscleCount[key] || 0) + 1;
      });
    });
    const mostTrained = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Weekly volume
    const weeklyVolume = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      const vol = w.exercises.reduce((s, ex) => s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0), 0);
      weeklyVolume[key] = (weeklyVolume[key] || 0) + vol;
    });

    // Last 8 weeks for chart
    const weeklyVolumeChart = Array.from({ length: 8 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 * (7 - i)));
      d.setDate(d.getDate() - d.getDay());
      const key = d.toISOString().split('T')[0];
      return { week: `W${i + 1}`, volume: Math.round(weeklyVolume[key] || 0) };
    });

    return { totalWorkouts, totalVolume: Math.round(totalVolume), avgDuration, mostTrained, weeklyVolumeChart, muscleCount };
  }, [workouts]);
}
