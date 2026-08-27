import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Calendar, 
  Trophy, 
  User as UserIcon, 
  LogOut,
  Menu,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg">C</span>
            </div>
            CampusFlow
          </div>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="text-slate-500 lg:hidden hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 justify-end items-center gap-4">
            <button className="text-slate-400 hover:text-slate-500 relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {initial}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium text-slate-700">{displayName}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
