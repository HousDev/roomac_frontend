// app/admin/staff/components/StaffForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Droplets,
  FileText,
  Hash,
  IndianRupee,
  Calendar,
  Home,
  Building,
  AlertCircle,
  CreditCard,
  Upload,
  Eye,
} from "lucide-react";
import { StaffMember } from "@/lib/staffApi";

interface StaffFormProps {
  formData: {
    salutation: string;
    name: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    is_whatsapp_same: boolean;
    blood_group: string;
    aadhar_number: string;
    pan_number: string;
    role: string;
    employee_id: string;
    salary: string;
    department: string;
    joining_date: string;
    current_address: string;
    permanent_address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
    bank_account_holder_name: string;
    bank_account_number: string;
    bank_name: string;
    bank_ifsc_code: string;
    upi_id: string;
    aadhar_document: File | null;
    pan_document: File | null;
    photo: File | null;
    aadhar_document_url: string;
    pan_document_url: string;
    photo_url: string;
    is_active: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingStaff: StaffMember | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, documentType: 'aadhar_document' | 'pan_document' | 'photo') => void;
  handleRemoveDocument: (documentType: 'aadhar_document' | 'pan_document' | 'photo') => void;
}

// Blood groups
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const StaffForm = ({
  formData,
  setFormData,
  editingStaff,
  handleFileUpload,
  handleRemoveDocument,
}: StaffFormProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-0">
      {/* Column 1 - Personal Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salutation" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Salutation
          </Label>
          <Select
            value={formData.salutation}
            onValueChange={(v) => setFormData({ ...formData, salutation: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select salutation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mr">Mr.</SelectItem>
              <SelectItem value="mrs">Mrs.</SelectItem>
              <SelectItem value="miss">Miss</SelectItem>
              <SelectItem value="dr">Dr.</SelectItem>
              <SelectItem value="prof">Prof.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Full Name *
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            Phone Number *
          </Label>
          <Input
            placeholder="9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              WhatsApp Number
            </Label>
            <div className="flex items-center gap-2 text-xs">
              <span>Same as phone</span>
              <Switch
                checked={formData.is_whatsapp_same}
                onCheckedChange={(checked) => {
                  setFormData((prev: { phone: any; whatsapp_number: any; }) => ({
                    ...prev,
                    is_whatsapp_same: checked,
                    whatsapp_number: checked ? prev.phone : prev.whatsapp_number,
                  }));
                }}
              />
            </div>
          </div>

          {formData.is_whatsapp_same ? (
            <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
              WhatsApp will use the phone number: {formData.phone}
            </div>
          ) : (
            <Input
              placeholder="Enter WhatsApp number"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              disabled={formData.is_whatsapp_same}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="blood_group" className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-gray-500" />
            Blood Group
          </Label>
          <Select
            value={formData.blood_group}
            onValueChange={(v) => setFormData({ ...formData, blood_group: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_specified">Not Specified</SelectItem>
              {bloodGroups.map(group => (
                <SelectItem key={group} value={group.toLowerCase()}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KYC Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <Label className="text-sm font-medium">KYC Details</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhar_number" className="text-xs">
              Aadhar Card Number
            </Label>
            <Input
              id="aadhar_number"
              placeholder="XXXX XXXX XXXX"
              value={formData.aadhar_number}
              onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan_number" className="text-xs">
              PAN Card Number
            </Label>
            <Input
              id="pan_number"
              placeholder="ABCDE1234F"
              value={formData.pan_number}
              onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Column 2 - Job Information & Address */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee_id" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-500" />
            Employee ID
          </Label>
          <Input
            id="employee_id"
            placeholder="EMP-001"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            Department
          </Label>
          <Input
            id="department"
            placeholder="Enter department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(v) => setFormData({ ...formData, role: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="caretaker">Caretaker</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="cook">Cook</SelectItem>
              <SelectItem value="housekeeping">Housekeeping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-gray-500" />
            Salary (₹)
          </Label>
          <Input
            id="salary"
            type="number"
            placeholder="25000"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="joining_date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Joining Date
          </Label>
          <Input
            id="joining_date"
            type="date"
            value={formData.joining_date}
            onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
          />
        </div>

        {/* Address Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-green-500" />
            <Label className="text-sm font-medium">Address Details</Label>
          </div>

          <div className="space-y-2">
            <Label>Current Address</Label>
            <Textarea
              placeholder="Enter current address"
              value={formData.current_address}
              onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Permanent Address</Label>
            <Textarea
              placeholder="Enter permanent address"
              value={formData.permanent_address}
              onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Column 3 - Emergency Contact, Bank Details & Documents */}
      <div className="space-y-4">
        {/* Emergency Contact Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <Label className="text-sm font-medium">Emergency Contact</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name" className="text-xs">
              Contact Name
            </Label>
            <Input
              id="emergency_contact_name"
              placeholder="Emergency contact person name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone" className="text-xs">
                Phone Number
              </Label>
              <Input
                id="emergency_contact_phone"
                placeholder="9876543210"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relation" className="text-xs">
                Relationship
              </Label>
              <Input
                id="emergency_contact_relation"
                placeholder="Father/Mother/Spouse"
                value={formData.emergency_contact_relation}
                onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <Label className="text-sm font-medium">Bank Details</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_account_holder_name" className="text-xs">
              Account Holder Name
            </Label>
            <Input
              id="bank_account_holder_name"
              placeholder="Account holder name as per bank"
              value={formData.bank_account_holder_name}
              onChange={(e) => setFormData({ ...formData, bank_account_holder_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_account_number" className="text-xs">
              Account Number
            </Label>
            <Input
              id="bank_account_number"
              placeholder="XXXX XXXX XXXX XXXX"
              value={formData.bank_account_number}
              onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bank_name" className="text-xs">
                Bank Name
              </Label>
              <Input
                id="bank_name"
                placeholder="Bank name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_ifsc_code" className="text-xs">
                IFSC Code
              </Label>
              <Input
                id="bank_ifsc_code"
                placeholder="ABCD0123456"
                value={formData.bank_ifsc_code}
                onChange={(e) => setFormData({ ...formData, bank_ifsc_code: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upi_id" className="text-xs">
              UPI ID
            </Label>
            <Input
              id="upi_id"
              placeholder="username@upi"
              value={formData.upi_id}
              onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
            />
          </div>
        </div>

        {/* Documents Upload Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-purple-500" />
            <Label className="text-sm font-medium">Upload Documents</Label>
          </div>

          <div className="space-y-3">
            {/* Aadhar Card */}
            <div className="space-y-2">
              <Label className="text-xs">Aadhar Card (PDF/Image)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'aadhar_document')}
                className="cursor-pointer"
              />
              {(formData.aadhar_document_url || formData.aadhar_document) && (
                <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded mt-1">
                  <span className="truncate">
                    {formData.aadhar_document 
                      ? formData.aadhar_document.name 
                      : "Aadhar document uploaded"}
                  </span>
                  <div className="flex gap-2">
                    {formData.aadhar_document_url && !formData.aadhar_document && (
                      <a
                        href={formData.aadhar_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="View document"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument('aadhar_document')}
                      className="text-red-600 hover:text-red-800"
                      title="Remove document"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PAN Card */}
            <div className="space-y-2">
              <Label className="text-xs">PAN Card (PDF/Image)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'pan_document')}
                className="cursor-pointer"
              />
              {(formData.pan_document_url || formData.pan_document) && (
                <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded mt-1">
                  <span className="truncate">
                    {formData.pan_document 
                      ? formData.pan_document.name 
                      : "PAN document uploaded"}
                  </span>
                  <div className="flex gap-2">
                    {formData.pan_document_url && !formData.pan_document && (
                      <a
                        href={formData.pan_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="View document"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument('pan_document')}
                      className="text-red-600 hover:text-red-800"
                      title="Remove document"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label className="text-xs">Passport Size Photo (Image)</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'photo')}
                className="cursor-pointer"
              />
              {(formData.photo_url || formData.photo) && (
                <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded mt-1">
                  <span className="truncate">
                    {formData.photo 
                      ? formData.photo.name 
                      : "Photo uploaded"}
                  </span>
                  <div className="flex gap-2">
                    {formData.photo_url && !formData.photo && (
                      <a
                        href={formData.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="View photo"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument('photo')}
                      className="text-red-600 hover:text-red-800"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;