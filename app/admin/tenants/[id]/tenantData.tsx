export type StayType = 'Single' | 'Sharing' | 'Couple';
export type PaymentStatus = 'Paid' | 'Pending' | 'Rejected' | 'Partial';
export type PaymentType = 'Rent' | 'Security Deposit' | 'Maintenance' | 'Penalty' | 'Refund';
export type PaymentMode = 'Online' | 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
export type DocumentStatus = 'Uploaded' | 'Not Uploaded' | 'Verified' | 'Rejected';
export type TenantStatus = 'Active' | 'Vacated' | 'Notice Period';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  type: PaymentType;
  mode: PaymentMode;
  period: string;
  status: PaymentStatus;
  remarks?: string;
}

export interface Document {
  id: string;
  type: 'ID Proof' | 'Address Proof' | 'Photograph' | 'Agreement' | 'Other';
  name: string;
  status: DocumentStatus;
  uploadedOn?: string;
  number?: string;
  fileUrl?: string;
}

export interface StayRecord {
  id: string;
  stayNumber: number;
  property: string;
  room: string;
  bed: string;
  stayType: StayType;
  checkIn: string;
  checkOut?: string;
  monthlyRent: number;
  securityDeposit: number;
  depositPaid: number;
  refundAmount?: number;
  refundStatus?: 'Pending' | 'Processed' | 'Completed';
  vacateReason?: string;
  lockInPeriod: string;
  noticePeriod: string;
  payments: Payment[];
  documents: Document[];
  partner?: {
    name: string;
    phone: string;
    relation: string;
  };
  status: TenantStatus;
}

export interface Tenant {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  aadhar?: string;
  pan?: string;
  memberSince: string;
  createdAt: string;
  accountStatus: TenantStatus;
  portalAccess: boolean;
  loginConfigured: boolean;
  credentialEmail: string;
  occupation: {
    category: string;
    occupation?: string;
    exactOccupation?: string;
    organization?: string;
    workMode?: string;
    shiftTiming?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  currentStay: StayRecord;
  stayHistory: StayRecord[];
}

export const mockTenant: Tenant = {
  id: '258',
  salutation: 'Miss',
  firstName: 'Ekta',
  lastName: 'Jain',
  gender: 'Female',
  dateOfBirth: '03/08/2002',
  age: 23,
  email: 'jain.ekta0307@gmail.com',
  phone: '+91 9460691042',
  address: '12, Green Park Colony, Jaipur, Rajasthan',
  aadhar: undefined,
  pan: undefined,
  memberSince: '3 May 2026',
  createdAt: 'May 2026',
  accountStatus: 'Vacated',
  portalAccess: true,
  loginConfigured: true,
  credentialEmail: 'jain.ekta0307@gmail.com',
  occupation: {
    category: 'Other',
    workMode: undefined,
    shiftTiming: undefined,
  },
  emergencyContact: undefined,
  currentStay: {
    id: 'stay-3',
    stayNumber: 3,
    property: 'Roomac Co-Living',
    room: 'Room 310',
    bed: 'Bed 1',
    stayType: 'Single',
    checkIn: '3 May 2026',
    checkOut: '1 Jun 2026',
    monthlyRent: 17000,
    securityDeposit: 10000,
    depositPaid: 10000,
    refundAmount: 10000,
    refundStatus: 'Pending',
    vacateReason: 'Admin forced vacate - Completing Studies',
    lockInPeriod: '1 months',
    noticePeriod: '30 days',
    status: 'Vacated',
    payments: [
      { id: 'p1', date: '4 May 2026', amount: 17000, type: 'Rent', mode: 'Online', period: 'May 2026', status: 'Paid' },
      { id: 'p2', date: '3 May 2026', amount: 8000, type: 'Security Deposit', mode: 'Online', period: 'May 2026', status: 'Paid' },
      { id: 'p3', date: '3 May 2026', amount: 2000, type: 'Security Deposit', mode: 'Online', period: 'May 2026', status: 'Paid' },
    ],
    documents: [
      { id: 'd1', type: 'ID Proof', name: 'Aadhar Card', status: 'Not Uploaded', number: '9723 8854 8870' },
      { id: 'd2', type: 'Address Proof', name: 'Address Proof', status: 'Not Uploaded' },
      { id: 'd3', type: 'Photograph', name: 'Photograph', status: 'Not Uploaded' },
    ],
  },
  stayHistory: [
    {
      id: 'stay-1',
      stayNumber: 1,
      property: 'Roomac Co-Living',
      room: 'Room 201',
      bed: 'Bed 2',
      stayType: 'Sharing',
      checkIn: '10 Jan 2024',
      checkOut: '15 Jun 2024',
      monthlyRent: 8500,
      securityDeposit: 8500,
      depositPaid: 8500,
      refundAmount: 8500,
      refundStatus: 'Completed',
      vacateReason: 'Shifted to another room',
      lockInPeriod: '2 months',
      noticePeriod: '30 days',
      status: 'Vacated',
      payments: [
        { id: 'h1p1', date: '10 Jan 2024', amount: 8500, type: 'Security Deposit', mode: 'Cash', period: 'Jan 2024', status: 'Paid' },
        { id: 'h1p2', date: '10 Jan 2024', amount: 8500, type: 'Rent', mode: 'Cash', period: 'Jan 2024', status: 'Paid' },
        { id: 'h1p3', date: '5 Feb 2024', amount: 8500, type: 'Rent', mode: 'UPI', period: 'Feb 2024', status: 'Paid' },
        { id: 'h1p4', date: '4 Mar 2024', amount: 8500, type: 'Rent', mode: 'UPI', period: 'Mar 2024', status: 'Paid' },
        { id: 'h1p5', date: '3 Apr 2024', amount: 8500, type: 'Rent', mode: 'Online', period: 'Apr 2024', status: 'Paid' },
        { id: 'h1p6', date: '2 May 2024', amount: 8500, type: 'Rent', mode: 'Online', period: 'May 2024', status: 'Paid' },
        { id: 'h1p7', date: '1 Jun 2024', amount: 4250, type: 'Rent', mode: 'Online', period: 'Jun 2024', status: 'Paid', remarks: 'Half month prorated' },
        { id: 'h1p8', date: '20 Jun 2024', amount: 8500, type: 'Refund', mode: 'Bank Transfer', period: 'Jun 2024', status: 'Paid', remarks: 'Security deposit refund' },
      ],
      documents: [
        { id: 'h1d1', type: 'ID Proof', name: 'Aadhar Card', status: 'Uploaded', uploadedOn: '10 Jan 2024', number: '9723 8854 8870' },
        { id: 'h1d2', type: 'Address Proof', name: 'Electricity Bill', status: 'Uploaded', uploadedOn: '10 Jan 2024' },
        { id: 'h1d3', type: 'Photograph', name: 'Photo', status: 'Uploaded', uploadedOn: '10 Jan 2024' },
        { id: 'h1d4', type: 'Agreement', name: 'Rental Agreement', status: 'Uploaded', uploadedOn: '10 Jan 2024' },
      ],
    },
    {
      id: 'stay-2',
      stayNumber: 2,
      property: 'Roomac Co-Living',
      room: 'Room 305',
      bed: 'Bed 1',
      stayType: 'Couple',
      checkIn: '20 Jun 2024',
      checkOut: '28 Apr 2026',
      monthlyRent: 14000,
      securityDeposit: 14000,
      depositPaid: 14000,
      refundAmount: 14000,
      refundStatus: 'Completed',
      vacateReason: 'Personal - Relocating to home city',
      lockInPeriod: '3 months',
      noticePeriod: '30 days',
      status: 'Vacated',
      partner: { name: 'Mr. Rahul Sharma', phone: '+91 9876543210', relation: 'Partner' },
      payments: [
        { id: 'h2p1', date: '20 Jun 2024', amount: 14000, type: 'Security Deposit', mode: 'Online', period: 'Jun 2024', status: 'Paid' },
        { id: 'h2p2', date: '20 Jun 2024', amount: 7000, type: 'Rent', mode: 'Online', period: 'Jun 2024', status: 'Paid', remarks: 'Prorated' },
        { id: 'h2p3', date: '1 Jul 2024', amount: 14000, type: 'Rent', mode: 'Online', period: 'Jul 2024', status: 'Paid' },
        { id: 'h2p4', date: '2 Aug 2024', amount: 14000, type: 'Rent', mode: 'Online', period: 'Aug 2024', status: 'Paid' },
        { id: 'h2p5', date: '1 Sep 2024', amount: 14000, type: 'Rent', mode: 'Online', period: 'Sep 2024', status: 'Paid' },
        { id: 'h2p6', date: '3 Oct 2024', amount: 14000, type: 'Rent', mode: 'UPI', period: 'Oct 2024', status: 'Paid' },
        { id: 'h2p7', date: '2 Nov 2024', amount: 14000, type: 'Rent', mode: 'UPI', period: 'Nov 2024', status: 'Paid' },
        { id: 'h2p8', date: '1 Dec 2024', amount: 14000, type: 'Rent', mode: 'Online', period: 'Dec 2024', status: 'Paid' },
        { id: 'h2p9', date: '2 Jan 2025', amount: 14000, type: 'Rent', mode: 'Online', period: 'Jan 2025', status: 'Paid' },
        { id: 'h2p10', date: '3 Feb 2025', amount: 0, type: 'Rent', mode: 'Online', period: 'Feb 2025', status: 'Rejected', remarks: 'Payment failed' },
        { id: 'h2p11', date: '10 Feb 2025', amount: 14000, type: 'Rent', mode: 'Cash', period: 'Feb 2025', status: 'Paid' },
        { id: 'h2p12', date: '1 Mar 2025', amount: 14000, type: 'Rent', mode: 'Online', period: 'Mar 2025', status: 'Paid' },
        { id: 'h2p13', date: '5 May 2026', amount: 14000, type: 'Refund', mode: 'Bank Transfer', period: 'May 2026', status: 'Paid', remarks: 'Security deposit refund' },
      ],
      documents: [
        { id: 'h2d1', type: 'ID Proof', name: 'Aadhar Card', status: 'Verified', uploadedOn: '20 Jun 2024', number: '9723 8854 8870' },
        { id: 'h2d2', type: 'Address Proof', name: 'Passport', status: 'Verified', uploadedOn: '20 Jun 2024' },
        { id: 'h2d3', type: 'Photograph', name: 'Photo', status: 'Verified', uploadedOn: '20 Jun 2024' },
        { id: 'h2d4', type: 'Agreement', name: 'Couple Agreement', status: 'Uploaded', uploadedOn: '21 Jun 2024' },
      ],
    },
  ],
};