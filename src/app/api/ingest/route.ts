
import { NextResponse } from 'next/server';
import { Firestore } from '@google-cloud/firestore';

// Function to generate a random number within a range
const getRandom = (min: number, max: number, decimals: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

const firestore = new Firestore();

/**
 * API route handler for ingesting data.
 * This endpoint can be triggered by a scheduler (e.g., Cloud Scheduler).
 * It generates a new mock production metric and saves it to Firestore.
 */
export async function POST(req: Request) {
  try {
    // Generate a new production metric record
    const newMetric = {
        timestamp: new Date().toISOString(),
        plant_id: 'poc_plant_01',
        kiln_temp: getRandom(1420, 1480),
        feed_rate: getRandom(210, 230),
        energy_kwh_per_ton: getRandom(98, 105),
        clinker_quality_score: getRandom(0.88, 0.95, 3),
    };

    // Save the new metric to a specific document in Firestore for live data
    // This overwrites the previous live metric with the new one.
    const docRef = firestore.collection('plant-metrics').doc('live');
    await docRef.set(newMetric);

    console.log('Ingested new live metric:', newMetric);

    // Respond with success
    return NextResponse.json({ success: true, message: 'Data ingested successfully.', ingested_data: newMetric }, { status: 200 });
  } catch (error: any) {
    console.error('Error in ingestion route:', error);
    // Respond with an error
    return NextResponse.json({ success: false, message: 'Failed to ingest data.', error: error.message }, { status: 500 });
  }
}
