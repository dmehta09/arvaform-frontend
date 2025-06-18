/**
 * Device breakpoints and viewport configurations for form preview system
 * Following 2025 responsive design standards with accurate device simulations
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ViewportOrientation = 'portrait' | 'landscape';

export interface DeviceViewport {
  name: string;
  type: DeviceType;
  width: number;
  height: number;
  orientation: ViewportOrientation;
  userAgent?: string;
  icon: string;
  description: string;
}

/**
 * Comprehensive device viewport configurations
 * Updated for 2025 with current popular device resolutions
 */
export const DEVICE_VIEWPORTS: Record<string, DeviceViewport> = {
  // Mobile Devices
  iphone14: {
    name: 'iPhone 14',
    type: 'mobile',
    width: 390,
    height: 844,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: '📱',
    description: 'iPhone 14 (390x844)',
  },
  iphone14Pro: {
    name: 'iPhone 14 Pro',
    type: 'mobile',
    width: 393,
    height: 852,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: '📱',
    description: 'iPhone 14 Pro (393x852)',
  },
  galaxyS23: {
    name: 'Galaxy S23',
    type: 'mobile',
    width: 360,
    height: 780,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    icon: '📱',
    description: 'Samsung Galaxy S23 (360x780)',
  },
  pixelFold: {
    name: 'Pixel Fold',
    type: 'mobile',
    width: 412,
    height: 876,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel Fold) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    icon: '📱',
    description: 'Google Pixel Fold (412x876)',
  },

  // Tablet Devices
  ipadAir: {
    name: 'iPad Air',
    type: 'tablet',
    width: 820,
    height: 1180,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: '📟',
    description: 'iPad Air (820x1180)',
  },
  ipadPro: {
    name: 'iPad Pro 12.9"',
    type: 'tablet',
    width: 1024,
    height: 1366,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: '📟',
    description: 'iPad Pro 12.9" (1024x1366)',
  },
  surfacePro: {
    name: 'Surface Pro',
    type: 'tablet',
    width: 912,
    height: 1368,
    orientation: 'portrait',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    icon: '📟',
    description: 'Microsoft Surface Pro (912x1368)',
  },

  // Desktop Devices
  desktop1080: {
    name: 'Desktop HD',
    type: 'desktop',
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    icon: '🖥️',
    description: 'Desktop HD (1920x1080)',
  },
  desktop1440: {
    name: 'Desktop QHD',
    type: 'desktop',
    width: 2560,
    height: 1440,
    orientation: 'landscape',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    icon: '🖥️',
    description: 'Desktop QHD (2560x1440)',
  },
  macbook: {
    name: 'MacBook Pro',
    type: 'desktop',
    width: 1512,
    height: 982,
    orientation: 'landscape',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    icon: '💻',
    description: 'MacBook Pro 14" (1512x982)',
  },
};

/**
 * Array of all available devices for easy iteration
 */
export const devices = Object.entries(DEVICE_VIEWPORTS).map(([id, viewport]) => ({
  id,
  ...viewport,
}));

/**
 * Default viewport configurations by device type
 */
export const DEFAULT_VIEWPORTS: Record<DeviceType, string> = {
  mobile: 'iphone14',
  tablet: 'ipadAir',
  desktop: 'desktop1080',
};

/**
 * Responsive breakpoints for CSS media queries
 * Following Tailwind CSS conventions updated for 2025
 */
export const RESPONSIVE_BREAKPOINTS = {
  xs: '475px', // Extra small devices
  sm: '640px', // Small devices (landscape phones)
  md: '768px', // Medium devices (tablets)
  lg: '1024px', // Large devices (laptops)
  xl: '1280px', // Extra large devices (large laptops)
  '2xl': '1536px', // 2X large devices (larger desktops)
} as const;

/**
 * Get viewport configuration by key
 */
export function getViewport(key: string): DeviceViewport | null {
  return DEVICE_VIEWPORTS[key] || null;
}

/**
 * Get all viewports by device type
 */
export function getViewportsByType(type: DeviceType): DeviceViewport[] {
  return Object.values(DEVICE_VIEWPORTS).filter((viewport) => viewport.type === type);
}

/**
 * Get viewport scale factor for preview container
 */
export function getViewportScale(
  viewport: DeviceViewport,
  containerWidth: number,
  containerHeight: number,
): number {
  const scaleX = containerWidth / viewport.width;
  const scaleY = containerHeight / viewport.height;

  // Use the smaller scale to ensure the viewport fits completely
  return Math.min(scaleX, scaleY, 1); // Never scale up beyond 100%
}

/**
 * Check if viewport is in landscape orientation
 */
export function isLandscape(viewport: DeviceViewport): boolean {
  return viewport.orientation === 'landscape' || viewport.width > viewport.height;
}

/**
 * Get rotated viewport (switch width/height)
 */
export function getRotatedViewport(viewport: DeviceViewport): DeviceViewport {
  return {
    ...viewport,
    width: viewport.height,
    height: viewport.width,
    orientation: viewport.orientation === 'portrait' ? 'landscape' : 'portrait',
    description: `${viewport.name} (${viewport.height}x${viewport.width}) - Rotated`,
  };
}

/**
 * Preview container size calculations
 */
export interface PreviewContainerSize {
  width: number;
  height: number;
  scale: number;
  viewport: DeviceViewport;
}

/**
 * Calculate optimal preview container size with responsive scaling
 */
export function calculatePreviewContainer(
  viewport: DeviceViewport,
  availableWidth: number,
  availableHeight: number,
  maxScale: number = 1,
  minScale: number = 0.1,
): PreviewContainerSize {
  // Account for padding and controls
  const paddingX = 48; // 24px on each side
  const paddingY = 120; // Space for toolbar and controls

  const containerWidth = availableWidth - paddingX;
  const containerHeight = availableHeight - paddingY;

  let scale = getViewportScale(viewport, containerWidth, containerHeight);

  // Ensure scale is within bounds
  scale = Math.max(minScale, Math.min(maxScale, scale));

  return {
    width: viewport.width * scale,
    height: viewport.height * scale,
    scale,
    viewport,
  };
}
