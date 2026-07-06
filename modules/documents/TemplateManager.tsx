import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Plus, Eye, Pencil, Trash2, Save, X, Code, History, Copy,
  Tag, CheckCircle, XCircle, Filter, Download, RefreshCw,
  FileText, Upload, Image as ImageIcon, Loader2, Search,
  LayoutTemplate, Layers, User, ChevronDown, ChevronUp, Sparkles,
  Check, AlertCircle, Clock, Printer,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

// ── API lib ─────────────────────────────────────────────────────────────────
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  bulkDeleteTemplates,
  bulkUpdateTemplateStatus,
  restoreTemplateVersion,
  type DocumentTemplate,
  type VersionSnapshot,
} from "@/lib/documentTemplateApi";
import { Button } from "react-day-picker";

// ─── Style tokens ───────────────────────────────────────────────────────────
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Professional A4 Size Rental Agreement Template
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2.2cm 2.2cm 2cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Georgia, serif;
      background: white;
      color: #1a1a1a;
      line-height: 1.6;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
    }
    .document {
      max-width: 100%;
      padding: 0.1cm; /* internal padding handled by @page margin */
    }
    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 22px;
    }
    .logo img {
      max-height: 60px;
      max-width: 150px;
      object-fit: contain;
    }
    .company-details {
      text-align: right;
    }
    .company-name {
      font-size: 18px;
      font-weight: 700;
      color: #111;
      letter-spacing: 0.3px;
    }
    .company-address {
      font-size: 12px;
      color: #444;
      line-height: 1.4;
    }
    /* ── TITLE ── */
    .title {
      text-align: center;
      margin: 25px 0 18px;
    }
    .title h1 {
      font-size: 26px;
      font-weight: 800;
      color: #111;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 1px solid #888;
      display: inline-block;
      padding-bottom: 6px;
    }
    .sub-title {
      font-size: 14px;
      color: #333;
      margin-top: 4px;
      font-weight: 500;
    }
    .meta {
      text-align: center;
      font-size: 13px;
      color: #444;
      margin: 10px 0 25px;
      background: #f5f5f5;
      padding: 6px 18px;
      display: inline-block;
      border-radius: 30px;
      width: auto;
    }
    .meta-wrap {
      text-align: center;
    }
    /* ── SECTIONS ── */
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #111;
      text-transform: uppercase;
      border-bottom: 1px solid #bbb;
      padding-bottom: 2px;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .clause {
      margin-bottom: 6px;
      font-size: 14px;
    }
    .clause-number {
      font-weight: 700;
      margin-right: 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 30px;
      margin: 8px 0;
    }
    .field {
      margin-bottom: 4px;
    }
    .field-label {
      font-weight: 600;
      color: #222;
      font-size: 13px;
    }
    .field-value {
      font-weight: 500;
      color: #111;
      font-size: 14px;
    }
    .money {
      font-weight: 700;
      color: #2d5a27; /* dark green for money – keeps it real */
    }
    ul {
      margin: 4px 0 4px 22px;
      list-style: disc;
    }
    ul li {
      font-size: 14px;
      margin-bottom: 2px;
    }
    .signature-block {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 25px;
      border-top: 1px solid #999;
    }
    .signature-box {
      width: 45%;
    }
    .signature-line {
      width: 100%;
      border-bottom: 1px solid #222;
      margin: 30px 0 4px;
    }
    .signature-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #444;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .signature-name {
      font-weight: 700;
      font-size: 14px;
      margin-top: 2px;
      color: #111;
    }
    .signature-date {
      font-size: 12px;
      color: #555;
      margin-top: 4px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px dashed #aaa;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    .footer strong {
      color: #222;
    }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
<div class="document">

  <!-- HEADER -->
  <div class="header">
    <div class="logo">{{logo_url}}</div>
    <div class="company-details">
      <div class="company-name">{{company_name}}</div>
      <div class="company-address">{{company_address}}</div>
    </div>
  </div>

  <!-- TITLE -->
  <div class="title">
    <h1>RENTAL AGREEMENT</h1>
    <div class="sub-title">(Residential Premises)</div>
  </div>
  <div class="meta-wrap">
    <div class="meta">
      Agreement No: <strong>{{document_number}}</strong> &nbsp;|&nbsp; Date: <strong>{{date}}</strong>
    </div>
  </div>

  <!-- 1. PARTIES -->
  <div class="section">
    <div class="section-title">1. Parties</div>
    <p style="font-size:14px; margin-bottom:6px;">
      This Rental Agreement (hereinafter “Agreement”) is made on this <strong>{{date}}</strong> by and between:
    </p>
    <div class="grid-2">
      <div>
        <div class="field">
          <span class="field-label">LESSOR (Provider):</span>
          <span class="field-value">{{company_name}}</span>
        </div>
        <div style="font-size:12px; color:#444;">(Represented by its Authorized Signatory)</div>
      </div>
      <div>
        <div class="field">
          <span class="field-label">LESSEE (Recipient):</span>
          <span class="field-value">{{tenant_name}}</span>
        </div>
        <div style="font-size:12px; color:#444;">S/o, D/o {{emergency_contact_name}}</div>
      </div>
    </div>
    <p style="font-size:13px; color:#333; margin-top:4px;">
      (Hereinafter individually referred to as “Party” and collectively as “Parties”)
    </p>
  </div>

  <!-- 2. RECITALS -->
  <div class="section">
    <div class="section-title">2. Recitals</div>
    <div class="clause">
      <span class="clause-number">WHEREAS</span> the Lessor is the lawful owner of the property known as <strong>{{property_name}}</strong> situated at <strong>{{company_address}}</strong>;
    </div>
    <div class="clause">
      <span class="clause-number">WHEREAS</span> the Lessee desires to take on lease the said premises for residential purposes on the terms and conditions herein contained;
    </div>
    <div class="clause">
      <span class="clause-number">NOW THEREFORE</span> the Parties agree as follows:
    </div>
  </div>

  <!-- 3. PREMISES -->
  <div class="section">
    <div class="section-title">3. Premises</div>
    <p style="font-size:14px;">The Lessor hereby leases to the Lessee the following premises:</p>
    <ul>
      <li><strong>Property Name:</strong> {{property_name}}</li>
      <li><strong>Room No.:</strong> {{room_number}} &nbsp;|&nbsp; <strong>Bed No.:</strong> {{bed_number}}</li>
      <li><strong>Address:</strong> {{company_address}}</li>
    </ul>
  </div>

  <!-- 4. TERM -->
  <div class="section">
    <div class="section-title">4. Term</div>
    <p style="font-size:14px;">
      The lease shall commence on <strong>{{move_in_date}}</strong> and shall continue on a month‑to‑month basis until terminated by either Party with a <strong>30 days’</strong> prior written notice.
    </p>
  </div>

  <!-- 5. RENT & DEPOSIT -->
  <div class="section">
    <div class="section-title">5. Rent &amp; Security Deposit</div>
    <div class="grid-2">
      <div>
        <div class="field">
          <span class="field-label">Monthly Rent:</span>
          <span class="field-value money">₹ {{rent_amount}}/-</span>
        </div>
        <div style="font-size:12px; color:#555;">Payable on or before the 5th day of each month</div>
      </div>
      <div>
        <div class="field">
          <span class="field-label">Security Deposit:</span>
          <span class="field-value money">₹ {{security_deposit}}/-</span>
        </div>
        <div style="font-size:12px; color:#555;">Refundable at the end of tenancy (subject to deductions)</div>
      </div>
    </div>
    <p style="font-size:14px; margin-top:6px;">
      <strong>Payment Mode:</strong> {{payment_mode}}
    </p>
    <p style="font-size:13px; color:#333;">
      <strong>Late Fee:</strong> A late fee of ₹ 100 per day shall be charged for any delay beyond the due date.
    </p>
  </div>

  <!-- 6. UTILITIES & MAINTENANCE -->
  <div class="section">
    <div class="section-title">6. Utilities &amp; Maintenance</div>
    <ul>
      <li>Electricity and water charges shall be borne by the Lessee as per actual consumption.</li>
      <li>Common area maintenance charges shall be shared equally among all occupants.</li>
      <li>The Lessor shall be responsible for major structural repairs (e.g., plumbing, electrical wiring).</li>
      <li>Minor repairs (e.g., bulbs, faucets) shall be attended to by the Lessee.</li>
    </ul>
  </div>

  <!-- 7. RULES & RESTRICTIONS -->
  <div class="section">
    <div class="section-title">7. Rules &amp; Restrictions</div>
    <ul>
      <li>The Lessee shall not sublet, assign, or part with possession of the premises without prior written consent of the Lessor.</li>
      <li>No commercial activity shall be carried out on the premises.</li>
      <li>The Lessee shall maintain the premises and furniture in a clean and hygienic condition.</li>
      <li>Pets are allowed only with prior approval and subject to additional terms.</li>
      <li>Parking shall be as per availability and allocation by the Lessor.</li>
    </ul>
  </div>

  <!-- 8. TERMINATION -->
  <div class="section">
    <div class="section-title">8. Termination</div>
    <p style="font-size:14px;">
      Either Party may terminate this Agreement by providing <strong>30 days’</strong> prior written notice. In case of early termination by the Lessee without valid cause, the security deposit shall be forfeited. The Lessor may terminate the Agreement immediately in case of breach of any material term.
    </p>
  </div>

  <!-- 9. GOVERNING LAW -->
  <div class="section">
    <div class="section-title">9. Governing Law &amp; Jurisdiction</div>
    <p style="font-size:14px;">
      This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.
    </p>
  </div>

  <!-- SIGNATURES -->
  <div class="signature-block">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">LESSEE (Recipient)</div>
      <div class="signature-name">{{tenant_name}}</div>
      <div class="signature-date">Date: __________</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">LESSOR (Provider)</div>
      <div class="signature-name">{{company_name}}</div>
      <div class="signature-date">Date: __________</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>This document is generated electronically and is legally binding. No physical signature required.</p>
    <p>Document No: {{document_number}} &nbsp;|&nbsp; Generated on: {{date}}</p>
    <p style="margin-top:4px;">Powered by {{company_name}}</p>
  </div>

</div>
</body>
</html>`;
// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Agreements", "Rental Agreements", "KYC Documents",
  "Onboarding Documents", "Financial Documents", "Policy Documents",
  "Exit Documents", "Inspection Forms", "Declarations", "Other",
];

const COMMON_VARS = [
  // System
  { name: "date",              label: "Current Date",       example: "15 June 2024",           category: "System" },
  { name: "document_number",   label: "Document Number",    example: "DOC-202403-0001",         category: "System" },
  { name: "document_title",    label: "Document Title",     example: "RENTAL AGREEMENT",        category: "System" },
  { name: "document_type",     label: "Document Type",      example: "Agreement",               category: "System" },
  { name: "issue_date",        label: "Issue Date",         example: "15 June 2024",            category: "System" },
  { name: "valid_until",       label: "Valid Until",        example: "15 June 2025",            category: "System" },

  // Tenant
  { name: "tenant_name",             label: "Tenant Name",            example: "Rahul Sharma",          category: "Tenant" },
  { name: "tenant_phone",            label: "Tenant Phone",           example: "+91 98765 43210",        category: "Tenant" },
  { name: "tenant_email",            label: "Tenant Email",           example: "rahul@email.com",        category: "Tenant" },
  { name: "aadhaar_number",          label: "Aadhaar Number",         example: "XXXX-XXXX-1234",         category: "Tenant" },
  { name: "pan_number",              label: "PAN Number",             example: "ABCDE1234F",             category: "Tenant" },
  { name: "passport_number",         label: "Passport Number",        example: "P1234567",               category: "Tenant" },
  { name: "voter_id",                label: "Voter ID",               example: "ABC1234567",             category: "Tenant" },
  { name: "driving_license",         label: "Driving License",        example: "MH0120210012345",        category: "Tenant" },
  { name: "date_of_birth",           label: "Date of Birth",          example: "01 Jan 1995",            category: "Tenant" },
  { name: "gender",                  label: "Gender",                 example: "Male",                   category: "Tenant" },
  { name: "nationality",             label: "Nationality",            example: "Indian",                 category: "Tenant" },
  { name: "occupation",              label: "Occupation",             example: "Software Engineer",      category: "Tenant" },
  { name: "employer_name",           label: "Employer Name",          example: "Tech Corp Pvt Ltd",      category: "Tenant" },
  { name: "monthly_income",          label: "Monthly Income",         example: "50,000",                 category: "Tenant" },
  { name: "emergency_contact_name",  label: "Emergency Contact",      example: "Priya Sharma",           category: "Tenant" },
  { name: "emergency_phone",         label: "Emergency Phone",        example: "+91 98765 43211",        category: "Tenant" },
  { name: "emergency_relation",      label: "Emergency Relation",     example: "Father",                 category: "Tenant" },
  { name: "permanent_address",       label: "Permanent Address",      example: "123, MG Road, Mumbai",   category: "Tenant" },
  { name: "current_address",         label: "Current Address",        example: "456, Wakad, Pune",       category: "Tenant" },
  { name: "father_name",             label: "Father Name",            example: "Rajesh Sharma",          category: "Tenant" },
  { name: "bank_account_number",     label: "Bank Account Number",    example: "1234567890123",          category: "Tenant" },
  { name: "bank_name",               label: "Bank Name",              example: "HDFC Bank",              category: "Tenant" },
  { name: "ifsc_code",               label: "IFSC Code",              example: "HDFC0001234",            category: "Tenant" },

  // Property
  { name: "property_name",       label: "Property Name",       example: "Roomac Wakad",          category: "Property" },
  { name: "property_address",    label: "Property Address",    example: "Wakad, Pune 411057",    category: "Property" },
  { name: "property_type",       label: "Property Type",       example: "PG / Co-living",        category: "Property" },
  { name: "room_number",         label: "Room Number",         example: "A-204",                 category: "Property" },
  { name: "bed_number",          label: "Bed Number",          example: "2",                     category: "Property" },
  { name: "floor_number",        label: "Floor Number",        example: "2",                     category: "Property" },
  { name: "move_in_date",        label: "Move-in Date",        example: "15 Mar 2024",           category: "Property" },
  { name: "move_out_date",       label: "Move-out Date",       example: "14 Mar 2025",           category: "Property" },
  { name: "notice_date",         label: "Notice Date",         example: "14 Feb 2025",           category: "Property" },
  { name: "rent_amount",         label: "Monthly Rent",        example: "12,500",                category: "Property" },
  { name: "security_deposit",    label: "Security Deposit",    example: "25,000",                category: "Property" },
  { name: "advance_amount",      label: "Advance Amount",      example: "12,500",                category: "Property" },
  { name: "payment_mode",        label: "Payment Mode",        example: "UPI / Bank Transfer",   category: "Property" },
  { name: "payment_due_date",    label: "Payment Due Date",    example: "5th of every month",    category: "Property" },
  { name: "parking_slot",        label: "Parking Slot",        example: "P-12",                  category: "Property" },
  { name: "locker_number",       label: "Locker Number",       example: "L-05",                  category: "Property" },

  // Company
  { name: "company_name",          label: "Company Name",        example: "Roomac Pvt Ltd",         category: "Company" },
  { name: "company_address",       label: "Company Address",     example: "Wakad, Pune 411057",     category: "Company" },
  { name: "company_phone",         label: "Company Phone",       example: "+91 98765 00000",        category: "Company" },
  { name: "company_email",         label: "Company Email",       example: "hello@roomac.in",        category: "Company" },
  { name: "company_gstin",         label: "Company GSTIN",       example: "27AABCR1234A1Z5",        category: "Company" },
  { name: "manager_name",          label: "Manager Name",        example: "Rajesh Kumar",           category: "Company" },
  { name: "manager_phone",         label: "Manager Phone",       example: "+91 98765 11111",        category: "Company" },
  { name: "witness_name",          label: "Witness Name",        example: "Suresh Patel",           category: "Company" },
  { name: "witness_phone",         label: "Witness Phone",       example: "+91 98765 22222",        category: "Company" },
{ name: "authorized_signatory",  label: "Authorized Signatory",example: "CEO / Director",         category: "Company" },

  // Images
  { name: "tenant_photo",      label: "Tenant Photo",      example: "[Tenant Photo]",      category: "Tenant" },
  { name: "tenant_signature",  label: "Tenant Signature",  example: "[Tenant Signature]",  category: "Tenant" },
  { name: "witness_signature", label: "Witness Signature", example: "[Witness Signature]", category: "Company" },
];

const VARIABLE_CATEGORIES = ["All", "System", "Tenant", "Property", "Company"];

// Document titles based on category
const getDocumentTitle = (category: string): string => {
  const titles: Record<string, string> = {
    "Agreements": "AGREEMENT",
    "Rental Agreements": "RENTAL AGREEMENT",
    "KYC Documents": "KYC DOCUMENT",
    "Onboarding Documents": "ONBOARDING FORM",
    "Financial Documents": "FINANCIAL DOCUMENT",
    "Policy Documents": "POLICY DOCUMENT",
    "Exit Documents": "EXIT FORM",
    "Inspection Forms": "INSPECTION FORM",
    "Declarations": "DECLARATION",
    "Other": "DOCUMENT",
  };
  return titles[category] || "DOCUMENT";
};

const getDocumentType = (category: string): string => {
  const types: Record<string, string> = {
    "Agreements": "Agreement",
    "Rental Agreements": "Agreement",
    "KYC Documents": "Form",
    "Onboarding Documents": "Form",
    "Financial Documents": "Statement",
    "Policy Documents": "Policy",
    "Exit Documents": "Form",
    "Inspection Forms": "Form",
    "Declarations": "Declaration",
    "Other": "Document",
  };
  return types[category] || "Document";
};



const SH = ({
  icon, title, color = "text-blue-600",
}: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const VariableCategory = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
      {title}
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export function TemplateManager() {

  // ── Template state ─────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTpl, setEditingTpl] = useState<DocumentTemplate | null>(null);
  const [historyTpl, setHistoryTpl] = useState<DocumentTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const fontSelectRef = useRef<HTMLSelectElement>(null);
  const [selectedFont, setSelectedFont] = useState<string>("");
// Add this with your other useState declarations
const [showVariables, setShowVariables] = useState(false);
  // ── Sidebar / selection ────────────────────────────────────────────────────
  const [isCodeView, setIsCodeView] = useState(false);
const visualIframeRef = useRef<HTMLIFrameElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

const visualEditorRef = useRef<HTMLDivElement>(null);
const lastSyncedHtmlRef = useRef<string>("");
  // ── Pagination state ──
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState<number | "All">(25);
// const [totalItems, setTotalItems] = useState(0);
// const [totalPages, setTotalPages] = useState(1);
  // ── Logo ───────────────────────────────────────────────────────────────────
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const htmlEditorRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ── Variable panel ─────────────────────────────────────────────────────────
  const [varSearch, setVarSearch] = useState("");
  const [varCategory, setVarCategory] = useState("All");

  // ── Filters ────────────────────────────────────────────────────────────────
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Cursor position track karne ke liye ref add karo (component ke andar, state declarations ke paas)
const codeEditorRef = useRef<HTMLTextAreaElement>(null);
const [cursorPos, setCursorPos] = useState<number | null>(null);

  // ── Column search ──────────────────────────────────────────────────────────
  const [col, setCol] = useState({
    name: "", category: "", description: "", version: "", status: "",
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "", category: "Rental Agreements", description: "", html_content: DEFAULT_HTML,
  });
  const [changeNotes, setChangeNotes] = useState("");

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    inactive: templates.filter(t => !t.is_active).length,
    cats: new Set(templates.map(t => t.category)).size,
  }), [templates]);

 useEffect(() => {
  const iframe = visualIframeRef.current;
  if (!iframe || isCodeView) return;
  
  const html = buildPreview(form.html_content, logoPreview);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  
  iframe.src = url;
  
  return () => URL.revokeObjectURL(url);
}, [form.html_content, logoPreview, isCodeView]);

  // Update HTML when category changes to set appropriate title
  useEffect(() => {
    if (showForm && !editingTpl) {
      const title = getDocumentTitle(form.category);
      const type = getDocumentType(form.category);
      
      // Update the HTML content with new title
      let updatedHtml = form.html_content;
      updatedHtml = updatedHtml.replace(
        /<h1 class="document-title">.*?<\/h1>/,
        `<h1 class="document-title">${title}</h1>`
      );
      updatedHtml = updatedHtml.replace(
        /<span>{{document_type}}/,
        `<span>{{document_type}}`
      );
      
      setForm(prev => ({ ...prev, html_content: updatedHtml }));
    }
  }, [form.category, showForm, editingTpl]);

  // ══════════════════════════════════════════════════════════════════════════
  // DATA LOADERS
  // ══════════════════════════════════════════════════════════════════════════
const loadTemplates = useCallback(async () => {
  setLoading(true);
  try {
    const res = await listTemplates({
      category: catFilter !== "all" ? catFilter : undefined,
      is_active: statusFilter !== "all" ? statusFilter : undefined,
      // no page/limit → get all
    });
    setTemplates(res.data || []);
  } catch (err: any) {
    toast.error(err.message || "Failed to load templates");
  } finally {
    setLoading(false);
  }
}, [catFilter, statusFilter]);

useEffect(() => { loadTemplates(); }, [loadTemplates]);

const getFontFamilyFromSelection = (): string => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return "";

  const node = sel.getRangeAt(0).commonAncestorContainer;
  if (!node) return "";

  // Helper to get font from element
  const getFontFromElement = (el: HTMLElement | null): string => {
    if (!el) return "";

    // Check inline style font-family
    const styleFont = el.style.fontFamily;
    if (styleFont) {
      const firstFont = styleFont.split(',')[0].trim().replace(/['"]/g, '');
      const optionValues = ["Inter", "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];
      const matched = optionValues.find(v => v.toLowerCase() === firstFont.toLowerCase());
      if (matched) return matched;
      return firstFont;
    }

    // Check <font face="..."> attribute
    if (el.tagName === 'FONT') {
      const face = el.getAttribute('face');
      if (face) {
        const firstFont = face.split(',')[0].trim().replace(/['"]/g, '');
        const optionValues = ["Inter", "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];
        const matched = optionValues.find(v => v.toLowerCase() === firstFont.toLowerCase());
        if (matched) return matched;
        return firstFont;
      }
    }

    // Recursively check parent
    return getFontFromElement(el.parentElement);
  };

  let el = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node.parentElement;
  return getFontFromElement(el);
};


useEffect(() => {
  if (!showForm || isCodeView) return;

  const handleSelectionChange = () => {
    const font = getFontFamilyFromSelection();
    const optionValues = ["Inter", "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];
    if (font && optionValues.some(v => v.toLowerCase() === font.toLowerCase())) {
      setSelectedFont(font);
    } else {
      setSelectedFont("");
    }
  };

  document.addEventListener("selectionchange", handleSelectionChange);
  return () => document.removeEventListener("selectionchange", handleSelectionChange);
}, [showForm, isCodeView]);
// ~line 213 — ye wala useEffect replace karo
useEffect(() => {
  if (isCodeView) return;

  const setContent = () => {
    if (!visualEditorRef.current) return;
    
    // ── KEY FIX: agar editor abhi focused hai, innerHTML mat overwrite karo ──
    // Ye selection destroy hone se bachata hai jab toolbar buttons click hote hain
    if (document.activeElement === visualEditorRef.current) return;
    
    const preview = buildPreview(form.html_content, logoPreview);
    visualEditorRef.current.innerHTML = preview;
    lastSyncedHtmlRef.current = form.html_content;
  };

  setContent();
  const t = setTimeout(setContent, 50);
  return () => clearTimeout(t);
}, [isCodeView, form.html_content, logoPreview, showForm]);
  // ══════════════════════════════════════════════════════════════════════════
  // DERIVED / FILTERED DATA
  // ══════════════════════════════════════════════════════════════════════════

  const filteredRows = useMemo(() =>
    templates.filter(t => {
      const nOk = !col.name || t.name.toLowerCase().includes(col.name.toLowerCase());
      const cOk = !col.category || t.category.toLowerCase().includes(col.category.toLowerCase());
      const dOk = !col.description || (t.description || "").toLowerCase().includes(col.description.toLowerCase());
      const vOk = !col.version || String(t.version).includes(col.version);
      const sOk = !col.status || (t.is_active ? "active" : "inactive").includes(col.status.toLowerCase());
      return nOk && cOk && dOk && vOk && sOk;
    }),
    [templates, col]);

  const filteredVars = COMMON_VARS.filter(v => {
    const matchesSearch = varSearch === "" ||
      v.label.toLowerCase().includes(varSearch.toLowerCase()) ||
      v.name.toLowerCase().includes(varSearch.toLowerCase());
    const matchesCategory = varCategory === "All" || v.category === varCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = useMemo(() => {
  if (pageSize === "All") return 1;
  return Math.ceil(filteredRows.length / (pageSize as number));
}, [filteredRows, pageSize]);

const paginatedRows = useMemo(() => {
  if (pageSize === "All") return filteredRows;
  const start = (currentPage - 1) * (pageSize as number);
  return filteredRows.slice(start, start + (pageSize as number));
}, [filteredRows, currentPage, pageSize]);

useEffect(() => {
  setCurrentPage(1);
}, [col, catFilter, statusFilter]);

  const groupedVars = useMemo(() => {
    const groups: Record<string, typeof COMMON_VARS> = {};
    filteredVars.forEach(v => {
      if (!groups[v.category]) groups[v.category] = [];
      groups[v.category].push(v);
    });
    return groups;
  }, [filteredVars]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allSelected = filteredRows.length > 0 && filteredRows.every(t => selectedIds.has(t.id));
  const someSelected = filteredRows.some(t => selectedIds.has(t.id));
  const selectedItems = filteredRows.filter(t => selectedIds.has(t.id));

  const toggleAll = () =>
    allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredRows.map(t => t.id)));

  const toggleOne = (id: string | number) => {
    const n = new Set(selectedIds);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedIds(n);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGO HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VARIABLE HELPERS - Single click to toggle
  // ══════════════════════════════════════════════════════════════════════════

  
const toggleVariable = (name: string) => {
  const varTag = `{{${name}}}`;
  const currentContent = form.html_content;

  // Remove if already present
  if (new RegExp(escapeRegExp(varTag), 'g').test(currentContent)) {
    setForm(p => ({ ...p, html_content: p.html_content.replace(new RegExp(escapeRegExp(varTag), 'g'), '') }));
    toast.success(`Removed {{${name}}}`);
    return;
  }

  // ── Code view: cursor position se insert karo ──
  if (isCodeView) {
    let insertPos = cursorPos;
    if (insertPos === null || insertPos === undefined) {
      const bodyClose = currentContent.lastIndexOf('</body>');
      insertPos = bodyClose !== -1 ? bodyClose : currentContent.length;
    }
    const newHtml = currentContent.substring(0, insertPos) + varTag + currentContent.substring(insertPos);
    setForm(p => ({ ...p, html_content: newHtml }));
    setCursorPos(insertPos + varTag.length);
    toast.success(`Inserted ${varTag}`);
    return;
  }

  // ── Visual view: </body> ke pehle insert karo (safe fallback) ──
  // contentEditable DOM se source position reliable nahi hota
 // ── Visual view: DOM selection se position nikalo ──
const savedRange = (window as any).__templateEditorRange;

if (savedRange) {
  // Find the data-var-pos from nearest span, OR use a different approach
  // contentEditable ka innerHTML → source HTML sync nahi hota reliably
  // So best approach: insert at cursor using execCommand
  const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
  if (editorEl) {
    editorEl.focus();
    const sel = window.getSelection();
    if (sel && savedRange) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
      
      document.execCommand('insertHTML', false, 
        `<span style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px;font-weight:600;">{{${name}}}</span>`
      );
      // Now sync innerHTML back to form state
      const newContent = editorEl.innerHTML;
      // Strip the yellow spans to get clean {{var}} tags
      const cleanHtml = newContent.replace(
        /<span[^>]*data-var-pos[^>]*>{{([\w_]+)}}<\/span>/g,
        '{{$1}}'
      ).replace(
        /<span[^>]*style="background:#fef3c7[^"]*">{{([\w_]+)}}<\/span>/g,
        '{{$1}}'
      );
      setForm(p => ({ ...p, html_content: cleanHtml }));
      toast.success(`Inserted ${varTag} at cursor`);
      return;
    }
  }
}

// Fallback
const bodyClose = currentContent.lastIndexOf('</body>');
const insertPos = bodyClose !== -1 ? bodyClose : currentContent.length;
const newHtml = currentContent.substring(0, insertPos) + varTag + currentContent.substring(insertPos);
setForm(p => ({ ...p, html_content: newHtml }));
toast.info(`${varTag} added at end — click in preview first to set position`);
};

// Helper function to escape regex special characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Update the extractVars function to be more reliable
const extractVars = (html?: string) => {
  if (!html) return [];
  try {
    const matches = html.match(/{{(\w+)}}/g);
    if (!matches) return [];
    // Remove duplicates by using Set
    const vars = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
    return vars;
  } catch { 
    return []; 
  }
};





// Helper function to escape regex special characters


  // ══════════════════════════════════════════════════════════════════════════
  // OPEN FORM HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  const resetForm = () => {
    setChangeNotes("");
    setLogoFile(null);
    setLogoPreview("");
  };

 const openAdd = () => {
  setEditingTpl(null);
  resetForm();
  
  // Use DEFAULT_HTML which has all the {{variable}} placeholders
  const title = getDocumentTitle("Rental Agreements");
  
  // DEFAULT_HTML already has all the variables, just update the title
  let defaultHtml = DEFAULT_HTML;
  defaultHtml = defaultHtml.replace(
    /<h1 class="document-title">.*?<\/h1>/,
    `<h1 class="document-title">${title}</h1>`
  );
  
  setForm({ 
    name: "", 
    category: "Rental Agreements", 
    description: "", 
    html_content: defaultHtml  // This has {{tenant_name}}, {{date}}, etc.
  });
  setShowForm(true);
  
  setTimeout(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, 100);
};

  const openEdit = async (t: DocumentTemplate) => {
    resetForm();
    
    if (t.logo_url) {
      const fullUrl = t.logo_url.startsWith("http") 
        ? t.logo_url 
        : `${API_BASE}${t.logo_url}`;
      setLogoPreview(fullUrl);
    }
    
    if (t.html_content) {
  setEditingTpl(t);
  // Fix: ensure LESSEE block has tenant_name
  let fixedHtml = t.html_content;
  fixedHtml = fixedHtml.replace(
    /(<span class="field-label">LESSEE \/ RECIPIENT<\/span>\s*<div class="field-value">)(?!\{\{tenant_name\}\})/,
    '$1{{tenant_name}}<br>\n              <span style="font-size: 12px; color: #6b7280;">S/o, D/o {{emergency_contact_name}}</span>'
  );
  // Fix: ensure RECIPIENT'S SIGNATURE has tenant_name
  fixedHtml = fixedHtml.replace(
    /(<div class="signature-label">RECIPIENT'S SIGNATURE<\/div>\s*<div class="signature-name">)(?!\{\{tenant_name\}\})/,
    '$1{{tenant_name}}'
  );
  setForm({
    name: t.name,
    category: t.category,
    description: t.description || "",
    html_content: fixedHtml
  });
      setShowForm(true);
    } else {
      try {
        const { getTemplate } = await import("@/lib/documentTemplateApi");
        const res = await getTemplate(t.id);
        const full = res.data || t;
        setEditingTpl(full);
        setLogoPreview(full.logo_url ? `${API_BASE}${full.logo_url}` : "");
        setForm({
          name: full.name,
          category: full.category,
          description: full.description || "",
          html_content: full.html_content || ""
        });
        setShowForm(true);
      } catch {
        setEditingTpl(t);
        setForm({
          name: t.name,
          category: t.category,
          description: t.description || "",
          html_content: t.html_content || ""
        });
        setShowForm(true);
      }
    }
  };

  const openDuplicate = async (t: DocumentTemplate) => {
    resetForm();
    setChangeNotes(`Duplicated from ${t.name}`);
    
    if (t.logo_url) {
      setLogoPreview(`${API_BASE}${t.logo_url}`);
    }
    
    let html = t.html_content;
    if (!html) {
      try {
        const { getTemplate } = await import("@/lib/documentTemplateApi");
        const res = await getTemplate(t.id);
        html = res.data?.html_content || "";
      } catch { html = ""; }
    }
    
    setEditingTpl(null);
    setForm({
      name: `${t.name} (Copy)`,
      category: t.category,
      description: t.description || "",
      html_content: html
    });
    setShowForm(true);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PREVIEW
  // ══════════════════════════════════════════════════════════════════════════

const buildPreview = (html: string, logoSrc?: string): string => {
  if (!html) return ``;
  
  let c = html.trim();
  if (!c.startsWith("<!DOCTYPE") && !c.startsWith("<html")) {
    c = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${c}</body></html>`;
  }

  // ── Scope body{} rules so they don't leak to the live page ──
  c = c.replace(/(^|\}|\s)body(\s*\{)/g, '$1.tpl-preview-scope$2');
  c = c.replace(/@media\s+print\s*\{\s*\.tpl-preview-scope\s*\{[^}]*\}\s*\}/g, '');

  // ── NEW: extract <style> content and <body> inner content as a clean fragment ──
  // This avoids relying on the browser to parse a fake nested <html> doc inside a <div>,
  // which is unreliable for <style> tag application.
  const styleMatch = c.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styleContent = styleMatch ? styleMatch[1] : "";

  const bodyMatch = c.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : c;

  c = `<style>${styleContent}</style>${bodyContent}`;

  // Logo replace
  if (logoSrc) {
    c = c.replace(/\{\{logo_url\}\}/g, `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`);
  } else {
    c = c.replace(/\{\{logo_url\}\}/g, `<div style="font-size:12px;color:#666;padding:4px;border:1px dashed #ccc;border-radius:4px;">Company Logo</div>`);
  }

  c = c.replace(/\{\{([\w_]+)\}\}/g, (match, varName, offset) => {
    return `<span data-var-pos="${offset}" data-var-len="${match.length}" contenteditable="false" style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px;font-weight:600;">{{${varName}}}</span>`;
  });

  return c;
};


  const openPreviewForRow = async (t: DocumentTemplate) => {
    let html = t.html_content;
    if (!html) {
      try {
        const { getTemplate } = await import("@/lib/documentTemplateApi");
        const res = await getTemplate(t.id);
        html = res.data?.html_content || "";
      } catch { html = ""; }
    }
    
    const logo = t.logo_url 
      ? (t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`)
      : "";
      
    setPreviewHtml(buildPreview(html, logo));
    setShowPreview(true);
  };

  const openPreview = (t: DocumentTemplate | null, overrideHtml?: string) => {
    const html = overrideHtml || t?.html_content || form.html_content;
    const logo = logoPreview || (t?.logo_url ? `${API_BASE}${t.logo_url}` : "");
    
    setPreviewHtml(buildPreview(html, logo));
    setShowPreview(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Preview</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>${previewHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SAVE
  // ══════════════════════════════════════════════════════════════════════════

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Template name is required");
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }
    if (!form.html_content.trim()) {
      toast.error("HTML content is required");
      if (htmlEditorRef.current) htmlEditorRef.current.focus();
      return;
    }

    setSaving(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('description', form.description || '');
      formData.append('html_content', form.html_content);
      formData.append('change_notes', changeNotes || '');
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      if (!logoPreview && editingTpl?.logo_url) {
        formData.append('remove_logo', 'true');
      }

      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        html_content: form.html_content,
        change_notes: changeNotes,
        logo: logoFile || undefined,
        remove_logo: !logoPreview && !!editingTpl?.logo_url ? true : undefined,
      };

      if (editingTpl) {
        await updateTemplate(editingTpl.id, payload);
        toast.success(`Template updated to v${editingTpl.version + 1}`);
      } else {
        await createTemplate(payload);
        toast.success("Template created successfully");
      }

      setShowForm(false);
      setSelectedIds(new Set());
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DELETE / BULK ACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  const handleDelete = async (id: string | number, name: string) => {
  const r = await Swal.fire({
    title: "Delete Template?",
    text: `"${name}" will be permanently removed.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    customClass: { popup: "rounded-xl shadow-2xl text-sm" },

    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;

      if (confirmBtn) {
        confirmBtn.style.background = '#dc2626';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.padding = '8px 18px';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.display = 'inline-block';
        confirmBtn.style.filter = 'none';
        confirmBtn.onmouseover = () => (confirmBtn.style.filter = 'none');
      }

      if (cancelBtn) {
        cancelBtn.style.background = '#6b7280';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.padding = '8px 18px';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.marginRight = '8px';
        cancelBtn.style.display = 'inline-block';
        cancelBtn.style.filter = 'none';
        cancelBtn.onmouseover = () => (cancelBtn.style.filter = 'none');
      }
    }
  });

  if (!r.isConfirmed) return;

  try {
    await deleteTemplate(id);
    toast.success("Template deleted successfully");
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    await loadTemplates();
  } catch (err: any) {
    toast.error(err.message);
  }
};

 const handleBulkDelete = async () => {
  if (!selectedItems.length) return;

  const r = await Swal.fire({
    title: `Delete ${selectedItems.length} template(s)?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Delete all",
    cancelButtonText: "Cancel",
    customClass: { popup: "rounded-xl text-sm" },

    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;

      if (confirmBtn) {
        confirmBtn.style.background = '#dc2626';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.padding = '8px 18px';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.display = 'inline-block';
        confirmBtn.style.filter = 'none';
        confirmBtn.onmouseover = () => (confirmBtn.style.filter = 'none');
      }

      if (cancelBtn) {
        cancelBtn.style.background = '#6b7280';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.padding = '8px 18px';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.marginRight = '8px';
        cancelBtn.style.display = 'inline-block';
        cancelBtn.style.filter = 'none';
        cancelBtn.onmouseover = () => (cancelBtn.style.filter = 'none');
      }
    }
  });

  if (!r.isConfirmed) return;

  try {
    await bulkDeleteTemplates(selectedItems.map(t => t.id));
    toast.success(`Deleted ${selectedItems.length} template(s)`);
    setSelectedIds(new Set());
    await loadTemplates();
  } catch (err: any) {
    toast.error(err.message);
  }
};

  const handleBulkStatus = async (active: boolean) => {
    if (!selectedItems.length) return;
    try {
      await bulkUpdateTemplateStatus(selectedItems.map(t => t.id), active);
      toast.success(`${active ? "Activated" : "Deactivated"} ${selectedItems.length} template(s)`);
      setSelectedIds(new Set());
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RESTORE VERSION
  // ══════════════════════════════════════════════════════════════════════════

  const handleRestoreVersion = async (tplId: string | number, version: number) => {
    const r = await Swal.fire({
      title: `Restore v${version}?`,
      text: "A new version will be created.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore",
      customClass: { popup: "rounded-xl text-sm" },
    });
    if (!r.isConfirmed) return;
    
    try {
      await restoreTemplateVersion(tplId, version);
      toast.success(`Restored to v${version}`);
      setShowHistory(false);
      await loadTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
const handleExport = () => {
  try {
    // Prepare data for export
    const exportData = filteredRows.map(t => ({
      'Template Name': t.name,
      'Category': t.category,
      'Description': t.description || '',
      'Version': t.version,
      'Status': t.is_active ? 'Active' : 'Inactive',
      'Variables Count': t.variables?.length || 0,
      'Variables List': (t.variables || []).join('; '),
      'Last Updated': new Date(t.updated_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
      'Change Notes': t.change_notes || '',
      'Created By': t.created_by || '',
      'Last Modified By': t.last_modified_by || '',
      'ID': t.id
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = [];
    const headers = Object.keys(exportData[0] || {});
    headers.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...exportData.map(row => String(row[header] || '').length)
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Templates");

    // Add summary sheet
    const summaryData = [{
      'Metric': 'Total Templates',
      'Value': filteredRows.length
    }, {
      'Metric': 'Active Templates',
      'Value': filteredRows.filter(t => t.is_active).length
    }, {
      'Metric': 'Inactive Templates',
      'Value': filteredRows.filter(t => !t.is_active).length
    }, {
      'Metric': 'Categories',
      'Value': new Set(filteredRows.map(t => t.category)).size
    }, {
      'Metric': 'Export Date',
      'Value': new Date().toLocaleString('en-IN')
    }];

    // Add category breakdown
    const categoryCounts = filteredRows.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCounts).forEach(([category, count]) => {
      summaryData.push({ 'Metric': `${category} Templates`, 'Value': count });
    });

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Generate filename
    const filename = `templates_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredRows.length} templates successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export templates');
  }
};

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const hasFilters = catFilter !== "all" || statusFilter !== "all";
  const filterCount = [catFilter !== "all", statusFilter !== "all"].filter(Boolean).length;
  const clearFilters = () => { setCatFilter("all"); setStatusFilter("all"); };
  const hasCol = Object.values(col).some(v => v !== "");
  const clearCol = () => setCol({ name: "", category: "", description: "", version: "", status: "" });

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
   <div className="mb-2">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

    {/* LEFT - Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
      <StatCard
        title="Total"
        value={stats.total}
        icon={LayoutTemplate}
        color="bg-blue-600"
        bg="bg-gradient-to-br from-blue-50 to-blue-100"
      />

      <StatCard
        title="Active"
        value={stats.active}
        icon={CheckCircle}
        color="bg-green-600"
        bg="bg-gradient-to-br from-green-50 to-green-100"
      />

      <StatCard
        title="Inactive"
        value={stats.inactive}
        icon={XCircle}
        color="bg-gray-500"
        bg="bg-gradient-to-br from-gray-50 to-gray-100"
      />

      <StatCard
        title="Categories"
        value={stats.cats}
        icon={Layers}
        color="bg-indigo-600"
        bg="bg-gradient-to-br from-indigo-50 to-indigo-100"
      />
    </div>

    {/* RIGHT - Actions */}
    <div className="flex items-center justify-end gap-2 flex-wrap shrink-0 lg:mt-8">

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
            {selectedItems.length} selected
          </span>

          <button
            onClick={() => handleBulkStatus(true)}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-[11px] font-medium hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="h-3 w-3" />
            Activate
          </button>

          <button
            onClick={() => handleBulkStatus(false)}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-medium hover:bg-gray-100 transition-colors"
          >
            <XCircle className="h-3 w-3" />
            Deactivate
          </button>

          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      )}

      {/* Filter */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
          ${
            sidebarOpen || hasFilters
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white border-gray-200"
          }`}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Filters</span>

        {filterCount > 0 && (
          <span
            className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
              ${
                sidebarOpen || hasFilters
                  ? "bg-white text-blue-600"
                  : "bg-blue-600 text-white"
              }`}
          >
            {filterCount}
          </span>
        )}
      </button>

      {/* Export */}
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Create */}
      <button
        onClick={openAdd}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Create Template</span>
      </button>

    </div>
  </div>
</div>

     {/* ── TABLE ──────────────────────────────────────────────────────── */}<div className="relative">
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    

<div className="flex flex-col h-[310px] sm:h-[430px] lg:h-[500px]">
  <div className="overflow-auto flex-1 min-h-0">        <table
          className="border-collapse text-[11px] font-sans"
          style={{ tableLayout: "fixed", minWidth: "900px", width: "100%" }}
        >
          <colgroup>
            <col style={{ width: "36px" }} />   {/* Checkbox */}
            <col style={{ width: "80px" }} />   {/* Actions */}
            <col style={{ width: "180px" }} />  {/* Name */}
            <col style={{ width: "120px" }} />  {/* Category */}
            <col style={{ width: "160px" }} />  {/* Description */}
            <col style={{ width: "60px" }} />   {/* Variables */}
            <col style={{ width: "55px" }} />   {/* Version */}
            <col style={{ width: "70px" }} />   {/* Status */}
            <col style={{ width: "90px" }} />   {/* Updated */}
          </colgroup>

          {/* ── STICKY THEAD ── */}
          <thead className="sticky top-0 z-10">
            {/* Title Row */}
            <tr className="bg-gray-200 border-b border-gray-300">
              <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
              <input
  type="checkbox"
  checked={allSelected}
  onChange={toggleAll}   
  className="w-3.5 h-3.5 cursor-pointer"
/>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Template Name</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Category</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Description</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Vars</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Ver</span>
              </th>
              <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
              </th>
              <th className="px-1.5 py-1.5 text-left bg-gray-200">
                <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Updated</span>
              </th>
            </tr>

            {/* Search Row */}
            <tr className="bg-white border-b border-gray-300">
              <td className="p-1 border-r border-gray-200 bg-white" />
              <td className="p-1 border-r border-gray-200 bg-white" />
              <td className="p-1 border-r border-gray-200">
                <Input
                  placeholder="Search name…"
                  value={col.name}
                  onChange={e => setCol(p => ({ ...p, name: e.target.value }))}
                  className="h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 w-full"
                />
              </td>
              <td className="p-1 border-r border-gray-200">
                <Input
                  placeholder="Category…"
                  value={col.category}
                  onChange={e => setCol(p => ({ ...p, category: e.target.value }))}
                  className="h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 w-full"
                />
              </td>
              <td className="p-1 border-r border-gray-200">
                <Input
                  placeholder="Desc…"
                  value={col.description}
                  onChange={e => setCol(p => ({ ...p, description: e.target.value }))}
                  className="h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 w-full"
                />
              </td>
              <td className="p-1 border-r border-gray-200" />
              <td className="p-1 border-r border-gray-200">
                <Input
                  placeholder="v…"
                  value={col.version}
                  onChange={e => setCol(p => ({ ...p, version: e.target.value }))}
                  className="h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 w-full"
                />
              </td>
              <td className="p-1 border-r border-gray-200">
                <Input
                  placeholder="active…"
                  value={col.status}
                  onChange={e => setCol(p => ({ ...p, status: e.target.value }))}
                  className="h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 w-full"
                />
              </td>
              <td className="p-1" />
            </tr>
          </thead>

          {/* ── TBODY ── */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  Loading…
                </td>
              </tr>
) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                  <LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No templates found</p>
                  <p className="text-xs text-gray-400 mt-1">Create one to get started</p>
                </td>
              </tr>
) : paginatedRows.map(t => (              <tr
                key={t.id}
                className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${selectedIds.has(t.id) ? "bg-blue-50/40" : ""}`}
              >
                {/* Checkbox */}
                <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                 <input
  type="checkbox"
  checked={selectedIds.has(t.id)}
  onChange={() => toggleOne(t.id)}
  className="w-3.5 h-3.5 cursor-pointer"
/>
                </td>

                {/* Actions */}
                <td className="px-1 py-1.5 border-r border-slate-100">
                  <div className="flex items-center gap-[1px] flex-nowrap">
                    <button
                      onClick={() => openPreviewForRow(t)}
                      title="Preview"
                      className="w-6 h-6 rounded-lg text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      title="Edit"
                      className="w-6 h-6 rounded-lg text-green-500 hover:bg-green-50 flex items-center justify-center transition-colors"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => openDuplicate(t)}
                      title="Duplicate"
                      className="w-6 h-6 rounded-lg text-purple-500 hover:bg-purple-50 flex items-center justify-center transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => { setHistoryTpl(t); setShowHistory(true); }}
                      title="History"
                      className="w-6 h-6 rounded-lg text-orange-500 hover:bg-orange-50 flex items-center justify-center transition-colors"
                    >
                      <History className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      title="Delete"
                      className="w-6 h-6 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>

                {/* Name */}
                <td className="px-1.5 py-1.5 border-r border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {t.logo_url && (
                      <img
                        src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`}
                        alt=""
                        className="h-4 w-4 rounded object-contain border border-gray-200 flex-shrink-0"
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <span className="text-[11px] font-semibold text-slate-800 truncate">{t.name}</span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-1.5 py-1.5 border-r border-slate-100">
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-full">
                    {t.category}
                  </span>
                </td>

                {/* Description */}
                <td className="px-1.5 py-1.5 text-[10px] text-slate-500 border-r border-slate-100 truncate">
                  {t.description || "—"}
                </td>

                {/* Variables */}
                <td className="px-1.5 py-1.5 border-r border-slate-100">
                  <div className="flex items-center gap-1">
                    <Code className="h-3 w-3 text-blue-500" />
                    <span className="text-[11px] font-bold text-blue-600">{t.variables?.length || 0}</span>
                  </div>
                </td>

                {/* Version */}
                <td className="px-1.5 py-1.5 border-r border-slate-100">
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                    v{t.version}
                  </span>
                </td>

                {/* Status */}
                <td className="px-1.5 py-1.5 border-r border-slate-100">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                    style={{
                      background: t.is_active ? "#DCFCE7" : "#F3F4F6",
                      color: t.is_active ? "#166534" : "#6B7280",
                    }}
                  >
                    {t.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Updated */}
                <td className="px-1.5 py-1.5 text-[10px] text-slate-400">
                  {new Date(t.updated_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* ── Pagination Bar ── */}
   {!loading && templates.length > 0 && (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg">
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span>
        Showing {paginatedRows.length === 0 ? 0 : ((currentPage - 1) * (pageSize === "All" ? filteredRows.length : pageSize as number)) + 1}–
        {Math.min(currentPage * (pageSize === "All" ? filteredRows.length : pageSize as number), filteredRows.length)} of {filteredRows.length} templates
      </span>
      <div className="flex items-center gap-1">
        <span className="text-gray-400 text-[10px]">Rows:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => {
            const newSize = val === "All" ? "All" : Number(val);
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-6 w-16 text-[10px] border-gray-200 px-1">
            <SelectValue>{pageSize}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(size => (
              <SelectItem key={String(size)} value={String(size)} className="text-xs">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {totalPages > 1 && (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="h-7 px-2 text-xs border border-gray-300 rounded bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum = i + 1;
          if (totalPages > 5) {
            if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`h-7 w-7 text-xs border rounded ${
                currentPage === pageNum
                  ? "bg-blue-600 border-blue-600 text-white font-bold"
                  : "bg-white border-gray-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="h-7 px-2 text-xs border border-gray-300 rounded bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          Next
        </button>
      </div>
    )}

    <div className="text-[11px] text-slate-500">
      {paginatedRows.length} of {filteredRows.length} shown
    </div>
  </div>
)}
  </div>

  {/* ── FILTER SIDEBAR ── */}
 {sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]"
    onClick={() => setSidebarOpen(false)}
  />
)}
<aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col
  transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>

  {/* Header */}
  <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-white" />
      <span className="text-sm font-semibold text-white">Filters</span>
      {hasFilters && (
        <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
          {filterCount} active
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {hasFilters && (
        <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
          Clear all
        </button>
      )}
      <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto p-4 space-y-5">

    {/* Category dropdown */}
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {/* <LayoutTemplate className="h-3 w-3 text-blue-500" /> */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</p>
      </div>
      <select
        value={catFilter}
        onChange={(e) => setCatFilter(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-[12px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="border-t border-gray-100" />

    {/* Status dropdown */}
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {/* <CheckCircle className="h-3 w-3 text-green-500" /> */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-[12px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
  </div>

  {/* Footer buttons */}
  <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
    <button
      onClick={clearFilters}
      disabled={!hasFilters}
      className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Clear All
    </button>
    <button
      onClick={() => setSidebarOpen(false)}
      className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold"
    >
      Apply & Close
    </button>
  </div>
</aside>
</div>

      {/* ══ CREATE / EDIT MODAL ═════════════════════════════════════════════ */}
      {showForm && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}
  >
    <div
      style={{
        width: "min(1080px, 95vw)",
        height: "min(90vh, 850px)",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
      }}
    >

      {/* Header */}
     <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-3 sm:px-5 py-2 flex items-center justify-between gap-2 flex-shrink-0">

  {/* Left */}
  <div className="min-w-0 flex-1">
    <h2 className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold truncate">
      {editingTpl ? (
        <>
          <Pencil className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            Edit Template: {editingTpl.name}
          </span>
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span>Create New Template</span>
        </>
      )}
    </h2>

    <p className="hidden sm:block text-[11px] text-blue-100 mt-0.5 truncate">
      {editingTpl
        ? `Current version: v${editingTpl.version} → New version: v${editingTpl.version + 1}`
        : "Design your professional A4 document template"}
    </p>
  </div>

  {/* Close */}
  <button
    onClick={() => setShowForm(false)}
    className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/20 transition-colors"
  >
    <X className="h-4 w-4 sm:h-5 sm:w-5" />
  </button>

</div>

      {/* Body: Split Layout */}
      <div 
        style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }} 
        className="flex-col md:flex-row"
      >

        {/* LEFT: Main Form */}
        <div 
          style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "20px" }} 
          className="space-y-5"
        >
         {/* Template Info + Logo combined - compact */}
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-100">
  <SH
    icon={<FileText className="h-3 w-3" />}
    title="Template Information"
    color="text-blue-700"
  />

  <div className="flex gap-2 items-start">

    {/* Logo */}
    <div className="w-20 sm:w-24 flex-shrink-0">
      <label className={`${L} text-[10px]`}>Logo</label>

      <div
        className="relative cursor-pointer mt-1"
        onClick={() => logoInputRef.current?.click()}
      >
        {logoPreview ? (
          <>
            <img
              src={logoPreview}
              alt="Logo"
              className="w-full h-16 sm:h-20 object-contain rounded-md border border-blue-200 bg-white p-1"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLogo();
              }}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </>
        ) : (
          <div className="w-full h-16 sm:h-20 rounded-md border border-dashed border-blue-300 bg-white flex flex-col items-center justify-center">
            <ImageIcon className="h-4 w-4 text-blue-300" />
            <span className="text-[9px] text-blue-400">Upload</span>
          </div>
        )}

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={onLogoChange}
          className="hidden"
        />
      </div>
    </div>

    {/* Right */}
    <div className="flex-1">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

        <div>
          <label className={`${L} text-[10px]`}>
            <span className="text-red-500">*</span> Template Name
          </label>

          <Input
            ref={nameInputRef}
            className={`${F} h-8 text-xs`}
            placeholder="Rental Agreement"
            value={form.name}
            onChange={(e) =>
              setForm((p) => ({ ...p, name: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={`${L} text-[10px]`}>Category</label>

          <Select
            value={form.category}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, category: v }))
            }
          >
            <SelectTrigger className={`${F} h-8 text-xs`}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className={SI}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-2">
        <label className={`${L} text-[10px]`}>Description</label>

        <Input
          className={`${F} h-8 text-xs`}
          placeholder="Brief description..."
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              description: e.target.value,
            }))
          }
        />
      </div>
    </div>
  </div>

  {editingTpl && (
    <div className="mt-2">
      <label className={`${L} text-[10px]`}>
        Change Notes
        <span className="ml-1 text-gray-400 font-normal">(optional)</span>
      </label>

      <Input
        className={`${F} h-8 text-xs`}
        placeholder="Describe changes..."
        value={changeNotes}
        onChange={(e) => setChangeNotes(e.target.value)}
      />
    </div>
  )}
</div>
        {/* TinyMCE-style Editor */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">

            {/* ── Toolbar Row 1: formatting tools ── */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[#f9fafb] border-b border-gray-200 flex-wrap">

              {/* Page size */}
              <select className="h-6 text-[10px] border border-gray-200 rounded bg-white px-1.5 text-gray-600 mr-1">
                <option>A4 · Blank Page</option>
              </select>

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* File buttons */}
              {[
                { icon: <FileText className="h-3.5 w-3.5" />, title: "New" },
                { icon: <Upload className="h-3.5 w-3.5" />,   title: "Import" },
                { icon: <Download className="h-3.5 w-3.5" />, title: "Export" },
              ].map((b, i) => (
                <button key={i} title={b.title}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors">
                  {b.icon}
                </button>
              ))}

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* B I U S */}
              {/* B I U S */}
{[
  { ch: "B", title: "Bold",          cls: "font-bold",    cmd: "bold" },
  { ch: "I", title: "Italic",        cls: "italic",       cmd: "italic" },
  { ch: "U", title: "Underline",     cls: "underline",    cmd: "underline" },
  { ch: "S", title: "Strikethrough", cls: "line-through", cmd: "strikeThrough" },
].map((b, i) => (
  <button
    key={i}
    title={b.title}
    disabled={isCodeView}
    className={`h-6 w-6 rounded text-[11px] ${b.cls} hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
    onMouseDown={(e) => {
      e.preventDefault();
      const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
      if (!editorEl) return;
      editorEl.focus();
      document.execCommand(b.cmd, false);
      // Selection ko save karo BEFORE re-render
      const sel = window.getSelection();
      const rangeAfterCmd = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
      const cleanHtml = editorEl.innerHTML.replace(
        /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
        '{{$1}}'
      );
      setForm(p => ({ ...p, html_content: cleanHtml }));
      // Re-render ke baad selection restore karo
      if (rangeAfterCmd) {
        setTimeout(() => {
          const sel2 = window.getSelection();
          if (sel2) {
            sel2.removeAllRanges();
            try { sel2.addRange(rangeAfterCmd); } catch {}
          }
        }, 0);
      }
    }}
  >
    {b.ch}
  </button>
))}

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* Font family */}
<select
  value={selectedFont}
  onChange={e => {
    const font = e.target.value;
    if (!font) return;
    const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
    if (!editorEl) return;

    editorEl.focus();
    const savedRange = (window as any).__templateEditorRange;
    const sel = window.getSelection();
    if (sel && savedRange) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }

    document.execCommand('fontName', false, font);

    // Save selection after command
    const rangeAfterCmd = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;

    // Clean innerHTML: preserve font tags but strip our variable markers
    const cleanHtml = editorEl.innerHTML.replace(
      /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
      '{{$1}}'
    );
    setForm(p => ({ ...p, html_content: cleanHtml }));

    // ✅ Update the dropdown to show the applied font
    setSelectedFont(font);

    if (rangeAfterCmd) {
      setTimeout(() => {
        const sel2 = window.getSelection();
        if (sel2) {
          sel2.removeAllRanges();
          try { sel2.addRange(rangeAfterCmd); } catch {}
        }
      }, 0);
    }
  }}
  className="h-6 text-[10px] border border-gray-200 rounded bg-white px-1.5 text-gray-600"
  disabled={isCodeView}
  onMouseDown={() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      (window as any).__templateEditorRange = sel.getRangeAt(0).cloneRange();
    }
  }}
>
  <option value="" disabled>Font</option>
  <option value="Inter">Inter</option>
  <option value="Arial">Arial</option>
  <option value="Times New Roman">Times New Roman</option>
  <option value="Courier New">Courier New</option>
  <option value="Georgia">Georgia</option>
  <option value="Verdana">Verdana</option>
</select>

              {/* Font size */}
<select
  className="h-6 w-[52px] text-[10px] border border-gray-200 rounded bg-white px-1 text-gray-600 ml-1"
  disabled={isCodeView}
  onMouseDown={() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      (window as any).__templateEditorRange = sel.getRangeAt(0).cloneRange();
    }
  }}
  onChange={e => {
    const size = e.target.value.replace(' pt', '');
    const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
    if (!editorEl) return;

    editorEl.focus();
    const savedRange = (window as any).__templateEditorRange;
    const sel = window.getSelection();
    if (sel && savedRange) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }

    document.execCommand('fontSize', false, '7');
    editorEl.querySelectorAll('font[size="7"]').forEach(el => {
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      span.innerHTML = el.innerHTML;
      el.replaceWith(span);
    });

    const rangeAfterCmd = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;

    const cleanHtml = editorEl.innerHTML.replace(
      /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
      '{{$1}}'
    );
    setForm(p => ({ ...p, html_content: cleanHtml }));

    if (rangeAfterCmd) {
      setTimeout(() => {
        const sel2 = window.getSelection();
        if (sel2) {
          sel2.removeAllRanges();
          try { sel2.addRange(rangeAfterCmd); } catch {}
        }
      }, 0);
    }
  }}
>
  {[8,9,10,11,12,14,16,18,20,24,28,32].map(s => (
    <option key={s} value={`${s} pt`}>{s} pt</option>
  ))}
</select>

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* Alignment */}
           {/* Alignment */}
{[
  { title: "Align Left",   d: "M3 5h14M3 9h9M3 13h14M3 17h9",  cmd: "justifyLeft" },
  { title: "Align Center", d: "M3 5h14M6 9h8M3 13h14M6 17h8",  cmd: "justifyCenter" },
  { title: "Align Right",  d: "M3 5h14M9 9h9M3 13h14M9 17h9",  cmd: "justifyRight" },
  { title: "Justify",      d: "M3 5h14M3 9h14M3 13h14M3 17h14", cmd: "justifyFull" },
].map((b, i) => (
  <button
    key={i}
    title={b.title}
    disabled={isCodeView}
    className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    onMouseDown={(e) => {
      e.preventDefault();
      const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
      if (!editorEl) return;
      editorEl.focus();
      document.execCommand(b.cmd, false);
      const sel = window.getSelection();
      const rangeAfterCmd = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
      const cleanHtml = editorEl.innerHTML.replace(
        /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
        '{{$1}}'
      );
      setForm(p => ({ ...p, html_content: cleanHtml }));
      if (rangeAfterCmd) {
        setTimeout(() => {
          const sel2 = window.getSelection();
          if (sel2) {
            sel2.removeAllRanges();
            try { sel2.addRange(rangeAfterCmd); } catch {}
          }
        }, 0);
      }
    }}
  >
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d={b.d} />
    </svg>
  </button>
))}

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* Bullet list */}
              <button title="Bullet List" className="p-1 rounded hover:bg-gray-200 text-gray-500">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="3" cy="5"  r="1.2" fill="currentColor" stroke="none"/>
                  <path d="M7 5h10"/>
                  <circle cx="3" cy="10" r="1.2" fill="currentColor" stroke="none"/>
                  <path d="M7 10h10"/>
                  <circle cx="3" cy="15" r="1.2" fill="currentColor" stroke="none"/>
                  <path d="M7 15h10"/>
                </svg>
              </button>

              {/* Numbered list */}
              <button title="Numbered List" className="p-1 rounded hover:bg-gray-200 text-gray-500">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <text x="0" y="6"  fontSize="5" fontWeight="bold">1.</text>
                  <rect x="6" y="3"  width="13" height="2" rx="1" fill="currentColor"/>
                  <text x="0" y="11" fontSize="5" fontWeight="bold">2.</text>
                  <rect x="6" y="8"  width="13" height="2" rx="1" fill="currentColor"/>
                  <text x="0" y="16" fontSize="5" fontWeight="bold">3.</text>
                  <rect x="6" y="13" width="13" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>

              {/* Table */}
              <button title="Insert Table" className="p-1 rounded hover:bg-gray-200 text-gray-500">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="16" height="16" rx="1.5"/>
                  <path d="M2 7h16M2 13h16M8 2v16M14 2v16"/>
                </svg>
              </button>

              <div className="h-4 w-px bg-gray-300 mx-1" />

              {/* Undo */}
              {/* Undo */}
<button
  title="Undo"
  disabled={isCodeView}
  className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
  onMouseDown={(e) => {
    e.preventDefault();
    const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
    if (!editorEl) return;
    editorEl.focus();
    document.execCommand('undo', false);
    const cleanHtml = editorEl.innerHTML.replace(
      /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
      '{{$1}}'
    );
    setForm(p => ({ ...p, html_content: cleanHtml }));
  }}
>
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 8H13a4 4 0 010 8H8"/>
    <path d="M4 8L7 5M4 8L7 11"/>
  </svg>
</button>

{/* Redo */}
<button
  title="Redo"
  disabled={isCodeView}
  className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
  onMouseDown={(e) => {
    e.preventDefault();
    const editorEl = document.querySelector('[data-template-editable="true"]') as HTMLElement;
    if (!editorEl) return;
    editorEl.focus();
    document.execCommand('redo', false);
    const cleanHtml = editorEl.innerHTML.replace(
      /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
      '{{$1}}'
    );
    setForm(p => ({ ...p, html_content: cleanHtml }));
  }}
>
  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M16 8H7a4 4 0 000 8h5"/>
    <path d="M16 8L13 5M16 8L13 11"/>
  </svg>
</button>
            </div>

            {/* ── Toolbar Row 2: print / <> toggle / variable insert ── */}
         {/* ── Toolbar Row 2: print / <> toggle / variable insert ── */}
<div className="flex items-center gap-1.5 px-2 py-1 bg-[#f9fafb] border-b border-gray-200">

  {/* Print → opens preview modal */}
  <button
    title="Print / Preview"
    onClick={() => openPreview(editingTpl, form.html_content)}
    className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
  >
    <Printer className="h-3.5 w-3.5" />
  </button>

  {/* <> toggle: visual print preview with page breaks ↔ code editor */}
  <button
    title={isCodeView ? "Visual Print Preview (with page breaks)" : "Code Editor"}
    onClick={() => setIsCodeView(v => !v)}
    className={`p-1 rounded transition-colors ${
      isCodeView ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-500"
    }`}
  >
    <Code className="h-3.5 w-3.5" />
  </button>

  <div className="h-4 w-px bg-gray-300 mx-1" />

  {/* Category filter */}
  <select
    value={varCategory}
    onChange={e => setVarCategory(e.target.value)}
    className="h-6 text-[10px] border border-gray-200 rounded bg-white px-1.5 text-gray-600"
  >
    {VARIABLE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
  </select>

  {/* Insert variable dropdown */}
  <select
    className="h-6 text-[10px] border border-gray-200 rounded bg-white px-1.5 text-gray-500 min-w-[140px]"
    value=""
    onChange={e => {
      if (e.target.value) {
        toggleVariable(e.target.value);
        e.currentTarget.value = "";
      }
    }}
  >
    <option value="">Insert variable…</option>
    {filteredVars.map(v => (
      <option key={v.name} value={v.name}>
        {`{{${v.name}}}`} — {v.label}
      </option>
    ))}
  </select>

  {/* Used variables counter */}
  <select
    className="h-6 text-[10px] border border-gray-200 rounded bg-white px-1.5 text-gray-500 min-w-[130px]"
    value=""
    onChange={() => {}}
  >
    <option value="">
      Used variables ({extractVars(form.html_content).length})
    </option>
    {extractVars(form.html_content).map(v => (
      <option key={v} value={v}>{`{{${v}}}`}</option>
    ))}
  </select>
</div>

{/* ── Editor Area ── */}
{isCodeView ? (
                   <Editor
  value={form.html_content}
  onValueChange={(code) => {
    setForm({ ...form, html_content: code });
  }}
  highlight={(code) => Prism.highlight(code, Prism.languages.html, "html")}
  padding={12}
  onKeyUp={(e) => {
    const ta = e.currentTarget.querySelector('textarea');
    if (ta) setCursorPos(ta.selectionStart);
  }}
  onClick={(e) => {
    const ta = (e.currentTarget as HTMLElement).querySelector('textarea');
    if (ta) setCursorPos(ta.selectionStart);
  }}
  onKeyDown={(e) => {
    const ta = e.currentTarget.querySelector('textarea');
    if (!ta) return;
    // Ctrl+Z / Cmd+Z — Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      // Browser default textarea undo kaam karega
      return;
    }
    // Ctrl+Y / Ctrl+Shift+Z — Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      return;
    }
  }}
  style={{
    background: "#1e1e2e",
    color: "#cdd6f4",
    fontFamily: "Fira Code, monospace",
    fontSize: 13,
    minHeight: "400px",
    borderRadius: "8px",
  }}
/>
) : (
  /* Visual Preview with click-to-place cursor */
  <div 
    className="bg-[#e8eaed]" 
    style={{ height: "500px", overflowY: "auto" }}
  >
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px",
      gap: "24px",
    }}>
     <div 
          style={{
            width: "210mm",
            minHeight: "297mm",
            backgroundColor: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
            marginBottom: "24px",
            padding: "2.2cm 2.2cm 2cm",
          }}
          className="w-full sm:w-[210mm] max-w-full"
        >
        {/* Page number */}
        <div style={{
          position: "absolute",
          bottom: "12px",
          right: "12px",
          fontSize: "10px",
          color: "#9ca3af",
          backgroundColor: "white",
          padding: "2px 6px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          zIndex: 10,
        }}>
          Page 1
        </div>
        
        {/* EDITABLE content area */}
       {/* EDITABLE content area */}
        <div
          contentEditable
          suppressContentEditableWarning
          data-template-editable="true"
          className="tpl-preview-scope"
           key={editingTpl?.id ?? "new"} 
        onInput={(e) => {
  const el = e.currentTarget;
  const cleanHtml = el.innerHTML.replace(
    /<span[^>]*style="background:#fef3c7[^"]*">\{\{([\w_]+)\}\}<\/span>/g,
    '{{$1}}'
  );
  lastSyncedHtmlRef.current = cleanHtml;
  setForm(p => ({ ...p, html_content: cleanHtml }));
}}
          onKeyUp={(e) => {
            // Save cursor position (character offset) — but we use Selection API
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              // Store selection range for variable insertion
              (window as any).__templateEditorRange = sel.getRangeAt(0).cloneRange();
            }
          }}
          onClick={(e) => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              (window as any).__templateEditorRange = sel.getRangeAt(0).cloneRange();
            }
          }}
ref={visualEditorRef}
          style={{
            width: "100%",
            minHeight: "297mm",
            outline: "none",
            padding: "0",
          }}
        />
      </div>
    </div>
  </div>
)}

           
          </div>

          {/* Detected Variables */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <SH icon={<Tag className="h-3 w-3" />} title="Variables in Template" color="text-amber-700" />
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {extractVars(form.html_content).length} found
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extractVars(form.html_content).map(v => {
                const cv = COMMON_VARS.find(c => c.name === v);
                return (
                  <span
                    key={v}
                    title={cv ? `${cv.label} → ${cv.example}` : v}
                    className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-mono font-semibold border border-amber-200"
                  >
                    {v}
                  </span>
                );
              })}
              {extractVars(form.html_content).length === 0 && (
                <p className="text-xs text-amber-600">
                  No variables yet. Click variables from right panel to insert them.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP PANEL - Only visible on desktop */}
        <div 
          className="hidden md:flex flex-col w-[260px] min-w-[260px] flex-shrink-0 border-l border-[#e9e6ff]"
          style={{ 
            background: "linear-gradient(180deg,#f8f7ff 0%,#f3f0ff 100%)",
          }}
        >
          {/* Panel Header */}
          <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #e9e6ff", background: "#fff", flexShrink: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-indigo-600 rounded-md">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-xs font-bold text-gray-700">Available Variables</span>
              <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {filteredVars.length}
              </span>
            </div>
            
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                placeholder="Search variables..."
                className="w-full h-7 pl-7 pr-3 bg-white border border-indigo-200 rounded-md text-[10px] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none"
                value={varSearch}
                onChange={e => setVarSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {VARIABLE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setVarCategory(cat)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap transition-all ${
                    varCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 border border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Variables List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {Object.entries(groupedVars).map(([category, vars]) => (
              <VariableCategory key={category} title={category}>
                {vars.map(v => {
                  const isUsed = extractVars(form.html_content).includes(v.name);
                  return (
                    <button
                      key={v.name}
                      onClick={() => toggleVariable(v.name)}
                      className={`w-full text-left p-2 rounded-lg mb-1 transition-all group
                        ${isUsed
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 shadow-sm"
                          : "bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-semibold text-gray-700">
                          {v.label}
                        </span>
                        {isUsed && (
                          <Check size={10} className="text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <code className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                          {'{{'}{v.name}{'}}'}
                        </code>
                        <span className="text-[8px] text-gray-400">
                          {v.example}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </VariableCategory>
            ))}
          </div>

          {/* Footer Hint */}
          <div className="p-2 border-t border-indigo-100 bg-white/50 text-center">
            <p className="text-[8px] text-gray-500">
              Click variable to add/remove from template
            </p>
          </div>
        </div>

        {/* MOBILE PANEL - Only visible on mobile */}
        <div className="md:hidden w-full border-t border-indigo-100">
          {/* Mobile Toggle Header */}
          <div 
            className="flex items-center justify-between p-3 bg-indigo-50 cursor-pointer"
            onClick={() => setShowVariables(!showVariables)}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">Available Variables</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {filteredVars.length}
              </span>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-indigo-600 transition-transform ${showVariables ? 'rotate-180' : ''}`} 
            />
          </div>

          {/* Mobile Variables Content - collapsible */}
          {showVariables && (
            <div className="max-h-[300px] overflow-y-auto p-3 bg-gradient-to-b from-[#f8f7ff] to-[#f3f0ff]">
              {/* Search */}
              <div className="relative mb-3 sticky top-0 bg-white p-2 z-10 rounded-md shadow-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  placeholder="Search variables..."
                  className="w-full h-9 pl-8 pr-3 bg-white border border-indigo-200 rounded-md text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none"
                  value={varSearch}
                  onChange={e => setVarSearch(e.target.value)}
                />
              </div>

              {/* Category Filter - horizontal scroll */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2">
                {VARIABLE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setVarCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      varCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-600 border border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Variables List */}
              <div className="space-y-4">
                {Object.entries(groupedVars).map(([category, vars]) => (
                  <div key={category}>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {vars.map(v => {
                        const isUsed = extractVars(form.html_content).includes(v.name);
                        return (
                          <button
                            key={v.name}
                            onClick={() => toggleVariable(v.name)}
                            className={`text-left p-3 rounded-lg transition-all
                              ${isUsed
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 shadow-sm"
                                : "bg-white hover:bg-indigo-50 border border-gray-200"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-700">
                                {v.label}
                              </span>
                              {isUsed && (
                                <Check size={14} className="text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded">
                                {'{{'}{v.name}{'}}'}
                              </code>
                              <span className="text-[10px] text-gray-500">
                                {v.example}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Footer Hint */}
              <div className="mt-4 p-2 bg-indigo-50 rounded-md text-center">
                <p className="text-[10px] text-indigo-600">
                  Tap variable to add/remove from template
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3 bg-gray-50 flex items-center justify-between">
        <div className="text-[10px] text-gray-500">
          {editingTpl && (
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              Version {editingTpl.version} → {editingTpl.version + 1}
            </span>
          )}
          <span className="ml-2 text-[9px] text-gray-400">A4 Size Ready</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(false)}
            className="h-8 px-4 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => openPreview(editingTpl, form.html_content)}
            className="h-8 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-semibold flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-4 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-white text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
            ) : (
              <><Save className="h-3.5 w-3.5" />{editingTpl ? "Update" : "Create"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* ══ PREVIEW MODAL with Print Option ═══════════════════════════════ */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div style={{
            width: "min(900px, 95vw)",
            height: "min(90vh, 860px)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5)",
          }}>
            {/* Header */}
          <div
  className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-3 py-2 flex items-center justify-between flex-wrap gap-2"
  style={{ color: "#fff", flexShrink: 0 }}
>
  {/* Left */}
  <div className="flex items-center gap-1.5 min-w-0">
    <Eye className="h-4 w-4 flex-shrink-0" />

    <span className="text-sm sm:text-base font-semibold truncate">
      Template Preview
    </span>

    <Badge className="hidden sm:flex bg-white/20 text-white border-0 text-[10px] px-2 py-0">
      Sample Data
    </Badge>
  </div>

  {/* Right */}
  <div className="flex items-center gap-1 flex-shrink-0">
    <button
      onClick={() => {
        const printWin = window.open("", "_blank", "width=900,height=700");
        if (!printWin) return;
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8"/>
              <title>Download</title>
              <style>
                *{box-sizing:border-box;}
                body{margin:0;padding:0;background:white;}
                @media print{
                  @page{size:A4;margin:10mm;}
                }
              </style>
            </head>
            <body>
              ${previewHtml}
              <script>
                window.onload=function(){
                  setTimeout(function(){
                    window.print();
                    window.onafterprint=function(){window.close();}
                  },400);
                };
              <\/script>
            </body>
          </html>
        `);
        printWin.document.close();
      }}
      className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
      title="Download"
    >
      <Download className="h-4 w-4" />
    </button>

    <button
      onClick={handlePrint}
      className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
      title="Print"
    >
      <Printer className="h-4 w-4" />
    </button>

    <button
      onClick={() => {
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(`
            <html>
              <head>
                <title>Preview</title>
                <style>
                  @media print {
                    body { margin:0; padding:0; }
                  }
                </style>
              </head>
              <body>${previewHtml}</body>
            </html>
          `);
          w.document.close();
        }
      }}
      className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
      title="Open"
    >
      <Eye className="h-4 w-4" />
    </button>

    <button
      onClick={() => setShowPreview(false)}
      className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
      title="Close"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
</div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#f1f5f9", padding: "20px" }}>
              {previewHtml ? (
                <div style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxWidth: "210mm", margin: "0 auto" }}>
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#94a3b8", flexDirection: "column", gap: "8px" }}>
                  <Eye className="h-10 w-10" />
                  <p className="text-sm">No content to preview</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: "10px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
<button
  onClick={() => {
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Download</title><style>*{box-sizing:border-box;}body{margin:0;padding:0;background:white;}@media print{@page{size:A4;margin:10mm;}}</style></head><body>${previewHtml}<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close();};},400);};<\/script></body></html>`);
    printWin.document.close();
  }}
  className="h-8 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
>
  <Download className="h-3.5 w-3.5" /> Download PDF
</button>
<button
  onClick={handlePrint}
  className="h-8 px-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
>
  <Printer className="h-3.5 w-3.5" /> Print
</button>
<button
  onClick={() => setShowPreview(false)}
                className="h-8 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VERSION HISTORY MODAL ════════════════════════════════════════════ */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowHistory(false); }}
        >
          <div style={{ width: "min(800px,95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)" }}>
            <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-2 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" /> Version History
                </h2>
                {historyTpl && <p className="text-xs text-orange-100">{historyTpl.name}</p>}
              </div>
              <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-full hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1, padding: "16px" }} className="space-y-3">
              {historyTpl && (() => {
                const current: VersionSnapshot = {
                  version:      historyTpl.version,
                  name:         historyTpl.name,
                  category:     historyTpl.category,
                  description:  historyTpl.description,
                  html_content: historyTpl.html_content,
                  variables:    historyTpl.variables,
                  logo_url:     historyTpl.logo_url,
                  change_notes: historyTpl.change_notes,
                  modified_by:  historyTpl.last_modified_by || "Admin",
                  saved_at:     historyTpl.updated_at,
                };
                const all = [current, ...(historyTpl.version_history || []).slice().reverse()];

                return all.map((v, idx) => (
                  <div key={`${v.version}-${idx}`}
                    className={`p-3 rounded-lg border-2 ${idx === 0 ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${idx === 0 ? "bg-green-600 text-white" : "bg-gray-500 text-white"}`}>
                          v{v.version}
                        </span>
                        {idx === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Current</span>}
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(v.saved_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[11px] text-gray-400">by {v.modified_by}</span>
                      </div>
                      {idx !== 0 && (
                        <button onClick={() => handleRestoreVersion(historyTpl.id, v.version)}
                          className="h-7 px-3 bg-orange-600 text-white rounded-md text-[11px] font-bold hover:bg-orange-700 flex-shrink-0">
                          Restore
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="font-semibold text-gray-600">Category:</span> {v.category}</div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-600">Variables:</span>{" "}
                        <span className="text-blue-600 font-mono text-[10px]">{(v.variables || []).join(", ")}</span>
                      </div>
                      {v.change_notes && (
                        <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-2">
                          <span className="font-semibold text-gray-600">Notes:</span> {v.change_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}