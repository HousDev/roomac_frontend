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
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input
            value={formData.tenant_name}
            onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="9876543210"
            required
          />
        </div>
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>
      <div>
        <Label>Property *</Label>
        <Select
          value={formData.property_id}
          onValueChange={(value) => setFormData({ ...formData, property_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.length > 0 ? (
              properties.map((prop) => (
                <SelectItem key={prop.id} value={String(prop.id)}>
                  {prop.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-property" disabled>
                No properties available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {isEdit && (
        <div>
          <Label>Status</Label>
          <Select
            value={(formData as UpdateEnquiryPayload).status || currentStatus || "new"}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Move-in Date</Label>
          <Input
            type="date"
            value={formData.preferred_move_in_date}
            onChange={(e) => setFormData({ ...formData, preferred_move_in_date: e.target.value })}
          />
        </div>
        <div>
          <Label>Budget Range</Label>
          <Input
            value={formData.budget_range}
            onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
            placeholder="e.g. 8000-12000"
          />
        </div>
      </div>
      <div>
        <Label>Message</Label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Any additional details..."
          rows={3}
        />
      </div>
      
      {onSubmit && (
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

export default EnquiryForm;