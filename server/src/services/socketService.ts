import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { AuthService } from './authService';
import { DocumentService } from './documentService';
import { OperationService } from './operationService';
import {
  joinDocumentSchema,
  textOperationSchema,
  cursorPositionSchema,
  typingEventSchema,
  videoCallRequestSchema
} from '../utils/validation';
import { JwtPayload, UserCursor, Operation, CursorPosition, SelectionRange } from '../types';
import { getUserColor, getUserInitials } from '../utils/colors';
import { createError } from '../middleware/errorHandler';
import { redisClient } from '../index';

interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
  currentDocument?: string;
  color?: string;
}

interface DocumentRoom {
  documentId: string;
  users: Map<string, UserCursor>;
  operations: Operation[];
  lastOperationVersion: number;
}

// In-memory storage for active document rooms
const documentRooms = new Map<string, DocumentRoom>();

// Typing state tracking
const typingUsers = new Map<string, Map<string, number>>(); // documentId -> Map<userId, lastTypingTime>

export const initializeSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await AuthService.getUserById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = decoded;
      socket.color = getUserColor(decoded.userId);
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.username} connected (${socket.id})`);

    // Join document room
    socket.on('join_document', async (data: { documentId: string }) => {
      try {
        const { error } = joinDocumentSchema.validate(data);
        if (error) {
          socket.emit('error', { message: error.details[0].message });
          return;
        }

        const { documentId } = data;

        // Check if user has access to document
        const document = await DocumentService.getDocumentById(documentId, socket.user!.userId);
        if (!document) {
          socket.emit('error', { message: 'Document not found or access denied' });
          return;
        }

        // Leave previous document if any
        if (socket.currentDocument) {
          socket.leave(socket.currentDocument);
          await handleUserLeaveDocument(socket, socket.currentDocument);
        }

        // Join new document room
        socket.join(documentId);
        socket.currentDocument = documentId;

        // Get or create document room
        if (!documentRooms.has(documentId)) {
          documentRooms.set(documentId, {
            documentId,
            users: new Map(),
            operations: [],
            lastOperationVersion: 0
          });
        }

        const room = documentRooms.get(documentId)!;

        // Add user to room
        const userCursor: UserCursor = {
          userId: socket.user!.userId,
          userName: socket.user!.username,
          position: { line: 0, column: 0 },
          color: socket.color!,
          isActive: true,
          lastSeen: new Date()
        };

        room.users.set(socket.user!.userId, userCursor);

        // Get document content from database
        const documentContent = document.content;
        const documentVersion = await OperationService.getDocumentVersion(documentId);

        // Send document content to user
        socket.emit('document_content', {
          content: documentContent,
          version: documentVersion,
          users: Array.from(room.users.values())
        });

        // Notify other users
        socket.to(documentId).emit('user_joined', {
          user: userCursor
        });

        console.log(`User ${socket.user!.username} joined document ${documentId}`);
      } catch (error) {
        console.error('Error joining document:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // Leave document room
    socket.on('leave_document', async () => {
      if (socket.currentDocument) {
        await handleUserLeaveDocument(socket, socket.currentDocument);
        socket.leave(socket.currentDocument);
        socket.currentDocument = undefined;
      }
    });

    // Handle text operations
    socket.on('text_operation', async (data: any) => {
      try {
        const { error } = textOperationSchema.validate(data);
        if (error) {
          socket.emit('error', { message: error.details[0].message });
          return;
        }

        if (!socket.currentDocument) {
          socket.emit('error', { message: 'Not joined to any document' });
          return;
        }

        const { operation, documentId, version } = data;

        // Check user permissions
        const hasPermission = await DocumentService.checkDocumentPermission(
          documentId,
          socket.user!.userId,
          'editor'
        );

        if (!hasPermission) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        // Process operation through operational transformation
        const processedOperation = await OperationService.processOperation(
          documentId,
          operation,
          version,
          socket.user!.userId
        );

        // Update document in database
        await DocumentService.updateDocument(documentId, socket.user!.userId, {
          content: processedOperation.newContent
        });

        // Broadcast operation to all users in the document
        io.to(documentId).emit('operation_applied', {
          operation: processedOperation.operation,
          userId: socket.user!.userId,
          version: processedOperation.newVersion
        });

        console.log(`Operation applied by ${socket.user!.username} in document ${documentId}`);
      } catch (error) {
        console.error('Error processing operation:', error);
        socket.emit('error', { message: 'Failed to process operation' });
      }
    });

    // Handle cursor position updates
    socket.on('cursor_position', (data: any) => {
      try {
        const { error } = cursorPositionSchema.validate(data);
        if (error) {
          return; // Silently ignore invalid cursor data
        }

        if (!socket.currentDocument) {
          return;
        }

        const { position, selection } = data;
        const room = documentRooms.get(socket.currentDocument);

        if (!room) {
          return;
        }

        // Update user cursor in room
        const userCursor = room.users.get(socket.user!.userId);
        if (userCursor) {
          userCursor.position = position;
          userCursor.selection = selection;
          userCursor.lastSeen = new Date();

          // Broadcast cursor update to other users
          socket.to(socket.currentDocument).emit('user_cursor', {
            userId: socket.user!.userId,
            position,
            selection,
            color: socket.color
          });
        }
      } catch (error) {
        console.error('Error updating cursor position:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: any) => {
      try {
        const { error } = typingEventSchema.validate(data);
        if (error) {
          return;
        }

        if (!socket.currentDocument || data.documentId !== socket.currentDocument) {
          return;
        }

        // Add user to typing list
        if (!typingUsers.has(data.documentId)) {
          typingUsers.set(data.documentId, new Map());
        }

        typingUsers.get(data.documentId)!.set(socket.user!.userId, Date.now());

        // Broadcast typing indicator
        socket.to(data.documentId).emit('user_typing', {
          userId: socket.user!.userId,
          userName: socket.user!.username,
          isTyping: true
        });

        // Clear typing indicator after 3 seconds of inactivity
        setTimeout(() => {
          const typingMap = typingUsers.get(data.documentId);
          if (typingMap && typingMap.has(socket.user!.userId)) {
            const lastTypingTime = typingMap.get(socket.user!.userId)!;
            if (Date.now() - lastTypingTime >= 3000) {
              typingMap.delete(socket.user!.userId);
              socket.to(data.documentId).emit('user_typing', {
                userId: socket.user!.userId,
                userName: socket.user!.username,
                isTyping: false
              });
            }
          }
        }, 3000);
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    socket.on('typing_stop', (data: any) => {
      try {
        const { error } = typingEventSchema.validate(data);
        if (error) {
          return;
        }

        if (!socket.currentDocument || data.documentId !== socket.currentDocument) {
          return;
        }

        // Remove user from typing list
        const typingMap = typingUsers.get(data.documentId);
        if (typingMap) {
          typingMap.delete(socket.user!.userId);

          // Broadcast stop typing indicator
          socket.to(data.documentId).emit('user_typing', {
            userId: socket.user!.userId,
            userName: socket.user!.username,
            isTyping: false
          });
        }
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    // Handle video call requests
    socket.on('video_call_request', (data: any) => {
      try {
        const { error } = videoCallRequestSchema.validate(data);
        if (error) {
          socket.emit('error', { message: error.details[0].message });
          return;
        }

        const { targetUserId, documentId } = data;

        if (!socket.currentDocument || socket.currentDocument !== documentId) {
          socket.emit('error', { message: 'Not in the specified document' });
          return;
        }

        // Forward video call request to target user
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
          (s: any) => s.user?.userId === targetUserId && s.currentDocument === documentId
        );

        if (targetSocket) {
          targetSocket.emit('video_call_request', {
            fromUserId: socket.user!.userId,
            fromUserName: socket.user!.username,
            documentId
          });
        } else {
          socket.emit('error', { message: 'User not available for video call' });
        }
      } catch (error) {
        console.error('Error handling video call request:', error);
        socket.emit('error', { message: 'Failed to initiate video call' });
      }
    });

    // Handle video call signaling
    socket.on('video_call_signal', (data: any) => {
      try {
        const { targetUserId, signal, documentId } = data;

        if (!socket.currentDocument || socket.currentDocument !== documentId) {
          return;
        }

        // Forward signal to target user
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
          (s: any) => s.user?.userId === targetUserId && s.currentDocument === documentId
        );

        if (targetSocket) {
          targetSocket.emit('video_call_signal', {
            fromUserId: socket.user!.userId,
            signal
          });
        }
      } catch (error) {
        console.error('Error handling video call signal:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user?.username} disconnected (${socket.id})`);

      if (socket.currentDocument) {
        await handleUserLeaveDocument(socket, socket.currentDocument);
      }
    });
  });

  // Helper function to handle user leaving a document
  async function handleUserLeaveDocument(socket: AuthenticatedSocket, documentId: string) {
    const room = documentRooms.get(documentId);
    if (room) {
      room.users.delete(socket.user!.userId);

      // Notify other users
      socket.to(documentId).emit('user_left', {
        userId: socket.user!.userId
      });

      // Clean up room if empty
      if (room.users.size === 0) {
        documentRooms.delete(documentId);
      }
    }

    // Remove from typing users
    const typingMap = typingUsers.get(documentId);
    if (typingMap) {
      typingMap.delete(socket.user!.userId);
      socket.to(documentId).emit('user_typing', {
        userId: socket.user!.userId,
        userName: socket.user!.username,
        isTyping: false
      });
    }
  }
};