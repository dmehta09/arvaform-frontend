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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SubmissionActionState, SubmissionListItem } from '@/types/submission.types';
import {
  Archive,
  CheckCircle,
  ChevronDown,
  Download,
  Flag,
  Loader2,
  SquareCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ExportModal } from './export-modal';

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
  /** Form ID for export */
  formId: string;
  /** Form title for export */
  formTitle: string;
  /** Selected submissions for export */
  selectedSubmissions?: SubmissionListItem[];
  /** Current filters applied */
  currentFilters?: Record<string, unknown>;
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
  formId,
  formTitle,
  selectedSubmissions,
  currentFilters,
}: SubmissionTableToolbarProps) {
  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            disabled={isPending || totalCount === 0}
            className="flex items-center gap-2">
            <Download className="h-3 w-3" />
            Export
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {selectedCount}
              </Badge>
            )}
          </Button>

          {/* Bulk Actions - only show when selections are made */}
          {selectedCount > 0 && (
            <>
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
                <DropdownMenuContent align="end" className="w-48">
                  {Object.entries(BULK_ACTIONS)
                    .filter(([key]) => !['markAsRead', 'archive'].includes(key))
                    .map(([key, action]) => {
                      const Icon = action.icon;
                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleBulkAction(key)}
                          disabled={isPending}
                          className={
                            action.variant === 'destructive'
                              ? 'text-red-600 focus:text-red-600'
                              : ''
                          }>
                          <Icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Action Status */}
      <ActionStatusIndicator actionState={actionState} />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        formId={formId}
        formTitle={formTitle}
        totalSubmissions={totalCount}
        selectedSubmissions={selectedSubmissions}
        currentFilters={currentFilters}
      />
    </div>
  );
}
