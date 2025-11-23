export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferences: Record<string, any>;
  isActive: boolean;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  language: string;
  shareToken?: string;
  isPublic: boolean;
  tags: string[];
  lastAccessed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  permission: 'owner' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Operation {
  id: string;
  documentId: string;
  userId: string;
  operationType: 'insert' | 'delete' | 'retain';
  operationData: {
    position?: number;
    length?: number;
    text?: string;
    attributes?: Record<string, any>;
  };
  documentVersion: number;
  createdAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content: string;
  changeSummary?: string;
  isManual: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Socket.io related types
export interface SocketUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  color: string;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

export interface UserCursor {
  userId: string;
  userName: string;
  position: CursorPosition;
  selection?: SelectionRange;
  color: string;
  isActive: boolean;
  lastSeen: Date;
}

export interface SocketMessage {
  type: string;
  data: any;
  timestamp: number;
  userId: string;
  documentId: string;
}

// Socket event types
export interface JoinDocumentEvent {
  documentId: string;
  userId: string;
}

export interface LeaveDocumentEvent {
  documentId: string;
  userId: string;
}

export interface TextOperationEvent {
  operation: Operation;
  documentId: string;
  version: number;
}

export interface CursorPositionEvent {
  position: CursorPosition;
  selection?: SelectionRange;
  documentId: string;
}

export interface TypingEvent {
  documentId: string;
}

export interface VideoCallRequestEvent {
  targetUserId: string;
  documentId: string;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content?: string;
  language?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  language?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface ShareDocumentRequest {
  permission: 'editor' | 'viewer';
  expiresIn?: number; // hours
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Operational transformation types
export interface TextOperation {
  ops: Array<['insert', string] | ['delete', number] | ['retain', number]>;
  baseLength: number;
  targetLength: number;
}