import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Users, Activity, ClipboardList, Save } from 'lucide-react';

const TrainerMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressForm, setProgressForm] = useState({ memberId: '', weight: '', height: '', bodyFat: '' });
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/trainers/members');
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch assigned members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleProgressChange = (e) => {
    const { name, value } = e.target;
    setProgressForm((prev) => ({ ...prev, [name]: value }));
  };

  const openProgressForm = (member) => {
    setProgressMessage('');
    setProgressForm({ memberId: member._id, weight: '', height: '', bodyFat: '' });
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProgress(true);
    try {
      const res = await api.post('/api/trainers/progress', {
        memberId: progressForm.memberId,
        weight: Number(progressForm.weight),
        height: Number(progressForm.height),
        bodyFat: progressForm.bodyFat ? Number(progressForm.bodyFat) : null
      });

      if (res.data.success) {
        setProgressMessage('Progress logged successfully');
        setProgressForm({ memberId: '', weight: '', height: '', bodyFat: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging progress');
    } finally {
      setSubmittingProgress(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Users className="text-gymNeon h-8 w-8" />
              <span>My Clients</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Manage your assigned members, view their progress, and create custom workout plans.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-gymGray-850 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-6">
            {members.length > 0 ? (
              members.map((member) => (
                <div key={member._id} className="rounded-xl border border-gymGray-800 bg-gymGray-900 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <img
                        src={member.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gymGray-700"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-white">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-600 mt-1">{member.phone || 'No phone provided'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto justify-start md:justify-end">
                      <button
                        onClick={() => navigate(`/trainer/workouts?memberId=${member._id}`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gymGray-800 hover:bg-gymGray-700 text-white text-xs font-bold rounded-lg border border-gymGray-700 transition"
                      >
                        <ClipboardList className="w-4 h-4 text-gymNeon" />
                        <span>Workout Plan</span>
                      </button>
                      <button
                        onClick={() => openProgressForm(member)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gymGray-800 hover:bg-gymGray-700 text-white text-xs font-bold rounded-lg border border-gymGray-700 transition"
                      >
                        <Activity className="w-4 h-4 text-gymNeon" />
                        <span>Log Progress</span>
                      </button>
                    </div>
                  </div>

                  {progressForm.memberId === member._id && (
                    <form onSubmit={handleProgressSubmit} className="mt-4 rounded-xl border border-gymGray-800 bg-gymGray-950 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500">Weight (kg)</label>
                          <input name="weight" type="number" value={progressForm.weight} onChange={handleProgressChange} required className="w-full mt-1 rounded-lg border border-gymGray-800 bg-gymGray-900 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500">Height (cm)</label>
                          <input name="height" type="number" value={progressForm.height} onChange={handleProgressChange} required className="w-full mt-1 rounded-lg border border-gymGray-800 bg-gymGray-900 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500">Body Fat (%)</label>
                          <input name="bodyFat" type="number" value={progressForm.bodyFat} onChange={handleProgressChange} className="w-full mt-1 rounded-lg border border-gymGray-800 bg-gymGray-900 px-3 py-2 text-sm text-white" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gymNeon">{progressMessage}</span>
                        <button type="submit" disabled={submittingProgress} className="flex items-center gap-2 rounded-lg bg-gymNeon px-3 py-2 text-sm font-bold text-black disabled:opacity-50">
                          <Save className="h-4 w-4" /> {submittingProgress ? 'Saving...' : 'Save Progress'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                You have no assigned members currently.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerMembers;
