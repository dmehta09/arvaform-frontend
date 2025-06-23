/**
 * Submission Table Toolbar - ArvaForm 2025
 *
 * Toolbar for bulk actions and table management with React 19 patterns
 * Following accessibility guidelines and modern UX patterns
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
import { Progress } from '@/components/ui/progress';
import type { SubmissionActionState } from '@/types/submission.types';
import {
  Archive,
  CheckCircle,
  ChevronDown,
  Flag,
  Loader2,
  SquareCheck,
  Trash2,
  X,
} from 'lucide-react';

interface SubmissionTableToolbarProps {
  /** Number of selected submissions */
  selectedCount: number;
  /** Total number of submissions */
  totalCount: number;
  /** Handle bulk action */
  onBulkAction: (action: string, reason?: string) => void;
  /** Select all submissions */
  onSelectAll: () => void;
  /** Clear selection */
  onClearSelection: () => void;
  /** Action state for feedback */
  actionState: SubmissionActionState;
  /** Is operation pending */
  isPending: boolean;
}

/**
 * Bulk action configuration
 */
const BULK_ACTIONS = {
  markAsRead: {
    label: 'Mark as Read',
    icon: CheckCircle,
    description: 'Mark selected submissions as read',
    variant: 'default' as const,
    requiresConfirmation: false,
  },
  markAsNew: {
    label: 'Mark as New',
    icon: SquareCheck,
    description: 'Mark selected submissions as new',
    variant: 'default' as const,
    requiresConfirmation: false,
  },
  archive: {
    label: 'Archive',
    icon: Archive,
    description: 'Archive selected submissions',
    variant: 'secondary' as const,
    requiresConfirmation: false,
  },
  flag: {
    label: 'Flag',
    icon: Flag,
    description: 'Flag selected submissions for review',
    variant: 'destructive' as const,
    requiresConfirmation: false,
  },
  delete: {
    label: 'Delete',
    icon: Trash2,
    description: 'Permanently delete selected submissions',
    variant: 'destructive' as const,
    requiresConfirmation: true,
  },
} as const;

/**
 * Action status indicator component
 */
function ActionStatusIndicator({ actionState }: { actionState: SubmissionActionState }) {
  if (actionState.status === 'idle') return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
      {actionState.status === 'pending' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </>
      )}

      {actionState.status === 'success' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">{actionState.message}</span>
        </>
      )}

      {actionState.status === 'error' && (
        <>
          <X className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{actionState.error}</span>
        </>
      )}
    </div>
  );
}

/**
 * Main table toolbar component
 */
export function SubmissionTableToolbar({
  selectedCount,
  totalCount,
  onBulkAction,
  onSelectAll,
  onClearSelection,
  actionState,
  isPending,
}: SubmissionTableToolbarProps) {
  // Handle bulk action execution
  const handleBulkAction = (action: string) => {
    if (BULK_ACTIONS[action as keyof typeof BULK_ACTIONS]?.requiresConfirmation) {
      // In a real app, show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to ${action} ${selectedCount} submission(s)? This action cannot be undone.`,
      );
      if (!confirmed) return;
    }

    onBulkAction(action);
  };

  return (
    <div className="space-y-3">
      {/* Selection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedCount} selected</Badge>
              <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={isPending}>
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {totalCount} submission{totalCount !== 1 ? 's' : ''} total
            </p>
          )}

          {selectedCount < totalCount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              disabled={isPending}
              className="text-primary">
              Select All {totalCount}
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('markAsRead')}
              disabled={isPending}>
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark Read
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('archive')}
              disabled={isPending}>
              <Archive className="h-3 w-3 mr-1" />
              Archive
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPending}>
                  More
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {Object.entries(BULK_ACTIONS).map(([key, action]) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleBulkAction(key)}
                      className={
                        action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''
                      }>
                      <Icon className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Delete</div>
                    <div className="text-xs text-muted-foreground">
                      Permanently remove submissions
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Action Status */}
      <ActionStatusIndicator actionState={actionState} />

      {/* Progress Bar (if pending) */}
      {isPending && selectedCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Processing {selectedCount} submission{selectedCount !== 1 ? 's' : ''}...
            </span>
            <span>Please wait</span>
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}
    </div>
  );
}
