import { Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { CheckIcon, ClockIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function VerificationPending() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel */}
      <div className="w-full lg:w-[45%] min-h-screen lg:h-screen flex flex-col justify-between relative z-20 bg-white border-r border-slate-100">
        {/* Logo */}
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              StudentOS
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm mx-auto text-center">
            {/* Animated icon */}
            <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center shadow-lg shadow-orange-100">
              <ClockIcon className="w-9 h-9 text-orange-500 animate-pulse" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
              Verification Pending
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Thank you for registering your organization! Our team is reviewing your account.
              You'll receive an email notification once your account has been verified and approved.
            </p>

            {/* Status steps */}
            <div className="text-left space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckIcon className="w-[18px] h-[18px] text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Account created</p>
                  <p className="text-xs text-slate-500">Your organization profile is set up</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 animate-pulse">
                  <ClockIcon className="w-[18px] h-[18px] text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Under review</p>
                  <p className="text-xs text-slate-500">Our admin team is verifying your details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <LockClosedIcon className="w-[18px] h-[18px] text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Full access</p>
                  <p className="text-xs text-slate-400">
                    Post jobs, recruit talent, and manage applications
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm text-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Back to Home
              </Link>
              <button
                onClick={() => logout()}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center">
          <p className="text-xs text-slate-400">
            Need help?{' '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contact support
            </Link>{' '}
            • © 2026 StudentOS
          </p>
        </div>
      </div>

      {/* Right Panel – Gradient */}
      <div className="hidden lg:flex lg:w-[55%] h-screen relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent" />

        {/* Centered illustration */}
        <div className="relative z-10 text-center px-12">
          <div className="mx-auto mb-8 w-32 h-32 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-12 h-12 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Almost There!</h2>
          <p className="text-slate-600 text-sm max-w-xs mx-auto leading-relaxed">
            We verify all organization accounts to ensure a safe and trusted platform for students
            and educators.
          </p>
        </div>
      </div>
    </div>
  );
}
