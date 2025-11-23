import { useEffect, useState } from 'react';
import { UserCursor, CursorPosition, SelectionRange } from '@/types';

interface UserCursorsProps {
  cursors: UserCursor[];
  editor: any;
}

const UserCursors = ({ cursors, editor }: UserCursorsProps) => {
  const [cursorElements, setCursorElements] = useState<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (!editor) return;

    const monaco = window.monaco;
    if (!monaco) return;

    // Clear existing cursors
    cursorElements.forEach((element) => {
      element.remove();
    });
    const newCursorElements = new Map<string, HTMLElement>();

    // Create cursor and selection decorations for each user
    cursors.forEach((cursor) => {
      // Convert line/column to Monaco position
      const position = monaco.Position.create(cursor.position.line + 1, cursor.position.column + 1);

      // Create cursor element
      const cursorElement = document.createElement('div');
      cursorElement.className = 'monaco-cursor';
      cursorElement.style.position = 'absolute';
      cursorElement.style.width = '2px';
      cursorElement.style.height = '20px';
      cursorElement.style.backgroundColor = cursor.color;
      cursorElement.style.zIndex = '10';
      cursorElement.style.pointerEvents = 'none';

      // Add user label
      const labelElement = document.createElement('div');
      labelElement.className = 'monaco-cursor-label';
      labelElement.textContent = cursor.userName;
      labelElement.style.position = 'absolute';
      labelElement.style.top = '-20px';
      labelElement.style.left = '2px';
      labelElement.style.padding = '2px 6px';
      labelElement.style.backgroundColor = cursor.color;
      labelElement.style.color = 'white';
      labelElement.style.fontSize = '11px';
      labelElement.style.borderRadius = '3px';
      labelElement.style.whiteSpace = 'nowrap';
      labelElement.style.zIndex = '11';
      labelElement.style.pointerEvents = 'none';

      cursorElement.appendChild(labelElement);

      // Add selection decoration if exists
      if (cursor.selection) {
        const startPos = monaco.Position.create(
          cursor.selection.start.line + 1,
          cursor.selection.start.column + 1
        );
        const endPos = monaco.Position.create(
          cursor.selection.end.line + 1,
          cursor.selection.end.column + 1
        );
        const range = new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        );

        const decoration = {
          range,
          options: {
            className: 'user-selection',
            beforeContentClassName: 'user-selection-before',
            afterContentClassName: 'user-selection-after',
          },
        };

        // Apply selection styling via CSS injection
        const styleId = `user-selection-${cursor.userId}`;
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          styleElement.textContent = `
            .user-selection-${cursor.userId} {
              background-color: ${cursor.color}33;
            }
          `;
          document.head.appendChild(styleElement);
        }

        decoration.options.className = `user-selection-${cursor.userId}`;

        // Add the decoration to the editor
        const decorations = editor.deltaDecorations([], [decoration]);
      }

      // Position the cursor
      const editorLayout = editor.getLayoutInfo();
      const viewZone = {
        afterLineNumber: position.lineNumber,
        afterColumn: position.column,
        heightInPx: 20,
        widthInPx: 2,
        domNode: cursorElement,
        onDomNodeTop: (top: number) => {
          cursorElement.style.top = `${top}px`;
        },
        onDomNodeLeft: (left: number) => {
          cursorElement.style.left = `${left}px`;
        },
      };

      editor.changeViewZones((accessor: any) => {
        accessor.addZone(viewZone);
      });

      newCursorElements.set(cursor.userId, cursorElement);
    });

    setCursorElements(newCursorElements);

    // Cleanup
    return () => {
      cursorElements.forEach((element) => {
        element.remove();
      });
    };
  }, [cursors, editor]);

  return null; // This component doesn't render anything directly
};

export default UserCursors;