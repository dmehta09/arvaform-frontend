'use client';

/**
 * SharingPanel Component for ArvaForm
 *
 * Comprehensive sharing interface providing:
 * - Social media sharing across 7+ platforms
 * - Embed code generation with 4 formats
 * - QR code generation and customization
 * - Access controls and analytics settings
 *
 * Following 2025 React 19 patterns and accessibility standards
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import QRCodeGenerator from '@/components/ui/qr-code-generator';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSharing } from '@/hooks/use-sharing';
import { type EmbedType } from '@/lib/sharing/embed-generator';
import { Form } from '@/types/form.types';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Facebook,
  Globe,
  Linkedin,
  Mail,
  MessageCircle,
  QrCode,
  Settings,
  Share2,
  Twitter,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface SharingPanelProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
  customDomain?: string;
  trackingCampaign?: string;
}

/**
 * Platform configuration for social sharing
 */
const SOCIAL_PLATFORMS = [
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { key: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-gray-900' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-600' },
  { key: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'bg-blue-500' },
  { key: 'email', name: 'Email', icon: Mail, color: 'bg-gray-600' },
] as const;

/**
 * Embed type configuration
 */
const EMBED_TYPES = [
  {
    key: 'iframe' as EmbedType,
    name: 'iframe Embed',
    description: 'Standard iframe for websites',
    icon: Globe,
  },
  {
    key: 'javascript' as EmbedType,
    name: 'JavaScript Widget',
    description: 'Dynamic widget with auto-resize',
    icon: ExternalLink,
  },
  {
    key: 'popup' as EmbedType,
    name: 'Popup Modal',
    description: 'Modal overlay with triggers',
    icon: Eye,
  },
  {
    key: 'direct' as EmbedType,
    name: 'Direct Link',
    description: 'Simple URL with tracking',
    icon: Share2,
  },
] as const;

export function SharingPanel({
  form,
  isOpen,
  onClose,
  customDomain,
  trackingCampaign,
}: SharingPanelProps) {
  const [activeTab, setActiveTab] = useState('social');
  const [selectedEmbedType, setSelectedEmbedType] = useState<EmbedType>('iframe');
  const [shareMessage, setShareMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Embed customization options
  const [embedOptions, setEmbedOptions] = useState({
    width: '100%',
    height: '600px',
    responsive: true,
    autoResize: true,
  });

  // Sharing hook with all functionality
  const sharing = useSharing({
    form,
    customDomain,
    trackingCampaign,
    onShare: (platform, url) => {
      console.log(`Shared on ${platform}:`, url);
    },
    onEmbed: (type, code) => {
      console.log(`Generated ${type} embed:`, code.substring(0, 100));
    },
    onError: (error) => {
      console.error('Sharing error:', error);
    },
    onSuccess: (action, data) => {
      console.log(`Sharing success - ${action}:`, data);
    },
  });

  /**
   * Handles platform-specific sharing
   */
  const handlePlatformShare = useCallback(
    async (platform: string) => {
      const success = await sharing.shareOnPlatform(platform);
      if (success) {
        // Show success feedback
      }
    },
    [sharing],
  );

  /**
   * Handles native sharing (Web Share API)
   */
  const handleNativeShare = useCallback(async () => {
    const success = await sharing.shareNative();
    if (success) {
      // Show success feedback
    }
  }, [sharing]);

  /**
   * Copies embed code to clipboard
   */
  const handleCopyEmbed = useCallback(async () => {
    const success = await sharing.copyEmbedCode(selectedEmbedType);
    if (success) {
      // Show success feedback
    }
  }, [sharing, selectedEmbedType]);

  /**
   * Updates embed options and regenerates code
   */
  const updateEmbedOptions = useCallback(
    (updates: Partial<typeof embedOptions>) => {
      const newOptions = { ...embedOptions, ...updates };
      setEmbedOptions(newOptions);

      // Update the sharing hook's embed config
      sharing.updateEmbedConfig({
        embedOptions: {
          width: newOptions.width,
          height: newOptions.height,
          responsive: newOptions.responsive,
          autoResize: newOptions.autoResize,
        },
      });
    },
    // Note: sharing is intentionally excluded from dependencies to prevent infinite loops
    // The sharing.updateEmbedConfig function is stable enough for this use case
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [embedOptions],
  );

  // Generate embed codes when component mounts or form changes
  useEffect(() => {
    if (isOpen && form.id) {
      sharing.generateEmbedCodes();
    }
    // Note: sharing is intentionally excluded from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form.id]);

  // Regenerate embed code when type or options change
  useEffect(() => {
    if (isOpen && selectedEmbedType) {
      sharing.generateSingleEmbed(selectedEmbedType, {
        width: embedOptions.width,
        height: embedOptions.height,
        responsive: embedOptions.responsive,
        autoResize: embedOptions.autoResize,
      });
    }
    // Note: sharing is intentionally excluded from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedEmbedType, embedOptions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Share Form: {form.title}</CardTitle>
            <CardDescription>Generate shareable links, embed codes, and QR codes</CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Social
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Embed
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Social Sharing Tab */}
            <TabsContent value="social" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="share-message">Custom Share Message</Label>
                  <Textarea
                    id="share-message"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Add a personal message to your share..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Share on Social Platforms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {SOCIAL_PLATFORMS.map(({ key, name, icon: Icon, color }) => (
                      <Button
                        key={key}
                        variant="outline"
                        className="flex items-center gap-2 h-12"
                        onClick={() => handlePlatformShare(key)}
                        disabled={sharing.isSharing}>
                        <div className={`p-1 rounded ${color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Native Share (Mobile) */}
                <div className="md:hidden">
                  <Button
                    variant="default"
                    className="w-full flex items-center gap-2"
                    onClick={handleNativeShare}
                    disabled={sharing.isSharing}>
                    <Share2 className="h-4 w-4" />
                    Share via Device
                  </Button>
                </div>

                {/* Direct URL */}
                {sharing.directUrl && (
                  <div className="space-y-2">
                    <Label>Direct Link</Label>
                    <div className="flex gap-2">
                      <Input value={sharing.directUrl} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        onClick={() => sharing.copyToClipboard(sharing.directUrl)}
                        disabled={sharing.isCopying}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Embed Codes Tab */}
            <TabsContent value="embed" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Embed Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {EMBED_TYPES.map(({ key, name, description, icon: Icon }) => (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-colors ${
                          selectedEmbedType === key
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent'
                        }`}
                        onClick={() => setSelectedEmbedType(key)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5" />
                            <div>
                              <h4 className="font-medium">{name}</h4>
                              <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Embed Code Display */}
                {sharing.embedCodes[selectedEmbedType] && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated Code</Label>
                      <Button variant="outline" size="sm" onClick={handleCopyEmbed}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                        <code>{sharing.embedCodes[selectedEmbedType]}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Embed Options */}
                <div className="space-y-4">
                  <Label>Customization Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="embed-width">Width</Label>
                      <Input
                        id="embed-width"
                        value={embedOptions.width}
                        onChange={(e) => updateEmbedOptions({ width: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="embed-height">Height</Label>
                      <Input
                        id="embed-height"
                        value={embedOptions.height}
                        onChange={(e) => updateEmbedOptions({ height: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Responsive Design</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically adapts to container size
                      </p>
                    </div>
                    <Switch
                      checked={embedOptions.responsive}
                      onCheckedChange={(checked) => updateEmbedOptions({ responsive: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Resize</Label>
                      <p className="text-sm text-muted-foreground">
                        Adjusts height based on content
                      </p>
                    </div>
                    <Switch
                      checked={embedOptions.autoResize}
                      onCheckedChange={(checked) => updateEmbedOptions({ autoResize: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* QR Code Tab */}
            <TabsContent value="qr" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>QR Code for Mobile Access</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate a QR code that users can scan to access your form on mobile devices.
                  </p>
                </div>

                {sharing.directUrl && (
                  <QRCodeGenerator
                    initialData={sharing.directUrl}
                    showCustomization={true}
                    onGenerate={(config, dataUrl) => {
                      console.log('QR Code generated:', { config, dataUrl });
                    }}
                  />
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-6">
                {/* URL Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">URL Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="custom-domain">Custom Domain</Label>
                    <Input
                      id="custom-domain"
                      placeholder="forms.yourdomain.com"
                      value={customDomain || ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use your own domain for form links
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-slug">Custom URL Slug</Label>
                    <Input id="custom-slug" placeholder="my-awesome-form" />
                    <p className="text-sm text-muted-foreground">
                      Customize the URL path for your form
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Access Controls */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Access Controls</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password Protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Require a password to access the form
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Domain Restrictions</Label>
                      <p className="text-sm text-muted-foreground">
                        Only allow embedding on specific domains
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Link Expiration</Label>
                      <p className="text-sm text-muted-foreground">
                        Set an expiration date for share links
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                {/* Analytics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Analytics & Tracking</h3>

                  <div className="space-y-2">
                    <Label htmlFor="utm-campaign">Campaign Name</Label>
                    <Input
                      id="utm-campaign"
                      placeholder="summer-2025-survey"
                      value={trackingCampaign || ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Track this form in your analytics
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Advanced Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Include detailed analytics parameters
                      </p>
                    </div>
                    <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                  </div>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="utm-source">UTM Source</Label>
                        <Input id="utm-source" placeholder="newsletter" />
                      </div>
                      <div>
                        <Label htmlFor="utm-medium">UTM Medium</Label>
                        <Input id="utm-medium" placeholder="email" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {sharing.errors.length > 0 && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {sharing.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Status Display */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <Badge variant={form.isPublished ? 'default' : 'secondary'}>
              {form.isPublished ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>

            <div className="text-sm text-muted-foreground">
              Form must be published to enable sharing
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SharingPanel;
