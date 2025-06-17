'use client';

import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useEffect, useState } from 'react';

/**
 * Debug component to monitor drag and drop events
 */
export function DndDebugPanel() {
  const [events, setEvents] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragStart = (event: CustomEvent<DragStartEvent>) => {
      console.log('🔴 Drag Start:', event.detail);
      setIsDragging(true);
      setEvents((prev) => [...prev, `🟢 Drag started: ${event.detail.active.id}`]);
    };

    const handleDragEnd = (event: CustomEvent<DragEndEvent>) => {
      console.log('🔴 Drag End:', event.detail);
      setIsDragging(false);
      setEvents((prev) => [
        ...prev,
        `🔴 Drag ended: ${event.detail.active.id} -> ${event.detail.over?.id || 'nowhere'}`,
      ]);
    };

    // Listen for custom events
    window.addEventListener('dnd-debug-start', handleDragStart as EventListener);
    window.addEventListener('dnd-debug-end', handleDragEnd as EventListener);

    return () => {
      window.removeEventListener('dnd-debug-start', handleDragStart as EventListener);
      window.removeEventListener('dnd-debug-end', handleDragEnd as EventListener);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-60 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs font-mono overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">🐛 DnD Debug</span>
        <div className={`w-2 h-2 rounded-full ${isDragging ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
      <div className="space-y-1">
        {events.length === 0 ? (
          <div className="text-gray-400">No drag events yet...</div>
        ) : (
          events.slice(-10).map((event, i) => (
            <div key={i} className="text-xs">
              {event}
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => setEvents([])}
        className="mt-2 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
        Clear
      </button>
    </div>
  );
}

/**
 * Hook to add debug events to DnD operations
 */
export function useDndDebug() {
  const emitDragStart = (event: DragStartEvent) => {
    window.dispatchEvent(new CustomEvent('dnd-debug-start', { detail: event }));
  };

  const emitDragEnd = (event: DragEndEvent) => {
    window.dispatchEvent(new CustomEvent('dnd-debug-end', { detail: event }));
  };

  return { emitDragStart, emitDragEnd };
}
