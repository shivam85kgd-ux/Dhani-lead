import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  PhoneCall,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { trackPageView } from '../utils/metaPixel';
import { AppSettings } from '../services/settingsService';

interface ThankYouPageProps {
  details: {
    applicationId: string;
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    loanPurpose: string;
    loanAmount?: string;
  } | null;
  onReturnHome: () => void;
  appSettings?: AppSettings;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ details, onReturnHome, appSettings }) => {
  const showHelpline = appSettings ? appSettings.showHelpline : true;
  const helplineNumber = (appSettings && appSettings.helplineNumber) || '1800-200-8888';
  const telHref = `tel:${helplineNumber.replace(/\s+/g, '')}`;

  useEffect(() => {
    // Track PageView on Thank You page
    trackPageView('/thank-you');

    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#6366F1', '#F59E0B'],
      });
    } catch (e) {
      // Confetti fallback if blocked
    }
  }, []);

  const maskedMobile = details?.mobile
    ? `${details.mobile.slice(0, 2)}******${details.mobile.slice(-2)}`
    : 'Registered Number';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600" />

        <div className="p-8 sm:p-12 text-center">
          {/* Success Animated Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-inner ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Application Successfully Stored</span>
          </div>

          {/* Mandatory Titles from User Prompt */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank You for Contacting Dhani Finance Limited.
          </h1>

          <p className="text-base sm:text-lg font-medium text-emerald-700 mt-3">
            Our finance team will contact you within a few hours.
          </p>

          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Your loan lead has been registered securely in our verified system. A dedicated loan relationship officer has been assigned to your request.
          </p>

          {/* Reference Card */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Application Reference No.
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {details?.applicationId || 'DFL-REF-CONFIRMED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Applicant Name</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {details?.fullName || 'Valued Customer'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Mobile Number</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  +91 {maskedMobile}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Loan Purpose</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">
                  {details?.loanPurpose || 'Personal Loan'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Requested Amount</span>
                <p className="font-extrabold text-blue-700 text-sm mt-0.5">
                  {details?.loanAmount || '₹5,00,000'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">State / Region</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {details?.state || 'All India'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onReturnHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Home</span>
            </button>
            {showHelpline && (
              <a
                href={telHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-semibold text-sm py-3 px-6 rounded-xl transition-all"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Call Helpline: {helplineNumber}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
