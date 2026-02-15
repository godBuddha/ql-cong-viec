/**
 * Firebase Admin SDK init (server-side only).
 * - Đọc service account từ env FIREBASE_ADMINSDK_BASE64 để không phải commit file JSON.
 * - Trả về singleton app/firestore để tránh init nhiều lần (hot reload).
 */

import admin from 'firebase-admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = global

function getServiceAccountFromEnv() {
  const b64 = process.env.FIREBASE_ADMINSDK_BASE64
  if (!b64) {
    throw new Error('Missing env FIREBASE_ADMINSDK_BASE64')
  }

  const jsonText = Buffer.from(b64, 'base64').toString('utf-8')
  const serviceAccount = JSON.parse(jsonText)

  // Firebase thường lưu private_key với "\n" literal
  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }

  return serviceAccount
}

export function getAdminApp() {
  if (globalAny.__firebaseAdminApp) return globalAny.__firebaseAdminApp as admin.app.App

  const serviceAccount = getServiceAccountFromEnv()

  // Khởi tạo Firebase Admin (chỉ chạy ở server)
  const app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })

  globalAny.__firebaseAdminApp = app
  return app
}

export function getFirestore() {
  const app = getAdminApp()
  return app.firestore()
}
