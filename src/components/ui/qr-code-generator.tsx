'use client';

/**
 * QR Code Generator Component for ArvaForm
 *
 * Modern QR code generation with canvas rendering and customization options.
 * Features:
 * - Canvas-based QR code generation using proper QR code library
 * - Customizable colors, sizes, and error correction
 * - Download and copy functionality
 * - Responsive design with accessibility
 * - Progressive enhancement with fallbacks
 *
 * Following 2025 React patterns and best practices
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { copyToClipboard } from '@/lib/sharing/social-templates';
import { Copy, Download, Palette, RefreshCw } from 'lucide-react';
import * as QRCode from 'qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface QRCodeConfig {
  data: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  format: 'png' | 'jpg' | 'svg';
  quality: number;
}

export interface QRCodeGeneratorProps {
  initialData?: string;
  onGenerate?: (config: QRCodeConfig, dataUrl: string) => void;
  showCustomization?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Generates QR code using the proper QR code library
 */
async function generateQRCodeToCanvas(
  canvas: HTMLCanvasElement,
  data: string,
  config: QRCodeConfig,
): Promise<void> {
  try {
    await QRCode.toCanvas(canvas, data, {
      errorCorrectionLevel: config.errorCorrectionLevel,
      width: config.size,
      margin: Math.floor(config.margin / 10), // QR code library expects margin in modules
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Main QR Code Generator Component
 */
export function QRCodeGenerator({
  initialData = '',
  onGenerate,
  showCustomization = true,
  compact = false,
  className = '',
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<QRCodeConfig>({
    data: initialData,
    size: 256,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 20,
    format: 'png',
    quality: 0.92,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  /**
   * Generates QR code and renders to canvas
   */
  const generateQRCode = useCallback(async () => {
    if (!config.data.trim()) {
      setError('Please enter data to generate QR code');
      return;
    }

    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate QR code directly to canvas using proper library
      await generateQRCodeToCanvas(canvasRef.current, config.data, config);

      // Convert to data URL
      const newDataUrl = canvasRef.current.toDataURL(`image/${config.format}`, config.quality);
      setDataUrl(newDataUrl);

      // Callback for parent component
      if (onGenerate) {
        onGenerate(config, newDataUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [config, onGenerate]);

  /**
   * Downloads the generated QR code
   */
  const downloadQRCode = useCallback(() => {
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.${config.format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [dataUrl, config.format]);

  /**
   * Copies QR code to clipboard
   */
  const copyQRCode = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        } catch (_err) {
          // Fallback: copy data URL as text
          if (dataUrl) {
            await copyToClipboard(dataUrl);
          }
        }
      });
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  }, [dataUrl]);

  /**
   * Updates configuration
   */
  const updateConfig = useCallback((updates: Partial<QRCodeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Auto-generate when data changes
  useEffect(() => {
    if (config.data.trim()) {
      generateQRCode();
    }
    // Note: generateQRCode is intentionally excluded from dependencies
    // to prevent infinite loops - it's stable enough for this use case
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.data]);

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <Label htmlFor="qr-data">QR Code Data</Label>
          <Input
            id="qr-data"
            placeholder="Enter text or URL..."
            value={config.data}
            onChange={(e) => updateConfig({ data: e.target.value })}
          />
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-sm max-w-full h-auto"
            aria-label="Generated QR Code"
            style={{
              width: Math.min(config.size, 200),
              height: Math.min(config.size, 200),
            }}
          />
        </div>

        {dataUrl && (
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyQRCode}
              className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Data Input */}
        <div className="space-y-2">
          <Label htmlFor="qr-data-full">QR Code Data</Label>
          <Input
            id="qr-data-full"
            placeholder="Enter text, URL, or any data..."
            value={config.data}
            onChange={(e) => updateConfig({ data: e.target.value })}
          />
        </div>

        {/* QR Code Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="flex justify-center p-4 border-2 border-dashed rounded-lg bg-muted/20">
            <canvas
              ref={canvasRef}
              className="border rounded-lg shadow-sm"
              aria-label="Generated QR Code Preview"
              style={{
                width: Math.min(config.size, 300),
                height: Math.min(config.size, 300),
              }}
            />
          </div>
        </div>

        {/* Actions */}
        {dataUrl && (
          <div className="flex gap-2 justify-center">
            <Button onClick={downloadQRCode} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={copyQRCode} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={generateQRCode}
              disabled={isGenerating}
              className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        )}

        {/* Customization Panel */}
        {showCustomization && (
          <>
            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Customization</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="qr-size">Size: {config.size}px</Label>
                  <Slider
                    id="qr-size"
                    min={128}
                    max={512}
                    step={32}
                    value={[config.size]}
                    onValueChange={([value]) => updateConfig({ size: value })}
                  />
                </div>

                {/* Error Correction */}
                <div className="space-y-2">
                  <Label htmlFor="qr-error-correction">Error Correction</Label>
                  <Select
                    value={config.errorCorrectionLevel}
                    onValueChange={(value: 'L' | 'M' | 'Q' | 'H') =>
                      updateConfig({ errorCorrectionLevel: value })
                    }>
                    <SelectTrigger id="qr-error-correction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Foreground Color */}
                <div className="space-y-2">
                  <Label htmlFor="qr-fg-color">Foreground Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qr-fg-color"
                      type="color"
                      value={config.foregroundColor}
                      onChange={(e) => updateConfig({ foregroundColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.foregroundColor}
                      onChange={(e) => updateConfig({ foregroundColor: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <Label htmlFor="qr-bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qr-bg-color"
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Margin */}
                <div className="space-y-2">
                  <Label htmlFor="qr-margin">Margin: {config.margin}px</Label>
                  <Slider
                    id="qr-margin"
                    min={0}
                    max={50}
                    step={5}
                    value={[config.margin]}
                    onValueChange={([value]) => updateConfig({ margin: value })}
                  />
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <Label htmlFor="qr-format">Format</Label>
                  <Select
                    value={config.format}
                    onValueChange={(value: 'png' | 'jpg' | 'svg') =>
                      updateConfig({ format: value })
                    }>
                    <SelectTrigger id="qr-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPEG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        {config.data && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{config.data.length} characters</Badge>
            <Badge variant="secondary">{config.errorCorrectionLevel} error correction</Badge>
            <Badge variant="secondary">
              {config.size}×{config.size}px
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QRCodeGenerator;
