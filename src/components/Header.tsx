import React from 'react';
import { ShieldCheck, PhoneCall, Lock } from 'lucide-react';
import { AppSettings } from '../services/settingsService';

interface HeaderProps {
  onAdminClick: () => void;
  onApplyClick?: () => void;
  appSettings?: AppSettings;
}

export const Header: React.FC<HeaderProps> = ({ onAdminClick, appSettings }) => {
  const showHelpline = appSettings ? appSettings.showHelpline : true;
  const helplineNumber = (appSettings && appSettings.helplineNumber) || '1800-200-8888';
  const telHref = `tel:${helplineNumber.replace(/\s+/g, '')}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top Compliance Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Authorized Campaign
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-300">Fast Processing & Instant Eligibility Evaluation</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            {showHelpline && (
              <a
                href={telHref}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" /> Helpline: {helplineNumber}
              </a>
            )}
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Secure Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-extrabold text-xl tracking-tight">
            D
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                dhani
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Finance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              Dhani Finance Limited • Loan Services
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Accepting Online Applications</span>
          </div>

          {showHelpline && (
            <a
              href={telHref}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{helplineNumber}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
