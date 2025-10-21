'use server';

import { queryPlantDataWithNaturalLanguage } from '@/ai/flows/query-plant-data-with-natural-language';
import { optimizeCementProduction } from '@/ai/flows/optimize-cement-production';
import { executeBigQuery } from '@/services/bigquery';
import { z } from 'zod';

const querySchema = z.object({
  question: z.string(),
});

export async function runQuery(prevState: any, formData: FormData) {
  const validatedFields = querySchema.safeParse({
    question: formData.get('question'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: 'Invalid question submitted.',
      sql: null,
      results: null,
      summary: null,
    };
  }
  const { question } = validatedFields.data;

  try {
    // Step 1: Generate SQL from the natural language question.
    const sqlResponse = await queryPlantDataWithNaturalLanguage({
      question,
      plantId: 'poc_plant_01',
      state: 'generate_sql'
    });

    if (!sqlResponse.sql) {
        throw new Error('AI failed to generate SQL query.');
    }

    // Step 2: Execute the generated SQL against BigQuery.
    const results = await executeBigQuery(sqlResponse.sql);

    // Step 3: Pass the real results back to the AI to get a summary.
    const summaryResponse = await queryPlantDataWithNaturalLanguage({
        question,
        plantId: 'poc_plant_01',
        state: 'summarize_results',
        results,
    });
    
    return {
      error: null,
      sql: sqlResponse.sql,
      results: results,
      summary: summaryResponse.summary,
    };

  } catch (e: any) {
    console.error(e);
    return {
      ...prevState,
      error: e.message || 'An error occurred while processing the query.',
      sql: null,
      results: null,
      summary: null,
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
    const recommendation = await optimizeCementProduction({
        plantId: "poc_plant_01",
        kilnTemperature: 1455.2, // Using a realistic live value
        feedRate: 221.5,
        energyConsumption: 102.8,
        clinkerQualityScore: 0.915,
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
