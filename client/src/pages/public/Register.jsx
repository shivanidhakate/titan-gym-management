import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Dumbbell } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(name, email, password, phone, address);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-gymGray-900 min-h-[90vh] flex items-center justify-center py-12 px-6 relative">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gymNeon/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gymRed/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel p-8 rounded-2xl w-full max-w-lg border border-gymGray-800 relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Dumbbell className="text-gymNeon h-10 w-10 animate-float" />
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wider">Join Titan Gym</h2>
          <p className="text-sm text-gray-400">Unlock your true potential today</p>
        </div>

        {error && (
          <div className="p-3.5 bg-gymRed/15 text-gymRed border border-gymRed/20 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="e.g. David Beckham"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="e.g. david@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +91 99776 65544"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Home Address</label>
            <input
              type="text"
              placeholder="Street Name, Area, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white placeholder-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gymNeon hover:bg-gymNeon-dark disabled:bg-gymGray-700 text-black font-extrabold rounded-xl transition duration-200 shadow-neon flex items-center justify-center space-x-2 text-sm pt-4"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>REGISTER NOW</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-gymNeon font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
