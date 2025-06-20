import type { Form, FormElement } from '@/types/form.types';

// Extended public form interface with additional metadata
export interface PublicForm extends Omit<Form, 'createdAt' | 'updatedAt'> {
  formSlug: string;
  isPublic: boolean;
  isArchived: boolean;
  allowedDomains?: string[];
  maxSubmissions?: number;
  currentSubmissions: number;
  submissionDeadline?: string;
  requiresAuth?: boolean;
  ownerName?: string;
  previewImage?: string;
  tags?: string[];
  estimatedDuration?: number; // in minutes
  elements: FormElement[];
}

// Response wrapper for API calls
interface PublicFormResponse {
  success: boolean;
  data?: PublicForm;
  error?: string;
  message?: string;
}

// Rate limiting info returned by API
interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

/**
 * Fetches a public form by its slug with comprehensive error handling
 * @param formSlug - The unique slug identifier for the form
 * @returns Promise<PublicForm | null> - The form data or null if not found
 */
export async function getPublicForm(formSlug: string): Promise<PublicForm | null> {
  try {
    console.log('[PublicFormsAPI] Fetching form:', formSlug);

    if (!formSlug || typeof formSlug !== 'string') {
      console.warn('[PublicFormsAPI] Invalid form slug provided:', formSlug);
      return null;
    }

    // Validate slug format (basic sanitization)
    const sanitizedSlug = formSlug.trim().toLowerCase();
    if (!/^[a-z0-9-_]+$/.test(sanitizedSlug)) {
      console.warn('[PublicFormsAPI] Invalid slug format:', sanitizedSlug);
      return null;
    }

    const response = await fetch(`/api/public/forms/${sanitizedSlug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add request tracking for analytics
        'X-Form-View': 'true',
        'X-Request-Source': 'public-renderer',
      },
      // Cache for 5 minutes on successful response, but revalidate
      next: {
        revalidate: 300,
        tags: [`public-form-${sanitizedSlug}`],
      },
    });

    console.log('[PublicFormsAPI] Response status:', response.status);

    // Handle rate limiting
    if (response.status === 429) {
      const rateLimitInfo = extractRateLimitInfo(response.headers);
      console.warn('[PublicFormsAPI] Rate limit exceeded:', rateLimitInfo);
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(rateLimitInfo.resetTime / 1000)} seconds.`,
      );
    }

    // Handle not found
    if (response.status === 404) {
      console.warn('[PublicFormsAPI] Form not found:', sanitizedSlug);
      return null;
    }

    // Handle access denied
    if (response.status === 403) {
      console.warn('[PublicFormsAPI] Access denied for form:', sanitizedSlug);
      return null;
    }

    // Handle server errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PublicFormsAPI] Server error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to fetch form: ${response.status} ${response.statusText}`);
    }

    const result: PublicFormResponse = await response.json();

    if (!result.success || !result.data) {
      console.warn('[PublicFormsAPI] API returned unsuccessful response:', result);
      return null;
    }

    // Validate form data structure
    if (!isValidPublicForm(result.data)) {
      console.error('[PublicFormsAPI] Invalid form data structure received:', result.data);
      throw new Error('Invalid form data received from server');
    }

    console.log('[PublicFormsAPI] Successfully fetched form:', {
      id: result.data.id,
      title: result.data.title,
      isPublic: result.data.isPublic,
      elementsCount: result.data.elements?.length || 0,
    });

    return result.data;
  } catch (error) {
    console.error('[PublicFormsAPI] Error fetching public form:', error);

    // Re-throw known errors
    if (error instanceof Error) {
      throw error;
    }

    // Wrap unknown errors
    throw new Error('An unexpected error occurred while fetching the form');
  }
}

/**
 * Checks if form is accessible from current domain
 * @param form - The form to check
 * @param currentDomain - Current domain (optional, will detect if not provided)
 * @returns boolean - Whether the form is accessible
 */
export function isFormAccessibleFromDomain(form: PublicForm, currentDomain?: string): boolean {
  try {
    // If no domain restrictions, form is accessible
    if (!form.allowedDomains || form.allowedDomains.length === 0) {
      return true;
    }

    // Get current domain if not provided
    const domain =
      currentDomain || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

    // Check if current domain is in allowed list
    return form.allowedDomains.some(
      (allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`),
    );
  } catch (error) {
    console.error('[PublicFormsAPI] Error checking domain access:', error);
    return false;
  }
}

/**
 * Checks if form has reached submission limit
 * @param form - The form to check
 * @returns boolean - Whether form can accept more submissions
 */
export function canFormAcceptSubmissions(form: PublicForm): boolean {
  try {
    // Check if form is archived
    if (form.isArchived) {
      return false;
    }

    // Check submission deadline
    if (form.submissionDeadline) {
      const deadline = new Date(form.submissionDeadline);
      if (deadline < new Date()) {
        return false;
      }
    }

    // Check submission limit
    if (form.maxSubmissions && form.currentSubmissions >= form.maxSubmissions) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('[PublicFormsAPI] Error checking submission capacity:', error);
    return false;
  }
}

/**
 * Extracts rate limiting information from response headers
 * @param headers - Response headers
 * @returns RateLimitInfo - Rate limiting details
 */
function extractRateLimitInfo(headers: Headers): RateLimitInfo {
  return {
    remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0', 10),
    resetTime: parseInt(headers.get('X-RateLimit-Reset') || '0', 10),
    limit: parseInt(headers.get('X-RateLimit-Limit') || '0', 10),
  };
}

/**
 * Validates the structure of a public form object
 * @param form - The form object to validate
 * @returns boolean - Whether the form has valid structure
 */
function isValidPublicForm(form: unknown): form is PublicForm {
  try {
    if (typeof form !== 'object' || form === null) {
      return false;
    }

    const obj = form as Record<string, unknown>;
    return (
      typeof obj.id === 'string' &&
      typeof obj.title === 'string' &&
      typeof obj.formSlug === 'string' &&
      typeof obj.isPublic === 'boolean' &&
      typeof obj.isArchived === 'boolean' &&
      Array.isArray(obj.elements) &&
      typeof obj.currentSubmissions === 'number'
    );
  } catch {
    return false;
  }
}

/**
 * Prefetches a public form for better performance
 * @param formSlug - The form slug to prefetch
 */
export function prefetchPublicForm(formSlug: string): void {
  try {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Use requestIdleCallback for better performance
      window.requestIdleCallback(() => {
        getPublicForm(formSlug).catch((error) => {
          console.warn('[PublicFormsAPI] Prefetch failed:', error);
        });
      });
    }
  } catch (error) {
    console.warn('[PublicFormsAPI] Prefetch error:', error);
  }
}
