import React from 'react';
import { ShieldCheck, PhoneCall, Mail, MapPin, ExternalLink, Lock } from 'lucide-react';

import { AppSettings } from '../services/settingsService';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onAdminClick: () => void;
  appSettings?: AppSettings;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onAdminClick, appSettings }) => {
  const showHelpline = appSettings ? appSettings.showHelpline : true;
  const helplineNumber = (appSettings && appSettings.helplineNumber) || '1800-200-8888';
  const telHref = `tel:${helplineNumber.replace(/\s+/g, '')}`;
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-base">
                D
              </div>
              <span className="font-extrabold text-white text-lg">dhani</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Finance
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Authorized digital campaign portal facilitating financial solutions, personal credit, enterprise loans, and property financing across India.
            </p>
            <div className="pt-1 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Certified Data Encryption
            </div>
          </div>

          {/* Col 2: Loan Options */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">
              Available Loans
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Personal Loan (Up to ₹25L)</li>
              <li>Business Expansion Loan</li>
              <li>Home & Property Financing</li>
              <li>Instant Emergency Loan</li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">
              Compliance & Safety
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                  <span>Privacy Policy & Data Security</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                  <span>Terms & Conditions of Service</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <span className="text-slate-400">Fair Practices Code</span>
              </li>
              <li>
                <span className="text-slate-400">Customer Grievance Redressal</span>
              </li>
              <li>
                <button
                  onClick={onAdminClick}
                  className="mt-2 inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Authorized Staff Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Grievance */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">
              Customer Support
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>One International Center, Tower 1, Senapati Bapat Marg, Elphinstone Road, Mumbai, Maharashtra 400013</span>
              </div>
              {showHelpline && (
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={telHref} className="text-white font-semibold hover:underline">
                    {helplineNumber}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@dhanifinance.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Anti-Fraud Disclaimer */}
        <div className="mt-10 pt-8 border-t border-slate-900 text-[11px] leading-relaxed text-slate-400 space-y-2">
          <p>
            <strong>Regulatory Disclaimer:</strong> Dhani Finance Limited is an authorized financial services company. Credit approval, sanction limits, annual percentage rate (APR), processing time, and repayment tenures are solely subject to underwriting criteria, credit bureau scores, documentation completeness, and internal policy verification. Dhani Finance Limited does not guarantee 100% loan approval.
          </p>
          <p>
            <strong>Fraud Protection Notice:</strong> We do not ask prospective borrowers to pay any advance sanction charges, insurance fees, or file release money into personal bank accounts or mobile wallets. In case of any suspicious calls or messages demanding money before loan disbursement, please contact our official toll-free helpline immediately.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/50 py-4 px-4 border-t border-slate-900 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Dhani Finance Limited. All Rights Reserved.</p>
          <p className="text-[11px] text-slate-400">
            Authorized Digital Campaign Portal • Strict Confidentiality Ensured
          </p>
        </div>
      </div>
    </footer>
  );
};
