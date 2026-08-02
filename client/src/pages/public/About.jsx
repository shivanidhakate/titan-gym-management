import React from 'react';
import { Dumbbell, ShieldCheck, Heart, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-gymGray-900 py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-gymNeon font-extrabold text-sm uppercase tracking-widest">ABOUT THE TITAN CLUB</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-none">
            REDEFINING PHYSICAL LIMITS
          </h1>
          <div className="h-1.5 w-24 bg-gymNeon mx-auto rounded-full"></div>
          <p className="text-gray-400 font-light leading-relaxed">
            Titan Gym Club is a premium fitness network designed for athletes, bodybuilders, and fitness enthusiasts seeking high-tier training conditions.
          </p>
        </div>

        {/* Section 1: Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Our Training Philosophy</h2>
            <p className="text-gray-400 leading-relaxed font-light">
              Founded in 2026, Titan Gym Club set out with a simple mandate: eliminate generic, crowded fitness centers and build an uncompromising strength space. We provide specialized training areas configured with commercial-grade plates, custom selectorized strength circuits, and premium cardio gear.
            </p>
            <p className="text-gray-400 leading-relaxed font-light">
              Whether you are preparing for a bodybuilding competition, recovering from athletic stress, or seeking general body transformations, we deliver a structured framework including tracking, dietary counseling, and dedicated coaches.
            </p>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden border border-gymGray-700/50 shadow-neon">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
              alt="Gym training area"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Section 2: Grid of Core Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { title: 'Commercial Equipment', desc: 'Over 100+ Hammer Strength, Eleiko, and LifeFitness weight systems.', icon: Dumbbell },
            { title: 'Premium Cleanliness', desc: 'Constant sanitation routines, HEPA air filtration, and luxury shower facilities.', icon: ShieldCheck },
            { title: 'Goal-Oriented Plans', desc: 'In-app BMI logs, body composition metrics, and daily workout scheduling.', icon: Zap },
            { title: 'Elite Community', desc: 'A supportive, focused environment. No distractions, just pure hard work.', icon: Heart }
          ].map((val, idx) => (
            <div key={idx} className="glass-card p-6 rounded-xl border border-gymGray-800 flex flex-col justify-between hover:border-gymNeon/30 transition duration-300">
              <div className="p-3 bg-gymNeon/5 rounded-lg border border-gymNeon/10 w-fit mb-6">
                <val.icon className="h-6 w-6 text-gymNeon" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{val.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default About;
