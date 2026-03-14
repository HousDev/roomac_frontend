"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {getTenantPayments, getTenantPaymentFormData , getTenantById, type Tenant } from "@/lib/tenantApi";
import { 
  ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Home, User, 
  Briefcase, FileText, CreditCard, Shield, Bell, Download, 
  Camera, Award, Heart, Users, BookOpen, Clock, CheckCircle,
  XCircle, AlertCircle, Loader2, Eye, Trash2, Key, Globe,
  ChevronLeft, ChevronRight, Building, Bed, IndianRupee,
  FileCheck, FileWarning, PhoneCall, AtSign, MapPinned,
  CalendarDays, BadgeCheck, BadgeX, BadgeAlert, BadgeInfo,
  LayoutGrid, List, Printer, Share2, MoreVertical, Settings,
  MessageSquare, ClipboardList, Receipt, RotateCcw, Wrench, Filter, ChevronDown, ChevronUp 
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  // Add these states in your component
const [payments, setPayments] = useState<any[]>([]);
const [paymentSummary, setPaymentSummary] = useState<any>(null);
const [loadingPayments, setLoadingPayments] = useState(false);
const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  const tenantId = params.id as string;

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
    }
  }, [tenantId]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const response = await getTenantById(tenantId);
      if (response?.success && response.data) {
        setTenant(response.data);
      } else {
        setError("Failed to load tenant details");
      }
    } catch (err) {
      console.error("Error fetching tenant:", err);
      setError("An error occurred while fetching tenant details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantPayments = async () => {
  if (!tenantId) return;
  
  setLoadingPayments(true);
  try {
    // Fetch payment history
    const paymentsResponse = await getTenantPayments(tenantId);
    if (paymentsResponse.success) {
      setPayments(paymentsResponse.data || []);
    }
    
    // Fetch payment summary with month-wise history
    const summaryResponse = await getTenantPaymentFormData(tenantId);
    if (summaryResponse.success) {
      setPaymentSummary(summaryResponse.data);
    }
  } catch (error) {
    console.error("Error fetching payments:", error);
  } finally {
    setLoadingPayments(false);
  }
};


// Call this when the tab changes to 'payments'
useEffect(() => {
  if (activeTab === 'payments' && tenantId) {
    fetchTenantPayments();
  }
}, [activeTab, tenantId]);

// Toggle month expansion
const toggleMonthExpansion = (monthKey: string) => {
  setExpandedMonths(prev => 
    prev.includes(monthKey) 
      ? prev.filter(m => m !== monthKey) 
      : [...prev, monthKey]
  );
};

  if (loading) {
    return <TenantDetailLoading />;
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tenant Not Found</h2>
                <p className="text-gray-600 mb-6">{error || "The tenant you're looking for doesn't exist or has been removed."}</p>
                <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  {tenant.photo_url ? (
                    <AvatarImage src={tenant.photo_url} alt={tenant.full_name} />
                  ) : (
                    <AvatarFallback className="bg-white/20 text-white">
                      {tenant.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold text-white">{tenant.full_name}</h1>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Badge className={`text-[10px] px-2 py-0 h-5 ${tenant.is_active ? "bg-emerald-500" : "bg-gray-500"} text-white border-0`}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-blue-200">ID: #{tenant.id}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push(`/admin/tenants/${tenantId}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit Tenant
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="w-4 h-4 mr-2" /> Print Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={<CalendarDays className="w-5 h-5 text-blue-500" />}
            label="Member Since"
            value={tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('en-IN', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            }) : 'N/A'}
            bgColor="bg-blue-50"
          />
          <StatCard 
            icon={<Home className="w-5 h-5 text-emerald-500" />}
            label="Property"
            value={tenant.current_assignment?.property_name || tenant.assigned_property_name || 'Not Assigned'}
            bgColor="bg-emerald-50"
          />
          <StatCard 
            icon={<Bed className="w-5 h-5 text-purple-500" />}
            label="Room/Bed"
            value={tenant.current_assignment ? 
              `Room ${tenant.current_assignment.room_number} · Bed ${tenant.current_assignment.bed_number}` : 
              tenant.assigned_room_number ? `Room ${tenant.assigned_room_number}` : 'Not Assigned'}
            bgColor="bg-purple-50"
          />
          <StatCard 
            icon={<IndianRupee className="w-5 h-5 text-amber-500" />}
            label="Monthly Rent"
            value={tenant.current_booking?.monthly_rent ? 
              `₹${tenant.current_booking.monthly_rent.toLocaleString()}` : 
              tenant.payments?.[0]?.amount ? `₹${tenant.payments[0].amount.toLocaleString()}` : 'N/A'}
            bgColor="bg-amber-50"
          />
        </div>

        {/* Tabs Section */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-gray-50/50 px-6">
              <TabsList className="bg-transparent h-12 gap-6">
                <TabTrigger value="overview" icon={<User className="w-4 h-4" />} label="Overview" />
                <TabTrigger value="occupation" icon={<Briefcase className="w-4 h-4" />} label="Occupation" />
                <TabTrigger value="documents" icon={<FileText className="w-4 h-4" />} label="Documents" />
                <TabTrigger value="payments" icon={<CreditCard className="w-4 h-4" />} label="Payments" />
                <TabTrigger value="booking" icon={<Home className="w-4 h-4" />} label="Booking" />
                <TabTrigger value="activity" icon={<Clock className="w-4 h-4" />} label="Activity" />
              </TabsList>
            </div>

            <CardContent className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <InfoItem label="Full Name" value={tenant.full_name} />
                        <InfoItem label="Salutation" value={tenant.salutation || '—'} />
                        <InfoItem label="Gender" value={tenant.gender || '—'} />
                        <InfoItem label="Date of Birth" value={tenant.date_of_birth ? 
                          `${new Date(tenant.date_of_birth).toLocaleDateString('en-IN', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          })} (${calculateAge(tenant.date_of_birth)} yrs)` : '—'} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Card */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Account Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <StatusBadge 
                          label="Account Status" 
                          value={tenant.is_active ? 'Active' : 'Inactive'}
                          type={tenant.is_active ? 'success' : 'danger'}
                        />
                        <StatusBadge 
                          label="Portal Access" 
                          value={tenant.portal_access_enabled ? 'Enabled' : 'Disabled'}
                          type={tenant.portal_access_enabled ? 'success' : 'warning'}
                        />
                        <StatusBadge 
                          label="Login Status" 
                          value={tenant.has_credentials ? 'Configured' : 'Not Configured'}
                          type={tenant.has_credentials ? 'success' : 'warning'}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <a href={`mailto:${tenant.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                              {tenant.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <a href={`tel:${tenant.country_code}${tenant.phone}`} className="text-sm font-medium">
                              {tenant.country_code} {tenant.phone}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-sm font-medium">
                              {tenant.address}, {tenant.city}, {tenant.state} - {tenant.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tenant.emergency_contact_name ? (
                        <div className="space-y-3">
                          <InfoItem label="Name" value={tenant.emergency_contact_name} />
                          <InfoItem label="Phone" value={tenant.emergency_contact_phone || '—'} />
                          <InfoItem label="Relation" value={tenant.emergency_contact_relation || '—'} />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No emergency contact provided</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Occupation Tab */}
              <TabsContent value="occupation" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        Employment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InfoItem label="Occupation Category" value={
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {tenant.occupation_category || 'Other'}
                        </Badge>
                      } />
                      <InfoItem label="Exact Occupation" value={tenant.exact_occupation || tenant.occupation || '—'} />
                      <InfoItem label="Organization" value={tenant.organization || '—'} />
                      {tenant.years_of_experience && (
                        <InfoItem label="Experience" value={`${tenant.years_of_experience} years`} />
                      )}
                      {tenant.monthly_income && (
                        <InfoItem label="Monthly Income" value={`₹${Number(tenant.monthly_income).toLocaleString()}`} />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        Work Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InfoItem label="Work Mode" value={
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {tenant.work_mode || 'Not specified'}
                        </Badge>
                      } />
                      <InfoItem label="Shift Timing" value={tenant.shift_timing || '—'} />
                      {tenant.student_id && (
                        <InfoItem label="Student ID" value={tenant.student_id} />
                      )}
                      {tenant.employee_id && (
                        <InfoItem label="Employee ID" value={tenant.employee_id} />
                      )}
                      {tenant.portfolio_url && (
                        <InfoItem label="Portfolio" value={
                          <a href={tenant.portfolio_url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {tenant.portfolio_url}
                          </a>
                        } />
                      )}
                    </CardContent>
                  </Card>

                  {/* Room Preferences */}
                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bed className="w-5 h-5 text-indigo-600" />
                        Room Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3 flex-wrap">
                        {tenant.preferred_sharing && (
                          <Badge className="px-4 py-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-sm">
                            {tenant.preferred_sharing} Sharing
                          </Badge>
                        )}
                        {tenant.preferred_room_type && (
                          <Badge className="px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 text-sm">
                            {tenant.preferred_room_type}
                          </Badge>
                        )}
                        {!tenant.preferred_sharing && !tenant.preferred_room_type && (
                          <p className="text-sm text-gray-400 italic">No preferences specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ID Proof */}
                  <DocumentCard
                    title="ID Proof"
                    icon={<FileCheck className="w-6 h-6 text-blue-600" />}
                    url={tenant.id_proof_url}
                    filename="ID Proof Document"
                  />
                  
                  {/* Address Proof */}
                  <DocumentCard
                    title="Address Proof"
                    icon={<FileCheck className="w-6 h-6 text-green-600" />}
                    url={tenant.address_proof_url}
                    filename="Address Proof Document"
                  />
                  
                  {/* Photograph */}
                  <DocumentCard
                    title="Photograph"
                    icon={<Camera className="w-6 h-6 text-purple-600" />}
                    url={tenant.photo_url}
                    filename="Tenant Photo"
                    isImage={true}
                  />

                  {/* Additional Documents */}
                  {tenant.additional_documents && tenant.additional_documents.length > 0 && (
                    <Card className="md:col-span-3 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-amber-600" />
                          Additional Documents ({tenant.additional_documents.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tenant.additional_documents.map((doc, index) => (
                            <DocumentCard
                              key={index}
                              title={doc.filename}
                              icon={<FileText className="w-5 h-5 text-gray-600" />}
                              url={doc.url}
                              filename={doc.filename}
                              uploadedAt={doc.uploaded_at}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Payments Tab */}
<TabsContent value="payments" className="mt-0">
  <div className="space-y-6">
    {/* Payment Summary Cards */}
    {paymentSummary && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">₹{paymentSummary.total_paid?.toLocaleString() || '0'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Pending</p>
            <p className="text-2xl font-bold text-amber-600">₹{paymentSummary.total_pending?.toLocaleString() || '0'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
            <p className="text-2xl font-bold text-purple-600">₹{paymentSummary.monthly_rent?.toLocaleString() || '0'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Months Since Joining</p>
            <p className="text-2xl font-bold text-emerald-600">{paymentSummary.total_months_since_joining || '0'}</p>
          </CardContent>
        </Card>
      </div>
    )}

    {/* Month-wise History */}
    {paymentSummary?.month_wise_history && paymentSummary.month_wise_history.length > 0 ? (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Month-wise Payment History
          </CardTitle>
          <CardDescription>
            Detailed breakdown of payments by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentSummary.month_wise_history.map((month: any) => {
              const monthKey = `${month.month}-${month.year}`;
              const isExpanded = expandedMonths.includes(monthKey);
              
              return (
                <Collapsible
                  key={monthKey}
                  open={isExpanded}
                  onOpenChange={() => toggleMonthExpansion(monthKey)}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      month.isCurrentMonth ? 'bg-blue-50' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {month.month} {month.year}
                              {month.isCurrentMonth && (
                                <Badge className="ml-2 bg-blue-100 text-blue-700">Current</Badge>
                              )}
                              {month.isFirstMonth && (
                                <Badge className="ml-2 bg-purple-100 text-purple-700">First Month</Badge>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Rent: ₹{month.rent?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Paid: <span className="text-green-600">₹{month.paid_amount?.toLocaleString()}</span>
                          </p>
                          <p className="text-sm font-medium">
                            Pending: <span className="text-amber-600">₹{month.pending_amount?.toLocaleString()}</span>
                          </p>
                        </div>
                        <Badge className={
                          month.status === 'paid' ? 'bg-green-100 text-green-700' :
                          month.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                          month.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {month.status}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t bg-gray-50 p-4">
                      {month.payments && month.payments.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Amount</TableHead>
                              <TableHead className="text-xs">Mode</TableHead>
                              <TableHead className="text-xs">Transaction ID</TableHead>
                              <TableHead className="text-xs">Bank</TableHead>
                              <TableHead className="text-xs">Remark</TableHead>
                              <TableHead className="text-xs text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {month.payments.map((payment: any) => (
                              <TableRow key={payment.id}>
                                <TableCell className="text-xs">
                                  {new Date(payment.date).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  ₹{payment.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs capitalize">
                                  {payment.mode}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                  {payment.transaction_id || '-'}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {payment.bank_name || '-'}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {payment.remark || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => window.open(`/api/payments/receipts/${payment.id}/preview`, '_blank')}
                                  >
                                    <Receipt className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No individual payment records for this month
                        </p>
                      )}
                      
                      {/* Month Summary */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-500">Total Paid</p>
                          <p className="text-sm font-bold text-green-600">₹{month.paid_amount?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="text-sm font-bold text-amber-600">₹{month.pending_amount?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-500">Status</p>
                          <Badge className={
                            month.status === 'paid' ? 'bg-green-100 text-green-700' :
                            month.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                            month.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {month.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No payment records found</p>
          {loadingPayments && (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
        </CardContent>
      </Card>
    )}

    {/* Recent Transactions Table (Alternative View) */}
    {payments.length > 0 && (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            All payment transactions in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>{payment.remark || 'Rent Payment'}</TableCell>
                  <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{payment.payment_mode}</TableCell>
                  <TableCell>{payment.month} {payment.year}</TableCell>
                  <TableCell>
                    <Badge className={
                      payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                      payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {payment.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === 'approved' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/api/payments/receipts/${payment.id}/preview`, '_blank')}
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}
  </div>
</TabsContent>

              {/* Booking Tab */}
              <TabsContent value="booking" className="mt-0">
                {tenant.bookings && tenant.bookings.length > 0 ? (
                  <div className="space-y-6">
                    {tenant.bookings
                      .filter(b => b.status === 'active')
                      .map((booking) => (
                        <Card key={booking.id} className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Property</p>
                                <p className="font-semibold">{booking.properties?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">
                                  {booking.properties?.city}, {booking.properties?.state}
                                </p>
                              </div>
                              {booking.room && (
                                <>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Room Details</p>
                                    <p className="font-semibold">Room {booking.room.room_number}</p>
                                    <p className="text-xs text-gray-500">
                                      {booking.room.sharing_type} Sharing · Floor {booking.room.floor || '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
                                    <p className="text-xl font-bold text-green-600">
                                      ₹{booking.monthly_rent?.toLocaleString()}
                                    </p>
                                  </div>
                                </>
                              )}
                              <div className="flex items-end justify-end">
                                <Badge className="bg-emerald-500 text-white px-4 py-1">Active Booking</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {/* Previous Bookings */}
                    {tenant.bookings.filter(b => b.status !== 'active').length > 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Previous Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {tenant.bookings
                              .filter(b => b.status !== 'active')
                              .map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium">{booking.properties?.name}</p>
                                    <p className="text-sm text-gray-500">
                                      Room {booking.room?.room_number} · {booking.room?.sharing_type} Sharing
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="bg-gray-100">Past Booking</Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No booking history found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-0">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ActivityItem 
                        icon={<Calendar className="w-4 h-4 text-blue-500" />}
                        title="Tenant Created"
                        description="Profile was created in the system"
                        timestamp={tenant.created_at}
                      />
                      {tenant.updated_at && (
                        <ActivityItem 
                          icon={<RotateCcw className="w-4 h-4 text-amber-500" />}
                          title="Profile Updated"
                          description="Tenant information was modified"
                          timestamp={tenant.updated_at}
                        />
                      )}
                      {tenant.check_in_date && (
                        <ActivityItem 
                          icon={<Home className="w-4 h-4 text-green-500" />}
                          title="Check-in Date"
                          description="Scheduled check-in date"
                          timestamp={tenant.check_in_date}
                        />
                      )}
                      {tenant.payments?.map((payment) => (
                        <ActivityItem 
                          key={payment.id}
                          icon={<CreditCard className="w-4 h-4 text-purple-500" />}
                          title={`Payment ${payment.status}`}
                          description={`Amount: ₹${payment.amount.toLocaleString()} via ${payment.payment_method}`}
                          timestamp={payment.payment_date}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ icon, label, value, bgColor }: any) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TabTrigger({ value, icon, label }: any) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex items-center gap-2 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-2"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </TabsTrigger>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ label, value, type }: any) {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <Badge className={colors[type]} variant="outline">
        {value}
      </Badge>
    </div>
  );
}

function DocumentCard({ title, icon, url, filename, isImage, uploadedAt }: any) {
  if (!url) {
    return (
      <Card className="border-0 shadow-sm bg-gray-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
            <FileWarning className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-700 mb-1">{title}</h3>
          <p className="text-xs text-gray-400">Not uploaded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            {isImage ? (
              <img src={url} alt={title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              icon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-700 truncate">{title}</h3>
            <p className="text-xs text-gray-400 truncate">{filename}</p>
            {uploadedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Uploaded: {new Date(uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ icon, title, description, timestamp }: any) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="text-xs text-gray-400">
        {timestamp ? new Date(timestamp).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) : '—'}
      </div>
    </div>
  );
}

function TenantDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-t-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}