import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import { INDIAN_STATES_AND_UTS, LOAN_PURPOSES, LoanPurpose } from '../types';
import { submitLeadToFirebase } from '../services/leadService';
import { trackLeadEvent } from '../utils/metaPixel';

interface LoanApplicationFormProps {
  onSuccess: (details: {
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

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSuccess,
  onOpenPrivacy,
  onOpenTerms
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [loanPurpose, setLoanPurpose] = useState<LoanPurpose>('Personal Loan');
  const [loanAmount, setLoanAmount] = useState('₹5,00,000');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (!cleanMobile) {
      newErrors.mobile = '10-digit mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!state) {
      newErrors.state = 'Please select your State / UT.';
    }

    if (!consent) {
      newErrors.consent = 'You must give your consent to process your application.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Bot detection via honeypot
    if (honeypot) {
      console.warn('Bot submission blocked.');
      return;
    }

    if (!validate()) {
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      // Permanent write to Cloud Firestore
      const res = await submitLeadToFirebase({
        fullName,
        mobile,
        email,
        state,
        loanPurpose,
        loanAmount: loanAmount.trim() || '₹5,00,000',
      });

      // Fire Meta Pixel Lead event strictly once without PII
      trackLeadEvent(res.applicationId, loanPurpose);

      // Trigger redirect to Thank You page
      onSuccess({
        applicationId: res.applicationId,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        state,
        loanPurpose,
        loanAmount: loanAmount.trim() || '₹5,00,000',
      });
    } catch (err: any) {
      console.error('Lead submission failure:', err);
      setSubmitError(
        err?.message || 'Unable to submit application at this moment. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="application-form"
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-8 relative overflow-hidden transition-all"
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick 2-Minute Eligibility Form</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Apply For Instant Loan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          No physical paperwork • Instant digital verification • Sanction within hours
        </p>
      </div>

      {submitError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Failed</p>
            <p className="text-rose-700">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Hidden Honeypot for Spam Protection */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* 1. Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name (As per PAN Card) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Rahul Sharma"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.fullName
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* 2. Mobile Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mobile Number (10 Digits) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex rounded-xl shadow-xs">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-xs font-bold select-none">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={handleMobileChange}
              placeholder="9876543210"
              className={`w-full px-3.5 py-2.5 rounded-r-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all tracking-wider ${
                errors.mobile
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white'
              }`}
            />
          </div>
          {errors.mobile ? (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mobile}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Loan status & OTP updates will be sent to this number
            </p>
          )}
        </div>

        {/* 3. Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="rahul.sharma@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100 bg-white'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>
          )}
        </div>

        {/* 4. State Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            State / Union Territory <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              required
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
              }}
              className={`w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                errors.state
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            >
              <option value="">-- Select Your State / UT --</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
          {errors.state && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.state}</p>
          )}
        </div>

        {/* 5. Loan Purpose Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Loan Purpose <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <select
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value as LoanPurpose)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
            >
              {LOAN_PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* 6. Required Loan Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Required Loan Amount <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="e.g. ₹5,00,000"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
            />
          </div>
          {/* Quick Amount Suggestion Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['₹1 Lakh', '₹2.5 Lakh', '₹5 Lakh', '₹10 Lakh', '₹20 Lakh', '₹35 Lakh'].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setLoanAmount(amt)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  loanAmount === amt
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Required Consent Checkbox (unchecked by default) */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
              }}
              className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed select-none">
              I authorize <strong className="text-slate-800">Dhani Finance Limited</strong> and its authorized
              representatives to contact me via Call, SMS, or WhatsApp regarding this loan application.
              I have read and accept the{' '}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Terms & Conditions
              </button>
              .
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.consent}</p>
          )}
        </div>

        {/* Submit Application Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <span>Submit Application</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Security & Trust badges */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Secured
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Upfront Fee
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Quick Callback
          </span>
        </div>
      </form>
    </div>
  );
};
