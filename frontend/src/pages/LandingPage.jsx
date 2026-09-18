import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 text-emerald-800">
          <Trash2 size={24} />
          <span className="text-xl font-bold">SmartBin</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="text-emerald-700 font-semibold border-b-2 border-emerald-700 pb-1">Home</Link>
          <Link to="/features" className="hover:text-emerald-700 transition-colors">Features</Link>
          <Link to="/about" className="hover:text-emerald-700 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-emerald-700 transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/login" className="text-slate-600 hover:text-emerald-700 transition-colors">
            Login
          </Link>
          <Link to="/login" className="bg-[#105a39] hover:bg-[#0b452a] text-white px-5 py-2 rounded-lg transition-colors shadow-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center px-8 py-12 lg:px-24 overflow-hidden relative">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 z-10 flex flex-col items-start gap-6 pt-10">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight">
            Smarter Waste<br/>
            Management<br/>
            for a <span className="text-[#105a39]">Cleaner<br/>Tomorrow</span>
          </h1>
          
          <p className="text-slate-500 max-w-md text-lg leading-relaxed">
            AI-powered smart bins, real-time monitoring, and citizen engagement for cleaner, greener, and smarter cities.
          </p>

          <Link to="/login" className="bg-[#105a39] hover:bg-[#0b452a] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mt-4 shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5">
            Get Started
            <ArrowRight size={18} />
          </Link>

          <div className="flex items-center gap-3 mt-12 text-emerald-800 font-medium">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🍃</span>
            </div>
            <div>
              <p className="leading-tight">Cleaner Cities</p>
              <p className="leading-tight">Happier Communities</p>
            </div>
          </div>
        </div>

        {/* Right Illustration Area */}
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative h-[600px] flex items-end justify-center">
          {/* Background City/Park elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-full blur-3xl opacity-50"></div>
          
          <div className="absolute right-10 top-20 text-center">
             <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white">
                <p className="font-bold text-slate-700 text-sm">Smart People</p>
                <p className="font-bold text-emerald-700 text-sm">Clean Cities</p>
                <p className="font-bold text-slate-700 text-sm">Bright Tomorrows</p>
             </div>
          </div>

          {/* Simple representation of Bins instead of exact illustration */}
          <div className="flex items-end gap-6 relative z-10 pb-12">
            <div className="w-28 h-40 bg-emerald-500 rounded-t-lg shadow-xl shadow-emerald-900/20 flex flex-col items-center justify-center relative border-b-8 border-emerald-700">
               <div className="absolute -top-4 w-full h-4 bg-emerald-600 rounded-t-lg"></div>
               <Trash2 size={40} className="text-white opacity-80" />
            </div>
            <div className="w-32 h-48 bg-blue-500 rounded-t-lg shadow-xl shadow-blue-900/20 flex flex-col items-center justify-center relative border-b-8 border-blue-700 z-10">
               <div className="absolute -top-4 w-full h-4 bg-blue-600 rounded-t-lg"></div>
               <Trash2 size={48} className="text-white opacity-80" />
            </div>
            <div className="w-28 h-40 bg-yellow-400 rounded-t-lg shadow-xl shadow-yellow-900/20 flex flex-col items-center justify-center relative border-b-8 border-yellow-600">
               <div className="absolute -top-4 w-full h-4 bg-yellow-500 rounded-t-lg"></div>
               <Trash2 size={40} className="text-white opacity-80" />
            </div>
          </div>
          
          {/* Ground */}
          <div className="absolute bottom-0 w-[150%] h-32 bg-emerald-500/20 rounded-t-[100%] -z-10"></div>
          <div className="absolute bottom-0 w-[120%] h-24 bg-emerald-600/30 rounded-t-[100%] -z-10"></div>
        </div>
      </main>
    </div>
  );
}
