import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Calendar,
  ClipboardList,
  LineChart,
  History,
  Users,
  Settings,
  CreditCard,
  CheckSquare,
  LogOut,
  Dumbbell
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define Links based on Role
  const memberLinks = [
    { name: 'Dashboard', path: '/member', icon: ClipboardList },
    { name: 'Profile Settings', path: '/member/profile', icon: User },
    { name: 'Book Trainer', path: '/member/bookings', icon: Calendar },
    { name: 'Workout Schedule', path: '/member/workouts', icon: Dumbbell },
    { name: 'Membership plans', path: '/member/payments', icon: CreditCard },
    { name: 'Progress Tracker', path: '/member/progress', icon: LineChart },
  ];

  const trainerLinks = [
    { name: 'Dashboard', path: '/trainer', icon: ClipboardList },
    { name: 'Assigned Members', path: '/trainer/members', icon: Users },
    { name: 'Training Bookings', path: '/trainer/bookings', icon: Calendar },
    { name: 'Workout Planner', path: '/trainer/workouts', icon: Dumbbell },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: Shield },
    { name: 'Manage Members', path: '/admin/members', icon: Users },
    { name: 'Manage Trainers', path: '/admin/trainers', icon: Settings },
    { name: 'Membership Plans', path: '/admin/plans', icon: CreditCard },
    { name: 'Manage Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Manage Payments', path: '/admin/payments', icon: History },
  ];

  const links = user.role === 'admin' ? adminLinks : user.role === 'trainer' ? trainerLinks : memberLinks;

  return (
    <aside className="w-full md:w-64 bg-gymGray-800/80 border-r border-gymGray-700/50 flex flex-col min-h-screen text-gray-300">
      {/* Profile Header */}
      <div className="p-6 border-b border-gymGray-700/50 flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt="Profile"
            className="w-20 h-20 rounded-full border-2 border-gymNeon object-cover mb-3"
          />
          <span className={`absolute bottom-3 right-1 w-3.5 h-3.5 rounded-full border-2 border-gymGray-800 ${user.activeMembership?.status === 'active' || user.role === 'admin' || user.role === 'trainer' ? 'bg-gymNeon' : 'bg-gymRed'}`}></span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight truncate w-full">{user.name}</h3>
        <p className="text-xs uppercase tracking-widest text-gymNeon mt-1 font-semibold">{user.role}</p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gymNeon text-black font-semibold shadow-neon'
                    : 'hover:bg-gymGray-700 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-gymGray-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-400 hover:text-gymRed hover:bg-gymGray-700/50 rounded-lg transition duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0 text-gymRed" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
