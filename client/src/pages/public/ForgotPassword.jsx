import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { KeyRound, Dumbbell, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request code, 2 = Enter code & new password
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password', { email, pin, newPassword });
      if (res.data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification or update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gymGray-900 min-h-[80vh] flex items-center justify-center py-12 px-6 relative">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gymNeon/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-gymGray-800 relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Dumbbell className="text-gymNeon h-10 w-10 animate-float" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wider">Account Recovery</h2>
          <p className="text-sm text-gray-400">Restore access to your fitness statistics</p>
        </div>

        {error && (
          <div className="p-3.5 bg-gymRed/15 text-gymRed border border-gymRed/20 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3.5 bg-gymNeon/15 text-gymNeon border border-gymNeon/20 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Registered Email</label>
              <input
                type="email"
                placeholder="e.g. member@titangym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-600"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gymNeon hover:bg-gymNeon-dark disabled:bg-gymGray-700 text-black font-extrabold rounded-xl transition duration-200 shadow-neon flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>REQUEST RESET PIN</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">6-Digit verification PIN</label>
              <input
                type="text"
                placeholder="Enter PIN from server terminal logs"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-600 tracking-widest text-center text-lg font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">New Password</label>
              <input
                type="password"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-600"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gymNeon hover:bg-gymNeon-dark disabled:bg-gymGray-700 text-black font-extrabold rounded-xl transition duration-200 shadow-neon flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>RESET PASSWORD</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="flex justify-between items-center pt-2">
          <Link to="/login" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
          {step === 2 && (
            <button onClick={() => setStep(1)} className="text-xs text-gymNeon hover:underline focus:outline-none">
              Resend PIN?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
