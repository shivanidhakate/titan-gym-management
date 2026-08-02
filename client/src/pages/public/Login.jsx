import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Dumbbell, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  // Check if redirected due to expired token
  useEffect(() => {
    if (location.search.includes('expired=true')) {
      setExpiredMsg(true);
    }
    // If already logged in, bypass login screen
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="bg-gymGray-900 min-h-[80vh] flex items-center justify-center py-12 px-6 relative">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gymNeon/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gymRed/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-gymGray-800 relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Dumbbell className="text-gymNeon h-10 w-10 animate-float" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wider">Welcome Back</h2>
          <p className="text-sm text-gray-400">Sign in to access your workout dashboards</p>
        </div>

        {expiredMsg && (
          <div className="p-3.5 bg-gymRed/10 text-gymRed border border-gymRed/20 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Session expired. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-gymRed/15 text-gymRed border border-gymRed/20 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Demo Quick Login Buttons */}
        <div className="bg-gymGray-950/60 p-3 rounded-xl border border-gymGray-800 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Quick Demo Login</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setEmail('member@titangym.com'); setPassword('member123'); }}
              className="py-1.5 px-2 bg-gymGray-800 hover:bg-gymNeon/20 hover:text-gymNeon hover:border-gymNeon/40 border border-gymGray-700 text-xs font-semibold rounded-lg text-gray-300 transition"
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => { setEmail('trainer@titangym.com'); setPassword('trainer123'); }}
              className="py-1.5 px-2 bg-gymGray-800 hover:bg-gymNeon/20 hover:text-gymNeon hover:border-gymNeon/40 border border-gymGray-700 text-xs font-semibold rounded-lg text-gray-300 transition"
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@titangym.com'); setPassword('admin123'); }}
              className="py-1.5 px-2 bg-gymGray-800 hover:bg-gymNeon/20 hover:text-gymNeon hover:border-gymNeon/40 border border-gymGray-700 text-xs font-semibold rounded-lg text-gray-300 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="e.g. member@titangym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-600"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
              <Link to="/forgot-password" className="text-xs text-gymNeon hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <LogIn className="h-4 w-4" />
                <span>SIGN IN</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2">
          New to the gym?{' '}
          <Link to="/register" className="text-gymNeon font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
