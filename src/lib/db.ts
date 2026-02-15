/**
 * Firestore access helpers (Admin).
 *
 * Quy ước multi-tenant:
 * - orgs/{orgId}/...
 */

import { getFirestore } from '@/lib/firebaseAdmin'

export function db() {
  return getFirestore()
}
