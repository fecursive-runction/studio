'use server';

import { queryPlantDataWithNaturalLanguage } from '@/ai/flows/query-plant-data-with-natural-language';
import { optimizeCementProduction } from '@/ai/flows/optimize-cement-production';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { generate } from 'genkit/ai';

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
    const nlqResponse = await queryPlantDataWithNaturalLanguage({
      question,
      plantId: 'poc_plant_01',
    });

    // Mock BigQuery results based on the question
    const mockResults = getMockResults(question);
    
    const summaryPrompt = `Based on the user's question and the following data results, provide a short, natural language summary.
    User Question: "${question}"
    Data:
    ${JSON.stringify(mockResults)}
    
    Summary:`;

    const summaryResponse = await generate({
      model: ai.model,
      prompt: summaryPrompt,
    });
    const summary = summaryResponse.text();
    
    return {
      error: null,
      sql: nlqResponse.sql,
      results: mockResults,
      summary,
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

function getMockResults(question: string): Record<string, any>[] {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('yesterday')) {
        return [{ avg_temp: 1452.3, avg_feed_rate: 215.7, avg_quality_score: 0.92 }];
    }
    if (lowerQuestion.includes('last hour')) {
        return [{ avg_temp: 1461.8, max_energy_kwh: 105.2 }];
    }
    if (lowerQuestion.includes('shift')) {
        return [{ production_total_tons: 1720, clinker_quality_avg: 0.91, alerts_count: 3 }];
    }
    return [{ result: "Sample data for the query.", value: Math.random() * 100 }];
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
    // Using mock current state as per architecture
    const recommendation = await optimizeCementProduction({
        plantId: "poc_plant_01",
        kilnTemperature: 1455.2,
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
