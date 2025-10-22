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
  state: z.enum(['generate_sql', 'summarize_results']).describe("The current stage of the process: 'generate_sql' to create the query, 'summarize_results' to interpret results."),
  results: z.array(z.record(z.any())).optional().describe('The results from executing the generated SQL query. Only provided when state is "summarize_results".'),
});
export type QueryPlantDataWithNaturalLanguageInput = z.infer<typeof QueryPlantDataWithNaturalLanguageInputSchema>;

const QueryPlantDataWithNaturalLanguageOutputSchema = z.object({
  sql: z.string().optional().describe('The generated BigQuery SQL query. Only returned when state is "generate_sql".'),
  summary: z.string().optional().describe('A concise, natural language summary of the query results. Only returned when state is "summarize_results".'),
});
export type QueryPlantDataWithNaturalLanguageOutput = z.infer<typeof QueryPlantDataWithNaturalLanguageOutputSchema>;

export async function queryPlantDataWithNaturalLanguage(input: QueryPlantDataWithNaturalLanguageInput): Promise<QueryPlantDataWithNaturalLanguageOutput> {
  return queryPlantDataWithNaturalLanguageFlow(input);
}


const prompt = ai.definePrompt({
    name: 'queryPlantDataPrompt',
    input: {schema: QueryPlantDataWithNaturalLanguageInputSchema},
    output: {schema: QueryPlantDataWithNaturalLanguageOutputSchema},
    prompt: `You are an expert AI assistant that translates natural language questions into BigQuery SQL and summarizes query results for a cement plant.

    You are querying a single table with the following schema:
    CREATE TABLE production_metrics (
      timestamp TIMESTAMP NOT NULL,
      plant_id STRING NOT NULL,
      kiln_temp FLOAT64,
      feed_rate FLOAT64,
      energy_kwh_per_ton FLOAT64,
      clinker_quality_score FLOAT64
    );

    Current State: '{{{state}}}'
    Plant ID: '{{{plantId}}}'
    Question: {{{question}}}

    IF the state is 'generate_sql':
      Your task is to generate a valid BigQuery SQL query to answer the question.
      - ALWAYS filter by the provided plant_id. Your WHERE clause MUST include "plant_id = '{{{plantId}}}'".
      - Use BigQuery-compatible SQL syntax.
      - For time-based questions like "today" or "yesterday", use TIMESTAMP functions. For example, to get records from yesterday, you might use: "WHERE DATE(timestamp) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)".
      - Output a JSON object containing only the generated 'sql' query.
    
    ELSE IF the state is 'summarize_results':
      You have been provided with the results from executing the SQL query.
      Query Results: {{#if results}} {{{results}}} {{else}} [] {{/if}}
      Your task is to analyze these results and provide a concise, easy-to-understand natural language summary.
      - Address the original question directly in your summary.
      - If the results are empty, state that no data was found for the given criteria. For example: "No data was found for yesterday's average kiln temperature."
      - When summarizing data, include the actual values in your summary. For example: "The average kiln temperature yesterday was 1452.3°C."
      - Output a JSON object containing only the 'summary'.
    END IF
    `,
  });
  
  const queryPlantDataWithNaturalLanguageFlow = ai.defineFlow(
    {
      name: 'queryPlantDataWithNaturalLanguageFlow',
      inputSchema: QueryPlantDataWithNaturalLanguageInputSchema,
      outputSchema: QueryPlantDataWithNaturalLanguageOutputSchema,
    },
    async input => {
      // Re-serialize the results into a compact JSON string for the prompt
      const promptInput = { ...input };
      if (promptInput.state === 'summarize_results' && promptInput.results) {
          (promptInput.results as any) = JSON.stringify(promptInput.results);
      }

      const {output} = await prompt(promptInput);
      return output!;
    }
  );



    