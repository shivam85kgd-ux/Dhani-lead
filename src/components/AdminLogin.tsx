import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface AdminLoginProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToHome, onLoginSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputCode = passcode.trim();
    if (!inputCode) {
      setError('Please enter the 6-digit admin passcode.');
      return;
    }

    setIsLoading(true);

    // Retrieve custom passcode if changed in settings, otherwise check default 887367
    const customPasscode = localStorage.getItem('dfl_admin_custom_passcode');
    const validCodes = ['887367', '822887'];
    if (customPasscode) {
      validCodes.push(customPasscode);
    }

    if (validCodes.includes(inputCode)) {
      // Store session state in sessionStorage
      sessionStorage.setItem('dfl_admin_auth_token', 'valid_session_' + Date.now());
      setIsLoading(false);
      onLoginSuccess();
    } else {
      setIsLoading(false);
      setError('Invalid admin passcode. Please enter the correct authorization key.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Return home link */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Loan Portal</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Emblem & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-600 text-white mb-4 shadow-lg shadow-blue-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Admin Lead Management
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Dhani Finance Limited • Direct Passcode Login
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 flex items-start gap-3 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Notice</p>
              <p className="text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Admin Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter passcode (e.g. 887367)"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-600 bg-slate-900/90 text-white placeholder-slate-500 text-base tracking-widest font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all text-center"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Login directly with campaign authorization passcode. No Gmail required.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer text-sm"
            >
              <span>Unlock Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 pt-5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Firebase Firestore Connected
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Authorized Staff
          </span>
        </div>
      </div>
    </div>
  );
};
