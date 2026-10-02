import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, Camera, BarChart2, Map, Bell, Users, Settings, LogOut, Search } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bins', path: '/dashboard/bin/102', icon: Trash2 },
    { name: 'Report', path: '/dashboard/report', icon: Camera },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Map', path: '/dashboard/map', icon: Map },
    { name: 'AI', path: '/dashboard/ai', icon: Camera },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-64 bg-[#0d402b] text-white flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="text-emerald-400">
          <Trash2 size={28} />
        </div>
        <h1 className="text-xl font-bold tracking-wide">SmartBin</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Map', path: '/dashboard/map', icon: Map },
    { name: 'Report', path: '/dashboard/report', icon: Camera, main: true },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Profile', path: '/dashboard/profile', icon: Users },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 flex justify-around items-end px-1"
      style={{ height: '64px', boxShadow: '0 -2px 16px rgba(0,0,0,0.08)' }}
    >
      {navItems.map((item) => {
        const isActive =
          currentPath === item.path ||
          (item.path === '/dashboard' && currentPath === '/dashboard/');
        const Icon = item.icon;

        if (item.main) {
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center"
              style={{ marginBottom: '12px' }}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white active:scale-95 transition-transform ${
                  isActive ? 'bg-[#0b452a]' : 'bg-[#105a39]'
                }`}
                style={{ boxShadow: '0 4px 12px rgba(16,90,57,0.35)' }}
              >
                <Icon size={22} className="text-white" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-end flex-1 gap-0.5 ${
              isActive ? 'text-[#105a39]' : 'text-slate-400'
            }`}
            style={{ paddingBottom: '8px' }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold leading-tight">{item.name}</span>
          </Link>
        );
      })}
    </div>
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
