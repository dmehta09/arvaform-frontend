/**
 * Auto-Save Indicator Component - 2025 Edition
 *
 * Displays current auto-save status with visual feedback and user-friendly messages.
 * Provides save status, last saved time, and manual save button functionality.
 *
 * Features:
 * - Real-time save status updates
 * - Visual indicators for different states
 * - Manual save button
 * - Tooltips with detailed information
 * - Responsive design
 * - Accessibility compliance
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UseAutoSaveReturn, useAutoSaveStatus } from '@/hooks/use-auto-save';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Loader2,
  Save,
  Wifi,
  WifiOff,
} from 'lucide-react';

/**
 * Auto-save indicator props
 */
export interface AutoSaveIndicatorProps {
  /** Auto-save hook instance */
  autoSave: UseAutoSaveReturn;
  /** Show manual save button (default: true) */
  showSaveButton?: boolean;
  /** Compact layout (default: false) */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Enable detailed tooltips (default: true) */
  showTooltips?: boolean;
}

/**
 * Auto-Save Indicator Component
 *
 * Displays the current auto-save status with visual feedback and controls.
 * Shows save status, last saved time, and provides manual save functionality.
 */
export function AutoSaveIndicator({
  autoSave,
  showSaveButton = true,
  compact = false,
  className,
  showTooltips = true,
}: AutoSaveIndicatorProps) {
  const { state } = autoSave;
  const { statusText, statusColor, showSpinner, lastSavedText } = useAutoSaveStatus(state);

  const handleManualSave = async () => {
    try {
      await autoSave.save();
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  };

  const StatusIcon = getStatusIcon(state.status);
  const isError = state.status === 'error';
  const isOffline = state.status === 'offline';
  const isConflict = state.status === 'conflict';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                {showSpinner ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <StatusIcon className={cn('h-4 w-4', statusColor)} />
                )}
                <span className={cn('text-sm font-medium', statusColor)}>{statusText}</span>
              </div>
            </TooltipTrigger>
            {showTooltips && (
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{statusText}</p>
                  <p className="text-xs text-muted-foreground">{lastSavedText}</p>
                  {state.lastError && (
                    <p className="text-xs text-red-400 mt-1">{state.lastError}</p>
                  )}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {showSaveButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={state.status === 'saving'}
            className="h-6 px-2">
            <Save className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-card', className)}>
      {/* Status Section */}
      <div className="flex items-center gap-2">
        {showSpinner ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : (
          <StatusIcon className={cn('h-5 w-5', statusColor)} />
        )}

        <div className="flex flex-col">
          <span className={cn('text-sm font-medium', statusColor)}>{statusText}</span>
          <span className="text-xs text-muted-foreground">{lastSavedText}</span>
        </div>
      </div>

      {/* Status Badge */}
      <Badge
        variant={isError || isConflict ? 'destructive' : isOffline ? 'secondary' : 'default'}
        className={cn(
          'text-xs',
          state.status === 'saved' &&
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
          state.status === 'saving' &&
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
        )}>
        {state.status === 'idle' && 'Ready'}
        {state.status === 'saving' && 'Saving...'}
        {state.status === 'saved' && 'Saved'}
        {state.status === 'error' && 'Error'}
        {state.status === 'offline' && 'Offline'}
        {state.status === 'conflict' && 'Conflict'}
      </Badge>

      {/* Error Message */}
      {state.lastError && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 text-red-500 cursor-help" />
            </TooltipTrigger>
            {showTooltips && (
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{state.lastError}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Manual Save Button */}
      {showSaveButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSave}
          disabled={state.status === 'saving'}
          className="ml-auto">
          {state.status === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Now
            </>
          )}
        </Button>
      )}

      {/* Pending Changes Indicator */}
      {autoSave.hasPendingChanges() && (
        <div className="flex items-center gap-1 text-orange-600">
          <Clock className="h-4 w-4" />
          <span className="text-xs">Pending</span>
        </div>
      )}
    </div>
  );
}

/**
 * Minimal auto-save status indicator for toolbar use
 */
export function AutoSaveStatusBadge({ autoSave }: { autoSave: UseAutoSaveReturn }) {
  const { state } = autoSave;
  const { statusText, statusColor } = useAutoSaveStatus(state);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn('cursor-help', statusColor)}>
            {state.status === 'saving' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {statusText}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{statusText}</p>
            <p className="text-xs text-muted-foreground">
              {state.lastSaved
                ? `Last saved: ${state.lastSaved.toLocaleTimeString()}`
                : 'Never saved'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Network status indicator
 */
export function NetworkStatusIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'Online' : 'Offline'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Get appropriate icon for save status
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'idle':
      return Clock;
    case 'saving':
      return Loader2;
    case 'saved':
      return Check;
    case 'error':
      return AlertCircle;
    case 'offline':
      return WifiOff;
    case 'conflict':
      return AlertTriangle;
    default:
      return Clock;
  }
}
