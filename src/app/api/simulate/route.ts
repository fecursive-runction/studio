import { NextResponse } from 'next/server';
import { PubSub } from '@google-cloud/pubsub';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    // Check if running in a Google Cloud environment
    if (process.env.GCP_PROJECT) {
      initializeApp();
    } else {
      // For local development, use a service account key
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
        initializeApp({
            credential: cert(serviceAccount)
        });
      } catch (e) {
        console.error('Error initializing Firebase Admin SDK locally. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set in your .env.local file.');
      }
    }
}
const db = getFirestore();

const pubsub = new PubSub();
const topicName = 'sensor-data-raw';

let lastMetrics: Record<string, number> = {};

function generateSensorData() {
    const plantId = `poc_plant_01`;
    const newMetrics = {
        kiln_temp: 1450 + (Math.random() - 0.5) * 50,
        feed_rate: 220 + (Math.random() - 0.5) * 40,
        energy_kwh_per_ton: 100 + (Math.random() - 0.5) * 10,
        clinker_quality_score: 0.9 + (Math.random() - 0.5) * 0.1,
    };

    const trends = {
        kiln_temp_trend: ((newMetrics.kiln_temp - (lastMetrics.kiln_temp || newMetrics.kiln_temp)) / (lastMetrics.kiln_temp || 1)) * 100,
        feed_rate_trend: ((newMetrics.feed_rate - (lastMetrics.feed_rate || newMetrics.feed_rate)) / (lastMetrics.feed_rate || 1)) * 100,
        energy_kwh_trend: ((newMetrics.energy_kwh_per_ton - (lastMetrics.energy_kwh_per_ton || newMetrics.energy_kwh_per_ton)) / (lastMetrics.energy_kwh_per_ton || 1)) * 100,
        quality_score_trend: newMetrics.clinker_quality_score - (lastMetrics.clinker_quality_score || newMetrics.clinker_quality_score),
    };

    lastMetrics = { ...newMetrics };

    return {
        timestamp: new Date().toISOString(),
        plant_id: plantId,
        ...newMetrics,
        ...trends,
    };
}

async function updateFirestoreLive(data: any) {
    try {
        const docRef = db.collection('plant-metrics').doc('live');
        await docRef.set(data, { merge: true });
        console.log('Updated live metrics in Firestore');
    } catch (error) {
        console.error('Error updating live metrics in Firestore:', error);
    }
}


export async function GET() {
  try {
    const data = generateSensorData();
    const dataBuffer = Buffer.from(JSON.stringify(data));

    // Publish to Pub/Sub
    const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);

    // Update live metrics in Firestore
    await updateFirestoreLive(data);
    
    return NextResponse.json({ success: true, messageId, data });

  } catch (error: any) {
    console.error(`Received error while publishing: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
