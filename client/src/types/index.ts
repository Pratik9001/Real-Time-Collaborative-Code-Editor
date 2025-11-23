// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferences: Record<string, any>;
  isActive: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Document types
export interface Document {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  language: string;
  shareToken?: string;
  isPublic: boolean;
  tags: string[];
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
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

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

// Socket types
export interface SocketUser {
  userId: string;
  userName: string;
  position: CursorPosition;
  selection?: SelectionRange;
  color: string;
  isActive: boolean;
  lastSeen: string;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
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
  createdAt: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Store types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DocumentState {
  currentDocument: Document | null;
  documents: Document[];
  activeUsers: SocketUser[];
  isLoading: boolean;
  error: string | null;
}

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'c', label: 'C', extension: 'c' },
  { value: 'csharp', label: 'C#', extension: 'cs' },
  { value: 'php', label: 'PHP', extension: 'php' },
  { value: 'ruby', label: 'Ruby', extension: 'rb' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'rust', label: 'Rust', extension: 'rs' },
  { value: 'swift', label: 'Swift', extension: 'swift' },
  { value: 'kotlin', label: 'Kotlin', extension: 'kt' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'json', label: 'JSON', extension: 'json' },
  { value: 'xml', label: 'XML', extension: 'xml' },
  { value: 'yaml', label: 'YAML', extension: 'yaml' },
  { value: 'markdown', label: 'Markdown', extension: 'md' },
  { value: 'sql', label: 'SQL', extension: 'sql' },
  { value: 'shell', label: 'Shell', extension: 'sh' },
  { value: 'plaintext', label: 'Plain Text', extension: 'txt' },
] as const;

export type LanguageOption = typeof LANGUAGE_OPTIONS[number];