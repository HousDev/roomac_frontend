import { Benefit, Step } from './types';

export async function getInitialData(): Promise<{ benefits: Benefit[]; steps: Step[] }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    benefits: [
      {
        icon: 'TrendingUp',
        title: 'Increase Revenue',
        description: 'Maximize your property occupancy and revenue with our advanced booking and marketing reach.'
      },
      {
        icon: 'Users',
        title: 'Quality Tenants',
        description: 'Access a pool of verified, quality tenants actively searching for accommodation.'
      },
      {
        icon: 'Shield',
        title: 'Secure Payments',
        description: 'Safe and secure payment processing with transparent reporting and timely payouts.'
      },
      {
        icon: 'Building2',
        title: 'Property Management',
        description: 'Comprehensive tools to manage your properties, bookings, and maintenance efficiently.'
      }
    ],
    steps: [
      { number: '01', title: 'Submit Inquiry', description: 'Fill out the partnership form with your property details' },
      { number: '02', title: 'Review & Approval', description: 'Our team reviews your application within 2-3 business days' },
      { number: '03', title: 'Onboarding', description: 'Complete setup with dedicated support from our team' },
      { number: '04', title: 'Start Earning', description: 'List your properties and start receiving bookings immediately' }
    ]
  };
}