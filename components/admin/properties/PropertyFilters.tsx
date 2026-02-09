// components/admin/properties/PropertyFilters.tsx - CLIENT COMPONENT
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  CheckCircle,
  Tag,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface PropertyFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
  uniqueTags: string[];
  filteredPropertiesLength: number;
  propertiesLength: number;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function PropertyFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tagFilter,
  onTagFilterChange,
  viewMode,
  onViewModeChange,
  uniqueTags,
  filteredPropertiesLength,
  propertiesLength,
  onApplyFilters,
  onClearFilters,
  sidebarOpen,
  setSidebarOpen,
}: PropertyFiltersProps) {
  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Filter Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">Filters</h2>
                  <p className="text-sm text-gray-600">Refine your property search</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Properties
              </Label>
              <Input
                type="text"
                placeholder="Search by name, area, manager..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Status
              </Label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <Select value={tagFilter} onValueChange={onTagFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {uniqueTags.map(tag => (
                    <SelectItem key={tag} value={tag.toLowerCase()}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                View Mode
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => onViewModeChange('table')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => onViewModeChange('card')}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </Button>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || statusFilter !== 'all' || tagFilter !== 'all') && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{filteredPropertiesLength}</span> of{" "}
                <span className="font-semibold">{propertiesLength}</span> properties shown
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  onApplyFilters();
                  setSidebarOpen(false);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}