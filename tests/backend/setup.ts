/**
 * Jest Test Setup
 * Configures test environment and global mocks
 */

// Set test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/joyful_baseball_test';
process.env.NODE_ENV = 'test';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000';

// Global test timeout
jest.setTimeout(30000);
