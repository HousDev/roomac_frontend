export const CATEGORY_COLORS: Record<string, string> = {
  lifestyle: 'bg-purple-100 text-purple-800',
  meal: 'bg-orange-100 text-orange-800',
  utility: 'bg-blue-100 text-blue-800',
  security: 'bg-green-100 text-green-800',
  mobility: 'bg-red-100 text-red-800',
  productivity: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
};

export const CATEGORY_LABELS: Record<string, string> = {
  lifestyle: 'Lifestyle',
  meal: 'Meal',
  utility: 'Utility',
  security: 'Security',
  mobility: 'Mobility',
  productivity: 'Productivity',
  other: 'Other',
};

export const BILLING_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' },
];

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'popular', label: 'Popular' },
  { value: 'featured', label: 'Featured' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one_time', label: 'One Time' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];