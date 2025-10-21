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
  results: z.array(z.record(z.any())).optional().describe('The results of the SQL query if already executed.'),
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
    prompt: `You are an expert in translating natural language questions into SQL queries for a cement plant database and summarizing the results.

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
{{#if results}}
Query Results:
\`\`\`json
{{{json results}}}
\`\`\`
{{/if}}

Based on the user's question and the available tables, generate a valid BigQuery SQL query.
Then, if results are provided, generate a concise, natural language summary of the results that directly answers the user's question. If no results are provided, generate an empty summary string.

Example 1:
User Question: "What was the average kiln temperature and feed rate yesterday?"
Query Results:
\`\`\`json
[{"avg_temp": 1452.3, "avg_feed_rate": 215.7, "avg_quality_score": 0.92}]
\`\`\`
Output:
{
  "sql": "SELECT AVG(kiln_temperature) AS avg_temp, AVG(feed_rate) AS avg_feed_rate, AVG(clinker_quality_score) AS avg_quality_score FROM production_metrics WHERE DATE(timestamp) = '2023-10-26'",
  "summary": "Yesterday, the average kiln temperature was 1452.3°C and the average feed rate was 215.7 TPH."
}


Example 2:
User Question: "What was the total production during the last shift?"
Query Results:
\`\`\`json
[{"production_total_tons": 1720, "clinker_quality_avg": 0.91, "alerts_count": 3}]
\`\`\`
Output:
{
  "sql": "SELECT SUM(production_rate_tph) AS production_total_tons, AVG(clinker_quality_score) AS clinker_quality_avg, COUNT(DISTINCT alert_id) AS alerts_count FROM production_metrics JOIN alerts ON production_metrics.plant_id = alerts.plant_id WHERE production_metrics.timestamp BETWEEN '2023-10-27T08:00:00Z' AND '2023-10-27T16:00:00Z'",
  "summary": "The total production during the last shift was 1720 tons with an average clinker quality score of 0.91. There were 3 alerts during this period."
}

Generate the SQL and the summary.
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
