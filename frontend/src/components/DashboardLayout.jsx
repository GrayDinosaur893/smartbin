import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, Camera, BarChart2, Map, Bell, Users, Settings, LogOut, Search } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bins', path: '/dashboard/bin/102', icon: Trash2 },
    { name: 'Report Waste', path: '/dashboard/report', icon: Camera },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Map', path: '/dashboard/map', icon: Map },
    { name: 'AI Classification', path: '/dashboard/ai', icon: Camera },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { name: 'Users', path: '/dashboard/profile', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#0d402b] text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="text-emerald-400">
          <Trash2 size={28} />
        </div>
        <h1 className="text-xl font-bold tracking-wide">SmartBin</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-emerald-600/30 text-emerald-400 border-l-4 border-emerald-400' 
                  : 'text-slate-300 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-emerald-800/50">
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors">
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </div>
  );
};

const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search bins, locations..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-semibold text-slate-700 leading-tight">Aishwarya</p>
            <p className="text-slate-500 text-xs">Citizen</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
