"use client";

import { CheckSquare, Power, Trash2, Loader2 } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  processing: boolean;
  currentAction: "activate" | "deactivate" | "delete" | null;
  isInline?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  processing,
  currentAction,
  isInline = false
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const content = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CheckSquare size={18} className="text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onActivate}
          disabled={processing}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {processing && currentAction === "activate" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Power size={16} />
          )}
          Activate
        </button>
        
        <button
          onClick={onDeactivate}
          disabled={processing}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {processing && currentAction === "deactivate" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Power size={16} />
          )}
          Deactivate
        </button>
        
        <button
          onClick={onDelete}
          disabled={processing}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {processing && currentAction === "delete" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          Delete
        </button>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  // Original fixed positioning for backward compatibility
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="max-w-8xl mx-auto px-4 py-3">
        {content}
      </div>
    </div>
  );
}