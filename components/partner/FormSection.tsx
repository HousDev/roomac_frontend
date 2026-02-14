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
    },
    ref
  ) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleApplyClick = () => {
      setIsPopupOpen(true);
      // Prevent body scrolling when popup is open
      document.body.style.overflow = 'hidden';
    };

    const handleClosePopup = () => {
      setIsPopupOpen(false);
      // Restore body scrolling
      document.body.style.overflow = 'unset';
    };

    return (
      <>
        <section
          ref={ref}
          id={id}
          className={`py-3 bg-gradient-to-b from-white to-slate-50 transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="container mx-auto px-4">
             <div className="text-center mb-10">
              <div className="inline-block mb-4">
                <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                  🚀 Start Your Partnership Journey
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
              <div className="bg-gradient-to-r from-[#0f1a2b] to-[#1a2b3f] rounded-3xl px-10 py-12 md:px-16 md:py-7 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">

                {/* LEFT CONTENT */}
                <div className="text-white max-w-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Handshake className="w-6 h-6 text-blue-400" />
                    <span className="text-blue-400 font-semibold tracking-wide">PARTNER WITH US</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Better Together:
                    <span className="text-blue-400 block mt-2">Grow Your Business</span>
                  </h2>

                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
                    Join our exclusive partner network and unlock new revenue streams. 
                    Get access to enterprise clients, dedicated support, and co-marketing opportunities.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={handleApplyClick}
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
      onClick={handleClosePopup}
    />

    {/* Popup Wrapper */}
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative bg-white w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ================= STICKY HEADER ================= */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Partnership Application
            </h3>
            <p className="text-xs text-slate-300">
              Complete required fields
            </p>
          </div>

          <button
            onClick={handleClosePopup}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= SCROLLABLE FORM BODY ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">
                Company Name *
              </Label>
              <Input
                name="company_name"
                value={formData.company_name}
                onChange={onChange}
                required
                className="mt-1 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">
                Contact Person *
              </Label>
              <Input
                name="contact_person"
                value={formData.contact_person}
                onChange={onChange}
                required
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">
                Email *
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                className="mt-1 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">
                Phone *
              </Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          {/* Property */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">
                Property Type *
              </Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) =>
                  onSelectChange("property_type", value)
                }
              >
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">
                Number of Properties *
              </Label>
              <Input
                type="number"
                name="property_count"
                value={formData.property_count}
                onChange={onChange}
                min="1"
                required
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-xs font-medium text-slate-600">
              Primary Location *
            </Label>
            <Input
              name="location"
              value={formData.location}
              onChange={onChange}
              required
              className="mt-1 h-9 text-sm"
            />
          </div>

          {/* Message */}
          <div>
            <Label className="text-xs font-medium text-slate-600">
              Additional Information
            </Label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={onChange}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
        </div>

        {/* ================= STICKY FOOTER ================= */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Partnership Inquiry"}
          </Button>

          <p className="text-[11px] text-center text-slate-500 mt-2">
            By submitting, you agree to our Terms & Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  </div>
)}

      </>
    );
  }
);

FormSection.displayName = 'FormSection';