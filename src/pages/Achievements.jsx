import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  CheckCircle2, 
  CheckSquare, 
  AlertCircle, 
  FolderGit2, 
  Layers, 
  Flag,
  Lock,
  Award
} from 'lucide-react';

const ACHIEVEMENT_CONFIG = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Create your first task',
    icon: CheckCircle2,
    target: 1,
    calculate: (tasks, projects) => tasks.length
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 5 tasks',
    icon: CheckSquare,
    target: 5,
    calculate: (tasks, projects) => tasks.filter(t => t.status === 'completed').length
  },
  {
    id: 'task-champion',
    title: 'Task Champion',
    description: 'Complete 20 tasks',
    icon: Trophy,
    target: 20,
    calculate: (tasks, projects) => tasks.filter(t => t.status === 'completed').length
  },
  {
    id: 'priority-planner',
    title: 'Priority Planner',
    description: 'Complete 5 high-priority tasks',
    icon: AlertCircle,
    target: 5,
    calculate: (tasks, projects) => tasks.filter(t => t.status === 'completed' && t.priority === 'high').length
  },
  {
    id: 'project-starter',
    title: 'Project Starter',
    description: 'Create your first project',
    icon: FolderGit2,
    target: 1,
    calculate: (tasks, projects) => projects.length
  },
  {
    id: 'project-builder',
    title: 'Project Builder',
    description: 'Create 3 projects',
    icon: Layers,
    target: 3,
    calculate: (tasks, projects) => projects.length
  },
  {
    id: 'project-finisher',
    title: 'Project Finisher',
    description: 'Complete a project',
    icon: Flag,
    target: 1,
    calculate: (tasks, projects) => projects.filter(p => p.status === 'completed').length
  }
];

export default function Achievements() {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        supabase.from('tasks').select('id, status, priority, created_at').eq('user_id', user.id),
        supabase.from('projects').select('id, status, created_at').eq('user_id', user.id)
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processedAchievements = useMemo(() => {
    return ACHIEVEMENT_CONFIG.map(config => {
      const currentRaw = config.calculate(tasks, projects);
      const current = Math.min(currentRaw, config.target); // Cap at target
      const progressPercent = Math.min(Math.round((current / config.target) * 100), 100);
      const isUnlocked = current >= config.target;
      
      return {
        ...config,
        current,
        progressPercent,
        isUnlocked
      };
    });
  }, [tasks, projects]);

  const unlockedCount = processedAchievements.filter(a => a.isUnlocked).length;
  const totalCount = processedAchievements.length;
  const overallProgress = Math.round((unlockedCount / totalCount) * 100) || 0;
  
  const unlockedAchievements = processedAchievements.filter(a => a.isUnlocked);
  const lockedAchievements = processedAchievements.filter(a => !a.isUnlocked);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
          <p className="mt-1 text-sm text-slate-500">Track your milestones and productivity progress.</p>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full ring-1 ring-inset ring-indigo-500/20">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">
              {unlockedCount} of {totalCount} Unlocked
            </span>
          </div>
        )}
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
          {/* Overview Progress */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-indigo-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Empty Data Nudge */}
          {tasks.length === 0 && projects.length === 0 && (
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">No data found</h4>
                <p className="text-sm text-amber-700 mt-1">
                  You haven't created any tasks or projects yet. Your achievements will start unlocking as soon as you begin using the app!
                </p>
              </div>
            </div>
          )}

          {/* Unlocked Section */}
          {unlockedAchievements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Unlocked</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedAchievements.map(achievement => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                      
                      <div className="relative flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Completed
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg relative z-10">{achievement.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 mb-4 relative z-10">{achievement.description}</p>
                      
                      <div className="w-full bg-slate-100 rounded-full h-1.5 relative z-10">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked / In Progress Section */}
          {lockedAchievements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">In Progress</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lockedAchievements.map(achievement => {
                  const Icon = achievement.icon;
                  const isStarted = achievement.current > 0;
                  
                  return (
                    <div key={achievement.id} className="rounded-2xl bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-200/50 hover:bg-white transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isStarted ? 'bg-indigo-50 text-indigo-400' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="p-1.5 rounded-full bg-slate-100 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="font-medium text-slate-700">{achievement.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-2">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{achievement.current} / {achievement.target}</span>
                          <span>{achievement.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${achievement.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
