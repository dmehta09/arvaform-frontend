'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { devices } from '@/lib/preview/device-breakpoints';
import { Maximize2, Minimize2, Monitor, Moon, Sun } from 'lucide-react';
import { useMemo } from 'react';

/**
 * Props for the PreviewToolbar component
 */
interface PreviewToolbarProps {
  /** Currently selected device ID */
  selectedDevice: string;
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Preview mode */
  mode: 'static' | 'interactive';
  /** Whether preview is in fullscreen mode */
  isFullscreen: boolean;
  /** Callback when device changes */
  onDeviceChange: (deviceId: string) => void;
  /** Callback when theme changes */
  onThemeChange: (theme: 'light' | 'dark') => void;
  /** Callback when mode changes */
  onModeChange: (mode: 'static' | 'interactive') => void;
  /** Callback when fullscreen toggles */
  onFullscreenToggle?: () => void;
  /** Additional action buttons */
  additionalActions?: React.ReactNode;
  /** Custom CSS classes */
  className?: string;
}

/**
 * PreviewToolbar component that provides controls for the form preview
 *
 * Features:
 * - Device selection with categorized options
 * - Theme toggle (light/dark)
 * - Preview mode switching (static/interactive)
 * - Fullscreen toggle
 * - Additional action buttons
 * - Responsive design for different screen sizes
 */
export function PreviewToolbar({
  selectedDevice,
  theme,
  mode,
  isFullscreen,
  onDeviceChange,
  onThemeChange,
  onModeChange,
  onFullscreenToggle,
  additionalActions,
  className,
}: PreviewToolbarProps) {
  // Group devices by type for better organization
  const deviceGroups = useMemo(() => {
    const grouped = devices.reduce(
      (acc, device) => {
        if (!acc[device.type]) {
          acc[device.type] = [];
        }
        acc[device.type]!.push(device);
        return acc;
      },
      {} as Record<string, Array<(typeof devices)[0]>>,
    );

    return grouped;
  }, []);

  // Get current device info
  const currentDevice = useMemo(() => {
    return devices.find((device) => device.id === selectedDevice);
  }, [selectedDevice]);

  return (
    <Card className={`preview-toolbar p-3 ${className}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left section - Device controls */}
        <div className="flex items-center gap-3">
          {/* Device Selection */}
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-500" />
            <Select value={selectedDevice} onValueChange={onDeviceChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{currentDevice?.icon}</span>
                    <span className="truncate">{currentDevice?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(deviceGroups).map(([type, deviceList]) => (
                  <div key={type}>
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {type}
                    </div>
                    {deviceList.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        <div className="flex items-center gap-2">
                          <span>{device.icon}</span>
                          <span>{device.name}</span>
                          <span className="text-xs text-gray-500">
                            {device.width}×{device.height}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Preview Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <Button
              variant={mode === 'static' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('static')}
              className="h-7 px-3 text-xs">
              Static
            </Button>
            <Button
              variant={mode === 'interactive' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('interactive')}
              className="h-7 px-3 text-xs">
              Interactive
            </Button>
          </div>
        </div>

        {/* Right section - Theme and actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Fullscreen Toggle */}
          {onFullscreenToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFullscreenToggle}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}

          {/* Additional Actions */}
          {additionalActions && (
            <>
              <Separator orientation="vertical" className="h-6" />
              {additionalActions}
            </>
          )}
        </div>
      </div>

      {/* Device Info (optional) */}
      {currentDevice && (
        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>{currentDevice.description}</span>
            <span className="flex items-center gap-2">
              <span>{currentDevice.orientation}</span>
              <span>•</span>
              <span>{currentDevice.type}</span>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
