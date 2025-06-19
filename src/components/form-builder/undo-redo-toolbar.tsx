/**
 * Undo/Redo Toolbar Component - 2025 Edition
 *
 * Provides undo/redo functionality with buttons, keyboard shortcuts, and history visualization.
 * Features modern UI design with accessibility support and performance optimizations.
 *
 * Features:
 * - Undo/redo buttons with proper state management
 * - Keyboard shortcut indicators
 * - Command history dropdown
 * - Visual feedback for actions
 * - Accessibility compliance
 * - Responsive design
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UseUndoRedoReturn, useUndoRedoToolbar } from '@/hooks/use-undo-redo';
import { cn } from '@/lib/utils';
import { ChevronDown, History, Info, Redo2, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';

/**
 * Undo/redo toolbar props
 */
export interface UndoRedoToolbarProps {
  /** Undo/redo hook instance */
  undoRedo: UseUndoRedoReturn;
  /** Show command history button (default: true) */
  showHistory?: boolean;
  /** Show clear history button (default: false) */
  showClearHistory?: boolean;
  /** Compact layout (default: false) */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Enable tooltips (default: true) */
  showTooltips?: boolean;
}

/**
 * Undo/Redo Toolbar Component
 *
 * Provides comprehensive undo/redo functionality with:
 * - Undo/redo buttons with state management
 * - Keyboard shortcut indicators
 * - Command history visualization
 * - Clear history functionality
 */
export function UndoRedoToolbar({
  undoRedo,
  showHistory = true,
  showClearHistory = false,
  compact = false,
  className,
  showTooltips = true,
}: UndoRedoToolbarProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const toolbar = useUndoRedoToolbar(undoRedo);

  const handleUndo = () => {
    const result = undoRedo.undo();
    if (!result.success) {
      console.error('Undo failed:', result.error);
    }
  };

  const handleRedo = () => {
    const result = undoRedo.redo();
    if (!result.success) {
      console.error('Redo failed:', result.error);
    }
  };

  const handleClearHistory = () => {
    undoRedo.clearHistory();
    setHistoryOpen(false);
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <TooltipProvider>
          {/* Undo Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={toolbar.undoDisabled}
                className="h-8 w-8 p-0">
                <Undo2 className="h-4 w-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            {showTooltips && (
              <TooltipContent>
                <p>{toolbar.undoTooltip}</p>
                <p className="text-xs text-muted-foreground">Ctrl+Z</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Redo Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={toolbar.redoDisabled}
                className="h-8 w-8 p-0">
                <Redo2 className="h-4 w-4" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            {showTooltips && (
              <TooltipContent>
                <p>{toolbar.redoTooltip}</p>
                <p className="text-xs text-muted-foreground">Ctrl+Y</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 p-2 rounded-lg border bg-card', className)}>
      <TooltipProvider>
        {/* Undo Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={toolbar.undoDisabled}
              className="flex items-center gap-2">
              <Undo2 className="h-4 w-4" />
              <span>Undo</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                Ctrl+Z
              </Badge>
            </Button>
          </TooltipTrigger>
          {showTooltips && (
            <TooltipContent>
              <p>{toolbar.undoTooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* Redo Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={toolbar.redoDisabled}
              className="flex items-center gap-2">
              <Redo2 className="h-4 w-4" />
              <span>Redo</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                Ctrl+Y
              </Badge>
            </Button>
          </TooltipTrigger>
          {showTooltips && (
            <TooltipContent>
              <p>{toolbar.redoTooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* History Stats */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground border-l pl-2">
        <History className="h-4 w-4" />
        <span>{toolbar.historyLength} actions</span>
      </div>

      {/* History Dropdown */}
      {showHistory && (
        <DropdownMenu open={historyOpen} onOpenChange={setHistoryOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">View history</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="p-2">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                Command History
              </h4>

              {undoRedo.history.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No history available
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {undoRedo.history
                    .slice(-10)
                    .reverse()
                    .map((item, _index) => (
                      <DropdownMenuItem
                        key={item.id}
                        className="flex items-center justify-between text-xs">
                        <span className="truncate">{item.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {_index === 0 ? 'Current' : `${_index + 1} ago`}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                </div>
              )}

              {showClearHistory && undoRedo.history.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleClearHistory}
                    className="text-red-600 hover:text-red-700 focus:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </DropdownMenuItem>
                </>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * Simple undo/redo button group for minimal toolbars
 */
export function UndoRedoButtons({ undoRedo }: { undoRedo: UseUndoRedoReturn }) {
  const toolbar = useUndoRedoToolbar(undoRedo);

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => undoRedo.undo()}
              disabled={toolbar.undoDisabled}>
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => undoRedo.redo()}
              disabled={toolbar.redoDisabled}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

/**
 * History visualization component
 */
export function HistoryVisualization({ undoRedo }: { undoRedo: UseUndoRedoReturn }) {
  const stats = undoRedo.getHistoryStats();

  return (
    <div className="p-4 rounded-lg border bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <History className="h-5 w-5" />
        Command History
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.undoCount}</div>
          <div className="text-sm text-muted-foreground">Undo Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.redoCount}</div>
          <div className="text-sm text-muted-foreground">Redo Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalCommands}</div>
          <div className="text-sm text-muted-foreground">Total Commands</div>
        </div>
      </div>

      {undoRedo.history.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Actions</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {undoRedo.history
              .slice(-5)
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm p-2 rounded border">
                  <span className="truncate">{item.description}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
