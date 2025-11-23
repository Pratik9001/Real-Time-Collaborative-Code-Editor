import { create } from 'zustand';
import { DocumentState, Document, UserCursor, Operation, CursorPosition, SelectionRange } from '@/types';
import { documentsAPI } from '@/utils/api';
import { socketService, SOCKET_EVENTS } from '@/services/socketService';
import toast from 'react-hot-toast';

interface DocumentStore extends DocumentState {
  // Current document state
  currentVersion: number;
  isEditorReady: boolean;

  // Actions
  loadDocuments: (params?: any) => Promise<void>;
  createDocument: (documentData: any) => Promise<Document>;
  loadDocument: (id: string) => Promise<void>;
  updateDocument: (updates: any) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  shareDocument: (id: string, shareData: any) => Promise<any>;

  // Real-time collaboration actions
  joinDocument: (documentId: string) => Promise<void>;
  leaveDocument: () => void;
  sendOperation: (operation: Operation) => void;
  sendCursorPosition: (position: CursorPosition, selection?: SelectionRange) => void;
  startTyping: () => void;
  stopTyping: () => void;

  // Internal state updates
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  setActiveUsers: (users: UserCursor[]) => void;
  updateActiveUser: (userId: string, updates: Partial<UserCursor>) => void;
  removeActiveUser: (userId: string) => void;
  setEditorReady: (ready: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial state
  currentDocument: null,
  documents: [],
  activeUsers: [],
  currentVersion: 0,
  isEditorReady: false,
  isLoading: false,
  error: null,

  // Document management actions
  loadDocuments: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const { documents } = await documentsAPI.getDocuments(params);
      set({ documents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load documents', isLoading: false });
      throw error;
    }
  },

  createDocument: async (documentData) => {
    try {
      set({ isLoading: true, error: null });
      const document = await documentsAPI.createDocument(documentData);
      set(state => ({
        documents: [document, ...state.documents],
        isLoading: false,
      }));
      toast.success('Document created successfully');
      return document;
    } catch (error) {
      set({ error: 'Failed to create document', isLoading: false });
      throw error;
    }
  },

  loadDocument: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const document = await documentsAPI.getDocument(id);
      set({ currentDocument: document, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load document', isLoading: false });
      throw error;
    }
  },

  updateDocument: async (updates) => {
    try {
      const { currentDocument } = get();
      if (!currentDocument) throw new Error('No document loaded');

      const updatedDocument = await documentsAPI.updateDocument(currentDocument.id, updates);
      set({ currentDocument: updatedDocument });
    } catch (error) {
      set({ error: 'Failed to update document' });
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await documentsAPI.deleteDocument(id);
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id),
        currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
      }));
      toast.success('Document deleted successfully');
    } catch (error) {
      set({ error: 'Failed to delete document' });
      throw error;
    }
  },

  shareDocument: async (id: string, shareData) => {
    try {
      const result = await documentsAPI.shareDocument(id, shareData);
      toast.success('Document shared successfully');
      return result;
    } catch (error) {
      set({ error: 'Failed to share document' });
      throw error;
    }
  },

  // Real-time collaboration actions
  joinDocument: async (documentId: string) => {
    const { user } = await import('./authStore').then(module => module.useAuthStore.getState());

    if (!user) {
      toast.error('You must be logged in to collaborate');
      return;
    }

    // Set up socket event listeners
    socketService.on(SOCKET_EVENTS.DOCUMENT_CONTENT, (data) => {
      const { content, version, users } = data;
      set(state => ({
        currentVersion: version,
        activeUsers: users,
      }));

      // Update editor content
      if (state.isEditorReady) {
        const event = new CustomEvent('document-content', {
          detail: { content, version }
        });
        window.dispatchEvent(event);
      }
    });

    socketService.on(SOCKET_EVENTS.OPERATION_APPLIED, (data) => {
      const { operation, userId, version } = data;

      // Don't apply own operations
      if (userId === user.id) return;

      set({ currentVersion: version });

      // Apply operation to editor
      if (get().isEditorReady) {
        const event = new CustomEvent('operation-applied', {
          detail: { operation }
        });
        window.dispatchEvent(event);
      }
    });

    socketService.on(SOCKET_EVENTS.USER_CURSOR, (data) => {
      const { userId, position, selection, color } = data;
      get().updateActiveUser(userId, { position, selection, color });
    });

    socketService.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      const { userId, userName, isTyping } = data;
      get().updateActiveUser(userId, { isActive: isTyping });
    });

    socketService.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      const { user } = data;
      get().updateActiveUser(user.userId, user);
      toast.success(`${user.userName} joined the document`);
    });

    socketService.on(SOCKET_EVENTS.USER_LEFT, (data) => {
      const { userId } = data;
      get().removeActiveUser(userId);
    });

    socketService.on(SOCKET_EVENTS.ERROR, (data) => {
      const { message } = data;
      toast.error(message);
    });

    // Join the document
    socketService.joinDocument(documentId, user.id);
  },

  leaveDocument: () => {
    const { currentDocument } = get();
    if (currentDocument) {
      const { user } = import('./authStore').then(module => module.useAuthStore.getState());
      if (user) {
        socketService.leaveDocument(currentDocument.id, user.id);
      }
    }

    // Clean up socket listeners
    [
      SOCKET_EVENTS.DOCUMENT_CONTENT,
      SOCKET_EVENTS.OPERATION_APPLIED,
      SOCKET_EVENTS.USER_CURSOR,
      SOCKET_EVENTS.USER_TYPING,
      SOCKET_EVENTS.USER_JOINED,
      SOCKET_EVENTS.USER_LEFT,
      SOCKET_EVENTS.ERROR,
    ].forEach(event => {
      socketService.off(event);
    });

    set({
      currentDocument: null,
      activeUsers: [],
      currentVersion: 0,
    });
  },

  sendOperation: (operation: Operation) => {
    const { currentDocument, currentVersion } = get();
    if (!currentDocument) return;

    socketService.sendTextOperation(operation, currentDocument.id, currentVersion);
    set({ currentVersion: currentVersion + 1 });
  },

  sendCursorPosition: (position: CursorPosition, selection?: SelectionRange) => {
    socketService.sendCursorPosition(position, selection);
  },

  startTyping: () => {
    const { currentDocument } = get();
    if (!currentDocument) return;

    socketService.startTyping(currentDocument.id);
  },

  stopTyping: () => {
    const { currentDocument } = get();
    if (!currentDocument) return;

    socketService.stopTyping(currentDocument.id);
  },

  // Internal state updates
  setDocuments: (documents) => set({ documents }),

  setCurrentDocument: (document) => set({ currentDocument: document }),

  setActiveUsers: (users) => set({ activeUsers: users }),

  updateActiveUser: (userId: string, updates: Partial<UserCursor>) => {
    set(state => ({
      activeUsers: state.activeUsers.map(user =>
        user.userId === userId ? { ...user, ...updates, lastSeen: new Date() } : user
      ),
    }));
  },

  removeActiveUser: (userId: string) => {
    set(state => ({
      activeUsers: state.activeUsers.filter(user => user.userId !== userId),
    }));
  },

  setEditorReady: (ready: boolean) => set({ isEditorReady: ready }),

  setError: (error: string | null) => set({ error }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));