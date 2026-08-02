import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // We can use qrcode.react to render the SVG QR
import {
  Calendar,
  Dumbbell,
  TrendingUp,
  User,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
  Sparkles,
  MapPin,
  Bell
} from 'lucide-react';

const MemberDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');
  const [notifications, setNotifications] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/members/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load member dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.slice(0, 3)); // show top 3
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, []);

  const handleSimulateCheckIn = async () => {
    setCheckInMsg('');
    try {
      const res = await api.post('/api/attendance/checkin-qr');
      if (res.data.success) {
        setCheckInMsg({ type: 'success', text: res.data.message });
        fetchDashboard(); // reload stats
        fetchNotifications();
      }
    } catch (err) {
      setCheckInMsg({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
    }
  };

  const clearNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gymNeon"></div>
      </div>
    );
  }

  const { membership, attendancePercentage, todaysWorkout, nextSession, latestBMI } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gymNeon/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <span>GET AFTER IT TODAY</span>
              <Sparkles className="text-gymNeon h-6 w-6 animate-pulse-neon" />
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              "Strength does not come from winning. Your struggles develop your strengths." Track your attendance, follow your schedule, and log your progress.
            </p>
          </div>
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon"
          >
            <QrCode className="h-5 w-5" />
            <span>GENERATE CHECK-IN QR</span>
          </button>
        </div>
      </div>

      {/* Notifications Drawer */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
            <Bell className="h-4 w-4 text-gymNeon" />
            <span>Recent Alerts</span>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {notifications.map(notif => (
              <div key={notif._id} className="p-4 bg-gymGray-800/40 rounded-xl border border-gymGray-700/50 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-white block mb-0.5">{notif.title}</span>
                  <span className="text-gray-400 font-light text-xs">{notif.message}</span>
                </div>
                <button
                  onClick={() => clearNotification(notif._id)}
                  className="text-xs text-gray-500 hover:text-gymRed transition duration-200 font-semibold"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: 3 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Membership Details */}
        <div className="glass-card p-6 rounded-xl border border-gymGray-850 flex flex-col justify-between h-48">
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Active Membership</span>
            <h3 className="text-xl font-bold text-white truncate">{membership?.planId?.name || 'No Active Plan'}</h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Clock className="h-4 w-4 text-gymNeon" />
            {membership?.status === 'active' ? (
              <span className="text-gray-300">
                Expires on:{' '}
                <span className="text-white font-semibold">
                  {new Date(membership.endDate).toDateString()}
                </span>
              </span>
            ) : (
              <span className="text-gymRed font-semibold">Inactive / Expired</span>
            )}
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="glass-card p-6 rounded-xl border border-gymGray-850 flex flex-col justify-between h-48">
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Monthly Attendance</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{attendancePercentage}%</span>
              <span className="text-xs text-gray-400 font-light">Target 90%+</span>
            </div>
          </div>
          <div className="h-1.5 bg-gymGray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gymNeon rounded-full transition-all duration-500"
              style={{ width: `${attendancePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Body Composition BMI */}
        <div className="glass-card p-6 rounded-xl border border-gymGray-850 flex flex-col justify-between h-48">
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Latest BMI Record</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{latestBMI?.bmi || '0.0'}</span>
              {latestBMI?.weight && (
                <span className="text-sm text-gray-400">({latestBMI.weight} kg)</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <TrendingUp className="text-gymNeon h-4 w-4" />
            <span className="text-gray-400">
              Body fat:{' '}
              <span className="text-white font-semibold">{latestBMI?.bodyFat ? `${latestBMI.bodyFat}%` : 'Not recorded'}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Workout vs Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Today's Workout Schedule */}
        <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-6">
          <div className="flex justify-between items-center border-b border-gymGray-800 pb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2.5">
              <Dumbbell className="text-gymNeon h-5 w-5" />
              <span>Today's Workout Program</span>
            </h3>
            {todaysWorkout && (
              <span className="text-[10px] font-extrabold tracking-wider py-1 px-2.5 bg-gymNeon/15 border border-gymNeon/20 text-gymNeon rounded-full uppercase">
                {todaysWorkout.title}
              </span>
            )}
          </div>

          {todaysWorkout && todaysWorkout.exercises && todaysWorkout.exercises.length > 0 ? (
            <div className="space-y-4">
              {todaysWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="p-4 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/20 rounded-xl flex items-center justify-between text-sm transition duration-200">
                  <div className="space-y-1">
                    <span className="font-bold text-white block">{ex.name}</span>
                    {ex.notes && <span className="text-xs text-gray-500 font-light">{ex.notes}</span>}
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-gymNeon font-bold block">{ex.sets} Sets</span>
                    <span className="text-gray-400 font-light block">{ex.reps} Reps • {ex.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <span className="text-gray-500 text-sm">No scheduled exercises for today.</span>
              <p className="text-xs text-gymNeon font-semibold">Rest Day - Hydrate, focus on mobility, and recover!</p>
            </div>
          )}
        </div>

        {/* Upcoming Trainer Session */}
        <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-6">
          <div className="flex justify-between items-center border-b border-gymGray-800 pb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2.5">
              <Calendar className="text-gymNeon h-5 w-5" />
              <span>Coaching Sessions</span>
            </h3>
            {nextSession && (
              <span className="text-[10px] font-extrabold tracking-wider py-1 px-2.5 bg-gymNeon/15 border border-gymNeon/20 text-gymNeon rounded-full uppercase">
                CONFIRMED
              </span>
            )}
          </div>

          {nextSession ? (
            <div className="p-5 bg-gymGray-900 border border-gymGray-850 rounded-xl space-y-5">
              <div className="flex items-center space-x-4">
                <img
                  src={nextSession.trainerId?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt="Trainer"
                  className="w-14 h-14 rounded-full object-cover border border-gymNeon"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{nextSession.trainerId?.name}</h4>
                  <p className="text-xs text-gray-400">Personal Fitness Coach</p>
                </div>
              </div>
              
              <div className="h-px bg-gymGray-800"></div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-400">
                <div className="space-y-1">
                  <span>DATE:</span>
                  <span className="text-white block font-bold">{new Date(nextSession.date).toDateString()}</span>
                </div>
                <div className="space-y-1">
                  <span>TIME SLOT:</span>
                  <span className="text-white block font-bold">{nextSession.timeSlot}</span>
                </div>
              </div>

              {nextSession.notes && (
                <div className="text-xs bg-gymGray-800/40 p-3 rounded border border-gymGray-800 text-gray-300">
                  <span className="font-bold uppercase text-gray-400 block mb-0.5">Session Focus:</span>
                  {nextSession.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <p className="text-gray-500 text-sm">No training bookings scheduled for this week.</p>
              <div className="pt-2">
                <Link to="/member/bookings" className="px-5 py-2.5 bg-gymGray-800 hover:bg-gymGray-700 text-xs font-extrabold rounded-lg text-white border border-gymGray-750 transition duration-200">
                  BOOK COACHING SESSION
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* QR CHECK-IN MODAL POPUP */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-sm border border-gymNeon/30 text-center space-y-6 relative animate-float">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">Your Check-in Code</h3>
              <p className="text-xs text-gray-400 font-light">Present this QR code at the gym reception scanner.</p>
            </div>

            {/* QR SVG Generation */}
            <div className="bg-white p-4 rounded-xl inline-block shadow-neon">
              <QRCodeSVG
                value={`token_member_${dashboardData?.membership?.planId || 'member_id'}_${Date.now()}`}
                size={180}
                level="M"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Simulator Actions */}
            <div className="space-y-3 bg-gymGray-900/60 p-4 rounded-xl border border-gymGray-850">
              <span className="text-[10px] font-extrabold tracking-widest text-gymNeon uppercase block">RECEPTION SCANNER SIMULATOR</span>
              <button
                onClick={handleSimulateCheckIn}
                className="w-full py-3 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-xs rounded-lg transition duration-200 shadow-neon"
              >
                SIMULATE SCANNER BEAM
              </button>
              
              {checkInMsg && (
                <div className={`p-2.5 rounded text-xs font-semibold ${checkInMsg.type === 'success' ? 'bg-gymNeon/10 text-gymNeon' : 'bg-gymRed/10 text-gymRed'}`}>
                  {checkInMsg.text}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                setCheckInMsg('');
              }}
              className="text-xs text-gray-400 hover:text-white underline font-semibold"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberDashboard;
