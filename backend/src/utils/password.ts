import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Constant-time-ish string compare so password reset tokens cannot be probed
 * character by character via response timing.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface PasswordStrength {
  valid: boolean;
  errors: string[];
}

/** Server-side policy check — the client-side meter is only a hint. */
export function checkPasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[a-z]/.test(password)) errors.push('Password must include a lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('Password must include an uppercase letter');
  if (!/\d/.test(password)) errors.push('Password must include a number');
  return { valid: errors.length === 0, errors };
}
