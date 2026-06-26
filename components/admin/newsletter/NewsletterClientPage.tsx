// components/admin/newsletter/NewsletterSubscribersClientPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Eye,
  Loader2,
  RefreshCw,
  Mail,
  CheckCircle,
  XCircle,
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
import { toast } from "sonner";
import {
  NewsletterSubscriber,
  NewsletterStats,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  bulkDeleteNewsletterSubscribers
} from "@/lib/newsletterApi";
import { useAuth } from '@/context/authContext';

interface NewsletterSubscribersClientPageProps {
  initialSubscribers: NewsletterSubscriber[];
  initialStats: NewsletterStats | null;
  onFiltersChange: (filters: { status: string; search: string }) => void;
  nRegisterBulkDelete?: (fn: () => void) => void;
  onRegisterSelectedCount?: (count: number) => void;
}

export default function NewsletterSubscribersClientPage({
  initialSubscribers,
  initialStats,
  onFiltersChange,
  onRegisterBulkDelete,
  onRegisterSelectedCount,
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
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    id: '',
    email: '',
    status: '',
    subscribed_at: '',
    ip_address: '',
  });
  const [sortField, setSortField] = useState<keyof NewsletterSubscriber>('subscribed_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { can } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "All">(10);

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
    setCurrentPage(1);
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
  // Register bulk delete with parent
  useEffect(() => {
    if (onRegisterBulkDelete) {
      onRegisterBulkDelete(handleBulkDelete);
    }
  }, [onRegisterBulkDelete, handleBulkDelete]);

  // Report selected count
  useEffect(() => {
    if (onRegisterSelectedCount) {
      onRegisterSelectedCount(selectedSubscribers.size);
    }
  }, [selectedSubscribers.size, onRegisterSelectedCount]);

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


  const filteredSubscribers = sortedSubscribers.filter(subscriber => {
    // Global filters (status + search)
    const matchesStatus = filters.status === 'all' || subscriber.status === filters.status;
    const matchesGlobalSearch = !filters.search ||
      subscriber.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      subscriber.id.toString().includes(filters.search) ||
      subscriber.ip_address?.toLowerCase().includes(filters.search.toLowerCase());

    // Column filters
    const matchesId = !columnFilters.id || subscriber.id.toString().includes(columnFilters.id);
    const matchesEmail = !columnFilters.email || subscriber.email.toLowerCase().includes(columnFilters.email.toLowerCase());
    const matchesStatusCol = !columnFilters.status || subscriber.status.toLowerCase().includes(columnFilters.status.toLowerCase());
    const matchesDate = !columnFilters.subscribed_at || formatDate(subscriber.subscribed_at).toLowerCase().includes(columnFilters.subscribed_at.toLowerCase());
    const matchesIp = !columnFilters.ip_address || (subscriber.ip_address?.toLowerCase() || '').includes(columnFilters.ip_address.toLowerCase());

    return matchesStatus && matchesGlobalSearch && matchesId && matchesEmail && matchesStatusCol && matchesDate && matchesIp;
  });

  // Pagination
  const paginatedSubscribers = useMemo(() => {
    if (itemsPerPage === "All") return filteredSubscribers;
    const start = (currentPage - 1) * (itemsPerPage as number);
    return filteredSubscribers.slice(start, start + (itemsPerPage as number));
  }, [filteredSubscribers, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === "All") return 1;
    return Math.ceil(filteredSubscribers.length / (itemsPerPage as number));
  }, [filteredSubscribers, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, columnFilters]);

  
  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards – compact grid like enquiries */}
      <div className="newsletter-stats-compact mt-2">
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gray-50 rounded-xl shadow-sm">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold leading-none">
                    {stats?.total || 0}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Total
                  </p>
                </div>
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 rounded-xl shadow-sm">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold text-green-700 leading-none">
                    {stats?.active_count || 0}
                  </p>
                  <p className="text-[11px] text-green-600 mt-0.5">
                    Active
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-100 rounded-xl shadow-sm">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold text-gray-700 leading-none">
                    {stats?.unsubscribed_count || 0}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Unsubscribed
                  </p>
                </div>
                <XCircle className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Actions Bar – only visible on mobile, placed below stats */}
      {selectedSubscribers.size > 0 && can('bulk_delete_newsletter') && (
        <div className="block md:hidden bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
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

      {/* Search & Filter Bar (global) */}
      {/* <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by email or ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-8 h-8 text-xs w-full"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Total: <strong>{filteredSubscribers.length}</strong> subscribers
        </div>
      </div> */}

      {/* Table Card */}
      <Card className="border rounded-lg shadow-sm">
        <CardContent className="p-0 flex flex-col rounded-lg">
          <div className="flex flex-col h-[380px] sm:h-[440px]">
            <div className="overflow-auto flex-1 min-h-0 rounded-lg">
              <table
                className="border-collapse text-[11px] font-sans"
                style={{ tableLayout: "fixed", minWidth: "1000px", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: "36px" }} />   {/* Checkbox */}
                  <col style={{ width: "60px" }} />   {/* ID */}
                  <col style={{ width: "100px" }} />  {/* Actions */}
                  <col style={{ width: "180px" }} />  {/* Email */}
                  <col style={{ width: "110px" }} />  {/* Status */}
                  <col style={{ width: "160px" }} />  {/* Subscribed Date */}
                  <col style={{ width: "120px" }} />  {/* IP Address */}
                </colgroup>

                <thead className="sticky top-0 z-10">
                  {/* Title Row */}
                  <tr className="bg-gray-200 border-b border-gray-300">
                    <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th
                      className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1 font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        ID <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                    </th>
                    <th
                      className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1 font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Email <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1 font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Status <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                      onClick={() => handleSort('subscribed_at')}
                    >
                      <div className="flex items-center gap-1 font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Subscribed Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-1.5 py-1.5 text-left bg-gray-200">
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">IP Address</span>
                    </th>
                  </tr>

                  {/* Search Row */}
                  <tr className="bg-white border-b border-gray-300">
                    <td className="p-1" /> {/* Checkbox – no input */}
                    <td className="p-1 border-r border-gray-200 bg-white">
                      <input
                        value={columnFilters.id}
                        onChange={(e) => setColumnFilters(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="Search..."
                        className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200 bg-white" /> {/* Actions – no input */}
                    <td className="p-1 border-r border-gray-200 bg-white">
                      <input
                        value={columnFilters.email}
                        onChange={(e) => setColumnFilters(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Search..."
                        className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200 bg-white">
                      <input
                        value={columnFilters.status}
                        onChange={(e) => setColumnFilters(prev => ({ ...prev, status: e.target.value }))}
                        placeholder="Search..."
                        className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200 bg-white">
                      <input
                        value={columnFilters.subscribed_at}
                        onChange={(e) => setColumnFilters(prev => ({ ...prev, subscribed_at: e.target.value }))}
                        placeholder="Search..."
                        className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1 bg-white">
                      <input
                        value={columnFilters.ip_address}
                        onChange={(e) => setColumnFilters(prev => ({ ...prev, ip_address: e.target.value }))}
                        placeholder="Search..."
                        className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
                      />
                    </td>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-500 text-xs">Loading...</td>
                    </tr>
                  ) : paginatedSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">No subscribers found</td>
                    </tr>
                  ) : (
                    paginatedSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.has(subscriber.id)}
                            onChange={() => handleSelectSubscriber(subscriber.id)}
                            className="w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="px-1.5 py-1.5 text-[11px] font-mono text-slate-600 border-r border-slate-100">
                          #{subscriber.id}
                        </td>
                        <td className="px-1.5 py-1.5 border-r border-slate-100">
                          <div className="flex items-center gap-0.5 flex-nowrap">
                            {can('view_newsletter') && (
                              <button
                                onClick={() => handleViewSubscriber(subscriber)}
                                title="View Details"
                                className="w-6 h-6 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {can('share_newsletter') && (
                              <button
                                onClick={() => handleShareSubscriber(subscriber)}
                                title="Share"
                                className="w-6 h-6 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {can('delete_newsletter') && (
                              <button
                                onClick={() => handleDeleteSubscriber(subscriber)}
                                title="Delete"
                                className="w-6 h-6 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 text-[11px] font-medium text-slate-800 border-r border-slate-100 truncate">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 border-r border-slate-100">
                          {getStatusBadge(subscriber.status)}
                        </td>
                        <td className="px-1.5 py-1.5 text-[10px] text-slate-500 border-r border-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            {formatDate(subscriber.subscribed_at)}
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 text-[10px] font-mono text-slate-500 truncate">
                          {subscriber.ip_address || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination footer - matches Enquiries table */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-slate-200 rounded-b-lg">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs text-slate-500">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const v = e.target.value;
                  setItemsPerPage(v === "All" ? "All" : Number(v));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-[11px] bg-white outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="All">All</option>
              </select>
              <span>
                entries · Showing {paginatedSubscribers.length} of {filteredSubscribers.length}
              </span>
            </div>

            {itemsPerPage !== "All" &&
              filteredSubscribers.length > 0 &&
              totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-[11px] border border-gray-300 rounded bg-white disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) p = i + 1;
                      else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                      else p = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`h-7 w-7 text-[11px] border rounded ${
                          currentPage === p
                            ? "bg-blue-600 border-blue-600 text-white font-bold"
                            : "bg-white border-gray-300 text-slate-700"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-[11px] border border-gray-300 rounded bg-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}

            <span className="hidden sm:block text-[11px] text-slate-500 text-center">
              Total: <strong>{filteredSubscribers.length}</strong> subscribers
            </span>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
   <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
  <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl shadow-2xl">
    {/* Header with gradient and close icon */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
      <DialogTitle className="text-white flex items-center gap-2 text-lg font-semibold">
        <Mail className="h-5 w-5" />
        Subscriber Details
      </DialogTitle>
      <DialogClose asChild>
        <button className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition">
          <X className="h-5 w-5" />
        </button>
      </DialogClose>
    </div>

    {selectedSubscriber && (
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email</Label>
            <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{selectedSubscriber.email}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</Label>
            <div className="mt-0.5">{getStatusBadge(selectedSubscriber.status)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subscribed Date</Label>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(selectedSubscriber.subscribed_at)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">IP Address</Label>
            <p className="text-sm font-mono text-gray-800 mt-0.5">{selectedSubscriber.ip_address || 'N/A'}</p>
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

      {/* Share Dialog */}
   <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
  <DialogContent className="max-w-md p-0 rounded-xl overflow-hidden shadow-2xl">
    {/* Header with gradient and close icon */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
      <DialogHeader className="p-0">
        <DialogTitle className="text-white flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Subscriber
        </DialogTitle>
        <p className="text-xs text-blue-100 mt-1">Share this subscriber details</p>
      </DialogHeader>
      <DialogClose asChild>
        <button className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition">
          <X className="h-5 w-5" />
        </button>
      </DialogClose>
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

    {/* Footer removed – close via X or outside click */}
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

      {/* Compact stats styling (same as enquiries) */}
      <style>{`
        .newsletter-stats-compact > div > div:first-child {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 0.75rem !important;
        }

        .newsletter-stats-compact > div > div > div,
        .newsletter-stats-compact > div > div > div > div {
          padding: 0.375rem 0.5rem !important;
        }

        .newsletter-stats-compact .text-lg {
          font-size: 1.25rem !important;
          line-height: 1.4 !important;
        }

        .newsletter-stats-compact .text-[11px] {
          font-size: 0.7rem !important;
        }

        .newsletter-stats-compact > div {
          gap: 0.75rem !important;
        }
      `}</style>
    </div>
  );
}