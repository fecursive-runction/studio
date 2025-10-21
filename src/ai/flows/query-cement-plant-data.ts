'use server';
/**
 * @fileOverview A natural language query interface for cement plant data.
 *
 * - queryCementPlantData - A function that handles the natural language query process.
 * - QueryCementPlantDataInput - The input type for the queryCementPlantData function.
 * - QueryCementPlantDataOutput - The return type for the queryCementPlantData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QueryCementPlantDataInputSchema = z.object({
  question: z.string().describe('The natural language question about cement plant data.'),
  plantId: z.string().describe('The ID of the plant to query.'),
});
export type QueryCementPlantDataInput = z.infer<typeof QueryCementPlantDataInputSchema>;

const QueryCementPlantDataOutputSchema = z.object({
  sql: z.string().describe('The generated SQL query.'),
  results: z.array(z.record(z.any())).describe('The results of the SQL query.'),
  summary: z.string().describe('A summary of the query results.'),
});
export type QueryCementPlantDataOutput = z.infer<typeof QueryCementPlantDataOutputSchema>;

export async function queryCementPlantData(input: QueryCementPlantDataInput): Promise<QueryCementPlantDataOutput> {
  return queryCementPlantDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'queryCementPlantDataPrompt',
  input: {schema: QueryCementPlantDataInputSchema},
  output: {schema: QueryCementPlantDataOutputSchema},
  prompt: `You are an expert in translating natural language questions into SQL queries for a cement plant database.\n  Given a question and plant ID, you will generate a BigQuery SQL query to answer the question, execute the query, and summarize the results.\n\n  Question: {{{question}}}\n  Plant ID: {{{plantId}}}\n\n  Output a JSON object with the following keys:\n  - sql: The SQL query generated to answer the question.\n  - results: The results of executing the SQL query. Represent the results as an array of objects.\n  - summary: A concise summary of the query results in natural language.\n  `,
});

const queryCementPlantDataFlow = ai.defineFlow(
  {
    name: 'queryCementPlantDataFlow',
    inputSchema: QueryCementPlantDataInputSchema,
    outputSchema: QueryCementPlantDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
