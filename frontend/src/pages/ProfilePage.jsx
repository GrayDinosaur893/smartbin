import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FileText, Gift, Settings, HelpCircle, ChevronRight, LogOut, Shield, Award } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'Aishwarya',
    email: 'citizen@smartbin.gov.in',
    role: 'citizen',
    city_zone: 'Bilaspur',
    eco_points: 250,
    cash_wallet_balance: 2.50
  });
  const [reportsCount, setReportsCount] = useState(12);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('smartbin_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);

        // Fetch user dashboard stats if user id is present
        if (u.id) {
          fetch(`/api/citizen/dashboard/${u.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setUser(prev => ({
                  ...prev,
                  ...data.user
                }));
              }
              if (data.reports) {
                setReportsCount(data.reports.length);
              }
            })
            .catch(err => console.log('Notice: using cached user stats'));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartbin_user');
    navigate('/login');
  };

  const initial = (user?.name || 'A')[0].toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-red-600 font-semibold text-sm hover:underline cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* User Info */}
        <div className="p-8 flex-1 flex items-center gap-6">
          <div className="w-24 h-24 bg-[#105a39] text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{user.name || 'Citizen User'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                {user.role || 'Citizen'}
              </span>
            </div>
            <p className="text-slate-500 mt-1 mb-2">{user.email || 'citizen@smartbin.gov.in'}</p>
            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <span className="text-emerald-500">🌱</span> {user.city_zone || 'Bilaspur'} • Clean Cities, Green Future
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-8 flex items-center justify-center gap-12 bg-slate-50/50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-3">
              <Star size={24} fill="currentColor" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{user.eco_points ?? 250}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Points Earned</p>
          </div>
          
          <div className="w-px h-16 bg-slate-200"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <FileText size={24} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{reportsCount}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Reports Submitted</p>
          </div>
        </div>

      </div>

      {/* Menu List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="divide-y divide-slate-100">
          
          <button 
            onClick={() => navigate('/dashboard/report')}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <FileText size={20} />
              </div>
              <span className="font-semibold text-slate-700">My Reports</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/dashboard/analytics')}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <Gift size={20} />
              </div>
              <span className="font-semibold text-slate-700">Rewards & Eco-Points</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/dashboard/map')}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="text-slate-400 group-hover:text-[#105a39] transition-colors">
                <Shield size={20} />
              </div>
              <span className="font-semibold text-slate-700">Live Waste Bins & Municipal Zonal Map</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full p-5 flex items-center justify-between hover:bg-red-50 transition-colors group cursor-pointer text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-red-400 group-hover:text-red-600 transition-colors">
                <LogOut size={20} />
              </div>
              <span className="font-semibold text-red-600">Sign Out of SmartBin</span>
            </div>
            <ChevronRight size={18} className="text-red-300 group-hover:text-red-500 transition-colors" />
          </button>

        </div>
      </div>

    </div>
  );
}
