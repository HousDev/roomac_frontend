// app/admin/permissions/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Shield,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  Save,
  Users,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { consumeMasters } from "@/lib/masterApi";

// ─── API instance ─────────────────────────────────────────────────────────────

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:3001"
    : "https://roomac.in";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffUserItem = {
  id: number;
  staff_id?: number;
  email: string;
  name?: string;
  role?: string;
  role_id?: number;
  has_custom_permissions?: number;
  permissions?: Record<string, boolean>;
};

type RoleItem = {
  id: number;
  name: string;
  permissions?: Record<string, boolean>;
};

// ─── COMPLETE PERMISSIONS LIST ────────────────────────────────────────────────

const PERMISSIONS_LIST = [
  { action: "view_dashboard", label: "View Dashboard", module: "Dashboard" },
  { action: "view_properties", label: "View Properties", module: "Properties" },
  { action: "create_properties", label: "Create Properties", module: "Properties" },
  { action: "edit_properties", label: "Edit Properties", module: "Properties" },
  { action: "delete_properties", label: "Delete Properties", module: "Properties" },
  { action: "export_properties", label: "Export Properties", module: "Properties" },
  { action: "view_rooms", label: "View Rooms", module: "Rooms" },
  { action: "create_rooms", label: "Create Rooms", module: "Rooms" },
  { action: "edit_rooms", label: "Edit Rooms", module: "Rooms" },
  { action: "delete_rooms", label: "Delete Rooms", module: "Rooms" },
  { action: "export_rooms", label: "Export Rooms", module: "Rooms" },
  { action: "view_tenants", label: "View Tenants", module: "Tenants" },
  { action: "create_tenants", label: "Create Tenants", module: "Tenants" },
  { action: "edit_tenants", label: "Edit Tenants", module: "Tenants" },
  { action: "delete_tenants", label: "Delete Tenants", module: "Tenants" },
  { action: "export_tenants", label: "Export Tenants", module: "Tenants" },
  { action: "view_payments", label: "View Payments", module: "Payments" },
  { action: "create_payments", label: "Create Payments", module: "Payments" },
  { action: "edit_payments", label: "Edit Payments", module: "Payments" },
  { action: "delete_payments", label: "Delete Payments", module: "Payments" },
  { action: "export_payments", label: "Export Payments", module: "Payments" },
  { action: "approve_payments", label: "Approve Payments", module: "Payments" },
  { action: "reject_payments", label: "Reject Payments", module: "Payments" },
  { action: "view_expenses", label: "View Expenses", module: "Expenses" },
  { action: "create_expenses", label: "Create Expenses", module: "Expenses" },
  { action: "edit_expenses", label: "Edit Expenses", module: "Expenses" },
  { action: "delete_expenses", label: "Delete Expenses", module: "Expenses" },
  { action: "export_expenses", label: "Export Expenses", module: "Expenses" },
  { action: "view_reports", label: "View Reports", module: "Reports" },
  { action: "export_reports", label: "Export Reports", module: "Reports" },
  { action: "view_document_dashboard", label: "View Document Dashboard", module: "Documents" },
  { action: "create_documents", label: "Create Documents", module: "Documents" },
  { action: "view_all_documents", label: "View All Documents", module: "Documents" },
  { action: "delete_documents", label: "Delete Documents", module: "Documents" },
  { action: "export_documents", label: "Export Documents", module: "Documents" },
  { action: "manage_templates", label: "Manage Templates", module: "Documents" },
  { action: "view_enquiries", label: "View Enquiries", module: "Enquiries" },
  { action: "create_enquiries", label: "Create Enquiries", module: "Enquiries" },
  { action: "edit_enquiries", label: "Edit Enquiries", module: "Enquiries" },
  { action: "delete_enquiries", label: "Delete Enquiries", module: "Enquiries" },
  { action: "view_notifications", label: "View Notifications", module: "Notifications" },
  { action: "send_notifications", label: "Send Notifications", module: "Notifications" },
  { action: "view_requests", label: "View Requests", module: "Requests" },
  { action: "update_request_status", label: "Update Request Status", module: "Requests" },
  { action: "manage_complaints", label: "Manage Complaints", module: "Requests" },
  { action: "manage_maintenance", label: "Manage Maintenance", module: "Requests" },
  { action: "manage_receipts", label: "Manage Receipts", module: "Requests" },
  { action: "manage_vacate_requests", label: "Manage Vacate Requests", module: "Requests" },
  { action: "manage_change_bed", label: "Manage Change Bed", module: "Requests" },
  { action: "manage_account_deletion", label: "Manage Account Deletion", module: "Requests" },
  { action: "manage_notice_period", label: "Manage Notice Period", module: "Requests" },
  { action: "manage_support", label: "Manage Support", module: "Requests" },
  { action: "delete_requests", label: "Delete Requests", module: "Requests" },
  { action: "view_staff", label: "View Staff", module: "Staffs" },
  { action: "create_staff", label: "Create Staff", module: "Staffs" },
  { action: "edit_staff", label: "Edit Staff", module: "Staffs" },
  { action: "delete_staff", label: "Delete Staff", module: "Staffs" },
  { action: "export_staff", label: "Export Staff", module: "Staffs" },
  { action: "view_offers", label: "View Offers", module: "Offers" },
  { action: "create_offers", label: "Create Offers", module: "Offers" },
  { action: "edit_offers", label: "Edit Offers", module: "Offers" },
  { action: "delete_offers", label: "Delete Offers", module: "Offers" },
  { action: "view_addons", label: "View Add-ons", module: "Add-ons" },
  { action: "create_addons", label: "Create Add-ons", module: "Add-ons" },
  { action: "edit_addons", label: "Edit Add-ons", module: "Add-ons" },
  { action: "delete_addons", label: "Delete Add-ons", module: "Add-ons" },
  { action: "view_inventory_dashboard", label: "View Inventory Dashboard", module: "Inventory" },
  { action: "manage_assets", label: "Manage Assets", module: "Inventory" },
  { action: "manage_material_purchase", label: "Manage Material Purchase", module: "Inventory" },
  { action: "manage_tenant_handover", label: "Manage Tenant Handover", module: "Inventory" },
  { action: "manage_moveout_inspection", label: "Manage Move-Out Inspection", module: "Inventory" },
  { action: "manage_settlements", label: "Manage Settlements", module: "Inventory" },
  { action: "manage_penalty_rules", label: "Manage Penalty Rules", module: "Inventory" },
  { action: "view_visitors_dashboard", label: "View Visitors Dashboard", module: "Visitors" },
  { action: "view_visitor_logs", label: "View Visitor Logs", module: "Visitors" },
  { action: "manage_restrictions", label: "Manage Restrictions", module: "Visitors" },
  { action: "view_masters", label: "View Masters", module: "Masters" },
  { action: "manage_masters", label: "Manage Masters", module: "Masters" },
  { action: "view_general_settings", label: "View General Settings", module: "Settings" },
  { action: "edit_general_settings", label: "Edit General Settings", module: "Settings" },
  { action: "manage_integrations", label: "Manage Integrations", module: "Settings" },
  { action: "manage_permissions", label: "Manage Permissions", module: "Administration" },
  { action: "view_users_list", label: "View Users List", module: "Administration" },
  { action: "create_users", label: "Create Users", module: "Administration" },
  { action: "edit_users", label: "Edit Users", module: "Administration" },
  { action: "delete_users", label: "Delete Users", module: "Administration" },
  { action: "view_profile", label: "View Profile", module: "Profile" },
  { action: "edit_profile", label: "Edit Profile", module: "Profile" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupPermissions(list: typeof PERMISSIONS_LIST) {
  return list.reduce((acc: Record<string, typeof PERMISSIONS_LIST>, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});
}

// ─── Custom Searchable Dropdown ───────────────────────────────────────────────

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  value: string | number | null;
  onChange: (val: any) => void;
  options: { value: string | number; label: string; sub?: string; badge?: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sub || "").toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setSearch(""); }}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-2.5 bg-white transition-all text-left ${
          open
            ? "border-[#1B4FD8] ring-2 ring-[#1B4FD8]/15 shadow-sm"
            : "border-gray-200 hover:border-gray-300 shadow-sm"
        }`}
      >
        <div className="flex flex-col min-w-0 flex-1">
          {selected ? (
            <>
              <span className="font-semibold text-gray-800 uppercase tracking-wide text-xs sm:text-sm truncate leading-tight">
                {selected.label}
              </span>
              {selected.sub && (
                <span className="text-[10px] text-gray-400 normal-case truncate leading-tight mt-0.5">
                  {selected.sub}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm font-normal">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selected?.badge && (
            <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase tracking-wide whitespace-nowrap">
              {selected.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-400 text-center">No results found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between gap-2 ${
                    opt.value === value ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm font-semibold uppercase tracking-wide truncate ${
                      opt.value === value ? "text-[#1B4FD8]" : "text-gray-800"
                    }`}>
                      {opt.label}
                    </span>
                    {opt.sub && (
                      <span className="text-[10px] text-gray-400 normal-case truncate mt-0.5">
                        {opt.sub}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {opt.badge && (
                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase tracking-wide">
                        {opt.badge}
                      </span>
                    )}
                    {opt.value === value && (
                      <Check className="w-3.5 h-3.5 text-[#1B4FD8]" strokeWidth={2.5} />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({
  module,
  perms,
  currentPermissions,
  onPermissionChange,
  onSelectAll,
}: {
  module: string;
  perms: typeof PERMISSIONS_LIST;
  currentPermissions: Record<string, boolean>;
  onPermissionChange: (action: string, value: boolean) => void;
  onSelectAll: (perms: typeof PERMISSIONS_LIST) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const allChecked   = perms.every((p) => currentPermissions[p.action]);
  const someChecked  = perms.some((p)  => currentPermissions[p.action]);
  const enabledCount = perms.filter((p) => currentPermissions[p.action]).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-400 flex-shrink-0">
            {expanded
              ? <ChevronDown  className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
          <h3 className="font-semibold text-gray-800 text-sm truncate">{module}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
            {enabledCount}/{perms.length}
          </span>
        </div>
        <label
          className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-semibold text-[#1B4FD8] uppercase tracking-wide hidden sm:block">All</span>
          <div
            onClick={(e) => { e.stopPropagation(); onSelectAll(perms); }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
              allChecked
                ? "bg-[#1B4FD8] border-[#1B4FD8]"
                : someChecked
                ? "bg-[#1B4FD8]/20 border-[#1B4FD8]"
                : "border-gray-300 bg-white hover:border-[#1B4FD8]"
            }`}
          >
            {allChecked  && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            {someChecked && !allChecked && <div className="w-2 h-0.5 bg-[#1B4FD8] rounded" />}
          </div>
        </label>
      </div>

      {/* Permission rows */}
      {expanded && (
        <div className="bg-gray-50 divide-y divide-gray-100">
          {perms.map((perm) => {
            const isChecked = !!currentPermissions[perm.action];
            return (
              <label
                key={perm.action}
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white transition-colors group"
              >
                <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors pr-2">
                  {perm.label}
                </span>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                    isChecked
                      ? "bg-[#1B4FD8] border-[#1B4FD8]"
                      : "border-gray-300 bg-white group-hover:border-[#1B4FD8]/50"
                  }`}
                  onClick={() => onPermissionChange(perm.action, !isChecked)}
                >
                  {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Permissions Grid ─────────────────────────────────────────────────────────

function PermissionsGrid({
  permissions,
  searchQuery,
  onPermissionChange,
  onModuleSelectAll,
}: {
  permissions: Record<string, boolean>;
  searchQuery: string;
  onPermissionChange: (action: string, value: boolean) => void;
  onModuleSelectAll: (perms: typeof PERMISSIONS_LIST) => void;
}) {
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return PERMISSIONS_LIST;
    const q = searchQuery.toLowerCase();
    return PERMISSIONS_LIST.filter(
      (p) => p.module.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const grouped = useMemo(() => groupPermissions(filteredList), [filteredList]);

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="text-center py-16">
        <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No permissions match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(grouped).map(([module, perms]) => (
        <ModuleCard
          key={module}
          module={module}
          perms={perms}
          currentPermissions={permissions}
          onPermissionChange={onPermissionChange}
          onSelectAll={onModuleSelectAll}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Permissions() {
  const [activeTab, setActiveTab] = useState<"role" | "user">("role");

  // User tab state
  const [staffUsers, setStaffUsers]           = useState<StaffUserItem[]>([]);
  const [selectedUserId, setSelectedUserId]   = useState<number | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});

  // Role tab state
  const [roles, setRoles]                       = useState<RoleItem[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [rolePermissions, setRolePermissions]   = useState<Record<string, boolean>>({});

  // Shared state
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [resetting, setResetting]               = useState(false);
  const [searchQuery, setSearchQuery]           = useState("");
  const [selectAllEnabled, setSelectAllEnabled] = useState(false);

  // Derived
  const permissions    = activeTab === "user" ? userPermissions : rolePermissions;
  const setPermissions = activeTab === "user" ? setUserPermissions : setRolePermissions;
  const totalEnabled   = PERMISSIONS_LIST.filter((p) => permissions[p.action]).length;
  const selectedUser   = staffUsers.find((u) => u.id === selectedUserId);
  const hasCustom      = selectedUser?.has_custom_permissions === 1;

  // ── Load staff users from /api/staff ──────────────────────────────────────
  const loadStaffUsers = async () => {
    try {
      const res = await api.get("/api/staff");
      const staffList = res.data?.data || res.data || [];

      const usersRes = await api.get("/api/auth/users");
      const usersList = usersRes.data?.data || [];

      const merged: StaffUserItem[] = staffList
        .filter((s: any) => s.email)
        .map((s: any) => {
          const matchingUser = usersList.find(
            (u: any) => u.email?.toLowerCase() === s.email?.toLowerCase()
          );
          return {
            id: matchingUser?.id ?? s.id,
            staff_id: s.id,
            email: s.email,
            name: s.name || s.email,
            role: s.role_name || s.role || "",
            role_id: s.role,
            has_custom_permissions: matchingUser?.has_custom_permissions ?? 0,
            permissions: matchingUser?.permissions ?? {},
          };
        });

      setStaffUsers(merged);

      if (merged.length > 0 && !selectedUserId) {
        setSelectedUserId(merged[0].id);
        setUserPermissions(merged[0].permissions || {});
      } else if (selectedUserId) {
        const current = merged.find((u) => u.id === selectedUserId);
        if (current) setUserPermissions(current.permissions || {});
      }
    } catch (err) {
      console.error("loadStaffUsers error:", err);
      toast.error("Failed to load staff users");
    }
  };

  // ── Load roles from Masters (same as StaffForm fetchRoles) ────────────────
  const loadRolesFromMasters = async () => {
    try {
      const response = await consumeMasters({ tab: "Roles", type: "Role" });

      if (response?.success && Array.isArray(response.data)) {
        const masterRoles = response.data.map((item: any) => ({
          id: item.value_id,
          name: item.value_name,
        }));

        let savedRolePerms: Record<string, Record<string, boolean>> = {};
        try {
          const rolePermsRes = await api.get("/api/auth/roles");
          const savedList = rolePermsRes.data?.data || [];
          savedList.forEach((r: any) => {
            savedRolePerms[r.name?.toLowerCase()] = r.permissions || {};
          });
        } catch {
          // role_permissions table might be empty, that's ok
        }

        const rolesWithPerms: RoleItem[] = masterRoles.map((r: any) => ({
          id: r.id,
          name: r.name,
          permissions: savedRolePerms[r.name?.toLowerCase()] || {},
        }));

        setRoles(rolesWithPerms);

        if (rolesWithPerms.length > 0 && !selectedRoleName) {
          setSelectedRoleName(rolesWithPerms[0].name);
          setRolePermissions(rolesWithPerms[0].permissions || {});
        } else if (selectedRoleName) {
          const current = rolesWithPerms.find((r) => r.name === selectedRoleName);
          if (current) setRolePermissions(current.permissions || {});
        }
      }
    } catch (err) {
      console.error("loadRolesFromMasters error:", err);
      toast.error("Failed to load roles from masters");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadStaffUsers(), loadRolesFromMasters()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    setSelectAllEnabled(false);
    setSearchQuery("");
  }, [activeTab]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUserChange = (id: number) => {
    setSelectedUserId(id);
    const u = staffUsers.find((x) => x.id === id);
    setUserPermissions(u?.permissions || {});
    setSelectAllEnabled(false);
  };

  const handleRoleChange = (roleName: string) => {
    setSelectedRoleName(roleName);
    const r = roles.find((x) => x.name === roleName);
    setRolePermissions(r?.permissions || {});
    setSelectAllEnabled(false);
  };

  const handlePermissionChange = (action: string, value: boolean) => {
    setPermissions((prev: Record<string, boolean>) => ({ ...prev, [action]: value }));
  };

  const handleModuleSelectAll = (perms: typeof PERMISSIONS_LIST) => {
    const allChecked = perms.every((p) => permissions[p.action]);
    const updates: Record<string, boolean> = {};
    perms.forEach((p) => (updates[p.action] = !allChecked));
    setPermissions((prev: Record<string, boolean>) => ({ ...prev, ...updates }));
  };

  const handleGlobalSelectAll = () => {
    const next = !selectAllEnabled;
    setSelectAllEnabled(next);
    const updates: Record<string, boolean> = {};
    PERMISSIONS_LIST.forEach((p) => (updates[p.action] = next));
    setPermissions(updates);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "user") {
        if (!selectedUserId) return;
        await api.put(`/api/auth/users/${selectedUserId}/permissions`, {
          permissions: userPermissions,
        });
        await loadStaffUsers();
      } else {
        await api.put(
          `/api/auth/roles/${encodeURIComponent(selectedRoleName)}/permissions`,
          { permissions: rolePermissions }
        );
        await loadRolesFromMasters();
      }
      toast.success("Permissions saved successfully");
    } catch {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToRole = async () => {
    if (!selectedUserId || !selectedUser?.role) {
      toast.info("This user has no role assigned");
      return;
    }
    setResetting(true);
    try {
      await api.put(`/api/auth/users/${selectedUserId}/permissions/reset`);
      await loadStaffUsers();
      const role = roles.find(
        (r) => r.name.toLowerCase() === selectedUser.role?.toLowerCase()
      );
      setUserPermissions(role?.permissions || {});
      toast.success("Reset to role defaults");
    } catch {
      toast.error("Failed to reset permissions");
    } finally {
      setResetting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="animate-spin h-9 w-9 border-2 border-[#1B4FD8] border-t-transparent rounded-full" />
        <p className="text-sm text-gray-500">Loading permissions...</p>
      </div>
    );
  }

  // ── Dropdown options ───────────────────────────────────────────────────────

  const userOptions = staffUsers.map((u) => ({
    value: u.id,
    label: u.name || u.email,
    // sub: u.role ? `${u.role} · ${u.email}` : u.email,
    badge: u.has_custom_permissions ? "Custom" : undefined,
  }));

  const roleOptions = roles.map((r) => ({
    value: r.name,
    label: r.name,
  }));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-gray-200 shadow-sm bg-white">
        <div className="px-3 sm:px-6 py-2 flex flex-wrap sm:flex-nowrap items-center gap-y-2 gap-x-2">

          {/* Tabs */}
          <div className="flex items-center shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("role")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "role"
                  ? "border-[#1B4FD8] text-[#1B4FD8]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Role Permissions
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "user"
                  ? "border-[#1B4FD8] text-[#1B4FD8]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              User Permissions
            </button>
          </div>

          {/* Search — desktop */}
          <div className="hidden sm:flex flex-1 justify-center">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules or permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#1B4FD8]/20 focus:border-[#1B4FD8] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions — desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B4FD8] rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((totalEnabled / PERMISSIONS_LIST.length) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                {totalEnabled}/{PERMISSIONS_LIST.length}
              </span>
            </div>

            <button
              onClick={handleGlobalSelectAll}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
                selectAllEnabled
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {selectAllEnabled ? "Deselect All" : "Select All"}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#0A1F5C] text-white hover:bg-[#1B4FD8] transition-all disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Mobile: search + actions */}
          <div className="flex w-full items-center gap-2 sm:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-2 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#1B4FD8]/20 outline-none"
              />
            </div>
            <button
              onClick={handleGlobalSelectAll}
              className="px-2 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 whitespace-nowrap"
            >
              {selectAllEnabled ? "Deselect" : "Select"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0A1F5C] text-white disabled:opacity-60"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-6">

        {/* Selector row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-5">

          {activeTab === "user" ? (
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Target User
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Custom searchable dropdown */}
                <div className="w-full sm:w-80">
                  <CustomDropdown
                    value={selectedUserId}
                    onChange={(val) => handleUserChange(Number(val))}
                    options={userOptions}
                    placeholder="Select a user..."
                  />
                </div>

                {/* Custom override badge + Reset */}
                {hasCustom ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                      ★ Custom Override Active
                    </span>
                    <button
                      onClick={handleResetToRole}
                      disabled={resetting}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
                    >
                      {resetting ? (
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      Reset to Role
                    </button>
                  </div>
                ) : (
                  selectedUser?.role && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Using role defaults ({selectedUser.role})
                    </span>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="w-full sm:w-72">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              {/* Custom searchable dropdown */}
              <CustomDropdown
                value={selectedRoleName}
                onChange={(val) => handleRoleChange(String(val))}
                options={roleOptions}
                placeholder="Select a role..."
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Roles fetched from Masters → Roles. Saving applies to all users with this role (except custom overrides).
              </p>
            </div>
          )}

          {/* Mobile progress */}
          <div className="sm:hidden flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-fit">
            <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B4FD8] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((totalEnabled / PERMISSIONS_LIST.length) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
              {totalEnabled}/{PERMISSIONS_LIST.length}
            </span>
          </div>
        </div>

        {/* Permissions Grid */}
        <PermissionsGrid
          permissions={permissions}
          searchQuery={searchQuery}
          onPermissionChange={handlePermissionChange}
          onModuleSelectAll={handleModuleSelectAll}
        />

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {totalEnabled} of {PERMISSIONS_LIST.length} permissions enabled for{" "}
            <span className="font-semibold text-gray-700">
              {activeTab === "user"
                ? (selectedUser?.name || selectedUser?.email || "")
                : selectedRoleName}
            </span>
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#0A1F5C] to-[#1B4FD8] text-white hover:from-[#1B4FD8] hover:to-[#0A1F5C] transition-all disabled:opacity-60 shadow-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}