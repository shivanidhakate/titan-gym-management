import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  TrendingUp,
  Dumbbell,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // BMI state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [bmiTips, setBmiTips] = useState('');

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);

  // Load plans & trainers for preview
  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        const plansRes = await api.get('/api/admin/plans'); // Fallback or route
        if (plansRes.data.success) {
          setPlans(plansRes.data.data.slice(0, 3));
        }
      } catch (err) {
        // Fallback plans if API unavailable (offline)
        setPlans([
          { _id: '1', name: 'Basic Monthly', price: 999, durationMonths: 1, features: ['Full gym access', 'Cardio zone', 'Locker access'] },
          { _id: '2', name: 'Premium Quarterly', price: 2499, durationMonths: 3, features: ['Gym + Cardio access', 'Aerobics classes', 'Spa access'] },
          { _id: '3', name: 'Titan Annual VIP', price: 7999, durationMonths: 12, features: ['24/7 VIP Gym access', 'Personal Trainer', 'Nutrition planning'] }
        ]);
      }

      try {
        const trainersRes = await api.get('/api/members/trainers');
        if (trainersRes.data.success) {
          setTrainers(trainersRes.data.data.slice(0, 3));
        }
      } catch (err) {
        // Fallback trainers
        setTrainers([
          { name: 'John Carter', trainerSpecialties: ['Bodybuilding', 'Nutrition'], profilePicture: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200', trainerBio: 'Former lifting champion' },
          { name: 'Sarah Jenkins', trainerSpecialties: ['HIIT', 'Cardio'], profilePicture: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=200', trainerBio: 'Endurance coach' },
          { name: 'Mike Tyson', trainerSpecialties: ['Strength', 'Boxing'], profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', trainerBio: 'Athletic conditioner' }
        ]);
      }
    };

    loadPreviewData();
  }, []);

  const calculateBMI = (e) => {
    e.preventDefault();
    if (!weight || !height) return;

    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    setBmiResult(bmi);

    if (bmi < 18.5) {
      setBmiCategory('Underweight');
      setBmiTips('Focus on nutrient-dense calorie surpluses. Integrate structured strength training to build muscle mass rather than cardio.');
    } else if (bmi >= 18.5 && bmi < 24.9) {
      setBmiCategory('Normal Weight');
      setBmiTips('Excellent status! Maintain balance with hybrid workouts (lifting + cardio) and support recovery with adequate protein.');
    } else if (bmi >= 24.9 && bmi < 29.9) {
      setBmiCategory('Overweight');
      setBmiTips('Consider a slight caloric deficit. Focus on high-intensity interval training (HIIT) paired with resistance workouts.');
    } else {
      setBmiCategory('Obese');
      setBmiTips('Begin with low-impact cardio (walking, cycling) mixed with light strength reps. Standardize your diet with a trainer.');
    }
  };

  const faqs = [
    {
      question: 'What are your operational hours?',
      answer: 'Our standard operating hours are 5:00 AM to 11:00 PM on weekdays. For Titan VIP and Annual members, we offer 24/7 keycard entry privileges.'
    },
    {
      question: 'Are personal training sessions included in membership?',
      answer: 'Premium Quarterly plans include 2 personal training sessions, and Titan Annual VIP packages include dedicated trainer allocations. You can also book individual sessions with any trainer from your dashboard.'
    },
    {
      question: 'Can I cancel or pause my membership?',
      answer: 'Yes! Memberships can be paused for up to 30 days per year. Cancellations can be requested via email or processed directly through your profile settings.'
    },
    {
      question: 'Is there parking available at the gym?',
      answer: 'Yes, we provide free basement parking with 150+ slots for members. Simply scan your active digital QR-membership code at the entry gate.'
    }
  ];

  return (
    <div className="bg-gymGray-900 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200')]"></div>
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gymNeon/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gymRed/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8">
          <span className="px-4 py-1.5 border border-gymNeon text-gymNeon text-xs font-bold uppercase tracking-widest rounded-full bg-gymNeon/5 inline-block animate-pulse-neon">
            ESTABLISHED IN 2026 • THE APEX CLUB
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none">
            UNLEASH YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gymNeon via-white to-gymRed">
              INNER TITAN
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Gain access to premium bodybuilding equipment, custom-tailored workout blueprints, daily QR checkins, and Elite personal coaches.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold text-base rounded-xl transition duration-200 shadow-neon">
              JOIN THE GYM NOW
            </Link>
            <Link to="/plans" className="w-full sm:w-auto px-8 py-4 border border-gymGray-500 hover:border-white text-white font-bold text-base rounded-xl transition duration-200">
              EXPLORE MEMBERSHIPS
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-12 bg-gymGray-800/40 border-y border-gymGray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '15,000+', label: 'Active Titans', icon: Users },
            { value: '50+', label: 'Elite Coaches', icon: Dumbbell },
            { value: '100+', label: 'Premium Stations', icon: Award },
            { value: '99.8%', label: 'Goal Success Rate', icon: TrendingUp }
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gymGray-800/40 transition duration-300">
              <div className="p-3 bg-gymNeon/5 rounded-lg border border-gymNeon/15">
                <stat.icon className="h-6 w-6 text-gymNeon" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white font-display leading-tight">{stat.value}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MEMBERSHIPS PLANS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight">Flexible Membership Plans</h2>
          <div className="h-1.5 w-24 bg-gymNeon mx-auto rounded-full"></div>
          <p className="text-gray-400">Choose a program matched to your training schedule. No hidden registration fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={plan._id || idx} className={`glass-card p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition duration-300 relative ${idx === 1 ? 'border border-gymNeon/30 ring-1 ring-gymNeon/10 bg-gymGray-800/30' : ''}`}>
              {idx === 1 && (
                <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gymNeon text-black font-extrabold text-xs uppercase rounded-full shadow-neon">
                  RECOMMENDED
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
                  <span className="text-gray-400 ml-2 text-sm">/ total</span>
                </div>
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
                <Link to="/register" className={`w-full block text-center py-3.5 rounded-xl font-extrabold text-sm transition duration-200 ${idx === 1 ? 'bg-gymNeon hover:bg-gymNeon-dark text-black shadow-neon' : 'bg-gymGray-700 hover:bg-gymGray-600 text-white'}`}>
                  GET STARTED NOW
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BMI CALCULATOR SECTION */}
      <section className="py-24 bg-gymGray-800/20 border-y border-gymGray-800/80 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-gymRed font-extrabold text-sm uppercase tracking-widest">FITNESS MATH</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-tight">
              Interactive BMI <br />Calculator
            </h2>
            <p className="text-gray-400 leading-relaxed font-light">
              Body Mass Index (BMI) evaluates your body weight relative to your height. While it does not measure body fat directly, it provides a fast health index classification. Work with our coaches to track your status.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              <div className="p-3 bg-gymGray-800/40 rounded border border-gymGray-700/50">Underweight &lt; 18.5</div>
              <div className="p-3 bg-gymGray-800/40 rounded border border-gymGray-700/50">Normal 18.5 - 24.9</div>
              <div className="p-3 bg-gymGray-800/40 rounded border border-gymGray-700/50">Overweight 25 - 29.9</div>
              <div className="p-3 bg-gymGray-800/40 rounded border border-gymGray-700/50">Obese &ge; 30</div>
            </div>
          </div>

          {/* Calculator Card */}
          <div className="glass-card p-8 rounded-2xl max-w-lg mx-auto w-full border border-gymGray-700">
            <form onSubmit={calculateBMI} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-gymGray-900 border border-gymGray-700 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-gymGray-900 border border-gymGray-700 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white text-base"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold rounded-xl transition duration-200 shadow-neon text-sm">
                CALCULATE YOUR STATUS
              </button>
            </form>

            {bmiResult !== null && (
              <div className="mt-8 p-6 bg-gymGray-900 border border-gymGray-700 rounded-xl space-y-4 animate-float">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-semibold uppercase">Your Index Score:</span>
                  <span className="text-2xl font-black text-gymNeon">{bmiResult}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-semibold uppercase">Category:</span>
                  <span className={`text-base font-extrabold ${bmiCategory === 'Normal Weight' ? 'text-gymNeon' : 'text-gymRed'}`}>{bmiCategory}</span>
                </div>
                <div className="h-px bg-gymGray-800"></div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Coach Recommendation:</span>
                  <p className="text-sm text-gray-300 leading-relaxed font-light">{bmiTips}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. TRAINERS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight">Meet Our Elite Coaches</h2>
          <div className="h-1.5 w-24 bg-gymRed mx-auto rounded-full"></div>
          <p className="text-gray-400">Certified fitness professionals with competitive athletic expertise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainers.map((tr, idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition duration-300 border border-gymGray-800">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={tr.profilePicture}
                  alt={tr.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gymGray-900 via-transparent to-transparent"></div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{tr.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(tr.trainerSpecialties || []).map((spec, sidx) => (
                      <span key={sidx} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gymNeon/10 text-gymNeon rounded border border-gymNeon/15">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{tr.trainerBio || 'Experienced coach ready to guide you.'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-24 bg-gymGray-800/10 border-t border-gymGray-800/80 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight">Frequently Asked Questions</h2>
            <div className="h-1.5 w-24 bg-gymNeon mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel rounded-xl overflow-hidden border border-gymGray-800/80 transition duration-200">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full py-5 px-6 flex justify-between items-center text-left text-white hover:text-gymNeon focus:outline-none transition duration-200"
                >
                  <span className="font-bold text-base md:text-lg flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-gymNeon shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  {activeFaq === idx ? <ChevronUp className="h-5 w-5 text-gymNeon" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-400 leading-relaxed font-light border-t border-gymGray-800/50 bg-gymGray-800/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
