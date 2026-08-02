import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, Clock, User, Trash2 } from 'lucide-react';

const MemberBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [newBooking, setNewBooking] = useState({ trainerId: '', date: '', timeSlot: '', notes: '' });

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/members/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/api/members/trainers');
      if (res.data.success) {
        setTrainers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trainers', err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTrainers();
  }, []);

  const handleBookSession = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/members/bookings', newBooking);
      if (res.data.success) {
        setShowBookModal(false);
        setNewBooking({ trainerId: '', date: '', timeSlot: '', notes: '' });
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await api.put(`/api/members/bookings/${id}/cancel`);
        if (res.data.success) {
          fetchBookings();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Cancel failed');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Calendar className="text-gymNeon h-8 w-8" />
              <span>My Bookings</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              View and manage your upcoming personal training sessions.
            </p>
          </div>
          <button 
            onClick={() => setShowBookModal(true)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon"
          >
            <Plus className="h-5 w-5" />
            <span>BOOK SESSION</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gymGray-850">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <div key={booking._id} className="p-5 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/30 rounded-xl space-y-4 transition duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={booking.trainerId?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt="Trainer"
                      className="w-12 h-12 rounded-full border border-gymGray-700 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{booking.trainerId?.name || 'Trainer'}</h4>
                      <p className="text-[10px] uppercase text-gymNeon font-bold">Personal Coach</p>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                    booking.status === 'approved' ? 'bg-gymNeon/20 text-gymNeon border border-gymNeon/30' : 
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                    'bg-gymRed/20 text-gymRed border border-gymRed/30'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="h-px bg-gymGray-800"></div>
                
                <div className="flex justify-between text-xs font-semibold">
                  <div className="space-y-1 text-gray-400">
                    <span className="block flex items-center space-x-1"><Calendar className="w-3 h-3"/> <span>Date</span></span>
                    <span className="text-white block">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1 text-gray-400 text-right">
                    <span className="block flex items-center justify-end space-x-1"><Clock className="w-3 h-3"/> <span>Time</span></span>
                    <span className="text-gymNeon block">{booking.timeSlot}</span>
                  </div>
                </div>

                {['pending', 'approved'].includes(booking.status) && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    className="w-full mt-2 py-2 text-[10px] font-bold text-gray-400 hover:text-gymRed border border-gymGray-800 hover:border-gymRed/30 rounded transition"
                  >
                    CANCEL BOOKING
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            You don't have any upcoming bookings.
          </div>
        )}
      </div>

      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-gymNeon/30">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Calendar className="text-gymNeon w-6 h-6" />
              <span>Book a Session</span>
            </h3>
            <form onSubmit={handleBookSession} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Trainer</label>
                <select 
                  required
                  value={newBooking.trainerId}
                  onChange={e => setNewBooking({...newBooking, trainerId: e.target.value})}
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                >
                  <option value="">-- Choose a Trainer --</option>
                  {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" required
                    value={newBooking.date}
                    onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                    className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Slot</label>
                  <select 
                    required
                    value={newBooking.timeSlot}
                    onChange={e => setNewBooking({...newBooking, timeSlot: e.target.value})}
                    className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                  >
                    <option value="">-- Select Time --</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes (Optional)</label>
                <textarea 
                  rows="2"
                  value={newBooking.notes}
                  onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                  placeholder="e.g. Focus on chest & triceps"
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 py-3 bg-gymGray-800 hover:bg-gymGray-700 text-white font-bold text-xs rounded-xl transition">
                  CANCEL
                </button>
                <button type="submit" className="flex-1 py-3 bg-gymNeon hover:bg-gymNeon-dark text-black font-bold text-xs rounded-xl transition shadow-neon">
                  CONFIRM BOOKING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberBookings;
