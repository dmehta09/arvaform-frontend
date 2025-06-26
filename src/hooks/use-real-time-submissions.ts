'use client';

import {
  getSocketInstance,
  type AnalyticsUpdateData,
  type SubmissionEventData,
  type UserActivityData,
} from '@/lib/websocket/submission-socket';
import type { Submission } from '@/types/submission.types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

// Real-time submission state interface
interface RealTimeSubmissionState {
  submissions: Submission[];
  connectedUsers: UserActivityData[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdate: Date | null;
}

// Optimistic action types for useOptimistic
type SubmissionAction =
  | { type: 'add'; submission: Submission }
  | { type: 'update'; submissionId: string; status: string }
  | { type: 'remove'; submissionId: string }
  | { type: 'reset'; submissions: Submission[] };

/**
 * Real-time Submissions Hook
 * Implements React 19 patterns with useOptimistic for instant UI updates
 * @param formId - Form ID to subscribe to real-time updates
 * @param initialSubmissions - Initial submissions data
 */
export function useRealTimeSubmissions(
  formId: string | null,
  initialSubmissions: Submission[] = [],
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Base state for real-time data
  const [baseState, setBaseState] = useState<RealTimeSubmissionState>({
    submissions: initialSubmissions,
    connectedUsers: [],
    connectionStatus: 'disconnected',
    lastUpdate: null,
  });

  // Optimistic state for immediate UI updates
  const [optimisticState, addOptimisticUpdate] = useOptimistic(
    baseState,
    (current, action: SubmissionAction | RealTimeSubmissionState) => {
      // If action is a complete state update
      if ('submissions' in action && 'connectionStatus' in action) {
        return action;
      }

      // Handle optimistic submission actions
      const submissionAction = action as SubmissionAction;
      switch (submissionAction.type) {
        case 'add':
          return {
            ...current,
            submissions: [submissionAction.submission, ...current.submissions],
            lastUpdate: new Date(),
          };

        case 'update':
          return {
            ...current,
            submissions: current.submissions.map((sub) =>
              sub.id === submissionAction.submissionId
                ? { ...sub, status: submissionAction.status as Submission['status'] }
                : sub,
            ),
            lastUpdate: new Date(),
          };

        case 'remove':
          return {
            ...current,
            submissions: current.submissions.filter(
              (sub) => sub.id !== submissionAction.submissionId,
            ),
            lastUpdate: new Date(),
          };

        case 'reset':
          return {
            ...current,
            submissions: submissionAction.submissions,
            lastUpdate: new Date(),
          };

        default:
          return current;
      }
    },
  );

  // WebSocket instance reference
  const socketRef = useRef(getSocketInstance());
  const isConnectingRef = useRef(false);

  /**
   * Handle new submission received via WebSocket
   */
  const handleNewSubmission = useCallback(
    (data: SubmissionEventData) => {
      console.log('📥 Real-time new submission:', data);

      startTransition(() => {
        // Add optimistic update immediately (convert SubmissionData to Submission)
        const submission: Submission = {
          id: data.submissionId,
          formId: data.formId,
          submittedAt: data.timestamp,
          updatedAt: data.timestamp,
          submitterInfo: {
            userId: data.userId,
            name: data.username,
            email: undefined,
            isAnonymous: false,
            ipAddress: '',
            userAgent: '',
          },
          status: 'new' as const,
          data: data.submission,
          files: [],
          metadata: {
            userAgent: '',
            ipAddress: '',
            completionTime: 0,
            deviceType: 'desktop' as const,
            submissionDuration: 0,
            os: '',
            pageViews: 1,
            formVersion: '1.0',
          },
        };

        addOptimisticUpdate({
          type: 'add',
          submission,
        });

        // Update TanStack Query cache
        queryClient.setQueryData(['submissions', formId], (oldData: unknown) => {
          if (!oldData || typeof oldData !== 'object') return oldData;
          const typedData = oldData as { submissions: Submission[]; total: number };
          return {
            ...typedData,
            submissions: [data.submission, ...typedData.submissions],
            total: typedData.total + 1,
          };
        });

        // Show toast notification
        toast.success('New submission received!', {
          description: `From ${data.username}`,
          duration: 3000,
        });
      });
    },
    [formId, queryClient, addOptimisticUpdate],
  );

  /**
   * Handle submission update received via WebSocket
   */
  const handleSubmissionUpdate = useCallback(
    (data: { formId: string; submissionId: string; status: string; timestamp: Date }) => {
      console.log('📝 Real-time submission update:', data);

      startTransition(() => {
        // Add optimistic update immediately
        addOptimisticUpdate({
          type: 'update',
          submissionId: data.submissionId,
          status: data.status,
        });

        // Update TanStack Query cache
        queryClient.setQueryData(['submissions', formId], (oldData: unknown) => {
          if (!oldData || typeof oldData !== 'object') return oldData;
          const typedData = oldData as { submissions: Submission[] };
          return {
            ...typedData,
            submissions: typedData.submissions.map((sub: Submission) =>
              sub.id === data.submissionId ? { ...sub, status: data.status } : sub,
            ),
          };
        });

        // Show toast notification
        toast.info('Submission updated', {
          description: `Status: ${data.status}`,
          duration: 2000,
        });
      });
    },
    [formId, queryClient, addOptimisticUpdate],
  );

  /**
   * Handle analytics update received via WebSocket
   */
  const handleAnalyticsUpdate = useCallback(
    (data: AnalyticsUpdateData) => {
      console.log('📊 Real-time analytics update:', data);

      // Update analytics query cache
      queryClient.setQueryData(['analytics', 'overview', formId], data.metrics);

      // Invalidate detailed analytics to refetch
      queryClient.invalidateQueries({ queryKey: ['analytics', formId] });
    },
    [formId, queryClient],
  );

  /**
   * Handle user activity (join/leave)
   */
  const handleUserActivity = useCallback((data: UserActivityData) => {
    console.log('👤 User activity:', data);

    setBaseState((prev) => ({
      ...prev,
      connectedUsers:
        data.action === 'joined'
          ? [...prev.connectedUsers.filter((u) => u.userId !== data.userId), data]
          : prev.connectedUsers.filter((u) => u.userId !== data.userId),
    }));
  }, []);

  /**
   * Connect to WebSocket for real-time updates
   */
  const connectToSocket = useCallback(async () => {
    if (!formId || !user || isConnectingRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;

      // Update connection status
      setBaseState((prev) => ({ ...prev, connectionStatus: 'connecting' }));

      const socket = socketRef.current;

      // Connect with authentication (use placeholder token for mock)
      await socket.connect('mock-token', `${user.firstName} ${user.lastName}`);

      // Join form room
      await socket.joinFormRoom(formId);

      // Set up event listeners
      socket.on('submission:new', handleNewSubmission);
      socket.on('submission:updated', handleSubmissionUpdate);
      socket.on('analytics:updated', handleAnalyticsUpdate);
      socket.on('user-activity', handleUserActivity);

      socket.on('error', (errorData: { message: string }) => {
        console.error('WebSocket error:', errorData);
        setBaseState((prev) => ({ ...prev, connectionStatus: 'error' }));
        toast.error('Real-time connection error', {
          description: errorData.message,
        });
      });

      // Update connection status
      setBaseState((prev) => ({ ...prev, connectionStatus: 'connected' }));

      console.log('✅ Real-time submissions connected for form:', formId);
    } catch (error) {
      console.error('Failed to connect to real-time updates:', error);
      setBaseState((prev) => ({ ...prev, connectionStatus: 'error' }));
      toast.error('Failed to connect to real-time updates');
    } finally {
      isConnectingRef.current = false;
    }
  }, [
    formId,
    user,
    handleNewSubmission,
    handleSubmissionUpdate,
    handleAnalyticsUpdate,
    handleUserActivity,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnectFromSocket = useCallback(async () => {
    const socket = socketRef.current;

    if (formId && socket.connected) {
      try {
        await socket.leaveFormRoom(formId);
      } catch (error) {
        console.error('Error leaving form room:', error);
      }
    }

    // Remove event listeners
    socket.off('submission:new', handleNewSubmission);
    socket.off('submission:updated', handleSubmissionUpdate);
    socket.off('analytics:updated', handleAnalyticsUpdate);
    socket.off('user-activity', handleUserActivity);

    setBaseState((prev) => ({ ...prev, connectionStatus: 'disconnected' }));
  }, [
    formId,
    handleNewSubmission,
    handleSubmissionUpdate,
    handleAnalyticsUpdate,
    handleUserActivity,
  ]);

  /**
   * Manually refresh submissions data
   */
  const refreshSubmissions = useCallback(async () => {
    if (!formId) return;

    startTransition(() => {
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions', formId] });
    });
  }, [formId, queryClient]);

  /**
   * Update submissions data (for external updates)
   */
  const updateSubmissions = useCallback((newSubmissions: Submission[]) => {
    startTransition(() => {
      setBaseState((prev) => ({
        ...prev,
        submissions: newSubmissions,
        lastUpdate: new Date(),
      }));
    });
  }, []);

  // Connect/disconnect when formId or user changes
  useEffect(() => {
    if (formId && user) {
      connectToSocket();
    }

    return () => {
      disconnectFromSocket();
    };
  }, [formId, user?.userId, connectToSocket, disconnectFromSocket]); // Only reconnect when form or user ID changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromSocket();
    };
  }, [disconnectFromSocket]);

  return {
    // Optimistic state (immediate UI updates)
    submissions: optimisticState.submissions,
    connectedUsers: optimisticState.connectedUsers,
    connectionStatus: optimisticState.connectionStatus,
    lastUpdate: optimisticState.lastUpdate,

    // Connection methods
    connect: connectToSocket,
    disconnect: disconnectFromSocket,

    // Data methods
    refreshSubmissions,
    updateSubmissions,

    // Status
    isConnected: optimisticState.connectionStatus === 'connected',
    isConnecting: optimisticState.connectionStatus === 'connecting' || isPending,
    hasError: optimisticState.connectionStatus === 'error',

    // Real-time stats
    totalConnectedUsers: optimisticState.connectedUsers.length,
    isRealTimeEnabled: !!formId && !!user,
  };
}
