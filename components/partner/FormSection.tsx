import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import gemini from "@/app/src/assets/images/gemini.png"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, ChevronDown, Building2, Handshake, X } from 'lucide-react';
import { toast } from 'sonner';
import type { PartnerFormData } from './types';

interface FormSectionProps {
  id: string;
  visible: boolean;
  formData: PartnerFormData;
  isSubmitting: boolean;
  submitted: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: keyof PartnerFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
  isPopupOpen: boolean;        // ← ADD
  onClosePopup: () => void;
   onApplyClick: () => void; 
}

export const FormSection = forwardRef<HTMLElement, FormSectionProps>(
  (
    {
      id,
      visible,
      formData,
      isSubmitting,
      submitted,
      onChange,
      onSelectChange,
      onSubmit,
      onReset,
      isPopupOpen,
      onClosePopup,
      onApplyClick,
      
    },
    ref
  ) => {

    const [localSubmitting, setLocalSubmitting] = useState(false);

  

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalSubmitting(true);

      try {
        // Validate required fields
        if (!formData.company_name || !formData.contact_person || !formData.email || !formData.phone) {
          toast.error("Please fill all required fields");
          setLocalSubmitting(false);
          return;
        }

        // Prepare data for API
        const payload = {
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          property_type: formData.property_type || 'other',
          property_count: parseInt(formData.property_count) || 1,
          location: formData.location || '',
          message: formData.message || '',
          status: 'new',
          no_of_buildings: parseInt(formData.no_of_buildings) || 1,  
  no_of_rooms: parseInt(formData.no_of_rooms) || 1,          
  city: formData.city || '',                                   
  locality: formData.locality || '', 
        };

        // Submit to API
        const response = await fetch('/api/partnership-enquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Partnership enquiry submitted successfully!");
onClosePopup();
 onReset(); // Reset form data
        } else {
          toast.error(result.message || "Failed to submit enquiry");
        }
      } catch (error) {
        console.error('Error submitting partnership enquiry:', error);
        toast.error("Failed to submit enquiry. Please try again.");
      } finally {
        setLocalSubmitting(false);
      }
    };

    return (
      <>
        <section
          ref={ref}
          id={id}
          className={`py-3 bg-white transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-block mb-4">
                <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                   Start Your Partnership Journey
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Join Our Partner Network
              </h2>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover how partnering with us can transform your business. Click apply now to begin.
              </p>
            </div>

            {/* ================= PARTNER HERO BANNER ================= */}
            <div className="">
              <div className=" bg-white rounded-3xl px-10 py-12 md:px-16 md:py-7 flex flex-col md:flex-row items-center justify-between gap-10">
                {/* LEFT CONTENT */}
                <div className="text-blue-900 max-w-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Handshake className="w-6 h-6 text-blue-400" />
                    <span className="text-blue-400 font-semibold tracking-wide">PARTNER WITH US</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Better Together:
                    <span className="text-blue-400 block mt-2">Grow Your Business</span>
                  </h2>

                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
                    Join our exclusive partner network and unlock new revenue streams. 
                    Get access to enterprise clients, dedicated support, and co-marketing opportunities.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={onApplyClick}  // ← ADD THIS LINE
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Apply now
                      <ChevronDown className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* RIGHT IMAGE */}
                <div className="flex-shrink-0">
                  <img
                    src={gemini}
                    alt="Gemini Logo"
                    className="w-[260px] md:w-[320px] object-contain animate-float"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {isPopupOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClosePopup}

            />

            {/* Popup Wrapper - Compact on mobile, unchanged on desktop */}
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
              <div className="relative bg-white w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* ================= STICKY HEADER - Compact on mobile ================= */}
                <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-slate-800 px-3 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm sm:text-lg font-semibold text-white">
                      Partnership Application
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-300">
                      Complete required fields
                    </p>
                  </div>

                  <button
                    onClick={onClosePopup}  // ← ADD THIS LINE
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1 sm:p-2 transition"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* ================= SCROLLABLE FORM BODY - More compact on mobile ================= */}
         <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
  <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5">
    
    {/* All fields in one unified grid - 2 cols mobile, 3 cols desktop */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
      
      {/* Company Name */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Company Name *
        </Label>
        <Input
          name="company_name"
          value={formData.company_name}
          onChange={onChange}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* Contact Person */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Contact Person *
        </Label>
        <Input
          name="contact_person"
          value={formData.contact_person}
          onChange={onChange}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* Phone */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Phone No*
        </Label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              onChange({ target: { name: "phone", value } });
            }
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* Email */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Email *
        </Label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* Property Type */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Property Type *
        </Label>
        <Select
          value={formData.property_type}
          onValueChange={(value) => onSelectChange("property_type", value)}
        >
          <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hotel" className="text-xs sm:text-sm">Hotel</SelectItem>
            <SelectItem value="hostel" className="text-xs sm:text-sm">Hostel</SelectItem>
            <SelectItem value="apartment" className="text-xs sm:text-sm">Apartment</SelectItem>
            <SelectItem value="resort" className="text-xs sm:text-sm">Resort</SelectItem>
            <SelectItem value="villa" className="text-xs sm:text-sm">Villa</SelectItem>
            <SelectItem value="other" className="text-xs sm:text-sm">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Number of Properties */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Number of Properties *
        </Label>
        <Input
          type="number"
          name="property_count"
          value={formData.property_count}
          onChange={onChange}
          min="1"
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* No. of Buildings */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          No. of Buildings *
        </Label>
        <Input
          type="number"
          name="no_of_buildings"
          value={formData.no_of_buildings}
          onChange={onChange}
          min="1"
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* No. of Rooms */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          No. of Rooms *
        </Label>
        <Input
          type="number"
          name="no_of_rooms"
          value={formData.no_of_rooms}
          onChange={onChange}
          min="1"
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      

      {/* Locality */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Locality *
        </Label>
        <Input
          name="locality"
          value={formData.locality}
          onChange={onChange}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* City */}
      <div className="space-y-0.5 sm:space-y-1">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          City *
        </Label>
        <Input
          name="city"
          value={formData.city}
          onChange={onChange}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* Primary Location - spans 2 cols on desktop, full row on mobile */}
      <div className="space-y-0.5 sm:space-y-1 col-span-1 sm:col-span-2">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Primary Location *
        </Label>
        <Input
          name="location"
          value={formData.location}
          onChange={onChange}
          required
          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        />
      </div>

      {/* Additional Information - full width always */}
      <div className="space-y-0.5 sm:space-y-1 col-span-2 sm:col-span-3">
        <Label className="text-[11px] sm:text-xs font-medium text-slate-600">
          Additional Information
        </Label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={onChange}
          rows={2}
          className="text-xs sm:text-sm px-2 sm:px-3 min-h-[60px] sm:min-h-[80px]"
        />
      </div>

    </div>
  </div>

  {/* ================= STICKY FOOTER ================= */}
  <div className="sticky bottom-0 bg-white border-t border-slate-200 px-3 sm:px-6 py-2 sm:py-4">
    <div className="flex items-center justify-between gap-3">
      
      <Button
        type="button"
        onClick={onClosePopup}
        className="w-1/2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 h-9 sm:h-11 text-xs sm:text-sm font-semibold"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white h-9 sm:h-8 text-[10px] sm:text-sm font-semibold"
        disabled={localSubmitting}
      >
        {localSubmitting ? "Submitting..." : "Submit Partnership Inquiry"}
      </Button>
    </div>
    <p className="text-[9px] sm:text-[11px] text-center text-slate-500 mt-1 sm:mt-2">
      By submitting, you agree to our Terms & Privacy Policy.
    </p>
  </div>
</form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

FormSection.displayName = 'FormSection';