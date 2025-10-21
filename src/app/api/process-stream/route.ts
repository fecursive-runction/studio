import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();
const datasetId = 'cement_plant_poc';
const tableId = 'production_metrics';

// This is a simplified stream processor. In a real app, you'd use Firestore as well.
async function insertIntoBigQuery(data: any) {
  const rows = [{
    timestamp: data.timestamp,
    plant_id: data.plant_id,
    kiln_temp: data.kiln_temp,
    feed_rate: data.feed_rate,
    energy_kwh_per_ton: data.energy_kwh_per_ton,
    clinker_quality_score: data.clinker_quality_score,
  }];

  try {
    await bigquery.dataset(datasetId).table(tableId).insert(rows);
    console.log(`Inserted ${rows.length} rows into BigQuery`);
  } catch (error: any) {
    console.error('BIGQUERY ERROR:', JSON.stringify(error, null, 2));
    // In a real app, you might want to send failed messages to a dead-letter queue
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pub/Sub messages are base64-encoded
    const message = body.message;
    if (!message || !message.data) {
        console.error('Invalid Pub/Sub message format');
        return new Response('Bad Request: Invalid Pub/Sub message', { status: 400 });
    }
    
    const dataString = Buffer.from(message.data, 'base64').toString('utf8');
    const sensorData = JSON.parse(dataString);

    console.log('Received data:', sensorData);

    // Insert data into BigQuery
    await insertIntoBigQuery(sensorData);
    
    // Here is where you would also update Firestore with live data
    // For now, we are just logging it.

    // Acknowledge the message
    return new Response('OK', { status: 204 });

  } catch (error: any) {
    console.error('Error processing message:', error.message);
    // Return a 500 status to indicate failure, which can cause Pub/Sub to retry
    return new Response('Internal Server Error', { status: 500 });
  }
}
