'use server';
/**
 * @fileOverview A natural language query interface for plant data.
 *
 * - queryPlantDataWithNaturalLanguage - A function that handles the natural language query process.
 * - QueryPlantDataWithNaturalLanguageInput - The input type for the queryPlantDataWithNaturalLanguage function.
 * - QueryPlantDataWithNaturalLanguageOutput - The return type for the queryPlantDataWithNaturalLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QueryPlantDataWithNaturalLanguageInputSchema = z.object({
  question: z.string().describe('The natural language question about plant data.'),
  plantId: z.string().describe('The ID of the plant to query.'),
});
export type QueryPlantDataWithNaturalLanguageInput = z.infer<typeof QueryPlantDataWithNaturalLanguageInputSchema>;

const QueryPlantDataWithNaturalLanguageOutputSchema = z.object({
  sql: z.string().describe('The generated SQL query.'),
  results: z.array(z.record(z.any())).describe('The results of the SQL query.'),
  summary: z.string().describe('A summary of the query results.'),
});
export type QueryPlantDataWithNaturalLanguageOutput = z.infer<typeof QueryPlantDataWithNaturalLanguageOutputSchema>;

export async function queryPlantDataWithNaturalLanguage(input: QueryPlantDataWithNaturalLanguageInput): Promise<QueryPlantDataWithNaturalLanguageOutput> {
  return queryPlantDataWithNaturalLanguageFlow(input);
}

const schemaPrompt = `Available Tables:\n1. sensor_readings\nColumns: timestamp, plant_id, sensor_id, value\nDescription: Time-series sensor data\n2. production_metrics\nColumns: timestamp, plant_id, production_rate_tph,\nenergy_per_ton_kwh, clinker_quality_score\nDescription: Aggregated production KPIs\n3. raw_material_batches\nColumns: analysis_timestamp, plant_id, batch_id, composition\nDescription: Raw material chemical analysis\n4. ai_recommendations\nColumns: recommendation_id, timestamp, parameters,\npredicted_outcomes, implementation_status\nDescription: AI optimization recommendations\n\nGenerate a valid BigQuery SQL query for: "{{{question}}}\