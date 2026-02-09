export interface PartnerFormData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  property_count: string;
  property_type: string;
  location: string;
  message: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface ColorSet {
  bg: string;
  bgHover: string;
  icon: string;
  ring: string;
  shadow: string;
  shadowHover: string;
  titleHover: string;
  underline: string;
}