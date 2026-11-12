import React from 'react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {type === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <FileText className="w-5 h-5 text-blue-600" />
            )}
            <h3 className="font-extrabold text-base text-slate-900">
              {type === 'privacy'
                ? 'Dhani Finance Limited - Privacy Policy'
                : 'Dhani Finance Limited - Terms & Conditions'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="font-semibold text-slate-800">
                Effective Date: January 1, {new Date().getFullYear()}
              </p>
              <p>
                Dhani Finance Limited (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy and personal data. This Privacy Policy details how we collect, process, and secure information provided during loan inquiries on this campaign platform.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">1. Information We Collect</h4>
              <p>
                When you submit an application, we collect your Full Name, 10-digit Indian Mobile Number, Email Address, State of Residence, and Loan Purpose. We also maintain timestamp logs for verification and security audit trails.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">2. Purpose of Data Processing</h4>
              <p>
                Your personal details are used solely to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Evaluate initial loan eligibility and underwriting feasibility.</li>
                <li>Contact you via Phone Call, SMS, or WhatsApp regarding your requested loan product.</li>
                <li>Fulfill regulatory KYC requirements under applicable financial guidelines.</li>
                <li>Prevent fraudulent inquiries and safeguard user identity.</li>
              </ul>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">3. PII &amp; Third-Party Marketing</h4>
              <p>
                We do not sell, rent, or trade your personal information to external third-party advertisers. Third-party analytics tools (such as Meta Pixel) receive strictly aggregated, anonymized identifiers with zero customer names, phone numbers, or email addresses.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">4. Data Storage &amp; Bank-Grade Security</h4>
              <p>
                All lead data is encrypted using 256-bit SSL encryption and stored in secure Google Cloud Firestore infrastructure with hardened attribute-based access controls accessible only to authorized finance personnel.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">5. Grievance Officer</h4>
              <p>
                For questions regarding your data or to request data removal, contact our Grievance Redressal Officer at grievance@dhanifinance.com or call 1800-200-8888.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-800">
                Terms of Loan Lead Inquiries &amp; Disclaimers
              </p>
              <p>
                By submitting your loan inquiry form, you agree to these Terms and Conditions. Please review them carefully before submitting.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">1. Explicit Customer Consent</h4>
              <p>
                By checking the consent box and submitting your mobile number, you explicitly authorize Dhani Finance Limited, its representatives, and lending partners to contact you through Voice Calls, SMS, and WhatsApp messages regarding loan offers, notwithstanding any registration on the National Do Not Call (NDNC) registry.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">2. No Guaranteed Loan Approval Claim</h4>
              <p>
                Submission of an inquiry on this platform does NOT constitute a binding commitment, guarantee, or sanction of credit. Loan approval is subject to document verification, employment stability, repayment capacity, credit bureau (CIBIL/Experian) score assessment, and internal risk underwriting parameters.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">3. Zero Upfront Advance Fees</h4>
              <p>
                Dhani Finance Limited strictly follows a zero advance fee policy. We never request advance processing charges, insurance deposits, or file release charges to be transferred into personal bank accounts or UPI IDs prior to sanction.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">4. Accuracy of Submitted Information</h4>
              <p>
                The applicant certifies that all information provided in this form is true, correct, and up-to-date. Providing forged or misleading details may lead to immediate rejection and blacklisting.
              </p>
              <h4 className="font-bold text-slate-900 pt-2 text-sm">5. Jurisdiction</h4>
              <p>
                Any disputes arising in connection with this service shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra, India.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
