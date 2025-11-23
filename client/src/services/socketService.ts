import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, DEBOUNCE_TIMES } from '@/utils/constants';
import { UserCursor, Operation, CursorPosition, SelectionRange } from '@/types';

type SocketEventHandler = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, SocketEventHandler[]> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  connect(accessToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io({
        auth: {
          token: accessToken,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
    this.clearAllDebounceTimers();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Forward all events to registered handlers
    this.socket.onAny((event, ...args) => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(...args);
          } catch (error) {
            console.error(`Error in socket event handler for ${event}:`, error);
          }
        });
      }
    });
  }

  // Event listener management
  on(event: string, handler: SocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: SocketEventHandler): void {
    if (!this.eventHandlers.has(event)) return;

    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  // Document operations
  joinDocument(documentId: string, userId: string): void {
    this.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId, userId });
  }

  leaveDocument(documentId: string, userId: string): void {
    this.emit(SOCKET_EVENTS.LEAVE_DOCUMENT, { documentId, userId });
  }

  sendTextOperation(operation: Operation, documentId: string, version: number): void {
    this.emit(SOCKET_EVENTS.TEXT_OPERATION, {
      operation,
      documentId,
      version,
    });
  }

  sendCursorPosition(position: CursorPosition, selection?: SelectionRange): void {
    const eventKey = `cursor_position_${position.line}_${position.column}`;

    // Debounce cursor position updates
    this.debounceEvent(eventKey, () => {
      this.emit(SOCKET_EVENTS.CURSOR_POSITION, {
        position,
        selection,
      });
    }, DEBOUNCE_TIMES.CURSOR_POSITION);
  }

  startTyping(documentId: string): void {
    this.emit(SOCKET_EVENTS.TYPING_START, { documentId });
  }

  stopTyping(documentId: string): void {
    this.emit(SOCKET_EVENTS.TYPING_STOP, { documentId });
  }

  // Video call operations
  requestVideoCall(targetUserId: string, documentId: string): void {
    this.emit(SOCKET_EVENTS.VIDEO_CALL_REQUEST, {
      targetUserId,
      documentId,
    });
  }

  sendVideoCallSignal(targetUserId: string, signal: any, documentId: string): void {
    this.emit(SOCKET_EVENTS.VIDEO_CALL_SIGNAL, {
      targetUserId,
      signal,
      documentId,
    });
  }

  private emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Attempted to emit event while not connected:', event);
    }
  }

  private debounceEvent(key: string, fn: () => void, delay: number): void {
    // Clear existing timer for this key
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      fn();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  private clearAllDebounceTimers(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Create singleton instance
export const socketService = new SocketService();

export default socketService;