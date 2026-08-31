import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Calendar, 
  Trophy, 
  User as UserIcon, 
  LogOut,
  Menu,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

  // Notifications State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch and process notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        supabase.from('tasks').select('id, title, status, due_date').eq('user_id', user.id),
        supabase.from('projects').select('id, title, status, due_date').eq('user_id', user.id)
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;

      const tasks = tasksRes.data || [];
      const projects = projectsRes.data || [];

      // Helper to get today's local date string as YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      // Helper for 'few days' (e.g. 3 days from now)
      const fewDaysDate = new Date(today);
      fewDaysDate.setDate(fewDaysDate.getDate() + 3);
      const f_yyyy = fewDaysDate.getFullYear();
      const f_mm = String(fewDaysDate.getMonth() + 1).padStart(2, '0');
      const f_dd = String(fewDaysDate.getDate()).padStart(2, '0');
      const fewDaysStr = `${f_yyyy}-${f_mm}-${f_dd}`;

      const generatedNotifications = [];

      // Overdue incomplete tasks
      tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < todayStr).forEach(t => {
        generatedNotifications.push({
          id: `task-overdue-${t.id}`,
          type: 'Overdue task',
          title: t.title,
          link: '/tasks',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          icon: Bell
        });
      });

      // Tasks due today
      tasks.filter(t => t.status !== 'completed' && t.due_date === todayStr).forEach(t => {
        generatedNotifications.push({
          id: `task-today-${t.id}`,
          type: 'Task due today',
          title: t.title,
          link: '/tasks',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          icon: CheckSquare
        });
      });

      // Projects due today
      projects.filter(p => p.status !== 'completed' && p.due_date === todayStr).forEach(p => {
        generatedNotifications.push({
          id: `proj-today-${p.id}`,
          type: 'Project due today',
          title: p.title,
          link: '/projects',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          icon: FolderKanban
        });
      });

      // Projects due within the next few days (strictly > todayStr and <= fewDaysStr)
      projects.filter(p => p.status !== 'completed' && p.due_date && p.due_date > todayStr && p.due_date <= fewDaysStr).forEach(p => {
        generatedNotifications.push({
          id: `proj-upcoming-${p.id}`,
          type: 'Upcoming project',
          title: p.title,
          link: '/projects',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          icon: FolderKanban
        });
      });

      setNotifications(generatedNotifications);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const hasNotifications = notifications.length > 0;

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

          <div className="flex flex-1 justify-end items-center gap-2 sm:gap-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="text-slate-400 hover:text-slate-500 relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <button 
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {!hasNotifications ? (
                      <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map(note => {
                          const Icon = note.icon;
                          return (
                            <Link 
                              key={note.id} 
                              to={note.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${note.bg} ${note.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 mb-0.5">{note.type}</p>
                                <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{note.title}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <div className="border-l border-slate-200 pl-2 sm:pl-4">
              <Link 
                to="/profile" 
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold group-hover:bg-indigo-200 transition-colors">
                  {initial}
                </div>
                <div className="hidden md:block text-sm text-left">
                  <p className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{displayName}</p>
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">Student</p>
                </div>
              </Link>
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
