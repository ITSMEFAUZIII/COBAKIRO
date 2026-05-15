import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

// ─── Confetti ────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#7c3aed', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'][i % 5],
    delay: Math.random() * 0.5,
    dur: 1.5 + Math.random() * 1,
  })), []);

  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id} className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${p.x}%`, top: '-10px', background: p.color }}
          animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }} />
      ))}
    </div>
  );
}

const GOAL_TYPES = [
  { value: 'weight', label: 'Weight Goal', emoji: '⚖️', desc: 'Target body weight' },
  { value: 'strength', label: 'Strength Goal', emoji: '💪', desc: 'Beat a lift target' },
  { value: 'habit', label: 'Habit Goal', emoji: '🔥', desc: 'Consistency streak' },
  { value: 'custom', label: 'Custom Goal', emoji: '🎯', desc: 'Anything else' },
];

function AddGoalModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ type: 'strength', title: '', description: '', target: '', current: '', unit: 'kg', deadline: '', notes: '' });
  const handle = f => e => setForm(v => ({ ...v, [f]: e.target.value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">New Goal</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-2 block">Goal Type</label>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_TYPES.map(g => (
              <button key={g.value} onClick={() => setForm(v => ({ ...v, type: g.value }))}
                className={`p-3 rounded-xl border text-left transition-all ${form.type === g.value ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>
                <span className="text-lg">{g.emoji}</span>
                <div className="text-xs font-medium mt-1">{g.label}</div>
              </button>
            ))}
          </div>
        </div>
        {[['title', 'Goal Title', 'e.g. Bench Press 100kg'], ['description', 'Description', 'Short description']].map(([f, label, ph]) => (
          <div key={f}>
            <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
            <input value={form[f]} onChange={handle(f)} placeholder={ph} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"/>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          {[['current', 'Current'], ['target', 'Target'], ['unit', 'Unit']].map(([f, label]) => (
            <div key={f}>
              <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
              <input type={f === 'unit' ? 'text' : 'number'} value={form[f]} onChange={handle(f)} placeholder={f === 'unit' ? 'kg' : '0'} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"/>
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">Deadline</label>
          <input type="date" value={form.deadline} onChange={handle('deadline')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"/>
        </div>
        <button onClick={() => { if (!form.title || !form.target) return; onAdd({ ...form, id: `g${Date.now()}`, target: +form.target, current: +form.current || 0, status: 'active', createdAt: new Date().toISOString().split('T')[0] }); onClose(); }}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">Create Goal</button>
      </motion.div>
    </motion.div>
  );
}


function GoalCard({ goal, onComplete, onDelete, onUpdate }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null;
  const isComplete = pct >= 100;
  const COLORS = { weight: '#10b981', strength: '#7c3aed', habit: '#f59e0b', custom: '#3b82f6' };
  const color = COLORS[goal.type] || '#7c3aed';
  const [editCurrent, setEditCurrent] = useState(false);
  const [newCurrent, setNewCurrent] = useState(String(goal.current));

  const TYPE_LABELS = { weight: '⚖️', strength: '💪', habit: '🔥', custom: '🎯' };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-[#141414] border rounded-2xl p-5 transition-colors ${isComplete ? 'border-emerald-500/30' : 'border-white/[0.07] hover:bg-[#181818]'}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span>{TYPE_LABELS[goal.type]}</span>
            <h4 className="font-semibold text-white truncate">{goal.title}</h4>
          </div>
          {goal.description && <p className="text-xs text-white/40 truncate">{goal.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {daysLeft !== null && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${daysLeft < 0 ? 'bg-rose-500/20 text-rose-400' : daysLeft < 14 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40'}`}>
              {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/40">{goal.current} / {goal.target} {goal.unit}</span>
          <span className="font-mono font-bold" style={{ color }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: color }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      </div>

      {/* Update current */}
      {editCurrent ? (
        <div className="flex gap-2 mb-3">
          <input type="number" value={newCurrent} onChange={e => setNewCurrent(e.target.value)} className="flex-1 bg-white/5 border border-violet-500/50 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none" />
          <button onClick={() => { onUpdate({ ...goal, current: parseFloat(newCurrent) || 0 }); setEditCurrent(false); }} className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs">Save</button>
          <button onClick={() => setEditCurrent(false)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs">Cancel</button>
        </div>
      ) : null}

      <div className="flex gap-2 mt-3">
        <button onClick={() => setEditCurrent(true)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/50 text-xs hover:bg-white/10 transition-colors">Update Progress</button>
        {isComplete && (
          <button onClick={() => onComplete(goal)} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">✓ Mark Complete</button>
        )}
        <button onClick={() => onDelete(goal.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400/60 text-xs hover:bg-rose-500/20 transition-colors">Delete</button>
      </div>
      {goal.notes && <p className="text-xs text-white/30 italic mt-3 border-t border-white/[0.04] pt-3">"{goal.notes}"</p>}
    </motion.div>
  );
}

export default function Goals() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { goals = [], completedGoals = [] } = state || {};
  const [showAdd, setShowAdd] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tab, setTab] = useState('active');

  const handleAdd = useCallback((goal) => {
    dispatch({ type: 'ADD_GOAL', payload: goal });
    toast('Goal created! 🎯', 'success');
  }, [dispatch, toast]);

  const handleComplete = useCallback((goal) => {
    dispatch({ type: 'COMPLETE_GOAL', payload: goal });
    setShowConfetti(true);
    toast('🎉 Goal achieved! Incredible work!', 'success');
    setTimeout(() => setShowConfetti(false), 3000);
  }, [dispatch, toast]);

  const handleDelete = useCallback((id) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
    toast('Goal removed', 'info');
  }, [dispatch, toast]);

  const handleUpdate = useCallback((goal) => {
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
  }, [dispatch]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
      <Confetti active={showConfetti} />
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Goals 🎯</h1>
          <p className="text-white/40 text-sm">Set targets, track progress.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/20">
          + New Goal
        </button>
      </motion.div>

      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit">
        {[['active', `Active (${goals.length})`], ['completed', `Completed (${completedGoals.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${tab === id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
            {tab === id && <motion.div layoutId="goals-tab" className="absolute inset-0 rounded-lg bg-violet-600" style={{ zIndex: -1 }} />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'active' && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {goals.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-white/40 font-medium">No active goals.</p>
                <p className="text-white/25 text-sm mt-1">Set your first goal to get started!</p>
                <button onClick={() => setShowAdd(true)} className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
                  + Create Goal
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {goals.map(g => <GoalCard key={g.id} goal={g} onComplete={handleComplete} onDelete={handleDelete} onUpdate={handleUpdate} />)}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
        {tab === 'completed' && (
          <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {completedGoals.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <div className="text-6xl mb-4">🏆</div>
                <p>No completed goals yet. Keep working!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {completedGoals.map(g => (
                  <div key={g.id} className="bg-[#141414] border border-emerald-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-emerald-400">✓</span>
                      <h4 className="font-semibold text-white">{g.title}</h4>
                    </div>
                    <p className="text-xs text-white/40 mb-3">{g.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-mono">Target: {g.target} {g.unit}</span>
                      <span className="text-xs text-white/30">Achieved {new Date(g.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
