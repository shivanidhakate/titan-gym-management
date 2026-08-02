import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const defaultAuthValue = {
  user: null,
  loading: false,
  login: async () => ({ success: false, message: 'Auth unavailable' }),
  register: async () => ({ success: false, message: 'Auth unavailable' }),
  logout: () => {},
  updateProfileState: () => {}
};

const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Error loading user session:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // Load full user details
        const meRes = await api.get('/api/auth/me');
        setUser(meRes.data.data);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, phone, address) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, phone, address });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // Load full user details
        const meRes = await api.get('/api/auth/me');
        setUser(meRes.data.data);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile handler (local state synchronizer)
  const updateProfileState = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
