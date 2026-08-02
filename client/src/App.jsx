import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Plans from './pages/public/Plans';
import Trainers from './pages/public/Trainers';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Member Pages
import MemberDashboard from './pages/dashboard/MemberDashboard';
import MemberProfile from './pages/dashboard/MemberProfile';
import MemberBookings from './pages/dashboard/MemberBookings';
import MemberWorkouts from './pages/dashboard/MemberWorkouts';
import MemberPayments from './pages/dashboard/MemberPayments';
import MemberProgress from './pages/dashboard/MemberProgress';

// Trainer Pages
import TrainerDashboard from './pages/dashboard/TrainerDashboard';
import TrainerMembers from './pages/dashboard/TrainerMembers';
import TrainerBookings from './pages/dashboard/TrainerBookings';
import TrainerWorkouts from './pages/dashboard/TrainerWorkouts';

// Admin Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManageMembers from './pages/dashboard/ManageMembers';
import ManageTrainers from './pages/dashboard/ManageTrainers';
import ManagePlans from './pages/dashboard/ManagePlans';
import ManageBookings from './pages/dashboard/ManageBookings';
import ManagePayments from './pages/dashboard/ManagePayments';
import ChangePassword from './pages/dashboard/ChangePassword';

// Public Layout (Navbar + Page + Footer)
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Dashboard Layout (Sidebar + Profile Header + Content)
const DashboardLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gymGray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Mini Header */}
        <header className="glass-panel py-4 px-8 border-b border-gymGray-800 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2 text-gymNeon font-bold uppercase tracking-wider">
            <span>Titan Fitness Center</span>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <span className="text-gray-400">Welcome, <span className="text-white font-medium">{user?.name}</span></span>
            <span className="text-xs px-2 py-0.5 bg-gymNeon text-black font-semibold rounded uppercase">{user?.role}</span>
          </div>
        </header>

        {/* Dashboard Inner Screen */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Dynamic Dashboard Redirect Route
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'trainer') return <Navigate to="/trainer" replace />;
  return <Navigate to="/member" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Unified Dashboard Gateway */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          {/* Member Dashboard Routes */}
          <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<MemberDashboard />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="bookings" element={<MemberBookings />} />
            <Route path="workouts" element={<MemberWorkouts />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="progress" element={<MemberProgress />} />
          </Route>

          {/* Trainer Dashboard Routes */}
          <Route path="/trainer" element={<ProtectedRoute allowedRoles={['trainer']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<TrainerDashboard />} />
            <Route path="members" element={<TrainerMembers />} />
            <Route path="bookings" element={<TrainerBookings />} />
            <Route path="workouts" element={<TrainerWorkouts />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<ManageMembers />} />
            <Route path="trainers" element={<ManageTrainers />} />
            <Route path="plans" element={<ManagePlans />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Trainer Dashboard Routes */}
          <Route path="/trainer" element={<ProtectedRoute allowedRoles={['trainer']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<TrainerDashboard />} />
            <Route path="members" element={<TrainerMembers />} />
            <Route path="bookings" element={<TrainerBookings />} />
            <Route path="workouts" element={<TrainerWorkouts />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
