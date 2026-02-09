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
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 md:p-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Send us a Message</h2>
          <p className="text-slate-600">Fill out the form below and we'll get back to you within 24 hours</p>
        </div>

        {submitted ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-12 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-3">Message Sent Successfully!</h3>
            <p className="text-green-700 text-lg mb-6">We've received your message and will get back to you within 24 hours.</p>
            <Button onClick={() => setSubmitted(false)} className="bg-green-600 hover:bg-green-700">
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-12 mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="subject" className="text-sm font-semibold">Subject *</Label>
                <Input
                  id="subject"
                  required
                  placeholder="Property Inquiry"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="h-12 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="property" className="text-sm font-semibold">Property Interest</Label>
                <Select 
                  value={formData.propertyInterest} 
                  onValueChange={(value) => handleInputChange('propertyInterest', value)}
                >
                  <SelectTrigger className="h-12 mt-2">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hinjawadi">ROOMAC Hinjawadi Premium</SelectItem>
                    <SelectItem value="wakad">ROOMAC Wakad Elite</SelectItem>
                    <SelectItem value="baner">ROOMAC Baner Comfort</SelectItem>
                    <SelectItem value="other">Other / General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-semibold">Message *</Label>
              <Textarea
                id="message"
                rows={6}
                required
                placeholder="Tell us about your requirements, preferred location, budget, and any questions you have..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="mt-2"
              />
            </div>

            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-[#06326b] to-blue-700 hover:from-[#003580] hover:to-blue-500 shadow-lg text-lg h-14">
              <Send className="mr-2 h-5 w-5" />
              Send Message
            </Button>

            <p className="text-sm text-slate-500 text-center">
              By submitting this form, you agree to our privacy policy and terms of service
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}