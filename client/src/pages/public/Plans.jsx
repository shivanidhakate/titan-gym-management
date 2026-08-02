import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, Dumbbell } from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/api/admin/plans');
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (err) {
        console.error('API failed, using fallback plans:', err);
        setPlans([
          { _id: 'plan_basic', name: 'Basic Monthly', price: 999, durationMonths: 1, features: ['Full gym access', 'Cardio zone', 'Locker access', '1 Fitness consultation'], isActive: true },
          { _id: 'plan_premium', name: 'Premium Quarterly', price: 2499, durationMonths: 3, features: ['Gym + Cardio access', 'Aerobics classes', 'Spa access', '2 Personal sessions'], isActive: true },
          { _id: 'plan_titan', name: 'Titan Annual VIP', price: 7999, durationMonths: 12, features: ['24/7 VIP Gym access', 'Personal Trainer', 'Diet planning', 'Spa & Merch'], isActive: true }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="bg-gymGray-900 py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-gymRed font-extrabold text-sm uppercase tracking-widest">CHOOSE YOUR PROGRAM</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-none">
            Membership Plans
          </h1>
          <div className="h-1.5 w-24 bg-gymRed mx-auto rounded-full"></div>
          <p className="text-gray-400 font-light leading-relaxed">
            Flexible commitment options designed to sync with your lifestyle. Secure payment processing powered by Razorpay.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div key={plan._id || idx} className={`glass-card p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition duration-300 relative border ${plan.name.toLowerCase().includes('annual') || plan.name.toLowerCase().includes('titan') ? 'border-gymNeon/30 shadow-neon' : 'border-gymGray-800'}`}>
                {plan.name.toLowerCase().includes('annual') && (
                  <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gymNeon text-black font-extrabold text-xs uppercase rounded-full shadow-neon">
                    BEST VALUE
                  </span>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''} Duration</p>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gymNeon">₹</span>
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                  </div>
                  {plan.description && <p className="text-sm text-gray-400 font-light leading-relaxed">{plan.description}</p>}
                  <div className="h-px bg-gymGray-800"></div>
                  <ul className="space-y-3">
                    {(plan.features || []).map((feat, fidx) => (
                      <li key={fidx} className="flex items-start space-x-3 text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-gymNeon shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-8">
                  <Link to="/register" className="w-full block text-center py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-neon">
                    JOIN MEMBERSHIP
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Plans;
