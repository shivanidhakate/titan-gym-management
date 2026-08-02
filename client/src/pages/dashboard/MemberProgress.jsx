import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LineChart, Activity, Plus, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MemberProgress = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ weight: '', height: '', bodyFat: '' });

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/members/bmi');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch progress history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogProgress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/members/bmi', newRecord);
      if (res.data.success) {
        setShowModal(false);
        setNewRecord({ weight: '', height: '', bodyFat: '' });
        fetchHistory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log progress');
    }
  };

  // Chart Data preparation
  const chartData = {
    labels: history.map(h => new Date(h.recordedAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: history.map(h => h.weight),
        borderColor: 'rgba(235, 235, 245, 0.6)',
        backgroundColor: 'rgba(235, 235, 245, 0.1)',
        tension: 0.3,
      },
      {
        label: 'BMI',
        data: history.map(h => h.bmi),
        borderColor: '#dbf72d', // gymNeon
        backgroundColor: 'rgba(219, 247, 45, 0.2)',
        tension: 0.3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <LineChart className="text-gymNeon h-8 w-8" />
              <span>Progress Tracker</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Log your body metrics and visualize your fitness journey over time.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon"
          >
            <Activity className="h-5 w-5" />
            <span>LOG NEW RECORD</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart View */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gymGray-850">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
            <TrendingUp className="text-gymNeon h-5 w-5" />
            <span>Weight & BMI Trends</span>
          </h3>
          
          <div className="h-80 w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
              </div>
            ) : history.length >= 2 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm text-center px-4">
                Not enough data to display chart. Log at least 2 records to see your trend line.
              </div>
            )}
          </div>
        </div>

        {/* Recent History Table */}
        <div className="glass-panel p-6 rounded-2xl border border-gymGray-850 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6">Recent History</h3>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gymNeon"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {[...history].reverse().map(record => (
                <div key={record._id} className="p-4 bg-gymGray-900 border border-gymGray-800 rounded-xl">
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="text-gray-400 font-semibold">{new Date(record.recordedAt).toLocaleDateString()}</span>
                    <span className="text-gymNeon font-bold font-mono">BMI: {record.bmi}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-2xl font-black text-white">{record.weight}</span>
                      <span className="text-gray-500 text-xs ml-1">kg</span>
                    </div>
                    {record.bodyFat && (
                      <span className="text-gray-400 text-xs">Fat: {record.bodyFat}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-500 text-sm">
              No records found. Start logging today!
            </div>
          )}
        </div>
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-gymNeon/30">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Activity className="text-gymNeon w-6 h-6" />
              <span>Log Progress</span>
            </h3>
            <form onSubmit={handleLogProgress} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight (kg) *</label>
                  <input 
                    type="number" step="0.1" required
                    value={newRecord.weight}
                    onChange={e => setNewRecord({...newRecord, weight: e.target.value})}
                    className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                    placeholder="e.g. 75.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Height (cm) *</label>
                  <input 
                    type="number" required
                    value={newRecord.height}
                    onChange={e => setNewRecord({...newRecord, height: e.target.value})}
                    className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                    placeholder="e.g. 180"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Body Fat % (Optional)</label>
                <input 
                  type="number" step="0.1"
                  value={newRecord.bodyFat}
                  onChange={e => setNewRecord({...newRecord, bodyFat: e.target.value})}
                  className="w-full bg-gymGray-900 border border-gymGray-800 rounded-lg p-3 text-white focus:border-gymNeon focus:outline-none"
                  placeholder="e.g. 15.2"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gymGray-800 hover:bg-gymGray-700 text-white font-bold text-xs rounded-xl transition">
                  CANCEL
                </button>
                <button type="submit" className="flex-1 py-3 bg-gymNeon hover:bg-gymNeon-dark text-black font-bold text-xs rounded-xl transition shadow-neon">
                  SAVE RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProgress;
