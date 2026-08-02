import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-gymNeon font-semibold' : 'text-gray-300 hover:text-gymNeon';
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-gymGray-700/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-wider">
          <Dumbbell className="text-gymNeon h-8 w-8 animate-float" />
          <span>TITAN<span className="text-gymNeon font-medium">GYM</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/" className={`${isActive('/')} transition-colors`}>Home</Link>
          <Link to="/about" className={`${isActive('/about')} transition-colors`}>About</Link>
          <Link to="/plans" className={`${isActive('/plans')} transition-colors`}>Membership Plans</Link>
          <Link to="/trainers" className={`${isActive('/trainers')} transition-colors`}>Trainers</Link>
          <Link to="/contact" className={`${isActive('/contact')} transition-colors`}>Contact</Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/member'}
                className="flex items-center space-x-2 px-4 py-2 bg-gymGray-700 hover:bg-gymGray-600 rounded-lg text-sm text-white transition duration-200"
              >
                <LayoutDashboard className="h-4 w-4 text-gymNeon" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 border border-gymRed hover:bg-gymRed text-sm rounded-lg text-white transition duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-gymNeon text-sm font-medium transition duration-200">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 bg-gymNeon hover:bg-gymNeon-dark text-black text-sm font-bold rounded-lg transition duration-200 shadow-neon">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel absolute top-full left-0 w-full p-6 border-b border-gymGray-700/50 flex flex-col space-y-4">
          <Link to="/" onClick={() => setIsOpen(false)} className={`${isActive('/')} text-lg`}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={`${isActive('/about')} text-lg`}>About</Link>
          <Link to="/plans" onClick={() => setIsOpen(false)} className={`${isActive('/plans')} text-lg`}>Membership Plans</Link>
          <Link to="/trainers" onClick={() => setIsOpen(false)} className={`${isActive('/trainers')} text-lg`}>Trainers</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className={`${isActive('/contact')} text-lg`}>Contact</Link>
          <div className="h-px bg-gymGray-700/50 my-2"></div>
          {user ? (
            <div className="flex flex-col space-y-3">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/member'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gymGray-700 rounded-lg text-white"
              >
                <LayoutDashboard className="h-5 w-5 text-gymNeon" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full py-3 border border-gymRed rounded-lg text-white"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-gymGray-700 rounded-lg text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-gymNeon text-black font-bold rounded-lg shadow-neon"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
