import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Dumbbell, Plus, Trash2, Save, ChevronDown, ChevronUp, User, Loader } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptyExercise = () => ({ name: '', sets: 3, reps: '10', weight: '', notes: '' });
const emptyDay = (dayName) => ({ dayName, focus: '', exercises: [] });

const TrainerWorkouts = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [plan, setPlan] = useState({ title: '', days: [] });
  const [expandedDay, setExpandedDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Fetch assigned members
  useEffect(() => {
    api.get('/api/trainers/members').then(res => {
      if (res.data.success) setMembers(res.data.data);
    }).catch(() => {});
  }, []);

  // Load existing plan when member changes
  useEffect(() => {
    if (!selectedMember) return;
    setLoadingPlan(true);
    api.get(`/api/trainers/workout/${selectedMember._id}`).then(res => {
      if (res.data.success && res.data.data) {
        const existing = res.data.data;
        // Ensure all 7 days are present
        const mergedDays = DAYS.map(d => {
          const found = (existing.days || []).find(day => day.dayName === d);
          return found || emptyDay(d);
        });
        setPlan({ title: existing.title || `${selectedMember.name}'s Workout Plan`, days: mergedDays });
      } else {
        setPlan({ title: `${selectedMember.name}'s Workout Plan`, days: DAYS.map(emptyDay) });
      }
      setExpandedDay(null);
    }).catch(() => {
      setPlan({ title: `${selectedMember.name}'s Workout Plan`, days: DAYS.map(emptyDay) });
    }).finally(() => setLoadingPlan(false));
  }, [selectedMember]);

  const updateDay = (dayIndex, field, value) => {
    setPlan(prev => {
      const days = [...prev.days];
      days[dayIndex] = { ...days[dayIndex], [field]: value };
      return { ...prev, days };
    });
  };

  const addExercise = (dayIndex) => {
    setPlan(prev => {
      const days = [...prev.days];
      days[dayIndex] = { ...days[dayIndex], exercises: [...(days[dayIndex].exercises || []), emptyExercise()] };
      return { ...prev, days };
    });
  };

  const updateExercise = (dayIndex, exIndex, field, value) => {
    setPlan(prev => {
      const days = [...prev.days];
      const exercises = [...days[dayIndex].exercises];
      exercises[exIndex] = { ...exercises[exIndex], [field]: value };
      days[dayIndex] = { ...days[dayIndex], exercises };
      return { ...prev, days };
    });
  };

  const removeExercise = (dayIndex, exIndex) => {
    setPlan(prev => {
      const days = [...prev.days];
      const exercises = days[dayIndex].exercises.filter((_, i) => i !== exIndex);
      days[dayIndex] = { ...days[dayIndex], exercises };
      return { ...prev, days };
    });
  };

  const handleSave = async () => {
    if (!selectedMember) return;
    setSaving(true);
    setSavedMsg('');
    try {
      const res = await api.post('/api/trainers/workout', {
        memberId: selectedMember._id,
        title: plan.title,
        days: plan.days
      });
      if (res.data.success) {
        setSavedMsg('Workout plan saved successfully!');
        setTimeout(() => setSavedMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save workout plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Dumbbell className="text-gymNeon h-8 w-8" />
              <span>Workout Plan Builder</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Create and assign a personalized weekly training program for your clients.
            </p>
          </div>
        </div>
      </div>

      {/* Member Selector */}
      <div className="glass-panel p-6 rounded-2xl border border-gymGray-850">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Select Member to Build Plan For</h3>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">You have no assigned members yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {members.map(m => (
              <button
                key={m._id}
                onClick={() => setSelectedMember(m)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl border transition duration-200 ${
                  selectedMember?._id === m._id
                    ? 'bg-gymNeon text-black border-gymNeon font-bold shadow-neon'
                    : 'bg-gymGray-900 text-white border-gymGray-800 hover:border-gymGray-700'
                }`}
              >
                <img
                  src={m.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover border border-black/20"
                />
                <span className="text-sm font-semibold">{m.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plan Builder */}
      {selectedMember && (
        <div className="space-y-6">
          {/* Plan Title */}
          <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Plan Title</label>
              <input
                type="text"
                value={plan.title}
                onChange={e => setPlan(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none text-sm"
                placeholder="e.g. Hypertrophy 4-Day Split"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-8 py-3 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition shadow-neon disabled:opacity-50 shrink-0"
            >
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'SAVING...' : 'SAVE PLAN'}</span>
            </button>
          </div>

          {savedMsg && (
            <div className="px-4 py-3 bg-gymNeon/10 border border-gymNeon/30 text-gymNeon text-sm font-bold rounded-xl">
              ✓ {savedMsg}
            </div>
          )}

          {loadingPlan ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
            </div>
          ) : (
            /* Day Accordions */
            <div className="space-y-3">
              {plan.days.map((day, di) => (
                <div key={day.dayName} className="glass-panel rounded-2xl border border-gymGray-850 overflow-hidden">
                  {/* Day Header */}
                  <button
                    className="w-full flex justify-between items-center px-6 py-4 hover:bg-gymGray-800/40 transition"
                    onClick={() => setExpandedDay(expandedDay === di ? null : di)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-gymNeon font-black text-sm uppercase tracking-wider w-28 text-left">{day.dayName}</span>
                      {day.focus && (
                        <span className="text-xs font-bold bg-gymGray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{day.focus}</span>
                      )}
                      {day.exercises?.length > 0 && (
                        <span className="text-[10px] text-gray-500">{day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    {expandedDay === di ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>

                  {expandedDay === di && (
                    <div className="px-6 pb-6 space-y-5 border-t border-gymGray-800">
                      {/* Focus Input */}
                      <div className="pt-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Day Focus (e.g. Chest & Triceps)</label>
                        <input
                          type="text"
                          value={day.focus || ''}
                          onChange={e => updateDay(di, 'focus', e.target.value)}
                          className="w-full md:w-64 bg-gymGray-900 border border-gymGray-800 rounded-lg p-2.5 text-white focus:border-gymNeon focus:outline-none text-sm"
                          placeholder="e.g. Legs, Push, Pull…"
                        />
                      </div>

                      {/* Exercises */}
                      {(day.exercises || []).map((ex, ei) => (
                        <div key={ei} className="bg-gymGray-900 border border-gymGray-800 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gymNeon uppercase tracking-widest">Exercise #{ei + 1}</span>
                            <button onClick={() => removeExercise(di, ei)} className="text-gray-600 hover:text-gymRed transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="col-span-2 space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Exercise Name *</label>
                              <input
                                type="text"
                                value={ex.name}
                                onChange={e => updateExercise(di, ei, 'name', e.target.value)}
                                className="w-full bg-gymGray-800 border border-gymGray-700 rounded-lg p-2 text-white text-xs focus:border-gymNeon focus:outline-none"
                                placeholder="e.g. Bench Press"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sets</label>
                              <input
                                type="number"
                                value={ex.sets}
                                onChange={e => updateExercise(di, ei, 'sets', e.target.value)}
                                className="w-full bg-gymGray-800 border border-gymGray-700 rounded-lg p-2 text-white text-xs focus:border-gymNeon focus:outline-none"
                                min="1" max="10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Reps</label>
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={e => updateExercise(di, ei, 'reps', e.target.value)}
                                className="w-full bg-gymGray-800 border border-gymGray-700 rounded-lg p-2 text-white text-xs focus:border-gymNeon focus:outline-none"
                                placeholder="8-12"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Weight</label>
                              <input
                                type="text"
                                value={ex.weight || ''}
                                onChange={e => updateExercise(di, ei, 'weight', e.target.value)}
                                className="w-full bg-gymGray-800 border border-gymGray-700 rounded-lg p-2 text-white text-xs focus:border-gymNeon focus:outline-none"
                                placeholder="60 kg / BW"
                              />
                            </div>
                            <div className="col-span-2 md:col-span-3 space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Notes / Cues</label>
                              <input
                                type="text"
                                value={ex.notes || ''}
                                onChange={e => updateExercise(di, ei, 'notes', e.target.value)}
                                className="w-full bg-gymGray-800 border border-gymGray-700 rounded-lg p-2 text-white text-xs focus:border-gymNeon focus:outline-none"
                                placeholder="e.g. Keep elbows tucked, slow eccentric"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addExercise(di)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gymGray-800 hover:bg-gymGray-700 text-gymNeon border border-gymNeon/30 hover:border-gymNeon/60 text-xs font-bold rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ADD EXERCISE</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerWorkouts;
