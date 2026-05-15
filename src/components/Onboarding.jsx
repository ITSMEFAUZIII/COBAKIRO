import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';

const GOALS = [
  { value: 'lose_fat', label: 'Lose Fat', emoji: '🔥', desc: 'Shed body fat while preserving muscle' },
  { value: 'build_muscle', label: 'Build Muscle', emoji: '💪', desc: 'Gain size and strength' },
  { value: 'maintain', label: 'Maintain', emoji: '⚖️', desc: 'Stay consistent and healthy' },
  { value: 'performance', label: 'Performance', emoji: '🏆', desc: 'Maximize athletic output' },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Onboarding({ onComplete }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', age: '', height: '', weight: '',
    primaryGoal: 'build_muscle', fitnessLevel: 'intermediate',
    weeklyTarget: 4,
  });

  const steps = ['Who are you?', 'Your Goal', 'Your Schedule'];

  const handleFinish = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { ...data, startingWeight: parseFloat(data.weight) || 75, onboardingComplete: true } });
    toast('Welcome to GymLife! Let\'s get to work 💪', 'success');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12)_0%,transparent_70%)]" />
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-violet-500"
                initial={{ width: 0 }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-8">
          <div className="text-xs text-violet-400 font-mono uppercase tracking-widest mb-2">Step {step + 1} of {steps.length}</div>
          <h2 className="text-2xl font-bold text-white mb-6">{steps[step]}</h2>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Your Name</label>
                  <input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Alex" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">Age</label>
                    <input type="number" value={data.age} onChange={e => setData(d => ({ ...d, age: e.target.value }))} placeholder="24" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">Height (cm)</label>
                    <input type="number" value={data.height} onChange={e => setData(d => ({ ...d, height: e.target.value }))} placeholder="175" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1.5 block">Weight (kg)</label>
                    <input type="number" value={data.weight} onChange={e => setData(d => ({ ...d, weight: e.target.value }))} placeholder="75" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Fitness Level</label>
                  <div className="flex gap-2">
                    {LEVELS.map(l => (
                      <button key={l} onClick={() => setData(d => ({ ...d, fitnessLevel: l.toLowerCase() }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${data.fitnessLevel === l.toLowerCase() ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}>{l}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g.value} onClick={() => setData(d => ({ ...d, primaryGoal: g.value }))} className={`p-4 rounded-xl border text-left transition-all ${data.primaryGoal === g.value ? 'bg-violet-600/20 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}>
                    <div className="text-2xl mb-2">{g.emoji}</div>
                    <div className="font-semibold text-sm">{g.label}</div>
                    <div className="text-xs text-white/40 mt-1">{g.desc}</div>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="text-sm text-white/60 mb-3 block">How many days per week do you want to train?</label>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-violet-400 font-mono text-3xl font-bold">{data.weeklyTarget}</span>
                    <span className="text-white/40 text-sm">days/week</span>
                  </div>
                  <input type="range" min={1} max={7} value={data.weeklyTarget} onChange={e => setData(d => ({ ...d, weeklyTarget: parseInt(e.target.value) }))} className="w-full accent-violet-500" />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>1 day</span><span>7 days</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <p className="text-sm text-violet-300">🎯 You're all set! We'll create a personalized schedule based on your goals.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors font-medium">
              Back
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleFinish()}
            className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors shadow-lg shadow-violet-500/20"
          >
            {step < steps.length - 1 ? 'Continue →' : "Let's go! 🚀"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
