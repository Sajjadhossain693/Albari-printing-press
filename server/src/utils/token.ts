import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'albari-press-super-secret-jwt-key-2026-dhaka-noakhali';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  email?: string | null;
}

export function generateToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
