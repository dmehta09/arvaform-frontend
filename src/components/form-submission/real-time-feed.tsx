'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealTimeSubmissions } from '@/hooks/use-real-time-submissions';
import type { Submission } from '@/types/submission.types';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Users, WifiOff } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface RealTimeFeedProps {
  /** Form ID to show submissions for */
  formId: string;
  /** Initial submissions data */
  initialSubmissions?: Submission[];
  /** Whether to show analytics cards */
  showAnalytics?: boolean;
  /** Maximum number of submissions to display */
  maxItems?: number;
  /** Custom header content */
  header?: React.ReactNode;
  /** Custom empty state */
  emptyState?: React.ReactNode;
  /** Custom loading state */
  loadingState?: React.ReactNode;
}

/**
 * Real-time Submission Feed Component
 * Displays live submissions with animations and connection status
 * Implements React 19 patterns and WCAG 2.1 AA accessibility
 */
export function RealTimeFeed({
  formId,
  initialSubmissions = [],
  showAnalytics = true,
  maxItems = 50,
  header,
  emptyState,
  loadingState,
}: RealTimeFeedProps) {
  const {
    submissions,
    connectionStatus,
    lastUpdate,
    connect,
    refreshSubmissions,
    isConnected,
    isConnecting,
    hasError,
    totalConnectedUsers,
    isRealTimeEnabled,
  } = useRealTimeSubmissions(formId, initialSubmissions);

  // Limit submissions displayed
  const displayedSubmissions = useMemo(
    () => submissions.slice(0, maxItems),
    [submissions, maxItems],
  );

  // Connection status styling
  const connectionStatusConfig = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Live',
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Connecting...',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Error',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Offline',
        };
    }
  }, [connectionStatus]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshSubmissions();
      toast.success('Submissions refreshed');
    } catch (_error) {
      toast.error('Failed to refresh submissions');
    }
  }, [refreshSubmissions]);

  // Handle reconnection
  const handleReconnect = useCallback(async () => {
    try {
      await connect();
      toast.success('Reconnected to live updates');
    } catch (_error) {
      toast.error('Failed to reconnect');
    }
  }, [connect]);

  // Format submission time
  const formatSubmissionTime = useCallback((submittedAt: Date | string) => {
    const date = typeof submittedAt === 'string' ? new Date(submittedAt) : submittedAt;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Get submission status styling
  const getStatusStyling = useCallback((status: Submission['status']) => {
    switch (status) {
      case 'new':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'New',
        };
      case 'read':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Read',
        };
      case 'archived':
        return {
          color: 'bg-gray-100 text-gray-800',
          label: 'Archived',
        };
      case 'flagged':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Flagged',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: status,
        };
    }
  }, []);

  // Loading state
  if (isConnecting && submissions.length === 0) {
    return (
      loadingState || (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Connecting to live updates...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  return (
    <Card className="w-full">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold">{header || 'Live Submissions'}</CardTitle>

            {/* Connection Status Badge */}
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 ${connectionStatusConfig.bgColor} ${connectionStatusConfig.borderColor}`}>
              <connectionStatusConfig.icon
                className={`h-3 w-3 ${connectionStatusConfig.color} ${
                  connectionStatus === 'connecting' ? 'animate-spin' : ''
                }`}
              />
              <span className={connectionStatusConfig.color}>{connectionStatusConfig.text}</span>
            </Badge>

            {/* Connected Users Count */}
            {isConnected && totalConnectedUsers > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {totalConnectedUsers} online
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {hasError && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Reconnect
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isConnecting}
              className="flex items-center gap-1">
              <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {showAnalytics && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{submissions.length}</div>
              <div className="text-sm text-blue-700">Total Submissions</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-900">
                {submissions.filter((s) => s.status === 'new').length}
              </div>
              <div className="text-sm text-green-700">New</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
              <div className="text-2xl font-bold text-purple-900">{totalConnectedUsers}</div>
              <div className="text-sm text-purple-700">Users Online</div>
            </div>
          </div>
        )}

        {/* Last Update Info */}
        {lastUpdate && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last update: {formatSubmissionTime(lastUpdate)}
          </div>
        )}
      </CardHeader>

      <Separator />

      {/* Submissions List */}
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {displayedSubmissions.length === 0 ? (
            <div className="p-8 text-center">
              {emptyState || (
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
                  <p className="text-gray-600">
                    Submissions will appear here in real-time as they are received.
                  </p>
                  {!isRealTimeEnabled && (
                    <p className="text-yellow-600 text-sm">
                      Real-time updates are disabled. Please check your connection.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {displayedSubmissions.map((submission, index) => {
                  const statusStyling = getStatusStyling(submission.status);

                  return (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: 'easeOut',
                      }}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Submission Info */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-900">
                                {submission.submitterInfo.name?.charAt(0) ||
                                  submission.submitterInfo.email?.charAt(0) ||
                                  '?'}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {submission.submitterInfo.name ||
                                  submission.submitterInfo.email ||
                                  'Anonymous'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatSubmissionTime(submission.submittedAt)}
                              </p>
                            </div>

                            <Badge className={statusStyling.color}>{statusStyling.label}</Badge>
                          </div>

                          {/* Preview Data */}
                          <div className="text-sm text-gray-600">
                            {Object.entries(submission.data)
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="font-medium">{key}:</span>{' '}
                                  {String(value || 'N/A')}
                                </div>
                              ))}
                            {Object.keys(submission.data).length > 2 && (
                              <div className="text-xs text-gray-500 mt-1">
                                +{Object.keys(submission.data).length - 2} more fields
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {submission.files && submission.files.length > 0 && (
                              <span>📎 {submission.files.length} files</span>
                            )}
                            {submission.metadata.deviceType && (
                              <span>📱 {submission.metadata.deviceType}</span>
                            )}
                            {submission.spamScore !== undefined && submission.spamScore > 50 && (
                              <Badge variant="destructive" className="text-xs">
                                ⚠️ Potential spam
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
