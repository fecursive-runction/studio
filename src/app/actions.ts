'use server';

import { optimizeCementProduction } from '@/ai/flows/optimize-cement-production';
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
                energyConsumption: 102,
                clinkerQualityScore: 0.91,
            };
        }

        return {
            kilnTemperature: latestMetric.kiln_temp,
            feedRate: latestMetric.feed_rate,
            energyConsumption: latestMetric.energy_kwh_per_ton,
            clinkerQualityScore: latestMetric.clinker_quality_score,
        };
    } catch (e: any) {
        console.error("Failed to get live metrics from SQLite:", e);
        // Return default values on error
        return {
            kilnTemperature: 1450,
            feedRate: 220,
            energyConsumption: 102,
            clinkerQualityScore: 0.91,
        };
    }
}


const optimizationSchema = z.object({
  constraints: z.string().optional(),
});

export async function runOptimization(prevState: any, formData: FormData) {
  const validatedFields = optimizationSchema.safeParse({
    constraints: formData.get('constraints'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: 'Invalid constraints submitted.',
      recommendation: null,
    };
  }
  const { constraints } = validatedFields.data;

  try {
    const liveMetrics = await getLiveMetrics();

    const recommendation = await optimizeCementProduction({
        plantId: "poc_plant_01",
        kilnTemperature: liveMetrics.kilnTemperature,
        feedRate: liveMetrics.feedRate,
        energyConsumption: liveMetrics.energyConsumption,
        clinkerQualityScore: liveMetrics.clinkerQualityScore,
        constraints: constraints ? constraints.split(',').map(c => c.trim()) : ["DO_NOT_EXCEED_TEMP_1500", "MAINTAIN_QUALITY_ABOVE_0.90"],
    });
    
    return {
      error: null,
      recommendation,
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
