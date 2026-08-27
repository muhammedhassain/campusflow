export default function Achievements() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
        <p className="mt-1 text-sm text-slate-500">Track your milestones and progress.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900">Early Bird</h3>
          <p className="text-sm text-slate-500 mt-1">Completed 5 tasks before 9 AM</p>
        </div>
      </div>
    </div>
  );
}
