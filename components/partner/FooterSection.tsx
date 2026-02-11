import { forwardRef } from 'react';

interface FooterSectionProps {
  id: string;
  visible: boolean;
}

export const FooterSection = forwardRef<HTMLElement, FooterSectionProps>(
  ({ id, visible }, ref) => (
    <section 
      ref={ref}
      id={id}
      className={`py-10  bg-blue-900 text-white transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 '}`}
    >
      <div className="container mx-auto px-4 text-center ">
        <h2 className="text-3xl font-bold mb-4">
          Have Questions?
        </h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
          Our partnership team is here to help. Contact us directly at{' '}
          <a href="mailto:partners@roomac.com" className="text-white underline hover:no-underline">
            partners@roomac.com
          </a>
          {' '}or call us at{' '}
          <a href="tel:+1-555-0000" className="text-white underline hover:no-underline">
            +1 (555) 000-0000
          </a>
        </p>
      </div>
    </section>
  )
);

FooterSection.displayName = 'FooterSection';