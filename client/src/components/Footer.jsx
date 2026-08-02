import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gymGray-900 border-t border-gymGray-800/80 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-wider">
            <Dumbbell className="text-gymNeon h-8 w-8" />
            <span>TITAN<span className="text-gymNeon font-medium">GYM</span></span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Elevate your body and mind at Titan Gym. State of the art equipment, expert coaches, and structured tracking routines to unlock your true physical potential.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-gymNeon transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gymNeon transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gymNeon transition-colors"><Twitter className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider">Useful Links</h4>
          <ul className="flex flex-col space-y-2.5 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-gymNeon transition-colors">About Us</Link></li>
            <li><Link to="/plans" className="hover:text-gymNeon transition-colors">Membership Plans</Link></li>
            <li><Link to="/trainers" className="hover:text-gymNeon transition-colors">Expert Trainers</Link></li>
            <li><Link to="/contact" className="hover:text-gymNeon transition-colors">Get In Touch</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider">Working Hours</h4>
          <ul className="flex flex-col space-y-2 text-sm text-gray-400">
            <li><span className="text-white font-medium">Weekdays:</span> 05:00 AM - 11:00 PM</li>
            <li><span className="text-white font-medium">Saturdays:</span> 06:00 AM - 09:00 PM</li>
            <li><span className="text-white font-medium">Sundays:</span> 08:00 AM - 04:00 PM</li>
            <li className="text-gymNeon text-xs mt-1 animate-pulse-neon py-1 px-2 bg-gymGray-800 rounded inline-block">VIP Access: 24/7 Enabled</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col space-y-3">
          <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider">Contact Info</h4>
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <MapPin className="h-5 w-5 text-gymNeon shrink-0" />
            <span>123 Fitness Way, Tech City, IN</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <Phone className="h-5 w-5 text-gymNeon shrink-0" />
            <span>+91 99776 65544</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <Mail className="h-5 w-5 text-gymNeon shrink-0" />
            <span>contact@titangym.com</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-px bg-gymGray-800/80 my-8"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Titan Gym Club. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Designed by Antigravity AI Codebase Builder</p>
      </div>
    </footer>
  );
};

export default Footer;
