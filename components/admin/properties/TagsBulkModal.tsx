// components/admin/TagsBulkModal.tsx (updated with Master API)
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, X, Plus, Check, Loader2, Search, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllTags, createTag } from "@/lib/masterApi";

interface TagsBulkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedPropertyIds: number[];
  onSubmit: (tags: string[], operation: 'add' | 'remove' | 'set') => Promise<void>;
}

export function TagsBulkModal({ 
  open, 
  onOpenChange, 
  selectedCount, 
  selectedPropertyIds,
  onSubmit 
}: TagsBulkModalProps) {
  const [operation, setOperation] = useState<'add' | 'remove' | 'set'>('add');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [masterTags, setMasterTags] = useState<string[]>([]);
  const [loadingMasterTags, setLoadingMasterTags] = useState(false);
  const [existingTags, setExistingTags] = useState<any>([]);
  const [loadingExistingTags, setLoadingExistingTags] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch master tags from Master API
  const fetchMasterTags = useCallback(async () => {
    setLoadingMasterTags(true);
    try {
      const tags = await getAllTags();
      
      if (Array.isArray(tags) && tags.length > 0) {
        setMasterTags(tags);
        console.log(`✅ Loaded ${tags.length} tags from Master API:`, tags);
      } else {
        // If no tags in master, use default ones
        const defaultTags = [
          "featured", 
          "new listing", 
          "premium", 
          "budget", 
          "luxury", 
          "pet friendly", 
          "fully furnished"
        ];
        setMasterTags(defaultTags);
        console.log("⚠️ Using default tags as Master API returned none");
      }
    } catch (error) {
      console.error("Failed to load tags from Master API:", error);
      // Fallback to default tags
      const defaultTags = [
        "featured", 
        "new listing", 
        "premium", 
        "budget", 
        "luxury", 
        "pet friendly", 
        "fully furnished"
      ];
      setMasterTags(defaultTags);
    } finally {
      setLoadingMasterTags(false);
    }
  }, []);

  // Fetch existing tags from selected properties

const fetchExistingTags = useCallback(async () => {
  if (selectedPropertyIds.length === 0) {
    console.log("⚠️ No property IDs selected");
    setExistingTags([]);
    return;
  }
  
  setLoadingExistingTags(true);
  try {
    console.log("🔍 Fetching existing tags for property IDs:", selectedPropertyIds);
    
    // Correct API URL with port 3001
    const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${API_BASE}/api/properties/bulk-tags-info?ids=${selectedPropertyIds.join(',')}&_t=${Date.now()}`;
    
    console.log("📡 API URL:", url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("📥 API Response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("📦 API Response data:", data);
      
      if (data.success && data.tags) {
        const uniqueTags = Array.from(new Set(data.tags.filter((tag: string) => 
  tag && typeof tag === 'string' && tag.trim() !== ''
)));

        
        console.log(`✅ Found ${uniqueTags.length} unique existing tags:`, uniqueTags);
        setExistingTags(uniqueTags);
      } 
      else {
        console.log("❌ API response not successful:", data);
        setExistingTags([]);
      }
    } else {
      console.error("❌ API request failed:", response.status);
      setExistingTags([]);
    }
  } catch (error) {
    console.error("❌ Failed to fetch existing tags:", error);
    setExistingTags([]);
  } finally {
    setLoadingExistingTags(false);
  }
}, [selectedPropertyIds]);

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      fetchMasterTags();
      if (operation === 'remove' && selectedPropertyIds.length > 0) {
        fetchExistingTags();
      }
    }
  }, [open, fetchMasterTags, fetchExistingTags, operation, selectedPropertyIds]);

  // Operation change पर existing tags fetch करें
  useEffect(() => {
    if (open && operation === 'remove' && selectedPropertyIds.length > 0) {
      fetchExistingTags();
    } else if (operation !== 'remove') {
      setExistingTags([]);
    }
  }, [open, operation, selectedPropertyIds, fetchExistingTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = async () => {
    const trimmedTag = customTag.trim();
    if (!trimmedTag) return;

    if (selectedTags.includes(trimmedTag)) {
      toast.error(`Tag "${trimmedTag}" is already selected`);
      return;
    }

    // Check if tag already exists in master
    const existingTag = masterTags.find(tag => 
      tag.toLowerCase() === trimmedTag.toLowerCase()
    );
    
    if (existingTag) {
      // Tag already exists, just select it
      toast.info(`Tag "${existingTag}" already exists in master list`);
      setSelectedTags(prev => [...prev, existingTag]);
      setCustomTag("");
      return;
    }

    // Try to add to master API if not in remove mode
    if (operation !== 'remove') {
      try {
        toast.loading(`Adding "${trimmedTag}" to master tags...`);
        const response = await createTag(trimmedTag);
        
        if (response?.success) {
          toast.success(`Tag "${trimmedTag}" added to master list`);
          // Refresh master tags
          await fetchMasterTags();
        } else {
          toast.error(`Failed to add "${trimmedTag}" to master list`);
        }
      } catch (error) {
        console.error("Failed to add tag to master:", error);
        toast.error("Failed to add tag to master list");
      }
    }

    // Add to selected tags
    setSelectedTags(prev => [...prev, trimmedTag]);
    setCustomTag("");
  };

  const handleRemoveSelectedTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(selectedTags, operation);
      onOpenChange(false);
      resetModal();
      
      const actionText = 
        operation === 'add' ? 'added to' : 
        operation === 'remove' ? 'removed from' : 
        'set for';
      
      toast.success(`Tags ${actionText} ${selectedCount} properties`);
    } catch (error) {
      console.error("Failed to update tags:", error);
      toast.error("Failed to update tags");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedTags([]);
    setCustomTag("");
    setSearchQuery("");
    setOperation('add');
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  // Get available tags based on operation
  const getAvailableTags = () => {
    let tags: string[] = [];
    
    if (operation === 'remove') {
      // For remove: show existing tags from selected properties
      tags = existingTags.filter((tag: string) => !selectedTags.includes(tag));
    } else {
      // For add/set: show master tags not already selected
      tags = masterTags.filter(tag => !selectedTags.includes(tag));
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tags = tags.filter(tag => tag.toLowerCase().includes(query));
    }
    
    return tags;
  };

  const availableTags = getAvailableTags();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Bulk Manage Tags
          </DialogTitle>
          <DialogDescription>
            {selectedCount} property{selectedCount !== 1 ? 's' : ''} selected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Operation Selection with Clear Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select 
              value={operation} 
              onValueChange={(value: any) => {
                setOperation(value);
                setSelectedTags([]);
                setSearchQuery("");
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Tags</SelectItem>
                <SelectItem value="remove">Remove Tags</SelectItem>
                <SelectItem value="set">Replace All Tags</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-xs text-gray-500 space-y-1">
              {operation === 'remove' && (
                <Alert className="py-2 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-700">
                    <strong>Remove Mode:</strong> Only selected tags will be removed from properties. Other tags will remain unchanged.
                  </AlertDescription>
                </Alert>
              )}
              <p className="pt-1">
                {operation === 'remove' 
                  ? 'Select specific tags to remove from properties' 
                  : operation === 'add' 
                  ? 'Add new tags to properties (existing tags will remain)' 
                  : 'Replace all existing tags with new ones'}
              </p>
            </div>
          </div>

          {/* Loading States */}
          {loadingMasterTags && (
            <div className="flex items-center justify-center py-4 border rounded bg-gray-50">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading master tags...</span>
            </div>
          )}

          {operation === 'remove' && loadingExistingTags && (
            <div className="flex items-center justify-center py-4 border rounded bg-blue-50">
              <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
              <span className="text-sm text-blue-600">Loading tags from selected properties...</span>
            </div>
          )}

          {/* Available Tags Section */}
          {!loadingMasterTags && !(operation === 'remove' && loadingExistingTags) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {operation === 'remove' ? 'Existing Tags in Properties' : 'Available Master Tags'}
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100">
                    {availableTags.length} available
                  </span>
                </label>
                <div className="flex gap-1">
                  {operation === 'remove' ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fetchExistingTags}
                      className="h-7 text-xs"
                      disabled={loadingExistingTags}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loadingExistingTags ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fetchMasterTags}
                      className="h-7 text-xs"
                      disabled={loadingMasterTags}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loadingMasterTags ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
              </div>
              
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border rounded bg-gray-50">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer text-xs px-2 py-0.5 h-6 flex items-center gap-1 transition-all
                        ${selectedTags.includes(tag) 
                          ? 'bg-blue-100 text-blue-800 border-blue-300' 
                          : 'hover:bg-gray-100'}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {selectedTags.includes(tag) ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : (
                        <Tag className="h-2.5 w-2.5" />
                      )}
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border rounded bg-gray-50">
                  <p className="text-sm text-gray-500">
                    {searchQuery.trim()
                      ? `No tags found matching "${searchQuery}"`
                      : operation === 'remove'
                      ? "No tags found in selected properties"
                      : "No tags available in master list"}
                  </p>
                </div>
              )}
              
              {/* Stats Info */}
              <div className="text-xs text-gray-500 flex justify-between">
                <span>
                  {operation === 'remove' 
                    ? `Found ${existingTags.length} unique tags in ${selectedCount} properties`
                    : `${masterTags.length} tags in master list`}
                </span>
                <span>{selectedTags.length} selected</span>
              </div>
            </div>
          )}

          {/* Selected Tags Preview */}
          {selectedTags.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {operation === 'remove' ? 'Tags to Remove' : 'Tags to Apply'}
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedTags.length} selected
                  </span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1.5 p-2 border rounded bg-blue-50">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={operation === 'remove' ? "destructive" : "secondary"}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 h-6
                      ${operation === 'remove' 
                        ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'}`}
                  >
                    {operation === 'remove' ? (
                      <X className="h-2.5 w-2.5" />
                    ) : (
                      <Check className="h-2.5 w-2.5" />
                    )}
                    {tag}
                    <button
                      onClick={() => handleRemoveSelectedTag(tag)}
                      className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                      title="Remove from selection"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="text-xs text-gray-500">
                {operation === 'remove' ? (
                  <div className="space-y-1">
                    <p className="font-medium text-amber-700">⚠️ Important:</p>
                    <p>Only these {selectedTags.length} tag(s) will be removed from {selectedCount} properties.</p>
                    <p>All other tags will remain unchanged.</p>
                  </div>
                ) : operation === 'add' ? (
                  <p>These {selectedTags.length} tag(s) will be added to {selectedCount} properties.</p>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-red-700">⚠️ Warning:</p>
                    <p>All existing tags will be replaced with these {selectedTags.length} tag(s).</p>
                    <p>Previous tags will be completely removed.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <div className="flex w-full justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
              size="sm"
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading || selectedTags.length === 0}
              variant={operation === 'remove' ? "destructive" : "default"}
              size="sm"
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing...
                </div>
              ) : operation === 'remove' ? (
                `Remove ${selectedTags.length} Tag${selectedTags.length !== 1 ? 's' : ''}`
              ) : operation === 'add' ? (
                `Add ${selectedTags.length} Tag${selectedTags.length !== 1 ? 's' : ''}`
              ) : (
                `Set ${selectedTags.length} Tag${selectedTags.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}