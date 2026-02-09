import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';
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
  ({ id, visible, formData, isSubmitting, submitted, onChange, onSelectChange, onSubmit, onReset }, ref) => {
    return (
      <section 
        ref={ref}
        id={id}
        className={`py-16 bg-white relative overflow-hidden transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-24 h-24 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[4000ms]" />
          <div className="absolute top-10 right-20 w-16 h-16 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[5000ms] animate-delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-20 h-20 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[4500ms] animate-delay-500" />
          <div className="absolute bottom-10 right-1/3 w-12 h-12 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[3500ms] animate-delay-1500" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Partnership Program
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Fill out the form below and our partnership team will get in touch with you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className={`bg-white border-2 border-slate-200 rounded-xl p-8 shadow-sm transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-center">
                  <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">
                    Thank You
                  </h3>
                  <p className="text-slate-600 mb-8 text-lg">
                    Your partnership inquiry has been successfully submitted. Our team will review your application and contact you within 24-48 hours.
                  </p>
                  <Button
                    onClick={onReset}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="bg-slate-900 p-6">
                  <h3 className="text-2xl font-bold text-white text-center">
                    Partnership Application
                  </h3>
                  <p className="text-slate-300 text-center mt-2">
                    Complete all required fields to get started
                  </p>
                </div>

                <div className="p-6 md:p-8">
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="company_name" className="text-slate-700 font-medium">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-slate-400">
                            🏢
                          </div>
                          <Input
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={onChange}
                            placeholder="Your company or property name"
                            required
                            disabled={isSubmitting}
                            className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="contact_person" className="text-slate-700 font-medium">
                          Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-slate-400">
                            👤
                          </div>
                          <Input
                            id="contact_person"
                            name="contact_person"
                            value={formData.contact_person}
                            onChange={onChange}
                            placeholder="Your full name"
                            required
                            disabled={isSubmitting}
                            className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-slate-700 font-medium">
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-slate-400">
                            ✉️
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={onChange}
                            placeholder="your@email.com"
                            required
                            disabled={isSubmitting}
                            className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-slate-400">
                            📱
                          </div>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={onChange}
                            placeholder="+1 (555) 000-0000"
                            required
                            disabled={isSubmitting}
                            className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="property_type" className="text-slate-700 font-medium">
                          Property Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.property_type}
                          onValueChange={(value) => onSelectChange('property_type', value)}
                          disabled={isSubmitting}
                          required
                        >
                          <SelectTrigger className="py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border-slate-200 shadow-sm">
                            <SelectItem value="hotel" className="py-3">Hotel</SelectItem>
                            <SelectItem value="hostel" className="py-3">Hostel</SelectItem>
                            <SelectItem value="apartment" className="py-3">Apartment</SelectItem>
                            <SelectItem value="guesthouse" className="py-3">Guest House</SelectItem>
                            <SelectItem value="resort" className="py-3">Resort</SelectItem>
                            <SelectItem value="villa" className="py-3">Villa</SelectItem>
                            <SelectItem value="other" className="py-3">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="property_count" className="text-slate-700 font-medium">
                          Number of Properties <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-slate-400">
                            📊
                          </div>
                          <Input
                            id="property_count"
                            name="property_count"
                            type="number"
                            min="1"
                            value={formData.property_count}
                            onChange={onChange}
                            placeholder="1"
                            required
                            disabled={isSubmitting}
                            className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-slate-700 font-medium">
                        Primary Location <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-400">
                          📍
                        </div>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={onChange}
                          placeholder="City, State/Country"
                          required
                          disabled={isSubmitting}
                          className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-slate-700 font-medium">
                        Additional Information
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-400">
                          💬
                        </div>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={onChange}
                          placeholder="Tell us more about your properties, expectations, or any questions you have..."
                          rows={5}
                          disabled={isSubmitting}
                          className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Partnership Inquiry'
                      )}
                    </Button>

                    <div className="text-center pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500">
                        By submitting this form, you agree to our 
                        <span className="text-slate-900 font-medium mx-1">Terms of Service</span> 
                        and 
                        <span className="text-slate-900 font-medium mx-1">Privacy Policy</span>.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

FormSection.displayName = 'FormSection';