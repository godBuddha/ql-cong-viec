/**
 * Session/JWT helpers.
 *
 * Mục tiêu:
 * - Auth kiểu username/password “đúng nghĩa” (server-centric).
 * - Dùng JWT ký bằng secret (HS256), lưu trong cookie HttpOnly.
 *
 * Lưu ý bảo mật:
 * - KHÔNG lưu password trong JWT.
 * - JWT chỉ chứa thông tin định danh + quyền tối thiểu.
 */

import { SignJWT, jwtVerify } from 'jose'

export type SessionUser = {
  userId: string
  orgId: string
  role: 'OWNER' | 'LEADER' | 'MEMBER'
  departmentId?: string | null
}

function getSecret() {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) throw new Error('Missing env AUTH_JWT_SECRET')
  return new TextEncoder().encode(secret)
}

export async function signSession(user: SessionUser) {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)

  return await new SignJWT({
    sub: user.userId,
    orgId: user.orgId,
    role: user.role,
    departmentId: user.departmentId ?? null,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    // session 7 ngày
    .setExpirationTime(now + 60 * 60 * 24 * 7)
    .sign(secret)
}

export async function verifySession(token: string) {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)

  const userId = String(payload.sub || '')
  const orgId = String(payload.orgId || '')
  const role = String(payload.role || '') as SessionUser['role']
  const departmentId = payload.departmentId ? String(payload.departmentId) : null

  if (!userId || !orgId || !role) throw new Error('Invalid session payload')

  return { userId, orgId, role, departmentId } satisfies SessionUser
}

export const SESSION_COOKIE_NAME = 'qlcv_session'
