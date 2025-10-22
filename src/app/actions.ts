'use server';

import { optimizeCementProduction } from '@/ai/flows/optimize-cement-production';
import { z } from 'zod';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();

async function getLiveMetrics() {
    const docRef = firestore.collection('plant-metrics').doc('live');
    const doc = await docRef.get();
    if (!doc.exists) {
        // Return a default/fallback state if no live data is available yet
        return {
            kilnTemperature: 1450,
            feedRate: 220,
            energyConsumption: 102,
            clinkerQualityScore: 0.91,
        };
    }
    const data = doc.data();
    return {
        kilnTemperature: data?.kiln_temp || 1450,
        feedRate: data?.feed_rate || 220,
        energyConsumption: data?.energy_kwh_per_ton || 102,
        clinkerQualityScore: data?.clinker_quality_score || 0.91,
    };
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
