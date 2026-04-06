// "use client";

// /**
//  * TemplateCenterPage.tsx
//  * Roomac Admin – Template Center
//  * Fully integrated with backend API (templateApi.ts)
//  * No static data – all operations use API calls.
//  */

// import React, { useState, useEffect, useCallback, useRef, useMemo, FC, ReactNode, ChangeEvent } from "react";
// import Editor from "react-simple-code-editor";
// import Prism from "prismjs";
// import "prismjs/themes/prism-tomorrow.css";
// import "prismjs/components/prism-markup";
// import {
//   getTemplates,
//   createTemplate,
//   updateTemplate,
//   deleteTemplate,
//   approveTemplate,
//   rejectTemplate,
//   duplicateTemplate,
//   bulkDeleteTemplates,
//   getCategoryVariables,
//   type MessageTemplate,
//   type TemplateChannel,
//   type TemplateCategory,
//   type TemplateStatus,
//   type TemplatePriority,
//   type CreateTemplatePayload,
// } from "@/lib/templateApi";
// import { useAuth } from "@/context/authContext";
// import { toast } from "sonner";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES (re‑exported for convenience)
// // ─────────────────────────────────────────────────────────────────────────────

// type Channel = TemplateChannel;
// type Category = TemplateCategory;
// type Status = TemplateStatus;
// type Priority = TemplatePriority;

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────────────────────

// const SAMPLE_DATA: Record<string, string> = {
//   tenant_name: "Amit Sharma",
//   tenant_phone: "+91 98765 43210",
//   tenant_email: "amit.sharma@email.com",
//   property_name: "Roomac Co-living Wakad",
//   room_number: "A-204",
//   bed_number: "2",
//   move_in_date: "15 Mar 2024",
//   rent_amount: "12,500",
//   security_deposit: "25,000",
//   company_name: "Roomac Co-living",
//   company_address: "Wakad, Pune - 411057",
//   aadhaar_number: "XXXX-XXXX-1234",
//   pan_number: "ABCDE1234F",
//   emergency_contact_name: "Priya Sharma",
//   emergency_phone: "+91 98765 43211",
//   payment_mode: "UPI (Auto-debit)",
//   date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
//   document_number: `DOC-${Date.now().toString().slice(-6)}`,
//   otp: "482931",
//   expiry_minutes: "10",
//   verify_link: "https://roomac.in/verify/abc123",
//   expiry_hours: "24",
//   amount: "12,500",
//   receipt_id: "RCT-2024-1892",
//   payment_date: "15 Mar 2024",
//   due_date: "1 Apr 2024",
//   name: "Amit",
//   location: "Wakad, Pune",
//   price: "12,500/mo",
//   cta_url: "https://roomac.in",
//   discount: "10%",
//   request_id: "REQ-4821",
//   status: "Completed",
//   staff_name: "Ravi Kumar",
//   checkin_date: "15 Mar 2024",
//   notice_message: "Water supply maintenance on Sunday 8am–12pm",
//   effective_date: "20 Mar 2024",
//   late_fee: "500",
//   invoice_no: "INV-2025-042",
// };

// const CHANNEL_VARIABLES: Record<string, string[]> = {
//   otp: ["otp", "tenant_name", "expiry_minutes"],
//   payment: ["tenant_name", "amount", "property_name", "receipt_id", "payment_date", "due_date"],
//   verification: ["tenant_name", "verify_link", "otp", "expiry_hours"],
//   marketing: ["name", "property_name", "location", "price", "cta_url", "discount"],
//   alert: ["tenant_name", "request_id", "status", "staff_name", "property_name"],
//   reminder: ["tenant_name", "amount", "due_date", "property_name", "room_number"],
//   welcome: ["tenant_name", "property_name", "checkin_date", "room_number", "staff_name"],
//   notice: ["tenant_name", "notice_message", "effective_date", "property_name"],
// };

// const ALL_EMAIL_VARS = Object.keys(SAMPLE_DATA);

// const CATEGORIES: { key: Category; label: string }[] = [
//   { key: "otp", label: "OTP" },
//   { key: "payment", label: "Payment" },
//   { key: "verification", label: "Verification" },
//   { key: "marketing", label: "Marketing" },
//   { key: "alert", label: "Alert" },
//   { key: "reminder", label: "Reminder" },
//   { key: "welcome", label: "Welcome" },
//   { key: "notice", label: "Notice" },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // UTILITY FUNCTIONS
// // ─────────────────────────────────────────────────────────────────────────────

// function renderWithSample(html: string): string {
//   let r = html;
//   Object.entries(SAMPLE_DATA).forEach(([k, v]) => {
//     r = r.replace(new RegExp(`\\{${k}\\}`, "g"), v);
//     r = r.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
//   });
//   return r;
// }

// function extractVars(content: string): string[] {
//   const plain = content.replace(/<[^>]*>/g, "");
//   return [
//     ...new Set(
//       (plain.match(/\{(\w+)\}/g) || []).map((v) => v.replace(/[{}]/g, ""))
//     ),
//   ];
// }

// function stripHtml(html: string): string {
//   return html
//     .replace(/<[^>]*>/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function getCategoryLabel(cat: string): string {
//   return CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // GLOBAL CSS (injected once)
// // ─────────────────────────────────────────────────────────────────────────────

// const GLOBAL_CSS = `
// @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');

// .tc-root *, .tc-root *::before, .tc-root *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
// .tc-root { --navy:#1D2B53; --blue:#1a56db; --cyan:#06b6d4; --gold:#FFC107;
//   --green:#22c55e; --green-bg:#dcfce7; --green-txt:#166534;
//   --amber:#f59e0b; --amber-bg:#fef3c7; --amber-txt:#92400e;
//   --red:#ef4444; --red-bg:#fee2e2; --red-txt:#991b1b;
//   --purple:#8b5cf6; --purple-bg:#ede9fe; --purple-txt:#6d28d9;
//   --wa-dark:#075E54; --wa-green:#25D366;
//   --s1:#fff; --s2:#f8fafc; --s3:#f1f5f9; --s4:#e8edf5;
//   --b1:#e2e8f0; --b2:#cbd5e1;
//   --t1:#0f172a; --t2:#334155; --t3:#64748b; --t4:#94a3b8;
//   --blue-bg:#eff6ff; --blue-bdr:#bfdbfe;
//   --sh-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
//   --sh-md:0 4px 16px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);
//   --sh-lg:0 12px 40px rgba(0,0,0,.12),0 4px 8px rgba(0,0,0,.06);
//   --sh-xl:0 20px 60px rgba(0,0,0,.16);
//   --r1:6px; --r2:10px; --r3:14px; --r4:20px; --rf:999px;
// }

// /* main container */
// .tc-content { background:var(--s3); min-height:100vh; width:100%; padding:20px 24px; }
// .tc-main-card { background:var(--s1); border-radius:var(--r4); box-shadow:var(--sh-sm); overflow:hidden; }

// /* channel tabs */
// .tc-ch-bar { background:var(--s1); border-bottom:1px solid var(--b1); padding:0 20px; display:flex; align-items:flex-end; gap:2px; overflow-x:auto; }
// .tc-ch-tab { display:flex; align-items:center; gap:7px; padding:12px 16px; border:none; border-bottom:2.5px solid transparent; background:transparent; color:var(--t3); font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; }
// .tc-ch-tab:hover { color:var(--t1); }
// .tc-ch-tab.active { color:var(--blue); border-bottom-color:var(--blue); font-weight:600; }
// .tc-ch-count { font-size:10px; font-weight:700; padding:2px 7px; border-radius:var(--rf); }
// .tc-ch-tab.active .tc-ch-count { background:var(--blue); color:#fff; }
// .tc-ch-tab:not(.active) .tc-ch-count { background:var(--s3); color:var(--t3); }
// .tc-tab-actions { margin-left:auto; display:flex; align-items:center; gap:8px; padding-bottom:8px; }

// /* filters */
// .tc-filters { background:var(--s1); border-bottom:1px solid var(--b1); padding:10px 20px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
// .tc-status-pills { display:flex; gap:4px; }
// .tc-status-pill { display:flex; align-items:center; gap:5px; padding:6px 12px; border-radius:var(--rf); border:none; font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; }
// .tc-status-pill.active { background:linear-gradient(135deg,var(--blue),var(--cyan)); color:#fff; box-shadow:var(--sh-sm); }
// .tc-status-pill:not(.active) { background:transparent; color:var(--t3); }
// .tc-status-pill:not(.active):hover { background:var(--s3); }
// .tc-pill-count { font-size:10px; font-weight:700; padding:1px 6px; border-radius:var(--rf); }
// .tc-status-pill.active .tc-pill-count { background:rgba(255,255,255,.25); color:#fff; }
// .tc-status-pill:not(.active) .tc-pill-count { background:var(--s3); color:var(--t3); }
// .tc-filters-r { margin-left:auto; display:flex; align-items:center; gap:8px; }
// .tc-search-wrap { position:relative; }
// .tc-search-wrap input { padding:7px 10px 7px 30px; border:1px solid var(--b1); border-radius:var(--rf); font-size:12px; font-family:inherit; color:var(--t1); outline:none; width:200px; background:var(--s2); }
// .tc-search-wrap input:focus { border-color:var(--blue); background:var(--s1); }
// .tc-search-ic { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--t4); font-size:13px; pointer-events:none; }
// .tc-filter-sel { height:34px; padding:0 10px; border:1px solid var(--b1); border-radius:var(--rf); font-size:12px; font-family:inherit; color:var(--t2); background:var(--s2); outline:none; cursor:pointer; }
// .tc-btn-refresh { width:34px; height:34px; border:1px solid var(--b1); border-radius:var(--rf); background:var(--s1); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--t3); transition:all .15s; }
// .tc-btn-refresh:hover { background:var(--s3); }
// .tc-btn-create { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,var(--blue),var(--cyan)); color:#fff; border:none; border-radius:var(--rf); padding:7px 16px; font-size:12px; font-weight:600; cursor:pointer; box-shadow:var(--sh-sm); transition:all .15s; }
// .tc-btn-create:hover { box-shadow:var(--sh-md); transform:translateY(-1px); }

// /* bulk bar */
// .tc-bulk-bar { margin:10px 16px 0; background:var(--s1); border:1px solid var(--blue-bdr); border-radius:var(--r3); padding:10px 16px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--sh-sm); }
// .tc-bulk-badge { background:linear-gradient(135deg,var(--blue),var(--cyan)); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:var(--rf); }
// .tc-btn-clr { display:flex; align-items:center; gap:4px; background:transparent; border:none; color:var(--t3); font-size:12px; cursor:pointer; padding:4px 8px; border-radius:var(--r2); }
// .tc-btn-clr:hover { background:var(--s3); }
// .tc-btn-bdel { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border:none; border-radius:var(--rf); padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; }

// /* grid & cards */
// .tc-grid { padding:16px; }
// .tc-grid-inner { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
// .tc-card { background:var(--s1); border:1px solid var(--b1); border-radius:var(--r4); padding:18px; cursor:pointer; transition:all .2s; position:relative; overflow:hidden; }
// .tc-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:var(--r4) var(--r4) 0 0; opacity:0; transition:opacity .2s; }
// .tc-card:hover { box-shadow:var(--sh-lg); transform:translateY(-2px); }
// .tc-card:hover::before { opacity:1; }
// .tc-card.selected { border-color:var(--blue-bdr); background:var(--blue-bg); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
// .tc-card.ch-sms::before    { background:linear-gradient(90deg,#3b82f6,#06b6d4); }
// .tc-card.ch-whatsapp::before { background:linear-gradient(90deg,#22c55e,#10b981); }
// .tc-card.ch-email::before  { background:linear-gradient(90deg,#8b5cf6,#ec4899); }
// .tc-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; gap:8px; }
// .tc-card-left { display:flex; align-items:center; gap:10px; }
// .tc-ch-badge { width:36px; height:36px; border-radius:var(--r2); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
// .tc-ch-badge.sms      { background:#dbeafe; }
// .tc-ch-badge.whatsapp { background:var(--green-bg); }
// .tc-ch-badge.email    { background:var(--purple-bg); }
// .tc-card-name { font-size:14px; font-weight:700; color:var(--t1); margin-bottom:10px; line-height:1.3; }
// .tc-card-tags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px; }
// .tc-card-vars { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px; }
// .tc-card-exc { font-size:11px; color:var(--t3); line-height:1.6; background:var(--s2); border:1px solid var(--b1); border-radius:var(--r2); padding:8px 10px; margin-bottom:14px; font-style:italic; }
// .tc-card-foot { display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--b1); padding-top:12px; }
// .tc-card-date { font-size:10px; color:var(--t4); }

// /* tags */
// .tc-tag { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; padding:3px 8px; border-radius:var(--rf); border:1px solid; }
// .tc-tag-otp          { background:#fee2e2; color:#991b1b; border-color:#fca5a5; }
// .tc-tag-payment      { background:var(--green-bg); color:var(--green-txt); border-color:#86efac; }
// .tc-tag-verification { background:#dbeafe; color:#1e40af; border-color:var(--blue-bdr); }
// .tc-tag-marketing    { background:var(--purple-bg); color:var(--purple-txt); border-color:#c4b5fd; }
// .tc-tag-alert        { background:#ffedd5; color:#9a3412; border-color:#fdba74; }
// .tc-tag-reminder     { background:var(--amber-bg); color:var(--amber-txt); border-color:#fcd34d; }
// .tc-tag-welcome      { background:#ccfbf1; color:#0f766e; border-color:#5eead4; }
// .tc-tag-notice       { background:var(--s3); color:var(--t3); border-color:var(--b2); }
// .tc-tag-approved { background:var(--green-bg); color:var(--green-txt); border-color:#86efac; }
// .tc-tag-pending  { background:var(--amber-bg); color:var(--amber-txt); border-color:#fcd34d; }
// .tc-tag-rejected { background:var(--red-bg); color:var(--red-txt); border-color:#fca5a5; }
// .tc-tag-urgent   { background:#fee2e2; color:#991b1b; border-color:#fca5a5; }
// .tc-tag-high     { background:#fff7ed; color:#9a3412; border-color:#fdba74; }
// .tc-var-chip { font-size:10px; background:var(--s3); color:var(--t3); border:1px solid var(--b1); padding:2px 7px; border-radius:var(--r2); font-family:'DM Mono',monospace; }

// /* buttons */
// .tc-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:var(--r2); font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .15s; }
// .tc-btn-primary { background:linear-gradient(135deg,var(--blue),var(--cyan)); color:#fff; box-shadow:var(--sh-sm); }
// .tc-btn-primary:hover { box-shadow:var(--sh-md); transform:translateY(-1px); }
// .tc-btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
// .tc-btn-outline { background:transparent; border:1px solid var(--b2); color:var(--t2); }
// .tc-btn-outline:hover { background:var(--s3); }
// .tc-btn-danger { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; }
// .tc-btn-danger:disabled { opacity:.6; cursor:not-allowed; }
// .tc-btn-ghost { background:transparent; border:none; color:var(--t3); }
// .tc-btn-ghost:hover { background:var(--s3); border-radius:var(--r1); }
// .tc-btn-prev { display:flex; align-items:center; gap:4px; background:transparent; border:none; color:var(--blue); font-size:11px; font-weight:600; cursor:pointer; padding:4px 10px; border-radius:var(--rf); }
// .tc-btn-prev:hover { background:var(--blue-bg); }

// /* dropdown */
// .tc-dd-wrap { position:relative; }
// .tc-dd-btn { width:28px; height:28px; border-radius:var(--rf); border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--t4); font-size:18px; font-weight:700; }
// .tc-dd-btn:hover { background:var(--s3); }
// .tc-dropdown { position:absolute; right:0; top:32px; background:var(--s1); border:1px solid var(--b1); border-radius:var(--r3); box-shadow:var(--sh-lg); z-index:300; min-width:160px; overflow:hidden; }
// .tc-dd-label { padding:8px 14px 4px; font-size:10px; font-weight:700; color:var(--blue); text-transform:uppercase; letter-spacing:.5px; }
// .tc-dropdown hr { border:none; border-top:1px solid var(--b1); margin:4px 0; }
// .tc-dd-item { display:flex; align-items:center; gap:8px; padding:8px 14px; font-size:12px; color:var(--t2); cursor:pointer; border:none; background:transparent; width:100%; text-align:left; transition:background .1s; }
// .tc-dd-item:hover { background:var(--s3); }
// .tc-dd-item.danger { color:var(--red-txt); }
// .tc-dd-item.danger:hover { background:var(--red-bg); }
// .tc-dd-item.success { color:var(--green-txt); }
// .tc-dd-item.success:hover { background:var(--green-bg); }

// /* modals */
// .tc-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
// .tc-modal { background:var(--s1); border-radius:var(--r4); box-shadow:var(--sh-xl); max-height:92vh; overflow:hidden; display:flex; flex-direction:column; animation:tcModalIn .2s ease; }
// @keyframes tcModalIn { from { opacity:0; transform:scale(.96) translateY(8px); } to { opacity:1; transform:none; } }
// .tc-modal-hdr { padding:20px 24px; background:linear-gradient(135deg,var(--blue),var(--cyan)); display:flex; align-items:flex-start; justify-content:space-between; }
// .tc-modal-hdr.danger { background:linear-gradient(135deg,#ef4444,#dc2626); }
// .tc-modal-title { font-size:15px; font-weight:700; color:#fff; margin:0; display:flex; align-items:center; gap:8px; }
// .tc-modal-desc  { font-size:11px; color:rgba(255,255,255,.7); margin-top:3px; }
// .tc-modal-close { width:28px; height:28px; border:none; background:rgba(255,255,255,.2); border-radius:var(--rf); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; flex-shrink:0; }
// .tc-modal-close:hover { background:rgba(255,255,255,.3); }
// .tc-modal-body  { overflow-y:auto; flex:1; }
// .tc-modal-foot  { padding:16px 24px; border-top:1px solid var(--b1); display:flex; align-items:center; justify-content:flex-end; gap:10px; }

// /* form fields */
// .tc-section  { padding:20px 24px; border-bottom:1px solid var(--b1); }
// .tc-section:last-of-type { border-bottom:none; }
// .tc-row      { display:grid; gap:14px; margin-bottom:14px; }
// .tc-row.c2   { grid-template-columns:1fr 1fr; }
// .tc-row.c3   { grid-template-columns:1fr 1fr 1fr; }
// .tc-field    { display:flex; flex-direction:column; gap:5px; }
// .tc-field label { font-size:11px; font-weight:700; color:var(--t2); text-transform:uppercase; letter-spacing:.5px; }
// .tc-field input,
// .tc-field select,
// .tc-field textarea { padding:9px 12px; border:1px solid var(--b1); border-radius:var(--r2); font-size:13px; font-family:inherit; color:var(--t1); background:var(--s1); outline:none; transition:border-color .15s; }
// .tc-field input:focus,
// .tc-field select:focus,
// .tc-field textarea:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(26,86,219,.08); }
// .tc-field textarea { resize:vertical; line-height:1.7; font-family:'DM Mono',monospace; }
// .tc-vars-panel { background:var(--s2); border:1px solid var(--b1); border-radius:var(--r2); padding:12px 14px; }
// .tc-vars-title { font-size:11px; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
// .tc-var-chips-row { display:flex; flex-wrap:wrap; gap:6px; }
// .tc-var-chip-btn { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:var(--rf); border:1px solid var(--b2); background:var(--s1); color:var(--t2); font-size:11px; font-family:'DM Mono',monospace; cursor:pointer; transition:all .12s; }
// .tc-var-chip-btn:hover { background:var(--blue-bg); border-color:var(--blue); color:var(--blue); }
// .tc-var-dot { width:5px; height:5px; border-radius:50%; background:var(--blue); flex-shrink:0; }
// .tc-detected { background:var(--blue-bg); border:1px solid var(--blue-bdr); border-radius:var(--r2); padding:10px 14px; }
// .tc-detected-title { font-size:11px; font-weight:700; color:var(--blue); margin-bottom:8px; }
// .tc-switch-row { display:flex; align-items:center; gap:10px; }
// .tc-switch     { position:relative; width:38px; height:22px; flex-shrink:0; }
// .tc-switch input { opacity:0; width:0; height:0; position:absolute; }
// .tc-sw-track   { position:absolute; inset:0; background:#d1d5db; border-radius:var(--rf); cursor:pointer; transition:background .2s; }
// .tc-switch input:checked + .tc-sw-track { background:var(--blue); }
// .tc-sw-thumb   { position:absolute; top:3px; left:3px; width:16px; height:16px; background:#fff; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); pointer-events:none; }
// .tc-switch input:checked ~ .tc-sw-thumb { transform:translateX(16px); }
// .tc-sw-label   { font-size:13px; color:var(--t2); font-weight:500; cursor:pointer; }

// /* rich editor */
// .tc-rich { border:1px solid var(--b1); border-radius:var(--r3); overflow:hidden; box-shadow:var(--sh-sm); }
// .tc-toolbar { background:var(--s2); border-bottom:1px solid var(--b1); }
// .tc-tb-row  { display:flex; align-items:center; gap:2px; padding:6px 10px; flex-wrap:wrap; row-gap:4px; }
// .tc-tb-sep  { width:1px; height:18px; background:var(--b2); margin:0 4px; flex-shrink:0; }
// .tc-tb-btn  { width:26px; height:26px; border:none; background:transparent; border-radius:5px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--t3); font-size:13px; transition:all .1s; flex-shrink:0; }
// .tc-tb-btn:hover  { background:var(--s3); color:var(--t1); }
// .tc-tb-btn.on     { background:var(--blue); color:#fff; }
// .tc-tb-btn.bold   { font-weight:700; }
// .tc-tb-btn.italic { font-style:italic; }
// .tc-tb-btn.under  { text-decoration:underline; }
// .tc-tb-btn.strike { text-decoration:line-through; }
// .tc-tb-sel { height:26px; border:1px solid var(--b1); border-radius:5px; font-size:11px; font-family:inherit; color:var(--t2); background:var(--s1); outline:none; padding:0 6px; cursor:pointer; }
// .tc-tb-sel-w { min-width:110px; }
// .tc-tb-sel-n { width:64px; }
// .tc-mode-btn { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:5px; border:none; font-size:11px; font-weight:600; cursor:pointer; transition:all .1s; }
// .tc-mode-btn.code { background:var(--blue); color:#fff; }
// .tc-mode-btn.visual { background:transparent; border:1px solid var(--b1); color:var(--t3); }
// .tc-var-insert-sel { height:26px; border:1px solid var(--blue-bdr); border-radius:5px; font-size:11px; font-family:inherit; color:var(--blue); background:var(--blue-bg); outline:none; padding:0 6px; cursor:pointer; min-width:150px; margin-left:auto; }
// .tc-code-area { background:#1e1e2e; min-height:380px; max-height:460px; overflow-y:auto; }
// .tc-code-ta   { width:100%; min-height:380px; background:transparent; border:none; outline:none; color:#cdd6f4; font-family:'DM Mono',monospace; font-size:13px; line-height:1.7; padding:16px; resize:none; tab-size:2; }
// .tc-preview-area { background:#e8eaed; min-height:420px; max-height:480px; overflow-y:auto; padding:20px; }
// .tc-preview-page { background:#fff; max-width:640px; margin:0 auto; border-radius:var(--r2); box-shadow:0 4px 24px rgba(0,0,0,.12); overflow:hidden; }

// /* channel previews */
// .tc-email-prev { background:var(--s2); border:1px solid var(--b1); border-radius:var(--r3); overflow:hidden; }
// .tc-wa-prev    { border:1px solid var(--b1); border-radius:var(--r3); overflow:hidden; }
// .tc-sms-prev   { background:var(--s2); border:1px solid var(--b1); border-radius:var(--r3); overflow:hidden; }

// /* toast */
// .tc-toasts { position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
// .tc-toast   { display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:var(--r3); box-shadow:var(--sh-lg); font-size:13px; font-weight:500; animation:tcToastIn .22s ease; min-width:240px; max-width:340px; }
// @keyframes tcToastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
// .tc-toast.success { background:var(--green-bg); border:1px solid #86efac; color:var(--green-txt); }
// .tc-toast.error   { background:var(--red-bg);   border:1px solid #fca5a5; color:var(--red-txt); }
// .tc-toast.info    { background:var(--blue-bg);  border:1px solid var(--blue-bdr); color:#1e40af; }
// .tc-toast-icon { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; color:#fff; }
// .tc-toast.success .tc-toast-icon { background:var(--green); }
// .tc-toast.error   .tc-toast-icon { background:var(--red); }
// .tc-toast.info    .tc-toast-icon { background:var(--blue); }

// /* empty state */
// .tc-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:80px 40px; text-align:center; }
// .tc-empty-icon { font-size:52px; opacity:.4; }
// .tc-empty h3 { font-size:16px; font-weight:700; color:var(--t2); }
// .tc-empty p  { font-size:13px; color:var(--t4); max-width:300px; }

// /* responsive */
// @media (max-width:640px) {
//   .tc-grid-inner { grid-template-columns:1fr; }
//   .tc-row.c2, .tc-row.c3 { grid-template-columns:1fr; }
//   .tc-filters { flex-direction:column; align-items:stretch; }
//   .tc-filters-r { margin-left:0; justify-content:space-between; }
// }
// `;

// function useGlobalStyle(css: string): void {
//   useEffect(() => {
//     const id = "tc-global-style";
//     if (document.getElementById(id)) return;
//     const el = document.createElement("style");
//     el.id = id;
//     el.textContent = css;
//     document.head.appendChild(el);
//   }, [css]);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TOAST (using sonner, but we keep custom toasts for consistency)
// // ─────────────────────────────────────────────────────────────────────────────

// // We'll use sonner directly in the component, so no need for custom toast hook.
// // The existing code uses toast from sonner. We'll keep that.

// // ─────────────────────────────────────────────────────────────────────────────
// // DROPDOWN
// // ─────────────────────────────────────────────────────────────────────────────

// interface DropItem {
//   type?: "label" | "sep";
//   label?: string;
//   icon?: string;
//   variant?: "danger" | "success" | "";
//   onClick?: () => void;
// }

// const Dropdown: FC<{ open: boolean; onClose: () => void; items: DropItem[] }> = ({
//   open,
//   onClose,
//   items,
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     if (!open) return;
//     const h = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) onClose();
//     };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, [open, onClose]);
//   if (!open) return null;
//   return (
//     <div className="tc-dropdown" ref={ref}>
//       {items.map((item, i) => {
//         if (item.type === "label")
//           return (
//             <div key={i} className="tc-dd-label">
//               {item.label}
//             </div>
//           );
//         if (item.type === "sep") return <hr key={i} />;
//         return (
//           <button
//             key={i}
//             className={`tc-dd-item ${item.variant ?? ""}`}
//             onClick={() => {
//               item.onClick?.();
//               onClose();
//             }}
//           >
//             {item.icon && <span>{item.icon}</span>}
//             {item.label}
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // EMAIL RICH EDITOR
// // ─────────────────────────────────────────────────────────────────────────────

// interface RichEditorProps {
//   value: string;
//   onChange: (v: string) => void;
//   availableVariables: string[];
// }

// const EmailRichEditor: FC<RichEditorProps> = ({ value, onChange, availableVariables }) => {
//   const [isCodeView, setIsCodeView] = useState(true);
//   const [history, setHistory] = useState<string[]>([value]);
//   const [histIdx, setHistIdx] = useState(0);
//   const taRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     if (value !== history[histIdx]) {
//       const nh = history.slice(0, histIdx + 1);
//       nh.push(value);
//       setHistory(nh);
//       setHistIdx(nh.length - 1);
//     }
//   }, [value, history, histIdx]);

//   const update = (v: string) => onChange(v);

//   const insertAtCursor = useCallback(
//     (text: string) => {
//       const ta = taRef.current;
//       if (!ta) return update(value + text);
//       const s = ta.selectionStart;
//       const e = ta.selectionEnd;
//       const nv = value.slice(0, s) + text + value.slice(e);
//       update(nv);
//       setTimeout(() => {
//         ta.focus();
//         ta.selectionStart = ta.selectionEnd = s + text.length;
//       }, 0);
//     },
//     [value]
//   );

//   const wrapSelection = useCallback(
//     (before: string, after: string) => {
//       const ta = taRef.current;
//       if (!ta) return;
//       const s = ta.selectionStart;
//       const e = ta.selectionEnd;
//       const sel = value.slice(s, e);
//       const nv = value.slice(0, s) + before + sel + after + value.slice(e);
//       update(nv);
//       setTimeout(() => {
//         ta.focus();
//         ta.selectionStart = s + before.length;
//         ta.selectionEnd = s + before.length + sel.length;
//       }, 0);
//     },
//     [value]
//   );

//   const execFormat = useCallback(
//     (cmd: string) => {
//       if (!isCodeView) return;
//       const map: Record<string, [string, string]> = {
//         bold: ["<strong>", "</strong>"],
//         italic: ["<em>", "</em>"],
//         underline: ["<u>", "</u>"],
//         strike: ["<del>", "</del>"],
//       };
//       if (map[cmd]) {
//         wrapSelection(map[cmd][0], map[cmd][1]);
//         return;
//       }
//       switch (cmd) {
//         case "ul":
//           insertAtCursor("\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n");
//           break;
//         case "ol":
//           insertAtCursor("\n<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ol>\n");
//           break;
//         case "table":
//           insertAtCursor(
//             '\n<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">\n  <tr><th>Header 1</th><th>Header 2</th></tr>\n  <tr><td>Cell 1</td><td>Cell 2</td></tr>\n</table>\n'
//           );
//           break;
//         case "hr":
//           insertAtCursor('\n<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;"/>\n');
//           break;
//         case "link": {
//           const url = prompt("Enter URL:", "https://");
//           if (url) wrapSelection(`<a href="${url}" style="color:#1a56db;">`, "</a>");
//           break;
//         }
//         case "image": {
//           const url = prompt("Enter image URL:", "https://");
//           if (url)
//             insertAtCursor(
//               `<img src="${url}" style="max-width:100%;border-radius:8px;" alt="image"/>`
//             );
//           break;
//         }
//       }
//     },
//     [isCodeView, wrapSelection, insertAtCursor]
//   );

//   const applyHeading = (level: string) => {
//     if (!isCodeView || !level) return;
//     wrapSelection(`<h${level} style="margin:12px 0;">`, `</h${level}>`);
//   };
//   const applyFont = (font: string) => {
//     if (!isCodeView) return;
//     wrapSelection(`<span style="font-family:'${font}',sans-serif;">`, "</span>");
//   };
//   const applySize = (size: string) => {
//     if (!isCodeView) return;
//     wrapSelection(`<span style="font-size:${size}px;">`, "</span>");
//   };
//   const applyColor = (color: string) => {
//     if (!isCodeView) return;
//     wrapSelection(`<span style="color:${color};">`, "</span>");
//   };
//   const applyBg = (color: string) => {
//     if (!isCodeView) return;
//     wrapSelection(
//       `<span style="background:${color};padding:0 3px;border-radius:3px;">`,
//       "</span>"
//     );
//   };
//   const applyAlign = (align: string) => {
//     if (!isCodeView) return;
//     wrapSelection(`<div style="text-align:${align};">`, "</div>");
//   };

//   const undo = () => {
//     if (histIdx > 0) {
//       setHistIdx(histIdx - 1);
//       onChange(history[histIdx - 1]);
//     }
//   };
//   const redo = () => {
//     if (histIdx < history.length - 1) {
//       setHistIdx(histIdx + 1);
//       onChange(history[histIdx + 1]);
//     }
//   };

//   const previewHtml = renderWithSample(value);

//   const TB = ({ title, onClick, children, className = "" }: any) => (
//     <button className={`tc-tb-btn ${className}`} title={title} onClick={onClick}>
//       {children}
//     </button>
//   );

//   return (
//     <div className="tc-rich">
//       <div className="tc-toolbar">
//         <div className="tc-tb-row">
//           <TB title="Undo" onClick={undo}>↩</TB>
//           <TB title="Redo" onClick={redo}>↪</TB>
//           <span className="tc-tb-sep" />
//           <select
//             className="tc-tb-sel"
//             style={{ width: 96 }}
//             onChange={(e) => {
//               applyHeading(e.target.value);
//               e.target.value = "";
//             }}
//           >
//             <option value="">Paragraph</option>
//             {["1", "2", "3", "4"].map((h) => (
//               <option key={h} value={h}>Heading {h}</option>
//             ))}
//           </select>
//           <select
//             className="tc-tb-sel tc-tb-sel-w"
//             onChange={(e) => {
//               applyFont(e.target.value);
//               e.target.value = "DM Sans";
//             }}
//           >
//             {["DM Sans", "Arial", "Georgia", "Courier New", "Times New Roman", "Verdana"].map((f) => (
//               <option key={f} value={f}>{f}</option>
//             ))}
//           </select>
//           <select
//             className="tc-tb-sel tc-tb-sel-n"
//             onChange={(e) => {
//               applySize(e.target.value);
//               e.target.value = "14";
//             }}
//           >
//             {[10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36].map((s) => (
//               <option key={s} value={s}>{s}px</option>
//             ))}
//           </select>
//           <span className="tc-tb-sep" />
//           <TB title="Bold" onClick={() => execFormat("bold")} className="bold">B</TB>
//           <TB title="Italic" onClick={() => execFormat("italic")} className="italic">I</TB>
//           <TB title="Underline" onClick={() => execFormat("underline")} className="under">U</TB>
//           <TB title="Strikethrough" onClick={() => execFormat("strike")} className="strike">S</TB>
//           <span className="tc-tb-sep" />
//           <TB title="Align Left" onClick={() => applyAlign("left")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//               <path d="M1 2h12M1 5h8M1 8h12M1 11h6" />
//             </svg>
//           </TB>
//           <TB title="Align Center" onClick={() => applyAlign("center")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//               <path d="M1 2h12M3 5h8M1 8h12M4 11h6" />
//             </svg>
//           </TB>
//           <TB title="Align Right" onClick={() => applyAlign("right")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//               <path d="M1 2h12M5 5h8M1 8h12M7 11h6" />
//             </svg>
//           </TB>
//           <TB title="Justify" onClick={() => applyAlign("justify")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//               <path d="M1 2h12M1 5h12M1 8h12M1 11h12" />
//             </svg>
//           </TB>
//           <span className="tc-tb-sep" />
//           <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
//             <span style={{ fontSize: 12, color: "var(--t3)", marginRight: 2 }}>A</span>
//             <input
//               type="color"
//               defaultValue="#1a56db"
//               style={{ width: 18, height: 18, border: "none", background: "none", cursor: "pointer", padding: 0 }}
//               onChange={(e) => applyColor(e.target.value)}
//             />
//           </label>
//           <label style={{ display: "flex", alignItems: "center", cursor: "pointer", marginLeft: 2 }}>
//             <span style={{ fontSize: 11, color: "var(--t3)", marginRight: 2 }}>⬛</span>
//             <input
//               type="color"
//               defaultValue="#fef3c7"
//               style={{ width: 18, height: 18, border: "none", background: "none", cursor: "pointer", padding: 0 }}
//               onChange={(e) => applyBg(e.target.value)}
//             />
//           </label>
//           <span className="tc-tb-sep" />
//           <TB title="Bullet list" onClick={() => execFormat("ul")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
//               <circle cx="2" cy="3.5" r="1.2" />
//               <rect x="5" y="2.5" width="8" height="2" rx="1" />
//               <circle cx="2" cy="7" r="1.2" />
//               <rect x="5" y="6" width="8" height="2" rx="1" />
//               <circle cx="2" cy="10.5" r="1.2" />
//               <rect x="5" y="9.5" width="8" height="2" rx="1" />
//             </svg>
//           </TB>
//           <TB title="Numbered list" onClick={() => execFormat("ol")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
//               <text x="0" y="4.5" fontSize="4.5" fontWeight="700">1.</text>
//               <rect x="5" y="2.5" width="8" height="2" rx="1" />
//               <text x="0" y="8.5" fontSize="4.5" fontWeight="700">2.</text>
//               <rect x="5" y="6" width="8" height="2" rx="1" />
//               <text x="0" y="12.5" fontSize="4.5" fontWeight="700">3.</text>
//               <rect x="5" y="9.5" width="8" height="2" rx="1" />
//             </svg>
//           </TB>
//           <TB title="Table" onClick={() => execFormat("table")}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//               <rect x="1" y="1" width="12" height="12" rx="1.5" />
//               <path d="M1 5h12M1 9h12M5 1v12M9 1v12" />
//             </svg>
//           </TB>
//           <TB title="Horizontal rule" onClick={() => execFormat("hr")}>—</TB>
//           <TB title="Link" onClick={() => execFormat("link")}>🔗</TB>
//           <TB title="Image" onClick={() => execFormat("image")}>🖼</TB>
//           <span className="tc-tb-sep" />
//           <button
//             className={`tc-mode-btn ${isCodeView ? "code" : "visual"}`}
//             onClick={() => setIsCodeView(!isCodeView)}
//           >
//             {isCodeView ? "📝 Code" : "👁 Preview"}
//           </button>
//           <select
//             className="tc-var-insert-sel"
//             value=""
//             onChange={(e) => {
//               if (e.target.value) {
//                 insertAtCursor(`{${e.target.value}}`);
//                 e.target.value = "";
//               }
//             }}
//           >
//             <option value="">⚡ Insert variable…</option>
//             {availableVariables.map((v) => (
//               <option key={v} value={v}>{`{${v}}`}</option>
//             ))}
//           </select>
//         </div>
//       </div>
//       {isCodeView ? (
//         <div className="tc-code-area">
//           <div className="tc-code-area">
//             <Editor
//               value={value}
//               onValueChange={(code) => update(code)}
//               highlight={(code) =>
//                 Prism.highlight(code, Prism.languages.html, "html")
//               }
//               padding={16}
//               style={{
//                 background: "#1e1e2e",
//                 color: "#cdd6f4",
//                 fontFamily: "DM Mono, monospace",
//                 fontSize: 13,
//                 minHeight: "380px",
//               }}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="tc-preview-area">
//           <div className="tc-preview-page">
//             <div
//               dangerouslySetInnerHTML={{
//                 __html: previewHtml || '<div style="padding:40px;text-align:center;color:#94a3b8;">✉️<br/>Switch to Code View to start editing.</div>',
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CHANNEL PREVIEW COMPONENTS
// // ─────────────────────────────────────────────────────────────────────────────

// const EmailPreview: FC<{ template: MessageTemplate }> = ({ template }) => (
//   <div className="tc-email-prev">
//     <div style={{ padding: "16px 20px" }}>
//       {template.subject && (
//         <p style={{ fontWeight: 700, fontSize: 12, color: "#0f172a", marginBottom: 10 }}>
//           {template.subject}
//         </p>
//       )}
//       <div
//         style={{ fontSize: 12, color: "#334155", lineHeight: 1.7 }}
//         dangerouslySetInnerHTML={{ __html: template.content }}
//       />
//     </div>
//     <div style={{ background: "#f8fafc", padding: "10px 20px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
//       <p style={{ fontSize: 10, color: "#94a3b8" }}>Roomac · Comfort, Care &amp; Quality Accommodation</p>
//     </div>
//   </div>
// );

// const WhatsAppPreview: FC<{ template: MessageTemplate }> = ({ template }) => {
//   const plain = stripHtml(template.content);
//   const formatted = plain
//     .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
//     .replace(/_(.*?)_/g, "<em>$1</em>")
//     .replace(/\n/g, "<br/>");
//   return (
//     <div className="tc-wa-prev">
//       <div style={{ background: "#075E54", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
//         <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>R</div>
//         <div>
//           <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Roomac</div>
//           <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10 }}>Business Account</div>
//         </div>
//       </div>
//       <div style={{ background: "#ECE5DD", padding: "12px 10px", minHeight: 80 }}>
//         <div style={{ background: "#fff", borderRadius: "0 10px 10px 10px", padding: "10px 14px", maxWidth: "88%", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
//           <p style={{ fontSize: 12, color: "#111827", lineHeight: 1.65, margin: 0 }} dangerouslySetInnerHTML={{ __html: formatted }} />
//           <div style={{ textAlign: "right", marginTop: 4, fontSize: 10, color: "#9ca3af" }}>✓✓</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const SmsPreview: FC<{ template: MessageTemplate }> = ({ template }) => {
//   const plain = stripHtml(template.content);
//   return (
//     <div className="tc-sms-prev">
//       <div style={{ background: "#374151", padding: "8px 14px", borderRadius: "var(--r2) var(--r2) 0 0", textAlign: "center" }}>
//         <p style={{ fontSize: 10, color: "#d1d5db", fontWeight: 600, letterSpacing: ".5px" }}>ROOMAC</p>
//       </div>
//       <div style={{ background: "#fff", padding: "12px 14px", borderRadius: "0 0 var(--r2) var(--r2)" }}>
//         <p style={{ fontSize: 12, color: "#111827", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{plain}</p>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTop: "1px solid #f1f5f9" }}>
//           <span style={{ fontSize: 10, color: "#94a3b8" }}>{plain.length} chars · {Math.ceil(plain.length / 160)} segment{Math.ceil(plain.length / 160) > 1 ? "s" : ""}</span>
//           <span style={{ fontSize: 10, color: "#3b82f6", fontWeight: 600 }}>SMS</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // TEMPLATE CARD
// // ─────────────────────────────────────────────────────────────────────────────

// interface CardProps {
//   template: MessageTemplate;
//   selected: boolean;
//   onSelect: () => void;
//   onView: () => void;
//   onEdit: () => void;
//   onDuplicate: () => void;
//   onDelete: () => void;
//   onApprove: () => void;
//   onReject: () => void;
//   canManage: boolean;
// }

// const TemplateCard: FC<CardProps> = ({
//   template, selected, onSelect, onView, onEdit,
//   onDuplicate, onDelete, onApprove, onReject, canManage,
// }) => {
//   const [ddOpen, setDdOpen] = useState(false);
//   const excerpt = stripHtml(template.content).substring(0, 100);
//   const ddItems: DropItem[] = [
//     { type: "label", label: "Actions" },
//     { icon: "👁", label: "Preview", onClick: onView },
//     ...(canManage
//       ? [
//         { icon: "✏️", label: "Edit", onClick: onEdit },
//         { icon: "📋", label: "Duplicate", onClick: onDuplicate },
//         ...(template.status === "pending"
//           ? [
//             { type: "sep" as const },
//             { icon: "✅", label: "Approve", onClick: onApprove, variant: "success" as const },
//             { icon: "❌", label: "Reject", onClick: onReject, variant: "danger" as const },
//           ]
//           : []),
//         { type: "sep" as const },
//         { icon: "🗑", label: "Delete", onClick: onDelete, variant: "danger" as const },
//       ]
//       : []),
//   ];

//   return (
//     <div className={`tc-card ch-${template.channel} ${selected ? "selected" : ""}`} onClick={onView}>
//       <div className="tc-card-top">
//         <div className="tc-card-left">
//           {canManage && (
//             <div onClick={(e) => e.stopPropagation()}>
//               <input type="checkbox" checked={selected} onChange={onSelect} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--blue)" }} />
//             </div>
//           )}
//           <div className={`tc-ch-badge ${template.channel}`}>
//             {template.channel === "sms" ? "📱" : template.channel === "whatsapp" ? "💬" : "📧"}
//           </div>
//         </div>
//         <div className="tc-dd-wrap" onClick={(e) => e.stopPropagation()}>
//           <button className="tc-dd-btn" onClick={() => setDdOpen(!ddOpen)}>⋮</button>
//           <Dropdown open={ddOpen} onClose={() => setDdOpen(false)} items={ddItems} />
//         </div>
//       </div>
//       <h3 className="tc-card-name">{template.name}</h3>
//       <div className="tc-card-tags">
//         <span className={`tc-tag tc-tag-${template.category}`}>{getCategoryLabel(template.category)}</span>
//         <span className={`tc-tag tc-tag-${template.status}`}>
//           {template.status === "approved" ? "✓ Approved" : template.status === "pending" ? "⏳ Pending" : template.status === "rejected" ? "✕ Rejected" : template.status}
//         </span>
//         {template.priority === "urgent" && <span className="tc-tag tc-tag-urgent">🔥 Urgent</span>}
//         {template.priority === "high" && <span className="tc-tag tc-tag-high">⚡ High</span>}
//       </div>
//       {template.variables.length > 0 && (
//         <div className="tc-card-vars">
//           {template.variables.slice(0, 4).map((v) => (
//             <span key={v} className="tc-var-chip">{"{" + v + "}"}</span>
//           ))}
//           {template.variables.length > 4 && <span style={{ fontSize: 10, color: "var(--t4)", alignSelf: "center" }}>+{template.variables.length - 4}</span>}
//         </div>
//       )}
//       <p className="tc-card-exc">&quot;{excerpt}{excerpt.length >= 100 ? "…" : ""}&quot;</p>
//       <div className="tc-card-foot">
//         <span className="tc-card-date">{new Date(template.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
//         <button className="tc-btn-prev" onClick={(e) => { e.stopPropagation(); onView(); }}>👁 Preview</button>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CREATE / EDIT DIALOG
// // ─────────────────────────────────────────────────────────────────────────────

// interface CreateEditDialogProps {
//   open: boolean;
//   onClose: () => void;
//   template: MessageTemplate | null;
//   activeChannel: string;
//   onSuccess: () => void;
// }

// const CreateEditDialog: FC<CreateEditDialogProps> = ({
//   open, onClose, template, activeChannel, onSuccess,
// }) => {
//   const isEdit = !!template;
//   const [name, setName] = useState("");
//   const [channel, setChannel] = useState<Channel>("sms");
//   const [category, setCategory] = useState<Category>("alert");
//   const [content, setContent] = useState("");
//   const [subject, setSubject] = useState("");
//   const [priority, setPriority] = useState<Priority>("normal");
//   const [autoApprove, setAutoApprove] = useState(false);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (template) {
//       setName(template.name);
//       setChannel(template.channel);
//       setCategory(template.category);
//       setContent(template.content);
//       setSubject(template.subject || "");
//       setPriority(template.priority);
//       setAutoApprove(template.auto_approve === 1);
//     } else {
//       setName("");
//       setChannel((activeChannel === "all" ? "sms" : activeChannel) as Channel);
//       setCategory("alert");
//       setContent("");
//       setSubject("");
//       setPriority("normal");
//       setAutoApprove(false);
//     }
//   }, [template, activeChannel, open]);

//   const availableVars: string[] = channel === "email" ? ALL_EMAIL_VARS : CHANNEL_VARIABLES[category] ?? [];
//   const detectedVars = extractVars(content);

//   const insertVar = (v: string) => setContent((p) => p + `{${v}}`);

//   const handleSave = async () => {
//     if (!name.trim() || !content.trim()) {
//       toast.error("Name and content are required");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload: CreateTemplatePayload = {
//         name,
//         channel,
//         category,
//         content,
//         subject: channel === "email" ? subject : undefined,
//         variables: detectedVars,
//         priority,
//         auto_approve: autoApprove,
//         status: autoApprove ? "approved" : "pending",
//       };
//       if (isEdit && template) {
//         await updateTemplate(template.id, payload);
//         toast.success("Template updated!");
//       } else {
//         await createTemplate(payload);
//         toast.success("Template created!");
//       }
//       onSuccess();
//       onClose();
//     } catch (err: any) {
//       toast.error(err.message || (isEdit ? "Failed to update" : "Failed to create"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!open) return null;
//   return (
//     <div className="tc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div className="tc-modal" style={{ width: "min(880px,95vw)" }} onClick={(e) => e.stopPropagation()}>
//         <div className="tc-modal-hdr">
//           <div>
//             <h2 className="tc-modal-title">💬 {isEdit ? "Edit Template" : "Create Template"}</h2>
//             <p className="tc-modal-desc">{isEdit ? `Editing: ${template!.name}` : "Fill in the details below"}</p>
//           </div>
//           <button className="tc-modal-close" onClick={onClose}>✕</button>
//         </div>
//         <div className="tc-modal-body">
//           <div className="tc-section">
//             <div className="tc-row c2">
//               <div className="tc-field"><label>Template Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email" /></div>
//               <div className="tc-field"><label>Category</label><select value={category} onChange={(e) => setCategory(e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
//             </div>
//             <div className={`tc-row ${channel === "email" ? "c3" : "c2"}`}>
//               <div className="tc-field"><label>Channel</label><select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}><option value="sms">📱 SMS</option><option value="whatsapp">💬 WhatsApp</option><option value="email">📧 Email</option></select></div>
//               <div className="tc-field"><label>Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
//               {channel === "email" && <div className="tc-field"><label>Email Subject</label><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Welcome to Roomac!" /></div>}
//             </div>
//           </div>
//           {availableVars.length > 0 && (
//             <div className="tc-section">
//               <div className="tc-vars-panel">
//                 <div className="tc-vars-title">Variables — click to insert</div>
//                 <div className="tc-var-chips-row">
//                   {availableVars.slice(0, channel === "email" ? 20 : 999).map((v) => (
//                     <button key={v} className="tc-var-chip-btn" onClick={() => insertVar(v)}><span className="tc-var-dot" />{"{" + v + "}"}</button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//           <div className="tc-section">
//             <div className="tc-field">
//               <label>Template Content {channel !== "email" && <span style={{ color: "var(--t4)", fontWeight: 400, textTransform: "none", marginLeft: 8, fontSize: 11 }}>· {1000 - content.length} chars left</span>}</label>
//               {channel === "email" ? (
//                 <EmailRichEditor value={content} onChange={setContent} availableVariables={availableVars} />
//               ) : (
//                 <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Template content. Use {variable} for dynamic data." rows={6} maxLength={1000} />
//               )}
//             </div>
//           </div>
//           {detectedVars.length > 0 && (
//             <div className="tc-section">
//               <div className="tc-detected">
//                 <div className="tc-detected-title">⚡ Detected variables in content:</div>
//                 <div className="tc-var-chips-row">{detectedVars.map((v) => <span key={v} className="tc-var-chip">{"{" + v + "}"}</span>)}</div>
//               </div>
//             </div>
//           )}
//           <div className="tc-section">
//             <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
//               <div className="tc-switch-row">
//                 <label className="tc-switch"><input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} /><span className="tc-sw-track" /><span className="tc-sw-thumb" /></label>
//                 <span className="tc-sw-label">Auto-approve</span>
//               </div>
//               <span className={`tc-tag ${autoApprove ? "tc-tag-approved" : "tc-tag-pending"}`}>{autoApprove ? "✓ Will be approved" : "⏳ Will be pending review"}</span>
//             </div>
//           </div>
//         </div>
//         <div className="tc-modal-foot">
//           <button className="tc-btn tc-btn-outline" onClick={onClose}>Cancel</button>
//           <button className="tc-btn tc-btn-primary" onClick={handleSave} disabled={saving || !name.trim() || !content.trim()}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // VIEW DIALOG
// // ─────────────────────────────────────────────────────────────────────────────

// const ViewDialog: FC<{ template: MessageTemplate | null; onClose: () => void }> = ({ template, onClose }) => {
//   if (!template) return null;
//   return (
//     <div className="tc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div className="tc-modal" style={{ width: "min(580px,95vw)" }} onClick={(e) => e.stopPropagation()}>
//         <div className="tc-modal-hdr">
//           <div><h2 className="tc-modal-title">👁 Template Preview</h2><p className="tc-modal-desc">#{template.id} · {template.channel.toUpperCase()} · {template.category}</p></div>
//           <button className="tc-modal-close" onClick={onClose}>✕</button>
//         </div>
//         <div className="tc-modal-body" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//             <span className={`tc-tag tc-tag-${template.category}`}>{getCategoryLabel(template.category)}</span>
//             <span className={`tc-tag tc-tag-${template.status}`}>{template.status}</span>
//             <span className="tc-tag" style={{ background: "var(--s3)", color: "var(--t3)", borderColor: "var(--b2)" }}>{template.channel === "sms" ? "📱" : template.channel === "whatsapp" ? "💬" : "📧"} {template.channel}</span>
//           </div>
//           <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Template Name</p><p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{template.name}</p></div>
//           {template.subject && <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Subject</p><p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{template.subject}</p></div>}
//           <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{template.channel === "email" ? "📧 Email Preview" : template.channel === "whatsapp" ? "💬 WhatsApp Preview" : "📱 SMS Preview"}</p>{template.channel === "email" && <EmailPreview template={template} />}{template.channel === "whatsapp" && <WhatsAppPreview template={template} />}{template.channel === "sms" && <SmsPreview template={template} />}</div>
//           {template.variables.length > 0 && <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Variables Used</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{template.variables.map((v) => <span key={v} className="tc-var-chip">{"{" + v + "}"}</span>)}</div></div>}
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, background: "var(--s2)", borderRadius: "var(--r2)", padding: 14, border: "1px solid var(--b1)" }}>
//             {[{ l: "Priority", v: template.priority }, { l: "Used", v: `${template.usage_count}x` }, { l: "Auto Approve", v: template.auto_approve ? "Yes" : "No" }].map(({ l, v }) => (
//               <div key={l} style={{ textAlign: "center" }}><p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{l}</p><p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>{v}</p></div>
//             ))}
//           </div>
//           {template.rejection_reason && <div style={{ background: "var(--red-bg)", border: "1px solid #fca5a5", borderRadius: "var(--r2)", padding: "10px 14px" }}><p style={{ fontSize: 11, color: "var(--red-txt)", fontWeight: 700, marginBottom: 4 }}>Rejection Reason</p><p style={{ fontSize: 12, color: "#7f1d1d" }}>{template.rejection_reason}</p></div>}
//         </div>
//         <div className="tc-modal-foot"><button className="tc-btn tc-btn-outline" onClick={onClose}>Close</button></div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // REJECT DIALOG
// // ─────────────────────────────────────────────────────────────────────────────

// const RejectDialog: FC<{ open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }> = ({ open, onClose, onConfirm, loading }) => {
//   const [reason, setReason] = useState("");
//   if (!open) return null;
//   return (
//     <div className="tc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div className="tc-modal" style={{ width: "min(420px,95vw)" }} onClick={(e) => e.stopPropagation()}>
//         <div className="tc-modal-hdr danger"><h2 className="tc-modal-title">❌ Reject Template</h2><button className="tc-modal-close" onClick={onClose}>✕</button></div>
//         <div style={{ padding: "20px 24px" }}><div className="tc-field"><label>Rejection Reason</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this template is being rejected…" rows={4} /></div></div>
//         <div className="tc-modal-foot"><button className="tc-btn tc-btn-outline" onClick={onClose}>Cancel</button><button className="tc-btn tc-btn-danger" onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}>{loading ? "Rejecting…" : "Reject Template"}</button></div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // BULK DELETE DIALOG
// // ─────────────────────────────────────────────────────────────────────────────

// const BulkDeleteDialog: FC<{ open: boolean; count: number; onClose: () => void; onConfirm: () => void; loading: boolean }> = ({ open, count, onClose, onConfirm, loading }) => {
//   if (!open) return null;
//   return (
//     <div className="tc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div className="tc-modal" style={{ width: "min(400px,95vw)" }} onClick={(e) => e.stopPropagation()}>
//         <div className="tc-modal-hdr danger"><h2 className="tc-modal-title">⚠️ Confirm Delete</h2><button className="tc-modal-close" onClick={onClose}>✕</button></div>
//         <div style={{ padding: "24px" }}><p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>Are you sure you want to delete <strong>{count}</strong> template{count > 1 ? "s" : ""}? This cannot be undone.</p></div>
//         <div className="tc-modal-foot"><button className="tc-btn tc-btn-outline" onClick={onClose}>Cancel</button><button className="tc-btn tc-btn-danger" onClick={onConfirm} disabled={loading}>{loading ? "Deleting…" : `Delete ${count}`}</button></div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN PAGE COMPONENT (default export)
// // ─────────────────────────────────────────────────────────────────────────────

// const CHANNELS_CONFIG = [
//   { key: "all", label: "All Templates", icon: "⊞" },
//   { key: "sms", label: "SMS", icon: "📱" },
//   { key: "whatsapp", label: "WhatsApp", icon: "💬" },
//   { key: "email", label: "Email", icon: "📧" },
// ];

// export default function TemplateCenterPage() {
//   useGlobalStyle(GLOBAL_CSS);
//   const { can } = useAuth();
//   const canManage = can("manage_templates");

//   const [templates, setTemplates] = useState<MessageTemplate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeChannel, setActiveChannel] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState<Set<number>>(new Set());
//   const [showCreate, setShowCreate] = useState(false);
//   const [editTemplate, setEditTemplate] = useState<MessageTemplate | null>(null);
//   const [viewTemplate, setViewTemplate] = useState<MessageTemplate | null>(null);
//   const [rejectId, setRejectId] = useState<number | null>(null);
//   const [showReject, setShowReject] = useState(false);
//   const [rejectLoading, setRejectLoading] = useState(false);
//   const [showBulkDelete, setShowBulkDelete] = useState(false);
//   const [bulkLoading, setBulkLoading] = useState(false);

//   const loadTemplates = useCallback(async () => {
//     try {
//       setLoading(true);
//       const channelParam = activeChannel === "all" ? undefined : activeChannel;
//       const { templates: data, stats } = await getTemplates({
//         channel: channelParam,
//         status: statusFilter !== "all" ? statusFilter : undefined,
//         category: categoryFilter !== "all" ? categoryFilter : undefined,
//         search: search || undefined,
//       });
//       setTemplates(data);
//     } catch (err: any) {
//       toast.error(err.message || "Failed to load templates");
//     } finally {
//       setLoading(false);
//     }
//   }, [activeChannel, statusFilter, categoryFilter, search]);

//   useEffect(() => {
//     loadTemplates();
//   }, [loadTemplates]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadTemplates();
//     setRefreshing(false);
//     toast.success("Refreshed");
//   };

//   const filtered = useMemo(() => templates, [templates]);

//   const channelCounts = useMemo(() => {
//     const c: Record<string, number> = { all: templates.length, sms: 0, whatsapp: 0, email: 0 };
//     templates.forEach((t) => (c[t.channel] = (c[t.channel] ?? 0) + 1));
//     return c;
//   }, [templates]);

//   const pendingCount = filtered.filter((t) => t.status === "pending").length;
//   const approvedCount = filtered.filter((t) => t.status === "approved").length;

//   const toggleSelect = (id: number) => {
//     const n = new Set(selected);
//     n.has(id) ? n.delete(id) : n.add(id);
//     setSelected(n);
//   };

//   const handleApprove = async (id: number) => {
//     try {
//       await approveTemplate(id);
//       toast.success("Template approved");
//       await loadTemplates();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to approve");
//     }
//   };

//   const handleReject = async (reason: string) => {
//     if (!rejectId) return;
//     setRejectLoading(true);
//     try {
//       await rejectTemplate(rejectId, reason);
//       toast.success("Template rejected");
//       await loadTemplates();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to reject");
//     } finally {
//       setRejectLoading(false);
//       setShowReject(false);
//       setRejectId(null);
//     }
//   };

//   const handleDuplicate = async (id: number) => {
//     try {
//       await duplicateTemplate(id);
//       toast.success("Template duplicated");
//       await loadTemplates();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to duplicate");
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await deleteTemplate(id);
//       toast.success("Template deleted");
//       await loadTemplates();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to delete");
//     }
//   };

//   const handleBulkDelete = async () => {
//     setBulkLoading(true);
//     try {
//       await bulkDeleteTemplates(Array.from(selected));
//       toast.success(`Deleted ${selected.size} templates`);
//       setSelected(new Set());
//       await loadTemplates();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to delete templates");
//     } finally {
//       setBulkLoading(false);
//       setShowBulkDelete(false);
//     }
//   };

//   const handleCreateSuccess = () => {
//     loadTemplates();
//     setShowCreate(false);
//     setEditTemplate(null);
//   };

//   if (loading && !refreshing) {
//     return (
//       <div className="tc-root">
//         <div className="tc-content">
//           <div className="tc-main-card" style={{ padding: "60px", textAlign: "center" }}>
//             <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
//             <p>Loading templates...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="tc-root">
//       <div className="tc-content">
//         <div className="tc-main-card">
//           {/* Channel tabs */}
//           <div className="tc-ch-bar">
//             {CHANNELS_CONFIG.map((ch) => (
//               <button
//                 key={ch.key}
//                 className={`tc-ch-tab ${activeChannel === ch.key ? "active" : ""}`}
//                 onClick={() => {
//                   setActiveChannel(ch.key);
//                   setSelected(new Set());
//                 }}
//               >
//                 <span>{ch.icon}</span> {ch.label}
//                 <span className="tc-ch-count">{channelCounts[ch.key] ?? 0}</span>
//               </button>
//             ))}
//             <div className="tc-tab-actions">
//               <button className="tc-btn-refresh" onClick={handleRefresh} title="Refresh" disabled={refreshing}>
//                 {refreshing ? "⟳" : "↻"}
//               </button>
//               {canManage && (
//                 <button className="tc-btn-create" onClick={() => { setEditTemplate(null); setShowCreate(true); }}>
//                   + Create Template
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="tc-filters">
//             <div className="tc-status-pills">
//               {[
//                 { key: "all", label: "All", count: filtered.length, icon: "⊞" },
//                 { key: "pending", label: "Pending", count: pendingCount, icon: "⏳" },
//                 { key: "approved", label: "Approved", count: approvedCount, icon: "✅" },
//               ].map((s) => (
//                 <button
//                   key={s.key}
//                   className={`tc-status-pill ${statusFilter === s.key ? "active" : ""}`}
//                   onClick={() => setStatusFilter(s.key)}
//                 >
//                   {s.icon} {s.label}
//                   <span className="tc-pill-count">{s.count}</span>
//                 </button>
//               ))}
//             </div>
//             <div className="tc-filters-r">
//               <div className="tc-search-wrap">
//                 <span className="tc-search-ic">🔍</span>
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search templates…"
//                 />
//               </div>
//               <select
//                 className="tc-filter-sel"
//                 value={categoryFilter}
//                 onChange={(e) => setCategoryFilter(e.target.value)}
//               >
//                 <option value="all">All Categories</option>
//                 {CATEGORIES.map((c) => (
//                   <option key={c.key} value={c.key}>{c.label}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Bulk action bar */}
//           {selected.size > 0 && canManage && (
//             <div className="tc-bulk-bar">
//               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                 <span className="tc-bulk-badge">{selected.size} selected</span>
//                 <button className="tc-btn-clr" onClick={() => setSelected(new Set())}>✕ Clear</button>
//               </div>
//               <button className="tc-btn-bdel" onClick={() => setShowBulkDelete(true)}>🗑 Delete {selected.size}</button>
//             </div>
//           )}

//           {/* Template grid */}
//           <div className="tc-grid">
//             {filtered.length === 0 ? (
//               <div className="tc-empty">
//                 <div className="tc-empty-icon">📭</div>
//                 <h3>No templates found</h3>
//                 <p>Try adjusting your filters or create a new template.</p>
//                 {canManage && (
//                   <button className="tc-btn tc-btn-primary" style={{ marginTop: 8 }} onClick={() => { setEditTemplate(null); setShowCreate(true); }}>
//                     + Create Template
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="tc-grid-inner">
//                 {filtered.map((tmpl) => (
//                   <TemplateCard
//                     key={tmpl.id}
//                     template={tmpl}
//                     selected={selected.has(tmpl.id)}
//                     onSelect={() => toggleSelect(tmpl.id)}
//                     onView={() => setViewTemplate(tmpl)}
//                     onEdit={() => { setEditTemplate(tmpl); setShowCreate(true); }}
//                     onDuplicate={() => handleDuplicate(tmpl.id)}
//                     onDelete={() => handleDelete(tmpl.id)}
//                     onApprove={() => handleApprove(tmpl.id)}
//                     onReject={() => { setRejectId(tmpl.id); setShowReject(true); }}
//                     canManage={canManage}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Dialogs */}
//       <CreateEditDialog
//         open={showCreate}
//         onClose={() => { setShowCreate(false); setEditTemplate(null); }}
//         template={editTemplate}
//         activeChannel={activeChannel}
//         onSuccess={handleCreateSuccess}
//       />
//       <ViewDialog template={viewTemplate} onClose={() => setViewTemplate(null)} />
//       <RejectDialog
//         open={showReject}
//         onClose={() => { setShowReject(false); setRejectId(null); }}
//         onConfirm={handleReject}
//         loading={rejectLoading}
//       />
//       <BulkDeleteDialog
//         open={showBulkDelete}
//         count={selected.size}
//         onClose={() => setShowBulkDelete(false)}
//         onConfirm={handleBulkDelete}
//         loading={bulkLoading}
//       />
//     </div>
//   );
// }



"use client";

/**
 * TemplateCenterPage.tsx
 * Roomac Admin – Template Center
 * Fully integrated with backend API (templateApi.ts)
 * Tailwind CSS – no global CSS block.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  FC,
} from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  approveTemplate,
  rejectTemplate,
  duplicateTemplate,
  bulkDeleteTemplates,
  type MessageTemplate,
  type TemplateChannel,
  type TemplateCategory,
  type TemplateStatus,
  type TemplatePriority,
  type CreateTemplatePayload,
} from "@/lib/templateApi";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Channel = TemplateChannel;
type Category = TemplateCategory;
type Status = TemplateStatus;
type Priority = TemplatePriority;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// const SAMPLE_DATA: Record<string, string> = {
//   tenant_name: "Amit Sharma",
//   tenant_phone: "+91 98765 43210",
//   tenant_email: "amit.sharma@email.com",
//   room_number: "A-204",
//   bed_number: "2",
//   move_in_date: "15 Mar 2024",
//   rent_amount: "12,500",
//   security_deposit: "25,000",
//   company_address: "Wakad, Pune - 411057",
//   aadhaar_number: "XXXX-XXXX-1234",
//   pan_number: "ABCDE1234F",
//   emergency_contact_name: "Priya Sharma",
//   emergency_phone: "+91 98765 43211",
//   payment_mode: "UPI (Auto-debit)",
//   date: new Date().toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   }),
//   document_number: `DOC-${Date.now().toString().slice(-6)}`,
//   otp: "482931",
//   expiry_minutes: "10",
//   verify_link: "https://roomac.in/verify/abc123",
//   expiry_hours: "24",
//   amount: "12,500",
//   receipt_id: "RCT-2024-1892",
//   payment_date: "15 Mar 2024",
//   due_date: "1 Apr 2024",
//   name: "Amit",
//   location: "Wakad, Pune",
//   price: "12,500/mo",
//   cta_url: "https://roomac.in",
//   discount: "10%",
//   request_id: "REQ-4821",
//   status: "Completed",
//   staff_name: "Ravi Kumar",
//   checkin_date: "15 Mar 2024",
//   notice_message: "Water supply maintenance on Sunday 8am–12pm",
//   effective_date: "20 Mar 2024",
//   late_fee: "500",
//   invoice_no: "INV-2025-042",
// };

const CHANNEL_VARIABLES: Record<string, string[]> = {
  otp: ["otp", "tenant_name", "expiry_minutes"],
  payment: ["tenant_name", "amount", "property_name", "receipt_id", "payment_date", "due_date"],
  verification: ["tenant_name", "verify_link", "otp", "expiry_hours"],
  marketing: ["name", "property_name", "location", "price", "cta_url", "discount"],
  alert: ["tenant_name", "request_id", "status", "staff_name", "property_name"],
  reminder: ["tenant_name", "amount", "due_date", "property_name", "room_number"],
  welcome: ["tenant_name", "property_name", "checkin_date", "room_number", "staff_name"],
  notice: ["tenant_name", "notice_message", "effective_date", "property_name"],
};

const ALL_EMAIL_VARS = [
  "tenant_name", "tenant_phone", "tenant_email", "room_number", "bed_number",
  "move_in_date", "rent_amount", "security_deposit", "company_address",
  "aadhaar_number", "pan_number", "emergency_contact_name", "emergency_phone",
  "payment_mode", "date", "document_number", "otp", "expiry_minutes",
  "verify_link", "expiry_hours", "amount", "receipt_id", "payment_date",
  "due_date", "name", "location", "price", "cta_url", "discount", "request_id",
  "status", "staff_name", "checkin_date", "notice_message", "effective_date",
  "late_fee", "invoice_no", "property_name"
];
const CATEGORIES: { key: Category; label: string }[] = [
  { key: "otp", label: "OTP" },
  { key: "payment", label: "Payment" },
  { key: "verification", label: "Verification" },
  { key: "marketing", label: "Marketing" },
  { key: "alert", label: "Alert" },
  { key: "reminder", label: "Reminder" },
  { key: "welcome", label: "Welcome" },
  { key: "notice", label: "Notice" },
];

const VAR_CHIP_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", dot: "bg-blue-500" },
  { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", dot: "bg-green-500" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", dot: "bg-purple-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
  { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", dot: "bg-red-500" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-800", dot: "bg-teal-500" },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function renderWithSample(html: string): string {
  return html;
}

function extractVars(content: string): string[] {
  const plain = content.replace(/<[^>]*>/g, "");
  return [
    ...new Set(
      (plain.match(/\{(\w+)\}/g) || []).map((v) => v.replace(/[{}]/g, ""))
    ),
  ];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getCategoryLabel(cat: string): string {
  return CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
}

function renderContentPreview(content: string, vars: string[]): string {
  let rendered = stripHtml(content);
  vars.forEach((v) => {
    rendered = rendered.replace(
      new RegExp(`\\{${v}\\}`, "g"),
      `<mark style="background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:4px;font-weight:600;font-style:normal;">{${v}}</mark>`
    );
  });
  return rendered;
}

// ─────────────────────────────────────────────────────────────────────────────
// TAG / STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getCategoryTagClass(cat: string): string {
  const map: Record<string, string> = {
    otp: "bg-red-50 text-red-800 border border-red-300",
    payment: "bg-green-50 text-green-800 border border-green-300",
    verification: "bg-blue-50 text-blue-800 border border-blue-300",
    marketing: "bg-purple-50 text-purple-800 border border-purple-300",
    alert: "bg-orange-50 text-orange-800 border border-orange-300",
    reminder: "bg-amber-50 text-amber-800 border border-amber-300",
    welcome: "bg-teal-50 text-teal-800 border border-teal-300",
    notice: "bg-slate-100 text-slate-600 border border-slate-300",
  };
  return map[cat] ?? "bg-slate-100 text-slate-600 border border-slate-300";
}

function getStatusTagClass(status: string): string {
  const map: Record<string, string> = {
    approved: "bg-green-50 text-green-800 border border-green-300",
    pending: "bg-amber-50 text-amber-800 border border-amber-300",
    rejected: "bg-red-50 text-red-800 border border-red-300",
  };
  return map[status] ?? "bg-slate-100 text-slate-600 border border-slate-300";
}

function getChannelAccentBefore(channel: string): string {
  // We use a pseudo-element via inline style since Tailwind can't do dynamic before: content
  const map: Record<string, string> = {
    sms: "linear-gradient(90deg,#3b82f6,#06b6d4)",
    whatsapp: "linear-gradient(90deg,#22c55e,#10b981)",
    email: "linear-gradient(90deg,#8b5cf6,#ec4899)",
  };
  return map[channel] ?? "";
}

function getChannelBadgeBg(channel: string): string {
  const map: Record<string, string> = {
    sms: "bg-blue-50",
    whatsapp: "bg-green-50",
    email: "bg-purple-50",
  };
  return map[channel] ?? "bg-slate-100";
}

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

interface DropItem {
  type?: "label" | "sep";
  label?: string;
  icon?: string;
  variant?: "danger" | "success" | "";
  onClick?: () => void;
}

const Dropdown: FC<{ open: boolean; onClose: () => void; items: DropItem[] }> = ({
  open, onClose, items,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-[300] min-w-[160px] overflow-hidden">
      {items.map((item, i) => {
        if (item.type === "label")
          return <div key={i} className="px-3.5 pt-2 pb-1 text-[10px] font-bold text-blue-600 uppercase tracking-wide">{item.label}</div>;
        if (item.type === "sep") return <hr key={i} className="border-slate-100 my-1" />;
        return (
          <button
            key={i}
            onClick={() => { item.onClick?.(); onClose(); }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs w-full text-left transition-colors border-none bg-transparent cursor-pointer ${
              item.variant === "danger" ? "text-red-700 hover:bg-red-50"
              : item.variant === "success" ? "text-green-700 hover:bg-green-50"
              : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL RICH EDITOR
// ─────────────────────────────────────────────────────────────────────────────

interface RichEditorProps {
  value: string;
  onChange: (v: string) => void;
  availableVariables: string[];
}

const EmailRichEditor: FC<RichEditorProps> = ({ value, onChange, availableVariables }) => {
  const [isCodeView, setIsCodeView] = useState(true);
  const [history, setHistory] = useState<string[]>([value]);
  const [histIdx, setHistIdx] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (value !== history[histIdx]) {
      const nh = history.slice(0, histIdx + 1);
      nh.push(value);
      setHistory(nh);
      setHistIdx(nh.length - 1);
    }
  }, [value]);

  const update = (v: string) => onChange(v);

  const insertAtCursor = useCallback((text: string) => {
    const ta = taRef.current;
    if (!ta) return update(value + text);
    const s = ta.selectionStart; const e = ta.selectionEnd;
    const nv = value.slice(0, s) + text + value.slice(e);
    update(nv);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + text.length; }, 0);
  }, [value]);

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart; const e = ta.selectionEnd;
    const sel = value.slice(s, e);
    const nv = value.slice(0, s) + before + sel + after + value.slice(e);
    update(nv);
    setTimeout(() => { ta.focus(); ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + sel.length; }, 0);
  }, [value]);

  const execFormat = useCallback((cmd: string) => {
    if (!isCodeView) return;
    const map: Record<string, [string, string]> = {
      bold: ["<strong>", "</strong>"], italic: ["<em>", "</em>"],
      underline: ["<u>", "</u>"], strike: ["<del>", "</del>"],
    };
    if (map[cmd]) { wrapSelection(map[cmd][0], map[cmd][1]); return; }
    switch (cmd) {
      case "ul": insertAtCursor("\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n"); break;
      case "ol": insertAtCursor("\n<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ol>\n"); break;
      case "table": insertAtCursor('\n<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">\n  <tr><th>Header 1</th><th>Header 2</th></tr>\n  <tr><td>Cell 1</td><td>Cell 2</td></tr>\n</table>\n'); break;
      case "hr": insertAtCursor('\n<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;"/>\n'); break;
      case "link": { const url = prompt("Enter URL:", "https://"); if (url) wrapSelection(`<a href="${url}" style="color:#1a56db;">`, "</a>"); break; }
      case "image": { const url = prompt("Enter image URL:", "https://"); if (url) insertAtCursor(`<img src="${url}" style="max-width:100%;border-radius:8px;" alt="image"/>`); break; }
    }
  }, [isCodeView, wrapSelection, insertAtCursor]);

  const applyHeading = (l: string) => { if (!isCodeView || !l) return; wrapSelection(`<h${l} style="margin:12px 0;">`, `</h${l}>`); };
  const applyFont   = (f: string) => { if (!isCodeView) return; wrapSelection(`<span style="font-family:'${f}',sans-serif;">`, "</span>"); };
  const applySize   = (s: string) => { if (!isCodeView) return; wrapSelection(`<span style="font-size:${s}px;">`, "</span>"); };
  const applyColor  = (c: string) => { if (!isCodeView) return; wrapSelection(`<span style="color:${c};">`, "</span>"); };
  const applyBg     = (c: string) => { if (!isCodeView) return; wrapSelection(`<span style="background:${c};padding:0 3px;border-radius:3px;">`, "</span>"); };
  const applyAlign  = (a: string) => { if (!isCodeView) return; wrapSelection(`<div style="text-align:${a};">`, "</div>"); };
  const undo = () => { if (histIdx > 0) { setHistIdx(histIdx - 1); onChange(history[histIdx - 1]); } };
  const redo = () => { if (histIdx < history.length - 1) { setHistIdx(histIdx + 1); onChange(history[histIdx + 1]); } };

  const TB = ({ title, onClick, children, extra = "" }: any) => (
    <button type="button" title={title} onClick={onClick}
      className={`w-[26px] h-[26px] border-none bg-transparent rounded cursor-pointer flex items-center justify-center text-slate-400 text-[13px] transition-all hover:bg-slate-100 hover:text-slate-800 ${extra}`}>
      {children}
    </button>
  );
  const Sep = () => <span className="w-px h-[18px] bg-slate-300 mx-1 flex-shrink-0" />;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* toolbar */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-0.5 px-2.5 py-1.5 flex-wrap gap-y-1">
          <TB title="Undo" onClick={undo}>↩</TB>
          <TB title="Redo" onClick={redo}>↪</TB>
          <Sep />
          <select className="h-[26px] border border-slate-200 rounded text-[11px] text-slate-600 bg-white outline-none px-1.5 cursor-pointer w-[96px]"
            onChange={(e) => { applyHeading(e.target.value); e.target.value = ""; }}>
            <option value="">Paragraph</option>
            {["1","2","3","4"].map((h) => <option key={h} value={h}>Heading {h}</option>)}
          </select>
          <select className="h-[26px] border border-slate-200 rounded text-[11px] text-slate-600 bg-white outline-none px-1.5 cursor-pointer min-w-[110px]"
            onChange={(e) => { applyFont(e.target.value); e.target.value = "DM Sans"; }}>
            {["DM Sans","Arial","Georgia","Courier New","Times New Roman","Verdana"].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="h-[26px] border border-slate-200 rounded text-[11px] text-slate-600 bg-white outline-none px-1.5 cursor-pointer w-[64px]"
            onChange={(e) => { applySize(e.target.value); e.target.value = "14"; }}>
            {[10,11,12,13,14,16,18,20,22,24,28,32,36].map((s) => <option key={s} value={s}>{s}px</option>)}
          </select>
          <Sep />
          <TB title="Bold" onClick={() => execFormat("bold")} extra="font-bold">B</TB>
          <TB title="Italic" onClick={() => execFormat("italic")} extra="italic">I</TB>
          <TB title="Underline" onClick={() => execFormat("underline")} extra="underline">U</TB>
          <TB title="Strikethrough" onClick={() => execFormat("strike")} extra="line-through">S</TB>
          <Sep />
          <TB title="Align Left" onClick={() => applyAlign("left")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 2h12M1 5h8M1 8h12M1 11h6"/></svg>
          </TB>
          <TB title="Align Center" onClick={() => applyAlign("center")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 2h12M3 5h8M1 8h12M4 11h6"/></svg>
          </TB>
          <TB title="Align Right" onClick={() => applyAlign("right")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 2h12M5 5h8M1 8h12M7 11h6"/></svg>
          </TB>
          <TB title="Justify" onClick={() => applyAlign("justify")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 2h12M1 5h12M1 8h12M1 11h12"/></svg>
          </TB>
          <Sep />
          <label className="flex items-center cursor-pointer">
            <span className="text-xs text-slate-400 mr-0.5">A</span>
            <input type="color" defaultValue="#1a56db" className="w-[18px] h-[18px] cursor-pointer p-0 border-none" onChange={(e) => applyColor(e.target.value)} />
          </label>
          <label className="flex items-center cursor-pointer ml-0.5">
            <span className="text-[11px] text-slate-400 mr-0.5">⬛</span>
            <input type="color" defaultValue="#fef3c7" className="w-[18px] h-[18px] cursor-pointer p-0 border-none" onChange={(e) => applyBg(e.target.value)} />
          </label>
          <Sep />
          <TB title="Bullet list" onClick={() => execFormat("ul")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="2" cy="3.5" r="1.2"/><rect x="5" y="2.5" width="8" height="2" rx="1"/><circle cx="2" cy="7" r="1.2"/><rect x="5" y="6" width="8" height="2" rx="1"/><circle cx="2" cy="10.5" r="1.2"/><rect x="5" y="9.5" width="8" height="2" rx="1"/></svg>
          </TB>
          <TB title="Numbered list" onClick={() => execFormat("ol")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><text x="0" y="4.5" fontSize="4.5" fontWeight="700">1.</text><rect x="5" y="2.5" width="8" height="2" rx="1"/><text x="0" y="8.5" fontSize="4.5" fontWeight="700">2.</text><rect x="5" y="6" width="8" height="2" rx="1"/><text x="0" y="12.5" fontSize="4.5" fontWeight="700">3.</text><rect x="5" y="9.5" width="8" height="2" rx="1"/></svg>
          </TB>
          <TB title="Table" onClick={() => execFormat("table")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="12" height="12" rx="1.5"/><path d="M1 5h12M1 9h12M5 1v12M9 1v12"/></svg>
          </TB>
          <TB title="Horizontal rule" onClick={() => execFormat("hr")}>—</TB>
          <TB title="Link" onClick={() => execFormat("link")}>🔗</TB>
          <TB title="Image" onClick={() => execFormat("image")}>🖼</TB>
          <Sep />
          <button type="button" onClick={() => setIsCodeView(!isCodeView)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all border ${isCodeView ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-slate-400 border-slate-200 hover:bg-slate-100"}`}>
            {isCodeView ? "📝 Code" : "👁 Preview"}
          </button>
          <select className="h-[26px] border border-blue-200 rounded text-[11px] text-blue-600 bg-blue-50 outline-none px-1.5 cursor-pointer min-w-[150px] ml-auto"
            value="" onChange={(e) => { if (e.target.value) { insertAtCursor(`{${e.target.value}}`); e.target.value = ""; } }}>
            <option value="">⚡ Insert variable…</option>
            {availableVariables.map((v) => <option key={v} value={v}>{`{${v}}`}</option>)}
          </select>
        </div>
      </div>
      {/* editor / preview */}
      {isCodeView ? (
        <div className="bg-[#1e1e2e] min-h-[380px] max-h-[460px] overflow-y-auto">
          <Editor
            value={value}
            onValueChange={update}
            highlight={(code) => Prism.highlight(code, Prism.languages.html, "html")}
            padding={16}
            style={{ background: "#1e1e2e", color: "#cdd6f4", fontFamily: "monospace", fontSize: 13, minHeight: "380px" }}
          />
        </div>
      ) : (
        <div className="bg-[#e8eaed] min-h-[420px] max-h-[480px] overflow-y-auto p-5">
          <div className="bg-white max-w-[640px] mx-auto rounded-lg shadow-lg overflow-hidden">
            <div dangerouslySetInnerHTML={{
              __html: renderWithSample(value) || '<div style="padding:40px;text-align:center;color:#94a3b8;">✉️<br/>Switch to Code View to start editing.</div>',
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL PREVIEWS
// ─────────────────────────────────────────────────────────────────────────────

const EmailPreview: FC<{ template: MessageTemplate }> = ({ template }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
    <div className="p-4 px-5">
      {template.subject && <p className="font-bold text-xs text-slate-900 mb-2.5">{template.subject}</p>}
<div className="text-xs text-slate-700 leading-relaxed" 
  dangerouslySetInnerHTML={{ __html: renderWithSample(template.content) }} />    </div>
    <div className="bg-slate-50 py-2.5 px-5 border-t border-slate-200 text-center">
<p className="text-[10px] text-slate-400">{("{property_name}")} · Comfort, Care & Quality Accommodation</p>    </div>
  </div>
);

const WhatsAppPreview: FC<{ template: MessageTemplate }> = ({ template }) => {
const plain = stripHtml(renderWithSample(template.content));
  const formatted = plain.replace(/\*(.*?)\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>").replace(/\n/g, "<br/>");
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-[#075E54] py-2.5 px-3.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-[13px]">R</div>
        <div>
<div className="text-white text-[13px] font-semibold">{renderWithSample("{property_name}")}</div>          <div className="text-white/60 text-[10px]">Business Account</div>
        </div>
      </div>
      <div className="bg-[#ECE5DD] p-3 min-h-[80px]">
        <div className="bg-white rounded-[0_10px_10px_10px] p-2.5 px-3.5 max-w-[88%] shadow-sm">
          <p className="text-xs text-gray-900 leading-[1.65] m-0" dangerouslySetInnerHTML={{ __html: formatted }} />
          <div className="text-right mt-1 text-[10px] text-slate-400">✓✓</div>
        </div>
      </div>
    </div>
  );
};

const SmsPreview: FC<{ template: MessageTemplate }> = ({ template }) => {
const plain = stripHtml(renderWithSample(template.content));
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-700 py-2 px-3.5 text-center">
<p className="text-[10px] text-slate-300 font-semibold tracking-wide">{renderWithSample("{property_name}").toUpperCase()}</p>      </div>
      <div className="bg-white p-3 px-3.5">
        <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-wrap m-0">{plain}</p>
        <div className="flex justify-between mt-2 pt-1.5 border-t border-slate-100">
          <span className="text-[10px] text-slate-400">{plain.length} chars · {Math.ceil(plain.length / 160)} segment{Math.ceil(plain.length / 160) > 1 ? "s" : ""}</span>
          <span className="text-[10px] text-blue-500 font-semibold">SMS</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE CARD
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps {
  template: MessageTemplate;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
  canManage: boolean;
}

const TemplateCard: FC<CardProps> = ({
  template, selected, onSelect, onView, onEdit,
  onDuplicate, onDelete, onApprove, onReject, canManage,
}) => {
  const [ddOpen, setDdOpen] = useState(false);
  const excerpt = stripHtml(template.content).substring(0, 100);
  const accentGrad = getChannelAccentBefore(template.channel);

  const ddItems: DropItem[] = [
    { type: "label", label: "Actions" },
    { icon: "👁", label: "Preview", onClick: onView },
    ...(canManage
      ? [
          { icon: "✏️", label: "Edit", onClick: onEdit },
          { icon: "📋", label: "Duplicate", onClick: onDuplicate },
          ...(template.status === "pending"
            ? [
                { type: "sep" as const },
                { icon: "✅", label: "Approve", onClick: onApprove, variant: "success" as const },
                { icon: "❌", label: "Reject", onClick: onReject, variant: "danger" as const },
              ]
            : []),
          { type: "sep" as const },
          { icon: "🗑", label: "Delete", onClick: onDelete, variant: "danger" as const },
        ]
      : []),
  ];

  return (
    <div
      onClick={onView}
      className={`relative flex flex-col bg-white border rounded-2xl p-[18px] cursor-pointer transition-all duration-200 overflow-hidden h-full min-h-[280px] hover:-translate-y-0.5 hover:shadow-sm ${selected ? "border-blue-200 bg-blue-50 shadow-[0_0_0_3px_rgba(26,86,219,0.1)]" : "border-slate-200 hover:border-slate-300"}`}
    >
      {/* channel top accent bar */}
      {accentGrad && (
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: accentGrad }} />
      )}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-opacity"
        style={{ background: accentGrad, opacity: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")} />

      {/* top row */}
      <div className="flex items-start justify-between mb-3.5 gap-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {canManage && (
            <div onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={selected} onChange={onSelect} className="w-4 h-4 cursor-pointer accent-blue-600" />
            </div>
          )}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${getChannelBadgeBg(template.channel)}`}>
            {template.channel === "sms" ? "📱" : template.channel === "whatsapp" ? "💬" : "📧"}
          </div>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setDdOpen(!ddOpen)}
            className="w-7 h-7 rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center text-slate-400 text-lg font-bold hover:bg-slate-100">
            ⋮
          </button>
          <Dropdown open={ddOpen} onClose={() => setDdOpen(false)} items={ddItems} />
        </div>
      </div>

      {/* scrollable content */}
      <div className="overflow-y-auto flex-1 min-h-0" style={{ scrollbarWidth: "thin" }}>
        <h3 className="text-sm font-bold text-slate-900 mb-2.5 leading-snug">{template.name}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryTagClass(template.category)}`}>
            {getCategoryLabel(template.category)}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusTagClass(template.status)}`}>
            {template.status === "approved" ? "✓ Approved" : template.status === "pending" ? "⏳ Pending" : "✕ Rejected"}
          </span>
          {template.priority === "urgent" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300">🔥 Urgent</span>
          )}
          {template.priority === "high" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-300">⚡ High</span>
          )}
        </div>
        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.variables.slice(0, 4).map((v) => (
              <span key={v} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-mono">{"{" + v + "}"}</span>
            ))}
            {template.variables.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">+{template.variables.length - 4}</span>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 mb-3.5 italic">
          &quot;{excerpt}{excerpt.length >= 100 ? "…" : ""}&quot;
        </p>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-shrink-0 mt-auto">
        <span className="text-[10px] text-slate-400">
          {new Date(template.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex items-center gap-1 bg-transparent border-none text-blue-600 text-[11px] font-semibold cursor-pointer px-2.5 py-1 rounded-full hover:bg-blue-50 transition-colors">
          👁 Preview
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FORM CLASSES
// ─────────────────────────────────────────────────────────────────────────────

const fieldInputClass = "w-full px-3 py-[9px] border border-slate-200 rounded-lg text-[13px] text-slate-900 bg-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const fieldLabelClass = "text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 block";

// ─────────────────────────────────────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

const ModalOverlay: FC<{ onClose: () => void; children: React.ReactNode; maxW?: string }> = ({ onClose, children, maxW = "max-w-[880px]" }) => (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className={`bg-white rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col w-full ${maxW}`}
      style={{ animation: "modalIn 0.2s ease" }}
      onClick={(e) => e.stopPropagation()}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:none}}`}</style>
      {children}
    </div>
  </div>
);

const ModalHeader: FC<{ title: string; desc?: string; danger?: boolean; onClose: () => void }> = ({ title, desc, danger, onClose }) => (
  <div className={`px-6 py-5 flex items-start justify-between flex-shrink-0 ${danger ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-blue-600 to-cyan-500"}`}>
    <div>
      <h2 className="text-[15px] font-bold text-white m-0 flex items-center gap-2">{title}</h2>
      {desc && <p className="text-[11px] text-white/70 mt-0.5">{desc}</p>}
    </div>
    <button onClick={onClose} className="w-7 h-7 border-none bg-white/20 rounded-full cursor-pointer flex items-center justify-center text-white text-[15px] hover:bg-white/30">✕</button>
  </div>
);

const ModalFooter: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 flex-shrink-0">{children}</div>
);

const BtnOutline: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...p }) => (
  <button {...p} className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-semibold cursor-pointer bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors">
    {children}
  </button>
);

const BtnPrimary: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...p }) => (
  <button {...p} className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-semibold cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm hover:shadow-md hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
    {children}
  </button>
);

const BtnDanger: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...p }) => (
  <button {...p} className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-semibold cursor-pointer bg-gradient-to-r from-red-500 to-red-600 text-white disabled:opacity-60 disabled:cursor-not-allowed">
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / EDIT DIALOG
// ─────────────────────────────────────────────────────────────────────────────

interface CreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  template: MessageTemplate | null;
  activeChannel: string;
  onSuccess: () => void;
    masterCategories: { key: string; label: string }[]; // ADD THIS

}

const CreateEditDialog: FC<CreateEditDialogProps> = ({ open, onClose, template, activeChannel, onSuccess, masterCategories }) => {  const isEdit = !!template;
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("sms");
  const [category, setCategory] = useState<Category>("alert");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [autoApprove, setAutoApprove] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (template) {
      setName(template.name); setChannel(template.channel); setCategory(template.category);
      setContent(template.content); setSubject(template.subject || "");
      setPriority(template.priority); setAutoApprove(template.auto_approve === 1);
    } else {
      setName(""); setChannel((activeChannel === "all" ? "sms" : activeChannel) as Channel);
      setCategory("alert"); setContent(""); setSubject(""); setPriority("normal"); setAutoApprove(false);
    }
  }, [template, activeChannel, open]);

  const availableVars: string[] = channel === "email" ? ALL_EMAIL_VARS : CHANNEL_VARIABLES[category] ?? [];
  const detectedVars = extractVars(content);
  const insertVar = (v: string) => setContent((p) => p + `{${v}}`);
const handleContentChange = useCallback(
  (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value),
  []
);
  const handleSave = async () => {
    if (!name.trim() || !content.trim()) { toast.error("Name and content are required"); return; }
    setSaving(true);
    try {
      const payload: CreateTemplatePayload = {
        name, channel, category, content,
        subject: channel === "email" ? subject : undefined,
        variables: detectedVars, priority,
        auto_approve: autoApprove,
        status: autoApprove ? "approved" : "pending",
      };
      if (isEdit && template) { await updateTemplate(template.id, payload); toast.success("Template updated!"); }
      else { await createTemplate(payload); toast.success("Template created!"); }
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.message || (isEdit ? "Failed to update" : "Failed to create"));
    } finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={`💬 ${isEdit ? "Edit Template" : "Create Template"}`} desc={isEdit ? `Editing: ${template!.name}` : "Fill in the details below"} onClose={onClose} />

      <div className="overflow-y-auto flex-1">

        {/* ── section 1: meta fields ── */}
        <div className="px-6 py-5 border-b border-slate-100">
          {/* row 1: name + category */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
  <div className="flex flex-col gap-1">
    <label className={fieldLabelClass}>Template Name</label>
    <input className={fieldInputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email" />
  </div>
  <div className="flex flex-col gap-1">
    <label className={fieldLabelClass}>Category</label>
    <select className={fieldInputClass} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
      {(masterCategories.length > 0 ? masterCategories : CATEGORIES).map((c) => (
        <option key={c.key} value={c.key}>{c.label}</option>
      ))}
    </select>
  </div>
  <div className="flex flex-col gap-1">
    <label className={fieldLabelClass}>Priority</label>
    <select className={fieldInputClass} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
      <option value="normal">Normal</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  </div>
</div>

{/* Row 2: channel + email subject (wider) */}
<div className={`grid grid-cols-1 gap-3.5 ${channel === "email" ? "sm:grid-cols-[1fr_2fr]" : "sm:grid-cols-1"}`}>
  <div className="flex flex-col gap-1">
    <label className={fieldLabelClass}>Channel</label>
    <select className={fieldInputClass} value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
      <option value="sms">📱 SMS</option>
      <option value="whatsapp">💬 WhatsApp</option>
      <option value="email">📧 Email</option>
    </select>
  </div>
  {channel === "email" && (
    <div className="flex flex-col gap-1">
      <label className={fieldLabelClass}>Email Subject</label>
      <input className={fieldInputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Welcome to Roomac!" />
    </div>
  )}
</div>


          {/* ── LIVE VARIABLE PREVIEW — shows when name is typed & content has vars ── */}
          {name.trim() && detectedVars.length > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3.5" style={{ animation: "modalIn 0.2s ease" }}>
              {/* header */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-[7px] h-[7px] rounded-full bg-green-500 flex-shrink-0 inline-block" />
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Live Variable Preview</span>
              </div>
              {/* chips — each shows {var} → sample value */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {detectedVars.map((v, i) => {
                  const c = VAR_CHIP_COLORS[i % VAR_CHIP_COLORS.length];
const val = `{${v}}`;                  return (
                    <div key={v} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${c.bg} ${c.border} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className="font-mono font-semibold">{`{${v}}`}</span>
                      <span className="opacity-50 text-[10px]">→</span>
                      <span className="font-bold max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{val ?? "—"}</span>
                    </div>
                  );
                })}
              </div>
              {/* rendered preview with highlights */}
              <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Preview with sample data</div>
                <div className="text-[13px] text-slate-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContentPreview(content, detectedVars) }} />
              </div>
            </div>
          )}
        </div>

        {/* ── section 2: variable chips ── */}
        {availableVars.length > 0 && (
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Variables — click to insert</div>
              <div className="flex flex-wrap gap-1.5">
                {availableVars.slice(0, channel === "email" ? 20 : 999).map((v) => (
                  <button key={v} type="button" onClick={() => insertVar(v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-300 bg-white text-slate-600 text-[11px] font-mono font-medium cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {"{" + v + "}"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── section 3: content ── */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Template Content{" "}
              {channel !== "email" && <span className="text-slate-400 font-normal normal-case ml-2 text-[11px]">· {1000 - content.length} chars left</span>}
            </label>
            {channel === "email" ? (
              <EmailRichEditor value={content} onChange={setContent} availableVariables={availableVars} />
            ) : (
            <textarea className={`${fieldInputClass} resize-y leading-relaxed font-mono min-h-[120px]`}
  value={content} onChange={handleContentChange}
                placeholder="Template content. Use {variable} for dynamic data." rows={6} maxLength={1000} />
            )}
          </div>
        </div>

        {/* ── section 4: detected vars ── */}
        {detectedVars.length > 0 && (
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2.5">
              <div className="text-[11px] font-bold text-blue-600 mb-2">⚡ Detected variables in content:</div>
              <div className="flex flex-wrap gap-1.5">
                {detectedVars.map((v) => (
                  <span key={v} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono">{"{" + v + "}"}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── section 5: auto approve toggle ── */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2.5">
              <label className="relative w-[38px] h-[22px] flex-shrink-0 cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
                <span className="absolute inset-0 bg-slate-300 rounded-full transition-colors peer-checked:bg-blue-600" />
                <span className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </label>
              <span className="text-[13px] text-slate-600 font-medium">Auto-approve</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${autoApprove ? "bg-green-50 text-green-800 border-green-300" : "bg-amber-50 text-amber-800 border-amber-300"}`}>
              {autoApprove ? "✓ Will be approved" : "⏳ Will be pending review"}
            </span>
          </div>
        </div>
      </div>

      <ModalFooter>
        <BtnOutline onClick={onClose}>Cancel</BtnOutline>
        <BtnPrimary onClick={handleSave} disabled={saving || !name.trim() || !content.trim()}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
        </BtnPrimary>
      </ModalFooter>
    </ModalOverlay>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VIEW DIALOG
// ─────────────────────────────────────────────────────────────────────────────

const ViewDialog: FC<{ template: MessageTemplate | null; onClose: () => void }> = ({ template, onClose }) => {
  if (!template) return null;
  return (
    <ModalOverlay onClose={onClose} maxW="max-w-[580px]">
      <ModalHeader title="👁 Template Preview" desc={`#${template.id} · ${template.channel.toUpperCase()} · ${template.category}`} onClose={onClose} />
      <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-4">
        <div className="flex gap-1.5 flex-wrap">
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryTagClass(template.category)}`}>{getCategoryLabel(template.category)}</span>
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusTagClass(template.status)}`}>{template.status}</span>
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
            {template.channel === "sms" ? "📱" : template.channel === "whatsapp" ? "💬" : "📧"} {template.channel}
          </span>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 mb-1">Template Name</p>
          <p className="text-base font-bold text-slate-900">{template.name}</p>
        </div>
        {template.subject && (
          <div>
            <p className="text-[11px] text-slate-400 mb-1">Subject</p>
            <p className="text-[13px] font-semibold text-slate-700">{template.subject}</p>
          </div>
        )}
        <div>
          <p className="text-[11px] text-slate-400 mb-2">
            {template.channel === "email" ? "📧 Email Preview" : template.channel === "whatsapp" ? "💬 WhatsApp Preview" : "📱 SMS Preview"}
          </p>
          {template.channel === "email" && <EmailPreview template={template} />}
          {template.channel === "whatsapp" && <WhatsAppPreview template={template} />}
          {template.channel === "sms" && <SmsPreview template={template} />}
        </div>
        {template.variables.length > 0 && (
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Variables Used</p>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((v) => (
                <span key={v} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono">{"{" + v + "}"}</span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-50 rounded-lg p-3.5 border border-slate-200">
          {[{ l: "Priority", v: template.priority }, { l: "Used", v: `${template.usage_count}x` }, { l: "Auto Approve", v: template.auto_approve ? "Yes" : "No" }].map(({ l, v }) => (
            <div key={l} className="text-center">
              <p className="text-[10px] text-slate-400 mb-0.5">{l}</p>
              <p className="text-[13px] font-bold text-slate-900 capitalize">{v}</p>
            </div>
          ))}
        </div>
        {template.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
            <p className="text-[11px] text-red-700 font-bold mb-1">Rejection Reason</p>
            <p className="text-xs text-red-900">{template.rejection_reason}</p>
          </div>
        )}
      </div>
      <ModalFooter><BtnOutline onClick={onClose}>Close</BtnOutline></ModalFooter>
    </ModalOverlay>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT DIALOG
// ─────────────────────────────────────────────────────────────────────────────

const RejectDialog: FC<{ open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }> = ({ open, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return (
    <ModalOverlay onClose={onClose} maxW="max-w-[420px]">
      <ModalHeader title="❌ Reject Template" danger onClose={onClose} />
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <label className={fieldLabelClass}>Rejection Reason</label>
          <textarea className={`${fieldInputClass} resize-y`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this template is being rejected…" rows={4} />
        </div>
      </div>
      <ModalFooter>
        <BtnOutline onClick={onClose}>Cancel</BtnOutline>
        <BtnDanger onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}>
          {loading ? "Rejecting…" : "Reject Template"}
        </BtnDanger>
      </ModalFooter>
    </ModalOverlay>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK DELETE DIALOG
// ─────────────────────────────────────────────────────────────────────────────

const BulkDeleteDialog: FC<{ open: boolean; count: number; onClose: () => void; onConfirm: () => void; loading: boolean }> = ({ open, count, onClose, onConfirm, loading }) => {
  if (!open) return null;
  return (
    <ModalOverlay onClose={onClose} maxW="max-w-[400px]">
      <ModalHeader title="⚠️ Confirm Delete" danger onClose={onClose} />
      <div className="p-6">
        <p className="text-sm text-slate-700 leading-relaxed">
          Are you sure you want to delete <strong>{count}</strong> template{count > 1 ? "s" : ""}? This cannot be undone.
        </p>
      </div>
      <ModalFooter>
        <BtnOutline onClick={onClose}>Cancel</BtnOutline>
        <BtnDanger onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting…" : `Delete ${count}`}
        </BtnDanger>
      </ModalFooter>
    </ModalOverlay>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const CHANNELS_CONFIG = [
  { key: "all", label: "All Templates", icon: "⊞" },
  { key: "sms", label: "SMS", icon: "📱" },
  { key: "whatsapp", label: "WhatsApp", icon: "💬" },
  { key: "email", label: "Email", icon: "📧" },
];
// Add this component before TemplateCenterPage function
// Isko SearchInput ke ANDAR dalo, ya alag se wrapper banao
const SearchInput: FC<{ onSearch: (val: string) => void }> = React.memo(({ onSearch }) => {
  const [localVal, setLocalVal] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const onSearchRef = useRef(onSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);

  // Focus preserve karo
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        // Focus only if not already focused
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [localVal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const oldVal = onSearchRef.current;
      onSearchRef.current(val);
      // Focus immediately restore
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, 400);
  };

  return (
    <div className="relative flex-shrink-0">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="9" r="7"/><path d="M16 16l-3.5-3.5"/>
      </svg>
      <input
        ref={inputRef}
        value={localVal}
        onChange={handleChange}
        placeholder="Search templates…"
        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-full text-xs text-slate-800 outline-none w-44 sm:w-52 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
  );
});

export default function TemplateCenterPage() {
  const { can } = useAuth();
  const canManage = can("manage_templates");

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChannel, setActiveChannel] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
const [search, setSearch] = useState("");

  
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState<MessageTemplate | null>(null);
  const [viewTemplate, setViewTemplate] = useState<MessageTemplate | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
const [masterCategories, setMasterCategories] = useState<{ key: string; label: string }[]>([]);

  const loadTemplates = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const channelParam = activeChannel === "all" ? undefined : activeChannel;

      const { templates: data } = await getTemplates({
        channel: channelParam,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        search: search || undefined,
      });
      setTemplates(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [activeChannel, statusFilter, categoryFilter, search]);

const isFirstLoad = useRef(true);
useEffect(() => {
  if (isFirstLoad.current) {
    isFirstLoad.current = false;
    loadTemplates(false);
  } else {
    loadTemplates(true);
  }
}, [loadTemplates]);
  const handleRefresh = async () => { setRefreshing(true); await loadTemplates(); setRefreshing(false); toast.success("Refreshed"); };

  const filtered = useMemo(() => templates, [templates]);

  const channelCounts = useMemo(() => {
    const c: Record<string, number> = { all: templates.length, sms: 0, whatsapp: 0, email: 0 };
    templates.forEach((t) => (c[t.channel] = (c[t.channel] ?? 0) + 1));
    return c;
  }, [templates]);

  const pendingCount  = filtered.filter((t) => t.status === "pending").length;
  const approvedCount = filtered.filter((t) => t.status === "approved").length;

  const toggleSelect = (id: number) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

  const handleApprove   = async (id: number) => { try { await approveTemplate(id); toast.success("Template approved"); await loadTemplates(); } catch (err: any) { toast.error(err.message || "Failed to approve"); } };
  const handleDuplicate = async (id: number) => { try { await duplicateTemplate(id); toast.success("Template duplicated"); await loadTemplates(); } catch (err: any) { toast.error(err.message || "Failed to duplicate"); } };
  const handleDelete    = async (id: number) => { try { await deleteTemplate(id); toast.success("Template deleted"); await loadTemplates(); } catch (err: any) { toast.error(err.message || "Failed to delete"); } };

  const handleReject = async (reason: string) => {
    if (!rejectId) return;
    setRejectLoading(true);
    try { await rejectTemplate(rejectId, reason); toast.success("Template rejected"); await loadTemplates(); }
    catch (err: any) { toast.error(err.message || "Failed to reject"); }
    finally { setRejectLoading(false); setShowReject(false); setRejectId(null); }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try { await bulkDeleteTemplates(Array.from(selected)); toast.success(`Deleted ${selected.size} templates`); setSelected(new Set()); await loadTemplates(); }
    catch (err: any) { toast.error(err.message || "Failed to delete templates"); }
    finally { setBulkLoading(false); setShowBulkDelete(false); }
  };

  const handleCreateSuccess = () => { loadTemplates(); setShowCreate(false); setEditTemplate(null); };

  useEffect(() => {
  const fetchTemplateCategories = async () => {
    try {
      const { getMasterItemsByTab, getMasterValues } = await import("@/lib/masterApi");
      const tabRes = await getMasterItemsByTab("Common");
      const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
      const catItem = tabList.find(
        (i: any) => i.name?.toLowerCase().replace(/\s+/g, "") === "templatecategory"
      );
      if (catItem) {
        const valRes = await getMasterValues(catItem.id);
        const vals = Array.isArray(valRes.data) ? valRes.data : Array.isArray(valRes) ? valRes : [];
        const fetched = vals
          .filter((v: any) => v.isactive === 1 || v.is_active === 1)
          .map((v: any) => ({
            key: (v.value || v.name || "").toLowerCase().replace(/\s+/g, "_"),
            label: v.value || v.name || "",
          }));
        if (fetched.length > 0) setMasterCategories(fetched);
      }
    } catch {}
  };
  fetchTemplateCategories();
}, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-500 text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100  w-full flex flex-col">
      <div className="bg-white flex flex-col flex-1 ">

        {/* ══════════════════ STICKY HEADER ══════════════════ */}
        <div className="sticky top-24 z-10 bg-white border-b border-slate-200">

          {/* channel tabs row */}
          <div className="flex items-center" style={{ scrollbarWidth: "none" }}>
  {/* scrollable tabs — takes remaining space */}
  <div className="flex items-end gap-0 overflow-x-auto flex-1 px-5" style={{ scrollbarWidth: "none" }}>
    {CHANNELS_CONFIG.map((ch) => (
      <button
        key={ch.key}
        onClick={() => { setActiveChannel(ch.key); setSelected(new Set()); }}
        className={`flex items-center gap-1.5 px-4 py-3 bg-transparent text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors border-none outline-none ${
          activeChannel === ch.key ? "text-blue-600 font-semibold" : "text-slate-400 hover:text-slate-700"
        }`}
        style={{ borderBottomWidth: "2.5px", borderBottomStyle: "solid", borderBottomColor: activeChannel === ch.key ? "#1a56db" : "transparent" }}
      >
        <span>{ch.icon}</span>
        <span className="hidden sm:inline">{ch.label}</span>
        <span className="sm:hidden">{ch.label.split(" ")[0]}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeChannel === ch.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
          {channelCounts[ch.key] ?? 0}
        </span>
      </button>
    ))}
  </div>

  {/* fixed right side — NEVER scrolls */}
  <div className="flex items-center gap-2 px-3 pb-1 flex-shrink-0 border-l border-slate-100">
    <button onClick={handleRefresh} disabled={refreshing} title="Refresh"
      className="w-[34px] h-[34px] border border-slate-200 rounded-full bg-white cursor-pointer flex items-center justify-center text-slate-400 text-base hover:bg-slate-50 transition-colors flex-shrink-0">
      {refreshing ? "⟳" : "↻"}
    </button>
    {canManage && (
      <button onClick={() => { setEditTemplate(null); setShowCreate(true); }}
        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-none rounded-full px-3 py-[7px] text-xs font-semibold cursor-pointer shadow-sm hover:shadow-md transition-all whitespace-nowrap flex-shrink-0">
        <span className="hidden sm:inline">+ Create Template</span>
        <span className="sm:hidden">+ Create</span>
      </button>
    )}
  </div>
</div>


          {/* filters row */}
          <div className="px-5 py-2.5 flex items-center gap-2 flex-wrap border-t border-slate-100">
            {/* status pills */}
            <div className="flex gap-1 flex-wrap">
              {[
                { key: "all",      label: "All",      count: filtered.length, icon: "⊞" },
                { key: "pending",  label: "Pending",  count: pendingCount,    icon: "⏳" },
                { key: "approved", label: "Approved", count: approvedCount,   icon: "✅" },
              ].map((s) => (
                <button key={s.key} onClick={() => setStatusFilter(s.key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-none text-xs font-medium cursor-pointer transition-all ${
                    statusFilter === s.key ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm" : "bg-transparent text-slate-400 hover:bg-slate-100"
                  }`}>
                  {s.icon} {s.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusFilter === s.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {s.count}
                  </span>
                </button>
              ))}
            </div>
            {/* search + category — push right */}
            <div className="ml-auto flex items-center gap-2 flex-wrap">
<SearchInput onSearch={setSearch} />

              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-[34px] px-2.5 border border-slate-200 rounded-full text-xs text-slate-600 bg-slate-50 outline-none cursor-pointer focus:border-blue-500">
                <option value="all">All Categories</option>
{(masterCategories.length > 0 ? masterCategories : CATEGORIES).map((c) => (
  <option key={c.key} value={c.key}>{c.label}</option>
))}              </select>
            </div>
          </div>
        </div>

        {/* bulk bar */}
        {selected.size > 0 && canManage && (
          <div className="mx-4 mt-2.5 bg-white border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                {selected.size} selected
              </span>
              <button onClick={() => setSelected(new Set())}
                className="flex items-center gap-1 bg-transparent border-none text-slate-400 text-xs cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100">
                ✕ Clear
              </button>
            </div>
            <button onClick={() => setShowBulkDelete(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white border-none rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer">
              🗑 Delete {selected.size}
            </button>
          </div>
        )}

        {/* ══════════════════ SCROLLABLE GRID ══════════════════ */}
        <div className=" max-h-[530px] flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3.5 py-20 px-10 text-center">
              <div className="text-5xl opacity-40">📭</div>
              <h3 className="text-base font-bold text-slate-500">No templates found</h3>
              <p className="text-[13px] text-slate-400 max-w-[300px]">Try adjusting your filters or create a new template.</p>
              {canManage && (
                <button onClick={() => { setEditTemplate(null); setShowCreate(true); }}
                  className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-none rounded-full px-5 py-2 text-[13px] font-semibold cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-px transition-all">
                  + Create Template
                </button>
              )}
            </div>
          ) : (
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
              {filtered.map((tmpl) => (
                <TemplateCard
                  key={tmpl.id}
                  template={tmpl}
                  selected={selected.has(tmpl.id)}
                  onSelect={() => toggleSelect(tmpl.id)}
                  onView={() => setViewTemplate(tmpl)}
                  onEdit={() => { setEditTemplate(tmpl); setShowCreate(true); }}
                  onDuplicate={() => handleDuplicate(tmpl.id)}
                  onDelete={() => handleDelete(tmpl.id)}
                  onApprove={() => handleApprove(tmpl.id)}
                  onReject={() => { setRejectId(tmpl.id); setShowReject(true); }}
                  canManage={canManage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ DIALOGS ══ */}
      <CreateEditDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); setEditTemplate(null); }}
        template={editTemplate}
        activeChannel={activeChannel}
        onSuccess={handleCreateSuccess}
          masterCategories={masterCategories}  // ADD THIS

      />
      <ViewDialog template={viewTemplate} onClose={() => setViewTemplate(null)} />
      <RejectDialog
        open={showReject}
        onClose={() => { setShowReject(false); setRejectId(null); }}
        onConfirm={handleReject}
        loading={rejectLoading}
      />
      <BulkDeleteDialog
        open={showBulkDelete}
        count={selected.size}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        loading={bulkLoading}
      />
    </div>
  );
}