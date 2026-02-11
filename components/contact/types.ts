export interface ContactMethod {
  icon: any;
  title: string;
  subtitle: string;
  value: string;
  link: string;
  color: string;
}

export interface OfficeLocation {
  city: string;
  address: string;
  phone: string;
  email: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContactPageData {
  contactMethods: ContactMethod[];
  officeLocations: OfficeLocation[];
  faqs: FAQ[];
}

// components/contact/types.ts
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  propertyInterest: string;
  message: string;
  preferredMoveInDate?: string;
  budgetRange?: string;
}