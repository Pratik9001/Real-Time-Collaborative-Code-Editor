import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Monaco Editor
global.monaco = {
  editor: {
    create: () => ({
      getModel: () => ({
        getValue: () => '',
        setValue: () => {},
        applyEdits: () => {},
        getPositionAt: () => ({ lineNumber: 1, column: 1 }),
      }),
      updateOptions: () => {},
      onDidChangeModelContent: () => ({ dispose: () => {} }),
      onDidChangeCursorPosition: () => ({ dispose: () => {} }),
      onDidChangeCursorSelection: () => ({ dispose: () => {} }),
      getSelection: () => null,
      getPosition: () => ({ lineNumber: 1, column: 1 }),
      changeViewZones: () => {},
      deltaDecorations: () => [],
      getLayoutInfo: () => ({}),
    }),
    Position: {
      create: (line: number, column: number) => ({ lineNumber: line, column: column }),
    },
    Range: class Range {
      constructor(
        public startLineNumber: number,
        public startColumn: number,
        public endLineNumber: number,
        public endColumn: number
      ) {}
    },
  },
  Position: class Position {
    constructor(
      public lineNumber: number,
      public column: number
    ) {}
  },
  Range: class Range {
    constructor(
      public startLineNumber: number,
      public startColumn: number,
      public endLineNumber: number,
      public endColumn: number
    ) {}
  },
};