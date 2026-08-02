import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Edit2, Trash2, Plus, Save, XCircle } from 'lucide-react';

const emptyCreateForm = () => ({ name: '', email: '', password: '', phone: '', address: '', specialization: '' });
const emptyEditForm = () => ({ name: '', email: '', phone: '', address: '', specialization: '' });

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm());

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

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/api/admin/trainers', {
        ...createForm,
        trainerSpecialties: createForm.specialization ? [createForm.specialization] : [],
        trainerBio: createForm.specialization ? `Specializes in ${createForm.specialization}` : '',
        trainerRate: 60
      });

      if (res.data.success) {
        setShowCreateForm(false);
        setCreateForm(emptyCreateForm());
        fetchTrainers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating trainer');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (trainer) => {
    setEditingId(trainer._id);
    setEditForm({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      address: trainer.address || '',
      specialization: trainer.trainerSpecialties?.[0] || trainer.specialization || ''
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
      const res = await api.put(`/api/admin/trainers/${id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        trainerSpecialties: editForm.specialization ? [editForm.specialization] : [],
        trainerBio: editForm.specialization ? `Specializes in ${editForm.specialization}` : '',
        trainerRate: 60
      });

      if (res.data.success) {
        setEditingId(null);
        fetchTrainers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating trainer');
    }
  };

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
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon"
          >
            <Plus className="h-5 w-5" />
            <span>{showCreateForm ? 'CLOSE FORM' : 'ADD TRAINER'}</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gymGray-800 bg-gymGray-900/80 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Name</label>
              <input name="name" value={createForm.name} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Email</label>
              <input name="email" type="email" value={createForm.email} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Password</label>
              <input name="password" type="password" value={createForm.password} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Phone</label>
              <input name="phone" value={createForm.phone} onChange={handleCreateChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Specialization</label>
              <input name="specialization" value={createForm.specialization} onChange={handleCreateChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Address</label>
              <input name="address" value={createForm.address} onChange={handleCreateChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={creating} className="rounded-lg bg-gymNeon px-4 py-2 text-sm font-bold text-black disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Trainer'}
            </button>
          </div>
        </form>
      )}

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
                    <React.Fragment key={trainer._id}>
                      <tr className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
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
                          {trainer.trainerSpecialties?.[0] || trainer.specialization || 'General Fitness'}
                        </td>
                        <td className="py-4 px-6 text-gray-300 text-xs">
                          {trainer.experienceYears ? `${trainer.experienceYears} Years` : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-gymNeon font-bold">
                          {trainer.assignedMembersCount || 0}
                        </td>
                        <td className="py-4 px-6 text-right space-x-3">
                          <button onClick={() => startEdit(trainer)} className="text-gray-400 hover:text-gymNeon transition" title="Edit">
                            <Edit2 className="h-4 w-4 inline" />
                          </button>
                          <button onClick={() => handleDelete(trainer._id)} className="text-gray-400 hover:text-gymRed transition" title="Delete">
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                      {editingId === trainer._id && (
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
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Specialization</label>
                                  <input name="specialization" value={editForm.specialization} onChange={handleEditChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
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
                                <button onClick={() => handleSaveEdit(trainer._id)} className="flex items-center gap-2 rounded-lg bg-gymNeon px-3 py-2 text-sm font-bold text-black">
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
