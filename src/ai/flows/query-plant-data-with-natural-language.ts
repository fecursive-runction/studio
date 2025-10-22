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
  sql: z.string().describe('The generated BigQuery SQL query.'),
});
export type QueryPlantDataWithNaturalLanguageOutput = z.infer<typeof QueryPlantDataWithNaturalLanguageOutputSchema>;

export async function queryPlantDataWithNaturalLanguage(input: QueryPlantDataWithNaturalLanguageInput): Promise<QueryPlantDataWithNaturalLanguageOutput> {
  return queryPlantDataWithNaturalLanguageFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateSqlForPlantDataPrompt',
    input: {schema: QueryPlantDataWithNaturalLanguageInputSchema},
    output: {schema: QueryPlantDataWithNaturalLanguageOutputSchema},
    prompt: `You are an expert AI assistant that translates natural language questions into BigQuery SQL for a cement plant.

    You are querying a single table named 'production_metrics' with the following schema:
    - timestamp (TIMESTAMP, NOT NULL)
    - plant_id (STRING, NOT NULL)
    - kiln_temp (FLOAT64)
    - feed_rate (FLOAT64)
    - energy_kwh_per_ton (FLOAT64)
    - clinker_quality_score (FLOAT64)

    Your task is to generate a valid BigQuery SQL query to answer the provided question.

    RULES:
    1.  Your query MUST filter by the provided plant_id. Your WHERE clause MUST include "plant_id = '{{{plantId}}}'".
    2.  For time-based questions like "today", "yesterday", or "last 24 hours", use BigQuery's TIMESTAMP functions.
        - For "yesterday", use: WHERE DATE(timestamp) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
        - For "today", use: WHERE DATE(timestamp) = CURRENT_DATE()
        - For "last 24 hours", use: WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
    3.  Only output the SQL query. The output must be a JSON object containing only the 'sql' key.
    
    Plant ID: '{{{plantId}}}'
    Question: {{{question}}}
    `,
  });
  
  const queryPlantDataWithNaturalLanguageFlow = ai.defineFlow(
    {
      name: 'queryPlantDataWithNaturalLanguageFlow',
      inputSchema: QueryPlantDataWithNaturalLanguageInputSchema,
      outputSchema: QueryPlantDataWithNaturalLanguageOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
  );