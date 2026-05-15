// TODO: Replace localStorage with Supabase/Firebase for cloud sync
// TODO: Add auth with Clerk/Auth0
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { generateSeedData } from '../data/seedData';

const STORAGE_KEY = 'gymlife_v1';

const AppContext = createContext(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'INIT': return { ...action.payload };
    case 'UPDATE_PROFILE': return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_WORKOUT': return { ...state, workouts: [action.payload, ...state.workouts], activityFeed: [{ id: `af${Date.now()}`, type: 'workout', message: `Completed ${action.payload.name}`, date: action.payload.date, icon: '💪' }, ...state.activityFeed].slice(0, 20) };
    case 'UPDATE_WORKOUT': return { ...state, workouts: state.workouts.map(w => w.id === action.payload.id ? action.payload : w) };
    case 'DELETE_WORKOUT': return { ...state, workouts: state.workouts.filter(w => w.id !== action.payload) };
    case 'ADD_WEIGHT_LOG': return { ...state, weightLogs: [action.payload, ...state.weightLogs] };
    case 'ADD_SLEEP_LOG': {
      const existing = state.sleepLogs.findIndex(s => s.date === action.payload.date);
      if (existing >= 0) {
        const updated = [...state.sleepLogs];
        updated[existing] = action.payload;
        return { ...state, sleepLogs: updated };
      }
      return { ...state, sleepLogs: [action.payload, ...state.sleepLogs] };
    }
    case 'ADD_WELLNESS_LOG': {
      const existing = state.wellnessLogs.findIndex(w => w.date === action.payload.date);
      if (existing >= 0) {
        const updated = [...state.wellnessLogs];
        updated[existing] = action.payload;
        return { ...state, wellnessLogs: updated };
      }
      return { ...state, wellnessLogs: [action.payload, ...state.wellnessLogs] };
    }
    case 'ADD_NUTRITION_LOG': {
      const existing = state.nutritionLogs.findIndex(n => n.date === action.payload.date);
      if (existing >= 0) {
        const updated = [...state.nutritionLogs];
        updated[existing] = action.payload;
        return { ...state, nutritionLogs: updated };
      }
      return { ...state, nutritionLogs: [action.payload, ...state.nutritionLogs] };
    }
    case 'ADD_GOAL': return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL': return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'COMPLETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== action.payload.id), completedGoals: [{ ...action.payload, completedAt: new Date().toISOString().split('T')[0] }, ...state.completedGoals] };
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'UPDATE_SCHEDULE': return { ...state, schedule: { ...state.schedule, ...action.payload } };
    case 'ADD_PR': {
      const existing = state.prs.findIndex(p => p.exerciseId === action.payload.exerciseId);
      if (existing >= 0 && state.prs[existing].value >= action.payload.value) return state;
      const newPrs = existing >= 0 ? state.prs.map((p, i) => i === existing ? action.payload : p) : [action.payload, ...state.prs];
      return { ...state, prs: newPrs, activityFeed: [{ id: `af${Date.now()}`, type: 'pr', message: `New PR: ${action.payload.exerciseName} ${action.payload.value}${action.payload.unit} 🏆`, date: action.payload.date, icon: '🏆' }, ...state.activityFeed].slice(0, 20) };
    }
    case 'ADD_BODY_MEASUREMENT': return { ...state, bodyMeasurements: [action.payload, ...state.bodyMeasurements] };
    case 'ADD_CUSTOM_EXERCISE': return { ...state, customExercises: [action.payload, ...state.customExercises] };
    case 'CLEAR_ALL': return { ...generateSeedData(), profile: { ...generateSeedData().profile, onboardingComplete: false } };
    default: return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'INIT', payload: JSON.parse(saved) });
      } else {
        const seed = generateSeedData();
        dispatch({ type: 'INIT', payload: seed });
      }
    } catch {
      const seed = generateSeedData();
      dispatch({ type: 'INIT', payload: seed });
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
