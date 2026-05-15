import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

const WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Active Recovery', 'Rest'];
const TYPE_COLORS = {
  Push: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40' },
  Pull: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  Legs: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
  Upper: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
  Lower: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  'Full Body': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40' },
  Cardio: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' },
  'Active Recovery': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40' },
  Rest: { bg: 'bg-white/[0.04]', text: 'text-white/30', border: 'border-white/[0.08]' },
};

const TEMPLATES = {
  'PPL 6-Day': { monday: 'Push', tuesday: 'Pull', wednesday: 'Legs', thursday: 'Push', friday: 'Pull', saturday: 'Legs', sunday: 'Rest' },
  'Upper/Lower 4-Day': { monday: 'Upper', tuesday: 'Lower', wednesday: 'Rest', thursday: 'Upper', friday: 'Lower', saturday: 'Rest', sunday: 'Rest' },
  'Full Body 3-Day': { monday: 'Full Body', tuesday: 'Rest', wednesday: 'Full Body', thursday: 'Rest', friday: 'Full Body', saturday: 'Rest', sunday: 'Rest' },
  'Bro Split 5-Day': { monday: 'Push', tuesday: 'Pull', wednesday: 'Legs', thursday: 'Upper', friday: 'Cardio', saturday: 'Rest', sunday: 'Rest' },
};

export default function Schedule() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { schedule = {}, workouts = [] } = state || {};
  const [editing, setEditing] = useState(null);

  const todayIdx = new Date().getDay();
  const todayKey = DAYS[(todayIdx + 6) % 7];

  const applyTemplate = (name) => {
    dispatch({ type: 'UPDATE_SCHEDULE', payload: TEMPLATES[name] });
    toast(`Applied ${name} template!`, 'success');
  };

  const setDay = (day, type) => {
    dispatch({ type: 'UPDATE_SCHEDULE', payload: { [day]: type } });
    setEditing(null);
  };

  // Next 7 upcoming workouts
  const upcoming = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      const dayKey = DAYS[(d.getDay() + 6) % 7];
      const type = schedule[dayKey] || 'Rest';
      const dateStr = d.toISOString().split('T')[0];
      const logged = workouts.some(w => w.date === dateStr);
      return { date: d, dateStr, dayKey, type, logged, isToday: i === 0 };
    });
  }, [schedule, workouts]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Schedule 📅</h1>
        <p className="text-white/40 text-sm">Plan your weekly training split.</p>
      </motion.div>

      {/* Weekly Planner Grid */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">Weekly Plan</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map(day => {
            const type = schedule[day] || 'Rest';
            const colors = TYPE_COLORS[type] || TYPE_COLORS.Rest;
            const isToday = day === todayKey;
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-medium ${isToday ? 'text-violet-400' : 'text-white/40'}`}>{DAY_LABELS[day]}</span>
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => setEditing(editing === day ? null : day)}
                  className={`w-full aspect-square rounded-xl border flex flex-col items-center justify-center text-center p-1 transition-all ${colors.bg} ${colors.border} ${isToday ? 'ring-2 ring-violet-500 ring-offset-1 ring-offset-[#141414]' : ''}`}>
                  <span className="text-base">{type === 'Rest' ? '🌙' : type === 'Cardio' ? '🏃' : type === 'Active Recovery' ? '🧘' : '💪'}</span>
                  <span className={`text-[9px] font-medium mt-0.5 leading-tight ${colors.text}`}>{type.length > 6 ? type.slice(0, 6) : type}</span>
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Day type picker */}
        {editing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-xs text-white/40 mb-3 capitalize">Select workout for {editing}:</p>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_TYPES.map(t => {
                const c = TYPE_COLORS[t] || TYPE_COLORS.Rest;
                return (
                  <button key={t} onClick={() => setDay(editing, t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${schedule[editing] === t ? `${c.bg} ${c.text} ${c.border}` : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Templates */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Program Templates</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(TEMPLATES).map(([name, tmpl]) => (
            <div key={name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{name}</h4>
                <button onClick={() => applyTemplate(name)} className="text-xs px-3 py-1 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors">Apply</button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {DAYS.map(d => {
                  const t = tmpl[d]; const c = TYPE_COLORS[t] || TYPE_COLORS.Rest;
                  return <span key={d} className={`text-[9px] px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>{t.slice(0, 4)}</span>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming 7 days */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Upcoming Workouts</h3>
        <div className="space-y-2">
          {upcoming.map(({ date, type, logged, isToday, dayKey }) => {
            const c = TYPE_COLORS[type] || TYPE_COLORS.Rest;
            return (
              <div key={dayKey} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isToday ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/[0.04] bg-white/[0.02]'}`}>
                <div className="w-12 text-center">
                  <div className="text-xs text-white/40">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-sm font-bold text-white font-mono">{date.getDate()}</div>
                </div>
                <div className={`flex-1 text-sm font-medium ${c.text}`}>
                  {type === 'Rest' ? '🌙 Rest Day' : type === 'Cardio' ? `🏃 ${type}` : `💪 ${type}`}
                </div>
                {isToday && <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30">Today</span>}
                {logged && !isToday && <span className="text-xs text-emerald-400">✓ Done</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
