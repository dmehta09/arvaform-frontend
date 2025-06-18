/**
 * Styling Options Form Component - 2025 Edition
 * Component for visual customization with color pickers,
 * typography controls, and real-time preview
 */

'use client';

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
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Code, Eye, Layout, Palette, RotateCcw, Type } from 'lucide-react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * Props for StylingOptionsForm
 */
interface StylingOptionsFormProps {
  /** Callback when a single property changes */
  onPropertyChange: (property: string, value: unknown) => void;
  /** Callback when multiple properties change */
  onPropertiesChange: (properties: Record<string, unknown>) => void;
  /** Whether to enable real-time preview */
  enableRealTimePreview?: boolean;
}

/**
 * Color presets for quick selection
 */
const COLOR_PRESETS = {
  background: [
    '#ffffff',
    '#f8f9fa',
    '#e9ecef',
    '#dee2e6',
    '#f1f3f4',
    '#fff3cd',
    '#d4edda',
    '#d1ecf1',
  ],
  text: ['#000000', '#212529', '#495057', '#6c757d', '#343a40', '#721c24', '#155724', '#0c5460'],
  border: ['#ced4da', '#adb5bd', '#6c757d', '#495057', '#dee2e6', '#ffc107', '#28a745', '#17a2b8'],
};

/**
 * StylingOptionsForm Component
 */
export function StylingOptionsForm({
  onPropertyChange,
  onPropertiesChange,
  enableRealTimePreview = true,
}: StylingOptionsFormProps) {
  const { watch } = useFormContext();

  // Watch form values
  const watchedValues = watch();

  /**
   * Handle color change
   */
  const handleColorChange = useCallback(
    (property: string, color: string) => {
      onPropertyChange(property, color);
    },
    [onPropertyChange],
  );

  /**
   * Handle preset color selection
   */
  const handlePresetColor = useCallback(
    (property: string, color: string) => {
      onPropertyChange(property, color);
    },
    [onPropertyChange],
  );

  /**
   * Handle slider change
   */
  const handleSliderChange = useCallback(
    (property: string, value: number[]) => {
      onPropertyChange(property, value[0]);
    },
    [onPropertyChange],
  );

  /**
   * Handle select change
   */
  const handleSelectChange = useCallback(
    (property: string, value: string) => {
      onPropertyChange(property, value);
    },
    [onPropertyChange],
  );

  /**
   * Reset to default styles
   */
  const resetToDefaults = useCallback(() => {
    const defaultStyles = {
      backgroundColor: '#ffffff',
      textColor: '#212529',
      borderColor: '#ced4da',
      borderWidth: 1,
      borderRadius: 4,
      fontSize: 'base',
      fontWeight: 'normal',
      padding: 'md',
      margin: 'md',
    };
    onPropertiesChange(defaultStyles);
  }, [onPropertiesChange]);

  /**
   * Render color picker section
   */
  const renderColorPicker = useCallback(
    (property: string, label: string, presets: string[]) => {
      const currentValue = watchedValues[property] || '#ffffff';

      return (
        <div className="space-y-3">
          <Label className="text-sm font-medium">{label}</Label>

          {/* Color Input */}
          <div className="flex gap-2">
            <div className="relative">
              <Input
                type="color"
                value={currentValue}
                onChange={(e) => handleColorChange(property, e.target.value)}
                className="w-12 h-9 p-1 border rounded cursor-pointer"
              />
            </div>
            <Input
              value={currentValue}
              onChange={(e) => handleColorChange(property, e.target.value)}
              placeholder="#ffffff"
              className="flex-1 font-mono text-sm"
            />
          </div>

          {/* Color Presets */}
          <div className="grid grid-cols-8 gap-1">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handlePresetColor(property, color)}
                className={cn(
                  'w-6 h-6 rounded border-2 cursor-pointer transition-all hover:scale-110',
                  currentValue === color ? 'border-primary' : 'border-muted',
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      );
    },
    [watchedValues, handleColorChange, handlePresetColor],
  );

  return (
    <div className="space-y-4">
      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderColorPicker('backgroundColor', 'Background Color', COLOR_PRESETS.background)}
          {renderColorPicker('textColor', 'Text Color', COLOR_PRESETS.text)}
          {renderColorPicker('borderColor', 'Border Color', COLOR_PRESETS.border)}
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-4 w-4" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Size</Label>
            <Select
              value={watchedValues.fontSize || 'base'}
              onValueChange={(value) => handleSelectChange('fontSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xs">Extra Small (12px)</SelectItem>
                <SelectItem value="sm">Small (14px)</SelectItem>
                <SelectItem value="base">Base (16px)</SelectItem>
                <SelectItem value="lg">Large (18px)</SelectItem>
                <SelectItem value="xl">Extra Large (20px)</SelectItem>
                <SelectItem value="2xl">2X Large (24px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Weight</Label>
            <Select
              value={watchedValues.fontWeight || 'normal'}
              onValueChange={(value) => handleSelectChange('fontWeight', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light (300)</SelectItem>
                <SelectItem value="normal">Normal (400)</SelectItem>
                <SelectItem value="medium">Medium (500)</SelectItem>
                <SelectItem value="semibold">Semi Bold (600)</SelectItem>
                <SelectItem value="bold">Bold (700)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Layout & Spacing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-4 w-4" />
            Layout & Spacing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Border Width */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Border Width</Label>
              <span className="text-sm text-muted-foreground">
                {watchedValues.borderWidth || 1}px
              </span>
            </div>
            <Slider
              value={[watchedValues.borderWidth || 1]}
              onValueChange={(value) => handleSliderChange('borderWidth', value)}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Border Radius</Label>
              <span className="text-sm text-muted-foreground">
                {watchedValues.borderRadius || 4}px
              </span>
            </div>
            <Slider
              value={[watchedValues.borderRadius || 4]}
              onValueChange={(value) => handleSliderChange('borderRadius', value)}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Padding */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Padding</Label>
            <Select
              value={watchedValues.padding || 'md'}
              onValueChange={(value) => handleSelectChange('padding', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (0px)</SelectItem>
                <SelectItem value="sm">Small (8px)</SelectItem>
                <SelectItem value="md">Medium (12px)</SelectItem>
                <SelectItem value="lg">Large (16px)</SelectItem>
                <SelectItem value="xl">Extra Large (20px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Margin */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Margin</Label>
            <Select
              value={watchedValues.margin || 'md'}
              onValueChange={(value) => handleSelectChange('margin', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (0px)</SelectItem>
                <SelectItem value="sm">Small (8px)</SelectItem>
                <SelectItem value="md">Medium (12px)</SelectItem>
                <SelectItem value="lg">Large (16px)</SelectItem>
                <SelectItem value="xl">Extra Large (20px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="h-4 w-4" />
            Custom CSS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional CSS</Label>
            <Textarea
              value={watchedValues.customCSS || ''}
              onChange={(e) => onPropertyChange('customCSS', e.target.value)}
              placeholder="/* Add custom CSS styles */&#10;border: 2px solid blue;&#10;box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS properties. Use standard CSS syntax.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetToDefaults} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Preview Helper */}
      {enableRealTimePreview && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Real-time Preview Active</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Changes are automatically applied to the element in the canvas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Display name for React DevTools
 */
StylingOptionsForm.displayName = 'StylingOptionsForm';
