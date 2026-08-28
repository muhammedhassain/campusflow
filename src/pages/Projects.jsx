import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProjectModal from '../components/ProjectModal';
import { 
  FolderGit2, 
  MoreVertical, 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Trash2,
  Edit2
} from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dropdown menu
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      setError(null);
      
      // Normalize dates
      const payload = {
        ...projectData,
        start_date: projectData.start_date === '' ? null : projectData.start_date,
        due_date: projectData.due_date === '' ? null : projectData.due_date
      };

      if (editingProject) {
        // Update
        const { error: updateError } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProject.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...payload } : p));
      } else {
        // Create
        const { data, error: insertError } = await supabase
          .from('projects')
          .insert([{ ...payload, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        
        setProjects(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete project. Please try again.');
    }
    setActiveDropdown(null);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  // Filter logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-indigo-700 bg-indigo-50 ring-indigo-700/10';
      case 'on_hold': return 'text-amber-700 bg-amber-50 ring-amber-700/10';
      case 'completed': return 'text-emerald-700 bg-emerald-50 ring-emerald-700/10';
      default: return 'text-slate-700 bg-slate-50 ring-slate-700/10';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'on_hold': return 'On Hold';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage your academic projects.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          New Project
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
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="relative sm:w-48 w-full">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-800 text-lg pr-8 line-clamp-1" title={project.title}>
                  {project.title}
                </h3>
                <div className="absolute top-5 right-4">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === project.id ? null : project.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeDropdown === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg ring-1 ring-slate-900/5 z-10 py-1">
                      <button
                        onClick={() => openEditModal(project)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(project.status)}`}>
                  {getStatusDisplay(project.status)}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[2.5rem]">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span className="font-medium text-slate-700">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-y-2 justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-4 mt-auto">
                {project.start_date && (
                  <div className="flex items-center gap-1" title="Start Date">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {project.due_date && (
                  <div className={`flex items-center gap-1 ${project.status !== 'completed' && new Date(project.due_date) < new Date() ? 'text-red-500 font-medium' : ''}`} title="Due Date">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{new Date(project.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {searchQuery || statusFilter !== 'all' 
              ? 'No matching projects found' 
              : 'No projects yet'}
          </h3>
          <p className="text-slate-500 max-w-sm mt-2">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'Get started by creating a new project to manage your coursework or personal endeavors.'}
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <button 
              onClick={openCreateModal}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
}
