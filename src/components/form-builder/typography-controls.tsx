'use client';

/**
 * Typography Controls - ArvaForm 2025
 * Font family, size, weight, and spacing controls
 */

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
import { TypographyTokens } from '@/types/theme.types';
import { Type } from 'lucide-react';
import { useCallback } from 'react';

interface TypographyControlsProps {
  typography: TypographyTokens;
  onChange: (typography: TypographyTokens) => void;
}

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
];

export function TypographyControls({ typography, onChange }: TypographyControlsProps) {
  const updateFontFamily = useCallback(
    (type: keyof TypographyTokens['fontFamily'], value: string) => {
      onChange({
        ...typography,
        fontFamily: {
          ...typography.fontFamily,
          [type]: value,
        },
      });
    },
    [typography, onChange],
  );

  const updateFontSize = useCallback(
    (size: keyof TypographyTokens['fontSize'], value: string) => {
      onChange({
        ...typography,
        fontSize: {
          ...typography.fontSize,
          [size]: value,
        },
      });
    },
    [typography, onChange],
  );

  const updateFontWeight = useCallback(
    (weight: keyof TypographyTokens['fontWeight'], value: number) => {
      onChange({
        ...typography,
        fontWeight: {
          ...typography.fontWeight,
          [weight]: value,
        },
      });
    },
    [typography, onChange],
  );

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Families
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Primary Font</Label>
            <Select
              value={typography.fontFamily.primary}
              onValueChange={(value) => updateFontFamily('primary', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Secondary Font</Label>
            <Select
              value={typography.fontFamily.secondary}
              onValueChange={(value) => updateFontFamily('secondary', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Monospace Font</Label>
            <Select
              value={typography.fontFamily.mono}
              onValueChange={(value) => updateFontFamily('mono', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.filter((font) => font.value.includes('mono')).map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Font Sizes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Font Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(typography.fontSize).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <Label className="text-xs capitalize">{size}</Label>
                <Input
                  value={value}
                  onChange={(e) =>
                    updateFontSize(size as keyof TypographyTokens['fontSize'], e.target.value)
                  }
                  placeholder="1rem"
                  className="text-xs"
                />
                <div
                  className="text-center p-2 bg-muted rounded text-xs"
                  style={{ fontSize: value }}>
                  Sample Text
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Font Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(typography.fontWeight).map(([weight, value]) => (
              <div key={weight} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs capitalize">{weight}</Label>
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={([newValue]) => {
                    if (newValue !== undefined) {
                      updateFontWeight(weight as keyof TypographyTokens['fontWeight'], newValue);
                    }
                  }}
                  min={100}
                  max={900}
                  step={100}
                  className="w-full"
                />
                <div
                  className="text-center p-2 bg-muted rounded text-sm"
                  style={{ fontWeight: value }}>
                  Sample Text ({value})
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Height & Letter Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Text Spacing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Line Height</Label>
              {Object.entries(typography.lineHeight).map(([key, value]) => (
                <div key={key} className="mt-2">
                  <Label className="text-xs capitalize text-muted-foreground">{key}</Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      onChange({
                        ...typography,
                        lineHeight: {
                          ...typography.lineHeight,
                          [key]: parseFloat(e.target.value),
                        },
                      })
                    }
                    step="0.1"
                    className="text-xs"
                  />
                </div>
              ))}
            </div>

            <div>
              <Label className="text-xs">Letter Spacing</Label>
              {Object.entries(typography.letterSpacing).map(([key, value]) => (
                <div key={key} className="mt-2">
                  <Label className="text-xs capitalize text-muted-foreground">{key}</Label>
                  <Input
                    value={value}
                    onChange={(e) =>
                      onChange({
                        ...typography,
                        letterSpacing: {
                          ...typography.letterSpacing,
                          [key]: e.target.value,
                        },
                      })
                    }
                    placeholder="0em"
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
