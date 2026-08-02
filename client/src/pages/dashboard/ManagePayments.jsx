import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Activity, DollarSign, Download } from 'lucide-react';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/admin/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Activity className="text-gymNeon h-8 w-8" />
              <span>Manage Payments</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Track global transactions and membership payment history.
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
                  <th className="py-4 px-6 font-bold">Transaction ID</th>
                  <th className="py-4 px-6 font-bold">Member</th>
                  <th className="py-4 px-6 font-bold">Plan Details</th>
                  <th className="py-4 px-6 font-bold">Amount</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold">Date</th>
                  <th className="py-4 px-6 font-bold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id} className="border-b border-gymGray-850/50 hover:bg-gymGray-800/30 transition">
                      <td className="py-4 px-6 text-gray-400 font-mono text-[10px]">
                        {payment.transactionId || payment._id.substring(0, 10)}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white font-bold text-xs">{payment.memberId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500">{payment.memberId?.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-gray-300 font-semibold bg-gymGray-800 px-2 py-1 rounded">
                          {payment.planId?.name || 'Unknown Plan'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gymNeon font-black text-sm">
                        ${payment.amount}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                          payment.status === 'completed' ? 'bg-gymNeon/20 text-gymNeon border border-gymNeon/30' : 
                          payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                          'bg-gymRed/20 text-gymRed border border-gymRed/30'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-[10px] font-semibold uppercase">
                        {new Date(payment.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-500 hover:text-white transition" title="Download Receipt">
                          <Download className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 text-sm">
                      No payments found.
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

export default ManagePayments;
