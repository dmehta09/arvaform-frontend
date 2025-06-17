/**
 * Mock Data for ArvaForm Dashboard
 * Provides realistic sample data for UI development and testing
 */

import type { FormFilters, FormListItem } from '@/types/form.types';

/**
 * Mock user analytics data interface
 */
export interface UserAnalytics {
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  averageConversionRate: number;
  formsCreatedThisMonth: number;
  submissionsThisMonth: number;
  viewsThisMonth: number;
  topPerformingForms: Array<{
    formId: string;
    title: string;
    submissions: number;
    conversionRate: number;
  }>;
}

/**
 * Extended FormListItem with additional properties for UI
 */
export interface FormListItemExtended extends FormListItem {
  tags?: string[];
  category?: string;
}

/**
 * Mock user analytics data
 */
export const mockUserAnalytics: UserAnalytics = {
  totalForms: 12,
  totalSubmissions: 1247,
  totalViews: 8934,
  averageConversionRate: 14.2,
  formsCreatedThisMonth: 3,
  submissionsThisMonth: 89,
  viewsThisMonth: 523,
  topPerformingForms: [
    {
      formId: 'contact-form-2024',
      title: 'Contact Us Form',
      submissions: 234,
      conversionRate: 18.5,
    },
    {
      formId: 'newsletter-signup',
      title: 'Newsletter Signup',
      submissions: 189,
      conversionRate: 22.1,
    },
    {
      formId: 'product-feedback',
      title: 'Product Feedback Survey',
      submissions: 156,
      conversionRate: 15.8,
    },
  ],
};

/**
 * Mock forms data with various statuses and realistic metrics
 */
export const mockForms: FormListItemExtended[] = [
  {
    id: 'contact-form-2024',
    title: 'Contact Us Form',
    description: 'Main contact form for customer inquiries and support requests',
    status: 'published',
    isPublished: true,
    submissions: 234,
    views: 1456,
    conversionRate: 16.1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:22:00Z',
    tags: ['contact', 'support', 'customer-service'],
    category: 'business',
  },
  {
    id: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Simple newsletter subscription form with email validation',
    status: 'published',
    isPublished: true,
    submissions: 189,
    views: 892,
    conversionRate: 21.2,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-17T11:45:00Z',
    tags: ['newsletter', 'email', 'marketing'],
    category: 'marketing',
  },
  {
    id: 'employee-feedback-2024',
    title: 'Employee Feedback Survey',
    description: 'Annual employee satisfaction and feedback collection form',
    status: 'draft',
    isPublished: false,
    submissions: 0,
    views: 23,
    conversionRate: 0,
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-20T16:30:00Z',
    tags: ['hr', 'feedback', 'survey', 'internal'],
    category: 'hr',
  },
  {
    id: 'product-feedback',
    title: 'Product Feedback Survey',
    description: 'Collect user feedback on new product features and improvements',
    status: 'published',
    isPublished: true,
    submissions: 156,
    views: 987,
    conversionRate: 15.8,
    createdAt: '2024-01-08T13:20:00Z',
    updatedAt: '2024-01-19T10:15:00Z',
    tags: ['product', 'feedback', 'ux', 'customer'],
    category: 'product',
  },
  {
    id: 'event-registration-spring',
    title: 'Spring Conference Registration',
    description: 'Registration form for our annual spring conference with multiple ticket types',
    status: 'published',
    isPublished: true,
    submissions: 127,
    views: 2341,
    conversionRate: 5.4,
    createdAt: '2024-01-05T08:45:00Z',
    updatedAt: '2024-01-16T15:30:00Z',
    tags: ['event', 'registration', 'conference', 'tickets'],
    category: 'events',
  },
  {
    id: 'customer-onboarding',
    title: 'Customer Onboarding Form',
    description: 'Comprehensive onboarding form for new customers with multi-step process',
    status: 'published',
    isPublished: true,
    submissions: 89,
    views: 445,
    conversionRate: 20.0,
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-18T09:20:00Z',
    tags: ['onboarding', 'customer', 'multi-step'],
    category: 'business',
  },
  {
    id: 'bug-report-template',
    title: 'Bug Report Template',
    description: 'Standardized bug reporting form for development team',
    status: 'archived',
    isPublished: false,
    submissions: 45,
    views: 234,
    conversionRate: 19.2,
    createdAt: '2023-12-20T14:15:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    tags: ['bug', 'development', 'technical', 'support'],
    category: 'technical',
  },
  {
    id: 'lead-qualification',
    title: 'Sales Lead Qualification',
    description: 'Qualify potential leads with budget, timeline, and requirements questions',
    status: 'published',
    isPublished: true,
    submissions: 78,
    views: 456,
    conversionRate: 17.1,
    createdAt: '2024-01-14T10:30:00Z',
    updatedAt: '2024-01-19T14:45:00Z',
    tags: ['sales', 'lead', 'qualification', 'crm'],
    category: 'sales',
  },
  {
    id: 'volunteer-application',
    title: 'Volunteer Application Form',
    description: 'Application form for community volunteers with background check requirements',
    status: 'draft',
    isPublished: false,
    submissions: 12,
    views: 89,
    conversionRate: 13.5,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
    tags: ['volunteer', 'application', 'community', 'background-check'],
    category: 'community',
  },
  {
    id: 'course-evaluation',
    title: 'Course Evaluation Survey',
    description: 'End-of-course evaluation for training programs and workshops',
    status: 'published',
    isPublished: true,
    submissions: 203,
    views: 834,
    conversionRate: 24.3,
    createdAt: '2024-01-06T15:45:00Z',
    updatedAt: '2024-01-17T13:10:00Z',
    tags: ['education', 'evaluation', 'training', 'survey'],
    category: 'education',
  },
  {
    id: 'vendor-application',
    title: 'Vendor Partnership Application',
    description: 'Application form for potential business partners and vendors',
    status: 'published',
    isPublished: true,
    submissions: 34,
    views: 267,
    conversionRate: 12.7,
    createdAt: '2024-01-11T12:30:00Z',
    updatedAt: '2024-01-16T11:15:00Z',
    tags: ['vendor', 'partnership', 'business', 'application'],
    category: 'business',
  },
  {
    id: 'website-feedback',
    title: 'Website User Experience Feedback',
    description: 'Collect feedback on website usability and user experience improvements',
    status: 'draft',
    isPublished: false,
    submissions: 5,
    views: 67,
    conversionRate: 7.5,
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    tags: ['website', 'ux', 'feedback', 'usability'],
    category: 'product',
  },
];

/**
 * Mock paginated forms response
 */
export const mockFormsResponse = {
  forms: mockForms,
  total: mockForms.length,
  page: 1,
  limit: 20,
};

/**
 * Helper function to filter mock forms based on search and filters
 */
export function filterMockForms(
  searchQuery?: string,
  filters?: Partial<FormFilters & { category?: string }>,
) {
  let filtered = [...mockForms];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        form.description?.toLowerCase().includes(query) ||
        form.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  if (filters?.status) {
    filtered = filtered.filter((form) => form.status === filters.status);
  }

  if (filters?.category) {
    filtered = filtered.filter((form) => form.category === filters.category);
  }

  return {
    forms: filtered,
    total: filtered.length,
    page: 1,
    limit: 20,
  };
}

/**
 * Mock form categories for filters
 */
export const mockFormCategories = [
  { id: 'business', name: 'Business', count: 3 },
  { id: 'marketing', name: 'Marketing', count: 1 },
  { id: 'hr', name: 'Human Resources', count: 1 },
  { id: 'product', name: 'Product', count: 2 },
  { id: 'events', name: 'Events', count: 1 },
  { id: 'technical', name: 'Technical', count: 1 },
  { id: 'sales', name: 'Sales', count: 1 },
  { id: 'community', name: 'Community', count: 1 },
  { id: 'education', name: 'Education', count: 1 },
];

/**
 * Mock recent activity data
 */
export const mockRecentActivity = [
  {
    id: '1',
    type: 'form_created',
    message: 'Created new form "Website User Experience Feedback"',
    timestamp: '2024-01-20T14:00:00Z',
    formId: 'website-feedback',
  },
  {
    id: '2',
    type: 'submission_received',
    message: 'New submission received for "Contact Us Form"',
    timestamp: '2024-01-20T13:45:00Z',
    formId: 'contact-form-2024',
  },
  {
    id: '3',
    type: 'form_published',
    message: 'Published form "Vendor Partnership Application"',
    timestamp: '2024-01-20T11:30:00Z',
    formId: 'vendor-application',
  },
  {
    id: '4',
    type: 'form_updated',
    message: 'Updated form settings for "Newsletter Signup"',
    timestamp: '2024-01-19T16:20:00Z',
    formId: 'newsletter-signup',
  },
];
