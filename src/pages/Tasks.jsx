export default function Tasks() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Manage and organize your tasks.</p>
      </div>
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No tasks yet</h3>
        <p className="text-slate-500 max-w-sm mt-2">Get started by creating a new task to keep track of your assignments.</p>
        <button className="mt-6 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Create Task
        </button>
      </div>
    </div>
  );
}
