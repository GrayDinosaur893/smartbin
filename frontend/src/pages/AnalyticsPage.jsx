import React from 'react';
import { ChevronDown, ArrowUp, ArrowDown, AlertCircle, Trash2, Recycle } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 mt-1">View waste collection data and trends.</p>
        </div>
        
        <div className="relative">
          <select className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-sm cursor-pointer font-medium text-slate-700">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Waste Collected Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Waste Collected</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-slate-800">1240 kg</span>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-1">
                <ArrowUp size={14} /> 12%
              </span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-4 h-48 pb-6 px-2 relative border-b border-slate-100">
            {/* Fake Bar Chart */}
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[30%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Mon</div>
            </div>
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[45%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Tue</div>
            </div>
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[60%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Wed</div>
            </div>
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[40%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Thu</div>
            </div>
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[75%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Fri</div>
            </div>
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[50%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Sat</div>
            </div>
            <div className="w-1/7 bg-emerald-500 rounded-t-sm h-[20%] hover:opacity-80 transition-opacity w-full relative group">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">Sun</div>
            </div>
          </div>
        </div>

        {/* Waste Composition */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Waste Composition</h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-48">
            
            {/* Fake Donut Chart */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Organic 40% - Green */}
                <circle stroke="#10b981" strokeWidth="6" strokeDasharray="40, 100" strokeDashoffset="0" fill="none" cx="18" cy="18" r="15" />
                {/* Plastic 25% - Blue */}
                <circle stroke="#3b82f6" strokeWidth="6" strokeDasharray="25, 100" strokeDashoffset="-40" fill="none" cx="18" cy="18" r="15" />
                {/* Paper 15% - Yellow */}
                <circle stroke="#eab308" strokeWidth="6" strokeDasharray="15, 100" strokeDashoffset="-65" fill="none" cx="18" cy="18" r="15" />
                {/* Glass 10% - Purple */}
                <circle stroke="#8b5cf6" strokeWidth="6" strokeDasharray="10, 100" strokeDashoffset="-80" fill="none" cx="18" cy="18" r="15" />
                {/* Metal 10% - Gray */}
                <circle stroke="#64748b" strokeWidth="6" strokeDasharray="10, 100" strokeDashoffset="-90" fill="none" cx="18" cy="18" r="15" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 font-medium">Total</span>
                <span className="text-sm font-bold text-slate-800">1240 kg</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Organic
                </div>
                <span className="font-bold">40%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span> Plastic
                </div>
                <span className="font-bold">25%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Paper
                </div>
                <span className="font-bold">15%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span> Glass
                </div>
                <span className="font-bold">10%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-slate-500"></span> Metal
                </div>
                <span className="font-bold">10%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Overflow Incidents</p>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-slate-800">5</span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 mb-1">
                <ArrowDown size={14} /> 20%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Bins Collected</p>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-slate-800">32</span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 mb-1">
                <ArrowUp size={14} /> 14%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Trash2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Recycling Rate</p>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-slate-800">68%</span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 mb-1">
                <ArrowUp size={14} /> 10%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Recycle size={24} />
          </div>
        </div>

      </div>

    </div>
  );
}
