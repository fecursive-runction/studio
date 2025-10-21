import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    if (process.env.GCP_PROJECT) {
        initializeApp();
    } else {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
            initializeApp({ credential: cert(serviceAccount) });
        } catch (e) {
            console.error('Error initializing Firebase Admin SDK locally. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set in your .env.local file.');
        }
    }
}
const db = getFirestore();

const bigquery = new BigQuery();
const datasetId = 'cement_plant_poc';
const bqTableId = 'production_metrics';
const firestoreCollectionId = 'production_metrics';


async function insertIntoBigQuery(data: any) {
  // Remove trend data before inserting into historical log
  const { kiln_temp_trend, feed_rate_trend, energy_kwh_trend, quality_score_trend, ...historicalData } = data;
  
  const rows = [{
    timestamp: historicalData.timestamp,
    plant_id: historicalData.plant_id,
    kiln_temp: historicalData.kiln_temp,
    feed_rate: historicalData.feed_rate,
    energy_kwh_per_ton: historicalData.energy_kwh_per_ton,
    clinker_quality_score: historicalData.clinker_quality_score,
  }];

  try {
    await bigquery.dataset(datasetId).table(bqTableId).insert(rows);
    console.log(`Inserted ${rows.length} rows into BigQuery`);
  } catch (error: any) {
    console.error('BIGQUERY ERROR:', JSON.stringify(error, null, 2));
  }
}

async function insertIntoFirestore(data: any) {
    // Remove trend data before inserting into historical log
    const { kiln_temp_trend, feed_rate_trend, energy_kwh_trend, quality_score_trend, ...historicalData } = data;

    try {
      await db.collection(firestoreCollectionId).add(historicalData);
      console.log(`Inserted document into Firestore collection '${firestoreCollectionId}'`);
    } catch (error) {
      console.error('FIRESTORE ERROR:', error);
    }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    if (!message || !message.data) {
        console.error('Invalid Pub/Sub message format');
        return new Response('Bad Request: Invalid Pub/Sub message', { status: 400 });
    }
    
    const dataString = Buffer.from(message.data, 'base64').toString('utf8');
    const sensorData = JSON.parse(dataString);

    console.log('Received data:', sensorData);

    // Insert data into BigQuery and Firestore
    await Promise.all([
        insertIntoBigQuery(sensorData),
        insertIntoFirestore(sensorData)
    ]);

    // Acknowledge the message
    return new Response('OK', { status: 204 });

  } catch (error: any) {
    console.error('Error processing message:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
