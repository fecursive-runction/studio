
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Function to generate a random number within a range
const getRandom = (min: number, max: number, decimals: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

// Function to simulate a more realistic clinker quality score based on temperature
const calculateQualityScore = (temp: number) => {
    const optimalTemp = 1450;
    const deviation = Math.abs(temp - optimalTemp);
    let score = 0.95 - (deviation / 50) * 0.1; // Quality decreases as temp deviates from optimal
    score += (Math.random() - 0.5) * 0.02; // Add some noise
    return Math.max(0.85, Math.min(0.98, score)); // Clamp score between 0.85 and 0.98
}

/**
 * API route handler for ingesting data.
 * This endpoint generates a new mock production metric and saves it to the local SQLite database.
 */
export async function POST(req: Request) {
  try {
    const db = await getDb();

    // Generate more connected data
    const kiln_temp = getRandom(1415, 1485); // Widen range for more alerts
    const feed_rate = getRandom(210, 230);
    const clinker_quality_score = calculateQualityScore(kiln_temp);
    
    // Energy consumption based on temp and feed rate
    const energy_kwh_per_ton = 95 + (kiln_temp - 1400) / 10 + (feed_rate - 200) / 5 + getRandom(-1, 1);

    const newMetric = {
        timestamp: new Date().toISOString(),
        plant_id: 'poc_plant_01',
        kiln_temp: parseFloat(kiln_temp.toFixed(2)),
        feed_rate: parseFloat(feed_rate.toFixed(2)),
        energy_kwh_per_ton: parseFloat(energy_kwh_per_ton.toFixed(2)),
        clinker_quality_score: parseFloat(clinker_quality_score.toFixed(3)),
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
