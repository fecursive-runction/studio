
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Function to generate a random number within a range
const getRandom = (min: number, max: number, decimals: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

/**
 * API route handler for ingesting data.
 * This endpoint generates a new mock production metric and saves it to the local SQLite database.
 */
export async function POST(req: Request) {
  try {
    const db = await getDb();

    const newMetric = {
        timestamp: new Date().toISOString(),
        plant_id: 'poc_plant_01',
        kiln_temp: getRandom(1420, 1480),
        feed_rate: getRandom(210, 230),
        energy_kwh_per_ton: getRandom(98, 105),
        clinker_quality_score: getRandom(0.88, 0.95, 3),
    };

    // Insert the new metric into the database
    await db.run(
        'INSERT INTO production_metrics (timestamp, plant_id, kiln_temp, feed_rate, energy_kwh_per_ton, clinker_quality_score) VALUES (?, ?, ?, ?, ?, ?)',
        newMetric.timestamp,
        newMetric.plant_id,
        newMetric.kiln_temp,
        newMetric.feed_rate,
        newMetric.energy_kwh_per_ton,
        newMetric.clinker_quality_score
    );

    console.log('Ingested new live metric into SQLite:', newMetric);

    return NextResponse.json({ success: true, message: 'Data ingested successfully.', ingested_data: newMetric }, { status: 200 });
  } catch (error: any) {
    console.error('Error in ingestion route:', error);
    return NextResponse.json({ success: false, message: 'Failed to ingest data.', error: error.message }, { status: 500 });
  }
}
