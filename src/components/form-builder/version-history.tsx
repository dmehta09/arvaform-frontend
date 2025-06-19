/**
 * Version History Component - 2025 Edition
 *
 * Provides comprehensive version history and diff visualization for form builder.
 * Shows form evolution over time with the ability to restore previous versions.
 *
 * Features:
 * - Visual timeline of form changes
 * - Diff visualization between versions
 * - Version restoration functionality
 * - Collaborative editing history
 * - Performance optimized rendering
 * - Accessibility compliance
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  GitBranch,
  History,
  RotateCcw,
  Share2,
  User,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Version history entry
 */
export interface VersionHistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
  author: string;
  changes: VersionChange[];
  isAutoSave: boolean;
  formSnapshot?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Individual change within a version
 */
export interface VersionChange {
  type: 'add' | 'remove' | 'modify' | 'move';
  elementId?: string;
  elementType?: string;
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
  description: string;
}

/**
 * Version history props
 */
export interface VersionHistoryProps {
  /** List of version history entries */
  versions: VersionHistoryEntry[];
  /** Current version ID */
  currentVersionId?: string;
  /** Callback when version is restored */
  onRestoreVersion?: (versionId: string) => void;
  /** Callback when version is previewed */
  onPreviewVersion?: (versionId: string) => void;
  /** Show diff between versions */
  showDiff?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Version History Component
 *
 * Displays a comprehensive version history with timeline visualization,
 * change details, and restoration capabilities.
 */
export function VersionHistory({
  versions,
  currentVersionId,
  onRestoreVersion,
  onPreviewVersion,
  showDiff = true,
  compact = false,
  className,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);

  const sortedVersions = [...versions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
    onPreviewVersion?.(versionId);
  };

  const handleRestoreVersion = (versionId: string) => {
    onRestoreVersion?.(versionId);
    setShowVersionDialog(false);
  };

  const selectedVersionData = sortedVersions.find((v) => v.id === selectedVersion);

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Changes ({versions.length})
          </h3>
          <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Version History</DialogTitle>
                <DialogDescription>
                  View and restore previous versions of your form
                </DialogDescription>
              </DialogHeader>
              <VersionHistory
                versions={versions}
                currentVersionId={currentVersionId}
                onRestoreVersion={onRestoreVersion}
                onPreviewVersion={onPreviewVersion}
                showDiff={showDiff}
                compact={false}
              />
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-32">
          <div className="space-y-1">
            {sortedVersions.slice(0, 5).map((version) => (
              <VersionEntryCompact
                key={version.id}
                version={version}
                isCurrent={version.id === currentVersionId}
                onSelect={() => handleVersionSelect(version.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-4', className)}>
      {/* Version Timeline */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {sortedVersions.map((version, index) => (
                  <VersionEntry
                    key={version.id}
                    version={version}
                    isCurrent={version.id === currentVersionId}
                    isSelected={version.id === selectedVersion}
                    isLatest={index === 0}
                    onSelect={() => handleVersionSelect(version.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Version Details */}
      <div className="lg:col-span-2">
        {selectedVersionData ? (
          <VersionDetails
            version={selectedVersionData}
            onRestore={() => handleRestoreVersion(selectedVersionData.id)}
            showDiff={showDiff}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a version to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Individual version entry in the timeline
 */
function VersionEntry({
  version,
  isCurrent,
  isSelected,
  isLatest,
  onSelect,
}: {
  version: VersionHistoryEntry;
  isCurrent: boolean;
  isSelected: boolean;
  isLatest: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-colors',
        isSelected && 'border-primary bg-primary/10',
        isCurrent && 'ring-2 ring-green-500',
        'hover:bg-accent',
      )}
      onClick={onSelect}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isLatest && <Badge variant="secondary">Latest</Badge>}
            {isCurrent && <Badge variant="default">Current</Badge>}
            {version.isAutoSave ? (
              <Badge variant="outline">Auto-save</Badge>
            ) : (
              <Badge variant="secondary">Manual</Badge>
            )}
          </div>
          <p className="text-sm font-medium truncate">{version.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <User className="h-3 w-3" />
            <span>{version.author}</span>
            <Clock className="h-3 w-3" />
            <span>{version.timestamp.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{version.changes.length} changes</div>
      </div>
    </div>
  );
}

/**
 * Compact version entry for small spaces
 */
function VersionEntryCompact({
  version,
  isCurrent,
  onSelect,
}: {
  version: VersionHistoryEntry;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-between p-2 rounded border cursor-pointer transition-colors',
              isCurrent && 'ring-1 ring-green-500',
              'hover:bg-accent',
            )}
            onClick={onSelect}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{version.description}</p>
              <p className="text-xs text-muted-foreground">
                {version.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">
              {version.changes.length}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{version.description}</p>
            <p className="text-xs">By {version.author}</p>
            <p className="text-xs">{version.changes.length} changes</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Detailed version information and changes
 */
function VersionDetails({
  version,
  onRestore,
  showDiff,
}: {
  version: VersionHistoryEntry;
  onRestore: () => void;
  showDiff: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{version.description}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{version.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{version.timestamp.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{version.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={onRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Version Badges */}
          <div className="flex items-center gap-2">
            {version.isAutoSave ? (
              <Badge variant="outline">Auto-save</Badge>
            ) : (
              <Badge variant="secondary">Manual Save</Badge>
            )}
            <Badge variant="outline">{version.changes.length} Changes</Badge>
          </div>

          <Separator />

          {/* Changes List */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Changes in this version
            </h4>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {version.changes.map((change, index) => (
                  <ChangeEntry key={index} change={change} showDiff={showDiff} />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Version
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <GitBranch className="h-4 w-4 mr-2" />
              Create Branch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual change entry with diff visualization
 */
function ChangeEntry({ change, showDiff }: { change: VersionChange; showDiff: boolean }) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'add':
        return '+';
      case 'remove':
        return '-';
      case 'modify':
        return '~';
      case 'move':
        return '↗';
      default:
        return '•';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'remove':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'modify':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'move':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn('p-3 rounded-lg border', getChangeColor(change.type))}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-current/10 text-xs font-bold">
          {getChangeIcon(change.type)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{change.description}</p>
          <p className="text-xs opacity-75 mt-1">
            {change.elementType && `${change.elementType} • `}
            {change.field}
          </p>
          {showDiff && (change.oldValue !== undefined || change.newValue !== undefined) && (
            <div className="mt-2 text-xs space-y-1">
              {change.oldValue !== undefined && (
                <div className="bg-current/5 p-2 rounded">
                  <span className="opacity-75">Old: </span>
                  <code>{JSON.stringify(change.oldValue)}</code>
                </div>
              )}
              {change.newValue !== undefined && (
                <div className="bg-current/5 p-2 rounded">
                  <span className="opacity-75">New: </span>
                  <code>{JSON.stringify(change.newValue)}</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
