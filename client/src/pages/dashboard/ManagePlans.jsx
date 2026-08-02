import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, Edit2, Trash2, Plus, Save, XCircle } from 'lucide-react';

const emptyForm = () => ({ name: '', description: '', durationMonths: '', price: '', features: '' });

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/admin/plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/admin/plans', {
        ...createForm,
        durationMonths: Number(createForm.durationMonths),
        price: Number(createForm.price),
        features: createForm.features.split(',').map((f) => f.trim()).filter(Boolean)
      });
      if (res.data.success) {
        setShowCreateForm(false);
        setCreateForm(emptyForm());
        fetchPlans();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating plan');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (plan) => {
    setEditingId(plan._id);
    setEditForm({
      name: plan.name || '',
      description: plan.description || '',
      durationMonths: plan.durationMonths || '',
      price: plan.price || '',
      features: (plan.features || []).join(', ')
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/plans/${id}`, {
        ...editForm,
        durationMonths: Number(editForm.durationMonths),
        price: Number(editForm.price),
        features: editForm.features.split(',').map((f) => f.trim()).filter(Boolean)
      });
      if (res.data.success) {
        setEditingId(null);
        fetchPlans();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this plan?')) {
      try {
        const res = await api.delete(`/api/admin/plans/${id}`);
        if (res.data.success) {
          fetchPlans();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting plan');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <CreditCard className="text-gymNeon h-8 w-8" />
              <span>Membership Plans</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Create and manage gym membership pricing plans.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon"
          >
            <Plus className="h-5 w-5" />
            <span>{showCreateForm ? 'CLOSE FORM' : 'CREATE NEW PLAN'}</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gymGray-800 bg-gymGray-900/80 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Plan Name</label>
              <input name="name" value={createForm.name} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Price</label>
              <input name="price" type="number" min="0" value={createForm.price} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Duration (Months)</label>
              <input name="durationMonths" type="number" min="1" value={createForm.durationMonths} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Features (comma separated)</label>
              <input name="features" value={createForm.features} onChange={handleCreateChange} className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500">Description</label>
              <textarea name="description" value={createForm.description} onChange={handleCreateChange} required className="w-full mt-1 rounded-lg border border-gymGray-700 bg-gymGray-950 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" rows="3" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="rounded-lg bg-gymNeon px-4 py-2 text-sm font-bold text-black disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Plan'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <div key={plan._id} className="p-6 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/50 transition duration-300 rounded-2xl flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gymNeon transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{plan.name}</h3>
                      <p className="text-xs text-gray-400 font-semibold">{plan.durationMonths} Months Duration</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gymNeon">${plan.price}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 flex-grow mb-6">{plan.description}</p>

                  <ul className="space-y-2 mb-6">
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gymNeon"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {editingId === plan._id && (
                    <div className="mb-4 rounded-xl border border-gymGray-700 bg-gymGray-950 p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <input name="name" value={editForm.name} onChange={handleEditChange} className="rounded-lg border border-gymGray-700 bg-gymGray-900 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                        <textarea name="description" value={editForm.description} onChange={handleEditChange} className="rounded-lg border border-gymGray-700 bg-gymGray-900 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" rows="3" />
                        <div className="grid grid-cols-2 gap-3">
                          <input name="durationMonths" type="number" min="1" value={editForm.durationMonths} onChange={handleEditChange} className="rounded-lg border border-gymGray-700 bg-gymGray-900 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                          <input name="price" type="number" min="0" value={editForm.price} onChange={handleEditChange} className="rounded-lg border border-gymGray-700 bg-gymGray-900 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                        </div>
                        <input name="features" value={editForm.features} onChange={handleEditChange} className="rounded-lg border border-gymGray-700 bg-gymGray-900 px-3 py-2 text-sm text-white shadow-sm focus:border-gymNeon focus:outline-none" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-2 rounded-lg border border-gymGray-700 px-3 py-2 text-xs text-gray-300">
                          <XCircle className="h-4 w-4" /> Cancel
                        </button>
                        <button onClick={() => handleSaveEdit(plan._id)} className="flex items-center gap-2 rounded-lg bg-gymNeon px-3 py-2 text-xs font-bold text-black">
                          <Save className="h-4 w-4" /> Save
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gymGray-800 mt-auto">
                    <button onClick={() => startEdit(plan)} className="flex items-center gap-2 text-gray-400 hover:text-white transition px-3 py-1.5 bg-gymGray-800 hover:bg-gymGray-700 rounded text-xs font-bold">
                      <Edit2 className="h-3.5 w-3.5" /> EDIT
                    </button>
                    <button onClick={() => handleDelete(plan._id)} className="flex items-center gap-2 text-gray-400 hover:text-gymRed transition px-3 py-1.5 bg-gymGray-800 hover:bg-gymGray-700 rounded text-xs font-bold">
                      <Trash2 className="h-3.5 w-3.5" /> DELETE
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No membership plans found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePlans;
