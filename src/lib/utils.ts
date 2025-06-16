import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * This is the primary utility for conditional styling in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates variant-based class combinations for component styling
 * Useful for creating component variants with consistent patterns
 */
export function createVariants<T extends Record<string, Record<string, string>>>(variants: T) {
  return (variant: keyof T, size?: string) => {
    const variantClasses = variants[variant];
    if (!variantClasses) return '';

    if (size && variantClasses[size]) {
      return variantClasses[size];
    }

    return variantClasses.default || '';
  };
}

/**
 * Conditional class utility for boolean-based styling
 * Simplifies conditional class application
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass: string = '',
): string {
  return condition ? trueClass : falseClass;
}

/**
 * Focus ring utility for consistent focus styling
 * Ensures accessibility compliance across components
 */
export function focusRing(variant: 'default' | 'destructive' | 'none' = 'default'): string {
  const variants = {
    default:
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    destructive:
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
    none: 'focus-visible:outline-none',
  };

  return variants[variant];
}

/**
 * Animation utility for consistent transitions
 * Provides standard animation classes for components
 */
export function transition(type: 'default' | 'fast' | 'slow' | 'premium' = 'default'): string {
  const transitions = {
    default: 'transition-all duration-200 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    premium: 'transition-all duration-200 cubic-bezier(0.32, 0.72, 0, 1)',
  };

  return transitions[type];
}

/**
 * Shadow utility for consistent elevation
 * Provides premium shadow effects for components
 */
export function shadow(level: 'sm' | 'md' | 'lg' | 'premium' = 'md'): string {
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    premium: 'shadow-premium',
  };

  return shadows[level];
}

/**
 * Responsive utility for mobile-first design
 * Helps create responsive class combinations
 */
export function responsive(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const { base = '', sm, md, lg, xl, '2xl': xl2 } = classes;

  return cn(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`,
    xl2 && `2xl:${xl2}`,
  );
}

/**
 * Accessibility utility for screen reader content
 * Ensures proper accessibility implementation
 */
export function srOnly(text: string): { 'aria-label': string; className: string } {
  return {
    'aria-label': text,
    className: 'sr-only',
  };
}

/**
 * Color utility for consistent color application
 * Helps maintain design system color consistency
 */
export function colorVariant(
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info',
  shade: 'light' | 'default' | 'dark' = 'default',
): string {
  const colorMap = {
    primary: {
      light: 'text-primary/80 bg-primary/10',
      default: 'text-primary-foreground bg-primary',
      dark: 'text-primary-foreground bg-primary/90',
    },
    secondary: {
      light: 'text-secondary/80 bg-secondary/10',
      default: 'text-secondary-foreground bg-secondary',
      dark: 'text-secondary-foreground bg-secondary/90',
    },
    accent: {
      light: 'text-accent/80 bg-accent/10',
      default: 'text-accent-foreground bg-accent',
      dark: 'text-accent-foreground bg-accent/90',
    },
    success: {
      light: 'text-green-700 bg-green-50',
      default: 'text-green-800 bg-green-100',
      dark: 'text-green-900 bg-green-200',
    },
    warning: {
      light: 'text-yellow-700 bg-yellow-50',
      default: 'text-yellow-800 bg-yellow-100',
      dark: 'text-yellow-900 bg-yellow-200',
    },
    error: {
      light: 'text-red-700 bg-red-50',
      default: 'text-red-800 bg-red-100',
      dark: 'text-red-900 bg-red-200',
    },
    info: {
      light: 'text-blue-700 bg-blue-50',
      default: 'text-blue-800 bg-blue-100',
      dark: 'text-blue-900 bg-blue-200',
    },
  };

  return colorMap[color][shade];
}
