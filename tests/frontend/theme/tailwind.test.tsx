/**
 * Tailwind MLB Theme Tests
 * Tests Tailwind configuration for MLB theme colors
 * Coverage: PRD01 - MLB Theme requirements
 */

import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../../frontend/tailwind.config.js';

describe('Tailwind MLB Theme', () => {
  it('should have MLB Navy color defined', () => {
    expect(tailwindConfig.theme.extend.colors.mlb.navy).toBe('#041E42');
  });

  it('should have MLB Red color defined', () => {
    expect(tailwindConfig.theme.extend.colors.mlb.red).toBe('#BF0D3E');
  });

  it('should have MLB Red Dark variant defined', () => {
    expect(tailwindConfig.theme.extend.colors.mlb['red-dark']).toBe('#A00B34');
  });

  it('should have Gold color defined', () => {
    expect(tailwindConfig.theme.extend.colors.gold).toBe('#C4A35A');
  });

  it('should have status colors defined', () => {
    expect(tailwindConfig.theme.extend.colors.success).toBe('#2D8659');
    expect(tailwindConfig.theme.extend.colors.warning).toBe('#E67E22');
    expect(tailwindConfig.theme.extend.colors.info).toBe('#3182CE');
    expect(tailwindConfig.theme.extend.colors.error).toBe('#DC2626');
  });

  it('should have Inter as primary font', () => {
    expect(tailwindConfig.theme.extend.fontFamily.sans).toContain('Inter');
  });

  it('should have custom border radius', () => {
    expect(tailwindConfig.theme.extend.borderRadius.card).toBe('12px');
    expect(tailwindConfig.theme.extend.borderRadius.button).toBe('8px');
  });

  it('should have custom box shadows', () => {
    expect(tailwindConfig.theme.extend.boxShadow.card).toBeDefined();
    expect(tailwindConfig.theme.extend.boxShadow['card-hover']).toBeDefined();
  });
});
