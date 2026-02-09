// components/admin/column-search-header.tsx
"use client";

import { Input } from "@/components/ui/input";

interface ColumnSearchHeaderProps {
  columnSearch: {
    name: string;
    contact: string;
    occupation: string;
    property: string;
    payments: string;
    status: string;
  };
  onColumnSearchChange: (column: keyof ColumnSearchHeaderProps['columnSearch'], value: string) => void;
}

export function ColumnSearchHeader({ columnSearch, onColumnSearchChange }: ColumnSearchHeaderProps) {
  return (
    <div className="bg-slate-100 border-b">
      <div className="grid grid-cols-12 gap-2 px-6 py-3">
        {/* Name Column Header with Search */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Name
          </div>
          <Input
            placeholder="Search name..."
            value={columnSearch.name}
            onChange={(e) => onColumnSearchChange('name', e.target.value)}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Contact Column Header with Search */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Contact
          </div>
          <Input
            placeholder="Search email/phone..."
            value={columnSearch.contact}
            onChange={(e) => onColumnSearchChange('contact', e.target.value)}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Occupation Column Header with Search */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Occupation
          </div>
          <Input
            placeholder="Search occupation..."
            value={columnSearch.occupation}
            onChange={(e) => onColumnSearchChange('occupation', e.target.value)}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Property Column Header with Search */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Property & Room
          </div>
          <Input
            placeholder="Search property..."
            value={columnSearch.property}
            onChange={(e) => onColumnSearchChange('property', e.target.value)}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Payments Column Header with Search */}
        <div className="col-span-2">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Payments
          </div>
          <Input
            placeholder="Search payments..."
            value={columnSearch.payments}
            onChange={(e) => onColumnSearchChange('payments', e.target.value)}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Status Column Header with Search */}
        <div className="col-span-1">
          <div className="text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Status
          </div>
          <Input
            placeholder="Search status..."
            value={columnSearch.status}
            onChange={(e) => onColumnSearchChange('status', e.target.value)}
            className="mt-2 h-8 text-sm"
          />
        </div>
        
        {/* Actions Column */}
        <div className="col-span-1 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
          Actions
        </div>
      </div>
    </div>
  );
}