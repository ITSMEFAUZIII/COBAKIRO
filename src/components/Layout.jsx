import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
  { id: 'workouts', label: 'Workouts', emoji: '💪' },
  { id: 'progress', label: 'Progress', emoji: '📈' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🍎' },
  { id: 'recovery', label: 'Recovery', emoji: '😴' },
  { id: 'goals', label: 'Goals', emoji: '🎯' },
  { id: 'schedule', label: 'Schedule', emoji: '📅' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
];

export default function Layout({ currentPage, onNavigate, children }) {
  const { state } = useApp();
  const name = state?.profile?.name || 'Athlete';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen border-r border-white/[0.06] bg-[#0c0c0c]">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/30">G</div>
            <span className="font-bold text-white text-lg tracking-tight">GymLife</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${active ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'}`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-violet-600/20 border border-violet-500/30"
                    style={{ boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative text-base">{item.emoji}</span>
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile mini */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white">{initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{name}</div>
              <div className="text-xs text-white/40 capitalize">{state?.profile?.fitnessLevel || 'Intermediate'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Bottom Tab Bar (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-violet-400' : 'text-white/40'}`}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && <motion.div layoutId="bottom-active" className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-500" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
