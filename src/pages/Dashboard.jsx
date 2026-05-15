import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useStreak } from '../hooks/useStreak';
import { MOTIVATIONAL_QUOTES } from '../data/seedData';

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) { setDisplay(value); return; }
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

function WeeklyRing({ workouts }) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const hasWorkout = workouts.some(w => w.date === dateStr);
      return { day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()], active: hasWorkout, isToday: i === 6 };
    });
  }, [workouts]);

  return (
    <div className="flex items-end gap-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
            style={{ originY: 1 }}
            className={`w-8 rounded-md transition-all ${d.active ? 'bg-violet-500 h-10' : 'bg-white/[0.06] h-5'} ${d.isToday ? 'ring-2 ring-violet-400 ring-offset-1 ring-offset-[#141414]' : ''}`}
          />
          <span className={`text-[10px] font-mono ${d.isToday ? 'text-violet-400' : 'text-white/30'}`}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

const card = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } })
};

export default function Dashboard({ onNavigate }) {
  const { state, dispatch } = useApp();
  const { workouts = [], weightLogs = [], prs = [], profile = {}, activityFeed = [], schedule = {} } = state || {};
  const { currentStreak } = useStreak(workouts);

  const quote = useMemo(() => {
    const idx = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[idx];
  }, []);

  const thisWeekWorkouts = useMemo(() => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return workouts.filter(w => new Date(w.date) >= weekAgo).length;
  }, [workouts]);

  const latestWeight = weightLogs[0]?.weight || profile.startingWeight || 75;

  const todaySchedule = useMemo(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return schedule[days[new Date().getDay()]] || 'Rest';
  }, [schedule]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const WORKOUT_COLORS = { Push: 'text-violet-400', Pull: 'text-emerald-400', Legs: 'text-amber-400', Cardio: 'text-rose-400', Rest: 'text-white/40', Upper: 'text-blue-400', Lower: 'text-orange-400', 'Active Recovery': 'text-cyan-400', 'Full Body': 'text-pink-400' };

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          {greeting}, {profile.name || 'Athlete'} 👋
        </h1>
        <p className="text-white/40 text-sm italic">"{quote}"</p>
      </motion.div>

      {/* Streak Banner */}
      {currentStreak > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-2xl">🔥</motion.span>
          <div>
            <span className="text-amber-400 font-bold">{currentStreak} day streak!</span>
            <span className="text-white/40 text-sm ml-2">Keep it going — don't break the chain.</span>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Current Streak', value: currentStreak, suffix: 'days', icon: '🔥', color: 'text-amber-400' },
          { label: 'This Week', value: thisWeekWorkouts, suffix: 'workouts', icon: '⚡', color: 'text-violet-400' },
          { label: 'Personal Records', value: prs.length, suffix: 'all time', icon: '🏆', color: 'text-rose-400' },
          { label: 'Body Weight', value: latestWeight, suffix: 'kg', icon: '⚖️', color: 'text-emerald-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={card} initial="hidden" animate="show" className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 hover:bg-[#181818] hover:border-white/10 transition-all cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{stat.icon}</span>
              <span className={`text-xs font-mono ${stat.color} bg-white/5 px-2 py-0.5 rounded-full`}>{stat.suffix}</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${stat.color}`}>
              <AnimatedNumber value={stat.value} />
            </div>
            <div className="text-white/40 text-xs mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Today's Plan */}
        <motion.div custom={4} variants={card} initial="hidden" animate="show" className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Today's Plan</h3>
            <span className="text-xs text-white/30 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className={`text-4xl font-bold ${WORKOUT_COLORS[todaySchedule] || 'text-white'}`}>{todaySchedule}</div>
          </div>
          {todaySchedule === 'Rest' ? (
            <div className="text-white/40 text-sm">🌙 Rest day. Focus on recovery and nutrition.</div>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => onNavigate('workouts')} className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/20">
              Start {todaySchedule} Workout →
            </motion.button>
          )}
        </motion.div>

        {/* Weekly Activity */}
        <motion.div custom={5} variants={card} initial="hidden" animate="show" className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Weekly Activity</h3>
            <span className="text-xs text-white/30">{thisWeekWorkouts}/{profile.weeklyTarget || 5} days</span>
          </div>
          <WeeklyRing workouts={workouts} />
          <div className="mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (thisWeekWorkouts / (profile.weeklyTarget || 5)) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-violet-500"
            />
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div custom={6} variants={card} initial="hidden" animate="show" className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
        {activityFeed.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">No activity yet. Log your first workout!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activityFeed.slice(0, 5).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-lg w-7 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{item.message}</div>
                </div>
                <div className="text-xs text-white/30 font-mono shrink-0">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Log Buttons */}
      <motion.div custom={7} variants={card} initial="hidden" animate="show">
        <h3 className="font-semibold text-white mb-3">Quick Log</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '+ Log Workout', page: 'workouts', color: 'border-violet-500/30 hover:bg-violet-500/10 text-violet-400' },
            { label: '+ Log Meal', page: 'nutrition', color: 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400' },
            { label: '+ Log Weight', page: 'progress', color: 'border-amber-500/30 hover:bg-amber-500/10 text-amber-400' },
            { label: '+ Log Sleep', page: 'recovery', color: 'border-rose-500/30 hover:bg-rose-500/10 text-rose-400' },
          ].map(btn => (
            <motion.button key={btn.label} whileTap={{ scale: 0.96 }} onClick={() => onNavigate(btn.page)} className={`py-3 rounded-xl border bg-white/[0.03] text-sm font-semibold transition-all ${btn.color}`}>
              {btn.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
