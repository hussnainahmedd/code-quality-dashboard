import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitCompare, FileText, Code2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/compare', icon: GitCompare, label: 'Compare' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 fixed h-full flex flex-col backdrop-blur-xl">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-emerald-500/20">
          <img src="/logo.jpg" alt="CodeQD Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold text-slate-100 tracking-tight">CodeQD</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden border border-slate-600">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username || 'User'} className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200 truncate w-24">
                {user?.username || 'User'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
