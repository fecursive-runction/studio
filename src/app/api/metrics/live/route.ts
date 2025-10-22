
import { NextResponse } from 'next/server';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();

/**
 * API route handler for fetching the live production metric.
 */
export async function GET(req: Request) {
  try {
    const docRef = firestore.collection('plant-metrics').doc('live');
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'No live data available' }, { status: 404 });
    }

    return NextResponse.json(doc.data(), { status: 200 });
  } catch (error: any) {
    console.error('Error in fetching live metric:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch live metric.', error: error.message }, { status: 500 });
  }
}
