// components/admin/tenants/tenant-import-modal.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  UserX,
  ChevronRight,
  RefreshCw,
  FileWarning,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (formData: FormData) => Promise<void>;
  importing: boolean;
  currentTab: "all" | "vacated" | "deleted";
}

interface ParsedRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
  isCouple: boolean;
}

interface PreviewState {
  valid: ParsedRow[];
  invalid: ParsedRow[];
  skipped: ParsedRow[];
  totalRows: number;
}

// ─── Required & optional columns ──────────────────────────────────────────────

const REQUIRED_COLUMNS = ["Full Name", "Email", "Phone"];

const COUPLE_INDICATOR_COLUMNS = [
  "Partner Name",
  "Partner Email",
  "Partner Phone",
  "Is Couple",
  "Couple",
  "Partner",
];

const TEMPLATE_COLUMNS = [
  "Full Name",
  "Salutation",
  "Email",
  "Phone",
  "Country Code",
  "Gender",
  "Date of Birth",
  "Occupation Category",
  "Exact Occupation",
  "Organization",
  "Address",
  "City",
  "State",
  "Pincode",
  "Emergency Contact Name",
  "Emergency Contact Phone",
  "Check-in Date",
  "Preferred Sharing",
  "Monthly Income",
  "Notes",
];

const SAMPLE_ROWS = [
  {
    "Full Name": "Rahul Sharma",
    Salutation: "Mr",
    Email: "rahul.sharma@example.com",
    Phone: "9876543210",
    "Country Code": "+91",
    Gender: "Male",
    "Date of Birth": "1995-06-15",
    "Occupation Category": "Service",
    "Exact Occupation": "Software Engineer",
    Organization: "TechCorp Pvt Ltd",
    Address: "123 MG Road",
    City: "Pune",
    State: "Maharashtra",
    Pincode: "411001",
    "Emergency Contact Name": "Sunita Sharma",
    "Emergency Contact Phone": "9123456789",
    "Check-in Date": "2024-02-01",
    "Preferred Sharing": "single",
    "Monthly Income": "60000",
    Notes: "",
  },
  {
    "Full Name": "Priya Mehta",
    Salutation: "Ms",
    Email: "priya.mehta@example.com",
    Phone: "9765432108",
    "Country Code": "+91",
    Gender: "Female",
    "Date of Birth": "1998-11-22",
    "Occupation Category": "Student",
    "Exact Occupation": "MBA Student",
    Organization: "Symbiosis Institute",
    Address: "456 FC Road",
    City: "Pune",
    State: "Maharashtra",
    Pincode: "411004",
    "Emergency Contact Name": "Vijay Mehta",
    "Emergency Contact Phone": "9234567890",
    "Check-in Date": "2024-03-01",
    "Preferred Sharing": "double",
    "Monthly Income": "",
    Notes: "Needs quiet floor",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TenantImportModal({
  isOpen,
  onClose,
  onImport,
  importing,
  currentTab,
}: TenantImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [parsing, setParsing] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<
    "valid" | "invalid" | "skipped"
  >("valid");

  // ── Download template ──────────────────────────────────────────────────────

  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Main data sheet
    const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, {
      header: TEMPLATE_COLUMNS,
    });

    // Column widths
    ws["!cols"] = TEMPLATE_COLUMNS.map((col) => ({
      wch: Math.max(col.length + 2, 18),
    }));

    XLSX.utils.book_append_sheet(wb, ws, "Tenants");

    // Instructions sheet
    const instructions = [
      { Field: "IMPORT RULES", Notes: "" },
      {
        Field: "─────────────",
        Notes: "──────────────────────────────────────────────",
      },
      {
        Field: "Single tenants only",
        Notes:
          "This import supports individual tenants only. Couple/partner tenants must be created manually via the UI.",
      },
      {
        Field: "Required columns",
        Notes: REQUIRED_COLUMNS.join(", "),
      },
      {
        Field: "Date format",
        Notes: "YYYY-MM-DD (e.g. 2024-06-15)",
      },
      {
        Field: "Occupation Category",
        Notes: "Service | Business | Student | Other",
      },
      {
        Field: "Gender",
        Notes: "Male | Female | Other",
      },
      {
        Field: "Preferred Sharing",
        Notes: "single | double | triple",
      },
      {
        Field: "Country Code",
        Notes: "+91 (default if blank)",
      },
      { Field: "", Notes: "" },
      { Field: "DO NOT ADD", Notes: "" },
      {
        Field: "─────────────",
        Notes: "──────────────────────────────────────────────",
      },
      {
        Field: "Partner columns",
        Notes:
          "Do not add Partner Name / Partner Email / Is Couple columns — those rows will be rejected.",
      },
    ];

    const instrWs = XLSX.utils.json_to_sheet(instructions, {
      header: ["Field", "Notes"],
    });
    instrWs["!cols"] = [{ wch: 22 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, instrWs, "Instructions");

    XLSX.writeFile(wb, "tenant_import_template.xlsx");
    toast.success("Template downloaded!");
  }, []);

  // ── Parse uploaded file ────────────────────────────────────────────────────

  const parseFile = useCallback(async (file: File) => {
    setParsing(true);
    setPreview(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        raw: false,
      });

      const valid: ParsedRow[] = [];
      const invalid: ParsedRow[] = [];
      const skipped: ParsedRow[] = [];

      rows.forEach((row, idx) => {
        const rowIndex = idx + 2; // 1-indexed + header row
        const errors: string[] = [];
        const warnings: string[] = [];

        // Normalise keys (trim whitespace)
        const normRow: Record<string, string> = {};
        Object.entries(row).forEach(([k, v]) => {
          normRow[k.trim()] = String(v ?? "").trim();
        });

        // ── Detect couple indicator columns ──
        const coupleKeys = COUPLE_INDICATOR_COLUMNS.filter(
          (col) => col.toLowerCase() in Object.fromEntries(
            Object.keys(normRow).map((k) => [k.toLowerCase(), true])
          )
        );
        const hasPartnerData = coupleKeys.length > 0;

        // Check for non-empty partner fields
        const partnerFieldFilled = coupleKeys.some((col) => {
          const matchedKey = Object.keys(normRow).find(
            (k) => k.toLowerCase() === col.toLowerCase()
          );
          return matchedKey && normRow[matchedKey] !== "";
        });

        const isCouple = hasPartnerData && partnerFieldFilled;

        if (isCouple) {
          skipped.push({
            rowIndex,
            data: normRow,
            errors: [
              "Row contains partner/couple data — skipped. Create couple tenants manually via the UI.",
            ],
            warnings: [],
            isValid: false,
            isCouple: true,
          });
          return;
        }

        // ── Validate required fields ──
        REQUIRED_COLUMNS.forEach((col) => {
          if (!normRow[col]) {
            errors.push(`"${col}" is required`);
          }
        });

        // ── Email format ──
        if (normRow["Email"] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normRow["Email"])) {
          errors.push(`"Email" is not a valid email address`);
        }

        // ── Phone format ──
        if (normRow["Phone"] && !/^\d{7,15}$/.test(normRow["Phone"].replace(/\s/g, ""))) {
          warnings.push(`"Phone" may not be valid (expected 7-15 digits)`);
        }

        // ── Occupation category ──
        if (
          normRow["Occupation Category"] &&
          !["Service", "Business", "Student", "Other"].includes(
            normRow["Occupation Category"]
          )
        ) {
          warnings.push(
            `"Occupation Category" should be Service, Business, Student, or Other`
          );
        }

        const parsed: ParsedRow = {
          rowIndex,
          data: normRow,
          errors,
          warnings,
          isValid: errors.length === 0,
          isCouple: false,
        };

        if (parsed.isValid) {
          valid.push(parsed);
        } else {
          invalid.push(parsed);
        }
      });

      setPreview({ valid, invalid, skipped, totalRows: rows.length });
      setActivePreviewTab(valid.length > 0 ? "valid" : invalid.length > 0 ? "invalid" : "skipped");
    } catch (err) {
      console.error("Parse error:", err);
      toast.error("Failed to parse file. Make sure it's a valid .xlsx or .csv file.");
    } finally {
      setParsing(false);
    }
  }, []);

  // ── File selection ─────────────────────────────────────────────────────────

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
        toast.error("Only .xlsx, .xls, or .csv files are supported");
        return;
      }
      setSelectedFile(file);
      parseFile(file);
    },
    [parseFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ── Submit import ──────────────────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    if (!selectedFile || !preview || preview.valid.length === 0) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("target_tab", currentTab);
    formData.append("skip_couples", "true");

    try {
      await onImport(formData);
    } catch {
      // handled by parent
    }
  }, [selectedFile, preview, currentTab, onImport]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-white leading-tight">
                Import Tenants
              </DialogTitle>
              <p className="text-[10px] text-blue-200 mt-0.5">
                Single tenants only · Excel / CSV
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-5 space-y-4">

            {/* ── Couple restriction notice ── */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Single tenants only via import</p>
                <p className="text-[11px] leading-relaxed">
                  This importer supports <strong>individual tenants only</strong>.
                  Couple / partner bookings require proper linking and must be created
                  manually through the <strong>Add Tenant</strong> UI. Any rows with
                  partner-related columns will be automatically skipped.
                </p>
              </div>
            </div>

            {/* ── Template download ── */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-800">Download Template</p>
                  <p className="text-[10px] text-blue-600">
                    Use our template to ensure correct column names & formats
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-3 border-blue-300 text-blue-700 hover:bg-blue-100 flex-shrink-0"
                onClick={downloadTemplate}
              >
                <Download className="w-3 h-3 mr-1.5" />
                Template
              </Button>
            </div>

            {/* ── File drop zone ── */}
            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? "text-blue-500" : "text-gray-300"}`} />
                <p className="text-sm font-medium text-gray-600">
                  {dragOver ? "Drop file here" : "Click to upload or drag & drop"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">.xlsx, .xls, or .csv</p>
              </div>
            ) : (
              /* ── File selected + preview ── */
              <div className="space-y-3">
                {/* File info bar */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Parsing spinner */}
                {parsing && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 py-3 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Parsing file...
                  </div>
                )}

                {/* Preview panel */}
                {!parsing && preview && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">

                    {/* Summary badges */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mr-1">
                        Preview
                      </span>
                      <Badge
                        className="text-[9px] px-2 py-0 h-5 cursor-pointer bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                        onClick={() => setActivePreviewTab("valid")}
                      >
                        <CheckCircle className="w-2.5 h-2.5 mr-1" />
                        {preview.valid.length} Ready
                      </Badge>
                      {preview.invalid.length > 0 && (
                        <Badge
                          className="text-[9px] px-2 py-0 h-5 cursor-pointer bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                          onClick={() => setActivePreviewTab("invalid")}
                        >
                          <X className="w-2.5 h-2.5 mr-1" />
                          {preview.invalid.length} Errors
                        </Badge>
                      )}
                      {preview.skipped.length > 0 && (
                        <Badge
                          className="text-[9px] px-2 py-0 h-5 cursor-pointer bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                          onClick={() => setActivePreviewTab("skipped")}
                        >
                          <UserX className="w-2.5 h-2.5 mr-1" />
                          {preview.skipped.length} Skipped (couples)
                        </Badge>
                      )}
                    </div>

                    {/* Tab content */}
                    <div className="max-h-52 overflow-y-auto">
                      {/* Valid rows */}
                      {activePreviewTab === "valid" && (
                        <table className="w-full text-[10px]">
                          <thead className="bg-green-50 sticky top-0">
                            <tr>
                              <th className="px-2 py-1.5 text-left font-semibold text-green-700 w-12">Row</th>
                              <th className="px-2 py-1.5 text-left font-semibold text-green-700">Name</th>
                              <th className="px-2 py-1.5 text-left font-semibold text-green-700">Email</th>
                              <th className="px-2 py-1.5 text-left font-semibold text-green-700">Phone</th>
                              <th className="px-2 py-1.5 text-left font-semibold text-green-700">City</th>
                              <th className="px-2 py-1.5 text-left font-semibold text-green-700 w-16">Warns</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.valid.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-3 py-4 text-center text-gray-400">
                                  No valid rows
                                </td>
                              </tr>
                            ) : (
                              preview.valid.map((row) => (
                                <tr key={row.rowIndex} className="border-t border-gray-100 hover:bg-green-50/40">
                                  <td className="px-2 py-1.5 text-gray-400 font-mono">{row.rowIndex}</td>
                                  <td className="px-2 py-1.5 font-medium text-gray-800 truncate max-w-[100px]">{row.data["Full Name"]}</td>
                                  <td className="px-2 py-1.5 text-gray-600 truncate max-w-[120px]">{row.data["Email"]}</td>
                                  <td className="px-2 py-1.5 text-gray-600">{row.data["Phone"]}</td>
                                  <td className="px-2 py-1.5 text-gray-500">{row.data["City"] || "—"}</td>
                                  <td className="px-2 py-1.5">
                                    {row.warnings.length > 0 ? (
                                      <span title={row.warnings.join("; ")} className="text-amber-500 cursor-help">
                                        ⚠ {row.warnings.length}
                                      </span>
                                    ) : (
                                      <span className="text-green-400">✓</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {/* Invalid rows */}
                      {activePreviewTab === "invalid" && (
                        <div className="divide-y divide-gray-100">
                          {preview.invalid.map((row) => (
                            <div key={row.rowIndex} className="px-3 py-2 hover:bg-red-50/30">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-mono text-gray-400">Row {row.rowIndex}</span>
                                <span className="text-[10px] font-semibold text-gray-700">{row.data["Full Name"] || "(no name)"}</span>
                              </div>
                              {row.errors.map((err, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-red-600">
                                  <X className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                                  {err}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skipped (couple) rows */}
                      {activePreviewTab === "skipped" && (
                        <div className="divide-y divide-gray-100">
                          {preview.skipped.length === 0 ? (
                            <p className="px-3 py-4 text-center text-[11px] text-gray-400">
                              No couple rows detected
                            </p>
                          ) : (
                            preview.skipped.map((row) => (
                              <div key={row.rowIndex} className="px-3 py-2 hover:bg-amber-50/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-mono text-gray-400">Row {row.rowIndex}</span>
                                  <span className="text-[10px] font-semibold text-gray-700">{row.data["Full Name"] || "(no name)"}</span>
                                  <Badge className="text-[8px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border border-amber-200">
                                    <Users className="w-2 h-2 mr-0.5" />Couple
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-amber-700 flex items-start gap-1.5">
                                  <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                                  Skipped — create this couple tenant manually via the Add Tenant UI.
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Rules quick reference ── */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" /> Required columns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {REQUIRED_COLUMNS.map((col) => (
                  <Badge
                    key={col}
                    variant="outline"
                    className="text-[9px] px-2 py-0 h-4 border-blue-300 text-blue-700 bg-blue-50"
                  >
                    {col}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">
                Dates: <code className="bg-gray-100 px-1 rounded">YYYY-MM-DD</code>
                {" · "}Occupation: Service, Business, Student, Other
                {" · "}Sharing: single, double, triple
              </p>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t bg-white px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="text-[10px] text-gray-400">
            {preview ? (
              <>
                <span className="text-green-600 font-semibold">{preview.valid.length} will import</span>
                {preview.skipped.length > 0 && (
                  <span className="ml-2 text-amber-500">{preview.skipped.length} couple rows skipped</span>
                )}
                {preview.invalid.length > 0 && (
                  <span className="ml-2 text-red-500">{preview.invalid.length} have errors</span>
                )}
              </>
            ) : (
              "Upload a file to preview"
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-3 border-gray-200"
              onClick={handleClose}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              onClick={handleImport}
              disabled={!preview || preview.valid.length === 0 || importing || parsing}
            >
              {importing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1.5" />
                  Import {preview?.valid.length ?? 0} Tenant{preview?.valid.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}