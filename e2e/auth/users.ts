import type { UserCredentials, UserRole } from '../types.js';

/**
 * Returns typed user credentials sourced from environment variables.
 */
export function getUser(role: UserRole = 'user'): UserCredentials {
  if (role === 'admin') {
    return {
      role: 'admin',
      email: process.env.E2E_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.E2E_ADMIN_PASSWORD || 'AdminPassword123!',
    };
  }

  return {
    role: 'user',
    email: process.env.E2E_USER_EMAIL || 'user@example.com',
    password: process.env.E2E_USER_PASSWORD || 'UserPassword123!',
  };
}
