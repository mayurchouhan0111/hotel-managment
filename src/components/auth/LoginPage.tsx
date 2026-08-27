import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STAFF_USERS } from '../../firebase/seed';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BadgePercent,
  Briefcase,
  Crown,
  User,
} from 'lucide-react';
import { StaffUser } from '../../types/hotel';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, availableStaffUsers } = useAuth();
  
  const staffList = availableStaffUsers.length > 0 ? availableStaffUsers : INITIAL_STAFF_USERS;
  const [selectedUser, setSelectedUser] = useState<StaffUser>(staffList[0]);
  const [email, setEmail] = useState<string>(staffList[0]?.email || '');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectStaffUser = (user: StaffUser) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your staff email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Authentication failed against Firebase backend database.');
      }
    } catch (err: any) {
      setError(err.message || 'Firebase database connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectQuickLogin = async (user: StaffUser) => {
    setIsSubmitting(true);
    try {
      await quickLogin(user.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'manager':
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      default:
        return <UserCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
      case 'manager':
        return 'bg-blue-400/10 text-blue-300 border-blue-400/20';
      default:
        return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'General Manager / Admin';
      case 'manager':
        return 'Hotel Duty Manager';
      default:
        return 'Front Desk Receptionist';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black font-sans antialiased relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-lg text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white tracking-tight">
                Grand Horizon Royale
              </h1>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/20">
                PMS v2.4
              </span>
            </div>
            <p className="text-xs text-zinc-400">Guest Billing & Property Management System</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access Control (RBAC) Enabled</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-6xl w-full mx-auto z-10">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Portal Authentication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign in to Staff Portal
          </h2>
          <p className="text-sm text-zinc-400">
            Select one of the 3 configured user roles below or enter your staff email to access your dashboard.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3 Configured Staff User Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Select Configured User Account (3 Roles)
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">1-Click Fast Switch</span>
            </div>

            <div className="space-y-3">
              {staffList.map((user) => {
                const isSelected = selectedUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectStaffUser(user)}
                    className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-zinc-900/90 border-amber-400/50 shadow-xl shadow-amber-950/20 ring-1 ring-amber-400/30'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                            isSelected
                              ? 'bg-zinc-800 text-amber-400 border-amber-400/40'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {getRoleIcon(user.role)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {user.name}
                            </h4>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadge(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectQuickLogin(user);
                        }}
                        className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold border-amber-400 shadow-md'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                        }`}
                      >
                        <span>Login as {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Role Permissions Breakdown Pills */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mr-1">
                        Permissions:
                      </span>
                      {user.role === 'receptionist' && (
                        <>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                            Check-In / Out
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                            Rooms Matrix
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                            Active Stays & Charges
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                            Guest Directory
                          </span>
                        </>
                      )}
                      {user.role === 'manager' && (
                        <>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                            All Reception Privileges
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                            Reports & Revenue Analytics
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                            Folio Discounts & Settlements
                          </span>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Full System Control
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Audit Trail Logs
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            GSTIN & Property Settings
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Reseed Database
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Form Login Card */}
          <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Staff Login Form
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedUser.employeeId}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your credentials or click a pre-filled staff account on the left.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2 animate-shake">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Staff Work Email</span>
                  <span className="text-[11px] text-amber-400/80">Role: {selectedUser.role}</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@grandhorizon.com"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-zinc-500">Demo Password: password123</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-950 text-amber-400 focus:ring-amber-400/20"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-semibold text-xs py-3 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
              <div className="font-medium text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3 User Roles Fed in Database</span>
              </div>
              <p className="text-zinc-500 leading-normal">
                Sarah Jenkins (Receptionist) • Robert Vance (Manager) • Elena Rostova (Admin). Switching roles updates app permissions instantly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 border-t border-zinc-800/60 bg-zinc-900/40 text-center text-xs text-zinc-500 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Grand Horizon Royale PMS. All rights reserved.</p>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>Role Security</span>
          <span>•</span>
          <span>Audit Logging Active</span>
          <span>•</span>
          <span>Firestore Backend</span>
        </div>
      </footer>
    </div>
  );
};
