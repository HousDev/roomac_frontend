// lib/occupation-data.ts
export interface OccupationOption {
  value: string;
  label: string;
  icon: string;
  subCategories?: OccupationSubCategory[];
}

export interface OccupationSubCategory {
  value: string;
  label: string;
  category: string;
}

// Main occupation categories with icons
export const occupationCategories: OccupationOption[] = [
  { value: "Student", label: "Student", icon: "🎓" },
  { value: "Working Professional", label: "Working Professional", icon: "💼" },
  { value: "Business Owner", label: "Business Owner", icon: "🏢" },
  { value: "Freelancer / Self-Employed", label: "Freelancer / Self-Employed", icon: "💻" },
  { value: "Startup Founder", label: "Startup Founder", icon: "🚀" },
  { value: "Remote Worker / Work From Home", label: "Remote Worker / Work From Home", icon: "🧑‍💻" },
  { value: "Intern / Trainee", label: "Intern / Trainee", icon: "🎓" },
  { value: "Consultant", label: "Consultant", icon: "📊" },
  { value: "Government Employee", label: "Government Employee", icon: "🏛" },
  { value: "Other", label: "Other", icon: "🔹" },
];

// Sub-categories mapped to main categories
export const occupationSubCategories: Record<string, OccupationSubCategory[]> = {
  "Student": [
    { value: "College Student", label: "College Student", category: "Student" },
    { value: "Engineering Student", label: "Engineering Student", category: "Student" },
    { value: "Medical Student", label: "Medical Student", category: "Student" },
    { value: "MBA Student", label: "MBA Student", category: "Student" },
    { value: "Coaching / Competitive Exam Student", label: "Coaching / Competitive Exam Student", category: "Student" },
    { value: "International Student", label: "International Student", category: "Student" },
  ],
  "Working Professional": [
    { value: "Software Engineer", label: "Software Engineer", category: "Working Professional" },
    { value: "IT Professional", label: "IT Professional", category: "Working Professional" },
    { value: "BPO / Call Center", label: "BPO / Call Center", category: "Working Professional" },
    { value: "Corporate Employee", label: "Corporate Employee", category: "Working Professional" },
    { value: "Sales Executive", label: "Sales Executive", category: "Working Professional" },
    { value: "Marketing Professional", label: "Marketing Professional", category: "Working Professional" },
    { value: "HR Professional", label: "HR Professional", category: "Working Professional" },
    { value: "Finance / Accountant", label: "Finance / Accountant", category: "Working Professional" },
    { value: "Banking Professional", label: "Banking Professional", category: "Working Professional" },
    { value: "Healthcare Professional", label: "Healthcare Professional", category: "Working Professional" },
    { value: "Teacher / Professor", label: "Teacher / Professor", category: "Working Professional" },
    { value: "Architect / Designer", label: "Architect / Designer", category: "Working Professional" },
    { value: "Hospitality Professional", label: "Hospitality Professional", category: "Working Professional" },
    { value: "Aviation Professional", label: "Aviation Professional", category: "Working Professional" },
  ],
  "Business Owner": [
    { value: "Trader", label: "Trader", category: "Business Owner" },
    { value: "Shop Owner", label: "Shop Owner", category: "Business Owner" },
    { value: "SME Owner", label: "SME Owner", category: "Business Owner" },
    { value: "Manufacturing Business", label: "Manufacturing Business", category: "Business Owner" },
    { value: "Real Estate Professional", label: "Real Estate Professional", category: "Business Owner" },
    { value: "Startup Founder", label: "Startup Founder", category: "Business Owner" },
  ],
  "Freelancer / Self-Employed": [
    { value: "Graphic Designer", label: "Graphic Designer", category: "Freelancer / Self-Employed" },
    { value: "Digital Marketer", label: "Digital Marketer", category: "Freelancer / Self-Employed" },
    { value: "Content Creator", label: "Content Creator", category: "Freelancer / Self-Employed" },
    { value: "Photographer / Videographer", label: "Photographer / Videographer", category: "Freelancer / Self-Employed" },
    { value: "Consultant", label: "Consultant", category: "Freelancer / Self-Employed" },
    { value: "Independent Developer", label: "Independent Developer", category: "Freelancer / Self-Employed" },
    { value: "Online Seller", label: "Online Seller", category: "Freelancer / Self-Employed" },
  ],
  "Remote Worker / Work From Home": [
    { value: "Remote Software Engineer", label: "Remote Software Engineer", category: "Remote Worker / Work From Home" },
    { value: "Remote Customer Support", label: "Remote Customer Support", category: "Remote Worker / Work From Home" },
    { value: "Remote Consultant", label: "Remote Consultant", category: "Remote Worker / Work From Home" },
    { value: "Remote Digital Marketer", label: "Remote Digital Marketer", category: "Remote Worker / Work From Home" },
  ],
  "Intern / Trainee": [
    { value: "Corporate Intern", label: "Corporate Intern", category: "Intern / Trainee" },
    { value: "Startup Intern", label: "Startup Intern", category: "Intern / Trainee" },
    { value: "Trainee Engineer", label: "Trainee Engineer", category: "Intern / Trainee" },
    { value: "Management Trainee", label: "Management Trainee", category: "Intern / Trainee" },
  ],
  "Consultant": [
    { value: "Business Consultant", label: "Business Consultant", category: "Consultant" },
    { value: "IT Consultant", label: "IT Consultant", category: "Consultant" },
    { value: "Strategy Consultant", label: "Strategy Consultant", category: "Consultant" },
    { value: "Freelance Consultant", label: "Freelance Consultant", category: "Consultant" },
  ],
  "Government Employee": [
    { value: "Central Government", label: "Central Government", category: "Government Employee" },
    { value: "State Government", label: "State Government", category: "Government Employee" },
    { value: "PSU Employee", label: "PSU Employee", category: "Government Employee" },
    { value: "Defence Personnel", label: "Defence Personnel", category: "Government Employee" },
  ],
  "Other": [
    { value: "Homemaker", label: "Homemaker", category: "Other" },
    { value: "Job Seeker", label: "Job Seeker", category: "Other" },
    { value: "Retired", label: "Retired", category: "Other" },
    { value: "Others", label: "Others", category: "Other" },
  ],
};

// Helper function to get sub-categories for a category
export const getSubCategoriesForCategory = (category: string): OccupationSubCategory[] => {
  return occupationSubCategories[category] || [];
};

// Helper function to get all sub-categories as flat array
export const getAllSubCategories = (): OccupationSubCategory[] => {
  return Object.values(occupationSubCategories).flat();
};

// Helper to check if a value is a valid sub-category
export const isValidSubCategory = (value: string): boolean => {
  return getAllSubCategories().some(sub => sub.value === value);
};

// Get category for a sub-category
export const getCategoryForSubCategory = (subCategoryValue: string): string | undefined => {
  const sub = getAllSubCategories().find(s => s.value === subCategoryValue);
  return sub?.category;
};

// Get placeholder text based on category
export const getOccupationPlaceholder = (category: string, subCategory?: string): string => {
  if (subCategory) {
    switch(category) {
      case "Student": return `e.g., ${subCategory} at University Name`;
      case "Working Professional": return `e.g., ${subCategory} at Company Name`;
      case "Business Owner": return `e.g., ${subCategory} - Business Name`;
      case "Freelancer / Self-Employed": return `e.g., ${subCategory} - Portfolio/Gallery Link`;
      default: return `e.g., ${subCategory} details`;
    }
  }
  
  switch(category) {
    case "Student": return "e.g., B.Tech Computer Science at ABC University";
    case "Working Professional": return "e.g., Software Engineer at XYZ Corporation";
    case "Business Owner": return "e.g., Retail Business - Fashion Store";
    case "Freelancer / Self-Employed": return "e.g., Graphic Designer - Portfolio available";
    case "Startup Founder": return "e.g., Founder of Tech Startup";
    case "Remote Worker / Work From Home": return "e.g., Remote Software Engineer";
    case "Intern / Trainee": return "e.g., Management Trainee at Company";
    case "Consultant": return "e.g., Business Consultant - Independent";
    case "Government Employee": return "e.g., Central Government - Ministry";
    default: return "Enter occupation details";
  }
};