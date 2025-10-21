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
  // We'll pass mock results for now, this would be replaced with a tool
  results: z.array(z.record(z.any())).describe('The results from executing the generated SQL query.'),
});
export type QueryPlantDataWithNaturalLanguageInput = z.infer<typeof QueryPlantDataWithNaturalLanguageInputSchema>;

const QueryPlantDataWithNaturalLanguageOutputSchema = z.object({
  sql: z.string().describe('The generated BigQuery SQL query. Must be valid and executable.'),
  summary: z.string().describe('A concise, natural language summary of the query results.'),
});
export type QueryPlantDataWithNaturalLanguageOutput = z.infer<typeof QueryPlantDataWithNaturalLanguageOutputSchema>;

export async function queryPlantDataWithNaturalLanguage(input: QueryPlantDataWithNaturalLanguageInput): Promise<QueryPlantDataWithNaturalLanguageOutput> {
  return queryPlantDataWithNaturalLanguageFlow(input);
}


const prompt = ai.definePrompt({
    name: 'queryPlantDataPrompt',
    input: {schema: QueryPlantDataWithNaturalLanguageInputSchema},
    output: {schema: QueryPlantDataWithNaturalLanguageOutputSchema},
    prompt: `You are an expert in translating natural language questions into SQL queries for a cement plant database.
  
    Given the user's question, you must generate a valid BigQuery SQL query to answer it.
  
    The primary table is 'production_metrics' with the following schema:
    - timestamp: TIMESTAMP
    - plant_id: STRING
    - kiln_temp: FLOAT
    - feed_rate: FLOAT
    - energy_kwh_per_ton: FLOAT
    - clinker_quality_score: FLOAT
  
    Guidelines:
    1.  Always filter by the provided plant_id: '{{{plantId}}}'.
    2.  The current timestamp can be retrieved using CURRENT_TIMESTAMP().
    3.  When asked about "yesterday", use a date range from the beginning to the end of the previous day.
    4.  After generating the SQL, you will be provided with the results of that query.
    5.  Based on the provided results, generate a concise, easy-to-understand summary.
  
    Question: {{{question}}}
    
    Query Results:
    \`\`\`json
    {{{json results}}}
    \`\`\`
  
    Your task is to output a JSON object containing the generated 'sql' query and a 'summary' of the provided results.
    `,
  });
  
  const queryPlantDataWithNaturalLanguageFlow = ai.defineFlow(
    {
      name: 'queryPlantDataWithNaturalLanguageFlow',
      inputSchema: QueryPlantDataWithNaturalLanguageInputSchema,
      outputSchema: QueryPlantDataWithNaturalLanguageOutputSchema,
    },
    async input => {
      // In a real scenario, you would first generate SQL, then execute it against BigQuery.
      // For this POC, we are generating the SQL and using mock execution results
      // passed directly into the prompt to get a summary.
      const {output} = await prompt(input);
      return output!;
    }
  );