/**
 * Password hashing/verify.
 * Dùng bcryptjs (chạy được trên Vercel Node runtime).
 */

import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string) {
  const saltRounds = 12
  return await bcrypt.hash(plain, saltRounds)
}

export async function verifyPassword(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash)
}
