/**
 * Social Media Sharing Templates for ArvaForm
 *
 * Provides templates and utilities for sharing forms across social platforms:
 * - Facebook with Open Graph optimization
 * - Twitter/X with Twitter Cards
 * - LinkedIn with professional messaging
 * - WhatsApp with mobile-optimized links
 * - Telegram with instant preview
 * - Reddit with community-friendly formatting
 * - Email with responsive templates
 *
 * Following 2025 social media best practices
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, unknown>) => void;
  }
}

export interface SocialShareConfig {
  formId: string;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  customDomain?: string;
  utm?: {
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
  };
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: string;
  description: string;
  maxTitleLength?: number;
  maxDescriptionLength?: number;
  supportsImage: boolean;
}

/**
 * Supported social media platforms with their configurations
 */
export const SOCIAL_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    description: 'Share with friends and family',
    maxTitleLength: 100,
    maxDescriptionLength: 300,
    supportsImage: true,
  },
  twitter: {
    name: 'Twitter/X',
    icon: '✕',
    color: '#000000',
    shareUrl: 'https://twitter.com/intent/tweet',
    description: 'Share with your followers',
    maxTitleLength: 70,
    maxDescriptionLength: 200,
    supportsImage: true,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    description: 'Share with professional network',
    maxTitleLength: 150,
    maxDescriptionLength: 600,
    supportsImage: true,
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    shareUrl: 'https://wa.me/',
    description: 'Share via messaging',
    maxTitleLength: 65,
    maxDescriptionLength: 150,
    supportsImage: false,
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    shareUrl: 'https://t.me/share/url',
    description: 'Share in channels and groups',
    maxTitleLength: 100,
    maxDescriptionLength: 200,
    supportsImage: false,
  },
  reddit: {
    name: 'Reddit',
    icon: '🔗',
    color: '#FF4500',
    shareUrl: 'https://reddit.com/submit',
    description: 'Share with communities',
    maxTitleLength: 300,
    maxDescriptionLength: 500,
    supportsImage: false,
  },
  email: {
    name: 'Email',
    icon: '📧',
    color: '#6B7280',
    shareUrl: 'mailto:',
    description: 'Share via email',
    maxTitleLength: 100,
    maxDescriptionLength: 1000,
    supportsImage: false,
  },
};

/**
 * Generates the base form URL with tracking parameters
 */
function generateTrackingUrl(config: SocialShareConfig, platform: string): string {
  const baseUrl = config.customDomain
    ? `https://${config.customDomain}/f/${config.slug}`
    : `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://app.arvaform.com'}/f/${config.slug}`;

  const params = new URLSearchParams();

  // Add UTM tracking parameters
  if (config.utm) {
    params.append('utm_source', config.utm.source || platform);
    params.append('utm_medium', config.utm.medium || 'social');
    if (config.utm.campaign) params.append('utm_campaign', config.utm.campaign);
    if (config.utm.content) params.append('utm_content', config.utm.content);
  } else {
    // Default tracking
    params.append('utm_source', platform);
    params.append('utm_medium', 'social');
    params.append('utm_campaign', 'form_share');
  }

  params.append('ref', platform);

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Truncates text to specified length with ellipsis
 */
function truncateText(text: string, maxLength?: number): string {
  if (!maxLength || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generates Facebook share URL with Open Graph optimization
 */
export function generateFacebookShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.facebook;
  const url = generateTrackingUrl(config, 'facebook');

  const params = new URLSearchParams({
    u: url,
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Generates Twitter/X share URL with optimized content
 */
export function generateTwitterShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.twitter;
  const url = generateTrackingUrl(config, 'twitter');

  const title = truncateText(config.title, platform.maxTitleLength);
  const description = truncateText(config.description, platform.maxDescriptionLength);

  // Craft engaging tweet text
  const tweetText = `${title}\n\n${description}\n\nFill out the form:`;

  const params = new URLSearchParams({
    text: tweetText,
    url: url,
    hashtags: 'forms,survey,arvaform',
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Generates LinkedIn share URL with professional context
 */
export function generateLinkedInShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.linkedin;
  const url = generateTrackingUrl(config, 'linkedin');

  const params = new URLSearchParams({
    url: url,
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Generates WhatsApp share URL with mobile optimization
 */
export function generateWhatsAppShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.whatsapp;
  const url = generateTrackingUrl(config, 'whatsapp');

  const title = truncateText(config.title, platform.maxTitleLength);
  const description = truncateText(config.description, platform.maxDescriptionLength);

  const message = `*${title}*\n\n${description}\n\n${url}`;

  const params = new URLSearchParams({
    text: message,
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Generates Telegram share URL with instant preview
 */
export function generateTelegramShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.telegram;
  const url = generateTrackingUrl(config, 'telegram');

  const title = truncateText(config.title, platform.maxTitleLength);
  const description = truncateText(config.description, platform.maxDescriptionLength);

  const text = `📋 ${title}\n\n${description}`;

  const params = new URLSearchParams({
    url: url,
    text: text,
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Generates Reddit submit URL with community formatting
 */
export function generateRedditShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.reddit;
  const url = generateTrackingUrl(config, 'reddit');

  const title = truncateText(config.title, platform.maxTitleLength);

  const params = new URLSearchParams({
    url: url,
    title: title,
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Generates email share with responsive template
 */
export function generateEmailShare(config: SocialShareConfig): string {
  const platform = SOCIAL_PLATFORMS.email;
  const url = generateTrackingUrl(config, 'email');

  const subject = `Check out this form: ${config.title}`;
  const body = `Hi there!

I'd like to share this form with you: ${config.title}

${config.description}

You can access it here: ${url}

Best regards!`;

  const params = new URLSearchParams({
    subject: subject,
    body: body,
  });

  return `${platform.shareUrl}?${params.toString()}`;
}

/**
 * Main function to generate share URL for any platform
 */
export function generateSocialShareUrl(platform: string, config: SocialShareConfig): string {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return generateFacebookShare(config);
    case 'twitter':
    case 'x':
      return generateTwitterShare(config);
    case 'linkedin':
      return generateLinkedInShare(config);
    case 'whatsapp':
      return generateWhatsAppShare(config);
    case 'telegram':
      return generateTelegramShare(config);
    case 'reddit':
      return generateRedditShare(config);
    case 'email':
      return generateEmailShare(config);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Generates all social share URLs for a form
 */
export function generateAllSocialShares(config: SocialShareConfig): Record<string, string> {
  const shares: Record<string, string> = {};

  Object.keys(SOCIAL_PLATFORMS).forEach((platform) => {
    try {
      shares[platform] = generateSocialShareUrl(platform, config);
    } catch (error) {
      console.error(`Failed to generate ${platform} share URL:`, error);
    }
  });

  return shares;
}

/**
 * Generates Open Graph meta tags for better social sharing
 */
export function generateOpenGraphTags(
  config: SocialShareConfig,
): Array<{ property: string; content: string }> {
  const url = generateTrackingUrl(config, 'opengraph');

  const tags = [
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: config.title },
    { property: 'og:description', content: config.description },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: 'ArvaForm' },
  ];

  if (config.imageUrl) {
    tags.push(
      { property: 'og:image', content: config.imageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:type', content: 'image/png' },
    );
  }

  return tags;
}

/**
 * Generates Twitter Card meta tags
 */
export function generateTwitterCardTags(
  config: SocialShareConfig,
): Array<{ name: string; content: string }> {
  const tags = [
    { name: 'twitter:card', content: config.imageUrl ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: truncateText(config.title, 70) },
    { name: 'twitter:description', content: truncateText(config.description, 200) },
    { name: 'twitter:site', content: '@arvaform' },
  ];

  if (config.imageUrl) {
    tags.push({ name: 'twitter:image', content: config.imageUrl });
  }

  return tags;
}

/**
 * Web Share API integration for modern browsers
 */
export async function nativeShare(config: SocialShareConfig): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    const url = generateTrackingUrl(config, 'native');

    const shareData: ShareData = {
      title: config.title,
      text: config.description,
      url: url,
    };

    await navigator.share(shareData);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.error('Native share failed:', error);
    return false;
  }
}

/**
 * Copy to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Validates social share configuration
 */
export function validateSocialShareConfig(config: Partial<SocialShareConfig>): string[] {
  const errors: string[] = [];

  if (!config.formId) {
    errors.push('Form ID is required');
  }

  if (!config.slug) {
    errors.push('Form slug is required');
  }

  if (!config.title) {
    errors.push('Form title is required');
  }

  if (!config.description) {
    errors.push('Form description is required');
  }

  if (config.title && config.title.length > 200) {
    errors.push('Title is too long (max 200 characters)');
  }

  if (config.description && config.description.length > 1000) {
    errors.push('Description is too long (max 1000 characters)');
  }

  return errors;
}

/**
 * Generates share analytics tracking
 */
export function trackSocialShare(platform: string, formId: string): void {
  // Track share event for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', {
      method: platform,
      content_type: 'form',
      item_id: formId,
    });
  }

  // Custom analytics event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('arvaform:share', {
        detail: { platform, formId, timestamp: Date.now() },
      }),
    );
  }
}
