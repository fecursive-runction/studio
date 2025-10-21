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
  summary: z.string().describe('A summary of the query results.'),
});
export type QueryPlantDataWithNaturalLanguageOutput = z.infer<typeof QueryPlantDataWithNaturalLanguageOutputSchema>;

export async function queryPlantDataWithNaturalLanguage(input: QueryPlantDataWithNaturalLanguageInput): Promise<QueryPlantDataWithNaturalLanguageOutput> {
  return queryPlantDataWithNaturalLanguageFlow(input);
}


const prompt = ai.definePrompt({
    name: 'queryPlantDataWithNaturalLanguagePrompt',
    input: {schema: QueryPlantDataWithNaturalLanguageInputSchema},
    output: {schema: QueryPlantDataWithNaturalLanguageOutputSchema},
    prompt: `You are an expert in translating natural language questions into SQL queries for a cement plant database.

Available Tables:
1. sensor_readings
Columns: timestamp, plant_id, sensor_id, value
Description: Time-series sensor data
2. production_metrics
Columns: timestamp, plant_id, production_rate_tph, energy_per_ton_kwh, clinker_quality_score
Description: Aggregated production KPIs
3. raw_material_batches
Columns: analysis_timestamp, plant_id, batch_id, composition
Description: Raw material chemical analysis
4. ai_recommendations
Columns: recommendation_id, timestamp, parameters, predicted_outcomes, implementation_status
Description: AI optimization recommendations

User Question: {{{question}}}

Based on the user's question and the available tables, generate a valid BigQuery SQL query to answer the question.
Then, generate a concise, natural language summary of what the query would be looking for.

Example 1:
User Question: "What was the average kiln temperature and feed rate yesterday?"
Output:
{
  "sql": "SELECT AVG(kiln_temperature) AS avg_temp, AVG(feed_rate) AS avg_feed_rate FROM production_metrics WHERE DATE(timestamp) = '2023-10-26'",
  "summary": "This query calculates the average kiln temperature and feed rate for the previous day."
}


Example 2:
User Question: "What was the total production during the last shift?"
Output:
{
  "sql": "SELECT SUM(production_rate_tph) AS production_total_tons FROM production_metrics WHERE timestamp BETWEEN '2023-10-27T08:00:00Z' AND '2023-10-27T16:00:00Z'",
  "summary": "This query calculates the total production tonnage for the specified 8-hour shift."
}

Generate ONLY the JSON for the SQL query and the summary. Do not execute the query.
`
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
