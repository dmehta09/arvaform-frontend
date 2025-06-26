import { io, Socket } from 'socket.io-client';

// Import submission types from existing types
type SubmissionData = Record<string, unknown>;

// WebSocket Event Types for TypeScript strict typing
export interface SubmissionEventData {
  formId: string;
  submissionId: string;
  submission: SubmissionData;
  timestamp: Date;
  userId: string;
  username: string;
}

export interface AnalyticsUpdateData {
  formId: string;
  metrics: {
    totalSubmissions: number;
    todaySubmissions: number;
    completionRate: number;
    lastSubmissionAt: Date;
  };
}

export interface UserActivityData {
  formId: string;
  userId: string;
  username: string;
  action: 'joined' | 'left';
  timestamp: Date;
}

export interface ConnectionData {
  message: string;
  userId: string;
  username: string;
}

export interface ErrorData {
  message: string;
}

// Socket Event Listeners Interface
export interface SocketEventListeners {
  connected: (data: ConnectionData) => void;
  'submission:new': (data: SubmissionEventData) => void;
  'submission:updated': (data: {
    formId: string;
    submissionId: string;
    status: string;
    timestamp: Date;
  }) => void;
  'analytics:updated': (data: AnalyticsUpdateData) => void;
  'user-activity': (data: UserActivityData) => void;
  'joined-form-room': (data: { formId: string; message: string }) => void;
  'left-form-room': (data: { formId: string; message: string }) => void;
  error: (data: ErrorData) => void;
  ping: () => void;
}

// Event listener function type
type EventListener = (...args: unknown[]) => void;

/**
 * WebSocket Client for Real-time Submission Updates
 * Implements 2025 best practices with TypeScript strict mode, reconnection logic, and proper cleanup
 */
export class SubmissionSocket {
  private socket: Socket | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private joinedRooms: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private readonly logger = console; // Use console for logging in browser

  constructor(
    private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ) {}

  /**
   * Connect to WebSocket server with authentication
   * @param token - JWT token for authentication
   * @param username - Username for identification
   * @returns Promise<void>
   */
  async connect(token: string, username?: string): Promise<void> {
    if (this.isConnected || this.connectionPromise) {
      return this.connectionPromise || Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Create socket connection with authentication
        this.socket = io(`${this.baseUrl}/real-time`, {
          auth: {
            token,
            username: username || 'User',
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        // Connection event handlers
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.logger.log('✅ WebSocket connected successfully');

          // Rejoin previously joined rooms
          this.rejoinRooms();

          resolve();
        });

        this.socket.on('connected', (data: ConnectionData) => {
          this.logger.log('🔌 WebSocket authenticated:', data.message);
          this.emitEvent('connected', data);
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          this.logger.warn('❌ WebSocket disconnected:', reason);

          // Attempt reconnection for certain disconnect reasons
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            this.reconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          this.logger.error('🚫 WebSocket connection error:', error);
          this.isConnected = false;
          this.reconnectAttempts++;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        // Set up event listeners
        this.setupEventListeners();

        // Handle heartbeat
        this.socket.on('ping', () => {
          this.socket?.emit('pong');
        });
      } catch (error) {
        this.logger.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.connectionPromise = null;
    this.joinedRooms.clear();
    this.eventListeners.clear();
    this.logger.log('🔌 WebSocket disconnected');
  }

  /**
   * Join a form room for real-time updates
   * @param formId - Form ID to join
   * @returns Promise<void>
   */
  async joinFormRoom(formId: string): Promise<void> {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout joining form room'));
      }, 5000);

      this.socket!.emit('join-form-room', { formId });

      this.socket!.once('joined-form-room', (data) => {
        clearTimeout(timeout);
        this.joinedRooms.add(formId);
        this.logger.log(`📝 Joined form room: ${formId}`);
        this.emitEvent('joined-form-room', data);
        resolve();
      });

      this.socket!.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message));
      });
    });
  }

  /**
   * Leave a form room
   * @param formId - Form ID to leave
   * @returns Promise<void>
   */
  async leaveFormRoom(formId: string): Promise<void> {
    if (!this.isConnected || !this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.socket!.emit('leave-form-room', { formId });
      this.joinedRooms.delete(formId);
      this.logger.log(`📝 Left form room: ${formId}`);
      resolve();
    });
  }

  /**
   * Add event listener for WebSocket events
   * @param event - Event name
   * @param listener - Event listener function
   */
  on<K extends keyof SocketEventListeners>(event: K, listener: SocketEventListeners[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener as EventListener);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param listener - Event listener function
   */
  off<K extends keyof SocketEventListeners>(event: K, listener: SocketEventListeners[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener as EventListener);
    }
  }

  /**
   * Get connection status
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get list of joined rooms
   */
  get rooms(): string[] {
    return Array.from(this.joinedRooms);
  }

  /**
   * Setup internal event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Listen for submission events
    this.socket.on('submission:new', (data: SubmissionEventData) => {
      this.logger.log('📥 New submission received:', data);
      this.emitEvent('submission:new', data);
    });

    this.socket.on('submission:updated', (data) => {
      this.logger.log('📝 Submission updated:', data);
      this.emitEvent('submission:updated', data);
    });

    this.socket.on('analytics:updated', (data: AnalyticsUpdateData) => {
      this.logger.log('📊 Analytics updated:', data);
      this.emitEvent('analytics:updated', data);
    });

    this.socket.on('user-activity', (data: UserActivityData) => {
      this.logger.log('👤 User activity:', data);
      this.emitEvent('user-activity', data);
    });

    this.socket.on('error', (data: ErrorData) => {
      this.logger.error('❌ WebSocket error:', data);
      this.emitEvent('error', data);
    });
  }

  /**
   * Emit event to registered listeners
   */
  private emitEvent(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          this.logger.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Rejoin rooms after reconnection
   */
  private async rejoinRooms(): Promise<void> {
    const roomsToRejoin = Array.from(this.joinedRooms);
    this.joinedRooms.clear();

    for (const formId of roomsToRejoin) {
      try {
        await this.joinFormRoom(formId);
      } catch (error) {
        this.logger.error(`Failed to rejoin room ${formId}:`, error);
      }
    }
  }

  /**
   * Attempt manual reconnection
   */
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(
        () => {
          if (this.socket) {
            this.socket.connect();
          }
        },
        Math.pow(2, this.reconnectAttempts) * 1000,
      ); // Exponential backoff
    }
  }
}

// Singleton instance
let socketInstance: SubmissionSocket | null = null;

/**
 * Get singleton WebSocket instance
 * @returns SubmissionSocket instance
 */
export function getSocketInstance(): SubmissionSocket {
  if (!socketInstance) {
    socketInstance = new SubmissionSocket();
  }
  return socketInstance;
}

/**
 * Clean up socket instance (useful for hot reload in development)
 */
export function cleanupSocketInstance(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
