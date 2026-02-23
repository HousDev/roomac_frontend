// components/admin/enquiries/components/EnquiryForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CreateEnquiryPayload, UpdateEnquiryPayload } from "@/lib/enquiryApi";

interface EnquiryFormProps {
  formData: CreateEnquiryPayload | UpdateEnquiryPayload;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  properties: any[];
  isEdit?: boolean;
  currentStatus?: string;
  onSubmit?: () => void;
  submitLabel?: string;
}

const EnquiryForm = ({
  formData,
  setFormData,
  properties,
  isEdit = false,
  currentStatus,
  onSubmit,
  submitLabel = "Submit",
}: EnquiryFormProps) => {
  return (
    <div className="space-y-3 md:space-y-4">
      {/* Name and Phone - Already 2 columns */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Full Name *</Label>
          <Input
            value={formData.tenant_name}
            onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
            placeholder="John Doe"
            required
            className="h-8 md:h-10 text-xs md:text-sm"
          />
        </div>
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Phone *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="9876543210"
            required
            className="h-8 md:h-10 text-xs md:text-sm"
          />
        </div>
      </div>

      {/* Email and Property - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="h-8 md:h-10 text-xs md:text-sm"
          />
        </div>
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Property *</Label>
          <Select
            value={formData.property_id}
            onValueChange={(value) => setFormData({ ...formData, property_id: value })}
          >
            <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <SelectItem key={prop.id} value={String(prop.id)} className="text-xs md:text-sm">
                    {prop.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-property" disabled className="text-xs md:text-sm">
                  No properties available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Status (Edit Mode Only) - Full width on mobile */}
      {isEdit && (
        <div className="grid grid-cols-1 gap-2 md:gap-4">
          <div className="space-y-1 md:space-y-2">
            <Label className="text-xs md:text-sm font-medium">Status</Label>
            <Select
              value={(formData as UpdateEnquiryPayload).status || currentStatus || "new"}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new" className="text-xs md:text-sm">New</SelectItem>
                <SelectItem value="contacted" className="text-xs md:text-sm">Contacted</SelectItem>
                <SelectItem value="interested" className="text-xs md:text-sm">Interested</SelectItem>
                <SelectItem value="not_interested" className="text-xs md:text-sm">Not Interested</SelectItem>
                <SelectItem value="converted" className="text-xs md:text-sm">Converted</SelectItem>
                <SelectItem value="closed" className="text-xs md:text-sm">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Move-in Date and Budget - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Move-in Date</Label>
          <Input
            type="date"
            value={formData.preferred_move_in_date}
            onChange={(e) => setFormData({ ...formData, preferred_move_in_date: e.target.value })}
            className="h-8 md:h-10 text-xs md:text-sm"
          />
        </div>
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Budget Range</Label>
          <Input
            value={formData.budget_range}
            onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
            placeholder="e.g. 8000-12000"
            className="h-8 md:h-10 text-xs md:text-sm"
          />
        </div>
      </div>

      {/* Message - Full width on mobile */}
      <div className="grid grid-cols-1 gap-2 md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Message</Label>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Any additional details..."
            rows={2}
            className="text-xs md:text-sm resize-none min-h-[60px] md:min-h-[80px]"
          />
        </div>
      </div>
      
      {/* Submit Button */}
      {onSubmit && (
        <Button 
          onClick={onSubmit} 
          className="w-full mt-2 md:mt-4 h-8 md:h-10 text-xs md:text-sm"
        >
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

export default EnquiryForm;