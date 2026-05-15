import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { useTheme, THEMES } from '../context/ThemeContext';

/* ── Shared card/section wrapper ─────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 20,
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>{hint}</p>}
      {children}
    </div>
  );
}

/* Shared inline input ────────────────────────────────────────────────────── */
function TInput({ type = 'text', value, onChange, placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="t-input"
    />
  );
}

/* Pill selector ─────────────────────────────────────────────────────────── */
function PillGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(([v, label]) => {
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, padding: '9px 4px', borderRadius: 12, border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-input)'}`,
            background: active ? 'var(--accent-light)' : 'var(--bg-input)',
            color: active ? 'var(--accent-text)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

/* Confirm Dialog ─────────────────────────────────────────────────────────── */
function ConfirmDialog({ open, onCancel, onConfirm, title, description, confirmLabel = 'Confirm', danger = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 12 }}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${danger ? 'var(--danger-light)' : 'var(--border-card)'}`,
              borderRadius: 20, padding: 28, width: '100%', maxWidth: 360,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>{description}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onCancel} style={{
                flex: 1, padding: '10px', borderRadius: 12, border: '1px solid var(--border-input)',
                background: 'var(--bg-input)', color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={onConfirm} style={{
                flex: 1, padding: '10px', borderRadius: 12, border: 'none',
                background: danger ? 'var(--danger)' : 'var(--accent)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
══════════════════════════════════════════════════════ */
export default function Settings() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { profile = {} } = state || {};

  const [showClearConfirm,   setShowClearConfirm]   = useState(false);
  const [showResetConfirm,   setShowResetConfirm]   = useState(false);

  const [form, setForm] = useState({
    name:           profile.name || '',
    age:            profile.age || '',
    height:         profile.height || '',
    startingWeight: profile.startingWeight || '',
    fitnessLevel:   profile.fitnessLevel || 'intermediate',
    primaryGoal:    profile.primaryGoal || 'build_muscle',
    unit:           profile.unit || 'metric',
    weeklyTarget:   profile.weeklyTarget || 5,
    calorieGoal:    profile.calorieGoal || 2800,
    macroTargets:   profile.macroTargets || { protein: 35, carbs: 45, fats: 20 },
    restTimer:      profile.restTimer || 90,
  });

  const handle      = f => e  => setForm(v => ({ ...v, [f]: e.target.value }));
  const handleMacro = f => e  => setForm(v => ({ ...v, macroTargets: { ...v.macroTargets, [f]: parseInt(e.target.value) || 0 } }));
  const macroSum    = form.macroTargets.protein + form.macroTargets.carbs + form.macroTargets.fats;

  const save = useCallback(() => {
    dispatch({ type: 'UPDATE_PROFILE', payload: form });
    toast('Settings saved!', 'success');
  }, [form, dispatch, toast]);

  /* Reset activity — clears all logs/workouts/PRs, keeps profile/goals/schedule */
  const resetActivity = useCallback(() => {
    dispatch({ type: 'RESET_ACTIVITY' });
    toast('All activity reset to zero. Fresh start! 🏁', 'info');
    setShowResetConfirm(false);
  }, [dispatch, toast]);

  /* Export / Import / Clear all */
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `gymlife_export_${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Data exported!', 'success');
  }, [state, toast]);

  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try { dispatch({ type: 'INIT', payload: JSON.parse(ev.target.result) }); toast('Data imported!', 'success'); }
        catch  { toast('Invalid file!', 'error'); }
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

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Settings ⚙️</h1>
        <p  style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Profile & preferences.</p>
      </motion.div>

      {/* ── THEME SWITCHER ──────────────────────────────────────────────────── */}
      <Section title="Appearance">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Choose a theme that matches your vibe.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.values(THEMES).map(t => {
            const active = theme === t.id;
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTheme(t.id)}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  borderRadius: 16,
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border-card)'}`,
                  background: active ? 'var(--accent-light)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  boxShadow: active ? '0 0 18px var(--accent-glow)' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
              >
                {/* Mini preview swatch */}
                <div style={{
                  width: 48, height: 32, borderRadius: 10,
                  background: t.id === 'dark'
                    ? 'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 100%)'
                    : 'linear-gradient(135deg,#e0f2fe 0%,#ffffff 100%)',
                  border: '1px solid var(--border-input)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative',
                }}>
                  {t.id === 'dark' ? (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed' }} />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 8px rgba(14,165,233,0.6)' }} />
                  )}
                </div>
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--accent-text)' : 'var(--text-secondary)' }}>{t.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{t.description}</span>
                {active && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, background: 'var(--accent)',
                    color: '#fff', borderRadius: 99, padding: '2px 8px',
                  }}>Active</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* ── PROFILE ─────────────────────────────────────────────────────────── */}
      <Section title="Profile">
        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {(form.name || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-heading)' }}>{form.name || 'Athlete'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{form.fitnessLevel}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Name">
            <TInput value={form.name} onChange={handle('name')} placeholder="Your name" />
          </Field>
          <Field label="Age">
            <TInput type="number" value={form.age} onChange={handle('age')} placeholder="24" />
          </Field>
          <Field label={`Height (${form.unit === 'imperial' ? 'in' : 'cm'})`}>
            <TInput type="number" value={form.height} onChange={handle('height')} placeholder="175" />
          </Field>
          <Field label={`Starting Weight (${form.unit === 'imperial' ? 'lbs' : 'kg'})`}>
            <TInput type="number" value={form.startingWeight} onChange={handle('startingWeight')} placeholder="75" />
          </Field>
        </div>

        <Field label="Fitness Level">
          <PillGroup value={form.fitnessLevel} onChange={v => setForm(f => ({ ...f, fitnessLevel: v }))}
            options={[['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced']]} />
        </Field>

        <Field label="Primary Goal">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['lose_fat','🔥 Lose Fat'],['build_muscle','💪 Build Muscle'],['maintain','⚖️ Maintain'],['performance','🏆 Performance']].map(([v, l]) => {
              const active = form.primaryGoal === v;
              return (
                <button key={v} onClick={() => setForm(f => ({ ...f, primaryGoal: v }))} style={{
                  padding: '10px', borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-input)'}`,
                  background: active ? 'var(--accent-light)' : 'var(--bg-input)',
                  color: active ? 'var(--accent-text)' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}>{l}</button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* ── PREFERENCES ─────────────────────────────────────────────────────── */}
      <Section title="Preferences">
        <Field label="Unit System">
          <PillGroup value={form.unit} onChange={v => setForm(f => ({ ...f, unit: v }))}
            options={[['metric','Metric (kg/cm)'],['imperial','Imperial (lbs/in)']]} />
        </Field>

        <Field label={`Weekly Workout Target: ${form.weeklyTarget} days`}>
          <input type="range" min={1} max={7} value={form.weeklyTarget}
            onChange={e => setForm(f => ({ ...f, weeklyTarget: parseInt(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
            <span>1 day</span><span>7 days</span>
          </div>
        </Field>

        <Field label={`Calorie Goal: ${form.calorieGoal} kcal`}>
          <input type="range" min={1200} max={5000} step={50} value={form.calorieGoal}
            onChange={e => setForm(f => ({ ...f, calorieGoal: parseInt(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </Field>

        <Field label={`Macro Targets (total: ${macroSum}%)`} hint="Should add up to 100%">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[['protein','Protein','var(--accent)'],['carbs','Carbs','var(--success)'],['fats','Fats','var(--warning)']].map(([key, label, color]) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 6 }}>{label}</div>
                <input type="number" value={form.macroTargets[key]} onChange={handleMacro(key)} min={0} max={100}
                  className="t-input" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }} />
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>%</div>
              </div>
            ))}
          </div>
          {macroSum !== 100 && (
            <p style={{ fontSize: 12, color: 'var(--warning)', margin: '4px 0 0' }}>⚠ Total is {macroSum}%, should be 100%</p>
          )}
        </Field>

        <Field label="Default Rest Timer">
          <div style={{ display: 'flex', gap: 8 }}>
            {[60, 90, 120, 180].map(s => {
              const active = form.restTimer === s;
              return (
                <button key={s} onClick={() => setForm(f => ({ ...f, restTimer: s }))} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-input)'}`,
                  background: active ? 'var(--accent)' : 'var(--bg-input)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{s}s</button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* ── SAVE button ─────────────────────────────────────────────────────── */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={save} className="t-btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 16 }}>
        Save Settings
      </motion.button>

      {/* ── RESET ACTIVITY ──────────────────────────────────────────────────── */}
      <Section title="Reset Activity">
        {/* What gets wiped */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['🏋️', 'All Workouts',       'deleted', 'var(--danger-light)',  'var(--danger)'],
            ['📊', 'Weight Logs',         'deleted', 'var(--danger-light)',  'var(--danger)'],
            ['😴', 'Sleep & Wellness',    'deleted', 'var(--danger-light)',  'var(--danger)'],
            ['🍎', 'Nutrition Logs',      'deleted', 'var(--danger-light)',  'var(--danger)'],
            ['🏆', 'Personal Records',    'deleted', 'var(--danger-light)',  'var(--danger)'],
            ['📏', 'Body Measurements',   'deleted', 'var(--danger-light)',  'var(--danger)'],
            ['🎯', 'Goals & Schedule',    'kept',    'var(--success-light)', 'var(--success)'],
            ['👤', 'Profile & Settings',  'kept',    'var(--success-light)', 'var(--success)'],
          ].map(([emoji, label, action, bg, color]) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10,
              background: bg,
              border: `1px solid ${color}30`,
            }}>
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{label}</div>
                <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {action === 'deleted' ? '✕ Reset' : '✓ Kept'}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Resets all logged activity to zero — perfect for demos or sharing the app with someone new.
          Your profile, goals, and schedule are <strong style={{ color: 'var(--success)' }}>preserved</strong>.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowResetConfirm(true)}
          style={{
            width: '100%', padding: '12px',
            borderRadius: 14, border: '1px solid var(--danger-light)',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <span>🔄</span> Reset All Activity to Zero
        </motion.button>
      </Section>

      {/* ── DATA MANAGEMENT ─────────────────────────────────────────────────── */}
      <Section title="Data Management">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '📥 Export All Data (JSON)', onClick: exportData, color: 'var(--success)', lightColor: 'var(--success-light)' },
            { label: '📤 Import Data from JSON',  onClick: importData, color: 'var(--info)',    lightColor: 'var(--info-light)'    },
            { label: '🗑️ Delete All Data',        onClick: () => setShowClearConfirm(true), color: 'var(--danger)', lightColor: 'var(--danger-light)' },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
              border: `1px solid ${btn.lightColor}`,
              background: btn.lightColor,
              color: btn.color,
              fontSize: 13, fontWeight: 600, textAlign: 'left', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >{btn.label}</button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
          Data is stored locally in your browser. Export regularly to back up.
        </p>
      </Section>

      {/* ── TODO comments ───────────────────────────────────────────────────── */}
      {/* TODO: Replace localStorage with Supabase/Firebase */}
      {/* TODO: Add PWA manifest + service worker */}
      {/* TODO: Add auth with Clerk/Auth0 */}
      {/* TODO: Add social features (share workout) */}
      {/* TODO: Add AI workout suggestions */}

      {/* ── CONFIRM DIALOGS ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={resetActivity}
        title="Reset All Activity?"
        description="This will permanently delete all workouts, weight logs, sleep logs, nutrition logs, body measurements, and personal records. Your profile, goals, and schedule will be preserved."
        confirmLabel="Reset Activity 🔄"
        danger
      />

      <ConfirmDialog
        open={showClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={clearData}
        title="Delete Everything?"
        description="This permanently deletes ALL data including your profile, goals, settings, and every log entry. This cannot be undone."
        confirmLabel="Delete Everything 🗑️"
        danger
      />
    </div>
  );
}
