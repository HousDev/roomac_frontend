'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle, Calendar, IndianRupee } from 'lucide-react';
import { ContactFormData } from './types';
import { useCallback, useState, useEffect } from 'react';
import { createEnquiry, CreateEnquiryPayload } from '@/lib/enquiryApi';
import { toast } from 'sonner';

interface ContactFormProps {
  initialData?: ContactFormData;
  properties?: any[];
}

export default function ContactForm({ initialData, properties = [] }: ContactFormProps) {
  const [formData, setFormData] = useState<any>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      propertyInterest: '',
      message: '',
      preferredMoveInDate: '',
      budgetRange: '',
    }
  );
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<any[]>(properties);

  // Fetch properties if not provided
  useEffect(() => {
    if (properties.length === 0) {
      fetchProperties();
    }
  }, []);

  const fetchProperties = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/properties`);
      const data = await res.json();
      setAvailableProperties(data.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  // Function to create notification for admin
  const createEnquiryNotification = async (enquiryId: string, propertyName: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Since we don't have a direct notification creation endpoint,
      // we'll use the test-notification endpoint which exists in your API
      const response = await fetch(`${apiUrl}/api/admin/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🏢 New Enquiry Received',
          message: `${formData.name} has shown interest in ${propertyName}`,
          metadata: {
            enquiry_id: enquiryId,
            tenant_name: formData.name,
            tenant_email: formData.email,
            tenant_phone: formData.phone,
            property_name: propertyName,
            property_id: formData.propertyInterest,
            budget_range: formData.budgetRange || 'Not specified',
            move_in_date: formData.preferredMoveInDate || 'Not specified',
            message: formData.message,
            source: 'website_contact_form',
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Admin notification created successfully');
      } else {
        console.warn('⚠️ Notification created but response indicated failure:', data);
      }
    } catch (error) {
      // Don't throw error - notification failure shouldn't block form submission
      console.error('❌ Error creating notification:', error);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Check if property is selected
      if (!formData.propertyInterest) {
        toast.error('Please select a property');
        setLoading(false);
        return;
      }

      // Get property name for the selected property
      const selectedProperty = availableProperties.find(
        p => String(p.id) === formData.propertyInterest
      );

      // Format date for database (YYYY-MM-DD)
      let formattedDate = '';
      if (formData.preferredMoveInDate) {
        const date = new Date(formData.preferredMoveInDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      // Map contact form data to enquiry API format
      const enquiryData: CreateEnquiryPayload = {
        property_id: formData.propertyInterest,
        property_name: selectedProperty?.name || 'Property Inquiry',
        tenant_name: formData.name,
        phone: formData.phone,
        email: formData.email,
        preferred_move_in_date: formattedDate || null,
        budget_range: formData.budgetRange || null,
        message: formData.message || 'No message provided',
        source: 'website_contact_form',
        status: 'new'
      };

      // Submit to your enquiry API
      const response = await createEnquiry(enquiryData);
      
      // Create notification for admin using the test-notification endpoint
      if (response && response.data && response.data.id) {
        await createEnquiryNotification(
          response.data.id, 
          selectedProperty?.name || 'a property'
        );
      }
      
      setSubmitted(true);
      toast.success('Enquiry submitted successfully!');
      
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          propertyInterest: '',
          message: '',
          preferredMoveInDate: '',
          budgetRange: '',
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      
      // Show more specific error message
      if (error.message.includes('500')) {
        toast.error('Server error. Please check if all required fields are provided.');
      } else {
        toast.error(error.message || 'Failed to submit enquiry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, availableProperties]);

  const handleInputChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData((prev:any) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Card className="border border-slate-200 shadow-lg">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Contact Us</h2>
          <p className="text-slate-600 text-sm">We'll respond within 24 hours</p>
        </div>

        {submitted ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-800 mb-2">Message Sent!</h3>
            <p className="text-green-700 text-sm mb-4">We'll get back to you within 24 hours.</p>
            <Button 
              onClick={() => setSubmitted(false)} 
              className="bg-green-600 hover:bg-green-700 text-sm h-9"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">Full Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property" className="text-xs font-medium">Property Interest *</Label>
              <Select 
                value={formData.propertyInterest} 
                onValueChange={(value) => handleInputChange('propertyInterest', value)}
                required
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {availableProperties.length > 0 ? (
                    availableProperties.map((property) => (
                      <SelectItem key={property.id} value={String(property.id)} className="text-sm">
                        {property.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-property" disabled>
                      Loading properties...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Fields - Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="moveInDate" className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Preferred Move-in Date
                </Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={formData.preferredMoveInDate || ''}
                  onChange={(e) => handleInputChange('preferredMoveInDate', e.target.value)}
                  className="h-10 text-sm"
                />
                <p className="text-xs text-gray-500">When would you like to move in?</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget" className="text-xs font-medium flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  Budget Range
                </Label>
                <Input
                  id="budget"
                  placeholder="e.g. 8000-12000"
                  value={formData.budgetRange || ''}
                  onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                  className="h-10 text-sm"
                />
                <p className="text-xs text-gray-500">Monthly rent budget</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs font-medium">Message *</Label>
              <Textarea
                id="message"
                rows={4}
                required
                placeholder="Tell us about your requirements..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="text-sm min-h-[100px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#06326b] to-blue-700 hover:from-[#003580] hover:to-blue-500 h-11 text-sm font-medium"
              disabled={loading}
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>

            <p className="text-xs text-slate-500 text-center pt-2">
              By submitting this form, you agree to our privacy policy and terms of service
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}