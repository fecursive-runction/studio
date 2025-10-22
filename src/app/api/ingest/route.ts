
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
    return (cao / denominator) * 100;
}

// Bogue's Equations to calculate clinker phases
const calculateBogue = (cao: number, sio2: number, al2o3: number, fe2o3: number) => {
    // Assuming free lime and SO3 are negligible for this simulation
    const cao_prime = cao;

    const c4af = 3.043 * fe2o3;
    const c3a = 2.650 * al2o3 - 1.692 * fe2o3;
    const c3s = 4.071 * cao_prime - 7.602 * sio2 - 6.719 * al2o3 - 1.430 * fe2o3;
    const c2s = 2.867 * sio2 - 0.754 * c3s;
    
    // Return non-negative values
    return {
        c3s: Math.max(0, c3s),
        c2s: Math.max(0, c2s),
        c3a: Math.max(0, c3a),
        c4af: Math.max(0, c4af)
    };
}


/**
 * API route handler for ingesting data.
 * This endpoint generates a new mock production metric based on chemical principles and saves it to the local SQLite database.
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

    // CaO and SiO2 are the main levers, so they fluctuate more.
    const cao = getRandom(base_cao - 1.5, base_cao + 1.5);
    const sio2 = getRandom(base_sio2 - 1, base_sio2 + 1);
    const al2o3 = getRandom(base_al2o3 - 0.2, base_al2o3 + 0.2);
    const fe2o3 = getRandom(base_fe2o3 - 0.2, base_fe2o3 + 0.2);

    // Calculate LSF based on the simulated composition
    const lsf = calculateLSF(cao, sio2, al2o3, fe2o3);

    // Calculate Bogue's phases
    const boguePhases = calculateBogue(cao, sio2, al2o3, fe2o3);

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
        c3s: parseFloat(boguePhases.c3s.toFixed(2)),
        c2s: parseFloat(boguePhases.c2s.toFixed(2)),
        c3a: parseFloat(boguePhases.c3a.toFixed(2)),
        c4af: parseFloat(boguePhases.c4af.toFixed(2)),
    };

    // Insert the new metric into the database
    await db.run(
        'INSERT INTO production_metrics (timestamp, plant_id, kiln_temp, feed_rate, lsf, cao, sio2, al2o3, fe2o3, c3s, c2s, c3a, c4af) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newMetric.timestamp,
        newMetric.plant_id,
        newMetric.kiln_temp,
        newMetric.feed_rate,
        newMetric.lsf,
        newMetric.cao,
        newMetric.sio2,
        newMetric.al2o3,
        newMetric.fe2o3,
        newMetric.c3s,
        newMetric.c2s,
        newMetric.c3a,
        newMetric.c4af
    );

    console.log('Ingested new live metric into SQLite:', newMetric);

    return NextResponse.json({ success: true, message: 'Data ingested successfully.', ingested_data: newMetric }, { status: 200 });
  } catch (error: any) {
    console.error('Error in ingestion route:', error);
    return NextResponse.json({ success: false, message: 'Failed to ingest data.', error: error.message }, { status: 500 });
  }
}
