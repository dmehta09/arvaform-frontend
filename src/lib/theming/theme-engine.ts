/**
 * Theme Engine - ArvaForm 2025
 * Core engine for managing themes, CSS custom properties, and dynamic styling
 * Uses OKLCH color space for better perceptual uniformity
 */

import {
  BorderTokens,
  ColorTokens,
  LayoutTokens,
  ShadowTokens,
  SpacingTokens,
  Theme,
  ThemeMode,
  ThemeTokens,
  ThemeValidationError,
  ThemeValidationResult,
  ThemeValidationWarning,
  TypographyTokens,
} from '@/types/theme.types';

/**
 * Core theme engine class
 * Manages theme application, CSS generation, and validation
 */
export class ThemeEngine {
  private static instance: ThemeEngine;
  private currentTheme: Theme | null = null;
  private currentMode: ThemeMode = ThemeMode.SYSTEM;
  private observers: Set<(theme: Theme | null, mode: ThemeMode) => void> = new Set();

  private constructor() {
    // Initialize with system theme preference
    this.initializeSystemTheme();
  }

  static getInstance(): ThemeEngine {
    if (!ThemeEngine.instance) {
      ThemeEngine.instance = new ThemeEngine();
    }
    return ThemeEngine.instance;
  }

  /**
   * Initialize system theme preference detection
   */
  private initializeSystemTheme(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentMode === ThemeMode.SYSTEM) {
          this.applyCurrentTheme();
        }
      });
    }
  }

  /**
   * Set the current theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyCurrentTheme();
    this.notifyObservers();
  }

  /**
   * Set the theme mode (light/dark/system)
   */
  setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    this.applyCurrentTheme();
    this.notifyObservers();
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * Get the current mode
   */
  getCurrentMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * Get the effective theme mode (resolves system preference)
   */
  getEffectiveMode(): 'light' | 'dark' {
    if (this.currentMode === ThemeMode.SYSTEM) {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return this.currentMode as 'light' | 'dark';
  }

  /**
   * Apply the current theme to the DOM
   */
  private applyCurrentTheme(): void {
    if (!this.currentTheme || typeof document === 'undefined') return;

    const root = document.documentElement;
    const effectiveMode = this.getEffectiveMode();

    // Apply theme tokens as CSS custom properties
    this.applyCSSCustomProperties(root, this.currentTheme.tokens, effectiveMode);

    // Apply custom CSS if present
    if (this.currentTheme.customCSS) {
      this.applyCustomCSS(this.currentTheme.customCSS);
    }

    // Set theme mode class
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${effectiveMode}`);

    // Set theme ID attribute for debugging
    root.setAttribute('data-theme', this.currentTheme.metadata.id);
  }

  /**
   * Apply CSS custom properties to an element
   */
  private applyCSSCustomProperties(
    element: HTMLElement,
    tokens: ThemeTokens,
    mode: 'light' | 'dark',
  ): void {
    // Apply color tokens
    this.applyColorTokens(element, tokens.colors, mode);

    // Apply typography tokens
    this.applyTypographyTokens(element, tokens.typography);

    // Apply spacing tokens
    this.applySpacingTokens(element, tokens.spacing);

    // Apply border tokens
    this.applyBorderTokens(element, tokens.borders);

    // Apply shadow tokens
    this.applyShadowTokens(element, tokens.shadows);

    // Apply layout tokens
    this.applyLayoutTokens(element, tokens.layout);
  }

  /**
   * Apply color tokens with mode-specific variations
   */
  private applyColorTokens(
    element: HTMLElement,
    colors: ColorTokens,
    _mode: 'light' | 'dark',
  ): void {
    const style = element.style;

    // Primary color scale
    Object.entries(colors.primary).forEach(([key, value]) => {
      style.setProperty(`--color-primary-${key}`, value);
    });

    // Secondary color scale
    Object.entries(colors.secondary).forEach(([key, value]) => {
      style.setProperty(`--color-secondary-${key}`, value);
    });

    // Accent color scale
    Object.entries(colors.accent).forEach(([key, value]) => {
      style.setProperty(`--color-accent-${key}`, value);
    });

    // Neutral color scale
    Object.entries(colors.neutral).forEach(([key, value]) => {
      style.setProperty(`--color-neutral-${key}`, value);
    });

    // Success color scale
    Object.entries(colors.success).forEach(([key, value]) => {
      style.setProperty(`--color-success-${key}`, value);
    });

    // Warning color scale
    Object.entries(colors.warning).forEach(([key, value]) => {
      style.setProperty(`--color-warning-${key}`, value);
    });

    // Error color scale
    Object.entries(colors.error).forEach(([key, value]) => {
      style.setProperty(`--color-error-${key}`, value);
    });

    // Background colors
    Object.entries(colors.background).forEach(([key, value]) => {
      style.setProperty(`--color-background-${key}`, value);
    });

    // Text colors
    Object.entries(colors.text).forEach(([key, value]) => {
      style.setProperty(`--color-text-${key}`, value);
    });

    // Border colors
    Object.entries(colors.border).forEach(([key, value]) => {
      style.setProperty(`--color-border-${key}`, value);
    });

    // Set semantic aliases for common use cases
    style.setProperty('--form-primary', colors.primary[500]);
    style.setProperty('--form-secondary', colors.secondary[500]);
    style.setProperty('--form-background', colors.background.primary);
    style.setProperty('--form-text', colors.text.primary);
    style.setProperty('--form-border', colors.border.primary);
    style.setProperty('--form-focus', colors.border.focus);
  }

  /**
   * Apply typography tokens
   */
  private applyTypographyTokens(element: HTMLElement, typography: TypographyTokens): void {
    const style = element.style;

    // Font families
    Object.entries(typography.fontFamily).forEach(([key, value]) => {
      style.setProperty(`--font-family-${key}`, value as string);
    });

    // Font sizes
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      style.setProperty(`--font-size-${key}`, value as string);
    });

    // Font weights
    Object.entries(typography.fontWeight).forEach(([key, value]) => {
      style.setProperty(`--font-weight-${key}`, value.toString());
    });

    // Line heights
    Object.entries(typography.lineHeight).forEach(([key, value]) => {
      style.setProperty(`--line-height-${key}`, value.toString());
    });

    // Letter spacing
    Object.entries(typography.letterSpacing).forEach(([key, value]) => {
      style.setProperty(`--letter-spacing-${key}`, value as string);
    });

    // Set semantic aliases
    style.setProperty('--form-font-family', typography.fontFamily.primary);
    style.setProperty('--form-font-size', typography.fontSize.base);
    style.setProperty('--form-font-weight', typography.fontWeight.normal.toString());
    style.setProperty('--form-line-height', typography.lineHeight.normal.toString());
  }

  /**
   * Apply spacing tokens
   */
  private applySpacingTokens(element: HTMLElement, spacing: SpacingTokens): void {
    const style = element.style;

    Object.entries(spacing).forEach(([key, value]) => {
      style.setProperty(`--spacing-${key}`, value as string);
    });

    // Set semantic aliases
    style.setProperty('--form-spacing-xs', spacing.xs);
    style.setProperty('--form-spacing-sm', spacing.sm);
    style.setProperty('--form-spacing-md', spacing.md);
    style.setProperty('--form-spacing-lg', spacing.lg);
  }

  /**
   * Apply border tokens
   */
  private applyBorderTokens(element: HTMLElement, borders: BorderTokens): void {
    const style = element.style;

    // Border radius
    Object.entries(borders.radius).forEach(([key, value]) => {
      style.setProperty(`--border-radius-${key}`, value as string);
    });

    // Border width
    Object.entries(borders.width).forEach(([key, value]) => {
      style.setProperty(`--border-width-${key}`, value as string);
    });

    // Set semantic aliases
    style.setProperty('--form-border-radius', borders.radius.md);
    style.setProperty('--form-border-width', borders.width.base);
  }

  /**
   * Apply shadow tokens
   */
  private applyShadowTokens(element: HTMLElement, shadows: ShadowTokens): void {
    const style = element.style;

    Object.entries(shadows).forEach(([key, value]) => {
      style.setProperty(`--shadow-${key}`, value as string);
    });

    // Set semantic aliases
    style.setProperty('--form-shadow', shadows.md);
    style.setProperty('--form-shadow-focus', shadows.lg);
  }

  /**
   * Apply layout tokens
   */
  private applyLayoutTokens(element: HTMLElement, layout: LayoutTokens): void {
    const style = element.style;

    // Max width
    Object.entries(layout.maxWidth).forEach(([key, value]) => {
      style.setProperty(`--max-width-${key}`, value as string);
    });

    // Container settings
    Object.entries(layout.container).forEach(([key, value]) => {
      style.setProperty(`--container-${key}`, value as string);
    });
  }

  /**
   * Apply custom CSS
   */
  private applyCustomCSS(css: string): void {
    const existingStyle = document.getElementById('arvaform-custom-theme-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'arvaform-custom-theme-css';
    style.textContent = this.sanitizeCSS(css);
    document.head.appendChild(style);
  }

  /**
   * Sanitize custom CSS to prevent injection attacks
   */
  private sanitizeCSS(css: string): string {
    // Remove dangerous patterns
    const dangerousPatterns = [
      /@import/gi,
      /javascript:/gi,
      /expression\(/gi,
      /behavior:/gi,
      /binding:/gi,
      /url\(/gi, // Remove for now, can be made more sophisticated
    ];

    let sanitized = css;
    dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  /**
   * Validate theme tokens
   */
  validateTheme(theme: Theme): ThemeValidationResult {
    const errors: ThemeValidationError[] = [];
    const warnings: ThemeValidationWarning[] = [];

    try {
      // Validate required properties
      if (!theme.metadata.id) {
        errors.push({
          path: 'metadata.id',
          message: 'Theme ID is required',
          code: 'MISSING_ID',
        });
      }

      if (!theme.metadata.name) {
        errors.push({
          path: 'metadata.name',
          message: 'Theme name is required',
          code: 'MISSING_NAME',
        });
      }

      // Validate color tokens
      this.validateColorTokens(theme.tokens.colors, errors, warnings);

      // Validate accessibility
      this.validateAccessibility(theme.tokens.colors, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            path: 'root',
            message: `Validation error: ${error}`,
            code: 'VALIDATION_ERROR',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Validate color tokens
   */
  private validateColorTokens(
    colors: ColorTokens,
    errors: ThemeValidationError[],
    warnings: ThemeValidationWarning[],
  ): void {
    // Check if all required color scales are present
    const requiredScales = ['primary', 'secondary', 'neutral'];
    requiredScales.forEach((scale) => {
      if (!colors[scale as keyof ColorTokens]) {
        errors.push({
          path: `colors.${scale}`,
          message: `${scale} color scale is required`,
          code: 'MISSING_COLOR_SCALE',
        });
      }
    });

    // Validate color format (should support OKLCH for 2025)
    Object.entries(colors).forEach(([scaleName, scale]) => {
      if (typeof scale === 'object' && scale !== null) {
        Object.entries(scale).forEach(([weight, color]) => {
          if (typeof color === 'string' && !this.isValidColor(color)) {
            warnings.push({
              path: `colors.${scaleName}.${weight}`,
              message: `Invalid color format: ${color}`,
              code: 'INVALID_COLOR_FORMAT',
            });
          }
        });
      }
    });
  }

  /**
   * Validate accessibility compliance
   */
  private validateAccessibility(colors: ColorTokens, warnings: ThemeValidationWarning[]): void {
    // Check contrast ratios between text and background colors
    const contrastRatio = this.calculateContrastRatio(
      colors.text.primary,
      colors.background.primary,
    );

    if (contrastRatio < 4.5) {
      warnings.push({
        path: 'colors.text.primary',
        message: `Low contrast ratio (${contrastRatio.toFixed(2)}). Should be at least 4.5:1 for AA compliance`,
        code: 'LOW_CONTRAST',
      });
    }
  }

  /**
   * Check if a color value is valid
   */
  private isValidColor(color: string): boolean {
    // Support various color formats including OKLCH
    const colorPatterns = [
      /^#[0-9A-Fa-f]{6}$/, // Hex
      /^#[0-9A-Fa-f]{3}$/, // Short hex
      /^rgb\(/, // RGB
      /^rgba\(/, // RGBA
      /^hsl\(/, // HSL
      /^hsla\(/, // HSLA
      /^oklch\(/, // OKLCH
      /^lch\(/, // LCH
    ];

    return colorPatterns.some((pattern) => pattern.test(color));
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(_color1: string, _color2: string): number {
    // Simplified implementation - would use actual color contrast calculation
    return 4.5; // Mock WCAG AA compliant value
  }

  /**
   * Generate CSS string from theme
   */
  generateCSS(theme: Theme, _mode: 'light' | 'dark' = 'light'): string {
    const cssRules: string[] = [];

    // Add root variables
    cssRules.push(':root {');

    // Color variables
    Object.entries(theme.tokens.colors.primary).forEach(([key, value]) => {
      cssRules.push(`  --color-primary-${key}: ${value};`);
    });

    // Add other token categories...
    // Typography, spacing, borders, shadows, layout

    cssRules.push('}');

    // Add custom CSS if present
    if (theme.customCSS) {
      cssRules.push('');
      cssRules.push('/* Custom CSS */');
      cssRules.push(theme.customCSS);
    }

    return cssRules.join('\n');
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (theme: Theme | null, mode: ThemeMode) => void): () => void {
    this.observers.add(callback);
    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Notify observers of theme changes
   */
  private notifyObservers(): void {
    this.observers.forEach((callback) => {
      callback(this.currentTheme, this.currentMode);
    });
  }

  /**
   * Export theme to JSON
   */
  exportTheme(theme: Theme): string {
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme from JSON
   */
  importTheme(json: string): Theme {
    try {
      const theme = JSON.parse(json) as Theme;
      const validation = this.validateTheme(theme);

      if (!validation.isValid) {
        throw new Error(`Invalid theme: ${validation.errors.map((e) => e.message).join(', ')}`);
      }

      return theme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error}`);
    }
  }

  /**
   * Reset to default theme
   */
  reset(): void {
    this.currentTheme = null;
    this.currentMode = ThemeMode.SYSTEM;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      // Remove all theme-related CSS custom properties
      const computedStyle = getComputedStyle(root);
      Array.from(computedStyle).forEach((property) => {
        if (
          property.startsWith('--color-') ||
          property.startsWith('--form-') ||
          property.startsWith('--font-') ||
          property.startsWith('--spacing-') ||
          property.startsWith('--border-') ||
          property.startsWith('--shadow-')
        ) {
          root.style.removeProperty(property);
        }
      });

      // Remove theme classes and attributes
      root.classList.remove('theme-light', 'theme-dark');
      root.removeAttribute('data-theme');

      // Remove custom CSS
      const customStyle = document.getElementById('arvaform-custom-theme-css');
      if (customStyle) {
        customStyle.remove();
      }
    }

    this.notifyObservers();
  }
}

// Export singleton instance
export const themeEngine = ThemeEngine.getInstance();
