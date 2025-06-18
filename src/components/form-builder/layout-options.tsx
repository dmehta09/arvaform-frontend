'use client';

/**
 * Layout Options - ArvaForm 2025
 * Controls for form layout, borders, shadows, and container styles
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BorderTokens, LayoutTokens, ShadowTokens } from '@/types/theme.types';
import { Layout, RectangleHorizontal, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';

interface LayoutOptionsProps {
  layout: LayoutTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  onChange: (tokens: {
    layout?: LayoutTokens;
    borders?: BorderTokens;
    shadows?: ShadowTokens;
  }) => void;
}

export function LayoutOptions({ layout, borders, shadows, onChange }: LayoutOptionsProps) {
  const [activeTab, setActiveTab] = useState('layout');

  const updateLayout = useCallback(
    (updates: Partial<LayoutTokens>) => {
      onChange({ layout: { ...layout, ...updates } });
    },
    [layout, onChange],
  );

  const updateBorders = useCallback(
    (updates: Partial<BorderTokens>) => {
      onChange({ borders: { ...borders, ...updates } });
    },
    [borders, onChange],
  );

  const updateShadows = useCallback(
    (updates: Partial<ShadowTokens>) => {
      onChange({ shadows: { ...shadows, ...updates } });
    },
    [shadows, onChange],
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-1" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="borders">
            <RectangleHorizontal className="h-4 w-4 mr-1" />
            Borders
          </TabsTrigger>
          <TabsTrigger value="shadows">
            <Sparkles className="h-4 w-4 mr-1" />
            Shadows
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="mt-4">
          <div className="space-y-6">
            {/* Max Width Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Container Widths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(layout.maxWidth).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label className="text-xs capitalize">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) =>
                          updateLayout({
                            maxWidth: {
                              ...layout.maxWidth,
                              [size]: e.target.value,
                            },
                          })
                        }
                        placeholder="32rem"
                        className="text-xs"
                      />
                      {value !== '100%' && (
                        <div className="bg-muted/50 p-2 rounded">
                          <div
                            className="bg-primary/20 border border-primary/40 h-4"
                            style={{ width: value, maxWidth: '100%' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Container Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Container Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Container Padding</Label>
                    <Input
                      value={layout.container.padding}
                      onChange={(e) =>
                        updateLayout({
                          container: {
                            ...layout.container,
                            padding: e.target.value,
                          },
                        })
                      }
                      placeholder="1rem"
                      className="text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Container Margin</Label>
                    <Input
                      value={layout.container.margin}
                      onChange={(e) =>
                        updateLayout({
                          container: {
                            ...layout.container,
                            margin: e.target.value,
                          },
                        })
                      }
                      placeholder="0 auto"
                      className="text-xs mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Layout Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateLayout({
                        maxWidth: {
                          ...layout.maxWidth,
                          xs: '20rem',
                          sm: '24rem',
                          md: '28rem',
                          lg: '32rem',
                        },
                      })
                    }>
                    Narrow
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateLayout({
                        maxWidth: {
                          ...layout.maxWidth,
                          xs: '28rem',
                          sm: '32rem',
                          md: '42rem',
                          lg: '48rem',
                        },
                      })
                    }>
                    Standard
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateLayout({
                        maxWidth: {
                          ...layout.maxWidth,
                          xs: '36rem',
                          sm: '42rem',
                          md: '56rem',
                          lg: '64rem',
                        },
                      })
                    }>
                    Wide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Borders Tab */}
        <TabsContent value="borders" className="mt-4">
          <div className="space-y-6">
            {/* Border Radius */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Border Radius</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(borders.radius).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label className="text-xs capitalize">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) =>
                          updateBorders({
                            radius: {
                              ...borders.radius,
                              [size]: e.target.value,
                            },
                          })
                        }
                        placeholder="0.25rem"
                        className="text-xs"
                      />
                      <div className="bg-muted/50 p-2 rounded">
                        <div
                          className="bg-primary/20 border border-primary/40 w-12 h-8"
                          style={{ borderRadius: size === 'full' ? '9999px' : value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Border Width */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Border Width</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(borders.width).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label className="text-xs capitalize">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) =>
                          updateBorders({
                            width: {
                              ...borders.width,
                              [size]: e.target.value,
                            },
                          })
                        }
                        placeholder="1px"
                        className="text-xs"
                      />
                      <div className="bg-muted/50 p-2 rounded">
                        <div
                          className="bg-primary/20 border-primary/40 w-12 h-8"
                          style={{
                            borderWidth: value,
                            borderStyle: 'solid',
                            borderColor: 'currentColor',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shadows Tab */}
        <TabsContent value="shadows" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shadow Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(shadows).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label className="text-xs capitalize">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) =>
                          updateShadows({
                            [size]: e.target.value,
                          })
                        }
                        placeholder="0 1px 3px rgba(0,0,0,0.1)"
                        className="text-xs font-mono"
                      />
                      {value !== 'none' && (
                        <div className="bg-muted/50 p-4 rounded">
                          <div
                            className="bg-background border w-16 h-12 rounded"
                            style={{ boxShadow: value }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shadow Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shadow Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateShadows({
                        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      })
                    }>
                    Subtle
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateShadows({
                        sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                        base: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
                        md: '0 8px 16px -2px rgba(0, 0, 0, 0.15)',
                        lg: '0 16px 24px -4px rgba(0, 0, 0, 0.15)',
                        xl: '0 24px 32px -8px rgba(0, 0, 0, 0.15)',
                      })
                    }>
                    Standard
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateShadows({
                        sm: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
                        base: '0 8px 16px 0 rgba(0, 0, 0, 0.2)',
                        md: '0 12px 24px -4px rgba(0, 0, 0, 0.2)',
                        lg: '0 20px 32px -8px rgba(0, 0, 0, 0.2)',
                        xl: '0 32px 48px -12px rgba(0, 0, 0, 0.25)',
                      })
                    }>
                    Dramatic
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
