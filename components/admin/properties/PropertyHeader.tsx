// components/admin/properties/PropertyHeader.tsx - CLIENT COMPONENT
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  RefreshCw,
  SlidersHorizontal,
  Download,
  Plus,
  CheckSquare,
  X,
  Search,
} from "lucide-react";

interface PropertyHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onFilterClick: () => void;
  onExport: () => void;
  onAddProperty: () => void;
  selectedTableIds: string[];
  isBulkActionOpen: boolean;
  setIsBulkActionOpen: (open: boolean) => void;
  bulkActions: any[];
  handleBulkAction: (action: any, selectedIds: string[]) => void;
  statusFilter: string;
  tagFilter: string;
  onClearFilters: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export default function PropertyHeader({
  searchQuery,
  onSearchChange,
  onRefresh,
  onFilterClick,
  onExport,
  onAddProperty,
  selectedTableIds,
  isBulkActionOpen,
  setIsBulkActionOpen,
  bulkActions,
  handleBulkAction,
  statusFilter,
  tagFilter,
  onClearFilters,
  setSidebarOpen,
}: PropertyHeaderProps) {
  return (
<div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 text-white -translate-y-1 pt-2">      <div className="py-2 px-3">
        <div className="flex flex-col space-y-3">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            {/* LEFT: Icon + Search */}
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md shadow-md ring-1 ring-white/30">
                <Building2 className="h-5 w-5" />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
                <input
                  type="text"
                  placeholder="Search property..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-[420px] pl-9 pr-3 py-1.5 text-sm rounded-lg
                           bg-white/20 text-white placeholder-blue-100
                           backdrop-blur-md border border-white/30
                           shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                />
              </div>
            </div>

            {/* RIGHT: Buttons */}
            <div className="flex items-center gap-2">
              {/* Refresh (icon only) */}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Filter (icon only) */}
              <Button
                size="icon"
                variant="ghost"
                className="relative h-8 w-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                onClick={onFilterClick}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {(statusFilter !== 'all' || tagFilter !== 'all') && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-400 ring-1 ring-blue-500" />
                )}
              </Button>

              {/* Bulk Actions Dropdown */}
              <DropdownMenu open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={selectedTableIds.length === 0}
                  >
                    <CheckSquare className="h-4 w-4" />
                    Bulk Actions
                    {selectedTableIds.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-white/20 text-white">
                        {selectedTableIds.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {bulkActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleBulkAction(action, selectedTableIds)}
                      className={action.variant === 'destructive' ? 'text-red-600' : ''}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Button */}
              <Button
                variant="outline"
                className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                onClick={onExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              {/* Add Property (old style) */}
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold border-2 border-white/50 px-3 py-1.5 text-sm flex items-center"
                onClick={onAddProperty}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Bottom Row: Active Filters */}
          <div className="flex items-center justify-between pt-1 border-t border-white/30">
            <div></div>
            <div className="flex items-center gap-2">
              {(statusFilter !== 'all' || tagFilter !== 'all') && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-md px-2 py-1">
                  <span className="text-xs text-white">
                    Active: {statusFilter !== 'all' && "Status"} {tagFilter !== 'all' && "• Tags"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-white hover:bg-white/20"
                    onClick={onClearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Mobile Filter */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/20"
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}