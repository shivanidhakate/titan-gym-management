import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Dumbbell, Clock, Calendar, CheckCircle } from 'lucide-react';

const MemberWorkouts = () => {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkout = async () => {
    try {
      const res = await api.get('/api/members/workout');
      if (res.data.success) {
        setWorkout(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch workout plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gymNeon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Dumbbell className="text-gymNeon h-8 w-8" />
              <span>Workout Schedule</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Access your personalized workout programs and daily routines designed by your coach.
            </p>
          </div>
        </div>
      </div>

      {workout ? (
        <div className="space-y-8">
          {/* Plan Info */}
          <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{workout.title || 'Custom Workout Plan'}</h2>
              <p className="text-sm text-gray-400 mt-1 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Updated: {new Date(workout.updatedAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
            
            {workout.trainerId && (
              <div className="flex items-center space-x-3 bg-gymGray-900 px-4 py-3 rounded-xl border border-gymGray-800">
                <img 
                  src={workout.trainerId.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                  alt="Trainer"
                  className="w-10 h-10 rounded-full object-cover border border-gymNeon"
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Designed By</p>
                  <p className="text-white text-sm font-semibold">{workout.trainerId.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-1 gap-6">
            {workout.days?.length > 0 ? (
              workout.days.map((day, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-gymGray-850">
                  <div className="border-b border-gymGray-800 pb-4 mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gymNeon uppercase tracking-wider">{day.dayName}</h3>
                    {day.focus && <span className="text-xs font-bold bg-gymGray-800 text-gray-300 px-3 py-1 rounded uppercase">{day.focus}</span>}
                  </div>
                  
                  {day.exercises?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {day.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-gymGray-900 p-4 rounded-xl border border-gymGray-800 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                            {ex.notes && <p className="text-xs text-gray-500 mt-1 italic">"{ex.notes}"</p>}
                          </div>
                          <div className="mt-4 pt-3 border-t border-gymGray-800 flex justify-between text-xs font-semibold">
                            <span className="text-gymNeon">{ex.sets} Sets</span>
                            <span className="text-gray-300">{ex.reps} Reps</span>
                            {ex.weight && <span className="text-gray-400">{ex.weight}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm italic">
                      Rest day. Take time to recover!
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                Your workout plan has no active days set yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-gymGray-850">
          <div className="text-center py-12 space-y-4">
            <CheckCircle className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">No Workout Plan Assigned</h3>
            <p className="text-gray-400 text-sm">You currently don't have a structured workout program.<br/>Please contact your trainer to get one assigned.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberWorkouts;
