// app/api/collect-token/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    console.log("Received token from device:", token);

    if (!token) {
      return NextResponse.json({ error: 'Missing FCM token.' }, { status: 400 });
    }

    const deviceRef = db.collection('devices').doc(token);
    await deviceRef.set(
      {
        token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ message: 'Token stored successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error storing token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
