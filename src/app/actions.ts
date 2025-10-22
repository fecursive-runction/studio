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
  kilnTemperature: z.string(),
  feedRate: z.string(),
  energyConsumption: z.string(),
  clinkerQualityScore: z.string(),
});

export async function runOptimization(prevState: any, formData: FormData) {
  const validatedFields = optimizationSchema.safeParse({
    constraints: formData.get('constraints'),
    kilnTemperature: formData.get('kilnTemperature'),
    feedRate: formData.get('feedRate'),
    energyConsumption: formData.get('energyConsumption'),
    clinkerQualityScore: formData.get('clinkerQualityScore'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      ...prevState,
      error: 'Invalid data submitted for optimization.',
      recommendation: null,
    };
  }
  const { constraints, ...metrics } = validatedFields.data;

  try {
    const recommendation = await optimizeCementProduction({
        plantId: "poc_plant_01",
        kilnTemperature: Number(metrics.kilnTemperature),
        feedRate: Number(metrics.feedRate),
        energyConsumption: Number(metrics.energyConsumption),
        clinkerQualityScore: Number(metrics.clinkerQualityScore),
        constraints: constraints ? constraints.split(',').map(c => c.trim()) : ["MAINTAIN_QUALITY_ABOVE_0.90"],
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

export async function getAiAlerts() {
    try {
        const liveMetrics = await getLiveMetrics();
        const alertResponse = await generateAlerts({
            kilnTemperature: liveMetrics.kilnTemperature,
            feedRate: liveMetrics.feedRate,
            clinkerQualityScore: liveMetrics.clinkerQualityScore,
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
