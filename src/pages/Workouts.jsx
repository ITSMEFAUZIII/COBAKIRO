import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { EXERCISE_LIBRARY } from '../data/seedData';

// ─── Rest Timer ────────────────────────────────────────────────────────────────
function RestTimer({ defaultSeconds, onClose }) {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);
  const pct = (timeLeft / defaultSeconds) * 100;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-8 w-full max-w-xs text-center">
        <h3 className="text-white/60 text-sm mb-4">Rest Timer</h3>
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke={timeLeft === 0 ? '#10b981' : '#7c3aed'} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-mono font-bold ${timeLeft === 0 ? 'text-emerald-400' : 'text-white'}`}>
              {timeLeft === 0 ? '✓' : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
            </span>
          </div>
        </div>
        {timeLeft === 0 && <p className="text-emerald-400 text-sm mb-4">Rest complete! Back to work.</p>}
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
            {running ? 'Pause' : 'Resume'}
          </button>
          <button onClick={() => { setTimeLeft(defaultSeconds); setRunning(true); }} className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">↺</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">Done</button>
        </div>
      </div>
    </motion.div>
  );
}


// ─── Exercise Picker Modal ──────────────────────────────────────────────────────
function ExercisePicker({ onSelect, onClose, customExercises }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const allExercises = useMemo(() => [...EXERCISE_LIBRARY, ...customExercises], [customExercises]);
  const categories = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio'];
  const filtered = useMemo(() => allExercises.filter(e => {
    const matchCat = filter === 'All' || e.category === filter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.muscleGroup.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [allExercises, filter, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        className="bg-[#141414] border border-white/[0.07] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-white">Add Exercise</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">✕</button>
        </div>
        <div className="p-4 space-y-3 border-b border-white/[0.06]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"/>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filtered.map(ex => (
            <button key={ex.id} onClick={() => onSelect(ex)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left group">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">{ex.name}</div>
                <div className="text-xs text-white/40">{ex.muscleGroup} · {ex.equipment}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${ex.category === 'Push' ? 'bg-violet-500/20 text-violet-400' : ex.category === 'Pull' ? 'bg-emerald-500/20 text-emerald-400' : ex.category === 'Legs' ? 'bg-amber-500/20 text-amber-400' : ex.category === 'Core' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>{ex.category}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">No exercises found. Try a different search.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}


// ─── Log Workout Tab ───────────────────────────────────────────────────────────
function LogWorkout({ onSaved }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { profile = {}, customExercises = [], prs = [] } = state || {};
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [startTime] = useState(Date.now());

  const addExercise = useCallback((ex) => {
    setExercises(prev => [...prev, { ...ex, instanceId: Date.now(), sets: [{ reps: '', weight: '' }], notes: '' }]);
    setShowPicker(false);
  }, []);

  const updateSet = useCallback((exIdx, setIdx, field, val) => {
    setExercises(prev => prev.map((e, i) => i !== exIdx ? e : { ...e, sets: e.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: val }) }));
  }, []);

  const addSet = useCallback((exIdx) => {
    setExercises(prev => prev.map((e, i) => i !== exIdx ? e : { ...e, sets: [...e.sets, { ...e.sets[e.sets.length - 1] }] }));
  }, []);

  const removeSet = useCallback((exIdx, setIdx) => {
    setExercises(prev => prev.map((e, i) => i !== exIdx ? e : { ...e, sets: e.sets.filter((_, j) => j !== setIdx) }));
  }, []);

  const removeExercise = useCallback((exIdx) => {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) { toast('Give your workout a name!', 'warning'); return; }
    if (exercises.length === 0) { toast('Add at least one exercise!', 'warning'); return; }
    const duration = Math.round((Date.now() - startTime) / 60000);
    const workout = { id: `w${Date.now()}`, name: name.trim(), date, notes, duration: Math.max(duration, 1), exercises };
    // Check for new PRs
    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (!s.weight || !s.reps) return;
        const w = parseFloat(s.weight);
        const existing = prs.find(p => p.exerciseId === ex.id);
        if (!existing || w > existing.value) {
          dispatch({ type: 'ADD_PR', payload: { exerciseId: ex.id, exerciseName: ex.name, value: w, unit: profile.unit === 'imperial' ? 'lbs' : 'kg', date } });
          toast(`New PR! ${ex.name} ${w}${profile.unit === 'imperial' ? 'lbs' : 'kg'} 🏆`, 'success');
        }
      });
    });
    dispatch({ type: 'ADD_WORKOUT', payload: workout });
    toast('Workout saved! 💪', 'success');
    onSaved?.();
    setName(''); setExercises([]); setNotes('');
  }, [name, date, notes, exercises, prs, dispatch, toast, profile, startTime, onSaved]);

  return (
    <div className="space-y-4">
      {/* Header inputs */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Workout name (e.g. Push Day A)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold placeholder-white/30 focus:outline-none focus:border-violet-500 text-lg transition-colors"/>
        <div className="flex gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"/>
          <button onClick={() => setShowTimer(true)} className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors">
            ⏱ Rest Timer
          </button>
        </div>
      </div>

      {/* Exercise blocks */}
      {exercises.map((ex, exIdx) => (
        <motion.div key={ex.instanceId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-semibold text-white">{ex.name}</div>
              <div className="text-xs text-white/40">{ex.muscleGroup} · {ex.equipment}</div>
            </div>
            <button onClick={() => removeExercise(exIdx)} className="text-white/30 hover:text-rose-400 transition-colors text-lg w-7 h-7 flex items-center justify-center">✕</button>
          </div>
          {/* Set headers */}
          <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-white/30 font-mono px-1">
            <span className="col-span-1">Set</span>
            <span className="col-span-4">Weight ({profile.unit === 'imperial' ? 'lbs' : 'kg'})</span>
            <span className="col-span-4">Reps</span>
            <span className="col-span-3"></span>
          </div>
          {ex.sets.map((set, setIdx) => (
            <div key={setIdx} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <span className="col-span-1 text-xs font-mono text-white/40 text-center">{setIdx + 1}</span>
              <input type="number" value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)} placeholder="0" className="col-span-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono text-center focus:outline-none focus:border-violet-500 transition-colors"/>
              <input type="number" value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)} placeholder="0" className="col-span-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono text-center focus:outline-none focus:border-violet-500 transition-colors"/>
              <button onClick={() => removeSet(exIdx, setIdx)} className="col-span-3 text-white/20 hover:text-rose-400 transition-colors text-xs flex items-center justify-center">Remove</button>
            </div>
          ))}
          <button onClick={() => addSet(exIdx)} className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">+ Add Set</button>
          <input value={ex.notes} onChange={e => setExercises(prev => prev.map((e2, i) => i !== exIdx ? e2 : { ...e2, notes: e.target.value }))} placeholder="Notes for this exercise..." className="mt-3 w-full bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2 text-white/60 text-xs placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"/>
        </motion.div>
      ))}

      {/* Add exercise + save */}
      <div className="flex gap-3">
        <button onClick={() => setShowPicker(true)} className="flex-1 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:border-violet-500/50 hover:text-violet-400 text-sm font-medium transition-all">
          + Add Exercise
        </button>
        <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/20">
          Save Workout
        </button>
      </div>

      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Workout notes (how you felt, PRs, etc.)" rows={2} className="w-full bg-transparent text-white/60 text-sm placeholder-white/20 focus:outline-none resize-none"/>
      </div>

      <AnimatePresence>
        {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} customExercises={customExercises} />}
        {showTimer && <RestTimer defaultSeconds={profile.restTimer || 90} onClose={() => setShowTimer(false)} />}
      </AnimatePresence>
    </div>
  );
}


// ─── History Tab ───────────────────────────────────────────────────────────────
function WorkoutHistory() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { workouts = [] } = state || {};
  const [expanded, setExpanded] = useState(null);
  const sorted = useMemo(() => [...workouts].sort((a, b) => b.date.localeCompare(a.date)), [workouts]);

  const CATEGORY_COLORS = { Push: 'bg-violet-500/20 text-violet-400', Pull: 'bg-emerald-500/20 text-emerald-400', Legs: 'bg-amber-500/20 text-amber-400', Cardio: 'bg-rose-500/20 text-rose-400', Core: 'bg-blue-500/20 text-blue-400' };
  const getCategory = (w) => { const names = w.exercises?.map(e => e.category) || []; return names[0] || 'Workout'; };

  const getVolume = (w) => Math.round(w.exercises?.reduce((s, ex) => s + ex.sets.reduce((ss, set) => ss + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0) || 0);

  if (sorted.length === 0) return (
    <div className="text-center py-20 text-white/30">
      <div className="text-6xl mb-4">📋</div>
      <p className="font-medium">No workouts logged yet.</p>
      <p className="text-sm mt-1">Log your first session to see your history.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {sorted.map(w => (
        <motion.div key={w.id} layout className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:bg-[#181818] transition-colors">
          <button className="w-full p-5 text-left" onClick={() => setExpanded(e => e === w.id ? null : w.id)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{w.name}</div>
                <div className="text-xs text-white/40 mt-0.5">{new Date(w.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[getCategory(w)] || 'bg-white/10 text-white/50'}`}>{getCategory(w)}</span>
                <span className="text-white/30 text-sm">{expanded === w.id ? '▲' : '▼'}</span>
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              <span className="text-xs text-white/40">⏱ {w.duration || 0}min</span>
              <span className="text-xs text-white/40">🏋️ {w.exercises?.length || 0} exercises</span>
              <span className="text-xs text-white/40 font-mono">{getVolume(w).toLocaleString()} kg vol.</span>
            </div>
          </button>
          <AnimatePresence>
            {expanded === w.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-3">
                  {w.exercises?.map((ex, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium text-white/80 mb-1">{ex.name}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ex.sets.map((s, j) => (
                          <span key={j} className="text-xs font-mono bg-white/5 px-2 py-1 rounded-lg text-white/50">{s.weight || 0}kg × {s.reps || 0}</span>
                        ))}
                      </div>
                      {ex.notes && <div className="text-xs text-white/30 mt-1 italic">{ex.notes}</div>}
                    </div>
                  ))}
                  {w.notes && <div className="text-xs text-white/40 italic border-t border-white/[0.06] pt-3">"{w.notes}"</div>}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { dispatch({ type: 'DELETE_WORKOUT', payload: w.id }); toast('Workout deleted', 'info'); }} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors">Delete</button>
                    <button onClick={() => {
                      const copy = { ...w, id: `w${Date.now()}`, name: `${w.name} (Copy)`, date: new Date().toISOString().split('T')[0] };
                      dispatch({ type: 'ADD_WORKOUT', payload: copy }); toast('Workout duplicated', 'success');
                    }} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors">Duplicate</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}


// ─── Exercise Library Tab ──────────────────────────────────────────────────────
function ExerciseLibraryTab() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { customExercises = [] } = state || {};
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEx, setNewEx] = useState({ name: '', muscleGroup: '', equipment: '', category: 'Push', notes: '' });

  const all = useMemo(() => [...EXERCISE_LIBRARY, ...customExercises], [customExercises]);
  const categories = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio'];
  const filtered = useMemo(() => all.filter(e => {
    const mc = filter === 'All' || e.category === filter;
    const ms = e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscleGroup || '').toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  }), [all, filter, search]);

  const COLORS = { Push: 'bg-violet-500/20 text-violet-400', Pull: 'bg-emerald-500/20 text-emerald-400', Legs: 'bg-amber-500/20 text-amber-400', Core: 'bg-rose-500/20 text-rose-400', Cardio: 'bg-blue-500/20 text-blue-400' };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"/>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">+ Custom</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>{c}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-[#141414] border border-white/[0.07] rounded-xl p-4 hover:bg-[#181818] transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-medium text-white text-sm">{ex.name}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${COLORS[ex.category] || 'bg-white/10 text-white/50'}`}>{ex.category}</span>
            </div>
            <div className="text-xs text-white/40 mb-2">{ex.muscleGroup} · {ex.equipment}</div>
            {ex.notes && <div className="text-xs text-white/30 italic">{ex.notes}</div>}
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Add Custom Exercise</h3>
                <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>
              {[['name', 'Exercise Name'], ['muscleGroup', 'Muscle Group'], ['equipment', 'Equipment']].map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                  <input value={newEx[field]} onChange={e => setNewEx(n => ({ ...n, [field]: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"/>
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {['Push','Pull','Legs','Core','Cardio'].map(c => (
                    <button key={c} onClick={() => setNewEx(n => ({ ...n, category: c }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${newEx.category === c ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => {
                if (!newEx.name) return;
                dispatch({ type: 'ADD_CUSTOM_EXERCISE', payload: { ...newEx, id: `custom-${Date.now()}` } });
                toast('Exercise added!', 'success');
                setShowAdd(false);
                setNewEx({ name: '', muscleGroup: '', equipment: '', category: 'Push', notes: '' });
              }} className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">Add Exercise</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── Main Workouts Page ────────────────────────────────────────────────────────
export default function Workouts() {
  const [tab, setTab] = useState('log');
  const TABS = [{ id: 'log', label: 'Log Workout' }, { id: 'history', label: 'History' }, { id: 'library', label: 'Exercise Library' }];

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Workouts 💪</h1>
        <p className="text-white/40 text-sm">Track your training sessions.</p>
      </motion.div>
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${tab === t.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
            {tab === t.id && <motion.div layoutId="workout-tab" className="absolute inset-0 rounded-lg bg-violet-600" style={{ zIndex: -1 }} />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === 'log' && <LogWorkout onSaved={() => setTab('history')} />}
          {tab === 'history' && <WorkoutHistory />}
          {tab === 'library' && <ExerciseLibraryTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
