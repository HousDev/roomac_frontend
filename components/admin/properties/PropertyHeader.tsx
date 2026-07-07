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
  Filter,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
interface PropertyHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onFilterClick: () => void;
  onExport: () => void;
  onImport?: () => void; // Add optional import handler
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
  canCreate?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canBulkAction?: boolean;
}

// SearchInput Component - Add this entire block
const SearchInput = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className: string;
}) => {
  const [localVal, setLocalVal] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const onChangeRef = useRef(onChange);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChangeRef.current(val);
    }, 400);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={localVal}
      onChange={handleChange}
      className={className}
    />
  );
};
export default function PropertyHeader({
  searchQuery,
  onSearchChange,
  onRefresh,
  onFilterClick,
  onExport,
  onImport, // Add import handler
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
  canCreate = true,
  canExport = true,
  canImport = true,
  canBulkAction = true,
}: PropertyHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Desktop Header - Your original code unchanged
 const DesktopHeader = () => {
  const commonButtonClass =
    "h-8 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 shadow-sm transition-all duration-200";

  return (
    <div
      className="hidden md:block sticky top-0 z-10
      bg-gray-200 text-gray-700 -translate-y-1 pt-2 rounded-xl"
    >
      <div className="py-2 px-3">
        <div className="flex flex-col space-y-3">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            {/* LEFT: Icon + Search */}
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="p-1.5 rounded-lg bg-white border border-gray-300 shadow-sm">
                <Building2 className="h-5 w-5 text-gray-700" />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <SearchInput
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Search property..."
                  className="w-[420px] pl-9 pr-3 py-1.5 text-sm rounded-lg
                  bg-white text-gray-800 placeholder:text-gray-400
                  border border-gray-300 shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* RIGHT: Buttons */}
            <div className="flex items-center gap-2">
              {/* Refresh */}
              <Button
                size="icon"
                variant="outline"
                className={`w-8 ${commonButtonClass}`}
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Filter */}
              <Button
                size="icon"
                variant="outline"
                className={`relative w-8 ${commonButtonClass}`}
                onClick={onFilterClick}
              >
                <Filter className="h-4 w-4" />
                {(statusFilter !== "all" || tagFilter !== "all") && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </Button>

              {/* Bulk Actions */}
              {canBulkAction && (
                <DropdownMenu
                  open={isBulkActionOpen}
                  onOpenChange={setIsBulkActionOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 ${commonButtonClass}`}
                      disabled={selectedTableIds.length === 0}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Bulk Actions

                      {selectedTableIds.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-gray-200 text-gray-700"
                        >
                          {selectedTableIds.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    {bulkActions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() =>
                          handleBulkAction(action, selectedTableIds)
                        }
                        className={
                          action.variant === "destructive"
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Export */}
              {canExport && (
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 ${commonButtonClass}`}
                  onClick={onExport}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}

              {/* Import */}
              {canImport && onImport && (
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 ${commonButtonClass}`}
                  onClick={onImport}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              )}

              {/* Add Property */}
              {canCreate && (
                <Button
                  className="h-8 bg-white text-blue-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 shadow-sm transition-all duration-200 px-3 text-sm font-medium flex items-center gap-2"
                  onClick={onAddProperty}
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            <div />

            <div className="flex items-center gap-2">
              {(statusFilter !== "all" || tagFilter !== "all") && (
                <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-2 py-1 shadow-sm">
                  <span className="text-xs text-gray-700">
                    Active: {statusFilter !== "all" && "Status"}{" "}
                    {tagFilter !== "all" && "• Tags"}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-gray-600 hover:bg-gray-100"
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
                className="lg:hidden text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Mobile Header - Compact version
const MobileHeader = () => {
  const commonButtonClass =
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm transition-all duration-200";

  return (
    <div className="md:hidden sticky top-0 z-10 bg-gray-200 text-gray-700 py-1.5 rounded-xl">
      <div className="px-2">
        {/* Top Compact Row */}
        <div className="flex items-center justify-between mb-1">
          {/* Left: Title + Bulk Button */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-white border border-gray-300 shadow-sm">
              <Building2 className="h-3 w-3 text-gray-700" />
            </div>

            <span className="text-sm font-semibold text-gray-700">
              Properties
            </span>

            {/* Bulk Button */}
            {selectedTableIds.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className={`h-6 px-2 text-xs ${commonButtonClass}`}
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    {selectedTableIds.length}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-48">
                  {bulkActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() =>
                        handleBulkAction(action, selectedTableIds)
                      }
                      className={
                        action.variant === "destructive"
                          ? "text-red-600"
                          : ""
                      }
                    >
                      {action.icon}
                      <span className="ml-2 text-xs">{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className={`h-5 px-2 text-xs opacity-60 ${commonButtonClass}`}
                disabled
              >
                <CheckSquare className="h-2 w-2 mr-1" />
                0
              </Button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Refresh */}
            <Button
              size="icon"
              variant="outline"
              className={`h-6 w-6 ${commonButtonClass}`}
              onClick={onRefresh}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>

            {/* Filter */}
            <Button
              size="icon"
              variant="outline"
              className={`relative h-6 w-6 ${commonButtonClass}`}
              onClick={onFilterClick}
            >
              <Filter className="h-3 w-3" />
              {(statusFilter !== "all" || tagFilter !== "all") && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-500 ring-2 ring-white" />
              )}
            </Button>

            {/* Export */}
            <Button
              size="icon"
              variant="outline"
              className={`h-6 w-6 ${commonButtonClass}`}
              onClick={onExport}
            >
              <Download className="h-3 w-3" />
            </Button>

            {/* Import */}
            {onImport && (
              <Button
                size="icon"
                variant="outline"
                className={`h-6 w-6 ${commonButtonClass}`}
                onClick={onImport}
              >
                <Upload className="h-3 w-3" />
              </Button>
            )}

            {/* Add */}
            <Button
              size="sm"
              className={`h-5 px-2 text-xs flex items-center ml-1 font-medium ${commonButtonClass}`}
              onClick={onAddProperty}
            >
              <Plus className="h-2.5 w-2.5 text-blue-700" />
              <span className="ml-1 text-blue-700">Add</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative py-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />

          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md
            bg-white text-gray-800 placeholder:text-gray-400
            border border-gray-300 shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Active Filters */}
        {(statusFilter !== "all" || tagFilter !== "all") && (
          <div className="mt-1 flex items-center justify-between bg-white border border-gray-300 rounded px-1.5 py-0.5 shadow-sm">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-700">
                Active filters
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-gray-700 hover:bg-gray-100"
              onClick={onClearFilters}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}
