import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Edit2, Trash2 } from 'lucide-react';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async (search = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/members${search ? `?search=${search}` : ''}`);
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(searchTerm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const res = await api.delete(`/api/admin/members/${id}`);
        if (res.data.success) {
          fetchMembers(searchTerm);
        }
      } catch (err) {
        console.error('Failed to delete member', err);
        alert(err.response?.data?.message || 'Error deleting member');
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
              <Users className="text-gymNeon h-8 w-8" />
              <span>Manage Members</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              View, search, edit, and remove gym members from the system.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gymGray-900 border border-gymGray-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-gymNeon transition-colors"
          />
          <Search className="h-5 w-5 text-gray-500 absolute left-3 top-3.5" />
          <button type="submit" className="hidden">Search</button>
        </form>
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
                  <th className="py-4 px-6 font-bold">Member</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold">Assigned Trainer</th>
                  <th className="py-4 px-6 font-bold">Joined</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member._id} className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={member.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-full object-cover border border-gymGray-700" 
                          />
                          <div>
                            <p className="text-white font-bold">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {member.activeMembership?.status === 'active' ? (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-gymNeon/10 text-gymNeon border border-gymNeon/20">
                            Active ({member.activeMembership.planId?.name || 'Plan'})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-gymRed/10 text-gymRed border border-gymRed/20">
                            {member.activeMembership?.status || 'No Plan'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {member.assignedTrainer?.name || <span className="text-gray-600 italic">Unassigned</span>}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <button className="text-gray-400 hover:text-gymNeon transition" title="Edit">
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDelete(member._id)}
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
                      No members found matching your search.
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

export default ManageMembers;
