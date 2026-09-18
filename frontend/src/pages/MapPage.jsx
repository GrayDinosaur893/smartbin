import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

// A simple mock map to match the visual of the UI since we don't have the real tiles set up yet.
const MockMap = () => {
  return (
    <div className="w-full h-full min-h-[300px] bg-[#f0ede5] relative rounded-xl overflow-hidden border border-slate-200">
      {/* Fake map lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 50L100 50M50 0L50 100\' stroke=\'%23e5e0d8\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
        backgroundSize: '100px 100px'
      }}></div>
      
      {/* Map Labels */}
      <div className="absolute top-1/4 left-1/4 text-slate-500 font-medium text-sm">Gwalior Fort</div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700 font-bold text-2xl">Gwalior</div>
      <div className="absolute bottom-1/4 left-1/4 text-slate-500 font-medium text-sm">Madhav National Park</div>

      {/* Markers */}
      <div className="absolute top-[30%] left-[40%] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center text-emerald-500"><MapPin size={16} fill="currentColor" /></div>
      </div>
      <div className="absolute top-[45%] left-[25%] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center text-emerald-500"><MapPin size={16} fill="currentColor" /></div>
      </div>
      <div className="absolute top-[20%] right-[30%] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-red-500 shadow-md flex items-center justify-center text-red-500"><MapPin size={16} fill="currentColor" /></div>
      </div>
      <div className="absolute top-[55%] right-[20%] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center text-emerald-500"><MapPin size={16} fill="currentColor" /></div>
      </div>
      <div className="absolute bottom-[20%] left-[35%] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-500"><MapPin size={16} fill="currentColor" /></div>
      </div>
      
    </div>
  );
};

export default function MapPage() {
  const bins = [
    { id: '101', location: 'Lashkar', fill: 30, status: 'normal' },
    { id: '102', location: 'Civil Lines', fill: 78, status: 'warning' },
    { id: '103', location: 'Thatipur', fill: 95, status: 'critical' },
    { id: '104', location: 'Morar', fill: 20, status: 'normal' },
    { id: '105', location: 'DD Nagar', fill: 45, status: 'normal' },
  ];

  return (
    <div className="h-auto lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Map Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search location..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative w-full md:w-48">
            <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-sm cursor-pointer font-medium text-slate-700">
              <option>All Bins</option>
              <option>Overflowing</option>
              <option>Normal</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
        
        <div className="flex-1 rounded-xl shadow-sm min-h-[400px]">
           <MockMap />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[500px] lg:max-h-full">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">Nearby Bins</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-slate-100">
            {bins.map((bin) => (
              <div key={bin.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  bin.status === 'critical' ? 'bg-red-50 text-red-500 border-red-500' :
                  bin.status === 'warning' ? 'bg-amber-50 text-amber-500 border-amber-500' :
                  'bg-emerald-50 text-emerald-500 border-emerald-500'
                }`}>
                  <MapPin size={20} fill="currentColor" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">SmartBin #{bin.id}</h4>
                  <p className="text-sm text-slate-500 truncate">{bin.location}</p>
                  <p className={`text-xs font-bold mt-1 ${
                    bin.status === 'critical' ? 'text-red-500' :
                    bin.status === 'warning' ? 'text-amber-500' :
                    'text-emerald-500'
                  }`}>
                    {bin.fill}% Full
                  </p>
                </div>
                
                <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
