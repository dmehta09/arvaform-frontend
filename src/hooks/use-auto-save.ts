/**
 * Auto-Save Hook for Form Builder - 2025 Edition
 *
 * React hook that integrates the auto-save engine with form builder components.
 * Provides auto-save functionality with React 19 optimizations and state management.
 *
 * Features:
 * - Automatic saving with configurable intervals
 * - Manual save triggering
 * - Save status tracking and feedback
 * - Network failure handling
 * - Conflict resolution support
 * - Performance optimization with React 19 patterns
 */

import {
  AutoSaveConfig,
  AutoSaveEngine,
  AutoSaveEvent,
  AutoSaveEventPayload,
  AutoSaveState,
  SaveResult,
} from '@/lib/auto-save/auto-save-engine';
import { FormBuilderState } from '@/types/form-builder.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Auto-save hook configuration
 */
export interface UseAutoSaveConfig extends Partial<AutoSaveConfig> {
  /** Form ID for identification */
  formId: string;
  /** API endpoint for saving */
  endpoint?: string;
  /** Enable auto-save (default: true) */
  enabled?: boolean;
  /** Additional metadata to include with saves */
  metadata?: Record<string, unknown>;
}

/**
 * Auto-save hook return type
 */
export interface UseAutoSaveReturn {
  /** Current auto-save state */
  state: AutoSaveState;
  /** Trigger immediate save */
  save: () => Promise<SaveResult>;
  /** Trigger debounced save */
  triggerSave: (immediate?: boolean) => void;
  /** Check if auto-save is enabled */
  isEnabled: boolean;
  /** Enable/disable auto-save */
  setEnabled: (enabled: boolean) => void;
  /** Get last save timestamp */
  getLastSaved: () => Date | null;
  /** Check if there are pending changes */
  hasPendingChanges: () => boolean;
  /** Add event listener for auto-save events */
  addEventListener: (
    event: AutoSaveEvent,
    listener: (payload: AutoSaveEventPayload) => void,
  ) => void;
  /** Remove event listener */
  removeEventListener: (
    event: AutoSaveEvent,
    listener: (payload: AutoSaveEventPayload) => void,
  ) => void;
}

/**
 * Default auto-save configuration
 */
const DEFAULT_CONFIG: UseAutoSaveConfig = {
  formId: '',
  interval: 30000, // 30 seconds
  debounceMs: 1000, // 1 second
  maxRetries: 3,
  retryMultiplier: 1.5,
  enableOptimisticUpdates: true,
  enableOfflinePersistence: true,
  enableConflictResolution: true,
  enabled: true,
};

/**
 * Auto-save hook for form builder
 *
 * Provides comprehensive auto-save functionality with React integration:
 * - Automatic periodic saving
 * - Manual save triggering
 * - Real-time status updates
 * - Error handling and recovery
 * - Event-driven architecture
 *
 * @param formState - Current form builder state
 * @param config - Auto-save configuration
 * @returns Auto-save utilities and state
 */
export function useAutoSave(
  formState: FormBuilderState,
  config: UseAutoSaveConfig,
): UseAutoSaveReturn {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const [isEnabled, setIsEnabled] = useState(mergedConfig.enabled ?? true);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    lastError: null,
    pendingChanges: false,
    retryCount: 0,
  });

  // Use refs to maintain stable references across renders
  const engineRef = useRef<AutoSaveEngine | null>(null);
  const previousStateRef = useRef<FormBuilderState>(formState);
  const eventListenersRef = useRef<
    Map<AutoSaveEvent, Set<(payload: AutoSaveEventPayload) => void>>
  >(new Map());

  // Create save function for API calls
  const saveFunction = useCallback(
    async (state: FormBuilderState, metadata?: Record<string, unknown>): Promise<SaveResult> => {
      try {
        const endpoint = mergedConfig.endpoint || `/api/forms/${mergedConfig.formId}`;
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formState: state,
            metadata: {
              ...mergedConfig.metadata,
              ...metadata,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Save failed: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          data,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('Auto-save failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        };
      }
    },
    [mergedConfig.endpoint, mergedConfig.formId, mergedConfig.metadata],
  );

  // Initialize auto-save engine
  useEffect(() => {
    if (!isEnabled) return;

    engineRef.current = new AutoSaveEngine(saveFunction, mergedConfig);

    // Set up event listeners for state updates
    const handleStateUpdate = () => {
      setAutoSaveState({ ...engineRef.current!.getState() });
    };

    // Listen to all auto-save events
    const events: AutoSaveEvent[] = [
      'save-started',
      'save-completed',
      'save-failed',
      'conflict-detected',
      'offline-detected',
      'online-restored',
    ];

    events.forEach((event) => {
      engineRef.current!.addEventListener(event, handleStateUpdate);
    });

    console.log('🔄 Auto-save engine initialized for form:', mergedConfig.formId);

    return () => {
      if (engineRef.current) {
        events.forEach((event) => {
          engineRef.current!.removeEventListener(event, handleStateUpdate);
        });
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [isEnabled, saveFunction, mergedConfig]);

  // Trigger save when form state changes
  useEffect(() => {
    if (!isEnabled || !engineRef.current) return;

    // Check if state has actually changed
    if (previousStateRef.current !== formState) {
      engineRef.current.triggerSave(formState, mergedConfig.metadata);
      previousStateRef.current = formState;
    }
  }, [formState, isEnabled, mergedConfig.metadata]);

  // Manual save function
  const save = useCallback(async (): Promise<SaveResult> => {
    if (!engineRef.current) {
      return {
        success: false,
        error: 'Auto-save engine not initialized',
        timestamp: new Date(),
      };
    }

    return await engineRef.current.forceSave(formState, mergedConfig.metadata);
  }, [formState, mergedConfig.metadata]);

  // Trigger save with optional immediate flag
  const triggerSave = useCallback(
    (immediate = false) => {
      if (!engineRef.current) return;

      engineRef.current.triggerSave(formState, mergedConfig.metadata, immediate);
    },
    [formState, mergedConfig.metadata],
  );

  // Get last saved timestamp
  const getLastSaved = useCallback((): Date | null => {
    return engineRef.current?.getState().lastSaved || null;
  }, []);

  // Check for pending changes
  const hasPendingChanges = useCallback((): boolean => {
    return engineRef.current?.hasPendingChanges() || false;
  }, []);

  // Add event listener
  const addEventListener = useCallback(
    (event: AutoSaveEvent, listener: (payload: AutoSaveEventPayload) => void) => {
      if (!eventListenersRef.current.has(event)) {
        eventListenersRef.current.set(event, new Set());
      }
      eventListenersRef.current.get(event)!.add(listener);

      // Also add to engine if available
      engineRef.current?.addEventListener(event, listener);
    },
    [],
  );

  // Remove event listener
  const removeEventListener = useCallback(
    (event: AutoSaveEvent, listener: (payload: AutoSaveEventPayload) => void) => {
      eventListenersRef.current.get(event)?.delete(listener);

      // Also remove from engine if available
      engineRef.current?.removeEventListener(event, listener);
    },
    [],
  );

  return {
    state: autoSaveState,
    save,
    triggerSave,
    isEnabled,
    setEnabled: setIsEnabled,
    getLastSaved,
    hasPendingChanges,
    addEventListener,
    removeEventListener,
  };
}

/**
 * Hook for auto-save status display
 * Provides formatted status messages for UI display
 */
export function useAutoSaveStatus(autoSaveState: AutoSaveState) {
  return {
    statusText: getStatusText(autoSaveState.status),
    statusColor: getStatusColor(autoSaveState.status),
    showSpinner: autoSaveState.status === 'saving',
    lastSavedText: formatLastSaved(autoSaveState.lastSaved),
  };
}

// Helper functions
function getStatusText(status: AutoSaveState['status']): string {
  switch (status) {
    case 'idle':
      return 'Ready';
    case 'saving':
      return 'Saving...';
    case 'saved':
      return 'Saved';
    case 'error':
      return 'Save failed';
    case 'offline':
      return 'Offline';
    case 'conflict':
      return 'Conflict detected';
    default:
      return 'Unknown';
  }
}

function getStatusColor(status: AutoSaveState['status']): string {
  switch (status) {
    case 'idle':
      return 'text-gray-500';
    case 'saving':
      return 'text-blue-500';
    case 'saved':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'offline':
      return 'text-orange-500';
    case 'conflict':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

function formatLastSaved(lastSaved: Date | null): string {
  if (!lastSaved) return 'Never saved';

  const now = new Date();
  const diffMs = now.getTime() - lastSaved.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 60) {
    return 'Saved just now';
  } else if (diffMinutes < 60) {
    return `Saved ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  }
}
