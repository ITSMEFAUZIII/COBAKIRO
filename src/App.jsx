import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import Recovery from './pages/Recovery';
import Goals from './pages/Goals';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';

const PAGE_TITLES = {
  dashboard: 'Dashboard | GymLife',
  workouts: 'Workouts | GymLife',
  progress: 'Progress | GymLife',
  nutrition: 'Nutrition | GymLife',
  recovery: 'Recovery | GymLife',
  goals: 'Goals | GymLife',
  schedule: 'Schedule | GymLife',
  settings: 'Settings | GymLife',
};

function AppInner() {
  const { state } = useApp();
  const [page, setPage] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users
  useEffect(() => {
    if (state && state.profile && !state.profile.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [state]);

  // Update page title
  useEffect(() => {
    document.title = PAGE_TITLES[page] || 'GymLife';
  }, [page]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'n' || e.key === 'N') setPage('workouts');
      if (e.key === 'd' || e.key === 'D') setPage('dashboard');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navigate = useCallback((target) => setPage(target), []);

  if (!state) {
    return (
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18, animation:'pulse 1.5s infinite' }}>G</div>
          <div style={{ color:'var(--text-muted)', fontSize:14 }}>Loading GymLife...</div>
        </div>
      </div>
    );
  }

  const pages = { dashboard: Dashboard, workouts: Workouts, progress: Progress, nutrition: Nutrition, recovery: Recovery, goals: Goals, schedule: Schedule, settings: Settings };
  const PageComponent = pages[page] || Dashboard;

  return (
    <>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      <Layout currentPage={page} onNavigate={navigate}>
        <AnimatePresence mode="wait">
          <motion.div key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <PageComponent onNavigate={navigate} />
          </motion.div>
        </AnimatePresence>
      </Layout>

      {/* Keyboard shortcuts hint */}
      <div style={{ position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:12, fontSize:12, color:'var(--text-faint)', pointerEvents:'none' }} className="hidden md:flex">
        <kbd style={{ padding:'2px 6px', borderRadius:4, border:'1px solid var(--border-input)', fontFamily:'var(--font-mono)' }}>D</kbd>
        <span>Dashboard</span>
        <span style={{ opacity:0.5 }}>·</span>
        <kbd style={{ padding:'2px 6px', borderRadius:4, border:'1px solid var(--border-input)', fontFamily:'var(--font-mono)' }}>N</kbd>
        <span>New Workout</span>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
