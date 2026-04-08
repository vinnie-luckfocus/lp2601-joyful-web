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
  },
  useSpring: () => ({ get: () => 0, set: () => {}, on: () => {} }),
  useTransform: () => ({ get: () => 0 }),
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
