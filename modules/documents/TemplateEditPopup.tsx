// TemplateEditPopup.tsx - Direct field mapping from your data structure
import { useState } from "react";
import {
  FileText, X, Edit, Save, User, Phone, Mail,
  CreditCard, Fingerprint, AlertCircle, Users,
  Loader2, Copy, Check, Sparkles, Pen, Hash,
  IdCard, Briefcase, Home, Calendar, DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function TemplateEditPopup({ doc, onClose, onDone }: { doc: any; onClose: () => void; onDone: () => void }) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  // Form fields state - directly mapped from your document structure
  const [formData, setFormData] = useState({
    // RECIPIENT INFORMATION (as shown in image)
    fullName: doc.tenant_name || '',
    phoneNumber: doc.tenant_phone || '',
    email: doc.tenant_email || '',
    aadhaarNumber: doc.aadhaar_number || '',
    panNumber: doc.pan_number || '',
    
    // Emergency Contact
    emergencyContactName: doc.emergency_contact_name || '',
    emergencyPhone: doc.emergency_phone || '',
    
    // Property Details
    propertyName: doc.property_name || '',
    propertyAddress: doc.property_address || '',
    roomNumber: doc.room_number || '',
    bedNumber: doc.bed_number || '',
    
    // Dates
    moveInDate: doc.move_in_date || '',
    
    // Financial
    rentAmount: doc.rent_amount?.toString() || '',
    securityDeposit: doc.security_deposit?.toString() || '',
    paymentMode: doc.payment_mode || '',
    
    // Additional
    companyName: doc.company_name || '',
    companyAddress: doc.company_address || '',
    notes: doc.notes || ''
  });

  // Update field handler
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = async () => {
    // Validate required fields
    if (!formData.fullName) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    setSaving(true);
    try {
      // Prepare data for API update
      const updatedData = {
        ...doc,
        tenant_name: formData.fullName,
        tenant_phone: formData.phoneNumber,
        tenant_email: formData.email || null,
        aadhaar_number: formData.aadhaarNumber || null,
        pan_number: formData.panNumber || null,
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_phone: formData.emergencyPhone || null,
        property_name: formData.propertyName || null,
        property_address: formData.propertyAddress || null,
        room_number: formData.roomNumber || null,
        bed_number: formData.bedNumber || null,
        move_in_date: formData.moveInDate || null,
        rent_amount: formData.rentAmount ? parseFloat(formData.rentAmount) : null,
        security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        payment_mode: formData.paymentMode || null,
        company_name: formData.companyName || null,
        company_address: formData.companyAddress || null,
        notes: formData.notes || null,
        // Update data_json as well for template placeholders
        data_json: {
          ...doc.data_json,
          tenant_name: formData.fullName,
          tenant_phone: formData.phoneNumber,
          tenant_email: formData.email,
          aadhaar_number: formData.aadhaarNumber,
          pan_number: formData.panNumber,
          emergency_contact_name: formData.emergencyContactName,
          emergency_phone: formData.emergencyPhone,
          property_name: formData.propertyName,
          property_address: formData.propertyAddress,
          room_number: formData.roomNumber,
          bed_number: formData.bedNumber,
          move_in_date: formData.moveInDate,
          rent_amount: formData.rentAmount,
          security_deposit: formData.securityDeposit,
          payment_mode: formData.paymentMode,
          full_name: formData.fullName,
          phone: formData.phoneNumber,
          email: formData.email,
          aadhaar: formData.aadhaarNumber,
          pan: formData.panNumber,
          emergency_contact: `${formData.emergencyContactName} (${formData.emergencyPhone})`
        }
      };

      // Here you would call your API to update the document
      // await updateDocument(doc.id, updatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Document fields updated successfully!");
      onDone();
    } catch (error) {
      toast.error("Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  // Generate preview HTML matching the image style
  const generatePreview = () => {
    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">RECIPIENT INFORMATION</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 16px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0; font-weight: 500;">FULL NAME</p>
            <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${formData.fullName || '—'}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0; font-weight: 500;">PHONE NUMBER</p>
            <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${formData.phoneNumber || '—'}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0; font-weight: 500;">EMAIL</p>
            <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${formData.email || '—'}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0; font-weight: 500;">AADHAAR NUMBER</p>
              <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${formData.aadhaarNumber || '—'}</p>
            </div>
            <div>
              <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0; font-weight: 500;">PAN NUMBER</p>
              <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${formData.panNumber || '—'}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 16px; background: #f9fafb; padding: 12px; border-radius: 8px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0; font-weight: 500;">EMERGENCY CONTACT</p>
            <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">
              ${formData.emergencyContactName || '—'} ${formData.emergencyPhone ? `(${formData.emergencyPhone})` : ''}
            </p>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
          <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 8px 0;">❯ TERMS & CONDITIONS</p>
          <p style="font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5;">
            By signing this document, you agree to all the terms and conditions mentioned above.
          </p>
        </div>
      </div>
    `;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Edit Document Fields
                <Badge className="bg-white/30 text-white border-0 text-[8px] sm:text-[10px] px-1.5 py-0.5">
                  {doc.document_number}
                </Badge>
              </h2>
              <p className="text-[10px] sm:text-xs text-white/80">{doc.document_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b px-4 sm:px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${
              activeTab === "edit" 
                ? "bg-purple-100 text-purple-700 border-b-2 border-purple-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Pen className="h-3 w-3" /> Edit Fields
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${
              activeTab === "preview" 
                ? "bg-purple-100 text-purple-700 border-b-2 border-purple-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="h-3 w-3" /> Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === "edit" ? (
            <div className="space-y-6">
              {/* RECIPIENT INFORMATION Section - Exactly as in image */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    RECIPIENT INFORMATION
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <User className="h-3 w-3" /> FULL NAME <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Enter full name"
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> PHONE NUMBER <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                      className="h-9 text-sm"
                      type="tel"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> EMAIL
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="h-9 text-sm"
                      type="email"
                    />
                  </div>

                  {/* Aadhaar and PAN in grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <IdCard className="h-3 w-3" /> AADHAAR NUMBER
                      </label>
                      <Input
                        value={formData.aadhaarNumber}
                        onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                        placeholder="Enter Aadhaar"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> PAN NUMBER
                      </label>
                      <Input
                        value={formData.panNumber}
                        onChange={(e) => handleChange('panNumber', e.target.value)}
                        placeholder="Enter PAN"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <h4 className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> EMERGENCY CONTACT
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={formData.emergencyContactName}
                        onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                        placeholder="Contact name"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={formData.emergencyPhone}
                        onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                        placeholder="Phone number"
                        className="h-9 text-sm"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PROPERTY DETAILS Section */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
                  <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    PROPERTY DETAILS
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-medium text-gray-600">Property Name</label>
                      <Input
                        value={formData.propertyName}
                        onChange={(e) => handleChange('propertyName', e.target.value)}
                        placeholder="Enter property name"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-medium text-gray-600">Property Address</label>
                      <Input
                        value={formData.propertyAddress}
                        onChange={(e) => handleChange('propertyAddress', e.target.value)}
                        placeholder="Enter property address"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Room Number</label>
                      <Input
                        value={formData.roomNumber}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                        placeholder="Room #"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Bed Number</label>
                      <Input
                        value={formData.bedNumber}
                        onChange={(e) => handleChange('bedNumber', e.target.value)}
                        placeholder="Bed #"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FINANCIAL DETAILS Section */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 border-b border-yellow-100">
                  <h3 className="text-sm font-semibold text-yellow-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    FINANCIAL DETAILS
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Rent Amount</label>
                      <Input
                        value={formData.rentAmount}
                        onChange={(e) => handleChange('rentAmount', e.target.value)}
                        placeholder="Monthly rent"
                        className="h-9 text-sm"
                        type="number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Security Deposit</label>
                      <Input
                        value={formData.securityDeposit}
                        onChange={(e) => handleChange('securityDeposit', e.target.value)}
                        placeholder="Deposit amount"
                        className="h-9 text-sm"
                        type="number"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-medium text-gray-600">Payment Mode</label>
                      <Input
                        value={formData.paymentMode}
                        onChange={(e) => handleChange('paymentMode', e.target.value)}
                        placeholder="e.g., Bank Transfer, Cheque"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DATES Section */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    DATES
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Move-in Date</label>
                    <Input
                      value={formData.moveInDate}
                      onChange={(e) => handleChange('moveInDate', e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className="h-9 text-sm"
                      type="date"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Tab */
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div dangerouslySetInnerHTML={{ __html: generatePreview() }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Editing document #{doc.document_number}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditPopup;