'use client';

/**
 * Theme Panel - ArvaForm 2025
 * Main interface for customizing form appearance and styling
 * Integrates with the existing theme engine and follows 2025 design patterns
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brush,
  Download,
  Eye,
  Layout,
  Move,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Type,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// import { useToast } from '@/hooks/use-toast';
import { getDefaultTheme, getThemeById, predefinedThemes } from '@/lib/theming/predefined-themes';
import { ThemeEngine } from '@/lib/theming/theme-engine';
import { Theme, ThemePanel as ThemePanelType } from '@/types/theme.types';
import { ColorPicker } from './color-picker';
import { LayoutOptions } from './layout-options';
import { SpacingControls } from './spacing-controls';
import { TypographyControls } from './typography-controls';

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: Theme) => void;
  className?: string;
}

export function ThemePanel({ isOpen, onClose, onThemeChange, className }: ThemePanelProps) {
  // const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<ThemePanelType>(ThemePanelType.COLORS);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [availableThemes] = useState<Theme[]>(predefinedThemes);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use useRef to get a stable reference to theme engine
  const themeEngineRef = useRef(ThemeEngine.getInstance());

  // Load current theme on mount
  useEffect(() => {
    const theme = themeEngineRef.current.getCurrentTheme() || getDefaultTheme();
    setCurrentTheme(theme);
  }, []);

  // Handle theme selection from predefined themes
  const handleThemeSelect = useCallback(
    (themeId: string) => {
      const theme = getThemeById(themeId);
      if (theme) {
        setCurrentTheme(theme);
        themeEngineRef.current.setTheme(theme);
        onThemeChange(theme);
        setHasUnsavedChanges(false);
        console.log('Theme Applied', `${theme.metadata.name} theme has been applied successfully.`);
      }
    },
    [onThemeChange],
  );

  // Handle theme token updates
  const handleTokenUpdate = useCallback(
    (path: string, value: unknown) => {
      if (!currentTheme) return;

      // Create updated theme with new token values
      const updatedTheme = {
        ...currentTheme,
        tokens: {
          ...currentTheme.tokens,
          [path]: value,
        },
      };

      // Update the theme state
      setCurrentTheme(updatedTheme);
      setHasUnsavedChanges(true);

      // Apply changes immediately in preview mode or when apply is clicked
      if (isPreviewMode) {
        themeEngineRef.current.setTheme(updatedTheme);
        onThemeChange(updatedTheme);
      }

      console.log('Token updated:', path, value);
    },
    [currentTheme, isPreviewMode, onThemeChange],
  );

  // Handle custom CSS updates
  const handleCustomCSSUpdate = useCallback(
    (css: string) => {
      if (!currentTheme) return;

      const updatedTheme = {
        ...currentTheme,
        customCSS: css,
      };

      setCurrentTheme(updatedTheme);
      setHasUnsavedChanges(true);

      if (isPreviewMode) {
        themeEngineRef.current.setTheme(updatedTheme);
        onThemeChange(updatedTheme);
      }
    },
    [currentTheme, isPreviewMode, onThemeChange],
  );

  // Apply changes
  const handleApplyChanges = useCallback(() => {
    if (!currentTheme) return;

    themeEngineRef.current.setTheme(currentTheme);
    onThemeChange(currentTheme);
    setHasUnsavedChanges(false);
    console.log('Changes Applied', 'Your theme customizations have been applied.');
  }, [currentTheme, onThemeChange]);

  // Reset to last saved state
  const handleReset = useCallback(() => {
    const savedTheme = themeEngineRef.current.getCurrentTheme() || getDefaultTheme();
    setCurrentTheme(savedTheme);
    setHasUnsavedChanges(false);
    console.log('Changes Reset', 'Theme has been reset to the last saved state.');
  }, []);

  // Export theme
  const handleExport = useCallback(() => {
    if (!currentTheme) return;

    try {
      const themeJson = themeEngineRef.current.exportTheme(currentTheme);
      const blob = new Blob([themeJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTheme.metadata.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Theme Exported', 'Theme has been downloaded as JSON file.');
    } catch (_error) {
      console.error('Export Failed', 'Failed to export theme. Please try again.');
    }
  }, [currentTheme]);

  // Import theme
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeJson = e.target?.result as string;
        const importedTheme = themeEngineRef.current.importTheme(themeJson);
        setCurrentTheme(importedTheme);
        setHasUnsavedChanges(true);
        console.log('Theme Imported', 'Theme has been imported successfully.');
      } catch (_error) {
        console.error('Import Failed', 'Failed to import theme. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  if (!isOpen || !currentTheme) return null;

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Theme Studio</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Theme Selection */}
      <div className="p-4 border-b bg-white sticky top-[73px] z-10">
        <h3 className="text-sm font-medium mb-3">Predefined Themes</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableThemes.map((theme) => (
            <Button
              key={theme.metadata.id}
              variant={currentTheme.metadata.id === theme.metadata.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeSelect(theme.metadata.id)}
              className="justify-start text-left h-auto p-2">
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium">{theme.metadata.name}</span>
                <Badge variant="secondary" className="text-xs mt-1">
                  {theme.metadata.category}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-4 border-b bg-white sticky top-[200px] z-10">
        <Button
          variant={isPreviewMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsPreviewMode(!isPreviewMode)}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>

        <label>
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </span>
          </Button>
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {/* Main Content with proper scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Tabs
            value={activePanel}
            onValueChange={(value) => setActivePanel(value as ThemePanelType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={ThemePanelType.COLORS} className="text-xs">
                <Palette className="h-4 w-4 mr-1" />
                Colors
              </TabsTrigger>
              <TabsTrigger value={ThemePanelType.TYPOGRAPHY} className="text-xs">
                <Type className="h-4 w-4 mr-1" />
                Typography
              </TabsTrigger>
              <TabsTrigger value={ThemePanelType.SPACING} className="text-xs">
                <Move className="h-4 w-4 mr-1" />
                Spacing
              </TabsTrigger>
            </TabsList>

            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value={ThemePanelType.LAYOUT} className="text-xs">
                <Layout className="h-4 w-4 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value={ThemePanelType.CSS} className="text-xs">
                <Brush className="h-4 w-4 mr-1" />
                Custom CSS
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-6">
              <TabsContent value={ThemePanelType.COLORS} className="space-y-4">
                <ColorPicker
                  colors={currentTheme.tokens.colors}
                  onChange={(colors) => handleTokenUpdate('colors', colors)}
                />
              </TabsContent>

              <TabsContent value={ThemePanelType.TYPOGRAPHY} className="space-y-4">
                <TypographyControls
                  typography={currentTheme.tokens.typography}
                  onChange={(typography) => handleTokenUpdate('typography', typography)}
                />
              </TabsContent>

              <TabsContent value={ThemePanelType.SPACING} className="space-y-4">
                <SpacingControls
                  spacing={currentTheme.tokens.spacing}
                  onChange={(spacing) => handleTokenUpdate('spacing', spacing)}
                />
              </TabsContent>

              <TabsContent value={ThemePanelType.LAYOUT} className="space-y-4">
                <LayoutOptions
                  layout={currentTheme.tokens.layout}
                  borders={currentTheme.tokens.borders}
                  shadows={currentTheme.tokens.shadows}
                  onChange={(tokens) => {
                    if ('layout' in tokens) handleTokenUpdate('layout', tokens.layout);
                    if ('borders' in tokens) handleTokenUpdate('borders', tokens.borders);
                    if ('shadows' in tokens) handleTokenUpdate('shadows', tokens.shadows);
                  }}
                />
              </TabsContent>

              <TabsContent value={ThemePanelType.CSS} className="space-y-4">
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <p>
                    Add custom CSS to further customize your forms. Changes are sandboxed and
                    validated for security.
                  </p>
                </div>
                <textarea
                  className="w-full h-64 p-3 border rounded font-mono text-sm resize-none"
                  placeholder="/* Add your custom CSS here */
.form-element {
  /* Your styles */
}"
                  value={currentTheme.customCSS || ''}
                  onChange={(e) => handleCustomCSSUpdate(e.target.value)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Footer Actions */}
      {hasUnsavedChanges && (
        <div className="p-4 border-t bg-muted/50 sticky bottom-0">
          <div className="flex gap-2">
            <Button onClick={handleApplyChanges} size="sm" className="flex-1">
              <Save className="h-4 w-4 mr-1" />
              Apply Changes
            </Button>
            <Button variant="outline" onClick={handleReset} size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
