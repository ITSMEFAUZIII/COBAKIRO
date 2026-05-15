import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
  { id: 'workouts',  label: 'Workouts',  emoji: '💪' },
  { id: 'progress',  label: 'Progress',  emoji: '📈' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🍎' },
  { id: 'recovery',  label: 'Recovery',  emoji: '😴' },
  { id: 'goals',     label: 'Goals',     emoji: '🎯' },
  { id: 'schedule',  label: 'Schedule',  emoji: '📅' },
  { id: 'settings',  label: 'Settings',  emoji: '⚙️' },
];

/* ── Mini Theme Toggle pill ─────────────────────────────────────────────── */
function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-card)',
        borderRadius: compact ? '0.625rem' : '0.875rem',
        padding: '3px',
        gap: '2px',
      }}
    >
      {[
        { id: 'dark',    emoji: '🌑', label: 'Dark' },
        { id: 'fitgram', emoji: '🩵', label: 'Fitgram' },
      ].map(t => {
        const active = theme === t.id;
        return (
          <motion.button
            key={t.id}
            onClick={() => setTheme(t.id)}
            whileTap={{ scale: 0.93 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: compact ? '4px 8px' : '5px 10px',
              borderRadius: compact ? '0.45rem' : '0.65rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: compact ? '11px' : '12px',
              fontWeight: 600,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
              boxShadow: active ? '0 0 12px var(--accent-glow)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: compact ? '12px' : '13px' }}>{t.emoji}</span>
            {!compact && <span>{t.label}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Layout ─────────────────────────────────────────────────────────────── */
export default function Layout({ currentPage, onNavigate, children }) {
  const { state } = useApp();
  const { theme } = useTheme();
  const name     = state?.profile?.name || 'Athlete';
  const initials = name.slice(0, 2).toUpperCase();

  /* Sidebar & bottom bar colours driven by CSS variables */
  const sidebarStyle = {
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-sidebar)',
  };
  const bottomBarStyle = {
    background: `color-mix(in srgb, var(--bg-sidebar) 95%, transparent)`,
    borderTop: '1px solid var(--border-sidebar)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ══ Sidebar (desktop) ══════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen"
        style={sidebarStyle}
      >
        {/* Logo row */}
        <div style={{ padding: '28px 24px 22px', borderBottom: '1px solid var(--border-sidebar)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32,
                borderRadius: 10,
                background: 'var(--logo-bg)',
                boxShadow: '0 4px 14px var(--logo-shadow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: '#fff',
              }}
            >G</div>
            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', letterSpacing: '-0.3px' }}>
              GymLife
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  background: 'transparent',
                  color: active ? 'var(--text-heading)' : 'var(--nav-inactive)',
                  position: 'relative',
                  transition: 'color 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-tag)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: 12,
                      background: 'var(--nav-active-bg)',
                      border: '1px solid var(--nav-active-border)',
                      boxShadow: '0 0 16px var(--nav-active-glow)',
                    }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <span style={{ position: 'relative', fontSize: 16 }}>{item.emoji}</span>
                <span style={{ position: 'relative' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme switcher */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-sidebar)', borderBottom: '1px solid var(--border-sidebar)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 8 }}>Theme</p>
          <ThemeToggle />
        </div>

        {/* Profile mini */}
        <div style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}
            >{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{state?.profile?.fitnessLevel || 'Intermediate'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ Main content ═══════════════════════════════════════════════════ */}
      <main style={{ flex: 1, minWidth: 0, paddingBottom: '80px' }} className="md:pb-0">
        {children}
      </main>

      {/* ══ Bottom Tab Bar (mobile) ════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40"
        style={bottomBarStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px' }}>
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: active ? 'var(--accent-text)' : 'var(--text-muted)',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
              </button>
            );
          })}
          {/* Theme toggle as a compact button on mobile bar */}
          <button
            onClick={() => {}}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <ThemeToggle compact />
          </button>
        </div>
      </nav>
    </div>
  );
}
