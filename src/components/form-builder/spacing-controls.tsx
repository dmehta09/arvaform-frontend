'use client';

/**
 * Spacing Controls - ArvaForm 2025
 * Controls for margins, padding, and element gaps
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpacingTokens } from '@/types/theme.types';
import { Maximize2, Minimize2, Move3D } from 'lucide-react';
import { useCallback, useState } from 'react';

interface SpacingControlsProps {
  spacing: SpacingTokens;
  onChange: (spacing: SpacingTokens) => void;
}

export function SpacingControls({ spacing, onChange }: SpacingControlsProps) {
  const [previewMode, setPreviewMode] = useState(false);

  const updateSpacing = useCallback(
    (key: keyof SpacingTokens, value: string) => {
      onChange({
        ...spacing,
        [key]: value,
      });
    },
    [spacing, onChange],
  );

  const spacingSizes = [
    { key: 'xs' as const, label: 'Extra Small', description: 'Tight spacing' },
    { key: 'sm' as const, label: 'Small', description: 'Compact spacing' },
    { key: 'md' as const, label: 'Medium', description: 'Default spacing' },
    { key: 'lg' as const, label: 'Large', description: 'Comfortable spacing' },
    { key: 'xl' as const, label: 'Extra Large', description: 'Spacious layout' },
    { key: '2xl' as const, label: '2X Large', description: 'Very spacious' },
    { key: '3xl' as const, label: '3X Large', description: 'Maximum spacing' },
    { key: '4xl' as const, label: '4X Large', description: 'Extreme spacing' },
  ];

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Spacing Scale</Label>
        <Button
          variant={previewMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? (
            <Minimize2 className="h-4 w-4 mr-1" />
          ) : (
            <Maximize2 className="h-4 w-4 mr-1" />
          )}
          {previewMode ? 'Hide' : 'Show'} Preview
        </Button>
      </div>

      {/* Spacing Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Move3D className="h-4 w-4" />
            Spacing Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spacingSizes.map(({ key, label, description }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {key}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={spacing[key]}
                    onChange={(e) => updateSpacing(key, e.target.value)}
                    placeholder="1rem"
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Convert current value to rem equivalent
                      const currentPx = parseFloat(spacing[key]) * 16; // assuming 1rem = 16px
                      updateSpacing(key, `${(currentPx / 16).toFixed(2)}rem`);
                    }}>
                    rem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Convert current value to px equivalent
                      const currentRem = parseFloat(spacing[key]);
                      updateSpacing(key, `${Math.round(currentRem * 16)}px`);
                    }}>
                    px
                  </Button>
                </div>

                {/* Visual Preview */}
                {previewMode && (
                  <div className="bg-muted/50 p-4 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="bg-primary/20 border border-primary/40"
                        style={{
                          width: spacing[key],
                          height: '2rem',
                          minWidth: '4px',
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{spacing[key]}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Apply 4px base scale
                const scale = {
                  xs: '0.25rem',
                  sm: '0.5rem',
                  md: '1rem',
                  lg: '1.5rem',
                  xl: '2rem',
                  '2xl': '3rem',
                  '3xl': '4rem',
                  '4xl': '6rem',
                };
                onChange(scale);
              }}>
              4px Scale
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Apply 8px base scale
                const scale = {
                  xs: '0.5rem',
                  sm: '0.75rem',
                  md: '1rem',
                  lg: '1.5rem',
                  xl: '2rem',
                  '2xl': '3rem',
                  '3xl': '4rem',
                  '4xl': '6rem',
                };
                onChange(scale);
              }}>
              8px Scale
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Apply Tailwind default scale
                const scale = {
                  xs: '0.25rem',
                  sm: '0.5rem',
                  md: '1rem',
                  lg: '1.5rem',
                  xl: '2rem',
                  '2xl': '3rem',
                  '3xl': '4rem',
                  '4xl': '6rem',
                };
                onChange(scale);
              }}>
              Tailwind Scale
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Form padding:</span>
              <Badge variant="secondary">md ({spacing.md})</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Element gaps:</span>
              <Badge variant="secondary">sm ({spacing.sm})</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Section margins:</span>
              <Badge variant="secondary">xl ({spacing.xl})</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Button padding:</span>
              <Badge variant="secondary">sm ({spacing.sm})</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
