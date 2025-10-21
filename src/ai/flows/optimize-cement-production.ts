'use server';

/**
 * @fileOverview AI-powered optimization recommendations for cement production.
 * 
 * - optimizeCementProduction - A function that handles the cement production optimization process.
 * - OptimizeCementProductionInput - The input type for the optimizeCementProduction function.
 * - OptimizeCementProductionOutput - The return type for the optimizeCementProduction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCementProductionInputSchema = z.object({
  plantId: z.string().describe('The ID of the cement plant.'),
  kilnTemperature: z.number().describe('The current temperature of the kiln in degrees Celsius.'),
  feedRate: z.number().describe('The current feed rate of raw materials in tons per hour.'),
  energyConsumption: z.number().describe('The current energy consumption in kilowatt-hours per ton.'),
  clinkerQualityScore: z.number().describe('The current clinker quality score (0-1).'),
  constraints: z.array(z.string()).describe('A list of operational constraints (e.g., "temperature must not exceed 1500C", "quality must be above 0.90").'),
});
export type OptimizeCementProductionInput = z.infer<typeof OptimizeCementProductionInputSchema>;

const OptimizeCementProductionOutputSchema = z.object({
  recommendationId: z.string().describe('A unique ID for the recommendation, e.g., "REC-20240521-001".'),
  feedRateSetpoint: z.number().describe('The recommended feed rate setpoint in tons per hour.'),
  fuelMixRatio: z.number().describe('The recommended fuel mix ratio, e.g., 0.8 for 80% primary fuel.'),
  energyReductionPercentage: z.number().describe('The predicted percentage reduction in energy consumption.'),
  qualityScoreImpact: z.string().describe('The predicted impact on the clinker quality score as a string, e.g., "+0.01", "-0.005".'),
  explanation: z.string().describe('A clear, concise explanation of why this recommendation is being made, referencing the input data and constraints.'),
  timestamp: z.string().datetime().describe('The ISO 8601 timestamp of when the recommendation was generated.'),
});
export type OptimizeCementProductionOutput = z.infer<typeof OptimizeCementProductionOutputSchema>;

export async function optimizeCementProduction(input: OptimizeCementProductionInput): Promise<OptimizeCementProductionOutput> {
  return optimizeCementProductionFlow(input);
}


const prompt = ai.definePrompt({
    name: 'optimizeCementProductionPrompt',
    input: {schema: OptimizeCementProductionInputSchema},
    output: {schema: OptimizeCementProductionOutputSchema},
    prompt: `You are an expert AI process engineer for a cement plant. Your task is to provide an optimal operational recommendation based on real-time data and constraints.
  
    Current Plant State (Plant ID: {{{plantId}}}):
    - Kiln Temperature: {{{kilnTemperature}}} °C
    - Raw Material Feed Rate: {{{feedRate}}} tons/hour
    - Energy Consumption: {{{energyConsumption}}} kWh/ton
    - Clinker Quality Score: {{{clinkerQualityScore}}}
  
    Operational Constraints:
    {{#each constraints}}
    - {{{this}}}
    {{/each}}
  
    Your goal is to recommend setpoints that reduce energy consumption while maintaining or improving clinker quality, respecting all constraints.
  
    Generate a unique ID for this recommendation. Calculate the recommended feed rate, a new fuel mix ratio, and predict the impact on energy use and quality.
    
    Provide a clear, data-driven explanation for your recommendation. The timestamp should be the current time in ISO 8601 format.
    
    Output a single JSON object adhering to the specified output schema.
    `,
  });
  
  const optimizeCementProductionFlow = ai.defineFlow(
    {
      name: 'optimizeCementProductionFlow',
      inputSchema: OptimizeCementProductionInputSchema,
      outputSchema: OptimizeCementProductionOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
  );