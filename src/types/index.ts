export type LoanPurpose =
  | 'Personal Loan'
  | 'Business Loan'
  | 'Home Loan'
  | 'Property Loan'
  | 'Other Loan';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Rejected';

export interface Lead {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  state: string;
  loanPurpose: LoanPurpose;
  loanAmount?: string;
  submissionDate: string; // YYYY-MM-DD
  submissionTime: string; // HH:mm:ss
  timestamp?: any; // Firestore server timestamp
  status: LeadStatus;
  notes?: string;
  updatedAt?: any;
}

export interface LeadSubmissionPayload {
  fullName: string;
  mobile: string;
  email: string;
  state: string;
  loanPurpose: LoanPurpose;
  loanAmount: string;
  consent: boolean;
  honeypot?: string; // spam protection bot trap
}

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
] as const;

export const LOAN_PURPOSES: LoanPurpose[] = [
  'Personal Loan',
  'Business Loan',
  'Home Loan',
  'Property Loan',
  'Other Loan'
];

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; border: string }> = {
  New: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Contacted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Qualified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};
