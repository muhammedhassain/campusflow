export default function Projects() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage your academic projects.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Project Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-slate-800 text-lg">Senior Capstone</h3>
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Active</span>
          </div>
          <p className="text-sm text-slate-500 mb-6 line-clamp-2">Research and development of the final year project focusing on modern web technologies.</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span className="font-medium text-slate-700">65%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
