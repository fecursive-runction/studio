'use server';
/**
 * @fileOverview A natural language summarization interface for query results.
 *
 * - summarizeQueryResults - A function that handles the result summarization process.
 * - SummarizeQueryResultsInput - The input type for the summarizeQueryResults function.
 * - SummarizeQueryResultsOutput - The return type for the summarizeQueryResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeQueryResultsInputSchema = z.object({
  question: z.string().describe('The original natural language question that was asked.'),
  results: z.array(z.record(z.any())).describe('The JSON results from executing a BigQuery SQL query.'),
});
export type SummarizeQueryResultsInput = z.infer<typeof SummarizeQueryResultsInputSchema>;

const SummarizeQueryResultsOutputSchema = z.object({
  summary: z.string().describe('A concise, natural language summary of the query results.'),
});
export type SummarizeQueryResultsOutput = z.infer<typeof SummarizeQueryResultsOutputSchema>;

export async function summarizeQueryResults(input: SummarizeQueryResultsInput): Promise<SummarizeQueryResultsOutput> {
  return summarizeQueryResultsFlow(input);
}


const prompt = ai.definePrompt({
    name: 'summarizeQueryResultsPrompt',
    input: {schema: SummarizeQueryResultsInputSchema},
    output: {schema: SummarizeQueryResultsOutputSchema},
    prompt: `You are an expert AI assistant that summarizes data results for a cement plant.
    You have been provided with query results in JSON format and the original question that was asked.
    Your task is to analyze these results and provide a concise, easy-to-understand natural language summary.

    RULES:
    1.  Address the original question directly in your summary.
    2.  If the results are empty, state that no data was found for the given criteria. For example: "No data was found for yesterday's average kiln temperature."
    3.  When summarizing data, include the actual values from the results in your summary. For example: "The average kiln temperature yesterday was 1452.3°C."
    4.  Do not mention the underlying SQL query or the JSON format. Just provide the answer.

    Original Question: {{{question}}}
    Query Results (JSON): {{{json results}}}
    `,
  });
  
  const summarizeQueryResultsFlow = ai.defineFlow(
    {
      name: 'summarizeQueryResultsFlow',
      inputSchema: SummarizeQueryResultsInputSchema,
      outputSchema: SummarizeQueryResultsOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
  );