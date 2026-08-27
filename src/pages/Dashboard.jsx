import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  AlertCircle,
  MoreVertical,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const stats = [
  { name: 'Total Tasks', value: '24', icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { name: 'Completed', value: '12', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { name: 'Pending', value: '8', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  { name: 'Overdue', value: '4', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
];

const upcomingDeadlines = [
  { id: 1, title: 'Calculus Midterm', date: 'Oct 24', time: '10:00 AM', course: 'MATH 201' },
  { id: 2, title: 'Research Essay Draft', date: 'Oct 26', time: '11:59 PM', course: 'ENG 101' },
];

const todaysTasks = [
  { id: 1, title: 'Read Chapter 4 for Biology', priority: 'High', completed: false },
  { id: 2, title: 'Complete Physics Lab Report', priority: 'High', completed: false },
  { id: 3, title: 'Reply to study group email', priority: 'Low', completed: true },
];

const projects = [
  { id: 1, title: 'Senior Capstone', progress: 65, tasks: 12, due: 'Dec 15' },
  { id: 2, title: 'Web Dev Portfolio', progress: 30, tasks: 8, due: 'Nov 1' },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // Extract first name or use email or default to 'User'
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, {displayName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
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
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Today's Tasks</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</button>
            </div>
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <button className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'}`}>
                      {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.priority} Priority</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Project Pulse */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Project Pulse</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">New Project</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="p-5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      {project.tasks} tasks
                    </span>
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
                    <div className="pt-2 flex items-center text-xs text-slate-500 gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Due {project.due}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 text-slate-600 shrink-0 border border-slate-100">
                    <span className="text-xs font-medium leading-none mb-1">{deadline.date.split(' ')[0]}</span>
                    <span className="text-sm font-bold leading-none">{deadline.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-semibold text-slate-800">{deadline.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-indigo-600">{deadline.course}</span>
                      <span>&bull;</span>
                      <span>{deadline.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              View Calendar
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
