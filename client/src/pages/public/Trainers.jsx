import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Star } from 'lucide-react';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await api.get('/api/members/trainers');
        if (res.data.success) {
          setTrainers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load trainers, using defaults:', err);
        setTrainers([
          { name: 'John Carter', trainerSpecialties: ['Bodybuilding', 'Nutrition Planning'], profilePicture: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200', trainerBio: 'Former weightlifting champion with 8+ years coaching experience.', trainerRate: 500 },
          { name: 'Sarah Jenkins', trainerSpecialties: ['HIIT', 'Cardio Fitness', 'Weight Loss'], profilePicture: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=200', trainerBio: 'Certified fitness expert specializing in body transformation.', trainerRate: 600 },
          { name: 'Mike Tyson', trainerSpecialties: ['Strength & Conditioning', 'Boxing Training'], profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', trainerBio: 'Specialist in functional movements and competitive athletic prep.', trainerRate: 800 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  return (
    <div className="bg-gymGray-900 py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-gymNeon font-extrabold text-sm uppercase tracking-widest">COACHING STAFF</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-none">
            Meet Our Experts
          </h1>
          <div className="h-1.5 w-24 bg-gymNeon mx-auto rounded-full"></div>
          <p className="text-gray-400 font-light leading-relaxed">
            Professional coaches specialized in strength conditioning, functional workouts, weight management, and diet formulation.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gymNeon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((tr, idx) => (
              <div key={idx} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition duration-300 border border-gymGray-800 flex flex-col justify-between">
                <div>
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={tr.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt={tr.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gymGray-900 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{tr.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(tr.trainerSpecialties || []).map((spec, sidx) => (
                            <span key={sidx} className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gymNeon/10 border border-gymNeon/15 text-gymNeon rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">{tr.trainerBio || 'Elite coach ready to support your program.'}</p>
                  </div>
                </div>
                <div className="p-6 border-t border-gymGray-800 bg-gymGray-900/50 flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Session Rate:</span>
                  <span className="text-gymNeon font-bold text-base">₹{tr.trainerRate || 500} <span className="text-xs text-gray-400 font-light">/ hr</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Trainers;
