import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Edit2, Trash2, Save, XCircle } from 'lucide-react';

const emptyEditForm = () => ({ name: '', email: '', phone: '', address: '', assignedTrainer: '' });

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm());

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

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/api/admin/trainers');
      if (res.data.success) {
        setTrainers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trainers', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTrainers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(searchTerm);
  };

  const startEdit = (member) => {
    setEditingId(member._id);
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      assignedTrainer: member.assignedTrainer?._id || member.assignedTrainer || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEditForm());
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await api.put(`/api/admin/members/${id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        assignedTrainer: editForm.assignedTrainer
      });

      if (res.data.success) {
        setEditingId(null);
        fetchMembers(searchTerm);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating member');
    }
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
                    <React.Fragment key={member._id}>
                      <tr className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
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
                          <button
                            onClick={() => startEdit(member)}
                            className="text-gray-400 hover:text-gymNeon transition"
                            title="Edit"
                          >
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
                      {editingId === member._id && (
                        <tr className="bg-gymGray-800/20">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="rounded-xl border border-gymGray-700 bg-gymGray-900/80 p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Name</label>
                                  <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Email</label>
                                  <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Phone</label>
                                  <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Assigned Trainer</label>
                                  <select name="assignedTrainer" value={editForm.assignedTrainer} onChange={handleEditChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none">
                                    <option value="">Unassigned</option>
                                    {trainers.map((trainer) => (
                                      <option key={trainer._id} value={trainer._id}>{trainer.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Address</label>
                                  <input name="address" value={editForm.address} onChange={handleEditChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <button onClick={cancelEdit} className="flex items-center gap-2 rounded-lg border border-gymGray-700 px-3 py-2 text-sm text-gray-300 hover:text-white">
                                  <XCircle className="h-4 w-4" /> Cancel
                                </button>
                                <button onClick={() => handleSaveEdit(member._id)} className="flex items-center gap-2 rounded-lg bg-gymNeon px-3 py-2 text-sm font-bold text-black">
                                  <Save className="h-4 w-4" /> Save Changes
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
