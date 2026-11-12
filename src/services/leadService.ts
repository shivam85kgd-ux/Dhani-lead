import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Lead, LeadStatus, LoanPurpose } from '../types';

/**
 * Format local Indian Standard Time (IST) strings
 */
function getFormattedDateTime() {
  const now = new Date();
  // Format as YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const submissionDate = `${year}-${month}-${day}`;

  // Format as HH:mm:ss
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const submissionTime = `${hours}:${minutes}:${seconds}`;

  return { submissionDate, submissionTime };
}

/**
 * Generate a random alphanumeric document ID compliant with regex '^[a-zA-Z0-9_\-]+$'
 */
function generateLeadId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'DFL';
  const timestampPart = Date.now().toString(36).toUpperCase();
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${timestampPart}_${randomPart}`;
}

export interface SubmitLeadParams {
  fullName: string;
  mobile: string;
  email: string;
  state: string;
  loanPurpose: LoanPurpose;
  loanAmount: string;
}

/**
 * Submits a new loan lead permanently to Firebase Firestore
 */
export async function submitLeadToFirebase(params: SubmitLeadParams): Promise<{ leadId: string; applicationId: string }> {
  // Input sanitation
  const cleanName = params.fullName.trim();
  const cleanMobile = params.mobile.trim().replace(/\D/g, '').slice(-10);
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanState = params.state.trim();
  const cleanPurpose = params.loanPurpose;
  const cleanAmount = params.loanAmount ? params.loanAmount.trim() : '₹5,00,000';

  // Validation
  if (!cleanName || cleanName.length < 2) {
    throw new Error('Please enter a valid full name (minimum 2 characters).');
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(cleanMobile)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!cleanState) {
    throw new Error('Please select your state.');
  }

  const leadId = generateLeadId();
  const { submissionDate, submissionTime } = getFormattedDateTime();

  const docRef = doc(db, 'leads', leadId);

  const newLeadData: Record<string, any> = {
    fullName: cleanName,
    mobile: cleanMobile,
    email: cleanEmail,
    state: cleanState,
    loanPurpose: cleanPurpose,
    loanAmount: cleanAmount,
    submissionDate,
    submissionTime,
    timestamp: serverTimestamp(),
    status: 'New' as const,
  };

  try {
    await setDoc(docRef, newLeadData);
    return {
      leadId,
      applicationId: `DFL-${cleanMobile.slice(-4)}-${Date.now().toString().slice(-4)}`,
    };
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `leads/${leadId}`);
  }
}

/**
 * Real-time listener for leads in Firestore (Admin Dashboard)
 */
export function subscribeToLeads(
  onData: (leads: Lead[]) => void,
  onError: (error: Error) => void
): () => void {
  const collectionPath = 'leads';
  const leadsQuery = query(collection(db, collectionPath), orderBy('timestamp', 'desc'));

  const unsubscribe = onSnapshot(
    leadsQuery,
    (snapshot) => {
      const leads: Lead[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        leads.push({
          id: docSnap.id,
          fullName: data.fullName || '',
          mobile: data.mobile || '',
          email: data.email || '',
          state: data.state || '',
          loanPurpose: data.loanPurpose || 'Personal Loan',
          loanAmount: data.loanAmount || '₹5,00,000',
          submissionDate: data.submissionDate || '',
          submissionTime: data.submissionTime || '',
          timestamp: data.timestamp,
          status: data.status || 'New',
          notes: data.notes || '',
          updatedAt: data.updatedAt,
        });
      });
      onData(leads);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );

  return unsubscribe;
}

/**
 * Updates a lead's status and notes in Firestore
 */
export async function updateLeadStatusInFirebase(
  leadId: string,
  newStatus: LeadStatus,
  notes?: string
): Promise<void> {
  const docPath = `leads/${leadId}`;
  const docRef = doc(db, 'leads', leadId);

  const updatePayload: Record<string, any> = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };

  if (typeof notes === 'string') {
    updatePayload.notes = notes.slice(0, 500);
  }

  try {
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Permanently delete a single lead from Firestore
 */
export async function deleteLeadFromFirebase(leadId: string): Promise<void> {
  const docPath = `leads/${leadId}`;
  const docRef = doc(db, 'leads', leadId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Permanently delete multiple leads matching a date or date range
 */
export async function deleteLeadsByDateRange(
  leadsToDelete: Lead[]
): Promise<{ deletedCount: number }> {
  let count = 0;
  for (const lead of leadsToDelete) {
    try {
      await deleteDoc(doc(db, 'leads', lead.id));
      count++;
    } catch (e) {
      console.warn(`Failed to delete lead ${lead.id}:`, e);
    }
  }
  return { deletedCount: count };
}

/**
 * Exports leads to Microsoft Excel (.xls) file with formatting and date filter details
 */
export function exportLeadsToXLS(leads: Lead[], filenameDateLabel?: string): void {
  if (!leads.length) {
    alert('No leads available to export for selected dates.');
    return;
  }

  const escapeXml = (val: string | undefined | null) => {
    if (!val) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Generate Excel-compatible HTML Spreadsheet format with styling
  const tableRows = leads
    .map(
      (lead, idx) => `
    <tr>
      <td style="text-align:center;">${idx + 1}</td>
      <td style="mso-number-format:'\\@';">${escapeXml(lead.id)}</td>
      <td><strong>${escapeXml(lead.fullName)}</strong></td>
      <td style="mso-number-format:'\\@';">+91 ${escapeXml(lead.mobile)}</td>
      <td>${escapeXml(lead.email)}</td>
      <td>${escapeXml(lead.state)}</td>
      <td>${escapeXml(lead.loanPurpose)}</td>
      <td style="font-weight:bold; color:#047857;">${escapeXml(lead.loanAmount || '₹5,00,000')}</td>
      <td style="text-align:center;">${escapeXml(lead.submissionDate)}</td>
      <td style="text-align:center;">${escapeXml(lead.submissionTime)}</td>
      <td style="font-weight:bold; text-align:center;">${escapeXml(lead.status)}</td>
      <td>${escapeXml(lead.notes || '')}</td>
    </tr>`
    )
    .join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Dhani_Finance_Leads</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
        td { border: 1px solid #E2E8F0; padding: 8px 10px; }
        .title-row { background-color: #0F172A; color: #38BDF8; font-size: 14pt; font-weight: bold; padding: 14px; text-align: center; }
        .sub-row { background-color: #F8FAFC; color: #64748B; font-size: 10pt; padding: 6px; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="12" class="title-row">DHANI FINANCE LIMITED - CUSTOMER LOAN LEADS DATA SHEET</td>
        </tr>
        <tr>
          <td colspan="12" class="sub-row">Export Date: ${new Date().toLocaleString('en-IN')} | Total Records: ${leads.length} ${filenameDateLabel ? `| Filter: ${filenameDateLabel}` : ''}</td>
        </tr>
        <tr></tr>
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Lead ID</th>
            <th>Customer Full Name</th>
            <th>Mobile Number</th>
            <th>Email Address</th>
            <th>State</th>
            <th>Loan Purpose</th>
            <th>Required Loan Amount</th>
            <th>Submission Date</th>
            <th>Submission Time</th>
            <th>Lead Status</th>
            <th>Admin Remarks / Notes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const labelSuffix = filenameDateLabel ? `_${filenameDateLabel.replace(/\s+/g, '_')}` : '';
  link.setAttribute('download', `Dhani_Finance_Customer_Leads_${dateStr}${labelSuffix}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Retain standard CSV export fallback
 */
export function exportLeadsToCSV(leads: Lead[]): void {
  exportLeadsToXLS(leads);
}
