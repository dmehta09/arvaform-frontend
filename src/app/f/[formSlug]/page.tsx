import { FormSkeleton } from '@/components/form-renderer/form-skeleton';
import { PublicFormRenderer } from '@/components/form-renderer/public-form-renderer';
import { getPublicForm } from '@/lib/api/public-forms';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ formSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate metadata for SEO optimization - React 19 async metadata pattern
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { formSlug } = await params;
    console.log('[PublicForm] Generating metadata for form:', formSlug);

    const form = await getPublicForm(formSlug);

    if (!form) {
      return {
        title: 'Form Not Found',
        description: 'The requested form could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    // SEO-optimized metadata with Open Graph and Twitter Cards
    return {
      title: form.title || 'Form',
      description: form.description || `Fill out this form: ${form.title}`,
      keywords: form.tags?.join(', ') || 'form, survey, feedback',
      authors: [{ name: form.ownerName || 'ArvaForm User' }],
      openGraph: {
        title: form.title || 'Form',
        description: form.description || `Fill out this form: ${form.title}`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/f/${formSlug}`,
        siteName: 'ArvaForm',
        images: [
          {
            url: form.previewImage || '/api/og?title=' + encodeURIComponent(form.title || 'Form'),
            width: 1200,
            height: 630,
            alt: form.title || 'Form Preview',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: form.title || 'Form',
        description: form.description || `Fill out this form: ${form.title}`,
        images: [form.previewImage || '/api/og?title=' + encodeURIComponent(form.title || 'Form')],
      },
      robots: {
        index: form.isPublic && !form.isArchived,
        follow: form.isPublic && !form.isArchived,
      },
    };
  } catch (error) {
    console.error('[PublicForm] Error generating metadata:', error);
    return {
      title: 'Form Error',
      description: 'There was an error loading this form.',
      robots: 'noindex, nofollow',
    };
  }
}

// Force dynamic rendering for real-time form access and submission counts
export const dynamic = 'force-dynamic';

export default async function PublicFormPage({ params, searchParams }: Props) {
  try {
    const { formSlug } = await params;
    const resolvedSearchParams = await searchParams;

    console.log('[PublicForm] Rendering public form:', formSlug);
    console.log('[PublicForm] Search params:', resolvedSearchParams);

    // Pre-fetch form data on server for optimal SSR performance
    const form = await getPublicForm(formSlug);

    if (!form) {
      console.warn('[PublicForm] Form not found:', formSlug);
      notFound();
    }

    // Check if form is accessible
    if (!form.isPublic || form.isArchived) {
      console.warn('[PublicForm] Form access denied:', {
        isPublic: form.isPublic,
        isArchived: form.isArchived,
      });
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: form.title,
              description: form.description,
              url: `${process.env.NEXT_PUBLIC_APP_URL}/f/${formSlug}`,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              author: {
                '@type': 'Person',
                name: form.ownerName || 'ArvaForm User',
              },
            }),
          }}
        />

        {/* React Suspense for progressive loading */}
        <Suspense fallback={<FormSkeleton />}>
          <PublicFormRenderer
            formSlug={formSlug}
            initialFormData={form}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('[PublicForm] Error rendering form page:', error);
    // Graceful error handling - let error boundary catch this
    throw error;
  }
}
