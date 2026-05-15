import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

const MOOD_OPTIONS = ['😴', '😐', '🙂', '😊', '🔥'];
const QUALITY_COLORS = ['#f43f5e', '#f43f5e', '#f59e0b', '#f59e0b', '#10b981'];

function RecoveryScore({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';
  const label = score >= 70 ? "You're good to train! 🔥" : score >= 40 ? 'Light training recommended' : 'Rest day recommended 😴';
  const r = 50;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;

  return (
    <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center">
      <h3 className="font-semibold text-white mb-5 self-start">Recovery Score</h3>
      <div className="relative w-36 h-36 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-xs text-white/40">/ 100</span>
        </div>
      </div>
      <p className="text-sm text-center" style={{ color }}>{label}</p>
    </div>
  );
}

export default function Recovery() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { sleepLogs = [], wellnessLogs = [] } = state || {};

  const today = new Date().toISOString().split('T')[0];
  const [sleepForm, setSleepForm] = useState({ bedtime: '22:30', wakeTime: '07:00', quality: 4 });
  const [wellnessForm, setWellnessForm] = useState({ energy: 7, mood: '😊', soreness: 3, stress: 3 });

  const calcDuration = (bed, wake) => {
    try {
      const [bh, bm] = bed.split(':').map(Number);
      const [wh, wm] = wake.split(':').map(Number);
      let mins = (wh * 60 + wm) - (bh * 60 + bm);
      if (mins < 0) mins += 24 * 60;
      return Math.round(mins / 6) / 10;
    } catch { return 0; }
  };

  const handleSaveSleep = useCallback(() => {
    const duration = calcDuration(sleepForm.bedtime, sleepForm.wakeTime);
    dispatch({ type: 'ADD_SLEEP_LOG', payload: { id: `sl${Date.now()}`, date: today, ...sleepForm, duration } });
    toast('Sleep logged! 😴', 'success');
  }, [sleepForm, dispatch, toast, today]);

  const handleSaveWellness = useCallback(() => {
    dispatch({ type: 'ADD_WELLNESS_LOG', payload: { id: `wn${Date.now()}`, date: today, ...wellnessForm } });
    toast('Wellness check-in saved!', 'success');
  }, [wellnessForm, dispatch, toast, today]);

  // 7-day sleep chart
  const sleepChart = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = sleepLogs.find(l => l.date === dateStr);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: log?.duration || 0, quality: log?.quality || 0 };
  }), [sleepLogs]);

  const avgSleep = useMemo(() => {
    const valid = sleepChart.filter(d => d.hours > 0);
    return valid.length ? (valid.reduce((s, d) => s + d.hours, 0) / valid.length).toFixed(1) : 0;
  }, [sleepChart]);

  // Recovery score calculation
  const recoveryScore = useMemo(() => {
    const todaySleep = sleepLogs.find(l => l.date === today) || sleepLogs[0];
    const todayWellness = wellnessLogs.find(l => l.date === today) || wellnessLogs[0];
    if (!todaySleep && !todayWellness) return 72;
    const sleepScore = todaySleep ? Math.min(100, (todaySleep.duration / 8) * 50 + (todaySleep.quality / 5) * 20) : 35;
    const wellnessScore = todayWellness ? (todayWellness.energy / 10) * 20 - (todayWellness.soreness / 10) * 15 - (todayWellness.stress / 10) * 15 : 15;
    return Math.max(0, Math.min(100, Math.round(sleepScore + wellnessScore)));
  }, [sleepLogs, wellnessLogs, today]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Recovery 😴</h1>
        <p className="text-white/40 text-sm">Sleep, wellness, and readiness.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recovery Score */}
        <RecoveryScore score={recoveryScore} />

        {/* Sleep Logger */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Log Sleep</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Bedtime</label>
              <input type="time" value={sleepForm.bedtime} onChange={e => setSleepForm(f => ({ ...f, bedtime: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"/>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Wake Time</label>
              <input type="time" value={sleepForm.wakeTime} onChange={e => setSleepForm(f => ({ ...f, wakeTime: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"/>
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-4 py-2 text-center">
            <span className="text-sm text-white/50">Duration: </span>
            <span className="font-mono font-bold text-white">{calcDuration(sleepForm.bedtime, sleepForm.wakeTime)}h</span>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-2 block">Sleep Quality</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(q => (
                <button key={q} onClick={() => setSleepForm(f => ({ ...f, quality: q }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${sleepForm.quality >= q ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}>★</button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveSleep} className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">Save Sleep Log</button>
        </div>
      </div>

      {/* 7-day sleep chart */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Sleep This Week</h3>
          <span className="text-xs font-mono text-white/40">Avg: {avgSleep}h</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={sleepChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 10]} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} formatter={(v) => [`${v}h`, 'Sleep']} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {sleepChart.map((entry, i) => (
                <Cell key={i} fill={QUALITY_COLORS[Math.max(0, (entry.quality || 1) - 1)]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Wellness Check-in */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-white">Daily Wellness Check-in</h3>

        {/* Mood */}
        <div>
          <label className="text-sm text-white/60 mb-3 block">How are you feeling?</label>
          <div className="flex gap-3 justify-center">
            {MOOD_OPTIONS.map(m => (
              <button key={m} onClick={() => setWellnessForm(f => ({ ...f, mood: m }))}
                className={`text-3xl transition-all ${wellnessForm.mood === m ? 'scale-125 opacity-100' : 'opacity-40 hover:opacity-70'}`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        {[
          { key: 'energy', label: 'Energy Level', min: 1, max: 10, color: '#f59e0b' },
          { key: 'soreness', label: 'Muscle Soreness', min: 1, max: 10, color: '#f43f5e' },
          { key: 'stress', label: 'Stress Level', min: 1, max: 10, color: '#3b82f6' },
        ].map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">{label}</span>
              <span className="font-mono font-bold" style={{ color }}>{wellnessForm[key]}/10</span>
            </div>
            <input type="range" min={1} max={10} value={wellnessForm[key]}
              onChange={e => setWellnessForm(f => ({ ...f, [key]: parseInt(e.target.value) }))}
              className="w-full" style={{ accentColor: color }} />
          </div>
        ))}

        <button onClick={handleSaveWellness} className="w-full py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/80 text-white text-sm font-semibold transition-colors">Save Check-in</button>
      </div>
    </div>
  );
}
