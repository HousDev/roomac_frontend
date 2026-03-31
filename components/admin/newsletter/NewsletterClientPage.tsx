// components/admin/newsletter/NewsletterSubscribersClientPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  Loader2, 
  RefreshCw, 
  Mail, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  X,
  Search,
  Filter,
  AlertCircle,
  Trash2,
  Calendar,
  Share2,
  Facebook,
  Linkedin,
  Link2,
  Copy,
  Send,
  MessageCircle,
  Twitter,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  NewsletterSubscriber, 
  NewsletterStats,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  bulkDeleteNewsletterSubscribers
} from "@/lib/newsletterApi";

interface NewsletterSubscribersClientPageProps {
  initialSubscribers: NewsletterSubscriber[];
  initialStats: NewsletterStats | null;
  onFiltersChange: (filters: { status: string; search: string }) => void;
}

export default function NewsletterSubscribersClientPage({ 
  initialSubscribers, 
  initialStats,
  onFiltersChange 
}: NewsletterSubscribersClientPageProps) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [stats, setStats] = useState<NewsletterStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [sortField, setSortField] = useState<keyof NewsletterSubscriber>('subscribed_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Update local state when props change
  useEffect(() => {
    setSubscribers(initialSubscribers);
  }, [initialSubscribers]);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getNewsletterSubscribers(filters);
      if (response.success) {
        setSubscribers(response.results);
        setStats(response.stats);
        toast.success("Data refreshed");
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscriber = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber);
    setShowViewDialog(true);
  };

  const handleShareSubscriber = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber);
    const currentUrl = window.location.href;
    const shareableUrl = `${currentUrl}?subscriber=${subscriber.email}`;
    setShareUrl(shareableUrl);
    setShowShareDialog(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this subscriber: ${selectedSubscriber?.email}`);
    window.open(`https://wa.me/?text=${text} ${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  const handleShareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=Newsletter Subscriber&summary=${encodeURIComponent(selectedSubscriber?.email || '')}`, '_blank', 'width=600,height=400');
  };

  const handleShareOnTwitter = () => {
    const text = encodeURIComponent(`Newsletter subscriber: ${selectedSubscriber?.email}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  const handleShareOnEmail = () => {
    const subject = encodeURIComponent(`Newsletter Subscriber: ${selectedSubscriber?.email}`);
    const body = encodeURIComponent(`Check out this subscriber:\n\nEmail: ${selectedSubscriber?.email}\nStatus: ${selectedSubscriber?.status}\nSubscribed on: ${formatDate(selectedSubscriber?.subscribed_at || '')}\n\nView details: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDeleteSubscriber = (subscriber: NewsletterSubscriber) => {
    setSubscriberToDelete(subscriber);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await deleteNewsletterSubscriber(subscriberToDelete.id);
      if (response.success) {
        toast.success("Subscriber deleted successfully");
        setShowDeleteDialog(false);
        setSubscriberToDelete(null);
        handleRefresh();
      } else {
        toast.error(response.message || "Failed to delete subscriber");
      }
    } catch (error: any) {
      console.error('Error deleting subscriber:', error);
      toast.error(error.message || "Failed to delete subscriber");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.size === filteredSubscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(filteredSubscribers.map(s => s.id)));
    }
  };

  const handleSelectSubscriber = (id: number) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubscribers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.size === 0) return;
    
    try {
      setBulkActionLoading(true);
      await bulkDeleteNewsletterSubscribers(Array.from(selectedSubscribers));
      toast.success(`Successfully deleted ${selectedSubscribers.size} subscribers`);
      setSelectedSubscribers(new Set());
      setShowBulkDeleteDialog(false);
      handleRefresh();
    } catch (error: any) {
      console.error('Error deleting subscribers:', error);
      toast.error(error.message || "Failed to delete subscribers");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <XCircle className="h-3 w-3 mr-1" />
        Unsubscribed
      </Badge>
    );
  };

  const handleSort = (field: keyof NewsletterSubscriber) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedSubscribers = [...subscribers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredSubscribers = sortedSubscribers.filter(subscriber => {
    const matchesStatus = filters.status === 'all' || subscriber.status === filters.status;
    const matchesSearch = !filters.search || 
      subscriber.email.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mt-2">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total Subscribers</p>
                <p className="text-xl font-bold">{stats?.total || 0}</p>
              </div>
              <Mail className="h-6 w-6 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600">Active</p>
                <p className="text-xl font-bold text-green-700">{stats?.active_count || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Unsubscribed</p>
                <p className="text-xl font-bold text-gray-700">{stats?.unsubscribed_count || 0}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSubscribers.size > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {selectedSubscribers.size} {selectedSubscribers.size === 1 ? 'subscriber' : 'subscribers'} selected
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedSubscribers(new Set())}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowBulkDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="">
        <CardContent className="p-0">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
              <p className="text-gray-500">Newsletter subscribers will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedSubscribers.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        ID <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-1">
                        Email <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('subscribed_at')}>
                      <div className="flex items-center gap-1">
                        Subscribed Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedSubscribers.has(subscriber.id)}
                          onCheckedChange={() => handleSelectSubscriber(subscriber.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">#{subscriber.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{subscriber.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(subscriber.subscribed_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {subscriber.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewSubscriber(subscriber)}
                            className="h-7 w-7 p-0"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShareSubscriber(subscriber)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Share"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSubscriber(subscriber)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Subscriber Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubscriber && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-500 text-xs">Email</Label>
                  <p className="text-sm font-medium mt-1">{selectedSubscriber.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubscriber.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Subscribed Date</Label>
                  <p className="text-sm mt-1">{formatDate(selectedSubscriber.subscribed_at)}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">IP Address</Label>
                  <p className="text-sm mt-1 font-mono">{selectedSubscriber.ip_address || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md p-0 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="text-white flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Subscriber
              </DialogTitle>
              <p className="text-xs text-blue-100 mt-1">Share this subscriber details</p>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-4">
            {/* Email Display */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Email Address</p>
              <p className="text-sm font-medium text-gray-800 break-all">{selectedSubscriber?.email}</p>
            </div>

            {/* Share Options */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-3">Share via</p>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={handleShareOnWhatsApp}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-600">WhatsApp</span>
                </button>

                <button
                  onClick={handleShareOnFacebook}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-600">Facebook</span>
                </button>

                <button
                  onClick={handleShareOnLinkedIn}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center group-hover:scale-110 transition">
                    <Linkedin className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-600">LinkedIn</span>
                </button>

                <button
                  onClick={handleShareOnTwitter}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sky-50 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition">
                    <Twitter className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-600">X</span>
                </button>

                <button
                  onClick={handleShareOnEmail}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-600">Email</span>
                </button>
              </div>
            </div>

            {/* Copy Link */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Or copy link</p>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-xs bg-gray-50"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="h-9 px-3 bg-gray-600 hover:bg-gray-700"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-5 py-3 bg-gray-50 border-t">
            <Button variant="outline" onClick={() => setShowShareDialog(false)} size="sm">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber?
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-900">{subscriberToDelete?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Subscribed on: {subscriberToDelete && formatDate(subscriberToDelete.subscribed_at)}
                </p>
              </div>
              <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSubscriberToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSubscriber}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Subscriber
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSubscribers.size} {selectedSubscribers.size === 1 ? 'subscriber' : 'subscribers'}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={bulkActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedSubscribers.size} Subscriber{selectedSubscribers.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}