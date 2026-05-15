import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { generateSeedData } from '../data/seedData';

function Section({ title, children }) {
  return (
    <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-white text-sm uppercase tracking-wider text-white/40">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-sm text-white/70 mb-1.5 block font-medium">{label}</label>
      {hint && <p className="text-xs text-white/30 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${value ? 'bg-violet-600' : 'bg-white/20'}`}>
      <motion.span animate={{ x: value ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute w-5 h-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}

export default function Settings() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { profile = {} } = state || {};
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [form, setForm] = useState({
    name: profile.name || '',
    age: profile.age || '',
    height: profile.height || '',
    startingWeight: profile.startingWeight || '',
    fitnessLevel: profile.fitnessLevel || 'intermediate',
    primaryGoal: profile.primaryGoal || 'build_muscle',
    unit: profile.unit || 'metric',
    weeklyTarget: profile.weeklyTarget || 5,
    calorieGoal: profile.calorieGoal || 2800,
    macroTargets: profile.macroTargets || { protein: 35, carbs: 45, fats: 20 },
    restTimer: profile.restTimer || 90,
  });

  const handle = f => e => setForm(v => ({ ...v, [f]: e.target.value }));
  const handleMacro = f => e => setForm(v => ({ ...v, macroTargets: { ...v.macroTargets, [f]: parseInt(e.target.value) || 0 } }));

  const save = useCallback(() => {
    dispatch({ type: 'UPDATE_PROFILE', payload: form });
    toast('Settings saved!', 'success');
  }, [form, dispatch, toast]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gymlife_export_${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Data exported!', 'success');
  }, [state, toast]);

  const importData = useCallback(() => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { dispatch({ type: 'INIT', payload: JSON.parse(ev.target.result) }); toast('Data imported!', 'success'); }
        catch { toast('Invalid file!', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [dispatch, toast]);

  const clearData = useCallback(() => {
    localStorage.removeItem('gymlife_v1');
    dispatch({ type: 'CLEAR_ALL' });
    toast('All data cleared.', 'info');
    setShowClearConfirm(false);
  }, [dispatch, toast]);

  const macroSum = form.macroTargets.protein + form.macroTargets.carbs + form.macroTargets.fats;

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Settings ⚙️</h1>
        <p className="text-white/40 text-sm">Profile & preferences.</p>
      </motion.div>

      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-violet-700 flex items-center justify-center text-xl font-bold text-white">
            {(form.name || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold">{form.name || 'Athlete'}</div>
            <div className="text-white/40 text-sm capitalize">{form.fitnessLevel}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input value={form.name} onChange={handle('name')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"/>
          </Field>
          <Field label="Age">
            <input type="number" value={form.age} onChange={handle('age')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"/>
          </Field>
          <Field label={`Height (${form.unit === 'imperial' ? 'in' : 'cm'})`}>
            <input type="number" value={form.height} onChange={handle('height')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"/>
          </Field>
          <Field label={`Starting Weight (${form.unit === 'imperial' ? 'lbs' : 'kg'})`}>
            <input type="number" value={form.startingWeight} onChange={handle('startingWeight')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"/>
          </Field>
        </div>
        <Field label="Fitness Level">
          <div className="flex gap-2">
            {['beginner', 'intermediate', 'advanced'].map(l => (
              <button key={l} onClick={() => setForm(f => ({ ...f, fitnessLevel: l }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-all ${form.fitnessLevel === l ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Primary Goal">
          <div className="grid grid-cols-2 gap-2">
            {[['lose_fat', '🔥 Lose Fat'], ['build_muscle', '💪 Build Muscle'], ['maintain', '⚖️ Maintain'], ['performance', '🏆 Performance']].map(([v, l]) => (
              <button key={v} onClick={() => setForm(f => ({ ...f, primaryGoal: v }))}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${form.primaryGoal === v ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>{l}</button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Field label="Unit System">
          <div className="flex gap-2">
            <button onClick={() => setForm(f => ({ ...f, unit: 'metric' }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.unit === 'metric' ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>Metric (kg/cm)</button>
            <button onClick={() => setForm(f => ({ ...f, unit: 'imperial' }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.unit === 'imperial' ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>Imperial (lbs/in)</button>
          </div>
        </Field>
        <Field label={`Weekly Workout Target: ${form.weeklyTarget} days`}>
          <input type="range" min={1} max={7} value={form.weeklyTarget} onChange={e => setForm(f => ({ ...f, weeklyTarget: parseInt(e.target.value) }))} className="w-full accent-violet-500"/>
          <div className="flex justify-between text-xs text-white/30 mt-1"><span>1</span><span>7</span></div>
        </Field>
        <Field label={`Calorie Goal: ${form.calorieGoal} kcal`}>
          <input type="range" min={1200} max={5000} step={50} value={form.calorieGoal} onChange={e => setForm(f => ({ ...f, calorieGoal: parseInt(e.target.value) }))} className="w-full accent-violet-500"/>
        </Field>
        <Field label={`Macro Targets (total: ${macroSum}%)`} hint="Should add up to 100%">
          <div className="grid grid-cols-3 gap-3">
            {[['protein', 'Protein', '#7c3aed'], ['carbs', 'Carbs', '#10b981'], ['fats', 'Fats', '#f59e0b']].map(([key, label, color]) => (
              <div key={key} className="text-center">
                <div className="text-xs mb-1.5" style={{ color }}>{label}</div>
                <input type="number" value={form.macroTargets[key]} onChange={handleMacro(key)} min={0} max={100}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2.5 text-white text-sm font-mono text-center focus:outline-none focus:border-violet-500 transition-colors"/>
                <div className="text-xs text-white/30 mt-1">%</div>
              </div>
            ))}
          </div>
          {macroSum !== 100 && <p className="text-xs text-amber-400 mt-1">⚠ Total is {macroSum}%, should be 100%</p>}
        </Field>
        <Field label="Default Rest Timer">
          <div className="flex gap-2">
            {[60, 90, 120, 180].map(s => (
              <button key={s} onClick={() => setForm(f => ({ ...f, restTimer: s }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-mono border transition-all ${form.restTimer === s ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}>{s}s</button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Save */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={save}
        className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors shadow-lg shadow-violet-500/20">
        Save Settings
      </motion.button>

      {/* Data Management */}
      <Section title="Data Management">
        <div className="space-y-3">
          <button onClick={exportData} className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors text-left px-4">
            📥 Export All Data (JSON)
          </button>
          <button onClick={importData} className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors text-left px-4">
            📤 Import Data from JSON
          </button>
          <button onClick={() => setShowClearConfirm(true)} className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors text-left px-4">
            🗑️ Clear All Data
          </button>
        </div>
        <p className="text-xs text-white/25 mt-2">
          Data stored locally in your browser. Export regularly to back up.
          {/* TODO: Replace localStorage with Supabase/Firebase */}
        </p>
      </Section>

      {/* TODO: Add PWA manifest + service worker */}
      {/* TODO: Add auth with Clerk/Auth0 */}
      {/* TODO: Add social features (share workout) */}
      {/* TODO: Add AI workout suggestions */}

      {/* Clear Confirm Dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#141414] border border-rose-500/20 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-white text-lg mb-2">Clear All Data?</h3>
              <p className="text-white/50 text-sm mb-6">This will permanently delete all your workouts, logs, goals, and settings. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors">Cancel</button>
                <button onClick={clearData} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors">Delete Everything</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
