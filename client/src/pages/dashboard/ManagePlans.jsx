import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, Edit2, Trash2, Plus } from 'lucide-react';

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/admin/plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="space-y-8">
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <CreditCard className="text-gymNeon h-8 w-8" />
              <span>Membership Plans</span>
            </h1>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
              Create and manage gym membership pricing plans.
            </p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon">
            <Plus className="h-5 w-5" />
            <span>CREATE NEW PLAN</span>
          </button>
        </div>
      </div>
      
      <div className="glass-panel rounded-2xl border border-gymGray-850 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <div key={plan._id} className="p-6 bg-gymGray-900 border border-gymGray-800 hover:border-gymNeon/50 transition duration-300 rounded-2xl flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gymNeon transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{plan.name}</h3>
                      <p className="text-xs text-gray-400 font-semibold">{plan.durationMonths} Months Duration</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gymNeon">${plan.price}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 flex-grow mb-6">{plan.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gymNeon"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gymGray-800 mt-auto">
                    <button className="text-gray-400 hover:text-white transition px-3 py-1.5 bg-gymGray-800 hover:bg-gymGray-700 rounded text-xs font-bold">
                      EDIT
                    </button>
                    <button className="text-gray-400 hover:text-gymRed transition px-3 py-1.5 bg-gymGray-800 hover:bg-gymGray-700 rounded text-xs font-bold">
                      DELETE
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No membership plans found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePlans;
