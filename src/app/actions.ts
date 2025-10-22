'use server';

import { optimizeCementProduction } from '@/ai/flows/optimize-cement-production';
import { generateExplanation } from '@/ai/flows/generate-explanation';
import { generateAlerts } from '@/ai/flows/generate-alerts';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export async function getLiveMetrics() {
    try {
        const db = await getDb();
        // Fetch the most recent record from the database
        const latestMetric = await db.get('SELECT * FROM production_metrics ORDER BY timestamp DESC LIMIT 1');

        if (!latestMetric) {
            // Return a default/fallback state if the database is empty
            return {
                kilnTemperature: 1450,
                feedRate: 220,
                lsf: 96,
                cao: 44,
                sio2: 14,
                al2o3: 3.5,
                fe2o3: 2.5,
                c3s: 55,
                c2s: 20,
                c3a: 9,
                c4af: 10,
            };
        }

        return {
            kilnTemperature: latestMetric.kiln_temp,
            feedRate: latestMetric.feed_rate,
            lsf: latestMetric.lsf,
            cao: latestMetric.cao,
            sio2: latestMetric.sio2,
            al2o3: latestMetric.al2o3,
            fe2o3: latestMetric.fe2o3,
            c3s: latestMetric.c3s,
            c2s: latestMetric.c2s,
            c3a: latestMetric.c3a,
            c4af: latestMetric.c4af,
        };
    } catch (e: any) {
        console.error("Failed to get live metrics from SQLite:", e);
        // Return default values on error
        return {
            kilnTemperature: 1450,
            feedRate: 220,
            lsf: 96,
            cao: 44,
            sio2: 14,
            al2o3: 3.5,
            fe2o3: 2.5,
            c3s: 55,
            c2s: 20,
            c3a: 9,
            c4af: 10,
        };
    }
}

export async function getMetricsHistory() {
    try {
        const db = await getDb();
        const history = await db.all('SELECT * FROM production_metrics ORDER BY timestamp DESC LIMIT 50');
        return history;
    } catch (e: any) {
        console.error("Failed to get metrics history from SQLite:", e);
        return [];
    }
}


const optimizationSchema = z.object({
  constraints: z.string().optional(),
  kilnTemperature: z.string(),
  feedRate: z.string(),
  lsf: z.string(),
  cao: z.string(),
  sio2: z.string(),
  al2o3: z.string(),
  fe2o3: z.string(),
});

/**
 * Calculates a simplified predicted LSF based on adjustments.
 * This is a proxy for a real chemical engineering model.
 */
function calculatePredictedLsf(currentLsf: number, limestoneAdj: string, clayAdj: string): number {
    let predictedLsf = currentLsf;
    const limestoneChange = parseFloat(limestoneAdj.replace('%', '')) || 0;
    const clayChange = parseFloat(clayAdj.replace('%', '')) || 0;

    // Limestone (CaO) has a strong positive effect on LSF.
    predictedLsf += limestoneChange * 1.5;

    // Clay (SiO2/Al2O3) has a negative effect on LSF.
    predictedLsf -= clayChange * 0.5;

    // Ensure the value is within a reasonable range
    return Math.max(85, Math.min(105, predictedLsf));
}


export async function runOptimization(prevState: any, formData: FormData) {
  const validatedFields = optimizationSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      ...prevState,
      error: 'Invalid data submitted for optimization.',
      recommendation: null,
    };
  }
  const { constraints, ...metrics } = validatedFields.data;
  const currentMetrics = {
    plantId: "poc_plant_01",
    kilnTemperature: Number(metrics.kilnTemperature),
    feedRate: Number(metrics.feedRate),
    lsf: Number(metrics.lsf),
    cao: Number(metrics.cao),
    sio2: Number(metrics.sio2),
    al2o3: Number(metrics.al2o3),
    fe2o3: Number(metrics.fe2o3),
    constraints: constraints ? constraints.split(',').map(c => c.trim()) : ["TARGET_LSF_94_98"],
  };


  try {
    // 1. Get core recommendation (fast)
    const optimizationRequest = optimizeCementProduction(currentMetrics);

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("AI recommendation request timed out after 25 seconds. The service may be busy. Please try again."));
        }, 25000); // 25 seconds
    });

    const aiCoreRecommendation = await Promise.race([
        optimizationRequest,
        timeoutPromise
    ]);

    // 2. Calculate predicted LSF in code
    const predictedLSF = calculatePredictedLsf(currentMetrics.lsf, aiCoreRecommendation.limestoneAdjustment, aiCoreRecommendation.clayAdjustment);
    
    // 3. Prepare input for the explanation flow
    const explanationInput = {
        kilnTemperature: currentMetrics.kilnTemperature,
        feedRate: currentMetrics.feedRate,
        lsf: currentMetrics.lsf,
        limestoneAdjustment: aiCoreRecommendation.limestoneAdjustment,
        clayAdjustment: aiCoreRecommendation.clayAdjustment,
        predictedLSF: predictedLSF,
    };

    // 4. Get explanation (slower, but happens after core results are known)
    const explanation = await generateExplanation(explanationInput);


    // 5. Combine results
    const finalRecommendation = {
        ...aiCoreRecommendation,
        predictedLSF: predictedLSF,
        timestamp: new Date().toISOString(),
        explanation,
    };
    
    return {
      error: null,
      recommendation: finalRecommendation,
    };

  } catch (e: any) {
    console.error(e);
    return {
      ...prevState,
      error: e.message || 'An error occurred while generating the recommendation.',
      recommendation: null,
    };
  }
}

export async function getAiAlerts() {
    try {
        const liveMetrics = await getLiveMetrics();
        const alertResponse = await generateAlerts({
            kilnTemperature: liveMetrics.kilnTemperature,
            feedRate: liveMetrics.feedRate,
            lsf: liveMetrics.lsf,
        });

        // Add a timestamp to each alert
        return alertResponse.alerts.map(alert => ({
            ...alert,
            timestamp: new Date(),
        }));

    } catch (e: any) {
        console.error("Failed to get AI alerts:", e);
        // Return a default error alert if the AI fails
        return [{
            id: 'err-alert',
            timestamp: new Date(),
            severity: 'WARNING',
            message: 'Could not retrieve AI-powered alerts.',
            icon: 'AlertTriangle',
        }];
    }
}

// Function to calculate Lime Saturation Factor (LSF) using the correct formula
const calculateLSF = (cao: number, sio2: number, al2o3: number, fe2o3: number) => {
    const denominator = (2.8 * sio2 + 1.18 * al2o3 + 0.65 * fe2o3);
    if (denominator === 0) return 0;
    return (cao / denominator) * 100;
}

// Bogue's Equations to calculate clinker phases
const calculateBogue = (cao: number, sio2: number, al2o3: number, fe2o3: number) => {
    const cao_prime = cao; // Assuming free lime & SO3 are negligible for simulation
    const c4af = 3.043 * fe2o3;
    const c3a = 2.650 * al2o3 - 1.692 * fe2o3;
    const c3s = 4.071 * cao_prime - 7.602 * sio2 - 6.719 * al2o3 - 1.430 * fe2o3;
    const c2s = 2.867 * sio2 - 0.754 * c3s;
    return {
        c3s: Math.max(0, c3s), c2s: Math.max(0, c2s),
        c3a: Math.max(0, c3a), c4af: Math.max(0, c4af)
    };
}


export async function applyOptimization(prevState: any, formData: FormData) {
    const db = await getDb();
    const currentMetrics = await getLiveMetrics();
    
    const lsf = parseFloat(formData.get('predictedLSF') as string);
    const limestoneAdj = parseFloat((formData.get('limestoneAdjustment') as string).replace('%', ''));
    const clayAdj = parseFloat((formData.get('clayAdjustment') as string).replace('%', ''));

    // Apply adjustments to simulate new composition
    // This is a simplified simulation. A real model would be more complex.
    const newCao = currentMetrics.cao * (1 + limestoneAdj / 100);
    const newSio2 = currentMetrics.sio2 * (1 - clayAdj / 200); // Clay affects SiO2
    const newAl2o3 = currentMetrics.al2o3 * (1 - clayAdj / 200); // and Al2O3

    const newFeedRate = parseFloat(formData.get('feedRateSetpoint') as string);
    const newKilnTemp = currentMetrics.kilnTemperature + (lsf > 98 ? -5 : (lsf < 94 ? 5 : 0)); // small adjustment

    const boguePhases = calculateBogue(newCao, newSio2, newAl2o3, currentMetrics.fe2o3);

    const newMetric = {
        timestamp: new Date().toISOString(),
        plant_id: 'poc_plant_01',
        kiln_temp: parseFloat(newKilnTemp.toFixed(2)),
        feed_rate: parseFloat(newFeedRate.toFixed(2)),
        lsf: parseFloat(lsf.toFixed(1)),
        cao: parseFloat(newCao.toFixed(2)),
        sio2: parseFloat(newSio2.toFixed(2)),
        al2o3: parseFloat(newAl2o3.toFixed(2)),
        fe2o3: parseFloat(currentMetrics.fe2o3.toFixed(2)),
        c3s: parseFloat(boguePhases.c3s.toFixed(2)),
        c2s: parseFloat(boguePhases.c2s.toFixed(2)),
        c3a: parseFloat(boguePhases.c3a.toFixed(2)),
        c4af: parseFloat(boguePhases.c4af.toFixed(2)),
    };
    
    try {
        await db.run(
            'INSERT INTO production_metrics (timestamp, plant_id, kiln_temp, feed_rate, lsf, cao, sio2, al2o3, fe2o3, c3s, c2s, c3a, c4af) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            Object.values(newMetric)
        );
        return { success: true, message: 'Optimization applied successfully!' };
    } catch (error: any) {
        console.error('Failed to apply optimization:', error);
        return { success: false, message: 'Failed to apply optimization.' };
    }
}

    