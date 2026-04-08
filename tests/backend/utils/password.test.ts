/**
 * Password Utility Tests
 * Tests bcrypt password hashing and comparison
 * Coverage: PRD01 - Security requirements
 */

import { hashPassword, comparePassword } from '../../../backend/src/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a plain text password', async () => {
      const password = 'mysecretpassword';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'mysecretpassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'mysecretpassword';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'mysecretpassword';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });
  });
});
