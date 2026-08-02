import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-gymGray-900 py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-gymNeon font-extrabold text-sm uppercase tracking-widest">GET IN TOUCH</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-none">
            Contact Titan Gym
          </h1>
          <div className="h-1.5 w-24 bg-gymNeon mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold uppercase text-white">We are here to support your goals</h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Have questions about membership plan rates, customized trainer programs, or booking cancellations? Shoot us a message or visit our front office.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Gym Headquarters', details: '123 Fitness Way, Tech City, IN' },
                { icon: Phone, title: 'Front Desk Hotline', details: '+91 99776 65544' },
                { icon: Mail, title: 'Support Email', details: 'contact@titangym.com' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 p-5 bg-gymGray-850 glass-card rounded-xl border border-gymGray-800">
                  <div className="p-3 bg-gymNeon/5 rounded-lg border border-gymNeon/15">
                    <item.icon className="h-6 w-6 text-gymNeon" />
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-gray-400 font-bold">{item.title}</h4>
                    <p className="text-white text-base font-semibold mt-0.5">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-panel p-8 rounded-2xl border border-gymGray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitted && (
                <div className="p-4 bg-gymNeon/10 text-gymNeon border border-gymNeon/20 rounded-xl text-sm font-semibold">
                  Thank you! Your message has been sent successfully. A fitness consultant will email you shortly.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gymGray-900 border border-gymGray-800 focus:border-gymNeon focus:outline-none py-3 px-4 rounded-xl text-white"
                  required
                ></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-gymNeon hover:bg-gymNeon-dark text-black font-extrabold rounded-xl transition duration-200 shadow-neon flex items-center justify-center space-x-2">
                <Send className="h-4 w-4" />
                <span>SEND MESSAGE</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
