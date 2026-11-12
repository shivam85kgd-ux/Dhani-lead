import React, { useState, useEffect, useMemo } from 'react';
import { signOut, updatePassword } from 'firebase/auth';
import {
  Users,
  Search,
  Filter,
  Download,
  LogOut,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileText,
  MessageSquare,
  X,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  PhoneCall,
  PhoneOff,
  Settings,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';
import { auth } from '../firebase/config';
import { Lead, LeadStatus, LoanPurpose, INDIAN_STATES_AND_UTS, LOAN_PURPOSES, STATUS_COLORS } from '../types';
import {
  subscribeToLeads,
  updateLeadStatusInFirebase,
  exportLeadsToXLS,
  deleteLeadFromFirebase,
  deleteLeadsByDateRange,
} from '../services/leadService';
import {
  subscribeToSettings,
  saveSettingsToFirebase,
  DEFAULT_SETTINGS
} from '../services/settingsService';

interface AdminDashboardProps {
  onReturnHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnHome }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Date Filtering State (Date by Date)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Single Lead Delete Modal State
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  // Date-wise Bulk Delete Modal State
  const [showDateDeleteModal, setShowDateDeleteModal] = useState(false);
  const [deleteStartDate, setDeleteStartDate] = useState('');
  const [deleteEndDate, setDeleteEndDate] = useState('');
  const [isDeletingByDate, setIsDeletingByDate] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [dateDeleteError, setDateDeleteError] = useState<string | null>(null);
  const [dateDeleteSuccess, setDateDeleteSuccess] = useState<string | null>(null);

  // Lead update loading tracker
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Notes Modal state
  const [activeNotesLead, setActiveNotesLead] = useState<Lead | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Change Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Helpline Number Settings Modal State
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [helplineNumber, setHelplineNumber] = useState(DEFAULT_SETTINGS.helplineNumber);
  const [showHelpline, setShowHelpline] = useState(DEFAULT_SETTINGS.showHelpline);
  const [isSavingHelpline, setIsSavingHelpline] = useState(false);
  const [helplineSuccess, setHelplineSuccess] = useState<string | null>(null);
  const [helplineError, setHelplineError] = useState<string | null>(null);

  // Quick Date Preset helper
  const setDatePreset = (preset: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = toYMD(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      const yStr = toYMD(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'week') {
      const w = new Date();
      w.setDate(now.getDate() - 7);
      setStartDate(toYMD(w));
      setEndDate(toYMD(now));
    } else if (preset === 'month') {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toYMD(m));
      setEndDate(toYMD(now));
    }
  };

  // Subscribe to real-time helpline settings
  useEffect(() => {
    const unsub = subscribeToSettings((st) => {
      setHelplineNumber(st.helplineNumber);
      setShowHelpline(st.showHelpline);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time leads from Firestore
  useEffect(() => {
    setLoading(true);
    setFirestoreError(null);

    const unsubscribe = subscribeToLeads(
      (data) => {
        setLeads(data);
        setLoading(false);
      },
      (error) => {
        console.error('Real-time leads subscription error:', error);
        setFirestoreError(
          'Unable to load leads from Firestore. Please verify your admin privileges or network connectivity.'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search Query (Name or Mobile)
      const q = searchQuery.toLowerCase().trim();
      const matchName = lead.fullName.toLowerCase().includes(q);
      const matchMobile = lead.mobile.includes(q);
      const matchEmail = lead.email.toLowerCase().includes(q);
      if (q && !matchName && !matchMobile && !matchEmail) return false;

      // 2. Filter State
      if (selectedState && lead.state !== selectedState) return false;

      // 3. Filter Purpose
      if (selectedPurpose && lead.loanPurpose !== selectedPurpose) return false;

      // 4. Filter Status
      if (selectedStatus !== 'All' && lead.status !== selectedStatus) return false;

      // 5. Date Filter (submissionDate is YYYY-MM-DD)
      if (startDate && lead.submissionDate < startDate) return false;
      if (endDate && lead.submissionDate > endDate) return false;

      return true;
    });
  }, [leads, searchQuery, selectedState, selectedPurpose, selectedStatus, startDate, endDate]);

  // Count matching leads for date-wise delete
  const leadsMatchingDeleteRange = useMemo(() => {
    if (!deleteStartDate && !deleteEndDate) return [];
    return leads.filter((lead) => {
      if (deleteStartDate && lead.submissionDate < deleteStartDate) return false;
      if (deleteEndDate && lead.submissionDate > deleteEndDate) return false;
      return true;
    });
  }, [leads, deleteStartDate, deleteEndDate]);

  // Single Lead Delete
  const handleConfirmSingleDelete = async () => {
    if (!leadToDelete) return;
    setIsDeletingSingle(true);
    try {
      await deleteLeadFromFirebase(leadToDelete.id);
      setLeadToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Error deleting lead'}`);
    } finally {
      setIsDeletingSingle(false);
    }
  };

  // Bulk Date-wise Delete
  const handleExecuteDateDelete = async () => {
    if (!deleteStartDate && !deleteEndDate) {
      setDateDeleteError('Please choose a start date or end date.');
      return;
    }
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDateDeleteError('Please type DELETE to confirm permanent deletion.');
      return;
    }
    if (leadsMatchingDeleteRange.length === 0) {
      setDateDeleteError('No leads found matching the selected date range.');
      return;
    }

    setIsDeletingByDate(true);
    setDateDeleteError(null);
    try {
      const res = await deleteLeadsByDateRange(leadsMatchingDeleteRange);
      setDateDeleteSuccess(`Successfully deleted ${res.deletedCount} leads permanently.`);
      setTimeout(() => {
        setShowDateDeleteModal(false);
        setDateDeleteSuccess(null);
        setDeleteConfirmationText('');
        setDeleteStartDate('');
        setDeleteEndDate('');
      }, 1500);
    } catch (err: any) {
      setDateDeleteError(err.message || 'Failed to delete leads.');
    } finally {
      setIsDeletingByDate(false);
    }
  };

  // Lead Count Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New').length;
    const contacted = leads.filter((l) => l.status === 'Contacted').length;
    const qualified = leads.filter((l) => l.status === 'Qualified').length;
    const rejected = leads.filter((l) => l.status === 'Rejected').length;
    return { total, newLeads, contacted, qualified, rejected };
  }, [leads]);

  // Update Status handler
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      setUpdatingId(leadId);
      await updateLeadStatusInFirebase(leadId, newStatus);
    } catch (err: any) {
      alert(`Status update failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Save Notes handler
  const handleSaveNotes = async () => {
    if (!activeNotesLead) return;
    setSavingNotes(true);
    try {
      await updateLeadStatusInFirebase(activeNotesLead.id, activeNotesLead.status, noteContent);
      setActiveNotesLead(null);
    } catch (err: any) {
      alert(`Failed to save notes: ${err.message || 'Error'}`);
    } finally {
      setSavingNotes(false);
    }
  };

  // Change Password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setPasswordError('No active user logged in.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Store customized passcode locally for instant verification
      localStorage.setItem('dfl_admin_custom_passcode', newPassword);

      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (authErr) {
          // Non-blocking for passcode-only mode
        }
      }

      setPasswordSuccess('Passcode successfully updated! You can now use your new passcode to log in.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Passcode update error:', err);
      setPasswordError(err.message || 'Failed to update passcode.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Save Helpline Number & Visibility handler
  const handleSaveHelplineSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHelpline(true);
    setHelplineSuccess(null);
    setHelplineError(null);

    const cleanNumber = helplineNumber.trim();
    if (!cleanNumber) {
      setHelplineError('Please provide a valid helpline phone number.');
      setIsSavingHelpline(false);
      return;
    }

    try {
      await saveSettingsToFirebase({
        helplineNumber: cleanNumber,
        showHelpline,
      });
      setHelplineSuccess('Helpline settings saved! Real-time changes applied to website.');
      setTimeout(() => {
        setShowHelplineModal(false);
        setHelplineSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Save helpline error:', err);
      setHelplineError(err.message || 'Failed to update helpline settings.');
    } finally {
      setIsSavingHelpline(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('dfl_admin_auth_token');
      if (auth.currentUser) {
        await signOut(auth);
      }
      onReturnHome();
    } catch (e) {
      sessionStorage.removeItem('dfl_admin_auth_token');
      onReturnHome();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-extrabold text-white text-lg shadow-sm">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">Dhani Finance</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Lead Central
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Authorized Lead Management Dashboard • Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Firestore indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Firestore Sync</span>
            </div>

            {/* Helpline Settings button */}
            <button
              onClick={() => {
                setShowHelplineModal(true);
                setHelplineSuccess(null);
                setHelplineError(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Helpline & Calling Number Settings"
            >
              {showHelpline ? (
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden sm:inline">Helpline Settings</span>
              {!showHelpline && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Hidden
                </span>
              )}
            </button>

            {/* Change Password button */}
            <button
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Change Password</span>
            </button>

            {/* Public Portal Link */}
            <button
              onClick={onReturnHome}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Loan Portal
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {metrics.total}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct from campaign</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">New Leads</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">
              {metrics.newLeads}
            </div>
            <p className="text-[11px] text-blue-600 mt-1">Awaiting first contact</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Contacted</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">
              {metrics.contacted}
            </div>
            <p className="text-[11px] text-amber-600 mt-1">In communication</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Qualified</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {metrics.qualified}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">Eligible for sanction</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20 col-span-2 sm:col-span-1">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Rejected</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1">
              {metrics.rejected}
            </div>
            <p className="text-[11px] text-rose-600 mt-1">Failed underwriting</p>
          </div>
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by customer name, mobile number, or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons: XLS Download & Date-wise Delete */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Download XLS Sheet Button */}
              <button
                onClick={() => {
                  const dateLabel = startDate || endDate ? `${startDate || 'Start'}_to_${endDate || 'Current'}` : 'All_Time';
                  exportLeadsToXLS(filteredLeads, dateLabel);
                }}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                title="Download Customer Data Sheet as Microsoft Excel .xls file"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download XLS Sheet ({filteredLeads.length})</span>
              </button>

              {/* Permanent Delete by Date Button */}
              <button
                onClick={() => {
                  setDeleteStartDate(startDate);
                  setDeleteEndDate(endDate);
                  setDateDeleteError(null);
                  setDateDeleteSuccess(null);
                  setDeleteConfirmationText('');
                  setShowDateDeleteModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                title="Permanently Delete Leads by Date Range"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Leads Date-wise</span>
              </button>
            </div>
          </div>

          {/* Date-by-Date Filter Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5 shrink-0">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Date Range:</span>
              </span>

              {/* From Date */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[11px] text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[11px] text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDatePreset('all')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    !startDate && !endDate
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('today')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('yesterday')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('week')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('month')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  This Month
                </button>
              </div>
            </div>

            {(startDate || endDate) && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Filtered: {startDate || 'Beginning'} → {endDate || 'Today'} ({filteredLeads.length} leads)
              </span>
            )}
          </div>

          {/* Filter Dropdowns & Status Tabs */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-600 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              {(['All', 'New', 'Contacted', 'Qualified', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-300 hidden sm:block" />

            {/* State Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All States ({INDIAN_STATES_AND_UTS.length})</option>
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Loan Purposes</option>
                {LOAN_PURPOSES.map((purp) => (
                  <option key={purp} value={purp}>
                    {purp}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters button if any active */}
            {(selectedState || selectedPurpose || selectedStatus !== 'All' || searchQuery || startDate || endDate) && (
              <button
                onClick={() => {
                  setSelectedState('');
                  setSelectedPurpose('');
                  setSelectedStatus('All');
                  setSearchQuery('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-auto cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {firestoreError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Database Connectivity Alert</p>
              <p className="text-rose-700 text-xs mt-0.5">{firestoreError}</p>
            </div>
          </div>
        )}

        {/* Leads Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-medium">Synchronizing leads directly with Firebase Firestore...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-16 text-center text-slate-400 px-4">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No loan leads match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {leads.length === 0
                  ? 'No applications have been submitted yet. New leads will automatically show up here in real time.'
                  : 'Try adjusting your search keywords or resetting status and state filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Applicant</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Loan Purpose</th>
                    <th className="py-3.5 px-4">Loan Amount</th>
                    <th className="py-3.5 px-4">Submission Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLeads.map((lead) => {
                    const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.New;
                    const isUpdating = updatingId === lead.id;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {lead.fullName}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {lead.id}
                          </span>
                        </td>

                        {/* 2. Contact */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <span>+91 {lead.mobile}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {lead.email}
                          </div>
                        </td>

                        {/* 3. State */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lead.state}</span>
                          </div>
                        </td>

                        {/* 4. Purpose */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Briefcase className="w-3 h-3 text-indigo-500" />
                            {lead.loanPurpose}
                          </span>
                        </td>

                        {/* 5. Loan Amount */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200">
                            {lead.loanAmount || '₹5,00,000'}
                          </span>
                        </td>

                        {/* 6. Date & Time */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-slate-600 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{lead.submissionDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{lead.submissionTime}</span>
                          </div>
                        </td>

                        {/* 7. Status Selector */}
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block">
                            <select
                              value={lead.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                              className={`appearance-none px-2.5 py-1 pr-6 rounded-lg font-bold text-xs border transition-all cursor-pointer disabled:opacity-50 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-2 pointer-events-none" />
                          </div>
                          {isUpdating && (
                            <Loader2 className="w-3 h-3 animate-spin inline ml-1 text-slate-500" />
                          )}
                        </td>

                        {/* 8. Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Call Button */}
                            <a
                              href={`tel:+91${lead.mobile}`}
                              className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center border border-emerald-200 transition-colors"
                              title="Call Applicant"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp Button */}
                            <a
                              href={`https://wa.me/91${lead.mobile}?text=${encodeURIComponent(
                                `Hello ${lead.fullName}, Greetings from Dhani Finance Limited regarding your ${lead.loanPurpose} application.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-7 h-7 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center border border-green-200 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Notes Button */}
                            <button
                              onClick={() => {
                                setActiveNotesLead(lead);
                                setNoteContent(lead.notes || '');
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                                lead.notes
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                              title={lead.notes ? `Notes: ${lead.notes}` : 'Add Notes'}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Permanent Delete Lead Button */}
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center border border-rose-200 transition-colors cursor-pointer"
                              title={`Permanently Delete Lead (${lead.fullName})`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Notes Modal */}
      {activeNotesLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Admin Notes for {activeNotesLead.fullName}</span>
              </h3>
              <button
                onClick={() => setActiveNotesLead(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Internal Remarks (Follow-up notes, verification status, documentation status):
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="e.g. Spoke with applicant. Requested 3 months bank statement. Salary is ₹45,000/mo."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              <span className="text-[10px] text-slate-400 text-right block mt-1">
                {noteContent.length}/500 characters
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveNotesLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Change Admin Password</span>
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="py-4 space-y-4">
              <p className="text-xs text-slate-500">
                Update your temporary credentials with a secure personal password. This will update your account in Firebase Authentication.
              </p>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (minimum 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Helpline Settings Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Helpline & Calling Number Settings</span>
              </h3>
              <button
                onClick={() => setShowHelplineModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHelplineSettings} className="py-4 space-y-4">
              <p className="text-xs text-slate-500">
                Update the official calling helpline number or completely hide it from customer-facing pages (Header, Thank You page, Footer).
              </p>

              {helplineError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {helplineError}
                </div>
              )}

              {helplineSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {helplineSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Helpline Calling Number
                </label>
                <input
                  type="text"
                  required
                  value={helplineNumber}
                  onChange={(e) => setHelplineNumber(e.target.value)}
                  placeholder="e.g. 1800-200-8888 or 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Clicking call on website connects directly to this number.
                </p>
              </div>

              {/* Show/Hide Helpline Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="toggle-helpline-vis"
                  checked={showHelpline}
                  onChange={(e) => setShowHelpline(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="toggle-helpline-vis" className="cursor-pointer text-xs select-none">
                  <span className="font-bold text-slate-800 block">
                    Show Calling Number on Website
                  </span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    Uncheck to completely hide the calling number and phone buttons from the Header, Thank You page, and Footer.
                  </span>
                </label>
              </div>

              {/* Status indicator badge */}
              <div className="flex items-center justify-between text-xs font-medium px-1">
                <span className="text-slate-500">Live Website Status:</span>
                {showHelpline ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold text-[11px]">
                    <PhoneCall className="w-3 h-3 text-emerald-600" />
                    <span>Visible: {helplineNumber}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-semibold text-[11px]">
                    <PhoneOff className="w-3 h-3 text-rose-600" />
                    <span>Hidden from Visitors</span>
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHelplineModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHelpline}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingHelpline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Helpline Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Lead Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Permanently Delete Lead?</span>
              </h3>
              <button
                onClick={() => setLeadToDelete(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete this lead from Firebase Cloud Firestore? This operation cannot be reversed.
              </p>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{leadToDelete.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Mobile:</span>
                  <span className="font-semibold text-slate-800">+91 {leadToDelete.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Loan Amount:</span>
                  <span className="font-bold text-emerald-700">{leadToDelete.loanAmount || '₹5,00,000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Date Submitted:</span>
                  <span className="text-slate-700">{leadToDelete.submissionDate} ({leadToDelete.submissionTime})</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingSingle}
                onClick={handleConfirmSingleDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingSingle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date-wise Bulk Delete Modal */}
      {showDateDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-rose-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Date-by-Date Permanent Lead Delete</span>
              </h3>
              <button
                onClick={() => setShowDateDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-600">
                Select a specific date or date range to permanently purge all corresponding customer leads directly from Firebase Firestore.
              </p>

              {dateDeleteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {dateDeleteError}
                </div>
              )}

              {dateDeleteSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {dateDeleteSuccess}
                </div>
              )}

              {/* Date pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Delete From Date:
                  </label>
                  <input
                    type="date"
                    value={deleteStartDate}
                    onChange={(e) => setDeleteStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-semibold cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Delete To Date:
                  </label>
                  <input
                    type="date"
                    value={deleteEndDate}
                    onChange={(e) => setDeleteEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-semibold cursor-pointer"
                  />
                </div>
              </div>

              {/* Matching leads summary badge */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-amber-900">
                  Matching Leads to be Purged:
                </span>
                <span className="font-extrabold text-sm text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                  {leadsMatchingDeleteRange.length} Records
                </span>
              </div>

              {/* Type DELETE to confirm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type <span className="text-rose-600 uppercase font-mono font-extrabold">DELETE</span> to confirm permanent purge:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDateDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingByDate || leadsMatchingDeleteRange.length === 0}
                onClick={handleExecuteDateDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingByDate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Purge Leads ({leadsMatchingDeleteRange.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
