
import { NextResponse } from 'next/server';
import { insertIntoBigQuery } from '@/services/bigquery';

// The ID of your BigQuery dataset
const DATASET_ID = 'cement_plant_data'; 
// The ID of the table you want to insert rows into
const TABLE_ID = 'production_metrics';

// Function to generate a random number within a range
const getRandom = (min: number, max: number, decimals: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};


/**
 * API route handler for ingesting data.
 * This endpoint is triggered by a Pub/Sub push subscription.
 * It generates a new mock production metric and inserts it into BigQuery.
 */
export async function POST(req: Request) {
  try {
    // Pub/Sub push subscriptions send a POST request with the message in the body.
    // We don't need to process the message data for this use case,
    // as the notification itself is the trigger.
    const body = await req.json();
    console.log('Received Pub/Sub message:', body);

    // Generate a new production metric record
    const newMetric = {
        timestamp: new Date().toISOString(),
        plant_id: 'poc_plant_01',
        kiln_temp: getRandom(1420, 1480),
        feed_rate: getRandom(210, 230),
        energy_kwh_per_ton: getRandom(98, 105),
        clinker_quality_score: getRandom(0.88, 0.95, 3),
    };

    // Insert the new metric into the BigQuery table
    await insertIntoBigQuery(DATASET_ID, TABLE_ID, newMetric);

    // Respond with success
    return NextResponse.json({ success: true, message: 'Data ingested successfully.', ingested_data: newMetric }, { status: 200 });
  } catch (error: any) {
    console.error('Error in ingestion route:', error);
    // Respond with an error
    return NextResponse.json({ success: false, message: 'Failed to ingest data.', error: error.message }, { status: 500 });
  }
}
