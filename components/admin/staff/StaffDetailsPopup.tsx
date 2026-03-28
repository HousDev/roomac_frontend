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
  Shield,
  Banknote,
  Home,
  PhoneCall,
  Globe,
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

// Helper function to format phone with country code
const formatPhoneWithCode = (phone: string, countryCode?: string) => {
  if (!phone) return null;
  const code = countryCode || "+91";
  return `${code}${phone}`;
};

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

  const InfoRow = ({ icon: Icon, label, value, action, isLink = false }: { icon: any; label: string; value: string | number | null; action?: { href: string; text?: string }; isLink?: boolean }) => (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
        <Icon className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400">{label}</p>
        {action ? (
          <a
            href={action.href}
            target={action.href.startsWith('http') ? '_blank' : undefined}
            rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-xs font-medium text-gray-700 hover:text-blue-600 transition-colors break-words inline-flex items-center gap-0.5"
          >
            {value}
            {action.text && <span className="text-[9px] text-gray-400">({action.text})</span>}
          </a>
        ) : (
          <p className="text-xs font-medium text-gray-700 break-words">{value || '—'}</p>
        )}
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-50/80 border-b border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3 text-gray-400" />}
          {title}
        </h3>
      </div>
      <div className="p-2 space-y-0">{children}</div>
    </div>
  );

  const DocumentBadge = ({ label, url }: { label: string; url?: string }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-all text-xs group"
      >
        <FileText className="h-3 w-3" />
        <span className="text-[10px] font-medium">{label}</span>
        <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  };

  const formattedPhone = formatPhoneWithCode(staff.phone, staff.phone_country_code);
  const formattedWhatsApp = staff.whatsapp_number ? formatPhoneWithCode(staff.whatsapp_number, staff.phone_country_code) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[92vw] max-h-[85vh] overflow-hidden p-0 rounded-xl shadow-xl">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Small Avatar */}
              <div className="flex-shrink-0">
                {staff.photo_url ? (
                  <div className="h-10 w-10 rounded-full border border-white/30 overflow-hidden bg-white/10">
                    <img
                      src={staff.photo_url}
                      alt={staff.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              
              {/* Name and Badge */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm font-bold truncate">
                    {formatSalutation(staff.salutation)} {staff.name}
                  </h2>
                  <Badge className={`${staff.is_active ? "bg-emerald-500" : "bg-gray-500"} text-[9px] px-1.5 py-0 h-4`}>
                    {staff.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-blue-100 text-[10px] flex items-center gap-0.5">
                    <Briefcase className="h-2.5 w-2.5" />
                    {staff.role_name || staff.role}
                  </span>
                  {staff.employee_id && (
                    <>
                      <span className="text-blue-200 text-[9px]">•</span>
                      <span className="text-blue-100 text-[9px] flex items-center gap-0.5">
                        <Hash className="h-2.5 w-2.5" />
                        {staff.employee_id}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(staff);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 h-7 px-2 rounded-md text-[10px]"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
              <DialogClose asChild>
                <button className="p-1 rounded-md hover:bg-white/20 transition">
                  <X className="h-3.5 w-3.5" />
                </button>
              </DialogClose>
            </div>
          </div>
        </div>

        {/* Compact Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-65px)] p-3 bg-gray-50/50">
          {/* 3 Column Grid for ultra compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            
            {/* Personal Info */}
            <Section title="Personal" icon={User}>
              <InfoRow icon={Mail} label="Email" value={staff.email} action={{ href: `mailto:${staff.email}`, text: "" }} isLink />
              {formattedPhone && (
                <InfoRow icon={Phone} label="Phone" value={formattedPhone} action={{ href: `tel:${formattedPhone.replace(/[^0-9+]/g, '')}`, text: "" }} />
              )}
              {formattedWhatsApp && (
                <InfoRow icon={MessageSquare} label="WhatsApp" value={formattedWhatsApp} action={{ href: `https://wa.me/${formattedWhatsApp.replace(/[^0-9]/g, '')}`, text: "" }} />
              )}
              {staff.blood_group && staff.blood_group !== "not_specified" && (
                <InfoRow icon={Droplets} label="Blood" value={staff.blood_group.toUpperCase()} />
              )}
              <InfoRow icon={Calendar} label="Joined" value={formatDate(staff.joining_date)} />
            </Section>

            {/* Job Info */}
            <Section title="Job" icon={Briefcase}>
              <InfoRow icon={Building} label="Dept" value={staff.department_name || staff.department} />
              <InfoRow icon={Briefcase} label="Role" value={staff.role_name || staff.role} />
              <InfoRow icon={Hash} label="Emp ID" value={staff.employee_id} />
              <InfoRow icon={Banknote} label="Salary" value={formatSalary(staff.salary)} />
              {staff.assigned_requests > 0 && (
                <InfoRow icon={Briefcase} label="Requests" value={`${staff.assigned_requests}`} />
              )}
            </Section>

            {/* Address */}
            {(staff.current_address || staff.permanent_address) && (
              <Section title="Address" icon={Home}>
                {staff.current_address && (
                  <InfoRow icon={MapPin} label="Current" value={staff.current_address?.length > 50 ? `${staff.current_address.substring(0, 50)}...` : staff.current_address} />
                )}
                {staff.permanent_address && staff.permanent_address !== staff.current_address && (
                  <InfoRow icon={MapPin} label="Permanent" value={staff.permanent_address?.length > 50 ? `${staff.permanent_address.substring(0, 50)}...` : staff.permanent_address} />
                )}
              </Section>
            )}

            {/* Emergency Contact */}
            {(staff.emergency_contact_name || staff.emergency_contact_phone) && (
              <Section title="Emergency" icon={Shield}>
                {staff.emergency_contact_name && (
                  <InfoRow icon={User} label="Name" value={staff.emergency_contact_name} />
                )}
                {staff.emergency_contact_phone && (
                  <InfoRow icon={PhoneCall} label="Phone" value={staff.emergency_contact_phone} action={{ href: `tel:${staff.emergency_contact_phone.replace(/[^0-9+]/g, '')}`, text: "" }} />
                )}
                {staff.emergency_contact_relation && (
                  <InfoRow icon={AlertCircle} label="Relation" value={staff.emergency_contact_relation} />
                )}
              </Section>
            )}

            {/* KYC */}
            {(staff.aadhar_number || staff.pan_number) && (
              <Section title="KYC" icon={Shield}>
                {staff.aadhar_number && (
                  <InfoRow icon={FileText} label="Aadhar" value={`****${staff.aadhar_number.slice(-4)}`} />
                )}
                {staff.pan_number && (
                  <InfoRow icon={FileText} label="PAN" value={staff.pan_number.replace(/^([A-Z]{5})(\d{4})([A-Z])$/, '*****$2$3')} />
                )}
              </Section>
            )}

            {/* Bank Details - Compact */}
            {(staff.bank_account_holder_name || staff.bank_account_number || staff.bank_name) && (
              <Section title="Bank" icon={CreditCard}>
                {staff.bank_account_holder_name && (
                  <InfoRow icon={User} label="Holder" value={staff.bank_account_holder_name.length > 20 ? `${staff.bank_account_holder_name.substring(0, 20)}...` : staff.bank_account_holder_name} />
                )}
                {staff.bank_account_number && (
                  <InfoRow icon={CreditCard} label="Account" value={`****${staff.bank_account_number.slice(-4)}`} />
                )}
                {staff.bank_name && (
                  <InfoRow icon={Building} label="Bank" value={staff.bank_name.length > 15 ? `${staff.bank_name.substring(0, 15)}...` : staff.bank_name} />
                )}
                {staff.bank_ifsc_code && (
                  <InfoRow icon={Hash} label="IFSC" value={staff.bank_ifsc_code.toUpperCase()} />
                )}
                {staff.upi_id && (
                  <InfoRow icon={CreditCard} label="UPI" value={staff.upi_id.length > 20 ? `${staff.upi_id.substring(0, 20)}...` : staff.upi_id} />
                )}
              </Section>
            )}

            {/* Documents */}
            {(staff.aadhar_document_url || staff.pan_document_url) && (
              <Section title="Docs" icon={FileText}>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <DocumentBadge label="Aadhar" url={staff.aadhar_document_url} />
                  <DocumentBadge label="PAN" url={staff.pan_document_url} />
                </div>
              </Section>
            )}
          </div>

          {/* Footer Meta - Ultra Compact */}
          {(staff.created_at || staff.updated_at) && (
            <div className="mt-3 pt-2 border-t border-gray-200 text-[9px] text-gray-400 flex justify-between gap-2">
              {staff.created_at && <span>Created: {new Date(staff.created_at).toLocaleDateString()}</span>}
              {staff.updated_at && staff.updated_at !== staff.created_at && (
                <span>Updated: {new Date(staff.updated_at).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffDetailsPopup;