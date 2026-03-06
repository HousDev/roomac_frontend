// app/admin/staff/components/StaffDetailsPopup.tsx
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaffMember } from "@/lib/staffApi";
import {
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Droplets,
  Calendar,
  Hash,
  MapPin,
  Building,
  CreditCard,
  AlertCircle,
  FileText,
  Eye,
  Edit,
  Briefcase,
} from "lucide-react";

interface StaffDetailsPopupProps {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (member: StaffMember) => void;
  formatSalary: (salary: number) => string;
  formatDate: (dateString: string) => string;
  getRoleBadgeColor: (role: string) => string;
  roleIcons: Record<string, React.ReactNode>;
}

const StaffDetailsPopup = ({
  staff,
  open,
  onOpenChange,
  onEdit,
  formatSalary,
  formatDate,
}: StaffDetailsPopupProps) => {
  if (!staff) return null;

  const formatSalutation = (salutation: string) => {
    if (!salutation) return "";
    const salutationMap: Record<string, string> = {
      mr: "Mr.",
      mrs: "Mrs.",
      miss: "Miss",
      dr: "Dr.",
      prof: "Prof.",
    };
    return salutationMap[salutation.toLowerCase()] || salutation;
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | null }) => (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="w-5 h-5 flex items-center justify-center text-gray-500 mt-0.5 flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-200">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  const DocumentBadge = ({ label, url }: { label: string; url?: string }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
      >
        <FileText className="h-4 w-4" />
        <span>{label}</span>
        <Eye className="h-4 w-4" />
      </a>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-xl">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Profile Image - responsive sizing */}
              <div className="flex-shrink-0">
                {staff.photo_url ? (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-white overflow-hidden bg-white">
                    <img
                      src={staff.photo_url}
                      alt={staff.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                )}
              </div>
              
              {/* Name and Role - responsive text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-base sm:text-xl font-bold truncate">
                    {formatSalutation(staff.salutation)} {staff.name}
                  </h2>
                  <Badge className={`${staff.is_active ? "bg-green-500" : "bg-gray-500"} text-xs`}>
                    {staff.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-indigo-100 text-sm sm:text-base flex items-center gap-1 flex-wrap">
                  <span className="truncate">{staff.role_name || staff.role}</span>
                  {staff.employee_id && (
                    <>
                      <span className="mx-1 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm">
                        <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{staff.employee_id}</span>
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(staff);
                  }}
                  className="bg-white text-blue-900 hover:bg-indigo-50 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
              <DialogClose asChild>
                <button className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition">
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </DialogClose>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 sm:p-6">
          {/* Mobile: Vertical Stack | Desktop: Horizontal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <Section title="Personal Information">
                <InfoRow icon={Mail} label="Email" value={staff.email} />
                <InfoRow icon={Phone} label="Phone" value={staff.phone} />
                {staff.whatsapp_number && (
                  <InfoRow icon={MessageSquare} label="WhatsApp" value={staff.whatsapp_number} />
                )}
                <InfoRow icon={Droplets} label="Blood Group" value={staff.blood_group?.toUpperCase()} />
                <InfoRow icon={Calendar} label="Joining Date" value={formatDate(staff.joining_date)} />
              </Section>

              {/* Address Information - only show if exists */}
              {(staff.current_address || staff.permanent_address) && (
                <Section title="Address">
                  {staff.current_address && (
                    <InfoRow icon={MapPin} label="Current Address" value={staff.current_address} />
                  )}
                  {staff.permanent_address && (
                    <InfoRow icon={MapPin} label="Permanent Address" value={staff.permanent_address} />
                  )}
                </Section>
              )}

              {/* Emergency Contact - only show if exists */}
              {(staff.emergency_contact_name || staff.emergency_contact_phone) && (
                <Section title="Emergency Contact">
                  {staff.emergency_contact_name && (
                    <InfoRow icon={User} label="Name" value={staff.emergency_contact_name} />
                  )}
                  {staff.emergency_contact_phone && (
                    <InfoRow icon={Phone} label="Phone" value={staff.emergency_contact_phone} />
                  )}
                  {staff.emergency_contact_relation && (
                    <InfoRow icon={AlertCircle} label="Relation" value={staff.emergency_contact_relation} />
                  )}
                </Section>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Job Information */}
              <Section title="Job Information">
                <InfoRow icon={Building} label="Department" value={staff.department_name || staff.department} />
                <InfoRow icon={Briefcase} label="Role" value={staff.role_name || staff.role} />
                <InfoRow icon={Hash} label="Employee ID" value={staff.employee_id} />
                <InfoRow icon={CreditCard} label="Salary" value={formatSalary(staff.salary)} />
                {staff.assigned_requests > 0 && (
                  <InfoRow icon={Briefcase} label="Assigned Requests" value={`${staff.assigned_requests} request${staff.assigned_requests !== 1 ? 's' : ''}`} />
                )}
              </Section>

              {/* KYC Details - only show if exists */}
              {(staff.aadhar_number || staff.pan_number) && (
                <Section title="KYC Details">
                  {staff.aadhar_number && (
                    <InfoRow icon={FileText} label="Aadhar Number" value={staff.aadhar_number} />
                  )}
                  {staff.pan_number && (
                    <InfoRow icon={FileText} label="PAN Number" value={staff.pan_number} />
                  )}
                </Section>
              )}

              {/* Bank Details - only show if exists */}
              {(staff.bank_account_holder_name || staff.bank_account_number || staff.bank_name) && (
                <Section title="Bank Details">
                  {staff.bank_account_holder_name && (
                    <InfoRow icon={User} label="Account Holder" value={staff.bank_account_holder_name} />
                  )}
                  {staff.bank_account_number && (
                    <InfoRow icon={CreditCard} label="Account Number" value={staff.bank_account_number} />
                  )}
                  {staff.bank_name && (
                    <InfoRow icon={Building} label="Bank Name" value={staff.bank_name} />
                  )}
                  {staff.bank_ifsc_code && (
                    <InfoRow icon={Hash} label="IFSC Code" value={staff.bank_ifsc_code} />
                  )}
                  {staff.upi_id && (
                    <InfoRow icon={CreditCard} label="UPI ID" value={staff.upi_id} />
                  )}
                </Section>
              )}

              {/* Documents - only show if exists */}
              {(staff.aadhar_document_url || staff.pan_document_url) && (
                <Section title="Documents">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <DocumentBadge label="Aadhar Card" url={staff.aadhar_document_url} />
                    <DocumentBadge label="PAN Card" url={staff.pan_document_url} />
                  </div>
                </Section>
              )}
            </div>
          </div>

          {/* Created/Updated Info */}
          {(staff.created_at || staff.updated_at) && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 flex flex-col sm:flex-row justify-between gap-2">
              {staff.created_at && <span>Created: {new Date(staff.created_at).toLocaleString()}</span>}
              {staff.updated_at && <span>Updated: {new Date(staff.updated_at).toLocaleString()}</span>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffDetailsPopup;