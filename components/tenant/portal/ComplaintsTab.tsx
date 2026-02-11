'use client';

import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Plus, MessageSquare, Eye } from "lucide-react";
import { toast } from "sonner";
import ComplaintDialog from "./ComplaintDialog";

interface ComplaintsTabProps {
  complaints: any[];
  showComplaintDialog: boolean;
  setShowComplaintDialog: (show: boolean) => void;
}

function ComplaintsTab({ complaints, showComplaintDialog, setShowComplaintDialog }: ComplaintsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    open: complaints.filter(c => c.status === "open").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    urgent: complaints.filter(c => c.priority === "urgent").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case "high":
        return <Badge variant="default" className="text-xs">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Resolved</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">In Progress</Badge>;
      case "open":
        return <Badge variant="destructive" className="text-xs">Open</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleViewDetails = (complaint: any) => {
    toast.info(`Viewing complaint: ${complaint.title}`);
    // Implement view details logic
  };

  const handleAddResponse = (complaint: any) => {
    toast.info(`Adding response to: ${complaint.title}`);
    // Implement response logic
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-red-200/50 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Open</p>
                <p className="text-xl font-bold text-red-700">{stats.open}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/50 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">In Progress</p>
                <p className="text-xl font-bold text-amber-700">{stats.inProgress}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200/50 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Resolved</p>
                <p className="text-xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200/50 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Urgent</p>
                <p className="text-xl font-bold text-red-700">{stats.urgent}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border border-slate-200/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Left: Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search complaints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-36 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="amenities">Amenities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right: Action Button */}
            <div className="w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => setShowComplaintDialog(true)}
                className="w-full sm:w-auto h-9 text-sm bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Complaint
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 border-b border-slate-100">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            My Complaints
            <Badge variant="outline" className="text-xs">
              {filteredComplaints.length} complaints
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredComplaints.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">No complaints found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery ? "Try a different search term" : "No complaints submitted yet"}
              </p>
              <Button
                size="sm"
                onClick={() => setShowComplaintDialog(true)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Create Your First Complaint
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center mt-0.5 ${
                          complaint.status === "resolved" ? "bg-green-100" :
                          complaint.status === "in_progress" ? "bg-amber-100" : "bg-red-100"
                        }`}>
                          {getStatusIcon(complaint.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm text-slate-900 leading-tight">
                                {complaint.title}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                {complaint.description}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {getStatusBadge(complaint.status)}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5">
                              {complaint.category}
                            </Badge>
                            {getPriorityBadge(complaint.priority)}
                            <span className="text-[10px] text-slate-500">
                              #{complaint.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Created: {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                      {complaint.resolution_notes && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Has resolution notes
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(complaint)}
                        className="h-7 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      {complaint.status !== "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddResponse(complaint)}
                          className="h-7 text-xs"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Add Response
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Resolution Notes */}
                  {complaint.resolution_notes && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs font-semibold text-green-900 flex items-center gap-1.5 mb-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Resolution Notes
                      </p>
                      <p className="text-xs text-green-800 leading-relaxed">
                        {complaint.resolution_notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Dialog */}
      <ComplaintDialog
        open={showComplaintDialog}
        onOpenChange={setShowComplaintDialog}
        newComplaint={{ title: "", description: "", category: "maintenance", priority: "medium" }}
        setNewComplaint={() => {}}
        onSubmit={() => {
          toast.success("Complaint submitted!");
          setShowComplaintDialog(false);
        }}
      />
    </div>
  );
}

export default memo(ComplaintsTab);


