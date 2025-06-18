/**
 * Predefined Themes Library - ArvaForm 2025
 * Collection of professional themes following 2025 design trends
 * Uses OKLCH color space for better perceptual uniformity
 */

import { Theme, ThemeCategory, ThemeTokens } from '@/types/theme.types';

/**
 * Generate color scale from a base OKLCH color
 * This follows 2025 best practices for perceptual uniformity
 */
function generateColorScale(baseLightness: number, baseChroma: number, baseHue: number) {
  return {
    50: `oklch(${Math.min(baseLightness + 0.35, 0.95)} ${baseChroma * 0.3} ${baseHue})`,
    100: `oklch(${Math.min(baseLightness + 0.3, 0.9)} ${baseChroma * 0.4} ${baseHue})`,
    200: `oklch(${Math.min(baseLightness + 0.25, 0.85)} ${baseChroma * 0.5} ${baseHue})`,
    300: `oklch(${Math.min(baseLightness + 0.2, 0.8)} ${baseChroma * 0.6} ${baseHue})`,
    400: `oklch(${Math.min(baseLightness + 0.1, 0.75)} ${baseChroma * 0.8} ${baseHue})`,
    500: `oklch(${baseLightness} ${baseChroma} ${baseHue})`, // Base color
    600: `oklch(${Math.max(baseLightness - 0.1, 0.2)} ${baseChroma} ${baseHue})`,
    700: `oklch(${Math.max(baseLightness - 0.15, 0.15)} ${baseChroma * 0.9} ${baseHue})`,
    800: `oklch(${Math.max(baseLightness - 0.2, 0.1)} ${baseChroma * 0.8} ${baseHue})`,
    900: `oklch(${Math.max(baseLightness - 0.25, 0.08)} ${baseChroma * 0.7} ${baseHue})`,
    950: `oklch(${Math.max(baseLightness - 0.3, 0.05)} ${baseChroma * 0.6} ${baseHue})`,
  };
}

/**
 * Minimal Theme - Clean and simple design
 * Perfect for modern applications requiring clarity and focus
 */
const minimalTheme: Theme = {
  metadata: {
    id: 'minimal-2025',
    name: 'Minimal',
    description: 'Clean and minimal theme focusing on clarity and readability',
    author: 'ArvaForm',
    version: '1.0.0',
    category: ThemeCategory.MINIMAL,
    tags: ['minimal', 'clean', 'modern', 'simple'],
    isDefault: true,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  tokens: {
    colors: {
      primary: generateColorScale(0.6, 0.15, 240), // Blue
      secondary: generateColorScale(0.7, 0.1, 240), // Light blue
      accent: generateColorScale(0.65, 0.2, 270), // Purple
      neutral: generateColorScale(0.5, 0.02, 240), // Gray
      success: generateColorScale(0.65, 0.15, 140), // Green
      warning: generateColorScale(0.75, 0.2, 50), // Orange
      error: generateColorScale(0.6, 0.2, 15), // Red
      background: {
        primary: 'oklch(0.98 0.005 240)',
        secondary: 'oklch(0.96 0.01 240)',
        tertiary: 'oklch(0.94 0.015 240)',
        overlay: 'oklch(0.1 0.01 240 / 0.5)',
      },
      text: {
        primary: 'oklch(0.15 0.02 240)',
        secondary: 'oklch(0.4 0.015 240)',
        tertiary: 'oklch(0.6 0.01 240)',
        inverse: 'oklch(0.95 0.005 240)',
        link: 'oklch(0.6 0.15 240)',
        placeholder: 'oklch(0.7 0.01 240)',
      },
      border: {
        primary: 'oklch(0.85 0.01 240)',
        secondary: 'oklch(0.9 0.008 240)',
        focus: 'oklch(0.6 0.15 240)',
        error: 'oklch(0.6 0.2 15)',
        success: 'oklch(0.65 0.15 140)',
      },
    },
    typography: {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    borders: {
      radius: {
        none: '0px',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      width: {
        none: '0px',
        thin: '1px',
        base: '1px',
        thick: '2px',
      },
    },
    shadows: {
      sm: '0 1px 2px 0 oklch(0.1 0.01 240 / 0.05)',
      base: '0 1px 3px 0 oklch(0.1 0.01 240 / 0.1), 0 1px 2px -1px oklch(0.1 0.01 240 / 0.1)',
      md: '0 4px 6px -1px oklch(0.1 0.01 240 / 0.1), 0 2px 4px -2px oklch(0.1 0.01 240 / 0.1)',
      lg: '0 10px 15px -3px oklch(0.1 0.01 240 / 0.1), 0 4px 6px -4px oklch(0.1 0.01 240 / 0.1)',
      xl: '0 20px 25px -5px oklch(0.1 0.01 240 / 0.1), 0 8px 10px -6px oklch(0.1 0.01 240 / 0.1)',
      inner: 'inset 0 2px 4px 0 oklch(0.1 0.01 240 / 0.05)',
      none: 'none',
    },
    layout: {
      maxWidth: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        full: '100%',
      },
      container: {
        padding: '1rem',
        margin: '0 auto',
      },
    },
  },
};

/**
 * Corporate Theme - Professional and trustworthy
 * Ideal for business applications and enterprise tools
 */
const corporateTheme: Theme = {
  metadata: {
    id: 'corporate-2025',
    name: 'Corporate',
    description: 'Professional theme designed for business applications',
    author: 'ArvaForm',
    version: '1.0.0',
    category: ThemeCategory.CORPORATE,
    tags: ['corporate', 'professional', 'business', 'enterprise'],
    isDefault: false,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  tokens: {
    colors: {
      primary: generateColorScale(0.55, 0.18, 220), // Corporate blue
      secondary: generateColorScale(0.7, 0.08, 220), // Light corporate blue
      accent: generateColorScale(0.6, 0.12, 200), // Teal accent
      neutral: generateColorScale(0.5, 0.015, 220), // Professional gray
      success: generateColorScale(0.6, 0.12, 155), // Muted green
      warning: generateColorScale(0.7, 0.15, 45), // Corporate orange
      error: generateColorScale(0.58, 0.18, 20), // Professional red
      background: {
        primary: 'oklch(0.97 0.008 220)',
        secondary: 'oklch(0.95 0.012 220)',
        tertiary: 'oklch(0.92 0.015 220)',
        overlay: 'oklch(0.08 0.01 220 / 0.6)',
      },
      text: {
        primary: 'oklch(0.12 0.015 220)',
        secondary: 'oklch(0.35 0.012 220)',
        tertiary: 'oklch(0.55 0.008 220)',
        inverse: 'oklch(0.96 0.005 220)',
        link: 'oklch(0.55 0.18 220)',
        placeholder: 'oklch(0.65 0.008 220)',
      },
      border: {
        primary: 'oklch(0.82 0.012 220)',
        secondary: 'oklch(0.88 0.008 220)',
        focus: 'oklch(0.55 0.18 220)',
        error: 'oklch(0.58 0.18 20)',
        success: 'oklch(0.6 0.12 155)',
      },
    },
    typography: {
      fontFamily: {
        primary: 'Roboto, system-ui, sans-serif',
        secondary: 'Roboto, system-ui, sans-serif',
        mono: 'Roboto Mono, Consolas, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.7,
      },
      letterSpacing: {
        tight: '-0.015em',
        normal: '0em',
        wide: '0.015em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    borders: {
      radius: {
        none: '0px',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        full: '9999px',
      },
      width: {
        none: '0px',
        thin: '1px',
        base: '1px',
        thick: '2px',
      },
    },
    shadows: {
      sm: '0 1px 2px 0 oklch(0.08 0.01 220 / 0.08)',
      base: '0 1px 3px 0 oklch(0.08 0.01 220 / 0.12), 0 1px 2px -1px oklch(0.08 0.01 220 / 0.12)',
      md: '0 4px 6px -1px oklch(0.08 0.01 220 / 0.12), 0 2px 4px -2px oklch(0.08 0.01 220 / 0.12)',
      lg: '0 10px 15px -3px oklch(0.08 0.01 220 / 0.12), 0 4px 6px -4px oklch(0.08 0.01 220 / 0.12)',
      xl: '0 20px 25px -5px oklch(0.08 0.01 220 / 0.12), 0 8px 10px -6px oklch(0.08 0.01 220 / 0.12)',
      inner: 'inset 0 2px 4px 0 oklch(0.08 0.01 220 / 0.08)',
      none: 'none',
    },
    layout: {
      maxWidth: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        full: '100%',
      },
      container: {
        padding: '1.5rem',
        margin: '0 auto',
      },
    },
  },
};

/**
 * Creative Theme - Bold and expressive
 * Perfect for creative professionals and artistic applications
 */
const creativeTheme: Theme = {
  metadata: {
    id: 'creative-2025',
    name: 'Creative',
    description: 'Bold and expressive theme for creative professionals',
    author: 'ArvaForm',
    version: '1.0.0',
    category: ThemeCategory.CREATIVE,
    tags: ['creative', 'bold', 'artistic', 'expressive'],
    isDefault: false,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  tokens: {
    colors: {
      primary: generateColorScale(0.65, 0.25, 290), // Vibrant purple
      secondary: generateColorScale(0.7, 0.22, 320), // Magenta
      accent: generateColorScale(0.75, 0.28, 65), // Golden yellow
      neutral: generateColorScale(0.45, 0.02, 290), // Purple-tinted gray
      success: generateColorScale(0.7, 0.25, 130), // Vibrant green
      warning: generateColorScale(0.78, 0.3, 55), // Bright orange
      error: generateColorScale(0.65, 0.28, 10), // Vibrant red
      background: {
        primary: 'oklch(0.96 0.02 290)',
        secondary: 'oklch(0.93 0.025 290)',
        tertiary: 'oklch(0.9 0.03 290)',
        overlay: 'oklch(0.15 0.05 290 / 0.7)',
      },
      text: {
        primary: 'oklch(0.18 0.03 290)',
        secondary: 'oklch(0.4 0.02 290)',
        tertiary: 'oklch(0.6 0.015 290)',
        inverse: 'oklch(0.95 0.01 290)',
        link: 'oklch(0.65 0.25 290)',
        placeholder: 'oklch(0.65 0.015 290)',
      },
      border: {
        primary: 'oklch(0.8 0.02 290)',
        secondary: 'oklch(0.85 0.015 290)',
        focus: 'oklch(0.65 0.25 290)',
        error: 'oklch(0.65 0.28 10)',
        success: 'oklch(0.7 0.25 130)',
      },
    },
    typography: {
      fontFamily: {
        primary: 'Poppins, system-ui, sans-serif',
        secondary: 'Playfair Display, Georgia, serif',
        mono: 'Fira Code, Consolas, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.15,
        normal: 1.45,
        relaxed: 1.8,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.05em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    borders: {
      radius: {
        none: '0px',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      width: {
        none: '0px',
        thin: '1px',
        base: '2px',
        thick: '3px',
      },
    },
    shadows: {
      sm: '0 2px 4px 0 oklch(0.15 0.05 290 / 0.12)',
      base: '0 4px 6px 0 oklch(0.15 0.05 290 / 0.15), 0 2px 4px -1px oklch(0.15 0.05 290 / 0.15)',
      md: '0 8px 12px -2px oklch(0.15 0.05 290 / 0.15), 0 4px 8px -4px oklch(0.15 0.05 290 / 0.15)',
      lg: '0 16px 24px -4px oklch(0.15 0.05 290 / 0.15), 0 8px 12px -6px oklch(0.15 0.05 290 / 0.15)',
      xl: '0 24px 40px -6px oklch(0.15 0.05 290 / 0.15), 0 12px 16px -8px oklch(0.15 0.05 290 / 0.15)',
      inner: 'inset 0 3px 6px 0 oklch(0.15 0.05 290 / 0.1)',
      none: 'none',
    },
    layout: {
      maxWidth: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        full: '100%',
      },
      container: {
        padding: '1.25rem',
        margin: '0 auto',
      },
    },
  },
};

/**
 * Modern Theme - Contemporary and fresh
 * Balanced approach with modern aesthetics
 */
const modernTheme: Theme = {
  metadata: {
    id: 'modern-2025',
    name: 'Modern',
    description: 'Contemporary theme with fresh modern aesthetics',
    author: 'ArvaForm',
    version: '1.0.0',
    category: ThemeCategory.MODERN,
    tags: ['modern', 'contemporary', 'fresh', 'balanced'],
    isDefault: false,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  tokens: {
    colors: {
      primary: generateColorScale(0.62, 0.18, 210), // Modern blue
      secondary: generateColorScale(0.68, 0.15, 180), // Cyan
      accent: generateColorScale(0.72, 0.2, 165), // Turquoise
      neutral: generateColorScale(0.48, 0.018, 210), // Cool gray
      success: generateColorScale(0.68, 0.18, 145), // Fresh green
      warning: generateColorScale(0.75, 0.22, 50), // Modern orange
      error: generateColorScale(0.62, 0.22, 15), // Modern red
      background: {
        primary: 'oklch(0.975 0.008 210)',
        secondary: 'oklch(0.95 0.012 210)',
        tertiary: 'oklch(0.92 0.018 210)',
        overlay: 'oklch(0.12 0.015 210 / 0.55)',
      },
      text: {
        primary: 'oklch(0.16 0.02 210)',
        secondary: 'oklch(0.38 0.015 210)',
        tertiary: 'oklch(0.58 0.012 210)',
        inverse: 'oklch(0.94 0.008 210)',
        link: 'oklch(0.62 0.18 210)',
        placeholder: 'oklch(0.68 0.012 210)',
      },
      border: {
        primary: 'oklch(0.84 0.015 210)',
        secondary: 'oklch(0.89 0.01 210)',
        focus: 'oklch(0.62 0.18 210)',
        error: 'oklch(0.62 0.22 15)',
        success: 'oklch(0.68 0.18 145)',
      },
    },
    typography: {
      fontFamily: {
        primary: 'Source Sans Pro, system-ui, sans-serif',
        secondary: 'Source Sans Pro, system-ui, sans-serif',
        mono: 'Source Code Pro, Consolas, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.22,
        normal: 1.48,
        relaxed: 1.72,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    borders: {
      radius: {
        none: '0px',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.875rem',
        full: '9999px',
      },
      width: {
        none: '0px',
        thin: '1px',
        base: '1px',
        thick: '2px',
      },
    },
    shadows: {
      sm: '0 1px 3px 0 oklch(0.12 0.015 210 / 0.08)',
      base: '0 2px 4px 0 oklch(0.12 0.015 210 / 0.12), 0 1px 3px -1px oklch(0.12 0.015 210 / 0.12)',
      md: '0 6px 8px -1px oklch(0.12 0.015 210 / 0.12), 0 3px 6px -3px oklch(0.12 0.015 210 / 0.12)',
      lg: '0 12px 18px -3px oklch(0.12 0.015 210 / 0.12), 0 6px 8px -5px oklch(0.12 0.015 210 / 0.12)',
      xl: '0 22px 28px -5px oklch(0.12 0.015 210 / 0.12), 0 10px 12px -7px oklch(0.12 0.015 210 / 0.12)',
      inner: 'inset 0 2px 5px 0 oklch(0.12 0.015 210 / 0.08)',
      none: 'none',
    },
    layout: {
      maxWidth: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        full: '100%',
      },
      container: {
        padding: '1rem',
        margin: '0 auto',
      },
    },
  },
};

/**
 * Classic Theme - Timeless and traditional
 * Traditional design with proven usability
 */
const classicTheme: Theme = {
  metadata: {
    id: 'classic-2025',
    name: 'Classic',
    description: 'Timeless theme with traditional design principles',
    author: 'ArvaForm',
    version: '1.0.0',
    category: ThemeCategory.CLASSIC,
    tags: ['classic', 'traditional', 'timeless', 'conservative'],
    isDefault: false,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  tokens: {
    colors: {
      primary: generateColorScale(0.58, 0.12, 230), // Classic blue
      secondary: generateColorScale(0.65, 0.08, 230), // Light classic blue
      accent: generateColorScale(0.6, 0.1, 200), // Subdued teal
      neutral: generateColorScale(0.5, 0.01, 230), // Classic gray
      success: generateColorScale(0.6, 0.1, 150), // Traditional green
      warning: generateColorScale(0.7, 0.12, 40), // Classic amber
      error: generateColorScale(0.55, 0.15, 25), // Traditional red
      background: {
        primary: 'oklch(0.99 0.002 230)',
        secondary: 'oklch(0.97 0.005 230)',
        tertiary: 'oklch(0.94 0.008 230)',
        overlay: 'oklch(0.05 0.005 230 / 0.5)',
      },
      text: {
        primary: 'oklch(0.1 0.01 230)',
        secondary: 'oklch(0.3 0.008 230)',
        tertiary: 'oklch(0.5 0.005 230)',
        inverse: 'oklch(0.98 0.002 230)',
        link: 'oklch(0.58 0.12 230)',
        placeholder: 'oklch(0.6 0.005 230)',
      },
      border: {
        primary: 'oklch(0.8 0.008 230)',
        secondary: 'oklch(0.85 0.005 230)',
        focus: 'oklch(0.58 0.12 230)',
        error: 'oklch(0.55 0.15 25)',
        success: 'oklch(0.6 0.1 150)',
      },
    },
    typography: {
      fontFamily: {
        primary: 'Times New Roman, Times, serif',
        secondary: 'Arial, Helvetica, sans-serif',
        mono: 'Courier New, Courier, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.6,
        relaxed: 1.8,
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0em',
        wide: '0.01em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    borders: {
      radius: {
        none: '0px',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        full: '9999px',
      },
      width: {
        none: '0px',
        thin: '1px',
        base: '1px',
        thick: '2px',
      },
    },
    shadows: {
      sm: '0 1px 2px 0 oklch(0.05 0.005 230 / 0.1)',
      base: '0 1px 3px 0 oklch(0.05 0.005 230 / 0.12), 0 1px 2px -1px oklch(0.05 0.005 230 / 0.12)',
      md: '0 4px 6px -1px oklch(0.05 0.005 230 / 0.12), 0 2px 4px -2px oklch(0.05 0.005 230 / 0.12)',
      lg: '0 10px 15px -3px oklch(0.05 0.005 230 / 0.12), 0 4px 6px -4px oklch(0.05 0.005 230 / 0.12)',
      xl: '0 20px 25px -5px oklch(0.05 0.005 230 / 0.12), 0 8px 10px -6px oklch(0.05 0.005 230 / 0.12)',
      inner: 'inset 0 2px 4px 0 oklch(0.05 0.005 230 / 0.06)',
      none: 'none',
    },
    layout: {
      maxWidth: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        full: '100%',
      },
      container: {
        padding: '1.5rem',
        margin: '0 auto',
      },
    },
  },
};

/**
 * Collection of all predefined themes
 */
export const predefinedThemes: Theme[] = [
  minimalTheme,
  corporateTheme,
  creativeTheme,
  modernTheme,
  classicTheme,
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  return predefinedThemes.find((theme) => theme.metadata.id === id);
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: ThemeCategory): Theme[] {
  return predefinedThemes.filter((theme) => theme.metadata.category === category);
}

/**
 * Get default theme
 */
export function getDefaultTheme(): Theme {
  return minimalTheme;
}

/**
 * Create a custom theme from base theme
 */
export function createCustomTheme(
  baseTheme: Theme,
  customizations: Partial<ThemeTokens>,
  metadata: { name: string; description?: string },
): Theme {
  return {
    metadata: {
      ...baseTheme.metadata,
      id: `custom-${Date.now()}`,
      name: metadata.name,
      description: metadata.description || `Custom theme based on ${baseTheme.metadata.name}`,
      category: ThemeCategory.CUSTOM,
      isDefault: false,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tokens: {
      ...baseTheme.tokens,
      ...customizations,
    },
    customCSS: baseTheme.customCSS,
  };
}

/**
 * Theme utilities for quick access
 */
export const themeUtils = {
  generateColorScale,
  getThemeById,
  getThemesByCategory,
  getDefaultTheme,
  createCustomTheme,
  predefinedThemes,
};
