'use client';

import { Button } from '@/components/ui/button';
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
import { validateStylingProperties } from '@/lib/property-forms/property-validations';
import type { ElementStyling } from '@/types/form-builder.types';
import { Layout, Palette, Sliders, Square, Type } from 'lucide-react';
import { useCallback, useState } from 'react';
import { PropertySection } from '../element-properties';

interface StylingPropertiesFormProps {
  elementId: string;
  styling: ElementStyling;
  onStylingChange: (styling: ElementStyling) => void;
}

/**
 * Form component for editing element styling properties
 */
export function StylingPropertiesForm({
  styling,
  onStylingChange,
}: Omit<StylingPropertiesFormProps, 'elementId'>) {
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  // Validate styling properties
  const validationResult = validateStylingProperties(styling as Record<string, unknown>);

  const handleStyleChange = useCallback(
    (property: keyof ElementStyling, value: unknown) => {
      const updatedStyling = {
        ...styling,
        [property]: value,
      };
      onStylingChange(updatedStyling);
    },
    [styling, onStylingChange],
  );

  const handleSpacingChange = useCallback(
    (
      spacingType: 'margin' | 'padding',
      side: 'top' | 'right' | 'bottom' | 'left',
      value: string,
    ) => {
      const currentSpacing = styling[spacingType] || {};
      const updatedSpacing = {
        ...currentSpacing,
        [side]: value,
      };
      handleStyleChange(spacingType, updatedSpacing);
    },
    [styling, handleStyleChange],
  );

  return (
    <div className="space-y-6">
      {/* Layout & Spacing */}
      <PropertySection
        title="Layout & Spacing"
        description="Control element dimensions and spacing"
        icon={Layout}>
        <div className="space-y-4">
          {/* Width & Height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Width</Label>
              <Input
                placeholder="auto"
                value={styling.width || ''}
                onChange={(e) => handleStyleChange('width', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Height</Label>
              <Input
                placeholder="auto"
                value={styling.height || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
              />
            </div>
          </div>

          {/* Margin */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Margin</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Top"
                value={styling.margin?.top || ''}
                onChange={(e) => handleSpacingChange('margin', 'top', e.target.value)}
              />
              <Input
                placeholder="Right"
                value={styling.margin?.right || ''}
                onChange={(e) => handleSpacingChange('margin', 'right', e.target.value)}
              />
              <Input
                placeholder="Bottom"
                value={styling.margin?.bottom || ''}
                onChange={(e) => handleSpacingChange('margin', 'bottom', e.target.value)}
              />
              <Input
                placeholder="Left"
                value={styling.margin?.left || ''}
                onChange={(e) => handleSpacingChange('margin', 'left', e.target.value)}
              />
            </div>
          </div>

          {/* Padding */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Padding</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Top"
                value={styling.padding?.top || ''}
                onChange={(e) => handleSpacingChange('padding', 'top', e.target.value)}
              />
              <Input
                placeholder="Right"
                value={styling.padding?.right || ''}
                onChange={(e) => handleSpacingChange('padding', 'right', e.target.value)}
              />
              <Input
                placeholder="Bottom"
                value={styling.padding?.bottom || ''}
                onChange={(e) => handleSpacingChange('padding', 'bottom', e.target.value)}
              />
              <Input
                placeholder="Left"
                value={styling.padding?.left || ''}
                onChange={(e) => handleSpacingChange('padding', 'left', e.target.value)}
              />
            </div>
          </div>
        </div>
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography" description="Font and text styling options" icon={Type}>
        <div className="space-y-4">
          {/* Font Size & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Size</Label>
              <Select
                value={styling.fontSize || ''}
                onValueChange={(value) => handleStyleChange('fontSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px (xs)</SelectItem>
                  <SelectItem value="14px">14px (sm)</SelectItem>
                  <SelectItem value="16px">16px (base)</SelectItem>
                  <SelectItem value="18px">18px (lg)</SelectItem>
                  <SelectItem value="20px">20px (xl)</SelectItem>
                  <SelectItem value="24px">24px (2xl)</SelectItem>
                  <SelectItem value="30px">30px (3xl)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Weight</Label>
              <Select
                value={styling.fontWeight || ''}
                onValueChange={(value) => handleStyleChange('fontWeight', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Normal (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semibold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="800">Extrabold (800)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font Family</Label>
            <Select
              value={styling.fontFamily || ''}
              onValueChange={(value) => handleStyleChange('fontFamily', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="system-ui">System UI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Align */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Alignment</Label>
            <Select
              value={styling.textAlign || ''}
              onValueChange={(value) => handleStyleChange('textAlign', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justify">Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PropertySection>

      {/* Colors */}
      <PropertySection
        title="Colors"
        description="Background, text, and border colors"
        icon={Palette}>
        <div className="space-y-4">
          {/* Color Inputs */}
          <div className="space-y-3">
            {[
              { key: 'backgroundColor', label: 'Background Color' },
              { key: 'textColor', label: 'Text Color' },
              { key: 'borderColor', label: 'Border Color' },
              { key: 'focusColor', label: 'Focus Color' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    style={{
                      backgroundColor:
                        (styling[key as keyof ElementStyling] as string) || '#ffffff',
                    }}
                    onClick={() => setColorPickerOpen(key)}
                  />
                  <Input
                    placeholder="#000000"
                    value={(styling[key as keyof ElementStyling] as string) || ''}
                    onChange={(e) => handleStyleChange(key as keyof ElementStyling, e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Common Color Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Colors</Label>
            <div className="grid grid-cols-8 gap-1">
              {[
                '#000000',
                '#ffffff',
                '#ef4444',
                '#22c55e',
                '#3b82f6',
                '#f59e0b',
                '#8b5cf6',
                '#ec4899',
              ].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (colorPickerOpen) {
                      handleStyleChange(colorPickerOpen as keyof ElementStyling, color);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </PropertySection>

      {/* Borders & Effects */}
      <PropertySection
        title="Borders & Effects"
        description="Border styles and visual effects"
        icon={Square}>
        <div className="space-y-4">
          {/* Border Properties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Border Width</Label>
              <Input
                placeholder="1px"
                value={styling.borderWidth || ''}
                onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Border Style</Label>
              <Select
                value={styling.borderStyle || ''}
                onValueChange={(value) => handleStyleChange('borderStyle', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Border Radius</Label>
            <Input
              placeholder="4px"
              value={styling.borderRadius || ''}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            />
          </div>

          {/* Box Shadow */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Box Shadow</Label>
            <Select
              value={styling.boxShadow || ''}
              onValueChange={(value) => handleStyleChange('boxShadow', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shadow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="0 1px 3px rgba(0,0,0,0.1)">Small</SelectItem>
                <SelectItem value="0 4px 6px rgba(0,0,0,0.1)">Medium</SelectItem>
                <SelectItem value="0 10px 15px rgba(0,0,0,0.1)">Large</SelectItem>
                <SelectItem value="0 25px 50px rgba(0,0,0,0.25)">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opacity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Opacity: {Math.round((styling.opacity || 1) * 100)}%
            </Label>
            <Slider
              value={[styling.opacity || 1]}
              onValueChange={(value) => handleStyleChange('opacity', value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </PropertySection>

      {/* Quick Presets */}
      <PropertySection
        title="Style Presets"
        description="Apply common styling patterns"
        icon={Sliders}
        defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onStylingChange({
                ...styling,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#e5e7eb',
                borderRadius: '6px',
                padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
              });
            }}>
            Input Style
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onStylingChange({
                ...styling,
                backgroundColor: '#3b82f6',
                textColor: '#ffffff',
                borderRadius: '6px',
                padding: { top: '8px', right: '16px', bottom: '8px', left: '16px' },
                fontWeight: '600',
              });
            }}>
            Button Style
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onStylingChange({
                ...styling,
                backgroundColor: '#f8fafc',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                padding: { top: '16px', right: '16px', bottom: '16px', left: '16px' },
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              });
            }}>
            Card Style
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onStylingChange({
                width: undefined,
                height: undefined,
                margin: undefined,
                padding: undefined,
                fontSize: undefined,
                fontWeight: undefined,
                fontFamily: undefined,
                textAlign: undefined,
                backgroundColor: undefined,
                textColor: undefined,
                borderColor: undefined,
                focusColor: undefined,
                borderWidth: undefined,
                borderStyle: undefined,
                borderRadius: undefined,
                boxShadow: undefined,
                opacity: undefined,
              });
            }}>
            Reset All
          </Button>
        </div>
      </PropertySection>

      {/* Validation Errors */}
      {!validationResult.isValid && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
          <div className="text-sm font-medium text-destructive mb-2">Styling Issues</div>
          <div className="space-y-1 text-xs text-destructive">
            {Object.entries(validationResult.errors).map(([property, errors]) => (
              <div key={property}>
                <strong>{property}:</strong> {errors.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

StylingPropertiesForm.displayName = 'StylingPropertiesForm';
