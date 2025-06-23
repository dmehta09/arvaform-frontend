/**
 * Embed Code Generator for ArvaForm
 *
 * Generates customizable embed codes for forms with multiple formats:
 * - iframe embeds with responsive design
 * - JavaScript widgets with async loading
 * - Popup modals with trigger options
 * - Direct links with UTM tracking
 *
 * Following 2025 best practices for web embedding
 */

export type EmbedType = 'iframe' | 'javascript' | 'popup' | 'direct';

export interface EmbedOptions {
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  showBranding?: boolean;
  autoResize?: boolean;
  responsive?: boolean;
  lazyLoad?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface PopupOptions extends EmbedOptions {
  trigger?: 'click' | 'time' | 'scroll' | 'exit';
  delay?: number; // milliseconds for time trigger
  scrollPercent?: number; // percentage for scroll trigger
  buttonText?: string;
  buttonStyle?: string;
}

export interface TrackingOptions {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  customParams?: Record<string, string>;
}

export interface EmbedConfig {
  formId: string;
  slug: string;
  type: EmbedType;
  embedOptions: EmbedOptions;
  popupOptions?: PopupOptions;
  tracking?: TrackingOptions;
  customDomain?: string;
}

/**
 * Generates the base URL for the form with tracking parameters
 */
function generateFormUrl(config: EmbedConfig): string {
  const baseUrl = config.customDomain
    ? `https://${config.customDomain}/f/${config.slug}`
    : `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://app.arvaform.com'}/f/${config.slug}`;

  const params = new URLSearchParams();

  // Add tracking parameters
  if (config.tracking) {
    const { utmSource, utmMedium, utmCampaign, utmTerm, utmContent, customParams } =
      config.tracking;

    if (utmSource) params.append('utm_source', utmSource);
    if (utmMedium) params.append('utm_medium', utmMedium);
    if (utmCampaign) params.append('utm_campaign', utmCampaign);
    if (utmTerm) params.append('utm_term', utmTerm);
    if (utmContent) params.append('utm_content', utmContent);

    // Add custom parameters
    if (customParams) {
      Object.entries(customParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }
  }

  // Add embed-specific parameters
  if (config.embedOptions.theme && config.embedOptions.theme !== 'auto') {
    params.append('theme', config.embedOptions.theme);
  }

  params.append('embed', 'true');

  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}

/**
 * Generates iframe embed code with responsive design and modern features
 */
export function generateIframeEmbed(config: EmbedConfig): string {
  const { embedOptions } = config;
  const formUrl = generateFormUrl(config);

  const width = embedOptions.width || '100%';
  const height = embedOptions.height || '600px';
  const backgroundColor = embedOptions.backgroundColor || 'transparent';
  const borderRadius = embedOptions.borderRadius || 0;
  const padding = embedOptions.padding || 0;

  const iframeStyle = [
    `width: ${typeof width === 'number' ? width + 'px' : width}`,
    `height: ${typeof height === 'number' ? height + 'px' : height}`,
    `border: none`,
    `background-color: ${backgroundColor}`,
    borderRadius ? `border-radius: ${borderRadius}px` : '',
    padding ? `padding: ${padding}px` : '',
    `display: block`,
    `max-width: 100%`,
  ]
    .filter(Boolean)
    .join('; ');

  const containerStyle = embedOptions.responsive
    ? [
        `position: relative`,
        `width: 100%`,
        `max-width: ${typeof width === 'number' ? width + 'px' : width}`,
      ].join('; ')
    : '';

  let embedCode = '';

  if (embedOptions.responsive) {
    embedCode += `<div style="${containerStyle}">\n  `;
  }

  embedCode += `<iframe
  src="${formUrl}"
  style="${iframeStyle}"
  title="ArvaForm - ${config.slug}"
  frameborder="0"
  scrolling="auto"
  allowfullscreen
  ${embedOptions.lazyLoad ? 'loading="lazy"' : ''}
  ${embedOptions.autoResize ? 'data-auto-resize="true"' : ''}
></iframe>`;

  if (embedOptions.responsive) {
    embedCode += `\n</div>`;
  }

  // Add auto-resize script if enabled
  if (embedOptions.autoResize) {
    embedCode += `

<script>
  // Auto-resize iframe based on content
  (function() {
    const iframe = document.querySelector('iframe[data-auto-resize="true"]');
    if (!iframe) return;

    const resizeIframe = () => {
      try {
        const content = iframe.contentDocument || iframe.contentWindow.document;
        const height = content.documentElement.scrollHeight;
        iframe.style.height = height + 'px';
      } catch (e) {
        // Cross-origin restrictions - use postMessage
        iframe.contentWindow.postMessage({ type: 'getHeight' }, '*');
      }
    };

    // Listen for height updates from form
    window.addEventListener('message', (event) => {
      if (event.data.type === 'resize' && event.data.height) {
        iframe.style.height = event.data.height + 'px';
      }
    });

    iframe.addEventListener('load', resizeIframe);

    // Periodic check for content changes
    let lastHeight = 0;
    setInterval(() => {
      try {
        const content = iframe.contentDocument || iframe.contentWindow.document;
        const currentHeight = content.documentElement.scrollHeight;
        if (currentHeight !== lastHeight) {
          iframe.style.height = currentHeight + 'px';
          lastHeight = currentHeight;
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 1000);
  })();
</script>`;
  }

  return embedCode;
}

/**
 * Generates JavaScript widget embed code with async loading
 */
export function generateJavaScriptEmbed(config: EmbedConfig): string {
  const { embedOptions } = config;
  const formUrl = generateFormUrl(config);

  const widgetId = `arvaform-widget-${config.formId}`;
  const width = embedOptions.width || '100%';
  const height = embedOptions.height || '600px';

  return `<!-- ArvaForm Widget -->
<div id="${widgetId}" style="width: ${typeof width === 'number' ? width + 'px' : width}; min-height: ${typeof height === 'number' ? height + 'px' : height};"></div>

<script>
(function() {
  'use strict';

  const widgetConfig = {
    formUrl: '${formUrl}',
    containerId: '${widgetId}',
    width: '${width}',
    height: '${height}',
    theme: '${embedOptions.theme || 'auto'}',
    autoResize: ${embedOptions.autoResize || false},
    lazyLoad: ${embedOptions.lazyLoad || false},
    backgroundColor: '${embedOptions.backgroundColor || 'transparent'}',
    borderRadius: ${embedOptions.borderRadius || 0},
    padding: ${embedOptions.padding || 0}
  };

  // Create iframe with enhanced features
  function createWidget() {
    const container = document.getElementById(widgetConfig.containerId);
    if (!container) {
      console.error('ArvaForm: Container element not found');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = widgetConfig.formUrl;
    iframe.style.cssText = [
      \`width: \${widgetConfig.width}\`,
      \`height: \${widgetConfig.height}\`,
      \`border: none\`,
      \`background-color: \${widgetConfig.backgroundColor}\`,
      \`border-radius: \${widgetConfig.borderRadius}px\`,
      \`padding: \${widgetConfig.padding}px\`,
      \`display: block\`,
      \`max-width: 100%\`
    ].join('; ');

    iframe.setAttribute('title', 'ArvaForm Widget');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'auto');
    iframe.setAttribute('allowfullscreen', '');

    if (widgetConfig.lazyLoad) {
      iframe.setAttribute('loading', 'lazy');
    }

    // Auto-resize functionality
    if (widgetConfig.autoResize) {
      const resizeObserver = new ResizeObserver(() => {
        try {
          const content = iframe.contentDocument || iframe.contentWindow.document;
          const height = content.documentElement.scrollHeight;
          iframe.style.height = height + 'px';
        } catch (e) {
          // Cross-origin - use postMessage
          iframe.contentWindow.postMessage({ type: 'getHeight' }, '*');
        }
      });

      iframe.addEventListener('load', () => {
        resizeObserver.observe(iframe);
      });

      // Listen for resize messages
      window.addEventListener('message', (event) => {
        if (event.source === iframe.contentWindow && event.data.type === 'resize') {
          iframe.style.height = event.data.height + 'px';
        }
      });
    }

    container.appendChild(iframe);

    // Dispatch widget loaded event
    container.dispatchEvent(new CustomEvent('arvaform:loaded', {
      detail: { formId: '${config.formId}', widgetId: '${widgetId}' }
    }));
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
</script>`;
}

/**
 * Generates popup modal embed code with trigger options
 */
export function generatePopupEmbed(config: EmbedConfig): string {
  const { embedOptions, popupOptions } = config;
  const formUrl = generateFormUrl(config);

  if (!popupOptions) {
    throw new Error('Popup options are required for popup embed type');
  }

  const modalId = `arvaform-modal-${config.formId}`;
  const triggerId = `arvaform-trigger-${config.formId}`;

  const buttonText = popupOptions.buttonText || 'Open Form';
  const buttonStyle =
    popupOptions.buttonStyle ||
    `
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  `;

  return `<!-- ArvaForm Popup -->
<button id="${triggerId}" style="${buttonStyle}" onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'">
  ${buttonText}
</button>

<div id="${modalId}" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; padding: 20px; box-sizing: border-box;">
  <div style="position: relative; max-width: ${embedOptions.width || '800px'}; max-height: 90vh; margin: 2% auto; background: white; border-radius: ${embedOptions.borderRadius || 12}px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
    <button onclick="document.getElementById('${modalId}').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; z-index: 10; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,0.1);">×</button>
    <iframe
      src="${formUrl}"
      style="width: 100%; height: ${embedOptions.height || '600px'}; border: none; display: block;"
      title="ArvaForm Modal"
      frameborder="0"
      scrolling="auto"
      allowfullscreen
    ></iframe>
  </div>
</div>

<script>
(function() {
  'use strict';

  const modal = document.getElementById('${modalId}');
  const trigger = document.getElementById('${triggerId}');

  // Trigger configurations
  const triggerType = '${popupOptions.trigger || 'click'}';
  const delay = ${popupOptions.delay || 0};
  const scrollPercent = ${popupOptions.scrollPercent || 50};

  let triggered = false;

  function showModal() {
    if (triggered) return;
    triggered = true;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility
    const iframe = modal.querySelector('iframe');
    if (iframe) {
      iframe.focus();
    }

    // Dispatch event
    modal.dispatchEvent(new CustomEvent('arvaform:opened', {
      detail: { formId: '${config.formId}', trigger: triggerType }
    }));
  }

  function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    triggered = false;

    // Return focus to trigger
    if (trigger) {
      trigger.focus();
    }

    // Dispatch event
    modal.dispatchEvent(new CustomEvent('arvaform:closed', {
      detail: { formId: '${config.formId}' }
    }));
  }

  // Click trigger
  if (triggerType === 'click') {
    trigger.addEventListener('click', showModal);
  }

  // Time trigger
  if (triggerType === 'time') {
    setTimeout(showModal, delay);
  }

  // Scroll trigger
  if (triggerType === 'scroll') {
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrolled >= scrollPercent) {
        showModal();
      }
    });
  }

  // Exit intent trigger
  if (triggerType === 'exit') {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) {
        showModal();
      }
    });
  }

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      hideModal();
    }
  });

  // Prevent body scroll when modal is open
  modal.addEventListener('wheel', (e) => {
    e.stopPropagation();
  });
})();
</script>`;
}

/**
 * Generates direct link with tracking parameters
 */
export function generateDirectLink(config: EmbedConfig): string {
  return generateFormUrl(config);
}

/**
 * Main embed code generator function
 */
export function generateEmbedCode(config: EmbedConfig): string {
  switch (config.type) {
    case 'iframe':
      return generateIframeEmbed(config);
    case 'javascript':
      return generateJavaScriptEmbed(config);
    case 'popup':
      return generatePopupEmbed(config);
    case 'direct':
      return generateDirectLink(config);
    default:
      throw new Error(`Unsupported embed type: ${config.type}`);
  }
}

/**
 * Validates embed configuration
 */
export function validateEmbedConfig(config: Partial<EmbedConfig>): string[] {
  const errors: string[] = [];

  if (!config.formId) {
    errors.push('Form ID is required');
  }

  if (!config.slug) {
    errors.push('Form slug is required');
  }

  if (!config.type) {
    errors.push('Embed type is required');
  } else if (!['iframe', 'javascript', 'popup', 'direct'].includes(config.type)) {
    errors.push('Invalid embed type');
  }

  if (config.type === 'popup' && !config.popupOptions) {
    errors.push('Popup options are required for popup embed type');
  }

  return errors;
}

/**
 * Generates embed code with error handling
 */
export function safeGenerateEmbedCode(config: Partial<EmbedConfig>): {
  code?: string;
  errors: string[];
} {
  const errors = validateEmbedConfig(config);

  if (errors.length > 0) {
    return { errors };
  }

  try {
    const code = generateEmbedCode(config as EmbedConfig);
    return { code, errors: [] };
  } catch (error) {
    return { errors: [error instanceof Error ? error.message : 'Unknown error occurred'] };
  }
}
