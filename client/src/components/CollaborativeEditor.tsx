import { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useDocumentStore } from '@/store/documentStore';
import { useAuthStore } from '@/store/authStore';
import { UserCursor, Operation, CursorPosition, SelectionRange } from '@/types';
import { getUserColor, getUserInitials } from '@/utils/constants';
import LoadingSpinner from './LoadingSpinner';
import UserCursors from './UserCursors';

const CollaborativeEditor = () => {
  const editorRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const { currentDocument, sendOperation, sendCursorPosition, startTyping, stopTyping } = useDocumentStore();
  const { user } = useAuthStore();
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeCursors, setActiveCursors] = useState<UserCursor[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    modelRef.current = editor.getModel();

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, monospace',
      minimap: { enabled: true },
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    });

    // Set up event listeners
    setupEventListeners(editor);

    // Notify store that editor is ready
    useDocumentStore.getState().setEditorReady(true);
  };

  // Set up event listeners for real-time collaboration
  const setupEventListeners = (editor: any) => {
    if (!user) return;

    // Handle content changes (text operations)
    editor.onDidChangeModelContent((event: any) => {
      if (!currentDocument || !modelRef.current) return;

      event.changes.forEach((change: any) => {
        const operation: Operation = {
          id: `op-${Date.now()}-${Math.random()}`,
          documentId: currentDocument.id,
          userId: user.id,
          operationType: change.text ? 'insert' : 'delete',
          operationData: {
            position: change.rangeOffset,
            text: change.text,
            length: change.rangeLength,
          },
          documentVersion: useDocumentStore.getState().currentVersion,
          createdAt: new Date().toISOString(),
        };

        sendOperation(operation);
      });

      // Handle typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      startTyping();

      const newTimeout = setTimeout(() => {
        stopTyping();
      }, 1000);

      setTypingTimeout(newTimeout);
    });

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((event: any) => {
      if (!currentDocument) return;

      const position: CursorPosition = {
        line: event.position.lineNumber - 1, // Monaco uses 1-based indexing
        column: event.position.column - 1,
      };

      const selection: SelectionRange | undefined = editor.getSelection()
        ? {
            start: {
              line: editor.getSelection().getStartPosition().lineNumber - 1,
              column: editor.getSelection().getStartPosition().column - 1,
            },
            end: {
              line: editor.getSelection().getEndPosition().lineNumber - 1,
              column: editor.getSelection().getEndPosition().column - 1,
            },
          }
        : undefined;

      sendCursorPosition(position, selection);
    });

    // Handle selection changes
    editor.onDidChangeCursorSelection((event: any) => {
      if (!currentDocument) return;

      const selection: SelectionRange = {
        start: {
          line: event.selection.getStartPosition().lineNumber - 1,
          column: event.selection.getStartPosition().column - 1,
        },
        end: {
          line: event.selection.getEndPosition().lineNumber - 1,
          column: event.selection.getEndPosition().column - 1,
        },
      };

      sendCursorPosition(event.selection.getStartPosition(), selection);
    });
  };

  // Handle document content updates from server
  useEffect(() => {
    const handleDocumentContent = (event: CustomEvent) => {
      const { content } = event.detail;
      if (modelRef.current) {
        modelRef.current.setValue(content);
      }
    };

    const handleOperationApplied = (event: CustomEvent) => {
      const { operation } = event.detail;
      if (!modelRef.current) return;

      const monaco = window.monaco;
      if (!monaco) return;

      // Apply operation to editor model
      const { operationType, operationData } = operation;

      if (operationType === 'insert' && operationData.text) {
        const position = modelRef.current.getPositionAt(operationData.position!);
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );

        modelRef.current.applyEdits([{
          range,
          text: operationData.text,
        }]);
      } else if (operationType === 'delete') {
        const startPos = modelRef.current.getPositionAt(operationData.position!);
        const endPos = modelRef.current.getPositionAt(operationData.position! + operationData.length!);

        const range = new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        );

        modelRef.current.applyEdits([{
          range,
          text: '',
        }]);
      }
    };

    window.addEventListener('document-content', handleDocumentContent as EventListener);
    window.addEventListener('operation-applied', handleOperationApplied as EventListener);

    return () => {
      window.removeEventListener('document-content', handleDocumentContent as EventListener);
      window.removeEventListener('operation-applied', handleOperationApplied as EventListener);
    };
  }, []);

  // Update active cursors from store
  useEffect(() => {
    const store = useDocumentStore.getState();
    setActiveCursors(store.activeUsers.filter(u => u.userId !== user?.id));
  }, [useDocumentStore.getState().activeUsers, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      useDocumentStore.getState().setEditorReady(false);
    };
  }, [typingTimeout]);

  if (!currentDocument) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Document header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDocument.title}
            </h1>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              {currentDocument.language}
            </span>
          </div>

          {/* Active users */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activeCursors.length + 1} active
            </span>
            <div className="flex -space-x-2">
              {/* Current user */}
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800"
                style={{ backgroundColor: getUserColor(user?.id || '') }}
                title="You"
              >
                {getUserInitials(user?.displayName, user?.username)}
              </div>

              {/* Other users */}
              {activeCursors.slice(0, 4).map((cursor) => (
                <div
                  key={cursor.userId}
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: cursor.color }}
                  title={cursor.userName}
                >
                  {getUserInitials(cursor.userName)}
                </div>
              ))}

              {activeCursors.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                  +{activeCursors.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={getMonacoLanguage(currentDocument.language)}
          value={currentDocument.content}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          }
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: true },
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />

        {/* User cursors overlay */}
        {isEditorReady && activeCursors.length > 0 && (
          <UserCursors
            cursors={activeCursors}
            editor={editorRef.current}
          />
        )}
      </div>
    </div>
  );
};

// Helper function to map language to Monaco language ID
const getMonacoLanguage = (language: string): string => {
  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'csharp',
    php: 'php',
    ruby: 'ruby',
    go: 'go',
    rust: 'rust',
    swift: 'swift',
    kotlin: 'kotlin',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    markdown: 'markdown',
    sql: 'sql',
    shell: 'shell',
    plaintext: 'plaintext',
  };

  return languageMap[language] || 'plaintext';
};

export default CollaborativeEditor;