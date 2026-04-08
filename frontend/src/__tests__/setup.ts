import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('button', props, children),
    span: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('span', props, children),
    a: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('a', props, children),
    h1: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('h1', props, children),
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('p', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useSpring: () => ({ get: () => 0, set: () => {}, on: () => ({}) }),
  useTransform: (_spring: unknown, transform: (v: number) => string | number) => {
    const mockValue = 100;
    const result = transform ? transform(mockValue) : mockValue;
    return { get: () => result, on: () => vi.fn() };
  },
  useMotionValue: () => ({ get: () => 0, set: () => {} }),
  animate: () => ({ stop: () => {} }),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Define global for tests
(globalThis as typeof globalThis & { global: typeof globalThis }).global = globalThis;
