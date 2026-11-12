import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { LoanApplicationForm } from './LoanApplicationForm';

interface HeroSectionProps {
  onFormSuccess: (details: {
    applicationId: string;
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    loanPurpose: string;
    loanAmount: string;
  }) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFormSuccess,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Title & Trust Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized Dhani Finance Limited Campaign</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quick Loan Application Form
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            Fill in the details below to check your eligibility. Our team will contact you within a few hours.
          </p>

          <div className="mt-3 flex items-center justify-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Paperless
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Upfront Fee
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Processing
            </span>
          </div>
        </div>

        {/* The Application Form Right at Top */}
        <LoanApplicationForm
          onSuccess={onFormSuccess}
          onOpenPrivacy={onOpenPrivacy}
          onOpenTerms={onOpenTerms}
        />
      </div>
    </section>
  );
};
