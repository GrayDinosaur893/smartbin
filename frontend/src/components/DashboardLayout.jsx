import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, Camera, BarChart2, Map, Bell, Users, Settings, LogOut, Search, Gift } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = React.useState('citizen');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('smartbin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role) setUserRole(u.role.toLowerCase());
      }
    } catch (e) {}
  }, []);

  const adminNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Live Map', path: '/dashboard/map', icon: Map },
    { name: 'AI Vision', path: '/dashboard/ai', icon: Camera },
    { name: 'Garbage Bins', path: '/dashboard/bin/102', icon: Trash2 },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  const driverNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Map & Routes', path: '/dashboard/map', icon: Map },
    { name: 'AI Scanner', path: '/dashboard/ai', icon: Camera },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  const citizenNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Map', path: '/dashboard/map', icon: Map },
    { name: 'Report Waste', path: '/dashboard/report', icon: Camera },
    { name: 'Rewards', path: '/dashboard/rewards', icon: Gift },
    { name: 'AI Classifier', path: '/dashboard/ai', icon: Camera },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  const navItems = userRole === 'admin' 
    ? adminNavItems 
    : userRole === 'driver' 
    ? driverNavItems 
    : citizenNavItems;

  return (
    <div className="hidden md:flex w-64 bg-[#0d402b] text-white flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="text-emerald-400">
          <Trash2 size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">SmartBin</h1>
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider bg-emerald-900/60 px-2 py-0.5 rounded-full">
            {userRole} Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/dashboard/');
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
        <button 
          onClick={() => {
            localStorage.removeItem('smartbin_user');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = React.useState('citizen');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('smartbin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role) setUserRole(u.role.toLowerCase());
      }
    } catch (e) {}
  }, []);

  const adminNavItems = [
    { name: 'Admin', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Map', path: '/dashboard/map', icon: Map },
    { name: 'AI Vision', path: '/dashboard/ai', icon: Camera },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  const driverNavItems = [
    { name: 'Tasks', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Route Map', path: '/dashboard/map', icon: Map },
    { name: 'AI Scan', path: '/dashboard/ai', icon: Camera },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  const citizenNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Map', path: '/dashboard/map', icon: Map },
    { name: 'Report', path: '/dashboard/report', icon: Camera },
    { name: 'Rewards', path: '/dashboard/rewards', icon: Gift },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  const navItems = userRole === 'admin' 
    ? adminNavItems 
    : userRole === 'driver' 
    ? driverNavItems 
    : citizenNavItems;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-50 flex items-center justify-around px-2"
      style={{ height: '58px', boxShadow: '0 -1px 12px rgba(0,0,0,0.06)' }}
    >
      {navItems.map((item) => {
        const isActive =
          currentPath === item.path ||
          (item.path === '/dashboard' && currentPath === '/dashboard/');
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all rounded-lg active:scale-95 ${
              isActive
                ? 'text-[#105a39] font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-full transition-colors ${isActive ? 'bg-emerald-100/70 text-[#105a39]' : ''}`}>
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span className={`text-[10px] tracking-tight leading-none mt-0.5 ${isActive ? 'text-[#105a39] font-bold' : 'text-slate-500 font-medium'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

const MobileTopbar = () => {
  const location = useLocation();
  const [initial, setInitial] = React.useState('A');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('smartbin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setInitial(u.name[0].toUpperCase());
      }
    } catch (e) {}
  }, []);

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/dashboard/map': 'Live Map',
    '/dashboard/report': 'Report Waste',
    '/dashboard/rewards': 'Rewards & Vouchers',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/profile': 'Profile',
    '/dashboard/ai': 'AI Classification',
    '/dashboard/bin/102': 'Bin Details',
  };
  const title = pageTitles[location.pathname] || 'SmartBin';

  return (
    <header
      className="md:hidden bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30"
      style={{ height: '56px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#105a39] rounded-lg flex items-center justify-center">
          <Trash2 size={14} className="text-white" />
        </div>
        <span className="font-bold text-slate-800 text-base">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Link to="/dashboard/profile" className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
          {initial}
        </Link>
      </div>
    </header>
  );
};

const DesktopTopbar = () => {
  const [userName, setUserName] = React.useState('Citizen');
  const [userRole, setUserRole] = React.useState('Citizen');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('smartbin_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUserName(u.name || 'Citizen');
        setUserRole(u.role || 'citizen');
      }
    } catch (e) {
      // Fallback to defaults
    }
  }, []);

  return (
    <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#105a39] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {userName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="hidden lg:block text-sm">
            <p className="font-semibold text-slate-700 leading-tight">{userName}</p>
            <p className="text-slate-500 text-xs capitalize">{userRole}</p>
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
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <MobileTopbar />
        <DesktopTopbar />
        {/* paddingBottom on mobile: 64px bottom nav + 16px breathing room */}
        <main
          className="flex-1 p-4 md:p-6 overflow-x-hidden"
          style={{ paddingBottom: 'calc(64px + 16px)' }}
        >
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
