'use client';

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { HeroSection } from '@/components/partner/HeroSection';
import { BenefitsSection } from '@/components/partner/BenefitsSection';
import { HowItWorksSection } from '@/components/partner/HowItWorksSection';
import { FormSection } from '@/components/partner/FormSection';
import { FooterSection } from '@/components/partner/FooterSection';
import { useIntersectionObserver } from '@/components/partner/useIntersectionObserver';
import type { PartnerFormData, Benefit, Step } from '@/components/partner/types';

interface PartnerPageClientProps {
  initialData: {
    benefits: Benefit[];
    steps: Step[];
  };
}

export function PartnerPageClient({ initialData }: PartnerPageClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    property_count: '',
    property_type: '',
    location: '',
    message: ''
  });

  const { visibleSections, refs } = useIntersectionObserver({
    sectionIds: ['section1', 'section2', 'section3', 'section4', 'section5']
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSelectChange = useCallback((name: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          property_count: parseInt(formData.property_count) || 1
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setSubmitted(true);
      toast({
        title: 'Success!',
        description: 'Your partnership inquiry has been submitted. We will contact you soon.',
      });

      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        property_count: '',
        property_type: '',
        location: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit your inquiry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, toast]);

  const handleResetSubmission = useCallback(() => {
    setSubmitted(false);
  }, []);

  const benefits = useMemo(() => initialData.benefits, [initialData.benefits]);
  const steps = useMemo(() => initialData.steps, [initialData.steps]);

  return (
    <>
      <Toaster />
      <HeroSection 
        ref={refs.section1Ref}
        id="section1"
        visible={visibleSections.section1}
      />
      
      <BenefitsSection 
        ref={refs.section2Ref}
        id="section2"
        visible={visibleSections.section2}
        benefits={benefits}
      />
      
      <HowItWorksSection 
        ref={refs.section3Ref}
        id="section3"
        visible={visibleSections.section3}
        steps={steps}
      />
      
      <FormSection 
        ref={refs.section4Ref}
        id="section4"
        visible={visibleSections.section4}
        formData={formData}
        isSubmitting={isSubmitting}
        submitted={submitted}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmit}
        onReset={handleResetSubmission}
      />
      
      <FooterSection 
        ref={refs.section5Ref}
        id="section5"
        visible={visibleSections.section5}
      />
    </>
  );
}