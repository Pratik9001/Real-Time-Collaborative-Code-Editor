// User colors for cursors and avatars
export const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B739', // Orange
  '#52C777'  // Emerald
];

// Generate a consistent color for a user based on their ID
export const getUserColor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

// Generate initials from display name or username
export const getUserInitials = (displayName?: string, username?: string): string => {
  const name = displayName || username || 'User';
  const parts = name.trim().split(' ');

  if (parts.length >= 2) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  } else {
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  }
};

// API constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  DOCUMENTS: {
    BASE: '/documents',
    SHARE: '/documents/:id/share',
    SHARED: '/documents/shared/:shareToken',
    USERS: '/documents/:id/users',
  },
} as const;

// Socket event constants
export const SOCKET_EVENTS = {
  // Client to server
  JOIN_DOCUMENT: 'join_document',
  LEAVE_DOCUMENT: 'leave_document',
  TEXT_OPERATION: 'text_operation',
  CURSOR_POSITION: 'cursor_position',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  VIDEO_CALL_REQUEST: 'video_call_request',
  VIDEO_CALL_SIGNAL: 'video_call_signal',

  // Server to client
  DOCUMENT_CONTENT: 'document_content',
  OPERATION_APPLIED: 'operation_applied',
  USER_CURSOR: 'user_cursor',
  USER_TYPING: 'user_typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  VIDEO_CALL_REQUEST: 'video_call_request',
  VIDEO_CALL_SIGNAL: 'video_call_signal',
  ERROR: 'error',
} as const;

// Editor constants
export const EDITOR_CONFIG = {
  DEFAULT_LANGUAGE: 'javascript',
  THEME: 'vs-dark',
  MIN_MAP: true,
  WORD_WRAP: 'on',
  FONT_SIZE: 14,
  FONT_FAMILY: 'JetBrains Mono, monospace',
  TAB_SIZE: 2,
  INSERT_SPACES: true,
} as const;

// Debounce constants
export const DEBOUNCE_TIMES = {
  CURSOR_POSITION: 50, // ms
  TYPING_INDICATOR: 500, // ms
  TEXT_OPERATION: 100, // ms
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER_PREFERENCES: 'userPreferences',
  RECENT_DOCUMENTS: 'recentDocuments',
  EDITOR_SETTINGS: 'editorSettings',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully',
  PASSWORD_CHANGED: 'Password changed successfully',

  // Documents
  DOCUMENT_CREATED: 'Document created successfully',
  DOCUMENT_UPDATED: 'Document updated successfully',
  DOCUMENT_DELETED: 'Document deleted successfully',
  DOCUMENT_SHARED: 'Document shared successfully',

  // Errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Validation patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;