import { cn } from '@/lib/utils';

interface FormSkeletonProps {
  className?: string;
  showHeader?: boolean;
  elementCount?: number;
}

/**
 * Accessible loading skeleton for public forms with modern animations
 * Follows WCAG 2.1 AA guidelines with proper ARIA attributes
 */
export function FormSkeleton({
  className,
  showHeader = true,
  elementCount = 5,
}: FormSkeletonProps) {
  return (
    <div
      className={cn(
        'max-w-2xl mx-auto p-6 space-y-6 animate-pulse',
        'bg-background min-h-screen',
        className,
      )}
      role="status"
      aria-label="Loading form..."
      aria-live="polite">
      {/* Skip to content link for accessibility */}
      <a
        href="#form-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Skip to form content
      </a>

      {/* Header skeleton */}
      {showHeader && (
        <div className="space-y-4 pb-6 border-b">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div
              className="h-8 bg-muted rounded-lg w-3/4 animate-shimmer"
              style={{
                background:
                  'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }}
            />
            {/* Subtitle skeleton */}
            <div className="h-4 bg-muted rounded w-1/2 animate-shimmer" />
          </div>

          {/* Form meta info skeleton */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          </div>
        </div>
      )}

      {/* Form content skeleton */}
      <div id="form-content" className="space-y-6">
        {Array.from({ length: elementCount }, (_, index) => (
          <FormElementSkeleton
            key={index}
            variant={getSkeletonVariant(index)}
            delay={index * 100}
          />
        ))}

        {/* Submit button skeleton */}
        <div className="pt-6">
          <div
            className="h-12 bg-primary/20 rounded-lg w-32 animate-shimmer"
            style={{ animationDelay: `${elementCount * 100}ms` }}
          />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading form...</span>
        </div>
      </div>

      {/* Shimmer animation handled by Tailwind CSS */}
    </div>
  );
}

/**
 * Individual form element skeleton with variants
 */
interface FormElementSkeletonProps {
  variant: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  delay?: number;
}

function FormElementSkeleton({ variant, delay = 0 }: FormElementSkeletonProps) {
  const baseClasses = 'space-y-2';
  const animationStyle = { animationDelay: `${delay}ms` };

  return (
    <div className={baseClasses} style={animationStyle}>
      {/* Label skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 bg-muted rounded w-24 animate-shimmer" />
        {/* Required indicator skeleton */}
        <div className="h-3 w-3 bg-destructive/30 rounded-full" />
      </div>

      {/* Input skeleton based on variant */}
      {variant === 'text' && <div className="h-10 bg-muted border rounded-md animate-shimmer" />}

      {variant === 'textarea' && (
        <div className="h-24 bg-muted border rounded-md animate-shimmer" />
      )}

      {variant === 'select' && (
        <div className="h-10 bg-muted border rounded-md relative animate-shimmer">
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-muted-foreground/20 rounded" />
        </div>
      )}

      {variant === 'checkbox' && (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-muted border rounded animate-shimmer" />
              <div className="h-4 bg-muted rounded w-20 animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {variant === 'radio' && (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-muted border rounded-full animate-shimmer" />
              <div className="h-4 bg-muted rounded w-24 animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {variant === 'file' && (
        <div className="border-2 border-dashed border-muted rounded-lg p-6">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 bg-muted rounded mx-auto animate-shimmer" />
            <div className="h-4 bg-muted rounded w-32 mx-auto animate-shimmer" />
            <div className="h-3 bg-muted rounded w-24 mx-auto animate-shimmer" />
          </div>
        </div>
      )}

      {/* Helper text skeleton */}
      <div className="h-3 bg-muted/50 rounded w-40 animate-shimmer" />
    </div>
  );
}

/**
 * Determines skeleton variant based on index for realistic variety
 */
function getSkeletonVariant(index: number): FormElementSkeletonProps['variant'] {
  const variants: FormElementSkeletonProps['variant'][] = [
    'text',
    'text',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'file',
  ];
  return variants[index % variants.length] || 'text';
}

/**
 * Compact skeleton for mobile or constrained spaces
 */
export function FormSkeletonCompact({ className }: { className?: string }) {
  return (
    <div
      className={cn('max-w-md mx-auto p-4 space-y-4 animate-pulse', className)}
      role="status"
      aria-label="Loading form...">
      {/* Compact header */}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-3/4 animate-shimmer" />
        <div className="h-3 bg-muted rounded w-1/2 animate-shimmer" />
      </div>

      {/* Compact elements */}
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-1">
          <div className="h-4 bg-muted rounded w-20 animate-shimmer" />
          <div className="h-8 bg-muted rounded animate-shimmer" />
        </div>
      ))}

      {/* Compact submit */}
      <div className="h-10 bg-primary/20 rounded w-24 animate-shimmer" />
    </div>
  );
}

/**
 * Error boundary fallback skeleton
 */
export function FormSkeletonError({ error, retry }: { error?: string; retry?: () => void }) {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
      <div className="space-y-2">
        <div className="h-12 w-12 bg-destructive/20 rounded-full mx-auto flex items-center justify-center">
          <span className="text-destructive text-xl">⚠</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Unable to Load Form</h2>
        <p className="text-muted-foreground">
          {error || 'There was a problem loading this form. Please try again.'}
        </p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}
