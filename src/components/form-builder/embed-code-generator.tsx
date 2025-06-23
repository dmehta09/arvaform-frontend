'use client';

/**
 * EmbedCodeGenerator Component for ArvaForm
 *
 * Specialized component for generating and customizing embed codes:
 * - Live preview of embed code rendering
 * - Advanced customization options
 * - Multiple embed types with specific settings
 * - Copy to clipboard with success feedback
 *
 * Following 2025 React 19 patterns and accessibility standards
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSharing } from '@/hooks/use-sharing';
import { type EmbedOptions, type EmbedType } from '@/lib/sharing/embed-generator';
import { Form } from '@/types/form.types';
import {
  CheckCircle2,
  Code,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Monitor,
  Palette,
  RefreshCw,
  Settings,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface EmbedCodeGeneratorProps {
  form: Form;
  initialType?: EmbedType;
  customDomain?: string;
  trackingCampaign?: string;
  onEmbedGenerated?: (type: EmbedType, code: string) => void;
  className?: string;
}

/**
 * Embed type configuration with enhanced metadata
 */
const EMBED_TYPES = [
  {
    key: 'iframe' as EmbedType,
    name: 'iframe Embed',
    description: 'Standard iframe embedding for websites and blogs',
    icon: Globe,
    features: ['Cross-domain compatible', 'Easy implementation', 'Responsive design'],
    useCase: 'Best for websites, blogs, and CMS platforms',
  },
  {
    key: 'javascript' as EmbedType,
    name: 'JavaScript Widget',
    description: 'Dynamic widget with advanced features',
    icon: Code,
    features: ['Auto-resize', 'Theme detection', 'Event callbacks'],
    useCase: 'Best for dynamic websites and web applications',
  },
  {
    key: 'popup' as EmbedType,
    name: 'Popup Modal',
    description: 'Modal overlay with customizable triggers',
    icon: Eye,
    features: ['Multiple triggers', 'Exit intent', 'Mobile optimized'],
    useCase: 'Best for lead generation and engagement',
  },
  {
    key: 'direct' as EmbedType,
    name: 'Direct Link',
    description: 'Simple URL with tracking parameters',
    icon: ExternalLink,
    features: ['UTM tracking', 'Social sharing', 'QR compatible'],
    useCase: 'Best for email campaigns and social media',
  },
] as const;

/**
 * Device preview sizes
 */
const DEVICE_SIZES = [
  { key: 'desktop', name: 'Desktop', icon: Monitor, width: '100%', height: '600px' },
  { key: 'tablet', name: 'Tablet', icon: Tablet, width: '768px', height: '600px' },
  { key: 'mobile', name: 'Mobile', icon: Smartphone, width: '375px', height: '600px' },
] as const;

export function EmbedCodeGenerator({
  form,
  initialType = 'iframe',
  customDomain,
  trackingCampaign,
  onEmbedGenerated,
  className = '',
}: EmbedCodeGeneratorProps) {
  const [selectedType, setSelectedType] = useState<EmbedType>(initialType);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [embedOptions, setEmbedOptions] = useState<EmbedOptions>({
    width: '100%',
    height: '600px',
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 0,
    showBranding: true,
    autoResize: true,
    responsive: true,
    lazyLoad: false,
    theme: 'auto',
  });
  const [copySuccess, setCopySuccess] = useState(false);

  // Sharing hook for embed generation
  const sharing = useSharing({
    form,
    customDomain,
    trackingCampaign,
    onEmbed: (type, code) => {
      onEmbedGenerated?.(type, code);
    },
  });

  /**
   * Updates embed options and regenerates code
   */
  const updateEmbedOptions = useCallback(
    (updates: Partial<EmbedOptions>) => {
      const newOptions = { ...embedOptions, ...updates };
      setEmbedOptions(newOptions);
      sharing.updateEmbedConfig({ embedOptions: newOptions });
    },
    [embedOptions, sharing],
  );

  /**
   * Generates embed code for current configuration
   */
  const generateEmbed = useCallback(async () => {
    const code = await sharing.generateSingleEmbed(selectedType, embedOptions);
    if (code) {
      console.log(`Generated ${selectedType} embed:`, code.substring(0, 100));
    }
  }, [sharing, selectedType, embedOptions]);

  /**
   * Copies embed code to clipboard with feedback
   */
  const copyEmbedCode = useCallback(async () => {
    const success = await sharing.copyEmbedCode(selectedType);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [sharing, selectedType]);

  /**
   * Gets the current device preview size
   */
  const getCurrentDeviceSize = useCallback(() => {
    return DEVICE_SIZES.find((device) => device.key === previewDevice) || DEVICE_SIZES[0];
  }, [previewDevice]);

  // Generate embed codes when component mounts
  useEffect(() => {
    sharing.generateEmbedCodes();
    // Note: sharing is intentionally excluded from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate when type changes
  useEffect(() => {
    generateEmbed();
    // Note: generateEmbed is intentionally excluded from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const currentEmbed = sharing.embedCodes[selectedType];
  const selectedTypeConfig = EMBED_TYPES.find((type) => type.key === selectedType);
  const deviceSize = getCurrentDeviceSize();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Embed Code Generator</h2>
        <p className="text-muted-foreground">
          Generate customizable embed codes for your form with live preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Embed Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Embed Type
              </CardTitle>
              <CardDescription>Choose the embed format that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {EMBED_TYPES.map(({ key, name, description, icon: Icon, features, useCase }) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all ${
                    selectedType === key
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => setSelectedType(key)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{name}</h4>
                          {selectedType === key && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{useCase}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Customization
              </CardTitle>
              <CardDescription>Customize the appearance and behavior of your embed</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={showAdvanced ? 'advanced' : 'basic'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic" onClick={() => setShowAdvanced(false)}>
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="advanced" onClick={() => setShowAdvanced(true)}>
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="embed-gen-width">Width</Label>
                      <Input
                        id="embed-gen-width"
                        value={embedOptions.width || ''}
                        onChange={(e) => updateEmbedOptions({ width: e.target.value })}
                        placeholder="100%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="embed-gen-height">Height</Label>
                      <Input
                        id="embed-gen-height"
                        value={embedOptions.height || ''}
                        onChange={(e) => updateEmbedOptions({ height: e.target.value })}
                        placeholder="600px"
                      />
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <Label htmlFor="embed-gen-theme">Theme</Label>
                    <Select
                      value={embedOptions.theme || 'auto'}
                      onValueChange={(value: 'light' | 'dark' | 'auto') =>
                        updateEmbedOptions({ theme: value })
                      }>
                      <SelectTrigger id="embed-gen-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Follow system)</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Responsive Options */}
                  <div className="space-y-4">
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
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  {/* Background */}
                  <div>
                    <Label htmlFor="embed-gen-bg-color">Background Color</Label>
                    <Input
                      id="embed-gen-bg-color"
                      value={embedOptions.backgroundColor || ''}
                      onChange={(e) => updateEmbedOptions({ backgroundColor: e.target.value })}
                      placeholder="transparent"
                    />
                  </div>

                  {/* Border Radius */}
                  <div>
                    <Label htmlFor="embed-gen-border-radius">Border Radius (px)</Label>
                    <Input
                      id="embed-gen-border-radius"
                      type="number"
                      value={embedOptions.borderRadius || 0}
                      onChange={(e) =>
                        updateEmbedOptions({ borderRadius: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  {/* Padding */}
                  <div>
                    <Label htmlFor="embed-gen-padding">Padding (px)</Label>
                    <Input
                      id="embed-gen-padding"
                      type="number"
                      value={embedOptions.padding || 0}
                      onChange={(e) =>
                        updateEmbedOptions({ padding: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Branding</Label>
                        <p className="text-sm text-muted-foreground">Display ArvaForm branding</p>
                      </div>
                      <Switch
                        checked={embedOptions.showBranding}
                        onCheckedChange={(checked) => updateEmbedOptions({ showBranding: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lazy Loading</Label>
                        <p className="text-sm text-muted-foreground">Load form only when visible</p>
                      </div>
                      <Switch
                        checked={embedOptions.lazyLoad}
                        onCheckedChange={(checked) => updateEmbedOptions({ lazyLoad: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Code Panel */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>See how your embed will look</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {DEVICE_SIZES.map(({ key, name, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={previewDevice === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice(key)}>
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div
                  className="mx-auto bg-white dark:bg-gray-900 border rounded shadow-sm overflow-hidden"
                  style={{
                    width: deviceSize.width,
                    maxWidth: '100%',
                    height: deviceSize.height,
                  }}>
                  {currentEmbed ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Globe className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">
                        Preview for {selectedTypeConfig?.name}
                        <br />
                        <span className="text-xs">
                          {deviceSize.width} × {deviceSize.height}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p className="text-sm">Generating embed code...</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Generated Code
                  </CardTitle>
                  <CardDescription>Copy and paste this code into your website</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmbedCode}
                  disabled={!currentEmbed || sharing.isCopying}>
                  {copySuccess ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copySuccess ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentEmbed ? (
                <div className="relative">
                  <Textarea
                    value={currentEmbed}
                    readOnly
                    className="font-mono text-sm min-h-[200px] resize-none"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedTypeConfig?.name}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2" />
                  <p>Select an embed type to generate code</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          {selectedTypeConfig && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implementation Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="font-medium">How to use this {selectedTypeConfig.name}:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {selectedType === 'iframe' && (
                      <>
                        <li>Copy the iframe code above</li>
                        <li>Paste it into your HTML where you want the form to appear</li>
                        <li>The form will load automatically when the page loads</li>
                      </>
                    )}
                    {selectedType === 'javascript' && (
                      <>
                        <li>Copy the JavaScript widget code above</li>
                        <li>Paste it into your HTML where you want the form to appear</li>
                        <li>The widget will load asynchronously and auto-resize</li>
                      </>
                    )}
                    {selectedType === 'popup' && (
                      <>
                        <li>Copy the popup modal code above</li>
                        <li>Paste it anywhere in your HTML body</li>
                        <li>Customize the trigger button text and styling as needed</li>
                      </>
                    )}
                    {selectedType === 'direct' && (
                      <>
                        <li>Copy the direct link above</li>
                        <li>Use it in emails, social media, or as a regular hyperlink</li>
                        <li>All analytics tracking is included automatically</li>
                      </>
                    )}
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Display */}
      {sharing.errors.length > 0 && (
        <Alert>
          <AlertDescription>
            {sharing.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default EmbedCodeGenerator;
