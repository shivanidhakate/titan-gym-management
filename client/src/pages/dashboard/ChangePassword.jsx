import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.data.message || 'Password update failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-2xl border border-gymGray-800 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl bg-gymNeon/10 text-gymNeon">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Change Password</h2>
          <p className="text-sm text-gray-400">Update your login credentials securely.</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center space-x-2 rounded-xl border border-gymRed/20 bg-gymRed/10 p-3 text-sm text-gymRed">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-gymGray-800 bg-gymGray-900 px-4 py-3 text-white focus:border-gymNeon focus:outline-none"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gymGray-800 bg-gymGray-900 px-4 py-3 text-white focus:border-gymNeon focus:outline-none"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gymGray-800 bg-gymGray-900 px-4 py-3 text-white focus:border-gymNeon focus:outline-none"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gymNeon px-4 py-3 font-extrabold text-black transition hover:bg-gymNeon-dark disabled:bg-gymGray-700"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
