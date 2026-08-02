import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Activity, ClipboardList } from 'lucide-react';

const TrainerMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-gymGray-850 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-6">
            {members.length > 0 ? (
              members.map((member) => (
                <div key={member._id} className="p-6 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/30 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 transition duration-200">
                  
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
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gymGray-800 hover:bg-gymGray-700 text-white text-xs font-bold rounded-lg border border-gymGray-700 transition">
                      <ClipboardList className="w-4 h-4 text-gymNeon" />
                      <span>Workout Plan</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gymGray-800 hover:bg-gymGray-700 text-white text-xs font-bold rounded-lg border border-gymGray-700 transition">
                      <Activity className="w-4 h-4 text-gymNeon" />
                      <span>Log Progress</span>
                    </button>
                  </div>
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
