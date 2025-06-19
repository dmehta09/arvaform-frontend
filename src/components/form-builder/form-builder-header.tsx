/**
 * Form Builder Header Component - 2025 Edition
 *
 * Header component for the form builder with auto-save indicator and undo/redo toolbar
 * and various builder tools. Provides a clean, organized toolbar interface.
 *
 * Features:
 * - Auto-save status indicator
 * - Undo/redo toolbar
 * - Zoom controls
 * - Grid toggle
 * - Theme toggle
 * - Preview mode switch
 * - Form settings access
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UseAutoSaveReturn } from '@/hooks/use-auto-save';
import { UseUndoRedoReturn } from '@/hooks/use-undo-redo';
import { cn } from '@/lib/utils';
import {
  Eye,
  Grid3X3,
  Monitor,
  Palette,
  RotateCcw,
  Settings,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { AutoSaveIndicator } from './auto-save-indicator';
import { UndoRedoToolbar } from './undo-redo-toolbar';

/**
 * Form builder header props
 */
export interface FormBuilderHeaderProps {
  /** Form name or title */
  formName: string;
  /** Auto-save hook instance */
  autoSave: UseAutoSaveReturn;
  /** Undo/redo hook instance */
  undoRedo: UseUndoRedoReturn;
  /** Current zoom level (0.5 to 2.0) */
  zoom: number;
  /** Zoom change handler */
  onZoomChange: (zoom: number) => void;
  /** Grid visibility */
  showGrid: boolean;
  /** Grid toggle handler */
  onGridToggle: () => void;
  /** Preview mode state */
  isPreviewMode: boolean;
  /** Preview mode toggle handler */
  onPreviewToggle: () => void;
  /** Theme panel state */
  isThemePanelOpen: boolean;
  /** Theme panel toggle handler */
  onThemeToggle: () => void;
  /** Settings panel toggle handler */
  onSettingsToggle?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * Form Builder Header Component
 *
 * Provides the main toolbar for the form builder with all essential controls
 * and status indicators organized in a clean, accessible layout.
 */
export function FormBuilderHeader({
  formName,
  autoSave,
  undoRedo,
  zoom,
  onZoomChange,
  showGrid,
  onGridToggle,
  isPreviewMode,
  onPreviewToggle,
  isThemePanelOpen,
  onThemeToggle,
  onSettingsToggle,
  className,
}: FormBuilderHeaderProps) {
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2.0);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    onZoomChange(newZoom);
  };

  const handleZoomReset = () => {
    onZoomChange(1.0);
  };

  const formatZoom = (zoom: number) => `${Math.round(zoom * 100)}%`;

  return (
    <header
      className={cn(
        'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Form Info & Auto-save */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold truncate max-w-48">{formName}</h1>
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <AutoSaveIndicator autoSave={autoSave} compact={true} showSaveButton={true} />
        </div>

        {/* Center Section - Undo/Redo & View Controls */}
        <div className="flex items-center gap-2">
          <UndoRedoToolbar undoRedo={undoRedo} compact={true} showHistory={false} />

          <Separator orientation="vertical" className="h-6" />

          <TooltipProvider>
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="h-8 w-8 p-0">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomReset}
                    className="h-8 px-2 text-xs font-mono">
                    {formatZoom(zoom)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Zoom (100%)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 2.0}
                    className="h-8 w-8 p-0">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Grid Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? 'default' : 'ghost'}
                  size="sm"
                  onClick={onGridToggle}
                  className="h-8 w-8 p-0">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showGrid ? 'Hide Grid' : 'Show Grid'}</TooltipContent>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isThemePanelOpen ? 'default' : 'ghost'}
                  size="sm"
                  onClick={onThemeToggle}
                  className="h-8 w-8 p-0">
                  <Palette className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isThemePanelOpen ? 'Close Theme Panel' : 'Open Theme Panel'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right Section - Preview & Settings */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* Preview Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPreviewMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={onPreviewToggle}
                  className="flex items-center gap-2">
                  {isPreviewMode ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Back to Editor</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPreviewMode ? 'Return to Builder' : 'Preview Form'}
              </TooltipContent>
            </Tooltip>

            {/* Settings */}
            {onSettingsToggle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSettingsToggle}
                    className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Form Settings</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}

/**
 * Simplified form builder header for mobile/compact views
 */
export function FormBuilderHeaderCompact({
  formName,
  autoSave,
  undoRedo,
  isPreviewMode,
  onPreviewToggle,
}: Pick<
  FormBuilderHeaderProps,
  'formName' | 'autoSave' | 'undoRedo' | 'isPreviewMode' | 'onPreviewToggle'
>) {
  return (
    <header className="border-b bg-background p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold truncate max-w-32">{formName}</h1>
          <AutoSaveIndicator autoSave={autoSave} compact={true} showSaveButton={false} />
        </div>

        <div className="flex items-center gap-1">
          <UndoRedoToolbar undoRedo={undoRedo} compact={true} showHistory={false} />

          <Button
            variant={isPreviewMode ? 'default' : 'ghost'}
            size="sm"
            onClick={onPreviewToggle}
            className="h-8 w-8 p-0">
            {isPreviewMode ? <RotateCcw className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Device preview selector for preview mode
 */
export function DevicePreviewSelector({
  currentDevice,
  onDeviceChange,
}: {
  currentDevice: string;
  onDeviceChange: (device: string) => void;
}) {
  const devices = [
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'desktop', label: 'Desktop', icon: Monitor },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border bg-background">
      {devices.map(({ id, label, icon: Icon }) => (
        <TooltipProvider key={id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentDevice === id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onDeviceChange(id)}
                className="h-8 w-8 p-0">
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label} Preview</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
