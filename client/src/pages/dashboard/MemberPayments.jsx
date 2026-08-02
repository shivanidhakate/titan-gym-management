import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, ShieldCheck, ExternalLink, CheckCircle, Zap, Crown, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ── Razorpay script loader ──────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Plan icon helper ────────────────────────────────────────────────────────
const PlanIcon = ({ name }) => {
  const lc = name?.toLowerCase() || '';
  if (lc.includes('basic')) return <Zap className="w-6 h-6 text-gray-400" />;
  if (lc.includes('premium') || lc.includes('quarterly')) return <Star className="w-6 h-6 text-yellow-400" />;
  return <Crown className="w-6 h-6 text-gymNeon" />;
};

// ── Component ───────────────────────────────────────────────────────────────
const MemberPayments = () => {
  const { user, login } = useAuth();
  const membership = user?.activeMembership;

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null); // holds activated plan name

  // ── Fetch plans ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/admin/plans');
        if (res.data.success) setPlans(res.data.data);
      } catch {
        // fallback plans
        setPlans([
          { _id: 'plan_basic', name: 'Basic Monthly', price: 999, durationMonths: 1, features: ['Full gym access', 'Cardio zone', 'Locker access', '1 Fitness consultation'] },
          { _id: 'plan_premium', name: 'Premium Quarterly', price: 2499, durationMonths: 3, features: ['Gym + Cardio access', 'Aerobics classes', 'Spa access', '2 Personal sessions'] },
          { _id: 'plan_titan', name: 'Titan Annual VIP', price: 7999, durationMonths: 12, features: ['24/7 VIP Gym access', 'Personal Trainer', 'Diet planning', 'Spa & Merch'] },
        ]);
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  // ── Payment handler ────────────────────────────────────────────────────
  const handleBuyPlan = useCallback(async (plan) => {
    setProcessingPlanId(plan._id);
    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please check your internet connection.');
        return;
      }

      // 2. Create order on backend
      const orderRes = await api.post('/api/payments/order', { planId: plan._id });
      const { order, keyId, isMock } = orderRes.data;

      if (isMock) {
        // ── MOCK FLOW: Skip Razorpay modal, directly verify ──────────────
        const verifyRes = await api.post('/api/payments/verify', {
          planId: plan._id,
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_sig',
          isMock: true,
        });
        if (verifyRes.data.success) {
          setPaymentSuccess(plan.name);
          // Reload page after a moment to refresh membership status
          setTimeout(() => window.location.reload(), 2500);
        }
      } else {
        // ── LIVE RAZORPAY FLOW ──────────────────────────────────────────
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Titan Gym Club',
          description: `${plan.name} Membership`,
          image: '/logo.png',
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/api/payments/verify', {
                planId: plan._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                isMock: false,
              });
              if (verifyRes.data.success) {
                setPaymentSuccess(plan.name);
                setTimeout(() => window.location.reload(), 2500);
              }
            } catch (err) {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#dbf72d' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setProcessingPlanId(null);
    }
  }, [user]);

  // ── Success overlay ────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-gymNeon/20 border border-gymNeon/30 flex items-center justify-center animate-pulse">
          <CheckCircle className="w-12 h-12 text-gymNeon" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-wider">Payment Successful!</h2>
        <p className="text-gray-400 max-w-sm">
          Your <span className="text-gymNeon font-bold">{paymentSuccess}</span> membership is now active. Reloading your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-gymGray-800 to-gymGray-900 border border-gymGray-700/60 overflow-hidden shadow-glass">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
            <CreditCard className="text-gymNeon h-8 w-8" />
            <span>Billing & Subscription</span>
          </h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
            Manage your current subscription or upgrade to unlock more benefits.
            Payments are powered by Razorpay — 100% secure.
          </p>
        </div>
      </div>

      {/* ── Active Plan Card ── */}
      <div className="glass-panel p-8 rounded-2xl border border-gymNeon/20 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 text-gymNeon/5 pointer-events-none">
          <ShieldCheck className="w-72 h-72" />
        </div>
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Current Subscription</h3>

        {membership?.status === 'active' ? (
          <div className="space-y-6 relative z-10">
            <div className="flex items-end space-x-4 flex-wrap gap-2">
              <h2 className="text-4xl font-black text-white uppercase tracking-wider">
                {membership.planId?.name || 'Active Plan'}
              </h2>
              <span className="bg-gymNeon text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase mb-1">
                ● Active
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gymGray-800">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Date</p>
                <p className="text-white font-semibold">{new Date(membership.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Valid Until</p>
                <p className="text-white font-semibold">{new Date(membership.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Days Remaining</p>
                <p className="text-gymNeon font-black text-xl">
                  {Math.max(0, Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-3">
            <p className="text-gray-400 text-sm">You don't have an active membership plan.</p>
            <p className="text-gray-500 text-xs">Choose a plan below to get started.</p>
          </div>
        )}
      </div>

      {/* ── Plans Selector ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          {membership?.status === 'active' ? 'Upgrade or Renew Plan' : 'Choose a Plan'}
        </h2>

        {loadingPlans ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isBestValue = plan.name?.toLowerCase().includes('annual') || plan.name?.toLowerCase().includes('titan');
              const isCurrentPlan = membership?.planId?._id === plan._id || membership?.planId === plan._id;
              const isProcessing = processingPlanId === plan._id;

              return (
                <div
                  key={plan._id}
                  className={`glass-panel p-7 rounded-2xl flex flex-col justify-between border transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                    isBestValue
                      ? 'border-gymNeon/40 shadow-neon'
                      : 'border-gymGray-800 hover:border-gymGray-700'
                  }`}
                >
                  {isBestValue && (
                    <span className="absolute -top-px right-4 px-3 py-1 bg-gymNeon text-black font-extrabold text-[10px] uppercase rounded-b-lg">
                      BEST VALUE
                    </span>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center space-x-3">
                      <PlanIcon name={plan.name} />
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{plan.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-gymNeon">₹</span>
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                    </div>

                    <div className="h-px bg-gymGray-800"></div>

                    <ul className="space-y-2.5">
                      {(plan.features || []).map((feat, i) => (
                        <li key={i} className="flex items-start space-x-2.5 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-gymNeon shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-4">
                    {isCurrentPlan ? (
                      <div className="w-full py-3 text-center text-[11px] font-extrabold uppercase text-gymNeon border border-gymNeon/30 rounded-xl bg-gymNeon/5">
                        ✓ Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuyPlan(plan)}
                        disabled={!!processingPlanId}
                        className={`w-full py-3 font-extrabold text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 ${
                          isBestValue
                            ? 'bg-gymNeon hover:bg-gymNeon-dark text-black shadow-neon'
                            : 'bg-gymGray-800 hover:bg-gymGray-700 text-white border border-gymGray-700'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? (
                          <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2"></span>Processing…</>
                        ) : (
                          <><span>BUY NOW</span><ExternalLink className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Security Badge ── */}
      <div className="flex items-center justify-center space-x-3 text-gray-600 text-xs py-4">
        <ShieldCheck className="w-4 h-4" />
        <span>256-bit SSL encrypted payments powered by Razorpay. Your card info is never stored on our servers.</span>
      </div>
    </div>
  );
};

export default MemberPayments;
