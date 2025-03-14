import { compare, hash } from 'bcryptjs';

import env from './env';
import { ApiError } from './errors';
import type { AUTH_PROVIDER } from 'types';
import { validatePassword } from './common';

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function getAuthProviders() {
  return env.authProviders?.split(',') || [];
}

export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
  return getAuthProviders().includes(provider);
}

export function authProviderEnabled() {
  return {
    github: isAuthProviderEnabled('github'),
    google: isAuthProviderEnabled('google'),
    email: isAuthProviderEnabled('email'),
    saml: isAuthProviderEnabled('saml'),
    credentials: isAuthProviderEnabled('credentials'),
  };
}

export const validatePasswordPolicy = (password: string) => {
  if (!validatePassword(password)) {
    throw new ApiError(422, 'Password must have at least 8 characters, including uppercase, lowercase, number, and special character.');
  }
};
