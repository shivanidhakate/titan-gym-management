import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, Users, CreditCard, Activity, CheckCircle, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } }
  },
  scales: {
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
    },
    x: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
    }
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
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
    totalMembers = 0,
    activeMembers = 0,
    totalTrainers = 0,
    totalRevenue = 0,
    todaysAttendanceCount = 0,
    recentPayments = []
  } = stats || {};

  // ── Chart data derived from backend stats ──────────────────
  // Member breakdown donut
  const memberDonutData = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [activeMembers, totalMembers - activeMembers],
      backgroundColor: ['rgba(219,247,45,0.85)', 'rgba(239,68,68,0.5)'],
      borderColor: ['#dbf72d', '#ef4444'],
      borderWidth: 2,
      hoverOffset: 6
    }]
  };

  // Revenue trend (from last 6 months of recentPayments — mock grouping)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = Array(12).fill(0);
  recentPayments.filter(p => p.status === 'completed').forEach(p => {
    const month = new Date(p.transactionDate).getMonth();
    revenueByMonth[month] += (p.amount || 0);
  });
  const currentMonth = new Date().getMonth();
  const last6Labels = [];
  const last6Revenue = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonth - i + 12) % 12;
    last6Labels.push(months[idx]);
    last6Revenue.push(revenueByMonth[idx]);
  }

  const revenueLineData = {
    labels: last6Labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: last6Revenue,
      borderColor: '#dbf72d',
      backgroundColor: 'rgba(219,247,45,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#dbf72d',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  // Plan popularity bar (from payments)
  const planCounts = {};
  recentPayments.forEach(p => {
    const name = p.planId?.name || 'Unknown';
    planCounts[name] = (planCounts[name] || 0) + 1;
  });
  const planBarData = {
    labels: Object.keys(planCounts),
    datasets: [{
      label: 'Subscriptions',
      data: Object.values(planCounts),
      backgroundColor: ['rgba(219,247,45,0.7)', 'rgba(59,130,246,0.6)', 'rgba(239,68,68,0.6)'],
      borderRadius: 6
    }]
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gymNeon/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Shield className="text-gymNeon h-8 w-8" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              System overview, revenue analytics, and global management.
            </p>
          </div>
          <Link to="/admin/members" className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon">
            <Users className="h-5 w-5" />
            <span>MANAGE USERS</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Members', value: totalMembers, sub: `${activeMembers} Active`, icon: Users, color: 'text-gymNeon' },
          { label: 'Total Trainers', value: totalTrainers, sub: 'Active coaches', icon: CheckCircle, color: 'text-blue-400' },
          { label: "Today's Check-ins", value: todaysAttendanceCount, sub: 'Members at gym', icon: Activity, color: 'text-purple-400' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: 'Completed payments', icon: DollarSign, color: 'text-gymNeon' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="glass-card p-6 rounded-xl border border-gymGray-850 flex flex-col justify-between h-36">
            <div>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">{label}</span>
              <span className={`text-4xl font-black ${color}`}>{value}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-gray-400">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend Line */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="text-gymNeon w-4 h-4" />
            <span>Revenue Trend (Last 6 Months)</span>
          </h3>
          <div className="h-52">
            <Line data={revenueLineData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
          </div>
        </div>

        {/* Member Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Users className="text-gymNeon w-4 h-4" />
            <span>Member Status</span>
          </h3>
          <div className="h-52 flex items-center justify-center">
            <Doughnut
              data={memberDonutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Plan Popularity Bar */}
      {Object.keys(planCounts).length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart2 className="text-gymNeon w-4 h-4" />
            <span>Plan Subscriptions Breakdown</span>
          </h3>
          <div className="h-44">
            <Bar data={planBarData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
          </div>
        </div>
      )}

      {/* Recent Payments Table */}
      <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 space-y-6">
        <div className="flex justify-between items-center border-b border-gymGray-800 pb-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2.5">
            <CreditCard className="text-gymNeon h-5 w-5" />
            <span>Recent Transactions</span>
          </h3>
          <Link to="/admin/payments" className="text-xs font-semibold text-gymNeon hover:text-white transition">
            View All →
          </Link>
        </div>

        {recentPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gymGray-800 text-xs uppercase tracking-widest text-gray-500">
                  <th className="pb-3 px-4 font-bold">Transaction ID</th>
                  <th className="pb-3 px-4 font-bold">Member</th>
                  <th className="pb-3 px-4 font-bold">Plan</th>
                  <th className="pb-3 px-4 font-bold">Amount</th>
                  <th className="pb-3 px-4 font-bold">Status</th>
                  <th className="pb-3 px-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
                    <td className="py-4 px-4 text-gray-300 font-mono text-xs">{payment.transactionId || payment._id.substring(0, 8)}</td>
                    <td className="py-4 px-4 text-white font-medium">{payment.memberId?.name || 'Unknown'}</td>
                    <td className="py-4 px-4 text-gray-400">{payment.planId?.name || 'Unknown Plan'}</td>
                    <td className="py-4 px-4 font-bold text-gymNeon">₹{payment.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        payment.status === 'completed' ? 'bg-gymNeon/20 text-gymNeon border border-gymNeon/30' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        'bg-gymRed/20 text-gymRed border border-gymRed/30'
                      }`}>{payment.status}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-xs">{new Date(payment.transactionDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No recent transactions found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
