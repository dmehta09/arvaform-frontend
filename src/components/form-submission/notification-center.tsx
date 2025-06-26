'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useRealTimeSubmissions } from '@/hooks/use-real-time-submissions';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellOff, CheckCircle, Filter, MoreVertical, Settings, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Notification types
interface NotificationItem {
  id: string;
  type: 'submission' | 'analytics' | 'user_activity' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  data?: Record<string, unknown>;
  formId?: string;
}

interface NotificationCenterProps {
  /** Form ID to filter notifications (optional) */
  formId?: string;
  /** Whether to show as a dropdown/popover */
  isCompact?: boolean;
  /** Custom notification items */
  customNotifications?: NotificationItem[];
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: NotificationItem) => void;
  /** Callback when notification is marked as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback when notification is deleted */
  onDelete?: (notificationId: string) => void;
}

/**
 * Notification Center Component
 * Displays real-time notifications with filtering and management features
 * Implements React 19 patterns and WCAG 2.1 AA accessibility
 */
export function NotificationCenter({
  formId,
  isCompact = false,
  customNotifications = [],
  onNotificationClick,
  onMarkAsRead,
  onDelete,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [internalNotifications, setInternalNotifications] = useState<NotificationItem[]>([]);

  const { isConnected, totalConnectedUsers } = useRealTimeSubmissions(formId || null);

  // Combine internal and custom notifications
  const allNotifications = useMemo(() => {
    return [...internalNotifications, ...customNotifications].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }, [internalNotifications, customNotifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((notification) => {
      if (filter === 'unread' && notification.isRead) return false;
      if (filter === 'important' && !notification.isImportant) return false;
      return true;
    });
  }, [allNotifications, filter]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  // Generate notifications from real-time events (unused for now but ready for integration)
  const _addNotification = useCallback(
    (notification: Omit<NotificationItem, 'id'>) => {
      if (!notificationsEnabled) return;

      const newNotification: NotificationItem = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
      };

      setInternalNotifications((prev) => [newNotification, ...prev.slice(0, 99)]); // Keep last 100

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.description,
          icon: '/favicon.ico',
          tag: newNotification.id,
        });
      }
    },
    [notificationsEnabled],
  );

  // Handle marking notification as read
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      setInternalNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      onMarkAsRead?.(notificationId);
    },
    [onMarkAsRead],
  );

  // Handle deleting notification
  const handleDelete = useCallback(
    (notificationId: string) => {
      setInternalNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      onDelete?.(notificationId);
    },
    [onDelete],
  );

  // Handle marking all as read
  const handleMarkAllAsRead = useCallback(() => {
    setInternalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  }, []);

  // Handle clearing all notifications
  const handleClearAll = useCallback(() => {
    setInternalNotifications([]);
    toast.success('All notifications cleared');
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Browser notifications enabled');
      }
    }
  }, []);

  // Format notification time
  const formatNotificationTime = useCallback((timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }, []);

  // Get notification icon
  const getNotificationIcon = useCallback((type: NotificationItem['type']) => {
    switch (type) {
      case 'submission':
        return '📝';
      case 'analytics':
        return '📊';
      case 'user_activity':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  }, []);

  // Notification item component
  const NotificationItemComponent = useCallback(
    ({ notification, index }: { notification: NotificationItem; index: number }) => (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{
          duration: 0.2,
          delay: index * 0.05,
          ease: 'easeOut',
        }}
        className={`group relative p-4 border-l-4 transition-all hover:bg-gray-50 cursor-pointer ${
          notification.isRead
            ? 'border-l-gray-200 bg-white'
            : notification.isImportant
              ? 'border-l-red-500 bg-red-50'
              : 'border-l-blue-500 bg-blue-50'
        }`}
        onClick={() => {
          if (!notification.isRead) {
            handleMarkAsRead(notification.id);
          }
          onNotificationClick?.(notification);
        }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 text-lg">{getNotificationIcon(notification.type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                )}
                {notification.isImportant && (
                  <Badge variant="destructive" className="text-xs">
                    Important
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notification.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{formatNotificationTime(notification.timestamp)}</span>
                {notification.formId && <span>Form: {notification.formId}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(notification.id);
                }}
                className="h-8 w-8 p-0">
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.isRead && (
                  <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    ),
    [
      formatNotificationTime,
      getNotificationIcon,
      handleMarkAsRead,
      handleDelete,
      onNotificationClick,
    ],
  );

  if (isCompact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="h-64">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.slice(0, 5).map((notification, index) => (
                  <div key={notification.id} className="px-2">
                    <NotificationItemComponent notification={notification} index={index} />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {filteredNotifications.length > 5 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">View all notifications</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={requestNotificationPermission}>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable browser notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMarkAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearAll} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>Unread only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('important')}>
                  Important only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle notifications */}
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </span>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Real-time updates active
            {totalConnectedUsers > 1 && (
              <span className="text-gray-600">• {totalConnectedUsers} users online</span>
            )}
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? "You're all caught up! New notifications will appear here."
                  : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {filteredNotifications.map((notification, index) => (
                  <NotificationItemComponent
                    key={notification.id}
                    notification={notification}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
