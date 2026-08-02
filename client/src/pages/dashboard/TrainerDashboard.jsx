import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/trainers/dashboard');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load trainer dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gymNeon"></div>
      </div>
    );
  }

  const {
    memberCount = 0,
    todaysBookingsCount = 0,
    upcomingBookings = []
  } = stats || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gymNeon/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <ClipboardList className="text-gymNeon h-8 w-8" />
              <span>Trainer Portal</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Welcome back, Coach {user?.name}. Here's an overview of your schedule and assigned members.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Assigned Members */}
        <div className="glass-card p-6 rounded-xl border border-gymGray-850 flex flex-col justify-between h-36">
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Assigned Members</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{memberCount}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2 text-xs">
              <Users className="h-4 w-4 text-gymNeon" />
              <span className="text-gray-400">Total active clients</span>
            </div>
            <Link to="/trainer/members" className="text-xs text-gymNeon font-bold hover:underline">View All</Link>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="glass-card p-6 rounded-xl border border-gymGray-850 flex flex-col justify-between h-36">
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Today's Sessions</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{todaysBookingsCount}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2 text-xs">
              <Calendar className="h-4 w-4 text-gymNeon" />
              <span className="text-gray-400">Approved bookings today</span>
            </div>
            <Link to="/trainer/bookings" className="text-xs text-gymNeon font-bold hover:underline">Manage</Link>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-6">
        <div className="flex justify-between items-center border-b border-gymGray-800 pb-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2.5">
            <Clock className="text-gymNeon h-5 w-5" />
            <span>Upcoming Sessions</span>
          </h3>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="p-5 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/30 rounded-xl space-y-4 transition duration-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={booking.memberId?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt="Member"
                    className="w-10 h-10 rounded-full object-cover border border-gymGray-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{booking.memberId?.name || 'Unknown Member'}</h4>
                    <p className="text-xs text-gray-500">{booking.memberId?.email}</p>
                  </div>
                </div>
                
                <div className="h-px bg-gymGray-800"></div>

                <div className="flex justify-between text-xs font-semibold">
                  <div className="space-y-1 text-gray-400">
                    <span className="block">Date</span>
                    <span className="text-white block">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1 text-gray-400 text-right">
                    <span className="block">Time Slot</span>
                    <span className="text-gymNeon block">{booking.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                    booking.status === 'approved' ? 'bg-gymNeon/20 text-gymNeon border border-gymNeon/30' : 
                    'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  }`}>
                    {booking.status}
                  </span>
                  {booking.status === 'pending' && (
                    <span className="text-[10px] text-gray-500 font-semibold italic flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Needs Approval</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            No upcoming bookings scheduled.
          </div>
        )}
      </div>

    </div>
  );
};

export default TrainerDashboard;
