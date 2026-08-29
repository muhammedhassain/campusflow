import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle2,
  FolderGit2,
  X
} from 'lucide-react';

export default function Calendar() {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all'); // 'all', 'tasks', 'projects'
  
  // Event Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksResponse, projectsResponse] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id)
      ]);

      if (tasksResponse.error) throw tasksResponse.error;
      if (projectsResponse.error) throw projectsResponse.error;

      setTasks(tasksResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to parse "YYYY-MM-DD" safely without timezone shifts
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d);
  };

  // Process and filter events
  const events = useMemo(() => {
    const allEvents = [];

    if (filter === 'all' || filter === 'tasks') {
      tasks.forEach(task => {
        if (task.due_date) {
          allEvents.push({
            id: `task-${task.id}`,
            type: 'task',
            title: task.title,
            date: parseDateString(task.due_date),
            originalData: task
          });
        }
      });
    }

    if (filter === 'all' || filter === 'projects') {
      projects.forEach(project => {
        const hasStart = !!project.start_date;
        const hasDue = !!project.due_date;
        
        if (hasStart && hasDue && project.start_date === project.due_date) {
          allEvents.push({
            id: `proj-${project.id}-same`,
            type: 'project',
            label: 'Project',
            title: project.title,
            date: parseDateString(project.due_date),
            originalData: project
          });
        } else {
          if (hasStart) {
            allEvents.push({
              id: `proj-${project.id}-start`,
              type: 'project',
              label: 'Start',
              title: project.title,
              date: parseDateString(project.start_date),
              originalData: project
            });
          }
          if (hasDue) {
            allEvents.push({
              id: `proj-${project.id}-due`,
              type: 'project',
              label: 'Due',
              title: project.title,
              date: parseDateString(project.due_date),
              originalData: project
            });
          }
        }
      });
    }

    return allEvents;
  }, [tasks, projects, filter]);

  // Calendar Grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days = [];
  // Empty slots before 1st of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null, events: [] });
  }
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    const dayEvents = events.filter(e => 
      e.date && 
      e.date.getFullYear() === year && 
      e.date.getMonth() === month && 
      e.date.getDate() === i
    );
    days.push({ day: i, dateObj, events: dayEvents });
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const hasAnyData = tasks.length > 0 || projects.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">Schedule and upcoming events.</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none shadow-sm"
          >
            <option value="all">All Events</option>
            <option value="tasks">Tasks Only</option>
            <option value="projects">Projects Only</option>
          </select>

          <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleToday}
              className="px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-medium border-x border-slate-300 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : !hasAnyData ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No events found</h3>
          <p className="text-slate-500 max-w-sm mt-2">
            You don't have any tasks or projects yet. Create some to see them on your calendar.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800 text-center">
              {monthNames[month]} {year}
            </h2>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
            {days.map((d, i) => (
              <div 
                key={i} 
                className={`border-b border-r border-slate-100 p-2 ${d.day ? 'bg-white' : 'bg-slate-50/50'} ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {d.day && (
                  <div className="h-full flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${
                      d.dateObj.toDateString() === new Date().toDateString() 
                        ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' 
                        : 'text-slate-700 pl-1'
                    }`}>
                      {d.day}
                    </span>
                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[120px] scrollbar-thin">
                      {d.events.map(event => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full text-left text-xs px-2 py-1 rounded truncate transition-colors ${
                            event.type === 'task' 
                              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                              : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                          }`}
                          title={`${event.label ? event.label + ': ' : ''}${event.title}`}
                        >
                          {event.label && <span className="font-semibold mr-1">{event.label}:</span>}
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedEvent.type === 'task' ? 'bg-indigo-100 text-indigo-600' : 'bg-violet-100 text-violet-600'}`}>
                  {selectedEvent.type === 'task' ? <CheckCircle2 className="w-5 h-5" /> : <FolderGit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">{selectedEvent.title}</h2>
                  <p className="text-sm text-slate-500 capitalize">{selectedEvent.type} {selectedEvent.label && `· ${selectedEvent.label}`}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Status</span>
                <span className="text-sm font-medium capitalize text-slate-900">
                  {selectedEvent.originalData.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Date</span>
                <span className="text-sm font-medium text-slate-900">
                  {selectedEvent.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {selectedEvent.type === 'task' && (
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Priority</span>
                  <span className="text-sm font-medium capitalize text-slate-900">{selectedEvent.originalData.priority}</span>
                </div>
              )}

              {selectedEvent.type === 'project' && (
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Progress</span>
                  <span className="text-sm font-medium text-slate-900">{selectedEvent.originalData.progress}%</span>
                </div>
              )}

              {selectedEvent.originalData.description && (
                <div className="pt-2">
                  <span className="text-sm text-slate-500 block mb-1">Description</span>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedEvent.originalData.description}</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
