export default function Profile() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account settings and preferences.</p>
      </div>
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
            JD
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">John Doe</h2>
            <p className="text-slate-500">Student &bull; Computer Science</p>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">john.doe@university.edu</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Student ID</label>
              <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">827394821</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
