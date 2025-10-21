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

const schemaPrompt = `Available Tables:
1. sensor_readings
Columns: timestamp, plant_id, sensor_id, value
Description: Time-series sensor data
2. production_metrics
Columns: timestamp, plant_id, production_rate_tph,
energy_per_ton_kwh, clinker_quality_score
Description: Aggregated production KPIs
3. raw_material_batches
Columns: analysis_timestamp, plant_id, batch_id, composition
Description: Raw material chemical analysis
4. ai_recommendations
Columns: recommendation_id, timestamp, parameters,
predicted_outcomes, implementation_status
Description: AI optimization recommendations

Generate a valid BigQuery SQL query for: "{{{question}}}"`;

const queryPlantDataWithNaturalLanguageFlow = ai.defineFlow(
    {
      name: 'queryPlantDataWithNaturalLanguageFlow',
      inputSchema: QueryPlantDataWithNaturalLanguageInputSchema,
      outputSchema: QueryPlantDataWithNaturalLanguageOutputSchema,
    },
    async input => {
        const { output } = await ai.generate({
            prompt: schemaPrompt,
            history: [{role: 'user', content: [{text: input.question}]}],
            model: ai.model,
            output: {
                schema: QueryPlantDataWithNaturalLanguageOutputSchema
            }
        });
      return output!;
    }
);
