// components/admin/tenants/tenant-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  UserX,
  Trash2,
  Filter
} from "lucide-react";

import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TenantFilters } from "@/lib/tenantApi";
import { TenantFiltersSheet } from "./tenant-filters-sheet";

interface TenantHeaderProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  loading: boolean;
  loadTenants: () => void;
  selectedTenantIds: string[];
  activeFiltersCount: number;
  handleExportToExcel: () => void;

  // ✅ NEW
  searchQuery: string;
  clearFilters: () => void;
}

export function TenantHeader({
  isAddDialogOpen,
  setIsAddDialogOpen,
  loading,
  loadTenants,
  selectedTenantIds,
  activeFiltersCount,
  handleExportToExcel,
  searchQuery,
  clearFilters,
}: TenantHeaderProps) {

  // ✅ Show filter bar only when search or filters applied
  const showFilterSummary =
    searchQuery.trim() !== "" || activeFiltersCount > 0;

  return (
    <div className="flex flex-col gap-3">

      {/* ================= TOP BAR ================= */}

      <div className="flex justify-between items-center w-full">

        {/* Add Tenant */}

        <div className="rounded-lg p-2 shadow-sm">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-teal-500 hover:text-white h-9">
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Right Actions */}

        <div className="flex gap-2 rounded-lg p-2 shadow-sm">

          {/* Refresh */}

          <Button
            variant="outline"
            onClick={loadTenants}
            className="flex items-center gap-2 h-9 px-3"
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Filters Sheet */}

          <TenantFiltersSheet
            activeFiltersCount={activeFiltersCount} onFilterChange={function (filters: TenantFilters): void {
              throw new Error("Function not implemented.");
            } }          />

          {/* ============ BULK ACTIONS ============ */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-9"
                disabled={selectedTenantIds.length === 0}
              >
                <CheckCircle className="h-4 w-4" />
                Bulk Actions

                {selectedTenantIds.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {selectedTenantIds.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuItem>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate Selected
              </DropdownMenuItem>

              <DropdownMenuItem>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate Selected
              </DropdownMenuItem>

              <DropdownMenuItem>
                <UserX className="h-4 w-4 mr-2" />
                Enable Portal Access
              </DropdownMenuItem>

              <DropdownMenuItem>
                <UserX className="h-4 w-4 mr-2" />
                Disable Portal Access
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}

          <Button
            variant="outline"
            onClick={handleExportToExcel}
            className="flex items-center gap-2 h-9"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

        </div>
      </div>

      {/* ================= FILTER SUMMARY BAR ================= */}

      {showFilterSummary && (
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />

              <span className="font-medium text-xs">
                Active Filters ({activeFiltersCount})
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-6 px-2"
            >
              Clear all
            </Button>

          </div>
        </div>
      )}

    </div>
  );
}
