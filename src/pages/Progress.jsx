import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { useWorkoutStats } from '../hooks/useWorkoutStats';
import { useStreak } from '../hooks/useStreak';

const CHART_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];

function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="text-white/50 text-xs mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-mono font-bold" style={{ color: p.color || '#7c3aed' }}>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{unit}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = 'text-violet-400', icon }) {
  return (
    <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 hover:bg-[#181818] transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}


export default function Progress() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { workouts = [], weightLogs = [], prs = [], bodyMeasurements = [], profile = {} } = state || {};
  const stats = useWorkoutStats(workouts);
  const { currentStreak, longestStreak } = useStreak(workouts);
  const [weightRange, setWeightRange] = useState(30);
  const [showMeasForm, setShowMeasForm] = useState(false);
  const [measForm, setMeasForm] = useState({ chest: '', waist: '', hips: '', arms: '', legs: '' });

  // Weight chart data
  const weightChartData = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - weightRange);
    return [...weightLogs]
      .filter(l => new Date(l.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(l => ({ date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: parseFloat(l.weight) }));
  }, [weightLogs, weightRange]);

  // Muscle distribution
  const muscleData = useMemo(() => {
    return Object.entries(stats.muscleCount).map(([name, value]) => ({ name, value }));
  }, [stats.muscleCount]);

  // Latest measurements
  const latestMeas = bodyMeasurements[0];
  const prevMeas = bodyMeasurements[1];
  const measFields = ['chest', 'waist', 'hips', 'arms', 'legs'];

  const handleSaveMeas = () => {
    const entry = { id: `bm${Date.now()}`, date: new Date().toISOString().split('T')[0], ...Object.fromEntries(measFields.map(f => [f, parseFloat(measForm[f]) || 0])) };
    dispatch({ type: 'ADD_BODY_MEASUREMENT', payload: entry });
    toast('Measurements saved!', 'success');
    setShowMeasForm(false);
    setMeasForm({ chest: '', waist: '', hips: '', arms: '', legs: '' });
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Progress 📈</h1>
        <p className="text-white/40 text-sm">Your fitness journey in numbers.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon="🏋️" label="Total Workouts" value={stats.totalWorkouts} color="text-violet-400" />
        <StatCard icon="⚖️" label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}t`} sub="tonnes lifted" color="text-emerald-400" />
        <StatCard icon="💪" label="Most Trained" value={stats.mostTrained} color="text-amber-400" />
        <StatCard icon="🔥" label="Best Streak" value={`${longestStreak}d`} color="text-rose-400" />
        <StatCard icon="⏱" label="Avg Duration" value={`${stats.avgDuration}m`} color="text-blue-400" />
        <StatCard icon="🏆" label="PRs Set" value={prs.length} color="text-violet-400" />
      </div>

      {/* Weight Chart */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Body Weight Timeline</h3>
          <div className="flex gap-1">
            {[30, 90, 180].map(r => (
              <button key={r} onClick={() => setWeightRange(r)} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${weightRange === r ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{r}d</button>
            ))}
          </div>
        </div>
        {weightChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip unit=" kg" />} />
              <Line type="monotone" dataKey="weight" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#7c3aed' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">Log more weight entries to see trend</div>
        )}
      </div>

      {/* Volume + Muscle Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Weekly Volume</h3>
          {stats.weeklyVolumeChart.some(w => w.volume > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.weeklyVolumeChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip unit=" kg" />} />
                <Bar dataKey="volume" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-sm">No volume data yet</div>
          )}
        </div>

        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Muscle Distribution</h3>
          {muscleData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={muscleData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {muscleData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {muscleData.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-white/60 truncate">{d.name}</span>
                    <span className="text-xs font-mono text-white/40 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-sm">No workout data yet</div>
          )}
        </div>
      </div>

      {/* PR Tracker */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Personal Records 🏆</h3>
        {prs.length === 0 ? (
          <div className="text-white/30 text-sm text-center py-6">No PRs set yet. Log workouts to track your bests!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-white/30 border-b border-white/[0.06]">
                  <th className="pb-2 text-left font-medium">Exercise</th>
                  <th className="pb-2 text-right font-medium font-mono">Weight</th>
                  <th className="pb-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {prs.map(pr => (
                  <tr key={pr.exerciseId} className="group">
                    <td className="py-3 text-sm text-white/80">{pr.exerciseName}</td>
                    <td className="py-3 text-right">
                      <span className="font-mono font-bold text-rose-400">{pr.value}{pr.unit}</span>
                    </td>
                    <td className="py-3 text-right text-xs text-white/30 font-mono">
                      {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Body Measurements */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Body Measurements</h3>
          <button onClick={() => setShowMeasForm(v => !v)} className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 text-xs hover:bg-violet-600/30 transition-colors">+ Log Measurements</button>
        </div>
        {showMeasForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {measFields.map(f => (
                <div key={f}>
                  <label className="text-xs text-white/40 capitalize mb-1 block">{f}</label>
                  <input type="number" value={measForm[f]} onChange={e => setMeasForm(m => ({ ...m, [f]: e.target.value }))} placeholder="cm" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-sm font-mono text-center focus:outline-none focus:border-violet-500 transition-colors"/>
                </div>
              ))}
            </div>
            <button onClick={handleSaveMeas} className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">Save</button>
          </motion.div>
        )}
        {latestMeas ? (
          <div className="grid grid-cols-5 gap-3">
            {measFields.map(f => {
              const curr = latestMeas[f];
              const prev = prevMeas?.[f];
              const delta = prev ? (curr - prev).toFixed(1) : null;
              return (
                <div key={f} className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <div className="text-xs text-white/40 capitalize mb-1">{f}</div>
                  <div className="text-lg font-mono font-bold text-white">{curr}</div>
                  <div className="text-xs text-white/30">cm</div>
                  {delta !== null && (
                    <div className={`text-xs font-mono mt-1 ${parseFloat(delta) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {parseFloat(delta) > 0 ? '↑' : '↓'}{Math.abs(delta)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-white/30 text-sm">Log your first measurements to track changes.</div>
        )}
      </div>
    </div>
  );
}
