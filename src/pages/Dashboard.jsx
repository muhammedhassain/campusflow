import { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safely extract display name
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksRes, projectsRes] = await Promise.all([
        supabase.from('tasks').select('id, title, priority, status, due_date').eq('user_id', user.id),
        supabase.from('projects').select('id, title, progress, status, due_date, updated_at').eq('user_id', user.id)
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get today's local date string as YYYY-MM-DD
  const getTodayLocalString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayLocalString();

  // Calculations
  const dashboardData = useMemo(() => {
    // 1. Task Statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && t.due_date && t.due_date < todayStr
    ).length;

    // 2. Today's Tasks
    const todaysTasks = tasks.filter(t => t.due_date === todayStr);

    // 3. Upcoming Deadlines
    const pendingDeadlines = tasks
      .filter(t => t.status !== 'completed' && t.due_date && t.due_date >= todayStr)
      .map(t => ({ id: `t-${t.id}`, type: 'Task', title: t.title, date: t.due_date }));
      
    const activeProjectDeadlines = projects
      .filter(p => p.status !== 'completed' && p.due_date && p.due_date >= todayStr)
      .map(p => ({ id: `p-${p.id}`, type: 'Project', title: p.title, date: p.due_date }));

    const upcomingDeadlines = [...pendingDeadlines, ...activeProjectDeadlines]
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(0, 4);

    // 4. Project Pulse
    const projectPulse = projects
      .filter(p => p.status !== 'completed')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 4);

    return {
      stats: [
        { name: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { name: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { name: 'Pending', value: pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { name: 'Overdue', value: overdueTasks, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
      ],
      todaysTasks,
      upcomingDeadlines,
      projectPulse
    };
  }, [tasks, projects, todayStr]);

  // Format date helper for UI e.g., "Oct 24"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, {displayName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening with your projects today.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardData.stats.map((item) => (
              <div key={item.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-shadow">
                <dt>
                  <div className={`absolute rounded-xl p-3 ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-slate-500">{item.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                  <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                </dd>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Tasks */}
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 flex flex-col min-h-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Today's Tasks</h2>
                  <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all
                  </Link>
                </div>
                
                {dashboardData.todaysTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-200 mb-2" />
                    <p className="text-sm">No tasks due today. Enjoy your day!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.todaysTasks.map((task) => (
                      <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{task.priority} Priority</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Project Pulse */}
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 flex flex-col min-h-[250px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Project Pulse</h2>
                  <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    New Project
                  </Link>
                </div>
                
                {dashboardData.projectPulse.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-indigo-200 mb-2" />
                    <p className="text-sm">No active projects. Start building!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {dashboardData.projectPulse.map((project) => (
                      <div 
                        key={project.id} 
                        onClick={() => navigate('/projects')}
                        className="p-5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-2" title={project.title}>
                            {project.title}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span className="font-medium text-slate-700">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          {project.due_date && (
                            <div className="pt-2 flex items-center text-xs text-slate-500 gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              Due {formatDateDisplay(project.due_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column (1/3 width on large screens) */}
            <div className="space-y-6">
              
              {/* Upcoming Deadlines */}
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 flex flex-col min-h-[300px]">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Deadlines</h2>
                
                {dashboardData.upcomingDeadlines.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 mt-4 mb-8">
                    <Clock className="w-8 h-8 text-amber-200 mb-2" />
                    <p className="text-sm">No upcoming deadlines.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.upcomingDeadlines.map((deadline) => {
                      const displayDate = formatDateDisplay(deadline.date);
                      return (
                        <div key={deadline.id} className="flex gap-4">
                          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 text-slate-600 shrink-0 border border-slate-100">
                            <span className="text-xs font-medium leading-none mb-1">{displayDate.split(' ')[0]}</span>
                            <span className="text-sm font-bold leading-none">{displayDate.split(' ')[1]}</span>
                          </div>
                          <div className="flex flex-col justify-center overflow-hidden">
                            <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{deadline.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-medium text-indigo-600">{deadline.type}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <Link to="/calendar" className="block text-center mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  View Calendar
                </Link>
              </section>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
