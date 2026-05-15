import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍪' };
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

const EMPTY_MEAL = { name: '', calories: '', protein: '', carbs: '', fats: '' };

function MacroRing({ value, max, color, label, size = 80 }) {
  const pct = Math.min(1, (value || 0) / (max || 1));
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="text-xs text-white/50 -mt-1 text-center leading-tight">
        <span className="font-mono font-bold text-white" style={{ color }}>{value || 0}</span>
        <span className="text-white/30">/{max}g</span>
        <div className="text-[10px] text-white/30">{label}</div>
      </div>
    </div>
  );
}

function WaterTracker({ log, date, onUpdate }) {
  const goal = 2000;
  const current = log?.water || 0;
  const pct = Math.min(1, current / goal);
  const cups = Math.round(current / 250);

  return (
    <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Water Intake 💧</h3>
        <span className="text-xs font-mono text-white/40">{current}ml / {goal}ml</span>
      </div>
      <div className="relative h-4 bg-white/[0.06] rounded-full overflow-hidden mb-4">
        <motion.div className="h-full rounded-full bg-blue-500" initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => onUpdate(date, Math.max(0, i < cups ? (i) * 250 : (i + 1) * 250))}
            className={`flex-1 h-8 rounded-lg transition-all ${i < cups ? 'bg-blue-500/80' : 'bg-white/[0.06]'}`}>
            <span className="text-xs">💧</span>
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onUpdate(date, Math.max(0, current - 250))} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-colors">-250ml</button>
        <button onClick={() => onUpdate(date, current + 250)} className="flex-1 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors">+250ml</button>
      </div>
    </div>
  );
}


function AddFoodModal({ mealType, onAdd, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_MEAL });
  const handle = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
        className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white capitalize">{MEAL_ICONS[mealType]} Add to {MEAL_LABELS[mealType]}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <input value={form.name} onChange={handle('name')} placeholder="Food name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"/>
        <div className="grid grid-cols-2 gap-3">
          {[['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fats', 'Fats (g)']].map(([f, label]) => (
            <div key={f}>
              <label className="text-xs text-white/40 mb-1 block">{label}</label>
              <input type="number" value={form[f]} onChange={handle(f)} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"/>
            </div>
          ))}
        </div>
        <button onClick={() => { if (!form.name) return; onAdd({ ...form, calories: +form.calories || 0, protein: +form.protein || 0, carbs: +form.carbs || 0, fats: +form.fats || 0 }); onClose(); }}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">Add Food</button>
      </motion.div>
    </motion.div>
  );
}

export default function Nutrition() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { nutritionLogs = [], profile = {} } = state || {};
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [addingTo, setAddingTo] = useState(null);

  const todayLog = useMemo(() => nutritionLogs.find(l => l.date === selectedDate) || { date: selectedDate, meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 }, [nutritionLogs, selectedDate]);

  const totals = useMemo(() => {
    const all = Object.values(todayLog.meals || {}).flat();
    return { calories: all.reduce((s, f) => s + (f.calories || 0), 0), protein: all.reduce((s, f) => s + (f.protein || 0), 0), carbs: all.reduce((s, f) => s + (f.carbs || 0), 0), fats: all.reduce((s, f) => s + (f.fats || 0), 0) };
  }, [todayLog]);

  const calGoal = profile.calorieGoal || 2800;
  const macros = profile.macroTargets || { protein: 35, carbs: 45, fats: 20 };
  const proteinGoal = Math.round((calGoal * macros.protein / 100) / 4);
  const carbsGoal = Math.round((calGoal * macros.carbs / 100) / 4);
  const fatsGoal = Math.round((calGoal * macros.fats / 100) / 9);

  const handleAddFood = useCallback((mealType, food) => {
    const updated = { ...todayLog, meals: { ...todayLog.meals, [mealType]: [...(todayLog.meals?.[mealType] || []), food] } };
    dispatch({ type: 'ADD_NUTRITION_LOG', payload: updated });
    toast(`Added to ${MEAL_LABELS[mealType]}!`, 'success');
  }, [todayLog, dispatch, toast]);

  const handleRemoveFood = useCallback((mealType, idx) => {
    const updated = { ...todayLog, meals: { ...todayLog.meals, [mealType]: todayLog.meals[mealType].filter((_, i) => i !== idx) } };
    dispatch({ type: 'ADD_NUTRITION_LOG', payload: updated });
  }, [todayLog, dispatch]);

  const handleWater = useCallback((date, val) => {
    dispatch({ type: 'ADD_NUTRITION_LOG', payload: { ...todayLog, water: val } });
  }, [todayLog, dispatch]);

  // Calorie trend (7 days)
  const calorieTrend = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = nutritionLogs.find(l => l.date === dateStr);
    const cals = log ? Object.values(log.meals || {}).flat().reduce((s, f) => s + (f.calories || 0), 0) : 0;
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), calories: cals };
  }), [nutritionLogs]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Nutrition 🍎</h1>
            <p className="text-white/40 text-sm">Track your daily intake.</p>
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"/>
        </div>
      </motion.div>

      {/* Daily Summary */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Daily Summary</h3>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-violet-400">{totals.calories}</div>
            <div className="text-xs text-white/40">/ {calGoal} kcal</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Calories</span><span>{Math.round(totals.calories / calGoal * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full rounded-full bg-violet-500" initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, totals.calories / calGoal * 100)}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
        <div className="flex justify-around">
          <MacroRing value={totals.protein} max={proteinGoal} color="#7c3aed" label="Protein" />
          <MacroRing value={totals.carbs} max={carbsGoal} color="#10b981" label="Carbs" />
          <MacroRing value={totals.fats} max={fatsGoal} color="#f59e0b" label="Fats" />
        </div>
      </div>

      {/* Meal Sections */}
      {MEAL_TYPES.map(meal => (
        <div key={meal} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white capitalize">{MEAL_ICONS[meal]} {MEAL_LABELS[meal]}</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/40">
                {(todayLog.meals?.[meal] || []).reduce((s, f) => s + (f.calories || 0), 0)} kcal
              </span>
              <button onClick={() => setAddingTo(meal)} className="text-xs px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors">+ Add</button>
            </div>
          </div>
          {(todayLog.meals?.[meal] || []).length === 0 ? (
            <div className="text-white/20 text-xs text-center py-3">Nothing logged yet</div>
          ) : (
            <div className="space-y-2">
              {(todayLog.meals?.[meal] || []).map((food, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/[0.04] last:border-0 group">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 truncate">{food.name}</div>
                    <div className="text-xs text-white/30 font-mono">P:{food.protein}g C:{food.carbs}g F:{food.fats}g</div>
                  </div>
                  <span className="text-sm font-mono text-white/60">{food.calories} kcal</span>
                  <button onClick={() => handleRemoveFood(meal, i)} className="text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 text-lg w-6 h-6 flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <WaterTracker log={todayLog} date={selectedDate} onUpdate={handleWater} />

      {/* 7-day calorie trend */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">7-Day Calorie Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={calorieTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
            <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AnimatePresence>
        {addingTo && <AddFoodModal mealType={addingTo} onAdd={(food) => handleAddFood(addingTo, food)} onClose={() => setAddingTo(null)} />}
      </AnimatePresence>
    </div>
  );
}
