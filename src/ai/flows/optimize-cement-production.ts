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
  lsf: z.number().describe('The current Lime Saturation Factor (LSF) of the raw mix.'),
  cao: z.number().describe('The current percentage of CaO in the raw mix.'),
  sio2: z.number().describe('The current percentage of SiO2 in the raw mix.'),
  al2o3: z.number().describe('The current percentage of Al2O3 in the raw mix.'),
  fe2o3: z.number().describe('The current percentage of Fe2O3 in the raw mix.'),
  constraints: z.array(z.string()).describe('A list of operational constraints (e.g., "LSF must be above 94%", "temperature must not exceed 1500C").'),
});
export type OptimizeCementProductionInput = z.infer<typeof OptimizeCementProductionInputSchema>;

// The AI is now only responsible for the core recommendation and explanation.
const OptimizeCementProductionOutputSchema = z.object({
  recommendationId: z.string().describe('A unique ID for the recommendation, e.g., "REC-20240521-001".'),
  feedRateSetpoint: z.number().describe('The recommended feed rate setpoint in tons per hour.'),
  limestoneAdjustment: z.string().describe('Recommended adjustment to the limestone feed (source of CaO), e.g., "+2%" or "-1.5%".'),
  clayAdjustment: z.string().describe('Recommended adjustment to the clay/shale feed (source of SiO2/Al2O3), e.g., "-1%" or "+0.5%".'),
  explanation: z.string().describe('A clear, concise explanation of why this recommendation is being made, referencing the input data and constraints. Explain the trade-offs involved, particularly how adjustments to the raw mix will affect the LSF.'),
});
export type OptimizeCementProductionOutput = z.infer<typeof OptimizeCementProductionOutputSchema>;

export async function optimizeCementProduction(input: OptimizeCementProductionInput): Promise<OptimizeCementProductionOutput> {
  return optimizeCementProductionFlow(input);
}


const prompt = ai.definePrompt({
    name: 'optimizeCementProductionPrompt',
    input: {schema: OptimizeCementProductionInputSchema},
    output: {schema: OptimizeCementProductionOutputSchema},
    prompt: `You are an expert AI process engineer for a cement plant. Your task is to provide an optimal operational recommendation based on real-time chemical and physical data. The primary goal is to bring the Lime Saturation Factor (LSF) into the ideal range of 94-98%.

    Current Plant State (Plant ID: {{{plantId}}}):
    - Kiln Temperature: {{{kilnTemperature}}} °C
    - Raw Material Feed Rate: {{{feedRate}}} tons/hour
    - Raw Mix Composition:
        - CaO: {{{cao}}}%
        - SiO2: {{{sio2}}}%
        - Al2O3: {{{al2o3}}}%
        - Fe2O3: {{{fe2o3}}}%
    - Current LSF: {{{lsf}}}%

    Operational Constraints:
    {{#each constraints}}
    - {{{this}}}
    {{/each}}

    Your goal is to recommend adjustments to the raw material feed to correct the LSF. Limestone is the primary source of CaO. Clay/shale is the primary source of SiO2 and Al2O3. Recommend a percentage change for the limestone and clay feeders to achieve an LSF between 94% and 98%. Also recommend a new overall feed rate setpoint.

    Generate a unique ID for this recommendation.
    
    Provide a detailed, data-driven explanation for your recommendation. The explanation must be thorough, discussing how the changes in raw mix will influence the LSF and clinker quality.
    
    Output a single JSON object adhering to the specified output schema. Do NOT calculate the predicted LSF or timestamp.
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

    