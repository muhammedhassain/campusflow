import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const fullName = user?.user_metadata?.full_name || 'User';
  const email = user?.email || '';

  // Generate initials from the user's full name safely
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const initials = getInitials(fullName);

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account settings and preferences.</p>
      </div>
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-slate-500">Student</p>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
                {email}
              </div>
            </div>
            {/* Student ID and Department fields were removed as they do not exist in the database schema */}
          </div>
        </div>
      </div>
    </div>
  );
}
