import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/TaskModal';
import { 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Trash2,
  Edit2
} from 'lucide-react';

export default function Tasks() {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // For dropdown menus on individual tasks
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      setError(null);
      
      // Normalize data
      const payload = {
        ...taskData,
        due_date: taskData.due_date === '' ? null : taskData.due_date
      };

      if (editingTask) {
        // Update
        const { error: updateError } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', editingTask.id)
          .eq('user_id', user.id); // Explicit ownership check

        if (updateError) throw updateError;
        
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...payload } : t));
      } else {
        // Create
        const { data, error: insertError } = await supabase
          .from('tasks')
          .insert([{ ...payload, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        
        setTasks(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Explicit ownership check

      if (deleteError) throw deleteError;
      
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete task. Please try again.');
    }
    setActiveDropdown(null);
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      setError(null);
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (updateError) {
        // Revert on error
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
        throw updateError;
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update task status.');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 ring-rose-500/20';
      case 'medium': return 'text-amber-600 bg-amber-50 ring-amber-500/20';
      case 'low': return 'text-emerald-600 bg-emerald-50 ring-emerald-500/20';
      default: return 'text-slate-600 bg-slate-50 ring-slate-500/20';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and organize your tasks.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          New Task
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-slate-200/50 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex gap-4 sm:w-auto w-full">
          <div className="relative flex-1 sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="relative flex-1 sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="bg-white shadow-sm ring-1 ring-slate-200/50 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <li key={task.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleComplete(task)}
                    className={`mt-1 flex-shrink-0 transition-colors ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      
                      <div className="relative flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 ring-1 ring-inset ring-slate-500/10">
                          {getStatusDisplay(task.status)}
                        </span>
                        
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === task.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg ring-1 ring-slate-900/5 z-10 py-1">
                            <button
                              onClick={() => openEditModal(task)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className={`mt-1 text-sm line-clamp-2 ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                      
                      {task.due_date && (
                        <div className="flex items-center text-slate-500 gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'No matching tasks found' 
              : 'No tasks yet'}
          </h3>
          <p className="text-slate-500 max-w-sm mt-2">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'Get started by creating a new task to keep track of your assignments.'}
          </p>
          {(!searchQuery && statusFilter === 'all' && priorityFilter === 'all') && (
            <button 
              onClick={openCreateModal}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Task
            </button>
          )}
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
}
