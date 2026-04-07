


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
      toggleTemplateActive,   // ADD

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

const CHANNEL_VARIABLES: Record<string, string[]> = {
    all: ALL_EMAIL_VARS,  // ← YEH ADD KARO

  otp: ["otp", "tenant_name", "expiry_minutes"],
  payment: ["tenant_name", "amount", "property_name", "receipt_id", "payment_date", "due_date"],
  verification: ["tenant_name", "verify_link", "otp", "expiry_hours"],
  marketing: ["name", "property_name", "location", "price", "cta_url", "discount"],
  alert: ["tenant_name", "request_id", "status", "staff_name", "property_name"],
  reminder: ["tenant_name", "amount", "due_date", "property_name", "room_number"],
  welcome: ["tenant_name", "property_name", "checkin_date", "room_number", "staff_name"],
  notice: ["tenant_name", "notice_message", "effective_date", "property_name"],
};
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
   onToggleStatus: () => void;
}

const TemplateCard: FC<CardProps> = ({
  template, selected, onSelect, onView, onEdit,
  onDuplicate, onDelete, onApprove, onReject, canManage,
    onToggleStatus,  // ADD THIS

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
     {/* footer */}
<div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-shrink-0 mt-auto">
  <div
    onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
    className="flex items-center gap-2 cursor-pointer"
    title={template.is_active === 1 ? 'Deactivate' : 'Activate'}
  >
    <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
      template.is_active === 1 ? 'bg-green-500' : 'bg-slate-300'
    }`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        template.is_active === 1 ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </div>
    <span className={`text-[11px] font-semibold ${
      template.is_active === 1 ? 'text-green-600' : 'text-slate-400'
    }`}>
      {template.is_active === 1 ? 'Active' : 'Inactive'}
    </span>
  </div>
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

const availableVars: string[] = CHANNEL_VARIABLES[category as string] ?? ALL_EMAIL_VARS;  const detectedVars = extractVars(content);
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
{masterCategories.length > 0
  ? masterCategories.map((c) => (
      <option key={c.key} value={c.key}>{c.label}</option>
    ))
  : <option disabled>No categories available</option>
}
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
const [allChannelCounts, setAllChannelCounts] = useState<Record<string, number>>({ all: 0, sms: 0, whatsapp: 0, email: 0 });

const [activeFilter, setActiveFilter] = useState("all"); // "all" | "1" | "0"

  
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
const [allStatusCounts, setAllStatusCounts] = useState({ 
  pending: 0, 
  approved: 0, 
  rejected: 0, 
  total: 0,
  active: 0,
  inactive: 0 
});

// Function to fetch counts - can be called multiple times
const fetchCounts = useCallback(async () => {
  try {
    const { templates: all } = await getTemplates({});
    const c: Record<string, number> = { all: all.length, sms: 0, whatsapp: 0, email: 0 };
    const pending = all.filter(t => t.status === 'pending').length;
    const approved = all.filter(t => t.status === 'approved').length;
    const rejected = all.filter(t => t.status === 'rejected').length;
    const active = all.filter(t => t.is_active === 1).length;
    const inactive = all.filter(t => t.is_active === 0).length;
    
    setAllStatusCounts({ pending, approved, rejected, total: all.length, active, inactive });
    all.forEach((t) => (c[t.channel] = (c[t.channel] ?? 0) + 1));
    setAllChannelCounts(c);
  } catch {}
}, []);

// Initial fetch
useEffect(() => {
  fetchCounts();
}, [fetchCounts]);
  const loadTemplates = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const channelParam = activeChannel === "all" ? undefined : activeChannel;

      const { templates: data } = await getTemplates({
        channel: channelParam,
        is_active: activeFilter !== "all" ? activeFilter : undefined,

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
  }, [activeChannel, statusFilter, categoryFilter, search, activeFilter]);

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

 const channelCounts = allChannelCounts;
//  const refreshCounts = async () => {
//   try {
//     const { templates: all } = await getTemplates({});
//     const c: Record<string, number> = { all: all.length, sms: 0, whatsapp: 0, email: 0 };
//     const pending = all.filter(t => t.status === 'pending').length;
//     const approved = all.filter(t => t.status === 'approved').length;
//     const rejected = all.filter(t => t.status === 'rejected').length;
//     const active = all.filter(t => t.is_active === 1).length;
//     const inactive = all.filter(t => t.is_active === 0).length;
    
//     setAllStatusCounts({ pending, approved, rejected, total: all.length, active, inactive });
//     all.forEach((t) => (c[t.channel] = (c[t.channel] ?? 0) + 1));
//     setAllChannelCounts(c);
//   } catch {}
// };

const handleToggleStatus = async (template: MessageTemplate) => {
  try {
    await toggleTemplateActive(template.id);
    toast.success(template.is_active === 1 ? "Template deactivated" : "Template activated");
    // Load templates and refresh counts sequentially, not parallel
    await loadTemplates();
    await fetchCounts();  // Use fetchCounts instead of refreshCounts
  } catch (err: any) {
    toast.error(err.message || "Failed to toggle");
  }
};


  const pendingCount  = allStatusCounts.pending;
const approvedCount = allStatusCounts.approved;
  const toggleSelect = (id: number) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

const handleApprove = async (id: number) => {
  try { 
    await approveTemplate(id); 
    toast.success("Template approved"); 
    await loadTemplates();
    await fetchCounts();  // ✅ Changed from refreshCounts
  } catch (err: any) { 
    toast.error(err.message || "Failed to approve"); 
  }
};  


const handleDuplicate = async (id: number) => { try { await duplicateTemplate(id); toast.success("Template duplicated"); await loadTemplates(); } catch (err: any) { toast.error(err.message || "Failed to duplicate"); } };
const handleDelete = async (id: number) => {
  try { 
    await deleteTemplate(id); 
    toast.success("Template deleted"); 
    await loadTemplates();
    await fetchCounts();  // ✅ Changed from refreshCounts
  } catch (err: any) { 
    toast.error(err.message || "Failed to delete"); 
  }
};

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
setMasterCategories(fetched);
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
          {/* filters row */}
<div className="px-5 py-2.5 flex items-center gap-2 flex-wrap border-t border-slate-100">
  {/* status pills - horizontal scroll on mobile with full text */}
  <div className="flex gap-1 flex-nowrap overflow-x-auto pb-1 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {[
      { key: "all",      label: "All",      count: allStatusCounts.total,    icon: "⊞" },
      { key: "pending",  label: "Pending",  count: allStatusCounts.pending,  icon: "⏳" },
      { key: "approved", label: "Approved", count: allStatusCounts.approved, icon: "✅" },
      { key: "rejected", label: "Rejected", count: allStatusCounts.rejected, icon: "❌" },
      { key: "active",   label: "Active",   count: allStatusCounts.active,   icon: "🟢" },
      { key: "inactive", label: "Inactive", count: allStatusCounts.inactive, icon: "⚪" },
    ].map((s) => (
      <button 
        key={s.key} 
        onClick={() => {
  if (s.key === 'active') {
    setActiveFilter('1');
    setStatusFilter('all');  // ✅ Reset status filter when clicking Active
  }
  else if (s.key === 'inactive') {
    setActiveFilter('0');
    setStatusFilter('all');  // ✅ Reset status filter when clicking Inactive
  }
  else {
    setActiveFilter('all');   // ✅ Reset active filter when clicking status tabs
    setStatusFilter(s.key);
  }
}}
        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border-none text-[11px] sm:text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
          (s.key === 'active' && activeFilter === '1') ||
          (s.key === 'inactive' && activeFilter === '0') ||
          (s.key !== 'active' && s.key !== 'inactive' && statusFilter === s.key)
            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm" 
            : "bg-transparent text-slate-400 hover:bg-slate-100"
        }`}>
        <span className="text-[12px] sm:text-[14px]">{s.icon}</span>
        <span className="whitespace-nowrap">{s.label}</span>
        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          (s.key === 'active' && activeFilter === '1') ||
          (s.key === 'inactive' && activeFilter === '0') ||
          (s.key !== 'active' && s.key !== 'inactive' && statusFilter === s.key)
            ? "bg-white/25 text-white" 
            : "bg-slate-100 text-slate-400"
        }`}>
          {s.count}
        </span>
      </button>
    ))}
  </div>
  
  {/* search + category - responsive */}
  <div className="flex items-center gap-2 flex-wrap ml-auto">
    <SearchInput onSearch={setSearch} />
    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
      className="h-[34px] px-2 sm:px-2.5 border border-slate-200 rounded-full text-[11px] sm:text-xs text-slate-600 bg-slate-50 outline-none cursor-pointer focus:border-blue-500">
      <option value="all">All Categories</option>
      {masterCategories.length > 0
        ? masterCategories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))
        : <option disabled>No categories</option>
      }
    </select>
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
                    onToggleStatus={() => handleToggleStatus(tmpl)}  // ADD THIS

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