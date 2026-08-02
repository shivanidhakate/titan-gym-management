import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const TrainerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/trainers/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/api/trainers/bookings/${id}`, { status: newStatus });
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Calendar className="text-gymNeon h-8 w-8" />
              <span>Training Bookings</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              View your schedule, approve or decline upcoming 1-on-1 sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gymGray-850">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-5 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/30 rounded-xl space-y-4 transition duration-200 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={booking.memberId?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt="Member"
                      className="w-12 h-12 rounded-full border border-gymGray-700 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{booking.memberId?.name || 'Unknown'}</h4>
                      <p className="text-[10px] text-gray-500">{booking.memberId?.email}</p>
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
                
                <div className="flex justify-between text-xs font-semibold flex-grow">
                  <div className="space-y-1 text-gray-400">
                    <span className="block flex items-center space-x-1"><Calendar className="w-3 h-3"/> <span>Date</span></span>
                    <span className="text-white block">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1 text-gray-400 text-right">
                    <span className="block flex items-center justify-end space-x-1"><Clock className="w-3 h-3"/> <span>Time</span></span>
                    <span className="text-gymNeon block">{booking.timeSlot}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="text-xs bg-gymGray-800/50 p-2 rounded border border-gymGray-800 text-gray-400">
                    <span className="font-bold block text-gray-500 mb-0.5">Member Note:</span>
                    {booking.notes}
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="flex space-x-2 pt-2 border-t border-gymGray-800">
                    <button 
                      onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                      className="flex-1 py-2 text-[10px] font-bold text-gymRed bg-gymRed/10 hover:bg-gymRed/20 rounded transition flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>DECLINE</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking._id, 'approved')}
                      className="flex-1 py-2 text-[10px] font-bold text-gymNeon bg-gymNeon/10 hover:bg-gymNeon/20 rounded transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>APPROVE</span>
                    </button>
                  </div>
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
    </div>
  );
};

export default TrainerBookings;
