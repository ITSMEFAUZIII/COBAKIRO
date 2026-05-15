// Seed data for first-time load
// TODO: Replace localStorage with Supabase/Firebase for multi-device sync

const today = new Date();
const dateStr = (offset = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
};

export const EXERCISE_LIBRARY = [
  // Push
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', category: 'Push', notes: 'Keep shoulder blades retracted. Lower bar to mid-chest.' },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Upper Chest', equipment: 'Dumbbell', category: 'Push', notes: '30-45° incline. Control the eccentric.' },
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', category: 'Push', notes: 'Keep core tight. Press bar in slight arc over head.' },
  { id: 'lateral-raises', name: 'Lateral Raises', muscleGroup: 'Side Delts', equipment: 'Dumbbell', category: 'Push', notes: 'Lead with elbows, slight forward lean.' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'Triceps', equipment: 'Cable', category: 'Push', notes: 'Keep elbows tucked. Full extension.' },
  { id: 'dips', name: 'Dips', muscleGroup: 'Triceps/Chest', equipment: 'Bodyweight', category: 'Push', notes: 'Lean forward for chest, upright for triceps.' },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable', category: 'Push', notes: 'Slight bend in elbows. Feel the stretch.' },
  // Pull
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back/Hamstrings', equipment: 'Barbell', category: 'Pull', notes: 'Hip hinge pattern. Neutral spine throughout.' },
  { id: 'pull-ups', name: 'Pull-ups', muscleGroup: 'Lats', equipment: 'Bodyweight', category: 'Pull', notes: 'Full dead hang to chin over bar. Engage lats.' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'Mid Back', equipment: 'Barbell', category: 'Pull', notes: 'Hinge at hip 45°. Pull to lower chest.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Lats', equipment: 'Cable', category: 'Pull', notes: 'Lean back slightly. Pull to upper chest.' },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'Rear Delts', equipment: 'Cable', category: 'Pull', notes: 'Pull to nose level, elbows flared out.' },
  { id: 'bicep-curl', name: 'Barbell Curl', muscleGroup: 'Biceps', equipment: 'Barbell', category: 'Pull', notes: 'Keep elbows stationary. Squeeze at top.' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'Brachialis', equipment: 'Dumbbell', category: 'Pull', notes: 'Neutral grip. Controlled tempo.' },
  { id: 'seated-row', name: 'Seated Cable Row', muscleGroup: 'Mid Back', equipment: 'Cable', category: 'Pull', notes: 'Keep chest tall. Squeeze at contraction.' },
  // Legs
  { id: 'squat', name: 'Back Squat', muscleGroup: 'Quads/Glutes', equipment: 'Barbell', category: 'Legs', notes: 'Bar on traps. Break parallel. Knees track toes.' },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', equipment: 'Barbell', category: 'Legs', notes: 'Hip hinge, slight knee bend. Feel hamstring stretch.' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Quads', equipment: 'Machine', category: 'Legs', notes: 'Feet shoulder-width. Don\'t lock knees.' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine', category: 'Legs', notes: 'Full range of motion. Slow eccentric.' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'Quads', equipment: 'Machine', category: 'Legs', notes: 'Control the negative. Don\'t hyperextend.' },
  { id: 'calf-raises', name: 'Calf Raises', muscleGroup: 'Calves', equipment: 'Machine', category: 'Legs', notes: 'Full stretch at bottom, peak contraction at top.' },
  { id: 'lunges', name: 'Walking Lunges', muscleGroup: 'Quads/Glutes', equipment: 'Dumbbell', category: 'Legs', notes: 'Step forward, lower knee near floor.' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'Glutes', equipment: 'Barbell', category: 'Legs', notes: 'Back on bench. Drive hips up, squeeze glutes.' },
  // Core
  { id: 'plank', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', category: 'Core', notes: 'Neutral spine. Breathe normally.' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Abs', equipment: 'Cable', category: 'Core', notes: 'Round spine. Pull elbows to knees.' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Lower Abs', equipment: 'Bodyweight', category: 'Core', notes: 'Control the swing. Tuck pelvis.' },
  { id: 'ab-rollout', name: 'Ab Wheel Rollout', muscleGroup: 'Core', equipment: 'Wheel', category: 'Core', notes: 'Brace hard. Don\'t let hips drop.' },
  // Cardio
  { id: 'treadmill', name: 'Treadmill Run', muscleGroup: 'Cardio', equipment: 'Machine', category: 'Cardio', notes: 'Track duration and distance.' },
  { id: 'cycling', name: 'Stationary Bike', muscleGroup: 'Cardio', equipment: 'Machine', category: 'Cardio', notes: 'Adjust resistance for intensity.' },
  { id: 'rowing', name: 'Rowing Machine', muscleGroup: 'Full Body Cardio', equipment: 'Machine', category: 'Cardio', notes: 'Drive with legs first, then lean back.' },
  { id: 'jump-rope', name: 'Jump Rope', muscleGroup: 'Cardio', equipment: 'Rope', category: 'Cardio', notes: 'Land softly on balls of feet.' },
];

export const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success isn't given. It's earned in the gym.",
  "Train insane or remain the same.",
  "What hurts today makes you stronger tomorrow.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "Push yourself because no one else is going to do it for you.",
  "Sweat is just fat crying.",
  "Be stronger than your excuses.",
  "It never gets easier, you just get stronger.",
  "Champions aren't made in the gym — they're made from something deep inside.",
  "The groundwork for all happiness is good health.",
  "Take care of your body — it's the only place you have to live.",
];

export const generateSeedData = () => {
  const workouts = [
    {
      id: 'w1',
      name: 'Push Day A',
      date: dateStr(6),
      duration: 65,
      notes: 'Felt strong today. Hit a new bench PR!',
      exercises: [
        { id: 'bench-press', name: 'Bench Press', sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 82.5 }, { reps: 6, weight: 85 }, { reps: 5, weight: 87.5 }], notes: 'New PR on last set!' },
        { id: 'ohp', name: 'Overhead Press', sets: [{ reps: 10, weight: 52.5 }, { reps: 10, weight: 55 }, { reps: 8, weight: 57.5 }], notes: '' },
        { id: 'incline-db-press', name: 'Incline Dumbbell Press', sets: [{ reps: 12, weight: 30 }, { reps: 10, weight: 32.5 }, { reps: 10, weight: 32.5 }], notes: '' },
        { id: 'lateral-raises', name: 'Lateral Raises', sets: [{ reps: 15, weight: 12 }, { reps: 15, weight: 12 }, { reps: 12, weight: 14 }], notes: '' },
        { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: [{ reps: 15, weight: 25 }, { reps: 12, weight: 27.5 }, { reps: 12, weight: 27.5 }], notes: '' },
      ],
    },
    {
      id: 'w2',
      name: 'Pull Day A',
      date: dateStr(5),
      duration: 70,
      notes: 'Great back pump.',
      exercises: [
        { id: 'deadlift', name: 'Deadlift', sets: [{ reps: 5, weight: 120 }, { reps: 5, weight: 130 }, { reps: 3, weight: 140 }], notes: 'New deadlift PR!' },
        { id: 'pull-ups', name: 'Pull-ups', sets: [{ reps: 10, weight: 0 }, { reps: 8, weight: 0 }, { reps: 7, weight: 0 }], notes: '' },
        { id: 'barbell-row', name: 'Barbell Row', sets: [{ reps: 10, weight: 70 }, { reps: 10, weight: 72.5 }, { reps: 8, weight: 75 }], notes: '' },
        { id: 'face-pulls', name: 'Face Pulls', sets: [{ reps: 15, weight: 15 }, { reps: 15, weight: 15 }, { reps: 15, weight: 17.5 }], notes: '' },
        { id: 'bicep-curl', name: 'Barbell Curl', sets: [{ reps: 12, weight: 35 }, { reps: 10, weight: 37.5 }, { reps: 10, weight: 37.5 }], notes: '' },
      ],
    },
    {
      id: 'w3',
      name: 'Legs Day A',
      date: dateStr(4),
      duration: 75,
      notes: 'Quad DOMS incoming.',
      exercises: [
        { id: 'squat', name: 'Back Squat', sets: [{ reps: 8, weight: 90 }, { reps: 8, weight: 95 }, { reps: 6, weight: 100 }, { reps: 5, weight: 102.5 }], notes: '' },
        { id: 'rdl', name: 'Romanian Deadlift', sets: [{ reps: 10, weight: 80 }, { reps: 10, weight: 82.5 }, { reps: 10, weight: 82.5 }], notes: '' },
        { id: 'leg-press', name: 'Leg Press', sets: [{ reps: 12, weight: 150 }, { reps: 12, weight: 160 }, { reps: 10, weight: 170 }], notes: '' },
        { id: 'leg-curl', name: 'Leg Curl', sets: [{ reps: 12, weight: 45 }, { reps: 12, weight: 45 }, { reps: 10, weight: 50 }], notes: '' },
        { id: 'calf-raises', name: 'Calf Raises', sets: [{ reps: 20, weight: 60 }, { reps: 20, weight: 60 }, { reps: 15, weight: 65 }], notes: '' },
      ],
    },
    {
      id: 'w4',
      name: 'Push Day B',
      date: dateStr(3),
      duration: 60,
      notes: 'Solid session.',
      exercises: [
        { id: 'ohp', name: 'Overhead Press', sets: [{ reps: 8, weight: 57.5 }, { reps: 7, weight: 60 }, { reps: 6, weight: 60 }], notes: '' },
        { id: 'bench-press', name: 'Bench Press', sets: [{ reps: 10, weight: 77.5 }, { reps: 10, weight: 80 }, { reps: 8, weight: 82.5 }], notes: '' },
        { id: 'cable-fly', name: 'Cable Fly', sets: [{ reps: 15, weight: 12.5 }, { reps: 12, weight: 15 }, { reps: 12, weight: 15 }], notes: '' },
        { id: 'lateral-raises', name: 'Lateral Raises', sets: [{ reps: 15, weight: 12 }, { reps: 15, weight: 14 }, { reps: 12, weight: 14 }], notes: '' },
        { id: 'dips', name: 'Dips', sets: [{ reps: 12, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }], notes: '' },
      ],
    },
    {
      id: 'w5',
      name: 'Pull Day B',
      date: dateStr(2),
      duration: 68,
      notes: 'Great lat activation.',
      exercises: [
        { id: 'lat-pulldown', name: 'Lat Pulldown', sets: [{ reps: 12, weight: 65 }, { reps: 10, weight: 70 }, { reps: 10, weight: 72.5 }], notes: '' },
        { id: 'seated-row', name: 'Seated Cable Row', sets: [{ reps: 12, weight: 60 }, { reps: 12, weight: 65 }, { reps: 10, weight: 67.5 }], notes: '' },
        { id: 'pull-ups', name: 'Pull-ups', sets: [{ reps: 9, weight: 0 }, { reps: 8, weight: 0 }, { reps: 7, weight: 0 }], notes: '' },
        { id: 'face-pulls', name: 'Face Pulls', sets: [{ reps: 20, weight: 15 }, { reps: 15, weight: 17.5 }, { reps: 15, weight: 17.5 }], notes: '' },
        { id: 'hammer-curl', name: 'Hammer Curl', sets: [{ reps: 12, weight: 18 }, { reps: 12, weight: 20 }, { reps: 10, weight: 20 }], notes: '' },
      ],
    },
    {
      id: 'w6',
      name: 'Legs Day B',
      date: dateStr(1),
      duration: 72,
      notes: 'Focused on hamstrings.',
      exercises: [
        { id: 'squat', name: 'Back Squat', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 105 }, { reps: 3, weight: 107.5 }], notes: '' },
        { id: 'hip-thrust', name: 'Hip Thrust', sets: [{ reps: 12, weight: 100 }, { reps: 12, weight: 110 }, { reps: 10, weight: 112.5 }], notes: '' },
        { id: 'rdl', name: 'Romanian Deadlift', sets: [{ reps: 10, weight: 82.5 }, { reps: 10, weight: 85 }, { reps: 8, weight: 87.5 }], notes: '' },
        { id: 'leg-extension', name: 'Leg Extension', sets: [{ reps: 15, weight: 50 }, { reps: 12, weight: 55 }, { reps: 12, weight: 55 }], notes: '' },
        { id: 'calf-raises', name: 'Calf Raises', sets: [{ reps: 20, weight: 65 }, { reps: 20, weight: 65 }, { reps: 20, weight: 65 }], notes: '' },
      ],
    },
  ];

  const weightLogs = Array.from({ length: 14 }, (_, i) => ({
    id: `wl${i}`,
    date: dateStr(13 - i),
    weight: 75 + (Math.random() * 1.2 - 0.4).toFixed(1) * 1,
  }));

  const sleepLogs = Array.from({ length: 7 }, (_, i) => ({
    id: `sl${i}`,
    date: dateStr(6 - i),
    bedtime: '22:30',
    wakeTime: '07:00',
    duration: 8 + (Math.random() * 1.5 - 0.75).toFixed(1) * 1,
    quality: Math.floor(Math.random() * 2) + 3,
  }));

  const wellnessLogs = Array.from({ length: 7 }, (_, i) => ({
    id: `wn${i}`,
    date: dateStr(6 - i),
    energy: Math.floor(Math.random() * 4) + 6,
    mood: ['😐', '🙂', '😊', '🔥', '😊'][Math.floor(Math.random() * 5)],
    soreness: Math.floor(Math.random() * 5) + 2,
    stress: Math.floor(Math.random() * 4) + 2,
  }));

  const nutritionLogs = Array.from({ length: 3 }, (_, i) => ({
    id: `nl${i}`,
    date: dateStr(i),
    meals: {
      breakfast: [{ name: 'Oats & Protein Shake', calories: 480, protein: 42, carbs: 58, fats: 8 }],
      lunch: [{ name: 'Chicken Rice Bowl', calories: 650, protein: 52, carbs: 72, fats: 14 }],
      dinner: [{ name: 'Salmon & Vegetables', calories: 520, protein: 45, carbs: 28, fats: 22 }],
      snacks: [{ name: 'Greek Yogurt & Nuts', calories: 280, protein: 18, carbs: 22, fats: 12 }],
    },
    water: 1750,
  }));

  const goals = [
    {
      id: 'g1',
      type: 'strength',
      title: 'Bench Press 100kg',
      description: 'Hit a 1RM bench press of 100kg',
      target: 100,
      current: 87.5,
      unit: 'kg',
      deadline: new Date(today.getFullYear(), today.getMonth() + 3, 1).toISOString().split('T')[0],
      status: 'active',
      notes: 'Currently at 87.5kg for 5 reps. Should get there in ~12 weeks.',
      createdAt: dateStr(30),
    },
    {
      id: 'g2',
      type: 'weight',
      title: 'Reach 72kg',
      description: 'Cut to 72kg while maintaining strength',
      target: 72,
      current: 75,
      unit: 'kg',
      deadline: new Date(today.getFullYear(), today.getMonth() + 2, 15).toISOString().split('T')[0],
      status: 'active',
      notes: 'Slow cut, ~0.5kg/week deficit.',
      createdAt: dateStr(14),
    },
    {
      id: 'g3',
      type: 'habit',
      title: 'Train 5x/week for 8 weeks',
      description: 'Consistent training habit',
      target: 40,
      current: 18,
      unit: 'sessions',
      deadline: new Date(today.getFullYear(), today.getMonth() + 1, 20).toISOString().split('T')[0],
      status: 'active',
      notes: '18 sessions done, 22 to go!',
      createdAt: dateStr(40),
    },
  ];

  const schedule = {
    monday: 'Push',
    tuesday: 'Pull',
    wednesday: 'Legs',
    thursday: 'Rest',
    friday: 'Push',
    saturday: 'Pull',
    sunday: 'Legs',
  };

  const profile = {
    name: 'Athlete',
    age: 24,
    height: 175,
    startingWeight: 75,
    fitnessLevel: 'intermediate',
    primaryGoal: 'build_muscle',
    unit: 'metric',
    weeklyTarget: 5,
    calorieGoal: 2800,
    macroTargets: { protein: 35, carbs: 45, fats: 20 },
    restTimer: 90,
    onboardingComplete: false,
  };

  const bodyMeasurements = [
    { id: 'bm1', date: dateStr(30), chest: 102, waist: 82, hips: 96, arms: 38, legs: 58 },
    { id: 'bm2', date: dateStr(0), chest: 103, waist: 81, hips: 95, arms: 39, legs: 59 },
  ];

  const prs = [
    { exerciseId: 'bench-press', exerciseName: 'Bench Press', value: 87.5, unit: 'kg', date: dateStr(6) },
    { exerciseId: 'deadlift', exerciseName: 'Deadlift', value: 140, unit: 'kg', date: dateStr(5) },
    { exerciseId: 'squat', exerciseName: 'Back Squat', value: 107.5, unit: 'kg', date: dateStr(1) },
    { exerciseId: 'ohp', exerciseName: 'Overhead Press', value: 60, unit: 'kg', date: dateStr(3) },
  ];

  return {
    workouts,
    weightLogs,
    sleepLogs,
    wellnessLogs,
    nutritionLogs,
    goals,
    schedule,
    profile,
    bodyMeasurements,
    prs,
    customExercises: [],
    completedGoals: [],
    activityFeed: [
      { id: 'af1', type: 'workout', message: 'Completed Legs Day B', date: dateStr(1), icon: '💪' },
      { id: 'af2', type: 'pr', message: 'New PR: Back Squat 107.5kg 🏆', date: dateStr(1), icon: '🏆' },
      { id: 'af3', type: 'workout', message: 'Completed Pull Day B', date: dateStr(2), icon: '💪' },
      { id: 'af4', type: 'pr', message: 'New PR: Deadlift 140kg 🏆', date: dateStr(5), icon: '🏆' },
      { id: 'af5', type: 'workout', message: 'Completed Push Day A', date: dateStr(6), icon: '💪' },
    ],
  };
};
