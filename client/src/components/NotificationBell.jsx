import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import api from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => api.put(`/api/notifications/${n._id}`).catch(() => {})));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const typeColor = (type) => {
    switch (type) {
      case 'membership': return 'bg-gymNeon/20 border-gymNeon/30 text-gymNeon';
      case 'booking': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'workout': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl bg-gymGray-800 hover:bg-gymGray-700 border border-gymGray-700 text-gray-400 hover:text-white transition duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gymRed text-white text-[9px] font-black rounded-full flex items-center justify-center border border-gymGray-800 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 glass-panel border border-gymGray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gymGray-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1 text-[10px] text-gymNeon font-bold hover:underline"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gymNeon"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                  className={`px-5 py-4 border-b border-gymGray-850/60 cursor-pointer hover:bg-gymGray-800/50 transition group relative ${
                    !notif.isRead ? 'bg-gymGray-800/40' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {!notif.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-gymNeon shrink-0"></span>
                    )}
                    <div className={`flex-1 ${notif.isRead ? 'ml-5' : ''}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${typeColor(notif.type)}`}>
                          {notif.type || 'system'}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white leading-snug">{notif.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(notif._id, e)}
                    className="absolute top-3 right-3 p-1 rounded text-gray-600 hover:text-gymRed opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600 text-xs space-y-2">
                <Bell className="w-8 h-8 opacity-30" />
                <span>No notifications yet</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
