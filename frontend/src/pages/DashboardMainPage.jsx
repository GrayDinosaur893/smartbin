import React from 'react';
import { Trash2, Wifi, Truck, CheckCircle2, MapPin, Camera, BarChart2, MessageSquare, ArrowRight, Star, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardMainPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Good Afternoon, Aishwarya! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 mt-1">Let's keep our city clean together.</p>
        </div>
        
        {/* Contribution Badge */}
        <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 min-w-[200px]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Contribution</span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-tight">12</p>
                <p className="text-[10px] text-slate-500 font-medium">Reports</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center">
                <Star size={16} fill="currentColor" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-tight">120</p>
                <p className="text-[10px] text-slate-500 font-medium">Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Bins</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">56</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <Trash2 size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">
            +12% from last month
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Bins Online</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">48</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Wifi size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            86% operational
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Waste Collected</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">1,240 <span className="text-lg text-slate-500">kg</span></h3>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <Truck size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">
            +8% from last week
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Reports Resolved</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">32</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">
            92% resolved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nearest Bin Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-800">
            Nearest Bin
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex gap-5 items-center">
              <div className="w-24 h-32 bg-emerald-100 rounded-lg border border-emerald-200 relative flex items-center justify-center shrink-0">
                <Trash2 size={40} className="text-emerald-600" />
                {/* Solar panel mockup */}
                <div className="absolute top-0 w-full h-4 bg-slate-800 rounded-t-lg opacity-90 border-b border-slate-600"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-slate-800 flex items-center justify-between">
                  SmartBin #102
                </h4>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4 mt-1">
                  <MapPin size={14} /> Civil Lines, Gwalior
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-amber-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 78% Full</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
            <span className="text-xs text-slate-500 font-medium">Last collection: 2 hours ago</span>
            <Link to="/dashboard/bin/102" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
              View Details
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-800">
            Quick Actions
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 flex-1 content-center">
            <Link to="/dashboard/report" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <span className="font-semibold text-sm text-slate-700">Report Waste</span>
            </Link>
            
            <Link to="/dashboard/map" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <span className="font-semibold text-sm text-slate-700">Find Nearby Bin</span>
            </Link>

            <Link to="/dashboard/analytics" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart2 size={24} />
              </div>
              <span className="font-semibold text-sm text-slate-700">View Analytics</span>
            </Link>

            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all gap-3 group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <span className="font-semibold text-sm text-slate-700">Give Feedback</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
