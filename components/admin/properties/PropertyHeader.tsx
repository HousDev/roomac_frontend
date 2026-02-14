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
import { useState, useEffect } from "react";

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
}

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
}: PropertyHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop Header - Your original code unchanged
  const DesktopHeader = () => (
    <div className="hidden md:block sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 text-white -translate-y-1 pt-2 rounded-xl">
      <div className="py-2 px-3">
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
                <Filter className="h-4 w-4" />
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

              {/* Import Button - Added beside Export */}
              {onImport && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-8 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={onImport}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              )}

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

              {/* Mobile Filter - Hidden on desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/20"
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

  // Mobile Header - Compact version
  const MobileHeader = () => (
    <div className="md:hidden sticky top-0 z-30 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 text-white py-1.5 rounded-xl">
      <div className="px-2">
        {/* Top Compact Row */}
        <div className="flex items-center justify-between mb-1">
          {/* Left: Title + Bulk Button */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-white/20 backdrop-blur-md shadow-sm ring-1 ring-white/30">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Properties</span>
            
            {/* Bulk Button next to title */}
            {selectedTableIds.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="h-6 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs px-2"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    {selectedTableIds.length}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {bulkActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleBulkAction(action, selectedTableIds)}
                      className={action.variant === 'destructive' ? 'text-red-600' : ''}
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
                variant="ghost"
                className="h-6 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs px-2 opacity-70"
                disabled
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                0
              </Button>
            )}
          </div>

          {/* Right: Add Property + Action Icons */}
          <div className="flex items-center gap-1">
            {/* Action Icons */}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm"
              onClick={onRefresh}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="relative h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
              onClick={onFilterClick}
            >
              <Filter className="h-3 w-3" />
              {(statusFilter !== 'all' || tagFilter !== 'all') && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-400 ring-1 ring-blue-500" />
              )}
            </Button>

            {/* Export Button - Mobile */}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
              onClick={onExport}
            >
              <Download className="h-3 w-3" />
            </Button>

            {/* Import Button - Mobile (if handler exists) */}
            {onImport && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-sm"
                onClick={onImport}
              >
                <Upload className="h-3 w-3" />
              </Button>
            )}

            {/* Add Property Button */}
            <Button
              size="sm"
              className="h-6 bg-white text-blue-600 hover:bg-blue-50 font-semibold border border-white/50 px-2 text-xs flex items-center ml-1"
              onClick={onAddProperty}
            >
              <Plus className="h-3 w-3" />
              <span className="ml-0.5">Add</span>
            </Button>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="relative py-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-200" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md
                     bg-white/20 text-white placeholder-blue-100
                     backdrop-blur-md border border-white/30
                     shadow-sm focus:outline-none focus:ring-1 focus:ring-white/50"
          />
        </div>

        {/* Active Filters Indicator - Only when needed */}
        {(statusFilter !== 'all' || tagFilter !== 'all') && (
          <div className="mt-1 flex items-center justify-between bg-white/10 backdrop-blur-md rounded px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white">
                Active filters
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-white hover:bg-white/20"
              onClick={onClearFilters}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}