
'use server';

import { optimizeCementProduction } from '@/ai/flows/optimize-cement-production';
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
});


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
  
  try {
    const liveMetrics = await getLiveMetrics();
    
    const { constraints } = validatedFields.data;
    const constraintsList = (constraints && constraints.trim()) 
      ? constraints.split(',').map(c => c.trim()) 
      : ["TARGET_LSF_94_98"];

    const aiInput = {
      plantId: "poc_plant_01",
      kilnTemperature: liveMetrics.kilnTemperature,
      feedRate: liveMetrics.feedRate,
      lsf: liveMetrics.lsf,
      cao: liveMetrics.cao,
      sio2: liveMetrics.sio2,
      al2o3: liveMetrics.al2o3,
      fe2o3: liveMetrics.fe2o3,
      constraints: constraintsList,
    };

    const aiRecommendation = await optimizeCementProduction(aiInput);

    const finalRecommendation = {
        ...aiRecommendation,
        timestamp: new Date().toISOString(),
    };
    
    return {
      error: null,
      recommendation: finalRecommendation,
    };

  } catch (e: any) {
    console.error("Error in runOptimization:", e);
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

        if (!alertResponse || !alertResponse.alerts) {
            return [];
        }

        return alertResponse.alerts.map((alert, index) => ({
            ...alert,
            id: `alert-${Date.now()}-${index}`,
            timestamp: new Date(),
        }));

    } catch (e: any) {
        console.error("Failed to get AI alerts:", e);
        return [{
            id: 'err-alert',
            timestamp: new Date(),
            severity: 'WARNING',
            message: 'Could not retrieve AI-powered alerts.',
        }];
    }
}


export async function applyOptimization(prevState: any, formData: FormData) {
    const db = await getDb();
    const currentMetrics = await getLiveMetrics();
    
    const lsf = parseFloat(formData.get('predictedLSF') as string);
    const limestoneAdj = parseFloat((formData.get('limestoneAdjustment') as string).replace('%', ''));
    const clayAdj = parseFloat((formData.get('clayAdjustment') as string).replace('%', ''));

    const newCao = currentMetrics.cao * (1 + limestoneAdj / 100);
    const newSio2 = currentMetrics.sio2 * (1 - clayAdj / 200);
    const newAl2o3 = currentMetrics.al2o3 * (1 - clayAdj / 200);

    const newFeedRate = parseFloat(formData.get('feedRateSetpoint') as string);
    const newKilnTemp = currentMetrics.kilnTemperature + (lsf > 98 ? -5 : (lsf < 94 ? 5 : 0));

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
    };
    
    try {
        await db.run(
            'INSERT INTO production_metrics (timestamp, plant_id, kiln_temp, feed_rate, lsf, cao, sio2, al2o3, fe2o3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ...Object.values(newMetric)
        );
        return { success: true, message: 'Optimization applied successfully!' };
    } catch (error: any) {
        console.error('Failed to apply optimization:', error);
        return { success: false, message: 'Failed to apply optimization.' };
    }
}
