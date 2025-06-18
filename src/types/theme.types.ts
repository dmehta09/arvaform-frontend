/**
 * Theme System Types - ArvaForm 2025
 * Comprehensive type definitions for form styling and theming system
 * Based on design tokens and CSS custom properties
 */

// Core theme structure based on design tokens
export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  layout: LayoutTokens;
}

// Color tokens using OKLCH color space for better perceptual uniformity
export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
    placeholder: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
  };
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

// Typography tokens
export interface TypographyTokens {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

// Spacing tokens
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

// Border tokens
export interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  width: {
    none: string;
    thin: string;
    base: string;
    thick: string;
  };
}

// Shadow tokens
export interface ShadowTokens {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
  none: string;
}

// Layout tokens
export interface LayoutTokens {
  maxWidth: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  container: {
    padding: string;
    margin: string;
  };
}

// Theme metadata
export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: ThemeCategory;
  tags: string[];
  isDefault: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  previewImage?: string;
}

export enum ThemeCategory {
  MINIMAL = 'minimal',
  CORPORATE = 'corporate',
  CREATIVE = 'creative',
  MODERN = 'modern',
  CLASSIC = 'classic',
  CUSTOM = 'custom',
}

// Complete theme definition
export interface Theme {
  metadata: ThemeMetadata;
  tokens: ThemeTokens;
  customCSS?: string;
}

// Theme mode (light/dark)
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// Theme context state
export interface ThemeContextState {
  currentTheme: Theme | null;
  mode: ThemeMode;
  availableThemes: Theme[];
  isLoading: boolean;
  error: string | null;
}

// Theme actions
export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  setMode: (mode: ThemeMode) => void;
  updateThemeTokens: (tokens: Partial<ThemeTokens>) => void;
  updateCustomCSS: (css: string) => void;
  saveTheme: (theme: Theme) => Promise<void>;
  loadTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  duplicateTheme: (themeId: string, name: string) => Promise<void>;
  exportTheme: (themeId: string) => Promise<string>;
  importTheme: (themeData: string) => Promise<void>;
  resetTheme: () => void;
}

// Theme validation
export interface ThemeValidationResult {
  isValid: boolean;
  errors: ThemeValidationError[];
  warnings: ThemeValidationWarning[];
}

export interface ThemeValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ThemeValidationWarning {
  path: string;
  message: string;
  code: string;
}

// CSS generation options
export interface CSSGenerationOptions {
  includeCustomCSS: boolean;
  includeBase: boolean;
  includeComponents: boolean;
  includeUtilities: boolean;
  minify: boolean;
  prefix?: string;
}

// Theme customization controls
export interface ThemeControlsState {
  activePanel: ThemePanel;
  selectedColor: string | null;
  previewMode: boolean;
  showAdvanced: boolean;
}

export enum ThemePanel {
  COLORS = 'colors',
  TYPOGRAPHY = 'typography',
  SPACING = 'spacing',
  BORDERS = 'borders',
  SHADOWS = 'shadows',
  LAYOUT = 'layout',
  CSS = 'css',
}

// Color picker state
export interface ColorPickerState {
  color: string;
  format: ColorFormat;
  showPalette: boolean;
  showAdvanced: boolean;
}

export enum ColorFormat {
  HEX = 'hex',
  RGB = 'rgb',
  HSL = 'hsl',
  OKLCH = 'oklch',
}

// Accessibility validation
export interface AccessibilityCheck {
  contrastRatio: number;
  isAACompliant: boolean;
  isAAACompliant: boolean;
  suggestions: string[];
}

// API types for backend integration
export interface CreateThemeRequest {
  name: string;
  description?: string;
  category: ThemeCategory;
  tokens: ThemeTokens;
  customCSS?: string;
  tags?: string[];
}

export interface UpdateThemeRequest {
  name?: string;
  description?: string;
  category?: ThemeCategory;
  tokens?: Partial<ThemeTokens>;
  customCSS?: string;
  tags?: string[];
}

export interface ThemeResponse {
  theme: Theme;
  message: string;
}

export interface ThemesListResponse {
  themes: Theme[];
  total: number;
  page: number;
  limit: number;
}

// Theme sharing and permissions
export interface ThemePermissions {
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExport: boolean;
}

export interface SharedTheme {
  theme: Theme;
  permissions: ThemePermissions;
  sharedBy: string;
  sharedAt: Date;
  expiresAt?: Date;
}
