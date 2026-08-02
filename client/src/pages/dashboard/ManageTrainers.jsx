import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Search, Edit2, Trash2, Plus } from 'lucide-react';

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/api/admin/trainers');
      if (res.data.success) {
        setTrainers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trainers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this trainer?')) {
      try {
        const res = await api.delete(`/api/admin/trainers/${id}`);
        if (res.data.success) {
          fetchTrainers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting trainer');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Settings className="text-gymNeon h-8 w-8" />
              <span>Manage Trainers</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Add, update, or remove fitness coaches from the system.
            </p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon">
            <Plus className="h-5 w-5" />
            <span>ADD TRAINER</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-gymGray-850 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gymGray-900/50 border-b border-gymGray-800 text-xs uppercase tracking-widest text-gray-400">
                  <th className="py-4 px-6 font-bold">Trainer</th>
                  <th className="py-4 px-6 font-bold">Specialization</th>
                  <th className="py-4 px-6 font-bold">Experience</th>
                  <th className="py-4 px-6 font-bold">Assigned Members</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trainers.length > 0 ? (
                  trainers.map((trainer) => (
                    <tr key={trainer._id} className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={trainer.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                            alt={trainer.name} 
                            className="w-10 h-10 rounded-full object-cover border border-gymNeon" 
                          />
                          <div>
                            <p className="text-white font-bold">{trainer.name}</p>
                            <p className="text-xs text-gray-500">{trainer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-semibold text-xs">
                        {trainer.specialization || 'General Fitness'}
                      </td>
                      <td className="py-4 px-6 text-gray-300 text-xs">
                        {trainer.experienceYears ? `${trainer.experienceYears} Years` : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-gymNeon font-bold">
                        {trainer.assignedMembersCount || 0}
                      </td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <button className="text-gray-400 hover:text-gymNeon transition" title="Edit">
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDelete(trainer._id)}
                          className="text-gray-400 hover:text-gymRed transition" 
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                      No trainers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTrainers;
