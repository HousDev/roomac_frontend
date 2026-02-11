// components/admin/rooms/bulk-actions.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, ChevronDown, Power, PowerOff, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedRooms: string[];
  onActionComplete: () => void;
}

export default function BulkActions({ selectedRooms, onActionComplete }: BulkActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'activate' | 'inactivate' | 'delete' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async (action: 'activate' | 'inactivate' | 'delete') => {
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    setPendingAction(action);
    setDialogOpen(true);
  };

// In bulk-actions.tsx, update the confirmAction function:

const confirmAction = async () => {
  if (!pendingAction || selectedRooms.length === 0) return;

  setLoading(true);
  try {
    const API_BASE_URL = process.env.VITE_API_URL || '';
    
    const response = await fetch(`${API_BASE_URL}/api/rooms/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_ids: selectedRooms,
        action: pendingAction
      })
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      
      // Pass the updated rooms data to the parent
      onActionComplete(result.updatedRooms);
    } else {
      toast.error(result.message || 'Failed to perform action');
    }
  } catch (error:any) {
    console.error('Bulk action error:', error);
    toast.error(`Failed to perform bulk action: ${error.message}`);
  } finally {
    setLoading(false);
    setDialogOpen(false);
    setPendingAction(null);
  }
};

  const getActionDetails = () => {
    switch (pendingAction) {
      case 'activate':
        return {
          title: 'Activate Rooms',
          description: `Are you sure you want to activate ${selectedRooms.length} selected room(s)?`,
          icon: <Power className="h-5 w-5" />,
          confirmText: 'Activate',
          variant: 'default' as const
        };
      case 'inactivate':
        return {
          title: 'Inactivate Rooms',
          description: `Are you sure you want to inactivate ${selectedRooms.length} selected room(s)?`,
          icon: <PowerOff className="h-5 w-5" />,
          confirmText: 'Inactivate',
          variant: 'default' as const
        };
      case 'delete':
        return {
          title: 'Delete Rooms',
          description: `Are you sure you want to delete ${selectedRooms.length} selected room(s)? This action cannot be undone.`,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          confirmText: 'Delete',
          variant: 'destructive' as const
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure?',
          icon: <AlertTriangle className="h-5 w-5" />,
          confirmText: 'Confirm',
          variant: 'default' as const
        };
    }
  };

  const actionDetails = pendingAction ? getActionDetails() : null;

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 pr-14 md:pr-0 py-1 md:py-0">
          {selectedRooms.length} room(s) selected
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 gap-2">
              Bulk Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => handleBulkAction('activate')}
              className="text-green-600"
            >
              <Power className="h-4 w-4 mr-2" />
              Activate Selected
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleBulkAction('inactivate')}
              className="text-amber-600"
            >
              <PowerOff className="h-4 w-4 mr-2" />
              Inactivate Selected
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleBulkAction('delete')}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDetails?.icon}
              {actionDetails?.title}
            </DialogTitle>
            <DialogDescription>
              {actionDetails?.description}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setPendingAction(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={actionDetails?.variant}
              onClick={confirmAction}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {actionDetails?.confirmText}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}