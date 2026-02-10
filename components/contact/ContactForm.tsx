'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle } from 'lucide-react';
import { ContactFormData } from './types';
import { useCallback, useState } from 'react';

interface ContactFormProps {
  initialData?: ContactFormData;
}

export default function ContactForm({ initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      subject: '',
      propertyInterest: '',
      message: '',
    }
  );
  
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        propertyInterest: '',
        message: '',
      });
    }, 3000);
  }, []);

  const handleInputChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              placeholder="+91 98765 43210"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs font-medium">Subject *</Label>
            <Input
              id="subject"
              required
              placeholder="Property Inquiry"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="property" className="text-xs font-medium">Property Interest</Label>
            <Select 
              value={formData.propertyInterest} 
              onValueChange={(value) => handleInputChange('propertyInterest', value)}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hinjawadi" className="text-sm">ROOMAC Hinjawadi Premium</SelectItem>
                <SelectItem value="wakad" className="text-sm">ROOMAC Wakad Elite</SelectItem>
                <SelectItem value="baner" className="text-sm">ROOMAC Baner Comfort</SelectItem>
                <SelectItem value="other" className="text-sm">Other / General Inquiry</SelectItem>
              </SelectContent>
            </Select>
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
        >
          <Send className="mr-2 h-4 w-4" />
          Send Message
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