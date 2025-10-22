
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Function to generate a random number within a range
const getRandom = (min: number, max: number, decimals: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

// Function to calculate Lime Saturation Factor (LSF) using the correct formula
const calculateLSF = (cao: number, sio2: number, al2o3: number, fe2o3: number) => {
    const denominator = (2.8 * sio2 + 1.18 * al2o3 + 0.65 * fe2o3);
    if (denominator === 0) return 0;
    const lsf = (cao / denominator) * 100;
    return isFinite(lsf) ? lsf : 0;
}

/**
 * API route handler for ingesting data.
 * This endpoint generates a new mock production metric and saves it to the local SQLite database.
 */
export async function POST(req: Request) {
  try {
    const db = await getDb();

    // Simulate more realistic, chemically-linked data
    const kiln_temp = getRandom(1415, 1485);
    const feed_rate = getRandom(210, 230);
    
    // Simulate raw material composition. Introduce fluctuations.
    const base_cao = 43.5;
    const base_sio2 = 13.5;
    const base_al2o3 = 3.5;
    const base_fe2o3 = 2.0;

    const cao = getRandom(base_cao - 1.5, base_cao + 1.5);
    const sio2 = getRandom(base_sio2 - 1, base_sio2 + 1);
    const al2o3 = getRandom(base_al2o3 - 0.2, base_al2o3 + 0.2);
    const fe2o3 = getRandom(base_fe2o3 - 0.2, base_fe2o3 + 0.2);

    // Calculate LSF based on the simulated composition
    const lsf = calculateLSF(cao, sio2, al2o3, fe2o3);

    const newMetric = {
        timestamp: new Date().toISOString(),
        plant_id: 'poc_plant_01',
        kiln_temp: parseFloat(kiln_temp.toFixed(2)),
        feed_rate: parseFloat(feed_rate.toFixed(2)),
        lsf: parseFloat(lsf.toFixed(1)),
        cao: parseFloat(cao.toFixed(2)),
        sio2: parseFloat(sio2.toFixed(2)),
        al2o3: parseFloat(al2o3.toFixed(2)),
        fe2o3: parseFloat(fe2o3.toFixed(2)),
    };

    // Insert the new metric into the database
    await db.run(
        'INSERT INTO production_metrics (timestamp, plant_id, kiln_temp, feed_rate, lsf, cao, sio2, al2o3, fe2o3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        Object.values(newMetric)
    );

    console.log('Ingested new live metric into SQLite:', newMetric);

    return NextResponse.json({ success: true, message: 'Data ingested successfully.', ingested_data: newMetric }, { status: 200 });
  } catch (error: any) {
    console.error('Error in ingestion route:', error);
    return NextResponse.json({ success: false, message: 'Failed to ingest data.', error: error.message }, { status: 500 });
  }
}

    