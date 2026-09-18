import React from 'react';
import { Edit2, Star, FileText, Gift, Settings, HelpCircle, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <button className="text-[#105a39] font-semibold text-sm hover:underline">
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* User Info */}
        <div className="p-8 flex-1 flex items-center gap-6">
          <div className="w-24 h-24 bg-[#105a39] text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg">
            A
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Aishwarya</h2>
            <p className="text-slate-500 mt-1 mb-2">aishwarya@example.com</p>
            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <span className="text-emerald-500">🌱</span> Clean Cities, Green Future
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-8 flex items-center justify-center gap-12 bg-slate-50/50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-3">
              <Star size={24} fill="currentColor" />
            </div>
            <p className="text-2xl font-bold text-slate-800">120</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Points Earned</p>
          </div>
          
          <div className="w-px h-16 bg-slate-200"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <FileText size={24} />
            </div>
            <p className="text-2xl font-bold text-slate-800">12</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Reports Submitted</p>
          </div>
        </div>

      </div>

      {/* Menu List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="divide-y divide-slate-100">
          
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <FileText size={20} />
              </div>
              <span className="font-semibold text-slate-700">My Reports</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <Gift size={20} />
              </div>
              <span className="font-semibold text-slate-700">Rewards</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <Settings size={20} />
              </div>
              <span className="font-semibold text-slate-700">Settings</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <HelpCircle size={20} />
              </div>
              <span className="font-semibold text-slate-700">Help & Support</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

        </div>
      </div>

    </div>
  );
}
