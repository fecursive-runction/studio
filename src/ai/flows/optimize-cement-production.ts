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
  energyConsumption: z.number().describe('The current energy consumption in kilowatt-hours.'),
  clinkerQualityScore: z.number().describe('The current clinker quality score (0-1).'),
  constraints: z.array(z.string()).describe('A list of operational constraints (e.g., temperature limits, quality targets).'),
});
export type OptimizeCementProductionInput = z.infer<typeof OptimizeCementProductionInputSchema>;

const OptimizeCementProductionOutputSchema = z.object({
  recommendationId: z.string().describe('A unique ID for the recommendation.'),
  feedRateSetpoint: z.number().describe('The recommended feed rate setpoint in tons per hour.'),
  fuelMixRatio: z.number().describe('The recommended fuel mix ratio (0-1).'),
  energyReductionPercentage: z.number().describe('The predicted percentage reduction in energy consumption.'),
  qualityScoreImpact: z.string().describe('The predicted impact on the clinker quality score (e.g., +0.01, -0.005).'),
  explanation: z.string().describe('An explanation of the recommendation.'),
  timestamp: z.string().datetime().describe('The timestamp of the recommendation.'),
});
export type OptimizeCementProductionOutput = z.infer<typeof OptimizeCementProductionOutputSchema>;

export async function optimizeCementProduction(input: OptimizeCementProductionInput): Promise<OptimizeCementProductionOutput> {
  return optimizeCementProductionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCementProductionPrompt',
  input: {schema: OptimizeCementProductionInputSchema},
  output: {schema: OptimizeCementProductionOutputSchema},
  prompt: `You are an AI optimization expert for cement manufacturing. Based on the current plant state and operational constraints, you will provide recommendations for adjusting the feed rate and fuel mix to optimize energy consumption and clinker quality.

Current Plant State:
- Plant ID: {{{plantId}}}
- Kiln Temperature: {{{kilnTemperature}}} °C
- Feed Rate: {{{feedRate}}} tons/hour
- Energy Consumption: {{{energyConsumption}}} kWh
- Clinker Quality Score: {{{clinkerQualityScore}}}

Operational Constraints:
{{#each constraints}}- {{{this}}}{{/each}}

Generate a JSON response with the following keys:
- recommendationId: A unique ID for the recommendation.
- feedRateSetpoint: The recommended feed rate setpoint in tons per hour.
- fuelMixRatio: The recommended fuel mix ratio (0-1).
- energyReductionPercentage: The predicted percentage reduction in energy consumption.
- qualityScoreImpact: The predicted impact on the clinker quality score (e.g., +0.01, -0.005). Use a string representation.
- explanation: A concise explanation of the recommendation.
- timestamp: The current timestamp in ISO 8601 format.

Respond ONLY with valid JSON, no markdown. Ensure all fields are populated. The qualityScoreImpact should be represented as a string.
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
