import React, { useState, useEffect } from 'react';
import { Trash2, Wifi, Truck, CheckCircle2, MapPin, Camera, BarChart2, MessageSquare, ArrowRight, Star, FileText, Gift, Sparkles, Shield, Award, Navigation, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardMainPage() {
  const [userName, setUserName] = useState('Citizen');
  const [userRole, setUserRole] = useState('citizen');
  const [userCity, setUserCity] = useState('Bilaspur');
  const [userPoints, setUserPoints] = useState(250);
  const [reportsCount, setReportsCount] = useState(12);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('smartbin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name.split(' ')[0]);
        if (u.role) setUserRole(u.role.toLowerCase());
        if (u.city_zone) setUserCity(u.city_zone);
        if (u.eco_points !== undefined) setUserPoints(u.eco_points);
        if (u.id) {
          fetch(`/api/citizen/dashboard/${u.id}`)
            .then(r => r.json())
            .then(d => {
              if (d.user && d.user.eco_points !== undefined) setUserPoints(d.user.eco_points);
              if (d.reports) setReportsCount(d.reports.length);
            })
            .catch(() => {});
        }
      }
    } catch (e) {}
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {getGreeting()}, {userName}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {userRole === 'admin' 
              ? `${userCity} Municipal Administration & Control Room` 
              : userRole === 'driver'
              ? `${userCity} Waste Collection Fleet Operator`
              : `Together keeping ${userCity} clean and green.`}
          </p>
        </div>
        
        {/* Contribution / Role Badge */}
        {userRole === 'citizen' ? (
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 self-start sm:self-auto min-w-[180px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Eco Contribution</span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <FileText size={14} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800 leading-tight">{reportsCount}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Reports</p>
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                  <Star size={14} fill="currentColor" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800 leading-tight">{userPoints}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Points</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-900 text-white px-4 py-2 rounded-xl border border-emerald-700 shadow-sm flex items-center gap-2 self-start sm:self-auto">
            <Shield size={18} className="text-emerald-300" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 block font-bold">Logged In As</span>
              <span className="text-sm font-black capitalize">{userRole}</span>
            </div>
          </div>
        )}
      </div>

      {/* Citizen Special: Clean City Community Summary Banner ("इतना साफ़ हुआ है") */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-[#0d402b] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={12} /> {userCity} Clean City Impact
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {userRole === 'admin' 
                ? 'Municipal Sanitation Overview' 
                : 'Over 1,240 kg Waste Successfully Cleaned & Recycled! 🌿'}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
              {userRole === 'admin'
                ? 'Real-time telemetry and waste collection efficiency across all wards.'
                : 'Every report you submit directly powers municipal dispatch and cleans neighborhood blackspots.'}
            </p>
          </div>

          {userRole === 'citizen' && (
            <Link
              to="/dashboard/rewards"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Gift size={14} /> Redeem {userPoints} Pts Vouchers
            </Link>
          )}
        </div>

        {/* Clean Impact Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Waste Cleaned</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">1,240 <span className="text-xs font-normal text-emerald-200">kg</span></span>
            <span className="text-[10px] text-emerald-300 font-semibold">+12% this week</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Dump Spots Cleared</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">32 <span className="text-xs font-normal text-emerald-200">sites</span></span>
            <span className="text-[10px] text-emerald-300 font-semibold">92% resolved</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Smart Bins Online</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">48 <span className="text-xs font-normal text-emerald-200">/ 56</span></span>
            <span className="text-[10px] text-emerald-300 font-semibold">86% operational</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Cleanliness Score</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 block">94 <span className="text-xs font-normal text-amber-200">/ 100</span></span>
            <span className="text-[10px] text-amber-300 font-semibold">Grade A Clean City</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nearest Bin Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between">
            <span>Nearest Smart Dustbin</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              450m away
            </span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex gap-5 items-center">
              <div className="w-24 h-32 bg-emerald-100 rounded-lg border border-emerald-200 relative flex items-center justify-center shrink-0">
                <Trash2 size={40} className="text-emerald-600" />
                <div className="absolute top-0 w-full h-4 bg-slate-800 rounded-t-lg opacity-90 border-b border-slate-600"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-slate-800 flex items-center justify-between">
                  SmartBin #102
                </h4>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4 mt-1">
                  <MapPin size={14} /> Civil Lines, {userCity}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-amber-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 78% Full</span>
                    <span className="text-xs text-slate-400">Sensors Active</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
            <span className="text-xs text-slate-500 font-medium">Solar Powered · IoT Online</span>
            <Link to="/dashboard/bin/102" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
              View Bin Status →
            </Link>
          </div>
        </div>

        {/* Quick Actions (Role Customized) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-800">
            Quick Actions
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 flex-1 content-center">
            
            {userRole === 'admin' ? (
              <>
                <Link to="/dashboard/analytics" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart2 size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Analytics Room</span>
                </Link>

                <Link to="/dashboard/map" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">GIS Fleet Map</span>
                </Link>

                <Link to="/dashboard/ai" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">AI Waste Vision</span>
                </Link>

                <Link to="/dashboard/bin/102" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Garbage Stations</span>
                </Link>
              </>
            ) : userRole === 'driver' ? (
              <>
                <Link to="/dashboard/map" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Navigation size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Active Route Map</span>
                </Link>

                <Link to="/dashboard/ai" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">After Cleaning Photo</span>
                </Link>

                <Link to="/dashboard/report" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Report Blackspot</span>
                </Link>

                <Link to="/dashboard/profile" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Driver Shift Status</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard/report" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Report Litter (+100 Pts)</span>
                </Link>
                
                <Link to="/dashboard/map" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Find Nearby Bin</span>
                </Link>

                <Link to="/dashboard/rewards" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gift size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Redeem Vouchers</span>
                </Link>

                <Link to="/dashboard/ai" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  <span className="font-semibold text-sm text-slate-700">AI Classifier</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
