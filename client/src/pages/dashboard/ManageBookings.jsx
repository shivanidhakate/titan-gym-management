import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Trash2, CheckCircle, Clock } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/admin/bookings');
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Calendar className="text-gymNeon h-8 w-8" />
              <span>Manage Bookings</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Overview of all trainer sessions and bookings system-wide.
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-gymGray-850 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gymGray-900/50 border-b border-gymGray-800 text-xs uppercase tracking-widest text-gray-400">
                  <th className="py-4 px-6 font-bold">Booking ID</th>
                  <th className="py-4 px-6 font-bold">Member</th>
                  <th className="py-4 px-6 font-bold">Trainer</th>
                  <th className="py-4 px-6 font-bold">Date & Time</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
                      <td className="py-4 px-6 text-gray-400 font-mono text-xs">
                        {booking._id.substring(0, 8)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={booking.memberId?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                            alt="Member" 
                            className="w-8 h-8 rounded-full object-cover border border-gymGray-700" 
                          />
                          <div>
                            <p className="text-white font-bold text-xs">{booking.memberId?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-500">{booking.memberId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={booking.trainerId?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                            alt="Trainer" 
                            className="w-8 h-8 rounded-full object-cover border border-gymNeon/50" 
                          />
                          <div>
                            <p className="text-white font-bold text-xs">{booking.trainerId?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-500">Coach</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white font-semibold text-xs">{new Date(booking.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gymNeon">{booking.timeSlot}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                          booking.status === 'approved' ? 'bg-gymNeon/20 text-gymNeon border border-gymNeon/30' : 
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                          'bg-gymRed/20 text-gymRed border border-gymRed/30'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                      No bookings found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
