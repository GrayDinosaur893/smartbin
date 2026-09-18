import React from 'react';
import { ArrowLeft, MapPin, Thermometer, Battery, Weight, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BinDetailsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/dashboard/map" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          
          {/* Bin Image Placeholder */}
          <div className="w-full md:w-64 h-64 bg-slate-100 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center relative overflow-hidden">
            <div className="w-32 h-44 bg-emerald-500 rounded-t-lg border-b-8 border-emerald-700 relative flex flex-col items-center justify-center shadow-lg">
               <div className="absolute top-0 w-full h-8 bg-slate-800 rounded-t-lg flex items-center justify-center border-b-2 border-slate-600">
                  {/* Solar Panel grid mock */}
                  <div className="w-11/12 h-6 border border-blue-400/30 flex flex-wrap">
                     <div className="w-1/4 h-1/2 border border-blue-400/30 bg-blue-500/20"></div>
                     <div className="w-1/4 h-1/2 border border-blue-400/30 bg-blue-500/20"></div>
                     <div className="w-1/4 h-1/2 border border-blue-400/30 bg-blue-500/20"></div>
                     <div className="w-1/4 h-1/2 border border-blue-400/30 bg-blue-500/20"></div>
                  </div>
               </div>
               <div className="mt-8 text-white">♻️</div>
            </div>
          </div>

          {/* Details & Metrics */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">SmartBin #102</h1>
              <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-1 mb-8 text-sm">
              <MapPin size={16} />
              Civil Lines, Gwalior
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Fill Level */}
              <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Fill Level</p>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-500"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="78, 100"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold text-slate-800">78%</span>
                </div>
                <p className="text-amber-600 font-bold text-sm mt-4 flex items-center gap-1">
                  <AlertTriangle size={16} />
                  Almost Full
                </p>
              </div>

              {/* Other Metrics */}
              <div className="col-span-2 md:col-span-3 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Thermometer size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Temperature</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">28°C</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Weight size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">45 kg</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Battery size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Battery</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">85%</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Last Collection</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">2 hours ago</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="pt-8 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Status</h3>
          
          <div className="relative max-w-3xl mx-auto px-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2"></div>
            {/* Active Line */}
            <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-amber-500 -translate-y-1/2"></div>
            
            <div className="relative flex justify-between">
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow flex items-center justify-center relative z-10"></div>
                <span className="text-sm font-medium text-slate-500">Normal</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow flex items-center justify-center relative z-10"></div>
                <span className="text-sm font-bold text-amber-600">Almost Full</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-200 border-4 border-white shadow flex items-center justify-center relative z-10"></div>
                <span className="text-sm font-medium text-slate-400">Overflow</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
