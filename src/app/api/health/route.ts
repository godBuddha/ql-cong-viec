/**
 * Health check endpoint:
 * - Kiểm tra API routes chạy ok trên Vercel.
 * - Test kết nối Firestore bằng cách đọc doc /orgs/default.
 */

import { NextResponse } from 'next/server'
import { getFirestore } from '@/lib/firebaseAdmin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const db = getFirestore()
    const snap = await db.collection('orgs').doc('default').get()

    return NextResponse.json({
      ok: true,
      firestore: {
        canRead: true,
        orgDefaultExists: snap.exists,
        orgDefault: snap.exists ? snap.data() : null,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    )
  }
}
