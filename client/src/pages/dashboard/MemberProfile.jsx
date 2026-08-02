import React, { useState, useRef } from 'react';
import { User, Save, Camera, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MemberProfile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
  });
  const [previewUrl, setPreviewUrl] = useState(
    user?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      // Always use FormData so the backend can parse multipart/form-data
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('gender', formData.gender);
      data.append('dob', formData.dob);
      if (selectedFile) {
        data.append('profilePicture', selectedFile);
      }

      const res = await api.put('/api/members/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        setSelectedFile(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
            <User className="text-gymNeon h-8 w-8" />
            <span>Profile Settings</span>
          </h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
            Manage your personal information and update your profile photo.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-gymGray-850">
        {successMsg && (
          <div className="mb-6 px-4 py-3 bg-gymNeon/10 border border-gymNeon/30 text-gymNeon text-sm font-bold rounded-xl">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3 flex-shrink-0">
              <div
                className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-gymNeon cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-7 h-7 text-gymNeon mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {selectedFile ? selectedFile.name : 'Click to upload photo'}
              </span>
              {selectedFile && (
                <span className="text-[10px] text-gymNeon font-bold">New photo selected ✓</span>
              )}
            </div>

            {/* Form Fields */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text" name="name" required
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none transition-colors"
                  value={formData.name} onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email (Read-only)</label>
                <input
                  type="email" disabled
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-gray-500 cursor-not-allowed"
                  value={user?.email || ''}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text" name="phone"
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none transition-colors"
                  value={formData.phone} onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date of Birth</label>
                <input
                  type="date" name="dob"
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none transition-colors"
                  value={formData.dob} onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gender</label>
                <select
                  name="gender"
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none transition-colors"
                  value={formData.gender} onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Address</label>
                <input
                  type="text" name="address"
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none transition-colors"
                  value={formData.address} onChange={handleChange}
                  placeholder="123, Fitness Lane, Mumbai"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gymGray-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon disabled:opacity-50"
            >
              {loading ? (
                <><Loader className="h-4 w-4 animate-spin" /><span>SAVING...</span></>
              ) : (
                <><Save className="h-4 w-4" /><span>SAVE CHANGES</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberProfile;
